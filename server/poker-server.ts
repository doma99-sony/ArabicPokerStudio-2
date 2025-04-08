/**
 * خادم البوكر - يوفر اتصال WebSocket للعب متعدد اللاعبين
 */
import express from 'express';
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// استيراد الأنواع والوظائف من ملفات منطق اللعبة
import { GameManager, GameState, GamePlayer, ActionResult, WinnerInfo } from '../client/src/pages/poker-lobby/poker-masr/logic/game-manager';
import { PlayerAction } from '../client/src/pages/poker-lobby/poker-masr/logic/poker-engine';

// أنواع رسائل WebSocket
enum SocketMessageType {
  JOIN_TABLE = 'join_table',              // الانضمام لطاولة
  LEAVE_TABLE = 'leave_table',            // مغادرة الطاولة
  GAME_STATE = 'game_state',              // تحديث حالة اللعبة
  PLAYER_ACTION = 'player_action',        // إجراء اللاعب
  ACTION_RESULT = 'action_result',        // نتيجة الإجراء
  ROUND_COMPLETE = 'round_complete',      // انتهاء الجولة
  CHAT_MESSAGE = 'chat_message',          // رسالة دردشة
  PLAYER_JOINED = 'player_joined',        // انضم لاعب
  PLAYER_LEFT = 'player_left',            // غادر لاعب
  ERROR = 'error',                        // خطأ
  PING = 'ping',                          // نبض
  PONG = 'pong',                          // استجابة للنبض
  ONLINE_USERS_COUNT = 'online_users_count'  // عدد المستخدمين المتصلين
}

// واجهة رسالة WebSocket
interface SocketMessage {
  type: SocketMessageType;               // نوع الرسالة
  playerId?: number;                     // معرف اللاعب
  tableId?: number;                      // معرف الطاولة
  data?: any;                            // بيانات الرسالة
  timestamp: number;                     // وقت الرسالة
}

// واجهة اتصال WebSocket الممتد
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;                      // هل الاتصال حي؟
  userId?: number;                       // معرف المستخدم
  username?: string;                     // اسم المستخدم
  tableId?: number;                      // معرف الطاولة التي انضم إليها
}

// واجهة طاولة البوكر
interface PokerTable {
  id: number;                            // معرف الطاولة
  name: string;                          // اسم الطاولة
  gameManager: GameManager;              // مدير اللعبة
  players: Map<number, ExtendedWebSocket>;  // الاتصالات المرتبطة بالطاولة
  createdAt: Date;                       // وقت إنشاء الطاولة
}

// إنشاء خادم Express
const app = express();
const server = http.createServer(app);

// الحصول على المنفذ من متغيرات البيئة أو استخدام 3001 كمنفذ افتراضي
const PORT = process.env.PORT || 3001;

// إنشاء خادم WebSocket مرتبط بخادم HTTP
const wss = new WebSocketServer({ server });

// إنشاء طاولات البوكر
const tables: Map<number, PokerTable> = new Map();

// إنشاء طاولات افتراضية
function createDefaultTables() {
  // طاولة تكساس هولدم عادية
  createTable(1, 'تكساس هولدم (5/10)', { small: 5, big: 10 }, 200, 2000);
  
  // طاولة تكساس هولدم VIP
  createTable(2, 'تكساس هولدم VIP (25/50)', { small: 25, big: 50 }, 1000, 10000);
  
  // طاولة تكساس هولدم بوت كبير
  createTable(3, 'تكساس هولدم (10/20) - بوت كبير', { small: 10, big: 20 }, 400, 4000);
}

// إنشاء طاولة جديدة
function createTable(
  id: number,
  name: string,
  blindAmount: { small: number, big: number },
  minBuyIn: number,
  maxBuyIn: number
): PokerTable {
  const gameManager = new GameManager(blindAmount, minBuyIn, maxBuyIn);
  
  const table: PokerTable = {
    id,
    name,
    gameManager,
    players: new Map(),
    createdAt: new Date()
  };
  
  // تخزين الطاولة في الخريطة
  tables.set(id, table);
  
  return table;
}

// معالجة اتصال WebSocket جديد
wss.on('connection', (ws: ExtendedWebSocket) => {
  // تعيين العلامة الحية
  ws.isAlive = true;
  
  // تعيين معرف مستخدم افتراضي
  ws.userId = Date.now();
  
  // إرسال رسالة ترحيب
  sendMessage(ws, SocketMessageType.PING, {
    timestamp: Date.now(),
    serverTime: new Date().toISOString()
  });
  
  // تحديث عدد المستخدمين المتصلين
  broadcastOnlineUsersCount();
  
  // معالجة رسائل من العميل
  ws.on('message', (message: string) => {
    try {
      const msg: SocketMessage = JSON.parse(message);
      
      // معالجة الرسالة حسب نوعها
      switch (msg.type) {
        case SocketMessageType.JOIN_TABLE:
          handleJoinTable(ws, msg);
          break;
          
        case SocketMessageType.LEAVE_TABLE:
          handleLeaveTable(ws);
          break;
          
        case SocketMessageType.PLAYER_ACTION:
          handlePlayerAction(ws, msg);
          break;
          
        case SocketMessageType.CHAT_MESSAGE:
          handleChatMessage(ws, msg);
          break;
          
        case SocketMessageType.PONG:
          ws.isAlive = true;
          break;
          
        default:
          // رسالة غير معروفة
          console.log(`رسالة غير معروفة: ${msg.type}`);
      }
    } catch (error) {
      console.error('خطأ في معالجة رسالة WebSocket:', error);
      sendMessage(ws, SocketMessageType.ERROR, {
        message: 'خطأ في معالجة الرسالة.'
      });
    }
  });
  
  // معالجة إغلاق الاتصال
  ws.on('close', () => {
    // إزالة اللاعب من الطاولة إذا كان منضماً
    handleLeaveTable(ws);
    
    // تحديث عدد المستخدمين المتصلين
    broadcastOnlineUsersCount();
  });
  
  // معالجة خطأ في الاتصال
  ws.on('error', (error) => {
    console.error('خطأ في اتصال WebSocket:', error);
  });
});

// معالجة انضمام لاعب إلى طاولة
function handleJoinTable(ws: ExtendedWebSocket, msg: SocketMessage) {
  const { tableId, username, chips, avatar } = msg.data || {};
  
  // التحقق من صحة البيانات
  if (!tableId || !username || !chips) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: 'بيانات غير صالحة للانضمام إلى الطاولة.'
    });
  }
  
  // التحقق من وجود الطاولة
  const table = tables.get(tableId);
  if (!table) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: 'الطاولة غير موجودة.'
    });
  }
  
  // تخزين معلومات المستخدم
  ws.userId = msg.playerId || Date.now();
  ws.username = username;
  ws.tableId = tableId;
  
  // إضافة اللاعب إلى الطاولة
  const result = table.gameManager.addPlayer(ws.userId, username, chips, avatar);
  
  if (!result.success) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: result.message || 'فشل الانضمام إلى الطاولة.'
    });
  }
  
  // إضافة اتصال اللاعب إلى الطاولة
  table.players.set(ws.userId, ws);
  
  // إرسال حالة اللعبة الحالية للاعب الجديد
  sendMessage(ws, SocketMessageType.GAME_STATE, table.gameManager.getGameState());
  
  // إعلام جميع اللاعبين بانضمام لاعب جديد
  const player = table.gameManager.getGameState().players.find(p => p.id === ws.userId);
  broadcastToTable(table, SocketMessageType.PLAYER_JOINED, player, ws.userId);
  
  console.log(`انضم اللاعب ${username} (${ws.userId}) إلى الطاولة ${tableId}`);
}

// معالجة مغادرة لاعب طاولة
function handleLeaveTable(ws: ExtendedWebSocket) {
  if (!ws.tableId) {
    return;
  }
  
  // التحقق من وجود الطاولة
  const table = tables.get(ws.tableId);
  if (!table) {
    return;
  }
  
  // إزالة اللاعب من الطاولة
  const result = table.gameManager.removePlayer(ws.userId!);
  
  // إزالة اتصال اللاعب من الطاولة
  table.players.delete(ws.userId!);
  
  // إعلام جميع اللاعبين بمغادرة اللاعب
  broadcastToTable(table, SocketMessageType.PLAYER_LEFT, { playerId: ws.userId });
  
  // إرسال حالة اللعبة المحدثة
  broadcastGameState(table);
  
  // إعادة تعيين معلومات الطاولة في الاتصال
  const playerId = ws.userId;
  ws.tableId = undefined;
  
  console.log(`غادر اللاعب ${playerId} الطاولة ${table.id}`);
}

// معالجة إجراء لاعب
function handlePlayerAction(ws: ExtendedWebSocket, msg: SocketMessage) {
  const { action, amount } = msg.data || {};
  
  // التحقق من صحة البيانات
  if (!action) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: 'بيانات غير صالحة للإجراء.'
    });
  }
  
  // التحقق من انضمام اللاعب إلى طاولة
  if (!ws.tableId) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: 'أنت غير منضم إلى أي طاولة.'
    });
  }
  
  // التحقق من وجود الطاولة
  const table = tables.get(ws.tableId);
  if (!table) {
    return sendMessage(ws, SocketMessageType.ERROR, {
      message: 'الطاولة غير موجودة.'
    });
  }
  
  // تنفيذ الإجراء
  const result = table.gameManager.performAction(ws.userId!, action as PlayerAction, amount);
  
  // إرسال نتيجة الإجراء للاعب
  sendMessage(ws, SocketMessageType.ACTION_RESULT, result);
  
  // إذا لم ينجح الإجراء، لا تقم بإرسال حالة اللعبة
  if (!result.success) {
    return;
  }
  
  // إرسال حالة اللعبة المحدثة لجميع اللاعبين
  broadcastGameState(table);
  
  // إذا انتهت الجولة وهناك فائزون
  if (result.roundComplete && result.winners) {
    broadcastToTable(table, SocketMessageType.ROUND_COMPLETE, { winners: result.winners });
  }
}

// معالجة رسالة دردشة
function handleChatMessage(ws: ExtendedWebSocket, msg: SocketMessage) {
  const { message } = msg.data || {};
  
  // التحقق من صحة البيانات
  if (!message) {
    return;
  }
  
  // التحقق من انضمام اللاعب إلى طاولة
  if (!ws.tableId) {
    return;
  }
  
  // التحقق من وجود الطاولة
  const table = tables.get(ws.tableId);
  if (!table) {
    return;
  }
  
  // إرسال الرسالة لجميع اللاعبين في الطاولة
  broadcastToTable(table, SocketMessageType.CHAT_MESSAGE, {
    message,
    senderName: ws.username,
    senderId: ws.userId
  });
}

// إرسال رسالة إلى اتصال محدد
function sendMessage(ws: ExtendedWebSocket, type: SocketMessageType, data?: any): void {
  if (ws.readyState === WebSocket.OPEN) {
    const message: SocketMessage = {
      type,
      playerId: ws.userId,
      tableId: ws.tableId,
      data,
      timestamp: Date.now()
    };
    
    ws.send(JSON.stringify(message));
  }
}

// إرسال رسالة لجميع اللاعبين في طاولة معينة، مع استثناء محتمل
function broadcastToTable(
  table: PokerTable,
  type: SocketMessageType,
  data?: any,
  excludePlayerId?: number
): void {
  table.players.forEach((playerWs, playerId) => {
    if (excludePlayerId !== undefined && playerId === excludePlayerId) {
      return;
    }
    
    sendMessage(playerWs, type, data);
  });
}

// إرسال حالة اللعبة لجميع اللاعبين في طاولة
function broadcastGameState(table: PokerTable): void {
  const gameState = table.gameManager.getGameState();
  broadcastToTable(table, SocketMessageType.GAME_STATE, gameState);
}

// إرسال عدد المستخدمين المتصلين
function broadcastOnlineUsersCount(): void {
  // حساب عدد الاتصالات الفريدة
  const uniqueConnections = new Set<string>();
  
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      const ws = client as ExtendedWebSocket;
      const id = ws.userId?.toString() || 'unknown';
      uniqueConnections.add(id);
    }
  });
  
  // طباعة عدد المستخدمين في وحدة التحكم
  console.log(`عدد المستخدمين المتصلين حقيقياً: ${uniqueConnections.size}`);
  
  // إرسال عدد المستخدمين لجميع العملاء المتصلين
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      const ws = client as ExtendedWebSocket;
      sendMessage(ws, SocketMessageType.ONLINE_USERS_COUNT, {
        count: uniqueConnections.size
      });
    }
  });
}

// إنشاء طاولات افتراضية
createDefaultTables();

// بدء إرسال نبضات للحفاظ على الاتصالات نشطة
let counter = 0;
setInterval(() => {
  // زيادة العداد
  counter++;
  
  console.log(`العداد: ${counter}`);
  
  // حساب عدد المستخدمين المتصلين
  let totalPlayers = 0;
  tables.forEach((table) => {
    totalPlayers += table.players.size;
  });
  
  console.log(`إجمالي عدد المستخدمين المتصلين مع الوهميين: ${totalPlayers}`);
  
  // إرسال نبض معلوماتي لجميع العملاء
  console.log('إرسال نبض معلوماتي لجميع العملاء المتصلين...');
  wss.clients.forEach((client: WebSocket) => {
    const ws = client as ExtendedWebSocket;
    
    // إذا لم يستجب العميل للنبض السابق، افترض أنه غير متصل
    if (ws.isAlive === false) {
      console.log(`إغلاق اتصال غير مستجيب: ${ws.userId}`);
      ws.terminate();
      return;
    }
    
    // تعيين العلامة الحية إلى false، سيتم تعيينها إلى true عند استلام PONG
    ws.isAlive = false;
    
    // إرسال نبض
    sendMessage(ws, SocketMessageType.PING, {
      timestamp: Date.now(),
      serverTime: new Date().toISOString()
    });
  });
  
  // مرة كل 5 نبضات، أرسل عدد المستخدمين المتصلين
  if (counter % 5 === 0) {
    broadcastOnlineUsersCount();
  }
}, 5000);

// بدء الاستماع على المنفذ المحدد
server.listen(PORT, () => {
  console.log(`خادم البوكر يعمل على المنفذ: ${PORT}`);
});