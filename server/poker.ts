import { Express } from "express";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

// متغيرات عامة للاستخدام في ملفات أخرى
export const pokerModule = {
  broadcastToTable: null as any,
  userTables: null as Map<number, number> | null,
  clients: null as Map<number, any> | null
};

// Set up WebSocket server for real-time game updates
export function setupPokerGame(app: Express, httpServer: Server) {
  // تكوين متقدم لتحسين أداء الاتصال وموثوقيته
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws", // مسار محدد لاتصالات WebSocket
    perMessageDeflate: {
      // تكوين الضغط بشكل أمثل:
      zlibDeflateOptions: {
        // See zlib defaults: https://nodejs.org/api/zlib.html#zlib_class_options
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // تعطيل الضغط للرسائل الصغيرة < 1024 بايت
      threshold: 1024,
      // تجنب مشاكل التوافق مع بعض العملاء
      serverNoContextTakeover: true,
      clientNoContextTakeover: true
    },
    clientTracking: true, // تتبع العملاء تلقائياً
    maxPayload: 10 * 1024 * 1024, // تعديل الحد الأقصى لحجم الرسالة (10 ميجابايت)
  });

  // تحسين تتبع العملاء بإضافة معلومات حالة إضافية
  interface ClientInfo {
    ws: WebSocket;
    userId: number;
    isAlive: boolean;
    lastPing: number;
    reconnectCount: number;
    tableId?: number;
    joinedAt: number;
  }
  
  // Map لتتبع الاتصالات النشطة حسب معرف المستخدم
  const clients = new Map<number, ClientInfo>();
  
  // Map لتتبع الطاولات التي ينضم إليها المستخدمون
  const userTables = new Map<number, number>();
  
  // Map لتتبع آخر حالة معروفة للمستخدم قبل قطع الاتصال (للاسترداد عند إعادة الاتصال)
  const lastKnownUserStates = new Map<number, {
    tableId?: number;
    lastActivity: number;
  }>();

  // Broadcast message to all connected clients with improved error handling
  const broadcast = (message: any, excludeUserId?: number) => {
    const serializedMessage = JSON.stringify(message);
    
    clients.forEach((clientInfo, userId) => {
      if (userId !== excludeUserId && clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(serializedMessage);
        } catch (err) {
          console.error(`خطأ أثناء البث للمستخدم ${userId}:`, err);
          // لا يتم حذف العميل هنا، سنترك آلية heartbeat تتعامل مع ذلك
        }
      }
    });
  };

  // عدد المستخدمين المتصلين الحقيقي (بدون لاعبين وهميين)
  const getOnlineCount = () => {
    return clients.size;
  };

  // عداد لتتبع عدد المستخدمين في وقت معين
  let activeCounter = 0;
  
  // دالة محسنة لإرسال عدد المستخدمين المتصلين حاليًا
  const broadcastOnlineUsers = () => {
    const realCount = getOnlineCount();
    activeCounter++;
    
    console.log(`عدد المستخدمين المتصلين حقيقياً: ${realCount}`);
    console.log(`العداد: ${activeCounter}`);
    console.log(`إجمالي عدد المستخدمين المتصلين مع الوهميين: ${realCount}`);
    
    const message = {
      type: "online_users_count",
      count: realCount
    };
    
    broadcast(message);
  };
  
  // تقليل فاصل الـ ping للحفاظ على الاتصال حياً
  const PING_INTERVAL = 10000; // 10 ثوانٍ
  const HEARTBEAT_TIMEOUT = 30000; // 30 ثانية قبل اعتبار الاتصال مقطوعاً
  
  // تحديث عدد المستخدمين المتصلين كل 5 ثوانٍ
  const UPDATE_INTERVAL = 5000;
  const updateIntervalId = setInterval(() => {
    broadcastOnlineUsers();
  }, UPDATE_INTERVAL);

  // دالة التحقق من حالة الاتصالات وإرسال نبضات للحفاظ على الاتصال
  const heartbeatIntervalId = setInterval(() => {
    console.log("إرسال نبض معلوماتي لجميع العملاء المتصلين...");
    
    const now = Date.now();
    
    clients.forEach((clientInfo, userId) => {
      // التحقق إذا كان العميل قد استجاب للنبض السابق
      if (!clientInfo.isAlive) {
        console.log(`لم يستجب المستخدم ${userId} للنبض، قطع الاتصال`);
        
        // حفظ آخر حالة معروفة للمستخدم قبل قطع الاتصال
        if (clientInfo.tableId) {
          lastKnownUserStates.set(userId, {
            tableId: clientInfo.tableId,
            lastActivity: now
          });
        }
        
        // إغلاق الاتصال وإزالته من القائمة
        clientInfo.ws.terminate();
        clients.delete(userId);
        return;
      }
      
      // إعادة تعيين علامة الحالة للتحقق في الدورة التالية
      clientInfo.isAlive = false;
      
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          // إرسال رسالة معلوماتية بدلاً من ping ثنائي
          clientInfo.ws.send(JSON.stringify({ 
            type: "ping", 
            timestamp: now,
            serverTime: new Date().toISOString()
          }));
          
          // أيضاً إرسال ping ثنائي كاحتياط
          clientInfo.ws.ping();
          clientInfo.lastPing = now;
        } catch (err) {
          console.error(`خطأ أثناء إرسال نبض للمستخدم ${userId}:`, err);
          // سيتم التعامل مع هذا تلقائياً في الدورة التالية
        }
      }
    });
    
    // تنظيف lastKnownUserStates القديمة (الأقدم من ساعة)
    const oneHourAgo = now - (60 * 60 * 1000);
    lastKnownUserStates.forEach((state, userId) => {
      if (state.lastActivity < oneHourAgo) {
        lastKnownUserStates.delete(userId);
      }
    });
  }, PING_INTERVAL);

  // إرسال رسالة لجميع المستخدمين في طاولة معينة باستثناء المرسل
  function broadcastToTable(tableId: number, message: any, excludeUserId?: number) {
    const players = getPlayersAtTable(tableId);
    const serializedMessage = JSON.stringify(message);
    
    for (const playerId of players) {
      if (excludeUserId && playerId === excludeUserId) continue;
      
      const clientInfo = clients.get(playerId);
      if (clientInfo && clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(serializedMessage);
        } catch (err) {
          console.error(`خطأ أثناء البث للمستخدم ${playerId} في الطاولة ${tableId}:`, err);
        }
      }
    }
  }
  
  // تصدير الدوال والمتغيرات للاستخدام في ملفات أخرى
  pokerModule.broadcastToTable = broadcastToTable;
  pokerModule.userTables = userTables;
  pokerModule.clients = clients;
  
  // الحصول على جميع اللاعبين في طاولة معينة
  function getPlayersAtTable(tableId: number): number[] {
    const players: number[] = [];
    
    userTables.forEach((userTableId, userId) => {
      if (userTableId === tableId) {
        players.push(userId);
      }
    });
    
    return players;
  }

  // إعداد التنظيف عند إغلاق الخادم
  process.on('SIGINT', cleanupServer);
  process.on('SIGTERM', cleanupServer);
  
  // دالة تنظيف موارد الخادم عند الإغلاق
  function cleanupServer() {
    console.log('تنظيف اتصالات WebSocket قبل إغلاق الخادم...');
    
    // إيقاف الفواصل الزمنية
    clearInterval(updateIntervalId);
    clearInterval(heartbeatIntervalId);
    
    // إغلاق جميع الاتصالات بشكل نظيف
    clients.forEach((clientInfo) => {
      try {
        clientInfo.ws.close(1000, 'Server shutdown');
      } catch (err) {
        // تجاهل أي أخطاء أثناء الإغلاق
      }
    });
    
    // إيقاف خادم WebSocket
    wss.close();
    
    // السماح للعمليات الأخرى بالتنظيف قبل إنهاء العملية
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }

  // معالجة اتصال جديد
  wss.on("connection", (ws: WebSocket, req: any) => {
    let userId: number | undefined;
    const connectionTime = Date.now();
    
    // إعداد اتصال جديد بالقيم الافتراضية
    const newClient: ClientInfo = {
      ws,
      userId: 0, // سيتم تحديثه لاحقاً عند المصادقة
      isAlive: true,
      lastPing: connectionTime,
      reconnectCount: 0,
      joinedAt: connectionTime
    };

    // دالة heartbeat محدثة
    const heartbeat = () => {
      // إذا كان المستخدم مصادق عليه
      if (userId && clients.has(userId)) {
        const clientInfo = clients.get(userId);
        if (clientInfo) {
          clientInfo.isAlive = true;
          console.log(`تم تحديث heartbeat للمستخدم ${userId}`);
        }
      } else {
        // للاتصالات الجديدة غير المصادق عليها بعد
        console.log(`تم تحديث heartbeat للمستخدم غير معروف`);
      }
    };

    // الاستجابة لـ pong من العميل (الثنائي)
    ws.on('pong', heartbeat);
    
    // تفعيل الاتصال الأولي
    heartbeat();
    
    // معالجة الرسائل الواردة
    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        // معالجة رسائل pong من العميل (JSON)
        if (data.type === "pong" || data.type === "client_ping") {
          heartbeat();
        } else if (data.type === "auth") {
          // مصادقة المستخدم
          const user = await storage.getUser(data.userId);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          userId = user.id;
          newClient.userId = userId;
          
          // التحقق من إذا كان المستخدم متصل بالفعل
          if (clients.has(userId)) {
            // إذا كان لديه اتصال قديم، نغلقه بهدوء
            const existingClient = clients.get(userId);
            if (existingClient && existingClient.ws !== ws) {
              try {
                existingClient.ws.close(1000, 'New connection established');
              } catch (e) {
                // تجاهل أي أخطاء أثناء الإغلاق
              }
            }
            
            // زيادة عدد إعادة الاتصال
            newClient.reconnectCount = (existingClient?.reconnectCount || 0) + 1;
            
            // استعادة معرف الطاولة السابق إذا وجد
            if (existingClient?.tableId) {
              newClient.tableId = existingClient.tableId;
              userTables.set(userId, existingClient.tableId);
            } else if (lastKnownUserStates.has(userId)) {
              // أو محاولة استعادة من الحالة الأخيرة المعروفة
              const lastState = lastKnownUserStates.get(userId);
              if (lastState && lastState.tableId) {
                newClient.tableId = lastState.tableId;
                userTables.set(userId, lastState.tableId);
              }
            }
          }
          
          // تسجيل الاتصال الجديد
          clients.set(userId, newClient);
          
          // إرسال رد نجاح المصادقة
          ws.send(JSON.stringify({ 
            type: "auth", 
            success: true,
            reconnectCount: newClient.reconnectCount,
            serverTime: new Date().toISOString()
          }));
          
          // بث عدد المستخدمين المتصلين بعد تسجيل الدخول
          broadcastOnlineUsers();
        } else if (data.type === "chat_message") {
          // Handle chat messages - تفعيل الرسائل حتى للمستخدمين غير المصادق عليهم مسبقاً
          // استخدام معرف الرسالة المرسل من العميل، أو إنشاء واحد جديد
          const messageId = data.id || `msg_${Date.now()}`;
          
          // استخدام معلومات المستخدم المرسلة في الرسالة أو الحصول عليها من تخزين الجلسة
          let username = data.username;
          let avatar = data.avatar;
          let timestamp = data.timestamp || Date.now();
          
          // إذا كان هناك معرف مستخدم، نستخدم معلوماته المخزنة
          if (userId) {
            try {
              const user = await storage.getUser(userId);
              if (user) {
                // استخدام اسم المستخدم والأفاتار من قاعدة البيانات إذا لم يتم توفيرهما
                username = username || user.username;
                avatar = avatar || user.avatar;
                console.log(`معالجة رسالة من المستخدم ${username}`);
              }
            } catch (e) {
              console.error("خطأ في الحصول على معلومات المستخدم:", e);
            }
          }
          
          // التحقق من وجود رسالة واسم مستخدم
          if (username && data.message && data.message.trim().length > 0) {
            // تنسيق رسالة الشات
            const chatMessage = {
              type: "chat_message",
              id: messageId,
              username: username,
              message: data.message.trim(),
              avatar: avatar,
              timestamp: timestamp
            };
            
            console.log(`رسالة جديدة من ${username}: ${data.message.substring(0, 30)}${data.message.length > 30 ? '...' : ''}`);
            
            // إرسال الرسالة للمرسل أولاً لتأكيد الاستلام (إذا لم يتم معالجتها بالفعل في العميل)
            if (!data.clientHandled) {
              ws.send(JSON.stringify(chatMessage));
            }
            
            // ثم بث إلى جميع العملاء المتصلين الآخرين
            broadcast(chatMessage, userId);
          } else {
            // إرسال رسالة خطأ إذا كانت البيانات غير مكتملة
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "الرسالة غير صالحة، يرجى التأكد من إرسال اسم مستخدم ومحتوى رسالة" 
            }));
          }
        } else if (data.type === "join_table") {
          // User joining a table
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = data.tableId;
          userTables.set(userId, tableId);
          
          // حفظ معرف الطاولة للاتصال الحالي
          if (clients.has(userId)) {
            const clientInfo = clients.get(userId);
            if (clientInfo) {
              clientInfo.tableId = tableId;
            }
          }
          
          // Notify other players at the table
          broadcastToTable(tableId, {
            type: "player_joined",
            userId: userId,
            tableId: tableId
          }, userId);
          
          // Send initial game state
          const gameState = await storage.getGameState(tableId, userId);
          ws.send(JSON.stringify({ 
            type: "game_state", 
            gameState 
          }));
        } else if (data.type === "leave_table") {
          // User leaving a table
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (tableId) {
            userTables.delete(userId);
            
            // إزالة معرف الطاولة من الاتصال
            if (clients.has(userId)) {
              const clientInfo = clients.get(userId);
              if (clientInfo) {
                clientInfo.tableId = undefined;
              }
            }
            
            // Notify other players at the table
            broadcastToTable(tableId, {
              type: "player_left",
              userId: userId,
              tableId: tableId
            }, userId);
          }
        } else if (data.type === "game_action") {
          // User making a game action
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
          // Perform the action
          const result = await storage.performGameAction(
            tableId,
            userId,
            data.action,
            data.amount
          );
          
          if (!result.success) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: result.message 
            }));
            return;
          }
          
          // إرسال حالة اللعبة المحدثة لجميع اللاعبين في الطاولة
          const players = getPlayersAtTable(tableId);
          for (const playerId of players) {
            const clientInfo = clients.get(playerId);
            if (clientInfo && clientInfo.ws.readyState === WebSocket.OPEN) {
              try {
                const gameState = await storage.getGameState(tableId, playerId);
                clientInfo.ws.send(JSON.stringify({ 
                  type: "game_state", 
                  gameState 
                }));
              } catch (err) {
                console.error(`خطأ في إرسال حالة اللعبة للمستخدم ${playerId}:`, err);
              }
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "حدث خطأ أثناء معالجة الرسالة" 
        }));
      }
    });
    
    // معالجة إغلاق الاتصال
    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
        
        const tableId = userTables.get(userId);
        if (tableId) {
          // حفظ معلومات الطاولة الأخيرة للمستخدم قبل الإغلاق (للاسترداد لاحقاً)
          lastKnownUserStates.set(userId, {
            tableId: tableId,
            lastActivity: Date.now()
          });
          
          // لا نحذف المستخدم من userTables حتى يمكن استعادته عند إعادة الاتصال
          
          // Notify other players at the table
          broadcastToTable(tableId, {
            type: "player_disconnected",
            userId: userId,
            tableId: tableId
          }, userId);
        }
        
        // تحديث عدد المستخدمين المتصلين بعد قطع الاتصال
        broadcastOnlineUsers();
      }
    });
  });
}
