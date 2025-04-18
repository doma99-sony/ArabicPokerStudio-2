import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import { initializeDatabase, closeDatabase } from "./db";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  useTempFiles: false,
  abortOnLimit: true,
  responseOnLimit: "حجم الملف تجاوز الحد المسموح (5 ميجابايت)"
}));

// خدمة الملفات الثابتة من مجلد public
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    return next();
  }
  
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });

  next();
});

(async () => {
  try {
    // تهيئة قاعدة البيانات
    log('Initializing database...');
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      log('Failed to initialize database. Starting server without database.', 'error');
    } else {
      log('Database initialized successfully');
    }

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // تسجيل الخطأ في السجل بدلاً من رميه
      console.error(`Error: ${status} - ${message}`, err);
      
      // إرسال استجابة للعميل إذا لم تكن قد أرسلت بالفعل
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    const host = "0.0.0.0"; // Bind to all available network interfaces
    server.listen(port, host, () => {
      log(`serving on ${host}:${port}`);
    });

    // إغلاق قاعدة البيانات بأمان عند إيقاف التطبيق
    process.on('SIGTERM', async () => {
      log('SIGTERM signal received. Shutting down gracefully.');
      await closeDatabase();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      log('SIGINT signal received. Shutting down gracefully.');
      await closeDatabase();
      process.exit(0);
    });
  } catch (error: any) {
    log(`Error starting server: ${error.message || 'Unknown error'}`, 'error');
    process.exit(1);
  }
})();
