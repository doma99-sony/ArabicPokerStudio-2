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
  // تكوين أبسط قدر ممكن لخادم WebSocket (VERSION 3)
  // يعالج مشكلات التوافق المعروفة عبر المتصفحات المختلفة
  // لا يوجد ضغط أو تعقيدات إضافية
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws", // مسار محدد لاتصالات WebSocket
    perMessageDeflate: false, // تعطيل الضغط لتعزيز التوافق والأداء
    clientTracking: true, // تتبع العملاء تلقائياً
    // الإعدادات التالية تم حذفها لتبسيط التكوين
    // backlog: undefined,
    // maxPayload: 104857600, // 100 ميجابايت
    // skipUTF8Validation: false,
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

  // إرسال رسالة لجميع المستخدمين المتصلين
  const broadcast = (message: any, excludeUserId?: number) => {
    const serializedMessage = JSON.stringify(message);
    
    clients.forEach((clientInfo, userId) => {
      if (userId !== excludeUserId && clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(serializedMessage);
        } catch (err) {
          console.error(`خطأ أثناء البث للمستخدم ${userId}:`, err);
        }
      }
    });
  };

  // عدد المستخدمين المتصلين
  const getOnlineCount = () => {
    return clients.size;
  };

  // عداد لتتبع عدد المستخدمين
  let activeCounter = 0;
  
  // إرسال عدد المستخدمين المتصلين
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
  
  // فواصل زمنية
  const PING_INTERVAL = 5000; // 5 ثوانٍ
  const UPDATE_INTERVAL = 5000;
  
  // تحديث عدد المستخدمين المتصلين كل 5 ثوانٍ
  const updateIntervalId = setInterval(() => {
    broadcastOnlineUsers();
  }, UPDATE_INTERVAL);

  // إرسال نبضات للحفاظ على الاتصال
  const heartbeatIntervalId = setInterval(() => {
    console.log("إرسال نبض معلوماتي لجميع العملاء المتصلين...");
    
    const now = Date.now();
    
    clients.forEach((clientInfo, userId) => {
      if (clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(JSON.stringify({ 
            type: "ping", 
            timestamp: now,
            serverTime: new Date().toISOString()
          }));
          clientInfo.lastPing = now;
        } catch (err) {
          console.error(`خطأ أثناء إرسال نبض للمستخدم ${userId}:`, err);
        }
      }
    });
  }, PING_INTERVAL);

  // إرسال رسالة لجميع المستخدمين في طاولة معينة
  function broadcastToTable(tableId: number, message: any, excludeUserId?: number) {
    if (tableId === undefined || isNaN(tableId)) {
      console.warn("محاولة بث رسالة لطاولة غير صالحة:", tableId, message);
      return;
    }
    
    const players = getPlayersAtTable(tableId);
    const serializedMessage = JSON.stringify(message);
    
    for (const playerId of players) {
      if (excludeUserId !== undefined && playerId === excludeUserId) continue;
      
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
    
    if (isNaN(tableId)) return players;
    
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
    
    clearInterval(updateIntervalId);
    clearInterval(heartbeatIntervalId);
    
    clients.forEach((clientInfo) => {
      try {
        clientInfo.ws.close(1000, 'Server shutdown');
      } catch (err) {
        // تجاهل أي أخطاء أثناء الإغلاق
      }
    });
    
    wss.close();
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }

  // معالجة اتصال جديد
  wss.on("connection", (ws: WebSocket, req: any) => {
    let userId: number | undefined;
    const connectionTime = Date.now();
    
    const newClient: ClientInfo = {
      ws,
      userId: 0,
      isAlive: true,
      lastPing: connectionTime,
      reconnectCount: 0,
      joinedAt: connectionTime
    };

    // دالة heartbeat
    const heartbeat = () => {
      if (userId && clients.has(userId)) {
        const clientInfo = clients.get(userId);
        if (clientInfo) {
          clientInfo.isAlive = true;
          console.log(`تم تحديث heartbeat للمستخدم ${userId}`);
        }
      }
    };

    ws.on('pong', heartbeat);
    heartbeat();
    
    // معالجة الرسائل الواردة
    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
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
        } else if (data.type === "chat_message" || data.type === "table_chat_message") {
          // معالجة رسائل الدردشة (العامة أو دردشة الطاولة)
          const messageId = data.id || `msg_${Date.now()}`;
          
          let username = data.username;
          let avatar = data.avatar;
          let timestamp = data.timestamp || Date.now();
          
          if (userId) {
            try {
              const user = await storage.getUser(userId);
              if (user) {
                username = username || user.username;
                avatar = avatar || user.avatar;
                console.log(`معالجة رسالة من المستخدم ${username}`);
              }
            } catch (e) {
              console.error("خطأ في الحصول على معلومات المستخدم:", e);
            }
          }
          
          if (username && data.message && data.message.trim().length > 0) {
            const chatMessage = {
              type: data.type, // استخدم نوع الرسالة الذي تم استلامه
              id: messageId,
              username: username,
              message: data.message.trim(),
              avatar: avatar,
              timestamp: timestamp,
              tableId: data.tableId // معرف الطاولة للرسائل الخاصة بالطاولة
            };
            
            const messageType = data.type === "table_chat_message" ? "دردشة الطاولة" : "الدردشة العامة";
            console.log(`رسالة جديدة في ${messageType} من ${username}: ${data.message.substring(0, 30)}${data.message.length > 30 ? '...' : ''}`);
            
            if (!data.clientHandled) {
              ws.send(JSON.stringify(chatMessage));
            }
            
            // إذا كانت رسالة خاصة بالطاولة، قم بإرسالها فقط للاعبين في نفس الطاولة
            if (data.type === "table_chat_message" && data.tableId) {
              broadcastToTable(data.tableId, chatMessage, userId);
            } else {
              // وإلا، أرسلها لجميع المستخدمين (الدردشة العامة)
              broadcast(chatMessage, userId);
            }
          } else {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "الرسالة غير صالحة" 
            }));
          }
        } else if (data.type === "join_table") {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = data.tableId;
          userTables.set(userId, tableId);
          
          if (clients.has(userId)) {
            const clientInfo = clients.get(userId);
            if (clientInfo) {
              clientInfo.tableId = tableId;
            }
          }
          
          const safeTableId = Number(tableId);
          if (!isNaN(safeTableId)) {
            broadcastToTable(safeTableId, {
              type: "player_joined",
              userId: userId,
              tableId: safeTableId
            }, userId);
          }
          
          const gameState = await storage.getGameState(tableId, userId);
          ws.send(JSON.stringify({ 
            type: "game_state", 
            gameState 
          }));
        } else if (data.type === "leave_table") {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (tableId) {
            userTables.delete(userId);
            
            if (clients.has(userId)) {
              const clientInfo = clients.get(userId);
              if (clientInfo) {
                clientInfo.tableId = undefined;
              }
            }
            
            const safeLeaveTableId = Number(tableId);
            if (!isNaN(safeLeaveTableId)) {
              broadcastToTable(safeLeaveTableId, {
                type: "player_left",
                userId: userId,
                tableId: safeLeaveTableId
              }, userId);
            }
          }
        } else if (data.type === "game_action") {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
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
          
          const safeGameActionTableId = Number(tableId);
          if (!isNaN(safeGameActionTableId)) {
            const players = getPlayersAtTable(safeGameActionTableId);
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
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "حدث خطأ أثناء معالجة الرسالة" 
        }));
      }
    });
    
    // معالجة إغلاق الاتصال - مبسطة
    ws.on("close", (code: number, reason: string) => {
      console.log(`إغلاق اتصال WebSocket للمستخدم ${userId || 'غير معروف'} (كود: ${code}, سبب: ${reason || 'غير محدد'})`);
      
      if (userId) {
        const now = Date.now();
        const tableId = userTables.get(userId);
        
        if (tableId) {
          lastKnownUserStates.set(userId, {
            tableId: tableId,
            lastActivity: now
          });
          
          // كود 1000 أو 1001 = إغلاق نظيف (تسجيل خروج)
          const isCleanClose = code === 1000 || code === 1001;
          
          if (isCleanClose) {
            const safeTableId = Number(tableId);
            if (!isNaN(safeTableId)) {
              broadcastToTable(safeTableId, {
                type: "player_left",
                userId: userId,
                tableId: safeTableId,
                reason: "خروج المستخدم"
              }, userId);
            }
            
            userTables.delete(userId);
            clients.delete(userId);
            console.log(`تم حذف المستخدم ${userId} بعد تسجيل خروج منتظم`);
          } else {
            // قطع اتصال غير مقصود - نحتفظ بالمستخدم في النظام
            console.log(`قطع اتصال غير نظيف للمستخدم ${userId} - الحفاظ على حالة الاتصال`);
          }
        } else {
          // إذا لم يكن في طاولة، نحذفه
          clients.delete(userId);
        }
        
        broadcastOnlineUsers();
      }
    });
  });
}
