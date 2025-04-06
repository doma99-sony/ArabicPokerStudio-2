/**
 * مدير اتصال WebSocket للعبة صاروخ مصر
 * =====================
 * هذا الملف يوفر واجهة منفصلة للتعامل مع اتصال WebSocket مخصص للعبة صاروخ مصر،
 * ومنفصل تماماً عن اتصال WebSocket العام للتطبيق.
 */

// تعريف أنواع البيانات
export interface Player {
  id: number;
  username: string;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number | null;
}

export interface GameHistory {
  id: number;
  multiplier: number;
  crashed_at: string;
}

export interface GameState {
  status: 'waiting' | 'flying' | 'crashed';
  countdown: number;
  currentMultiplier: number | null;
  crashPoint?: number;
  players: Player[];
  gameHistory: GameHistory[];
}

// الحالة الافتراضية للعبة
export const initialGameState: GameState = {
  status: 'waiting',
  countdown: 10,
  currentMultiplier: null,
  players: [],
  gameHistory: []
};

// نوع الرسائل المستلمة من الخادم
type ServerMessage = {
  type: string;
  [key: string]: any;
};

// نوع رسائل العميل
type ClientMessage = {
  type: string;
  [key: string]: any;
};

// تعريف دوال الاستجابة
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
export type MessageHandler = (message: ServerMessage) => void;
export type StatusHandler = (status: ConnectionStatus, error?: string) => void;

class EgyptRocketWebSocket {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: MessageHandler[] = [];
  private statusHandlers: StatusHandler[] = [];
  private lastState: GameState = { ...initialGameState };
  private isActive: boolean = false;

  constructor() {
    // إنشاء معرف فريد للاتصال
    const uniqueId = Math.floor(Math.random() * 1000000);
    
    // استخدام النمط "//" لجعل البروتوكول يتوافق مع الصفحة (ws أو wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws/egypt-rocket?client=${uniqueId}`;
    
    // سجل بدء التشغيل
    console.log(`تم إنشاء كائن WebSocket لصاروخ مصر - المعرف: ${uniqueId}`);
  }

  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('اتصال WebSocket موجود بالفعل لصاروخ مصر');
      return;
    }

    // تعيين العلم النشط
    this.isActive = true;

    // التحقق من حالة خادم بايثون أولاً
    console.log(`التحقق من حالة خادم صاروخ مصر...`);
    
    this.notifyStatusChange('connecting');
    
    fetch('/api/egypt-rocket/status')
      .then(response => {
        if (!response.ok) {
          throw new Error("خادم صاروخ مصر غير متاح");
        }
        return response.json();
      })
      .then(data => {
        if (!data.running) {
          throw new Error("خادم صاروخ مصر غير نشط");
        }

        console.log(`محاولة الاتصال بخادم صاروخ مصر: ${this.url}`);
        
        try {
          this.socket = new WebSocket(this.url);
          
          this.socket.onopen = this.handleOpen.bind(this);
          this.socket.onclose = this.handleClose.bind(this);
          this.socket.onmessage = this.handleMessage.bind(this);
          this.socket.onerror = this.handleError.bind(this);
        } catch (error) {
          console.error('خطأ في إنشاء اتصال WebSocket:', error);
          this.attemptReconnect();
        }
      })
      .catch(error => {
        console.error('خطأ في التحقق من حالة خادم صاروخ مصر:', error);
        this.notifyStatusChange('error', error.message);
        this.attemptReconnect();
      });
  }

  public disconnect(): void {
    this.isActive = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      // إزالة كل معالجات الأحداث لمنع تسرب الذاكرة
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      
      // إغلاق الاتصال إذا كان مفتوحاً
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
      
      this.socket = null;
    }
    
    console.log('تم قطع اتصال WebSocket لصاروخ مصر');
    this.notifyStatusChange('disconnected');
  }

  // إرسال رسالة إلى الخادم
  public send(message: ClientMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('لا يمكن إرسال الرسالة: WebSocket غير متصل');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('خطأ في إرسال رسالة WebSocket:', error);
      return false;
    }
  }

  // وضع رهان
  public placeBet(amount: number, autoCashout: number | null = null): boolean {
    return this.send({
      type: "place_bet",
      amount,
      autoCashout
    });
  }

  // سحب الأموال
  public cashout(): boolean {
    return this.send({
      type: "cashout"
    });
  }

  // تسجيل دالة استماع للرسائل
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    
    // إرجاع دالة لإلغاء الاستماع
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // تسجيل دالة استماع لحالة الاتصال
  public onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.push(handler);
    
    // إرجاع دالة لإلغاء الاستماع
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  // الحصول على حالة اللعبة الحالية
  public getState(): GameState {
    return this.lastState;
  }

  // معالجة فتح الاتصال
  private handleOpen(): void {
    console.log('تم فتح اتصال WebSocket لصاروخ مصر بنجاح');
    this.reconnectAttempts = 0;
    this.notifyStatusChange('connected');
  }

  // معالجة إغلاق الاتصال
  private handleClose(event: CloseEvent): void {
    if (event.wasClean) {
      console.log(`تم إغلاق اتصال WebSocket لصاروخ مصر بشكل نظيف: الكود=${event.code}, السبب=${event.reason || 'غير محدد'}`);
    } else {
      console.warn('تم قطع اتصال WebSocket لصاروخ مصر بشكل غير متوقع');
    }
    
    this.socket = null;
    this.notifyStatusChange('disconnected');
    
    // إعادة الاتصال فقط إذا كان الكائن لا يزال نشطًا
    if (this.isActive) {
      this.attemptReconnect();
    }
  }

  // معالجة الرسائل الواردة
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as ServerMessage;
      
      // تحديث حالة اللعبة بناءً على نوع الرسالة
      if (message.type === "game_state" && message.state) {
        this.lastState = message.state;
      } else if (message.type === "countdown") {
        this.lastState = { 
          ...this.lastState, 
          countdown: message.seconds, 
          status: 'waiting' 
        };
      } else if (message.type === "game_start") {
        this.lastState = { 
          ...this.lastState, 
          status: 'flying', 
          currentMultiplier: 1, 
          countdown: 0 
        };
      } else if (message.type === "multiplier_update") {
        this.lastState = { 
          ...this.lastState, 
          currentMultiplier: message.multiplier 
        };
      } else if (message.type === "game_crash") {
        this.lastState = { 
          ...this.lastState, 
          status: 'crashed', 
          crashPoint: message.crashPoint,
          currentMultiplier: message.crashPoint
        };
      } else if (message.type === "players_update") {
        this.lastState = { 
          ...this.lastState, 
          players: message.players 
        };
      } else if (message.type === "history_update") {
        this.lastState = { 
          ...this.lastState, 
          gameHistory: message.history 
        };
      }
      
      // إخطار كل المستمعين بالرسالة
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('خطأ في معالج رسائل WebSocket:', error);
        }
      });
    } catch (error) {
      console.error('خطأ في معالجة رسالة WebSocket:', error);
    }
  }

  // معالجة الأخطاء
  private handleError(event: Event): void {
    console.error('خطأ في اتصال WebSocket لصاروخ مصر:', event);
    this.notifyStatusChange('error', 'حدث خطأ في اتصال WebSocket');
  }

  // محاولة إعادة الاتصال
  private attemptReconnect(): void {
    if (!this.isActive) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`فشل في الاتصال بعد ${this.maxReconnectAttempts} محاولات`);
      this.notifyStatusChange('error', `فشل في الاتصال بعد ${this.maxReconnectAttempts} محاولات`);
      return;
    }
    
    this.reconnectAttempts++;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    console.log(`محاولة إعادة الاتصال بخادم صاروخ مصر بعد ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.isActive) {
        this.connect();
      }
    }, delay);
  }

  // إخطار المستمعين بتغير حالة الاتصال
  private notifyStatusChange(status: ConnectionStatus, error?: string): void {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status, error);
      } catch (e) {
        console.error('خطأ في معالج حالة WebSocket:', e);
      }
    });
  }
}

// إنشاء مثيل واحد للاستخدام في جميع أنحاء التطبيق
export const egyptRocketSocket = new EgyptRocketWebSocket();

export default egyptRocketSocket;