import { Express } from "express";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";

// استيراد الأنواع والوظائف من ملفات منطق اللعبة
import { GameManager, GameState, GamePlayer, ActionResult, WinnerInfo } from "../client/src/pages/poker-lobby/poker-masr/logic/game-manager";
import { PlayerAction } from "../client/src/pages/poker-lobby/poker-masr/logic/poker-engine";

// أنواع رسائل WebSocket للبوكر
export enum PokerSocketMessageType {
  // إدارة الغرف والطاولات
  GET_ROOMS = 'get_rooms',                // طلب قائمة الغرف
  ROOMS_LIST = 'rooms_list',              // قائمة الغرف
  GET_TABLES = 'get_tables',              // طلب قائمة الطاولات في غرفة معينة
  TABLES_LIST = 'tables_list',            // قائمة الطاولات
  CREATE_TABLE = 'create_table',          // إنشاء طاولة جديدة
  TABLE_CREATED = 'table_created',        // تم إنشاء طاولة
  TABLE_UPDATE = 'table_update',          // تحديث بيانات طاولة
  JOIN_ROOM = 'join_room',                // الانضمام لغرفة
  LEAVE_ROOM = 'leave_room',              // مغادرة الغرفة
  ROOM_UPDATE = 'room_update',            // تحديث بيانات الغرفة
  
  // إدارة دورة اللعب
  JOIN_TABLE = 'join_table',              // الانضمام لطاولة
  LEAVE_TABLE = 'leave_table',            // مغادرة الطاولة
  GAME_STATE = 'game_state',              // تحديث حالة اللعبة
  PLAYER_ACTION = 'player_action',        // إجراء اللاعب
  ACTION_RESULT = 'action_result',        // نتيجة الإجراء
  START_ROUND = 'start_round',            // بدء جولة جديدة
  ROUND_COMPLETE = 'round_complete',      // انتهاء الجولة
  REVEAL_CARDS = 'reveal_cards',          // كشف الأوراق
  
  // الاتصال والمراسلة
  CHAT_MESSAGE = 'chat_message',          // رسالة دردشة
  PLAYER_JOINED = 'player_joined',        // انضم لاعب
  PLAYER_LEFT = 'player_left',            // غادر لاعب
  ERROR = 'error',                        // خطأ
  PING = 'ping',                          // نبض
  PONG = 'pong',                          // استجابة للنبض
  ONLINE_USERS_COUNT = 'online_users_count'  // عدد المستخدمين المتصلين
}

// واجهة رسالة WebSocket للبوكر
interface PokerSocketMessage {
  type: PokerSocketMessageType;           // نوع الرسالة
  playerId?: number;                     // معرف اللاعب
  tableId?: number;                      // معرف الطاولة
  data?: any;                            // بيانات الرسالة
  timestamp: number;                     // وقت الرسالة
}

// واجهة غرفة البوكر
interface PokerRoom {
  id: number;                            // معرف الغرفة
  name: string;                          // اسم الغرفة
  description: string;                   // وصف الغرفة
  minBuyIn: number;                      // الحد الأدنى للدخول
  maxBuyIn: number;                      // الحد الأقصى للدخول
  smallBlind: number;                    // قيمة البلايند الصغير
  bigBlind: number;                      // قيمة البلايند الكبير
  isVIP: boolean;                        // هل غرفة VIP؟
  maxPlayers: number;                    // أقصى عدد لاعبين في الطاولة
  tables: Map<number, PokerTable>;       // طاولات هذه الغرفة
  createdAt: Date;                       // وقت إنشاء الغرفة
}

// واجهة طاولة البوكر
interface PokerTable {
  id: number;                            // معرف الطاولة
  roomId: number;                        // معرف الغرفة التي تنتمي إليها
  name: string;                          // اسم الطاولة
  gameManager: GameManager;              // مدير اللعبة
  status: TableStatus;                   // حالة الطاولة
  players: Map<number, ExtendedWebSocket>;  // الاتصالات المرتبطة بالطاولة
  maxPlayers: number;                    // أقصى عدد لاعبين في الطاولة
  createdAt: Date;                       // وقت إنشاء الطاولة
}

// حالات الطاولة
enum TableStatus {
  WAITING = 'waiting',                   // انتظار اللاعبين
  STARTING = 'starting',                 // بدء الجولة
  ACTIVE = 'active',                     // جولة نشطة
  SHOWDOWN = 'showdown',                 // كشف الأوراق
  PAUSED = 'paused'                      // متوقفة مؤقتًا
}

// استخراج بيانات الطاولة للعميل
interface TableInfo {
  id: number;                            // معرف الطاولة
  roomId: number;                        // معرف الغرفة
  name: string;                          // اسم الطاولة
  status: TableStatus;                   // حالة الطاولة
  playersCount: number;                  // عدد اللاعبين الحالي
  maxPlayers: number;                    // أقصى عدد لاعبين
  minBuyIn: number;                      // الحد الأدنى للدخول
  maxBuyIn: number;                      // الحد الأقصى للدخول
  blinds: { small: number, big: number }; // قيم البلايند
  isRoundActive: boolean;                // هل الجولة نشطة؟
  createdAt: Date;                       // وقت الإنشاء
}

// استخراج بيانات الغرفة للعميل
interface RoomInfo {
  id: number;                            // معرف الغرفة
  name: string;                          // اسم الغرفة
  description: string;                   // وصف الغرفة
  minBuyIn: number;                      // الحد الأدنى للدخول
  maxBuyIn: number;                      // الحد الأقصى للدخول
  blinds: { small: number, big: number }; // قيم البلايند
  isVIP: boolean;                        // هل غرفة VIP؟
  tablesCount: number;                   // عدد الطاولات
  playersCount: number;                  // إجمالي عدد اللاعبين
  maxPlayersPerTable: number;            // أقصى عدد لاعبين في الطاولة
  createdAt: Date;                       // وقت الإنشاء
}

// متغيرات عامة للاستخدام في ملفات أخرى
export const pokerModule = {
  broadcastToTable: null as any,
  broadcastToRoom: null as any,
  userTables: new Map<number, number>(), // معرف المستخدم -> معرف الطاولة
  userRooms: new Map<number, number>(),  // معرف المستخدم -> معرف الغرفة
  clients: new Map<number, any>(),       // معرف المستخدم -> معلومات العميل
  tables: new Map<number, PokerTable>(),  // معرف الطاولة -> معلومات الطاولة
  rooms: new Map<number, PokerRoom>()     // معرف الغرفة -> معلومات الغرفة
};

// واجهة اتصال WebSocket الممتد للبوكر
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;                      // هل الاتصال حي؟
  userId?: number;                       // معرف المستخدم
  username?: string;                     // اسم المستخدم
  tableId?: number;                      // معرف الطاولة التي انضم إليها
}

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
  
  // إنشاء غرفة بوكر جديدة
  function createPokerRoom(
    id: number,
    name: string,
    description: string,
    blindAmount: { small: number, big: number },
    minBuyIn: number,
    maxBuyIn: number,
    isVIP: boolean = false,
    maxPlayers: number = 6
  ): PokerRoom {
    console.log(`إنشاء غرفة بوكر: ${name} مع blindAmount=${JSON.stringify(blindAmount)}, minBuyIn=${minBuyIn}, maxBuyIn=${maxBuyIn}`);
    
    try {
      const room: PokerRoom = {
        id,
        name,
        description,
        minBuyIn,
        maxBuyIn,
        smallBlind: blindAmount.small,
        bigBlind: blindAmount.big,
        isVIP,
        maxPlayers,
        tables: new Map<number, PokerTable>(),
        createdAt: new Date()
      };
      
      // تخزين الغرفة في المتغير العام
      pokerModule.rooms.set(id, room);
      
      console.log(`تم إنشاء غرفة بوكر جديدة: ${name} (ID: ${id})`);
      
      return room;
    } catch (error) {
      console.error(`خطأ في إنشاء غرفة البوكر: ${name}`, error);
      throw error;
    }
  }
  
  // إنشاء طاولة بوكر جديدة ضمن غرفة
  function createPokerTable(
    id: number,
    roomId: number,
    name: string,
    maxPlayers: number = 6
  ): PokerTable | null {
    // التحقق من وجود الغرفة
    const room = pokerModule.rooms.get(roomId);
    if (!room) {
      console.error(`محاولة إنشاء طاولة في غرفة غير موجودة: ${roomId}`);
      return null;
    }
    
    console.log(`إنشاء طاولة بوكر: ${name} في الغرفة ${room.name}`);
    
    try {
      const blindAmount = { small: room.smallBlind, big: room.bigBlind };
      const gameManager = new GameManager(blindAmount, room.minBuyIn, room.maxBuyIn);
      console.log(`تم إنشاء مدير اللعبة بنجاح للطاولة: ${name}`);
      
      const table: PokerTable = {
        id,
        roomId,
        name,
        gameManager,
        status: TableStatus.WAITING,
        players: new Map(),
        maxPlayers,
        createdAt: new Date()
      };
      
      // تخزين الطاولة في المتغير العام
      pokerModule.tables.set(id, table);
      
      // إضافة الطاولة إلى الغرفة
      room.tables.set(id, table);
      
      console.log(`تم إنشاء طاولة بوكر جديدة: ${name} (ID: ${id}) في الغرفة ${room.name}`);
      
      // إرسال تحديث بإنشاء الطاولة الجديدة
      const tableInfo = getTableInfo(table);
      if (broadcastToRoom) {
        broadcastToRoom(roomId, {
          type: PokerSocketMessageType.TABLE_CREATED,
          tableInfo
        });
      }
      
      return table;
    } catch (error) {
      console.error(`خطأ في إنشاء طاولة البوكر: ${name}`, error);
      throw error;
    }
  }
  
  // استخراج معلومات الطاولة للعميل
  function getTableInfo(table: PokerTable): TableInfo {
    const gameState = table.gameManager.getState ? table.gameManager.getState() : { players: [], currentRound: { isActive: false } };
    
    return {
      id: table.id,
      roomId: table.roomId,
      name: table.name,
      status: table.status,
      playersCount: table.players ? table.players.size : 0,
      maxPlayers: table.maxPlayers,
      minBuyIn: table.gameManager.minBuyIn || 0,
      maxBuyIn: table.gameManager.maxBuyIn || 0,
      blinds: { 
        small: table.gameManager.blinds?.small || 0, 
        big: table.gameManager.blinds?.big || 0 
      },
      isRoundActive: gameState.currentRound?.isActive || false,
      createdAt: table.createdAt
    };
  }
  
  // استخراج معلومات الغرفة للعميل
  function getRoomInfo(room: PokerRoom): RoomInfo {
    let playersCount = 0;
    room.tables.forEach(table => {
      playersCount += table.players.size;
    });
    
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      minBuyIn: room.minBuyIn,
      maxBuyIn: room.maxBuyIn,
      blinds: { small: room.smallBlind, big: room.bigBlind },
      isVIP: room.isVIP,
      tablesCount: room.tables.size,
      playersCount: playersCount,
      maxPlayersPerTable: room.maxPlayers,
      createdAt: room.createdAt
    };
  }
  
  // إنشاء غرف وطاولات افتراضية للبوكر
  function createDefaultPokerRoomsAndTables() {
    // غرفة المبتدئين
    const beginnerRoom = createPokerRoom(
      1, 
      'غرفة المبتدئين', 
      'غرفة مناسبة للاعبين الجدد في لعبة البوكر',
      { small: 5, big: 10 }, 
      200, 
      2000, 
      false, 
      6
    );
    
    // إنشاء طاولتين في غرفة المبتدئين
    createPokerTable(101, 1, 'طاولة المبتدئين 1', 6);
    createPokerTable(102, 1, 'طاولة المبتدئين 2', 4);
    
    // غرفة المحترفين
    const proRoom = createPokerRoom(
      2, 
      'غرفة المحترفين', 
      'غرفة للاعبين ذوي الخبرة مع رهانات أعلى',
      { small: 25, big: 50 }, 
      1000, 
      10000, 
      false, 
      6
    );
    
    // إنشاء طاولتين في غرفة المحترفين
    createPokerTable(201, 2, 'طاولة المحترفين 1', 6);
    createPokerTable(202, 2, 'طاولة المحترفين 2', 4);
    
    // غرفة VIP
    const vipRoom = createPokerRoom(
      3, 
      'غرفة VIP', 
      'غرفة حصرية مع رهانات عالية',
      { small: 100, big: 200 }, 
      5000, 
      50000, 
      true, 
      4
    );
    
    // إنشاء طاولة في غرفة VIP
    createPokerTable(301, 3, 'طاولة VIP', 4);
  }
  
  // سيتم إنشاء طاولات البوكر الافتراضية من خلال دالة setupPokerGame
  // تم نقل الاستدعاء لتجنب الاستدعاء المبكر
  
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

  // إنشاء غرف وطاولات البوكر الافتراضية
  createDefaultPokerRoomsAndTables();

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
  
  // إرسال رسالة لجميع المستخدمين في غرفة معينة
  function broadcastToRoom(roomId: number, message: any, excludeUserId?: number) {
    if (roomId === undefined || isNaN(roomId)) {
      console.warn("محاولة بث رسالة لغرفة غير صالحة:", roomId, message);
      return;
    }
    
    const room = pokerModule.rooms.get(roomId);
    if (!room) {
      console.warn("محاولة بث رسالة لغرفة غير موجودة:", roomId);
      return;
    }
    
    // الحصول على جميع اللاعبين في جميع طاولات الغرفة
    const players: number[] = [];
    const userRooms = pokerModule.userRooms;
    
    // جمع جميع اللاعبين الذين انضموا للغرفة
    userRooms.forEach((userRoomId, userId) => {
      if (userRoomId === roomId) {
        players.push(userId);
      }
    });
    
    // أيضاً جمع اللاعبين الموجودين في طاولات هذه الغرفة
    room.tables.forEach((table, tableId) => {
      const tablePlayers = getPlayersAtTable(tableId);
      for (const playerId of tablePlayers) {
        if (!players.includes(playerId)) {
          players.push(playerId);
        }
      }
    });
    
    const serializedMessage = JSON.stringify(message);
    
    for (const playerId of players) {
      if (excludeUserId !== undefined && playerId === excludeUserId) continue;
      
      const clientInfo = clients.get(playerId);
      if (clientInfo && clientInfo.ws.readyState === WebSocket.OPEN) {
        try {
          clientInfo.ws.send(serializedMessage);
        } catch (err) {
          console.error(`خطأ أثناء البث للمستخدم ${playerId} في الغرفة ${roomId}:`, err);
        }
      }
    }
  }
  
  // الحصول على جميع اللاعبين في غرفة معينة
  function getPlayersInRoom(roomId: number): number[] {
    const players: number[] = [];
    const userRooms = pokerModule.userRooms;
    
    if (isNaN(roomId)) return players;
    
    // إضافة المستخدمين الذين انضموا للغرفة مباشرة
    userRooms.forEach((userRoomId, userId) => {
      if (userRoomId === roomId) {
        players.push(userId);
      }
    });
    
    // إضافة المستخدمين في طاولات الغرفة
    const room = pokerModule.rooms.get(roomId);
    if (room) {
      room.tables.forEach((_, tableId) => {
        const tablePlayers = getPlayersAtTable(tableId);
        for (const playerId of tablePlayers) {
          if (!players.includes(playerId)) {
            players.push(playerId);
          }
        }
      });
    }
    
    return players;
  }
  
  // تصدير الدوال والمتغيرات للاستخدام في ملفات أخرى
  pokerModule.broadcastToTable = broadcastToTable;
  pokerModule.broadcastToRoom = broadcastToRoom;
  pokerModule.userTables = userTables;
  pokerModule.userRooms = new Map<number, number>();
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

  // إنشاء طاولات البوكر الافتراضية
  // هذا الاستدعاء سيكون فقط داخل setupPokerGame
  
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
        } else if (data.type === PokerSocketMessageType.GET_ROOMS) {
          // طلب قائمة الغرف المتاحة
          const rooms: RoomInfo[] = [];
          
          pokerModule.rooms.forEach(room => {
            rooms.push(getRoomInfo(room));
          });
          
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.ROOMS_LIST,
            rooms: rooms
          }));
        } else if (data.type === PokerSocketMessageType.GET_TABLES) {
          // طلب قائمة الطاولات في غرفة معينة
          const roomId = data.roomId;
          
          if (!roomId || isNaN(Number(roomId))) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "معرف الغرفة غير صالح" 
            }));
            return;
          }
          
          const room = pokerModule.rooms.get(Number(roomId));
          if (!room) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "الغرفة غير موجودة" 
            }));
            return;
          }
          
          const tables: TableInfo[] = [];
          room.tables.forEach(table => {
            tables.push(getTableInfo(table));
          });
          
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.TABLES_LIST,
            roomId: roomId,
            tables: tables
          }));
        } else if (data.type === PokerSocketMessageType.CREATE_TABLE) {
          // إنشاء طاولة جديدة في غرفة
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const roomId = data.roomId;
          const tableName = data.tableName || `طاولة ${userId}_${Date.now()}`;
          const maxPlayers = data.maxPlayers || 6;
          
          if (!roomId || isNaN(Number(roomId))) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "معرف الغرفة غير صالح" 
            }));
            return;
          }
          
          // التحقق من وجود الغرفة
          const room = pokerModule.rooms.get(Number(roomId));
          if (!room) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "الغرفة غير موجودة" 
            }));
            return;
          }
          
          // إنشاء معرف فريد للطاولة
          const tableId = Date.now();
          
          // إنشاء الطاولة
          const table = createPokerTable(tableId, Number(roomId), tableName, maxPlayers);
          
          if (!table) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "فشل إنشاء الطاولة" 
            }));
            return;
          }
          
          // إرسال معلومات الطاولة المنشأة حديثًا
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.TABLE_CREATED,
            tableInfo: getTableInfo(table)
          }));
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
        } else if (data.type === PokerSocketMessageType.JOIN_TABLE) {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = data.tableId;
          const safeTableId = Number(tableId);
          
          if (!tableId || isNaN(safeTableId)) {
            ws.send(JSON.stringify({ type: "error", message: "معرف الطاولة غير صالح" }));
            return;
          }
          
          // التحقق من وجود الطاولة
          const table = pokerModule.tables.get(safeTableId);
          if (!table) {
            ws.send(JSON.stringify({ type: "error", message: "الطاولة غير موجودة" }));
            return;
          }
          
          // التحقق من عدد اللاعبين في الطاولة
          const currentPlayers = getPlayersAtTable(safeTableId);
          if (currentPlayers.length >= table.maxPlayers) {
            ws.send(JSON.stringify({ type: "error", message: "الطاولة ممتلئة" }));
            return;
          }
          
          // إضافة اللاعب للطاولة
          userTables.set(userId, safeTableId);
          
          // إضافة اللاعب أيضًا للغرفة التي تحتوي على الطاولة
          pokerModule.userRooms.set(userId, table.roomId);
          
          if (clients.has(userId)) {
            const clientInfo = clients.get(userId);
            if (clientInfo) {
              clientInfo.tableId = safeTableId;
            }
          }
          
          // إذا كان WebSocket مفتوحًا، أضف اللاعب إلى الطاولة
          if (ws.readyState === WebSocket.OPEN) {
            table.players.set(userId, ws as ExtendedWebSocket);
          }
          
          // تحديث حالة الطاولة
          if (table.status === TableStatus.WAITING && currentPlayers.length + 1 >= 2) {
            table.status = TableStatus.STARTING;
          }
          
          // بث تحديث بانضمام لاعب جديد
          broadcastToTable(safeTableId, {
            type: PokerSocketMessageType.PLAYER_JOINED,
            userId: userId,
            tableId: safeTableId,
            playerCount: currentPlayers.length + 1
          }, userId);
          
          // أرسل تحديث حالة اللعبة للاعب الجديد
          const gameState = table.gameManager.getState ? table.gameManager.getState() : await storage.getGameState(tableId, userId);
          ws.send(JSON.stringify({ 
            type: PokerSocketMessageType.GAME_STATE, 
            gameState 
          }));
          
          // أرسل أيضًا تحديث حالة الطاولة
          broadcastToTable(safeTableId, {
            type: PokerSocketMessageType.TABLE_UPDATE,
            tableInfo: getTableInfo(table)
          });
        } else if (data.type === PokerSocketMessageType.START_ROUND) {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
          // التحقق من وجود الطاولة
          const table = pokerModule.tables.get(tableId);
          if (!table) {
            ws.send(JSON.stringify({ type: "error", message: "الطاولة غير موجودة" }));
            return;
          }
          
          // التحقق من عدد اللاعبين (يجب أن يكون هناك على الأقل لاعبين)
          const players = getPlayersAtTable(tableId);
          if (players.length < 2) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "يجب أن يكون هناك على الأقل لاعبين لبدء جولة" 
            }));
            return;
          }
          
          // بدء جولة جديدة
          try {
            const result = table.gameManager.startNewRound ? table.gameManager.startNewRound() : { success: true };
            
            if (!result.success) {
              ws.send(JSON.stringify({ 
                type: "error", 
                message: result.message || "فشل بدء الجولة" 
              }));
              return;
            }
            
            table.status = TableStatus.ACTIVE;
            
            // إرسال حالة اللعبة المحدثة
            const gameState = table.gameManager.getState ? table.gameManager.getState() : await storage.getGameState(tableId, userId);
            broadcastToTable(tableId, {
              type: PokerSocketMessageType.GAME_STATE,
              gameState
            });
            
            // أرسل أيضًا تحديث حالة الطاولة
            broadcastToTable(tableId, {
              type: PokerSocketMessageType.TABLE_UPDATE,
              tableInfo: getTableInfo(table)
            });
          } catch (error) {
            console.error(`خطأ في بدء جولة جديدة في الطاولة ${tableId}:`, error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "حدث خطأ أثناء بدء الجولة" 
            }));
          }
        } else if (data.type === PokerSocketMessageType.REVEAL_CARDS) {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
          // التحقق من وجود الطاولة
          const table = pokerModule.tables.get(tableId);
          if (!table) {
            ws.send(JSON.stringify({ type: "error", message: "الطاولة غير موجودة" }));
            return;
          }
          
          // كشف الأوراق (عرض الورقة للاعبين في طور الـ showdown)
          try {
            table.status = TableStatus.SHOWDOWN;
            
            const gameState = table.gameManager.getState ? table.gameManager.getState() : await storage.getGameState(tableId, userId);
            broadcastToTable(tableId, {
              type: PokerSocketMessageType.REVEAL_CARDS,
              gameState
            });
            
            // أرسل أيضًا تحديث حالة الطاولة
            broadcastToTable(tableId, {
              type: PokerSocketMessageType.TABLE_UPDATE,
              tableInfo: getTableInfo(table)
            });
          } catch (error) {
            console.error(`خطأ في كشف الأوراق في الطاولة ${tableId}:`, error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "حدث خطأ أثناء كشف الأوراق" 
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
        } else if (data.type === PokerSocketMessageType.JOIN_ROOM) {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const roomId = data.roomId;
          const safeRoomId = Number(roomId);
          
          if (!roomId || isNaN(safeRoomId)) {
            ws.send(JSON.stringify({ type: "error", message: "معرف الغرفة غير صالح" }));
            return;
          }
          
          // التحقق من وجود الغرفة
          const room = pokerModule.rooms.get(safeRoomId);
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "الغرفة غير موجودة" }));
            return;
          }
          
          // إضافة المستخدم للغرفة
          pokerModule.userRooms.set(userId, safeRoomId);
          
          // إرسال معلومات الغرفة للمستخدم
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.ROOM_UPDATE,
            roomInfo: getRoomInfo(room)
          }));
          
          // إرسال قائمة الطاولات في الغرفة
          const tables: TableInfo[] = [];
          room.tables.forEach(table => {
            tables.push(getTableInfo(table));
          });
          
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.TABLES_LIST,
            roomId: safeRoomId,
            tables: tables
          }));
          
          console.log(`المستخدم ${userId} انضم للغرفة ${safeRoomId}`);
        } else if (data.type === PokerSocketMessageType.LEAVE_ROOM) {
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const roomId = pokerModule.userRooms.get(userId);
          if (roomId) {
            // إزالة المستخدم من الغرفة
            pokerModule.userRooms.delete(userId);
            
            // إذا كان المستخدم في طاولة ضمن الغرفة، نزيله من الطاولة أيضًا
            const tableId = userTables.get(userId);
            const table = tableId ? pokerModule.tables.get(tableId) : null;
            
            if (table && table.roomId === roomId) {
              userTables.delete(userId);
              
              if (clients.has(userId)) {
                const clientInfo = clients.get(userId);
                if (clientInfo) {
                  clientInfo.tableId = undefined;
                }
              }
              
              if (table.players.has(userId)) {
                table.players.delete(userId);
              }
              
              // بث تحديث بمغادرة لاعب للطاولة
              broadcastToTable(tableId, {
                type: PokerSocketMessageType.PLAYER_LEFT,
                userId: userId,
                tableId: tableId
              }, userId);
              
              // تحديث حالة الطاولة
              if (table.status !== TableStatus.WAITING && table.players.size < 2) {
                table.status = TableStatus.WAITING;
                
                // بث تحديث لحالة الطاولة
                broadcastToTable(tableId, {
                  type: PokerSocketMessageType.TABLE_UPDATE,
                  tableInfo: getTableInfo(table)
                });
              }
            }
            
            console.log(`المستخدم ${userId} غادر الغرفة ${roomId}`);
          }
          
          // إعادة إرسال قائمة الغرف
          const rooms: RoomInfo[] = [];
          pokerModule.rooms.forEach(room => {
            rooms.push(getRoomInfo(room));
          });
          
          ws.send(JSON.stringify({
            type: PokerSocketMessageType.ROOMS_LIST,
            rooms: rooms
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
          
          // التحقق مما إذا كانت هذه إجراءات خاصة بألعاب أخرى مثل آلة ملكة مصر
          if (data.action === "slot_bet" || data.action === "slot_win" || data.action === "bonus_win") {
            try {
              // الحصول على المستخدم
              const user = await storage.getUser(userId);
              if (!user) {
                ws.send(JSON.stringify({ type: "error", message: "المستخدم غير موجود" }));
                return;
              }
              
              // معالجة المراهنة (خصم من رصيد المستخدم)
              if (data.action === "slot_bet") {
                const betAmount = data.amount || 10000;
                
                // التحقق من كفاية الرصيد
                if (user.chips < betAmount) {
                  ws.send(JSON.stringify({ 
                    type: "error", 
                    message: "رصيد غير كاف للمراهنة"
                  }));
                  return;
                }
                
                // خصم الرهان من رصيد المستخدم
                const newChips = user.chips - betAmount;
                const updatedUser = await storage.updateUserChips(userId, newChips);
                
                // إرسال التحديث إلى المستخدم
                ws.send(JSON.stringify({
                  type: "chips_update",
                  chips: newChips,
                  change: -betAmount,
                  action: "slot_bet",
                  game: data.data?.game || "egypt-queen"
                }));
                
                console.log(`مستخدم ${userId} يراهن بمبلغ ${betAmount} في لعبة ${data.data?.game || "egypt-queen"}`);
              } 
              // معالجة الفوز (إضافة إلى رصيد المستخدم)
              else if (data.action === "slot_win" || data.action === "bonus_win") {
                const winAmount = data.amount || 0;
                
                // التحقق من أن مبلغ الفوز إيجابي
                if (winAmount <= 0) {
                  return;
                }
                
                // إضافة الفوز إلى رصيد المستخدم
                const newChips = user.chips + winAmount;
                const updatedUser = await storage.updateUserChips(userId, newChips);
                
                // إرسال التحديث إلى المستخدم
                ws.send(JSON.stringify({
                  type: "chips_update",
                  chips: newChips,
                  change: winAmount,
                  action: data.action,
                  game: data.data?.game || "egypt-queen"
                }));
                
                console.log(`مستخدم ${userId} يفوز بمبلغ ${winAmount} في لعبة ${data.data?.game || "egypt-queen"}`);
              }
              
              return;
            } catch (error) {
              console.error("خطأ في معالجة إجراء اللعبة:", error);
              ws.send(JSON.stringify({ 
                type: "error", 
                message: "حدث خطأ أثناء معالجة إجراء اللعبة" 
              }));
              return;
            }
          }
          
          // إجراءات لعبة البوكر العادية
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
          // معالجة إجراءات البوكر
          const pokerTable = pokerModule.tables.get(tableId);
          
          if (!pokerTable) {
            ws.send(JSON.stringify({ type: "error", message: "الطاولة غير موجودة" }));
            return;
          }
          
          // تنفيذ الإجراء
          try {
            const action = data.action as PlayerAction;
            const amount = data.amount;
            
            const result = pokerTable.gameManager.performAction(userId, action, amount);
            
            // إرسال نتيجة الإجراء للاعب
            ws.send(JSON.stringify({
              type: "action_result",
              success: result.success,
              message: result.message,
              action: action
            }));
            
            // إذا لم ينجح الإجراء، لا تقم بإرسال حالة اللعبة
            if (!result.success) {
              return;
            }
            
            // إرسال حالة اللعبة المحدثة لجميع اللاعبين
            const gameState = pokerTable.gameManager.getGameState();
            broadcastToTable(tableId, {
              type: "game_state",
              gameState: gameState
            });
            
            // إذا انتهت الجولة وهناك فائزون
            if (result.roundComplete && result.winners) {
              broadcastToTable(tableId, {
                type: "round_complete",
                winners: result.winners
              });
            }
          } catch (error) {
            console.error(`خطأ في تنفيذ إجراء اللاعب ${userId} في الطاولة ${tableId}:`, error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "حدث خطأ أثناء تنفيذ الإجراء" 
            }));
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
        const userTableId = userTables.get(userId);
        
        if (userTableId) {
          lastKnownUserStates.set(userId, {
            tableId: userTableId,
            lastActivity: now
          });
          
          // كود 1000 أو 1001 = إغلاق نظيف (تسجيل خروج)
          const isCleanClose = code === 1000 || code === 1001;
          
          if (isCleanClose) {
            const safeTableId = Number(userTableId);
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
