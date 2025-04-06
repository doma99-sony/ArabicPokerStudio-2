/**
 * وسيط بايثون - Egypt Rocket
 * =======================
 * 
 * هذا الملف يحتوي على الكود اللازم لتوجيه طلبات API إلى خادم بايثون
 */
import { Request, Response, Router } from 'express';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { WebSocketServer } from 'ws';

// تكوين الوسيط
const PYTHON_SERVER_PORT = process.env.ROCKET_PORT || 3001;
const PYTHON_SERVER_HOST = 'localhost'; 
const PYTHON_SERVER_URL = `http://${PYTHON_SERVER_HOST}:${PYTHON_SERVER_PORT}`;

let pythonProcess: any = null;

export function setupPythonProxy(app: any) {
  const router = app.Router ? app.Router() : app;
  // محاولة تشغيل خادم بايثون
  startPythonServer();

  // مسار API للتحقق من حالة الخادم
  router.get('/api/egypt-rocket/server-status', (req: Request, res: Response) => {
    res.json({
      running: isPythonServerRunning(),
      port: PYTHON_SERVER_PORT,
      url: PYTHON_SERVER_URL
    });
  });

  // وسيط لمسارات الـ API الأخرى
  router.use('/api/egypt-rocket', (req: Request, res: Response) => {
    // نوجه جميع الطلبات إلى خادم بايثون
    if (!isPythonServerRunning()) {
      return res.status(503).json({
        error: 'Python server is not running',
        message: 'خادم بايثون غير متاح حالياً'
      });
    }

    // إنشاء الطلب الموجه
    const proxyReq = http.request({
      host: PYTHON_SERVER_HOST,
      port: PYTHON_SERVER_PORT as number,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      // تعيين رؤوس الاستجابة
      res.statusCode = proxyRes.statusCode || 500;
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key] as string);
      });

      // نقل البيانات من الخادم البايثون إلى المستخدم
      proxyRes.pipe(res);
    });

    // معالجة الأخطاء
    proxyReq.on('error', (err) => {
      console.error('Python proxy error:', err);
      res.status(500).json({
        error: 'Proxy error',
        message: 'حدث خطأ في الاتصال بخادم بايثون'
      });
    });

    // نقل البيانات من المستخدم إلى الخادم البايثون
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });

  // وسيط لـ WebSocket
  const websocketProxy = (server: any) => {
    // إنشاء خادم WebSocket
    const wss = new WebSocketServer({ noServer: true });
    
    // معالجة ترقية الاتصال إلى WebSocket
    server.on('upgrade', (request: any, socket: any, head: any) => {
      const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
      
      // معالجة طلبات WebSocket الخاصة بلعبة صاروخ مصر
      if (pathname === '/ws/egypt-rocket') {
        wss.handleUpgrade(request, socket, head, (ws: any) => {
          wss.emit('connection', ws, request);
        });
      }
    });
    
    // معالجة الاتصالات الجديدة
    wss.on('connection', (ws: any, request: any) => {
      console.log('اتصال WebSocket جديد للعبة صاروخ مصر');
      
      // إعادة توجيه اتصال WebSocket إلى خادم بايثون
      // في هذه المرحلة ستكون البيانات مخزنة محلياً، لاحقاً سيتم ربطها بخادم بايثون
      
      // إرسال بيانات حالة اللعبة الافتراضية
      const initialGameState = {
        type: "game_state",
        state: {
          status: 'waiting',
          countdown: 10,
          currentMultiplier: null,
          players: [],
          gameHistory: []
        }
      };
      
      ws.send(JSON.stringify(initialGameState));
      
      // استماع للرسائل من العميل
      ws.on('message', (message: any) => {
        try {
          const data = JSON.parse(message);
          console.log('رسالة واردة من العميل:', data);
          
          // معالجة الرسائل من العميل وفقاً لنوعها
          // هنا سيتم إضافة المنطق الكامل للعبة أو ربطها بخادم بايثون
          
          // للاختبار، نرسل استجابة بسيطة
          if (data.type === 'place_bet') {
            ws.send(JSON.stringify({
              type: 'bet_response',
              success: true,
              message: 'تم استلام الرهان (وضع المحاكاة)'
            }));
          } else if (data.type === 'cashout') {
            ws.send(JSON.stringify({
              type: 'cash_out_response',
              success: true,
              message: 'تم استلام طلب السحب (وضع المحاكاة)'
            }));
          }
        } catch (error) {
          console.error('خطأ في معالجة رسالة WebSocket:', error);
        }
      });
      
      // معالجة إغلاق الاتصال
      ws.on('close', () => {
        console.log('تم إغلاق اتصال WebSocket للعبة صاروخ مصر');
      });
    });
    
    return wss;
  };
  
  return { websocketProxy };
}

// تشغيل خادم بايثون
function startPythonServer() {
  if (isPythonServerRunning()) {
    return;
  }

  try {
    // استخدام سكريبت shell لتشغيل خادم بايثون
    const scriptPath = path.join(process.cwd(), 'start-python-server.sh');

    console.log(`Starting Python server with script: ${scriptPath}`);
    
    pythonProcess = spawn('/bin/bash', [scriptPath], {
      env: { ...process.env, ROCKET_PORT: PYTHON_SERVER_PORT.toString() },
      stdio: ['inherit', 'inherit', 'inherit']
    });

    pythonProcess.on('error', (err: Error) => {
      console.error('Failed to start Python server:', err);
      pythonProcess = null;
    });

    pythonProcess.on('exit', (code: number) => {
      console.log(`Python server exited with code ${code}`);
      pythonProcess = null;
    });

    // تأكد من إغلاق عملية بايثون عند إيقاف تشغيل الخادم الرئيسي
    process.on('exit', () => {
      if (pythonProcess) {
        pythonProcess.kill();
      }
    });
  } catch (error) {
    console.error('Error starting Python server:', error);
  }
}

// التحقق من حالة خادم بايثون
function isPythonServerRunning(): boolean {
  return pythonProcess !== null && !pythonProcess.killed;
}

// دالة لإعادة تشغيل خادم بايثون
export function restartPythonServer() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
  
  setTimeout(() => {
    startPythonServer();
  }, 1000);
}