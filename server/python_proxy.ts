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
  const router = Router();
  // محاولة تشغيل خادم بايثون
  startPythonServer();

  // مسار API للتحقق من حالة الخادم
  router.get('/api/egypt-rocket/status', (req: Request, res: Response) => {
    const running = isPythonServerRunning();
    console.log(`Checking Python server status: ${running ? 'running' : 'not running'}`);
    
    if (running) {
      return res.json({
        running: true,
        port: PYTHON_SERVER_PORT,
        url: PYTHON_SERVER_URL
      });
    } else {
      return res.status(503).json({
        running: false,
        message: 'خادم بايثون غير متاح حالياً'
      });
    }
  });

  // وسيط لمسارات الـ API الأخرى
  router.use('/api/egypt-rocket', (req: Request, res: Response) => {
    // نوجه جميع الطلبات إلى خادم بايثون
    if (!isPythonServerRunning()) {
      console.log('Python server not running, returning 503');
      return res.status(503).json({
        error: 'Python server is not running',
        message: 'خادم بايثون غير متاح حالياً'
      });
    }

    console.log(`Proxying request to Python server: ${req.method} ${req.url}`);

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

  // إضافة المسارات إلى التطبيق
  app.use(router);

  // وسيط لـ WebSocket
  const websocketProxy = (server: any) => {
    // إنشاء خادم WebSocket
    const wss = new WebSocketServer({ noServer: true });
    
    // معالجة ترقية الاتصال إلى WebSocket
    server.on('upgrade', (request: any, socket: any, head: any) => {
      // التأكد من وجود العنوان
      if (!request.url) {
        console.error('Invalid request URL in upgrade event');
        socket.destroy();
        return;
      }

      try {
        const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
        
        // معالجة طلبات WebSocket الخاصة بلعبة صاروخ مصر
        if (pathname === '/ws/egypt-rocket') {
          console.log('Upgrading connection to WebSocket for Egypt Rocket');
          
          wss.handleUpgrade(request, socket, head, (ws: any) => {
            wss.emit('connection', ws, request);
          });
        }
      } catch (error) {
        console.error('Error in WebSocket upgrade handling:', error);
        socket.destroy();
      }
    });
    
    // معالجة الاتصالات الجديدة
    wss.on('connection', (ws: any, request: any) => {
      console.log('New WebSocket connection for Egypt Rocket game');
      
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
      
      try {
        ws.send(JSON.stringify(initialGameState));
      } catch (error) {
        console.error('Error sending initial game state:', error);
      }
      
      // استماع للرسائل من العميل
      ws.on('message', (message: any) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Message from client:', data);
          
          // معالجة الرسائل من العميل وفقاً لنوعها
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
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      // معالجة إغلاق الاتصال
      ws.on('close', () => {
        console.log('WebSocket connection closed for Egypt Rocket game');
      });

      // معالجة الأخطاء
      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });
    });
    
    return wss;
  };
  
  return { websocketProxy };
}

// تشغيل خادم بايثون
function startPythonServer() {
  if (isPythonServerRunning()) {
    console.log('Python server already running, skipping start');
    return;
  }

  try {
    console.log('Starting Python server...');
    
    // تشغيل خادم بايثون مباشرة
    pythonProcess = spawn('python3', ['-m', 'python.egypt_rocket_server'], {
      env: { 
        ...process.env, 
        ROCKET_PORT: PYTHON_SERVER_PORT.toString(),
        PYTHONUNBUFFERED: '1'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // سجل الإخراج
    if (pythonProcess.stdout) {
      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python server output: ${data.toString().trim()}`);
      });
    }

    // سجل الأخطاء
    if (pythonProcess.stderr) {
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python server error: ${data.toString().trim()}`);
      });
    }

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
        console.log('Killing Python server process on application exit');
        pythonProcess.kill();
      }
    });
    
    console.log('Python server process started');
  } catch (error) {
    console.error('Error starting Python server:', error);
    pythonProcess = null;
  }
}

// التحقق من حالة خادم بايثون
function isPythonServerRunning(): boolean {
  const isRunning = pythonProcess !== null && !pythonProcess.killed;
  console.log(`Checking if Python server is running: ${isRunning}`);
  return isRunning;
}

// دالة لإعادة تشغيل خادم بايثون
export function restartPythonServer() {
  console.log('Restarting Python server...');
  
  if (pythonProcess) {
    console.log('Killing existing Python server process');
    pythonProcess.kill();
    pythonProcess = null;
  }
  
  setTimeout(() => {
    console.log('Starting new Python server process');
    startPythonServer();
  }, 1000);
}