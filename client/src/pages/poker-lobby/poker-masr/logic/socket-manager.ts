/**
 * مدير الاتصال بالسوكيت للعبة البوكر
 * يتيح اللعب متعدد اللاعبين والتحديثات في الوقت الحقيقي
 */

import { PlayerAction, GamePhase } from './poker-engine';
import { GameState, GamePlayer, ActionResult, WinnerInfo } from './game-manager';

/**
 * أنواع رسائل WebSocket
 */
export enum SocketMessageType {
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
  PONG = 'pong'                           // استجابة للنبض
}

/**
 * واجهة رسالة WebSocket
 */
export interface SocketMessage {
  type: SocketMessageType;               // نوع الرسالة
  tableId?: number | null;               // معرف الطاولة (مع دعم القيم null)
  playerId?: number | null;              // معرف اللاعب (مع دعم القيم null)
  data?: any;                            // بيانات الرسالة
  timestamp: number;                     // وقت الرسالة
}

/**
 * واجهة رسالة انضمام طاولة
 */
export interface JoinTableMessage {
  tableId: number;                       // معرف الطاولة
  username: string;                      // اسم اللاعب
  chips: number;                         // رقائق اللاعب
  avatar?: string;                       // صورة اللاعب
}

/**
 * واجهة رسالة مغادرة طاولة
 */
export interface LeaveTableMessage {
  tableId: number;                       // معرف الطاولة
}

/**
 * واجهة رسالة إجراء اللاعب
 */
export interface PlayerActionMessage {
  tableId: number;                       // معرف الطاولة
  action: PlayerAction;                  // نوع الإجراء
  amount?: number;                       // مبلغ الإجراء (إن وجد)
}

/**
 * واجهة رسالة دردشة
 */
export interface ChatMessage {
  tableId: number;                       // معرف الطاولة
  message: string;                       // نص الرسالة
  senderName?: string;                   // اسم المرسل
  senderId?: number;                     // معرف المرسل
}

/**
 * واجهة معالج رسائل WebSocket
 */
interface SocketMessageHandlers {
  [key: string]: (data: any) => void;
}

/**
 * فئة مدير WebSocket
 */
export class SocketManager {
  private socket: WebSocket | null = null;
  private handlers: SocketMessageHandlers = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 ثواني
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private userId: number | null = null;
  private username: string | null = null;
  private currentTableId: number | null = null;
  
  /**
   * إنشاء اتصال WebSocket جديد
   */
  public connect(url: string | null, userId: number, username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.username = username;
        
        // إغلاق أي اتصال سابق
        this.closeConnection();
        
        // توليد عنوان URL لـ WebSocket ديناميكيًا إذا لم يتم تمريره
        if (!url) {
          // استخدم نفس البروتوكول كما في اتصال المتصفح الحالي
          const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
          
          // الحصول على عنوان المضيف للبيئة الحالية
          // في Replit، نستخدم عنوان URL الكامل للتطبيق
          // مع استبدال الـ HTTP/HTTPS بـ WS/WSS
          const replitUrl = window.location.hostname;
          
          // تأكد من استخدام عنوان replit.dev/replit.co للـ WebSocket
          let host = window.location.host;
          
          // قم بتوجيه اتصالات WebSocket للبوكر إلى مسار المنفذ 5000 (خادم Node.js للتطبيق)
          // استخدم مسار /ws الذي يتم إنشاؤه في server/poker.ts
          url = `${protocol}://${host}/ws`;
          
          console.log('تم توليد عنوان WebSocket للبوكر تلقائيًا:', url);
        }
        
        console.log('محاولة الاتصال بـ WebSocket على العنوان:', url);
        
        // إنشاء اتصال جديد
        this.socket = new WebSocket(url);
        
        // معالجة فتح الاتصال
        this.socket.onopen = () => {
          console.log('تم فتح اتصال WebSocket للبوكر');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // إرسال نبضة كل 30 ثانية للحفاظ على الاتصال
          this.startPingInterval();
          
          resolve(true);
        };
        
        // معالجة استلام الرسائل
        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };
        
        // معالجة الأخطاء
        this.socket.onerror = (error) => {
          console.error('خطأ في اتصال WebSocket للبوكر:', error);
          reject(error);
        };
        
        // معالجة إغلاق الاتصال
        this.socket.onclose = (event) => {
          console.log(`تم إغلاق اتصال WebSocket للبوكر (كود: ${event.code}, سبب: ${event.reason})`);
          this.isConnected = false;
          
          // إيقاف إرسال النبضات
          this.stopPingInterval();
          
          // محاولة إعادة الاتصال
          this.attemptReconnect();
        };
      } catch (error) {
        console.error('فشل إنشاء اتصال WebSocket للبوكر:', error);
        reject(error);
      }
    });
  }
  
  /**
   * إغلاق اتصال WebSocket
   */
  public closeConnection(): void {
    if (this.socket) {
      try {
        // إيقاف إرسال النبضات
        this.stopPingInterval();
        
        // إلغاء محاولات إعادة الاتصال
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        
        // إغلاق الاتصال
        if (this.isConnected) {
          this.socket.close(1000, 'إغلاق عمدي من قبل العميل');
        }
        
        this.socket = null;
        this.isConnected = false;
      } catch (error) {
        console.error('خطأ أثناء إغلاق اتصال WebSocket للبوكر:', error);
      }
    }
  }
  
  /**
   * التحقق من اتصال WebSocket
   */
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * تسجيل معالجات الرسائل
   */
  public registerHandlers(handlers: SocketMessageHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }
  
  /**
   * إلغاء تسجيل معالج رسالة
   */
  public unregisterHandler(type: SocketMessageType): void {
    if (this.handlers[type]) {
      delete this.handlers[type];
    }
  }
  
  /**
   * إلغاء تسجيل جميع المعالجات
   */
  public unregisterAllHandlers(): void {
    this.handlers = {};
  }
  
  /**
   * إرسال رسالة عبر WebSocket
   */
  public sendMessage(type: SocketMessageType, data?: any): boolean {
    if (!this.isSocketConnected()) {
      console.error('محاولة إرسال رسالة عبر اتصال WebSocket مغلق');
      return false;
    }
    
    try {
      // تطويع صيغة الرسالة لتتوافق مع توقعات الخادم في server/poker.ts
      const message: SocketMessage = {
        type,
        playerId: this.userId || undefined,
        tableId: this.currentTableId || undefined, // إضافة معرف الطاولة إلى جميع الرسائل، مع التعامل مع القيمة null
        data,
        timestamp: Date.now()
      };
      
      // طباعة الرسائل المرسلة للتصحيح
      console.log('إرسال رسالة WebSocket:', message);
      
      this.socket!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('خطأ في إرسال رسالة عبر WebSocket:', error);
      return false;
    }
  }
  
  /**
   * الانضمام إلى طاولة
   */
  public joinTable(tableId: number, chips: number): boolean {
    const joinMessage: JoinTableMessage = {
      tableId,
      username: this.username || 'ضيف',
      chips,
      avatar: undefined // يمكن إضافة الصورة لاحقاً
    };
    
    this.currentTableId = tableId;
    return this.sendMessage(SocketMessageType.JOIN_TABLE, joinMessage);
  }
  
  /**
   * مغادرة الطاولة
   */
  public leaveTable(): boolean {
    if (!this.currentTableId) {
      return false;
    }
    
    const leaveMessage: LeaveTableMessage = {
      tableId: this.currentTableId
    };
    
    const result = this.sendMessage(SocketMessageType.LEAVE_TABLE, leaveMessage);
    this.currentTableId = null;
    return result;
  }
  
  /**
   * إرسال إجراء اللاعب
   */
  public sendPlayerAction(action: PlayerAction, amount?: number): boolean {
    if (!this.currentTableId) {
      return false;
    }
    
    const actionMessage: PlayerActionMessage = {
      tableId: this.currentTableId,
      action,
      amount
    };
    
    return this.sendMessage(SocketMessageType.PLAYER_ACTION, actionMessage);
  }
  
  /**
   * إرسال رسالة دردشة
   */
  public sendChatMessage(message: string): boolean {
    if (!this.currentTableId) {
      return false;
    }
    
    const chatMessage: ChatMessage = {
      tableId: this.currentTableId,
      message,
      senderName: this.username || undefined
    };
    
    return this.sendMessage(SocketMessageType.CHAT_MESSAGE, chatMessage);
  }
  
  /**
   * معالجة رسالة واردة
   */
  private handleMessage(event: MessageEvent): void {
    try {
      console.log('تم استلام رسالة WebSocket:', event.data);
      
      const message: SocketMessage = JSON.parse(event.data);
      console.log('تم تفسير رسالة واردة:', message);
      
      // معالجة نبضة الخادم
      if (message.type === SocketMessageType.PING) {
        this.handlePing();
        return;
      }
      
      // استدعاء المعالج المناسب إذا وجد
      const handler = this.handlers[message.type];
      
      // تعديل لدعم هياكل البيانات المختلفة من الخادم
      // بعض الخوادم ترسل البيانات كـ message.data وبعضها ترسلها مباشرة
      if (handler) {
        if (message.data) {
          console.log('تنفيذ معالج الرسالة مع البيانات:', message.data);
          handler(message.data);
        } else {
          // إذا لم يكن هناك message.data، نفترض أن البيانات هي الرسالة نفسها بعد حذف حقل type
          const { type, ...data } = message;
          if (Object.keys(data).length > 0) {
            console.log('تنفيذ معالج الرسالة مع البيانات المستخرجة من الرسالة الرئيسية:', data);
            handler(data);
          }
        }
      } else {
        console.warn(`لم يتم العثور على معالج للرسالة من النوع ${message.type}`);
      }
    } catch (error) {
      console.error('خطأ في معالجة رسالة WebSocket:', error);
    }
  }
  
  /**
   * معالجة نبضة من الخادم والرد عليها
   */
  private handlePing(): void {
    this.sendMessage(SocketMessageType.PONG);
  }
  
  /**
   * بدء إرسال نبضات للحفاظ على الاتصال
   */
  private startPingInterval(): void {
    // إيقاف أي مؤقت سابق
    this.stopPingInterval();
    
    // إرسال نبضة كل 30 ثانية
    this.pingInterval = setInterval(() => {
      if (this.isSocketConnected()) {
        this.sendMessage(SocketMessageType.PING);
      }
    }, 30000);
  }
  
  /**
   * إيقاف إرسال النبضات
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * محاولة إعادة الاتصال عند انقطاعه
   */
  private attemptReconnect(): void {
    // إلغاء أي محاولة إعادة اتصال حالية
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // إذا تجاوزنا الحد الأقصى من المحاولات، توقف
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`فشلت ${this.maxReconnectAttempts} محاولات لإعادة الاتصال.`);
      return;
    }
    
    // زيادة عدد المحاولات
    this.reconnectAttempts++;
    
    // جدولة محاولة إعادة اتصال
    console.log(`محاولة إعادة اتصال رقم ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
    this.reconnectTimeout = setTimeout(() => {
      // محاولة إعادة الاتصال بنفس معرفات المستخدم
      if (this.userId && this.username) {
        // نحصل على نفس عنوان URL المستخدم في الاتصال الأصلي
        // لضمان استخدام نفس العنوان في كل من الاتصال الأصلي وإعادة الاتصال
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        
        // استخدم نفس عنوان المضيف الحالي ونفس نقطة النهاية في /ws
        const url = `${protocol}://${host}/ws`;
        console.log('محاولة إعادة الاتصال على العنوان:', url);
        this.connect(url, this.userId, this.username)
          .then(() => {
            console.log('تمت إعادة الاتصال بنجاح');
            
            // إعادة الانضمام للطاولة إذا كان اللاعب في طاولة
            if (this.currentTableId !== null) {
              console.log(`محاولة إعادة الانضمام للطاولة ${this.currentTableId}`);
              // نفترض أن اللاعب يملك رقائق كافية للإنضمام، يمكن تحسين هذه النقطة لاحقاً
              this.joinTable(this.currentTableId, 1000);
            }
          })
          .catch((error) => {
            console.error('فشلت محاولة إعادة الاتصال:', error);
            // جدولة محاولة أخرى
            this.attemptReconnect();
          });
      }
    }, this.reconnectInterval);
  }
}