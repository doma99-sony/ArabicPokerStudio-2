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
    
    // تخزين اتصالات العملاء النشطة
    const clients = new Set<any>();
    
    // معالجة ترقية الاتصال إلى WebSocket
    server.on('upgrade', (request: any, socket: any, head: any) => {
      // التأكد من وجود العنوان
      if (!request.url) {
        console.error('Invalid request URL in upgrade event');
        socket.destroy();
        return;
      }

      try {
        const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
        const pathname = parsedUrl.pathname;
        
        console.log(`Processing WebSocket upgrade request for path: ${pathname}`);
        
        // معالجة طلبات WebSocket الخاصة بلعبة صاروخ مصر
        if (pathname === '/ws/egypt-rocket') {
          console.log('Accepting WebSocket connection for Egypt Rocket game');
          
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        } else {
          console.log(`Rejecting WebSocket connection for unknown path: ${pathname}`);
          socket.destroy();
        }
      } catch (error) {
        console.error('Error in WebSocket upgrade handling:', error);
        socket.destroy();
      }
    });
    
    // محاكاة لعبة صاروخ مصر
    let gameInterval: NodeJS.Timeout | null = null;
    let gameState = {
      status: 'waiting' as 'waiting' | 'flying' | 'crashed',
      countdown: 10,
      currentMultiplier: null as number | null,
      crashPoint: 0,
      players: [] as any[],
      gameHistory: [
        { id: 1, multiplier: 1.5, crashed_at: new Date().toISOString() },
        { id: 2, multiplier: 2.2, crashed_at: new Date().toISOString() },
        { id: 3, multiplier: 1.2, crashed_at: new Date().toISOString() }
      ] as any[]
    };
    
    // إرسال تحديث حالة اللعبة لجميع العملاء
    const broadcastGameState = () => {
      if (clients.size === 0) return;
      
      const message = JSON.stringify({
        type: "game_state",
        state: gameState
      });
      
      clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          try {
            client.send(message);
          } catch (err) {
            console.error('Error broadcasting game state:', err);
          }
        }
      });
    };
    
    // بدء محاكاة اللعبة
    const startGameSimulation = () => {
      if (gameInterval) return;
      
      console.log('Starting Egypt Rocket game simulation');
      
      const runGame = async () => {
        // مرحلة العد التنازلي
        gameState.status = 'waiting';
        gameState.currentMultiplier = null;
        
        for (let i = 10; i > 0; i--) {
          gameState.countdown = i;
          broadcastGameState();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // تحديد نقطة الانفجار (1.1x إلى 10x)
        gameState.crashPoint = Math.floor(Math.random() * 900 + 110) / 100;
        console.log(`Game starting with crash point: ${gameState.crashPoint}x`);
        
        // مرحلة الطيران
        gameState.status = 'flying';
        gameState.currentMultiplier = 1.0;
        broadcastGameState();
        
        const startTime = Date.now();
        const intervalId = setInterval(() => {
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          gameState.currentMultiplier = parseFloat((1 + elapsedSeconds * 0.6).toFixed(2));
          
          if (gameState.currentMultiplier >= gameState.crashPoint) {
            // الانفجار!
            clearInterval(intervalId);
            gameState.status = 'crashed';
            
            // إضافة النتيجة إلى التاريخ
            gameState.gameHistory.unshift({
              id: gameState.gameHistory.length + 1,
              multiplier: gameState.crashPoint,
              crashed_at: new Date().toISOString()
            });
            
            // الحفاظ على آخر 10 نتائج فقط
            if (gameState.gameHistory.length > 10) {
              gameState.gameHistory = gameState.gameHistory.slice(0, 10);
            }
            
            broadcastGameState();
            
            // بدء جولة جديدة بعد فترة
            setTimeout(runGame, 3000);
          } else {
            broadcastGameState();
          }
        }, 100);
      };
      
      runGame();
    };
    
    // معالجة الاتصالات الجديدة
    wss.on('connection', (ws: any, request: any) => {
      console.log('New WebSocket connection for Egypt Rocket game');
      
      // إضافة العميل للقائمة
      clients.add(ws);
      console.log(`Current active Egypt Rocket connections: ${clients.size}`);
      
      // إرسال حالة اللعبة الحالية
      try {
        ws.send(JSON.stringify({
          type: "game_state",
          state: gameState
        }));
      } catch (error) {
        console.error('Error sending initial game state:', error);
      }
      
      // إذا كانت هذه أول اتصال، ابدأ محاكاة اللعبة
      if (clients.size === 1) {
        startGameSimulation();
      }
      
      // استماع للرسائل من العميل
      ws.on('message', (message: any) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Message from client:', data);
          
          // معالجة الرسائل من العميل وفقاً لنوعها
          if (data.type === 'place_bet') {
            // منطق وضع الرهان
            const betAmount = data.amount || 100;
            const autoCashout = data.autoCashout || null;
            
            const playerId = Math.floor(Math.random() * 10000);
            const playerName = `لاعب_${playerId}`;
            
            // إضافة اللاعب إلى القائمة
            if (gameState.status === 'waiting') {
              gameState.players.push({
                id: playerId,
                username: playerName,
                betAmount: betAmount,
                cashoutMultiplier: null,
                profit: null
              });
              
              ws.send(JSON.stringify({
                type: 'bet_response',
                success: true,
                message: 'تم وضع الرهان بنجاح',
                data: {
                  playerId: playerId,
                  betAmount: betAmount,
                  autoCashout: autoCashout
                }
              }));
              
              broadcastGameState();
            } else {
              ws.send(JSON.stringify({
                type: 'bet_response',
                success: false,
                message: 'لا يمكن وضع رهان أثناء المرحلة الحالية'
              }));
            }
          } else if (data.type === 'cashout') {
            // منطق السحب
            if (gameState.status === 'flying' && gameState.currentMultiplier) {
              const playerId = data.playerId || Math.floor(Math.random() * 10000);
              
              // البحث عن اللاعب في القائمة
              const playerIndex = gameState.players.findIndex(p => p.id === playerId);
              
              if (playerIndex !== -1 && !gameState.players[playerIndex].cashoutMultiplier) {
                const player = gameState.players[playerIndex];
                player.cashoutMultiplier = gameState.currentMultiplier;
                player.profit = Math.floor(player.betAmount * (player.cashoutMultiplier - 1));
                
                ws.send(JSON.stringify({
                  type: 'cash_out_response',
                  success: true,
                  message: 'تم السحب بنجاح',
                  data: {
                    playerId: player.id,
                    multiplier: player.cashoutMultiplier,
                    profit: player.profit
                  }
                }));
                
                broadcastGameState();
              } else {
                ws.send(JSON.stringify({
                  type: 'cash_out_response',
                  success: false,
                  message: 'لم يتم العثور على رهان نشط'
                }));
              }
            } else {
              ws.send(JSON.stringify({
                type: 'cash_out_response',
                success: false,
                message: 'لا يمكن السحب في المرحلة الحالية'
              }));
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'حدث خطأ في معالجة الطلب'
          }));
        }
      });
      
      // إرسال اختبار اتصال دوري لضمان استمرار الاتصال
      const pingInterval = setInterval(() => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          try {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          } catch (err) {
            console.error('Error sending ping:', err);
          }
        }
      }, 30000);
      
      // معالجة إغلاق الاتصال
      ws.on('close', () => {
        console.log('WebSocket connection closed for Egypt Rocket game');
        clients.delete(ws);
        clearInterval(pingInterval);
        
        console.log(`Remaining active Egypt Rocket connections: ${clients.size}`);
        
        // إذا لم يعد هناك عملاء، أوقف محاكاة اللعبة
        if (clients.size === 0 && gameInterval) {
          console.log('Stopping Egypt Rocket game simulation');
          clearInterval(gameInterval);
          gameInterval = null;
        }
      });

      // معالجة الأخطاء
      ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
        clearInterval(pingInterval);
      });
      
      // إرسال إشعار اتصال ناجح
      try {
        ws.send(JSON.stringify({
          type: 'connection_status',
          connected: true,
          serverTime: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error sending connection status:', err);
      }
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