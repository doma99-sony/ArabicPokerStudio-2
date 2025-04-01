import { Express } from "express";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

// Set up WebSocket server for real-time game updates
export function setupPokerGame(app: Express, httpServer: Server) {
  // Create WebSocket server with proper configuration
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws", // Specify explicit path for WebSocket connections
    perMessageDeflate: false // Disable compression to avoid some connection issues
  });

  // Broadcast message to all connected clients
  const broadcast = (message: any, excludeUserId?: number) => {
    const serializedMessage = JSON.stringify(message);
    clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(serializedMessage);
      }
    });
  };
  
  // Map to track active connections by user ID
  const clients = new Map<number, WebSocket>();
  
  // Map to track which tables users are connected to
  const userTables = new Map<number, number>();

  // عدد افتراضي من المستخدمين المتصلين (بين 0 مستخدم) - بعد إزالة اللاعبين الوهميين
  const getRandomOnlineCount = () => {
    const baseUsers = clients.size; // عدد المستخدمين الحقيقيين
    // const fakeUsers = Math.floor(Math.random() * 10) + 5; // تم تعطيل العدد الوهمي
    const fakeUsers = 0; // لا يوجد لاعبين وهميين
    return baseUsers + fakeUsers;
  };

  // عداد لتتبع عدد المستخدمين في وقت معين
  let activeCounter = 0;
  
  // دالة لإرسال عدد المستخدمين المتصلين حاليًا
  const broadcastOnlineUsers = () => {
    const realCount = clients.size;
    const onlineCount = getRandomOnlineCount();
    activeCounter++;
    
    console.log(`عدد المستخدمين المتصلين حقيقياً: ${realCount}`);
    console.log(`العداد: ${activeCounter}`);
    console.log(`إجمالي عدد المستخدمين المتصلين مع الوهميين: ${onlineCount}`);
    
    const message = {
      type: "online_users_count",
      count: onlineCount
    };
    
    broadcast(message);
  };
  
  const PING_INTERVAL = 15000; // 15 ثانية للتواصل المستمر
  // تم إلغاء HEARTBEAT_TIMEOUT لإزالة أي مهلة زمنية محددة للاتصال
  
  // تحديث عدد المستخدمين المتصلين كل 5 ثوانٍ
  const UPDATE_INTERVAL = 5000; // 5 seconds
  setInterval(() => {
    broadcastOnlineUsers();
  }, UPDATE_INTERVAL);

  // إرسال رسالة معلوماتية (نوع: ping) بدلاً من ping الافتراضي لضمان استمرار الاتصال
  // هذا أكثر فعالية مع بعض الوسطاء/الجدران النارية التي قد تحظر العمليات الثنائية
  setInterval(() => {
    console.log("إرسال نبض معلوماتي لجميع العملاء المتصلين...");
    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          // إرسال رسالة json بدلاً من ping
          client.send(JSON.stringify({ 
            type: "ping", 
            timestamp: Date.now() 
          }));
          
          // بالإضافة لذلك، نرسل ping عادي
          client.ping();
        } catch (err) {
          console.error(`خطأ أثناء إرسال نبض للمستخدم ${userId}:`, err);
        }
      }
    });
  }, PING_INTERVAL);
  
  wss.on("connection", (ws: WebSocket, req: any) => {
    let userId: number | undefined;
    let pingTimeout: NodeJS.Timeout;

    // تعريف دالة heartbeat بدون أي مؤقت انتهاء للحفاظ على الاتصال مفتوحًا طوال الوقت
    const heartbeat = () => {
      // فقط تسجيل أنه تم استلام نبضة
      console.log(`تم تحديث heartbeat للمستخدم ${userId || 'غير معروف'}`);
      
      // لا نستخدم أي مؤقت انتهاء للحفاظ على الاتصال مفتوحًا بشكل دائم
      // لا حاجة لتعيين مؤقت للإغلاق التلقائي بعد فترة محددة
    };

    ws.on('pong', heartbeat);
    heartbeat();
    
    // Parse session cookie to get user ID (simplified version)
    const cookieString = req.headers.cookie;
    if (cookieString) {
      // In a real implementation, we would use the session middleware to validate the user
      // For now, we'll expect the client to send their user ID in a message
    }
    
    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        // معالجة رسائل pong من العميل
        if (data.type === "pong") {
          // تلقي رسالة pong من العميل، تحديث مؤقت الاتصال
          console.log(`تم استلام pong من المستخدم ${userId || 'غير معروف'}`);
          heartbeat();
        } else if (data.type === "auth") {
          // Authenticate user
          const user = await storage.getUser(data.userId);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          userId = user.id;
          clients.set(userId, ws);
          
          // Send authentication success response
          ws.send(JSON.stringify({ type: "auth", success: true }));
          
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
          
          // Send updated game state to all players at the table
          const players = getPlayersAtTable(tableId);
          for (const playerId of players) {
            const playerWs = clients.get(playerId);
            if (playerWs && playerWs.readyState === 1) { // WebSocket.OPEN = 1
              const gameState = await storage.getGameState(tableId, playerId);
              playerWs.send(JSON.stringify({ 
                type: "game_state", 
                gameState 
              }));
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
    
    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
        
        const tableId = userTables.get(userId);
        if (tableId) {
          userTables.delete(userId);
          
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
  
  // Broadcast message to all users at a table except the sender
  function broadcastToTable(tableId: number, message: any, excludeUserId?: number) {
    const players = getPlayersAtTable(tableId);
    
    for (const playerId of players) {
      if (excludeUserId && playerId === excludeUserId) continue;
      
      const ws = clients.get(playerId);
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        ws.send(JSON.stringify(message));
      }
    }
  }
  
  // Get all players at a table
  function getPlayersAtTable(tableId: number): number[] {
    const players: number[] = [];
    
    // Use forEach to iterate the map instead of entries()
    userTables.forEach((userTableId, userId) => {
      if (userTableId === tableId) {
        players.push(userId);
      }
    });
    
    return players;
  }
}
