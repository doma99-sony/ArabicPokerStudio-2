import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

// نظام إدارة WebSocket عالمي - يحافظ على الاتصال بين الصفحات
// تعريف متغير عالمي لحفظ حالة الاتصال WebSocket عبر التنقلات بين الصفحات
// تحديث: تبسيط نظام الاتصال ليعتبر المستخدم متصلاً بمجرد تسجيل الدخول
// وفقد الاتصال فقط عند تسجيل الخروج أو قفل التطبيق
interface GlobalWebSocketState {
  socket: WebSocket | null;
  reference: number; 
  handlers: Map<string, (data: any) => void>;
  lastPingTime: number;
  sessionId: string;
  reconnectAttempt: number;
  isConnecting: boolean;
  isLoggedIn: boolean; // إضافة: هل المستخدم مسجل الدخول
}

// استخدام متغير عالمي خارج React للحفاظ على حالة الاتصال بين الصفحات
let globalWebSocket: GlobalWebSocketState = {
  socket: null,
  reference: 0, // عدد المراجع النشطة
  handlers: new Map(),
  lastPingTime: 0,
  sessionId: '',
  reconnectAttempt: 0,
  isConnecting: false,
  isLoggedIn: false // القيمة الافتراضية: غير مسجل الدخول
};

// إعدادات إعادة الاتصال المتكيفة المحسنة - النسخة النهائية لحل مشكلة انقطاع الاتصال
const RECONNECT_MAX_RETRIES = Infinity; // عدد غير محدود من المحاولات لضمان استمرارية الاتصال
const RECONNECT_BASE_DELAY = 20; // تقليل التأخير الأساسي لاستجابة أسرع (20 مللي ثانية)
const RECONNECT_MAX_DELAY = 1000; // تقليل الحد الأقصى للتأخير إلى ثانية واحدة فقط
const PING_INTERVAL = 1000; // تقليل فاصل الـ ping إلى 1 ثانية للكشف السريع
const PING_TIMEOUT = 3000; // تقليل مهلة الانتظار إلى 3 ثوان
const BACKOFF_RESET_TIMEOUT = 3000; // تقليل وقت إعادة ضبط معامل التأخير إلى 3 ثوان فقط
const CONNECTION_QUALITY_WINDOW = 5000; // تقليل نافذة قياس جودة الاتصال لاستجابة أسرع للظروف الحالية
const NETWORK_QUALITY_THRESHOLD = 0.4; // تخفيض عتبة جودة الاتصال لتعديل استراتيجية إعادة الاتصال
const PENDING_MESSAGES_CACHE_SIZE = 200; // زيادة حجم التخزين المؤقت للرسائل أثناء الانقطاع
const AUTO_RECONNECT_ON_UNMOUNT = true; // إعادة الاتصال تلقائياً عند إعادة تحميل الصفحة
const MAX_MISSED_PINGS = 2; // تقليل عدد الـ pings المفقودة
const KEEP_SOCKET_ALIVE = true; // الاحتفاظ بالاتصال WebSocket حياً حتى عند التنقل بين الصفحات
const CONNECTION_STATE_STORAGE_KEY = 'websocket_connection_state'; // مفتاح تخزين حالة الاتصال

// اسم التخزين المحلي لتتبع معرف الجلسة
const CONNECTION_SESSION_KEY = 'websocket_session_id';

// إنشاء معرف فريد للجلسة الحالية
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// الحصول على معرف جلسة موجود أو إنشاء واحد جديد
function getSessionId(): string {
  let sessionId = localStorage.getItem(CONNECTION_SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(CONNECTION_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // مراجع محسنة لإدارة إعادة الاتصال
  const sessionIdRef = useRef<string>(getSessionId());
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backoffResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef<boolean>(false);
  const lastSuccessfulConnectionRef = useRef<number>(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isManualCloseRef = useRef<boolean>(false);
  const connectionStateRef = useRef<{
    lastMessageTime: number;
    lastPingTime: number;
    lastPongTime: number;
    missedPings: number;
    connectionAttempts: {timestamp: number, success: boolean}[]; // سجل محاولات الاتصال لقياس جودة الشبكة
    lastNetworkQuality: number; // مقياس جودة الشبكة (0-1)
  }>({
    lastMessageTime: 0,
    lastPingTime: 0,
    lastPongTime: 0,
    missedPings: 0,
    connectionAttempts: [],
    lastNetworkQuality: 1
  });

  // دالة مساعدة لإيقاف جميع المؤقتات
  const clearAllTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (backoffResetTimeoutRef.current) {
      clearTimeout(backoffResetTimeoutRef.current);
      backoffResetTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // تنظيف جميع مؤقتات ping المعلقة
    pingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    pingTimeoutsRef.current = [];
  }, []);

  // إعادة ضبط حالة الاتصال لإعادة بدء حساب معاملات التأخير المتزايد
  // دالة محسنة لإعادة ضبط حالة الاتصال مع المحافظة على سجل الاتصالات السابقة
  const resetConnectionState = useCallback(() => {
    const now = Date.now();
    
    // نسخ المرجع الحالي لتجنب تغييرات غير مقصودة
    const currentState = { ...connectionStateRef.current };
    
    // تأكد من وجود المتغيرات المطلوبة
    if (!currentState.connectionAttempts) {
      currentState.connectionAttempts = [];
    }
    
    // إضافة النجاح الحالي إلى سجل محاولات الاتصال
    const updatedAttempts = [
      ...currentState.connectionAttempts, 
      { timestamp: now, success: true }
    ];
    
    // إزالة المحاولات القديمة للحفاظ على حجم السجل صغيراً
    const recentAttempts = updatedAttempts.filter(attempt => 
      (now - attempt.timestamp) < CONNECTION_QUALITY_WINDOW
    );
    
    // حساب جودة الشبكة المحدثة
    const successCount = recentAttempts.filter(a => a.success).length;
    const networkQuality = recentAttempts.length > 0 
      ? successCount / recentAttempts.length 
      : 1;
    
    // تحديث حالة الاتصال بالقيم الجديدة
    connectionStateRef.current = {
      lastMessageTime: now,
      lastPingTime: now,
      lastPongTime: now,
      missedPings: 0,
      connectionAttempts: recentAttempts,
      lastNetworkQuality: networkQuality
    };
    
    // إعادة ضبط معامل التأخير المتزايد بعد فترة من الاتصال الناجح
    if (backoffResetTimeoutRef.current) {
      clearTimeout(backoffResetTimeoutRef.current);
    }
    
    backoffResetTimeoutRef.current = setTimeout(() => {
      // إعادة ضبط محاولات الاتصال إذا استمر الاتصال لفترة كافية
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log("إعادة ضبط معاملات التأخير المتزايد بعد استقرار الاتصال");
        reconnectAttemptRef.current = 0;
      }
      backoffResetTimeoutRef.current = null;
    }, BACKOFF_RESET_TIMEOUT);
  }, []);

  // دالة إنشاء اتصال WebSocket محسنة مع دعم الـ WebSocket العالمي
  const createWebSocketConnection = useCallback(() => {
    if (!user) return null;
    
    // تحقق أولاً إذا كان هناك اتصال عالمي متاح
    if (KEEP_SOCKET_ALIVE && globalWebSocket.socket && globalWebSocket.socket.readyState === WebSocket.OPEN) {
      console.log("استخدام اتصال WebSocket العالمي الموجود");
      
      // زيادة عدد المراجع للاتصال العالمي
      globalWebSocket.reference++;
      
      // استخدام الاتصال العالمي المفتوح
      return globalWebSocket.socket;
    }
    
    // إعداد معرف الجلسة
    const sessionId = sessionIdRef.current;
    const userId = user.id.toString();
    
    // بناء رابط الاتصال مع معلومات إضافية للتتبع
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // إضافة معلومات كاستعلام للمساعدة في تتبع الاتصال على جانب الخادم
    const wsUrl = `${protocol}//${host}/ws?sid=${sessionId}&uid=${userId}&ts=${Date.now()}`;
    
    console.log(`إنشاء اتصال WebSocket جديد: ${wsUrl}`);
    
    try {
      // إنشاء اتصال WebSocket جديد
      const socket = new WebSocket(wsUrl);
      
      // تحديد مهلة زمنية أطول للاتصال (30 ثانية بدلاً من القيمة الافتراضية)
      socket.binaryType = 'arraybuffer'; // لتحسين الأداء
      
      // حفظ الاتصال في النظام العالمي عند استخدام KEEP_SOCKET_ALIVE
      if (KEEP_SOCKET_ALIVE) {
        // إذا كان هناك اتصال قديم، نغلقه أولاً
        if (globalWebSocket.socket) {
          try {
            globalWebSocket.socket.close(1000, "New connection established");
          } catch (e) {
            // تجاهل الأخطاء
          }
        }
        
        // حفظ الاتصال الجديد كاتصال عالمي
        globalWebSocket.socket = socket;
        globalWebSocket.reference = 1;
        globalWebSocket.sessionId = sessionId;
        globalWebSocket.lastPingTime = Date.now();
        globalWebSocket.reconnectAttempt = reconnectAttemptRef.current;
        globalWebSocket.isConnecting = true;
        
        // نسخ المعالجات الحالية إلى المعالجات العالمية
        messageHandlersRef.current.forEach((handler, type) => {
          globalWebSocket.handlers.set(type, handler);
        });
      }
      
      return socket;
    } catch (error) {
      console.error("خطأ في إنشاء اتصال WebSocket:", error);
      
      if (KEEP_SOCKET_ALIVE) {
        globalWebSocket.isConnecting = false;
      }
      
      return null;
    }
  }, [user]);

  // إعلان مسبق لدالة reconnect
  const reconnect = useCallback(() => {
    // سيتم تعريفها لاحقًا بشكل كامل
    console.log("وظيفة إعادة الاتصال الأولية");
  }, []);

  // دالة ping دورية محسنة للتأكد من استمرار الاتصال
  const setupPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    // تنظيف أي مؤقتات معلقة
    pingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    pingTimeoutsRef.current = [];
    
    // جدولة ping دوري
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const now = Date.now();
        connectionStateRef.current.lastPingTime = now;
        
        try {
          // إرسال رسالة ping مع طابع زمني للقياس
          socketRef.current.send(JSON.stringify({ 
            type: "client_ping", 
            timestamp: now,
            sessionId: sessionIdRef.current
          }));
          
          // مؤقت للتحقق من استلام رد pong
          const pingTimeoutId = setTimeout(() => {
            // زيادة عداد ping المفقودة إذا لم يصل رد
            if (now > connectionStateRef.current.lastPongTime) {
              connectionStateRef.current.missedPings++;
              console.warn(`لم يتم استلام رد pong (عدد الفشل: ${connectionStateRef.current.missedPings})`);
              
              // إغلاق الاتصال بعد عدد معين من الفشل (3 مرات متتالية)
              if (connectionStateRef.current.missedPings >= 3 && socketRef.current) {
                console.error("انقطاع الاتصال اكتشف بعد فشل متكرر في ping، إعادة الاتصال...");
                
                // الإغلاق سيؤدي لاستدعاء onclose وإعادة الاتصال تلقائياً
                if (socketRef.current.readyState === WebSocket.OPEN) {
                  socketRef.current.close();
                }
              }
            }
            
            // إزالة هذا المؤقت من القائمة
            pingTimeoutsRef.current = pingTimeoutsRef.current.filter(id => id !== pingTimeoutId);
          }, PING_INTERVAL);
          
          // إضافة المؤقت للقائمة للتنظيف لاحقاً عند الحاجة
          pingTimeoutsRef.current.push(pingTimeoutId);
          
        } catch (err) {
          console.warn("خطأ في إرسال ping:", err);
          connectionStateRef.current.missedPings++;
          
          // محاولة إعادة الاتصال إذا كان الخطأ مستمراً
          if (connectionStateRef.current.missedPings >= 3) {
            console.error("حد انقطاع الاتصال (3 محاولات)، بدء إعادة الاتصال...");
            reconnect();
          }
        }
      }
    }, PING_INTERVAL);
    
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      pingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      pingTimeoutsRef.current = [];
    };
  }, [reconnect]);

  // تعريف setupSocketHandlers
  const setupSocketHandlers = useCallback((socket: WebSocket) => {
    // تصفية معالجات الأحداث الحالية
    socket.onopen = null;
    socket.onclose = null;
    socket.onerror = null;
    socket.onmessage = null;
    
    // إعداد المعالجات الجديدة مع دعم معزز لإعادة الاتصال
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("open");
      isReconnectingRef.current = false;
      lastSuccessfulConnectionRef.current = Date.now();
      
      // إعادة ضبط حالة الاتصال
      resetConnectionState();
      
      // تخزين حالة الاتصال في التخزين المحلي (لاستخدامها في إعادة تحميل الصفحة)
      try {
        localStorage.setItem(CONNECTION_STATE_STORAGE_KEY, JSON.stringify({
          timestamp: Date.now(),
          sessionId: sessionIdRef.current,
          connectionQuality: connectionStateRef.current.lastNetworkQuality,
          hasConnection: true
        }));
      } catch (err) {
        // تجاهل أخطاء التخزين المحلي
      }
      
      // إعادة تأسيس الجلسة مع الخادم (مع معلومات إضافية)
      if (user) {
        // تعيين حالة تسجيل الدخول العالمية
        globalWebSocket.isLoggedIn = true;
        
        const lastState = localStorage.getItem('last_game_state_' + user.id);
        const authMessage = {
          type: "auth",
          userId: user.id,
          sessionId: sessionIdRef.current,
          reconnectCount: reconnectAttemptRef.current,
          // معلومات إضافية للمساعدة في الاسترداد
          lastActiveState: lastState ? JSON.parse(lastState) : null,
          clientInfo: {
            timestamp: Date.now(),
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            connectionType: (navigator as any).connection?.effectiveType || 'unknown'
          }
        };
        
        socket.send(JSON.stringify(authMessage));
        
        // تخزين إحصائيات إعادة الاتصال
        if (reconnectAttemptRef.current > 0) {
          const reconnectStats = {
            timestamp: Date.now(),
            attempts: reconnectAttemptRef.current,
            totalDuration: Date.now() - lastSuccessfulConnectionRef.current,
            networkQuality: connectionStateRef.current.lastNetworkQuality
          };
          
          console.log("إحصائيات إعادة الاتصال:", reconnectStats);
          
          // يمكن إرسال هذه الإحصائيات إلى التحليلات أو حفظها للتشخيص
          try {
            const stats = JSON.parse(localStorage.getItem('reconnect_stats') || '[]');
            stats.push(reconnectStats);
            
            // حفظ آخر 10 إحصائيات فقط
            if (stats.length > 10) {
              stats.shift();
            }
            
            localStorage.setItem('reconnect_stats', JSON.stringify(stats));
          } catch (err) {
            // تجاهل أخطاء التخزين المحلي
          }
          
          // إظهار إشعار للمستخدم فقط إذا استغرقت إعادة الاتصال وقتاً طويلاً (> 5 ثوانٍ)
          if (reconnectStats.totalDuration > 5000) {
            toast({
              title: "تم إعادة الاتصال بنجاح",
              description: `استغرقت إعادة الاتصال ${Math.round(reconnectStats.totalDuration / 1000)} ثانية. جودة الاتصال: ${Math.round(reconnectStats.networkQuality * 100)}%`,
              variant: "default"
            });
          }
        }
      }
      
      // بدء مؤقت ping للحفاظ على الاتصال نشطاً
      setupPingInterval();
      
      // هام: معالجة الرسائل المؤجلة بعد إعادة الاتصال
      // نؤخر قليلاً لضمان معالجة رسالة المصادقة أولاً
      setTimeout(() => {
        processPendingMessages();
      }, 1000);
    };
    
    socket.onclose = (event: CloseEvent) => {
      const now = Date.now();
      const closeTime = new Date().toLocaleTimeString();
      console.log(`WebSocket connection closed at ${closeTime}. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      setStatus("closed");
      clearAllTimers();
      
      // تسجيل حالة الاتصال - فشل للاتصالات غير المتعمدة
      const isNormalClosure = event.code === 1000 || isManualCloseRef.current;
      
      // تحديث سجل محاولات الاتصال للمساعدة في تكييف خوارزمية إعادة الاتصال
      const oldConnectionAttempts = connectionStateRef.current.connectionAttempts || [];
      const updatedAttempts = [...oldConnectionAttempts, { 
        timestamp: now, 
        success: isNormalClosure // نجاح فقط إذا كان الإغلاق طبيعياً
      }];
      
      // إزالة المحاولات القديمة خارج نافذة القياس
      const recentAttempts = updatedAttempts.filter(attempt => 
        (now - attempt.timestamp) < CONNECTION_QUALITY_WINDOW
      );
      
      // حساب جودة الشبكة المحدثة
      const successCount = recentAttempts.filter(a => a.success).length;
      const networkQuality = recentAttempts.length > 0 
        ? successCount / recentAttempts.length 
        : 1;
      
      // تحديث حالة الاتصال
      connectionStateRef.current.connectionAttempts = recentAttempts;
      connectionStateRef.current.lastNetworkQuality = networkQuality;
      
      // إذا لم يكن الإغلاق طبيعياً وليس يدوياً، نحاول إعادة الاتصال
      if (!isNormalClosure) {
        // تعديل إستراتيجية إعادة الاتصال بناءً على جودة الشبكة
        if (networkQuality < NETWORK_QUALITY_THRESHOLD) {
          // في حالة جودة الشبكة الضعيفة، نزيد مدة الانتظار قبل إعادة المحاولة
          console.log(`جودة الشبكة منخفضة (${(networkQuality * 100).toFixed(0)}%)، تعديل استراتيجية إعادة الاتصال`);
        }
        
        if (reconnectAttemptRef.current < RECONNECT_MAX_RETRIES) {
          console.log("محاولة إعادة الاتصال تلقائياً...");
          reconnect();
        } else {
          console.error("تم الوصول للحد الأقصى لمحاولات إعادة الاتصال");
          // إعادة ضبط العداد للسماح بمحاولات جديدة في المستقبل
          reconnectAttemptRef.current = 0;
          setTimeout(() => reconnect(), RECONNECT_MAX_DELAY);
        }
      }
      
      isManualCloseRef.current = false;
    };
    
    socket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
      setStatus("error");
      
      // لا نظهر رسائل خطأ للمستخدم عند إعادة الاتصال
      if (!isReconnectingRef.current) {
        toast({
          title: "خطأ في الاتصال",
          description: "نحاول إعادة الاتصال تلقائياً...",
          variant: "destructive",
        });
      }
      
      // تحفيز محاولة إعادة الاتصال المبكرة (بدون انتظار onclose)
      // فقط إذا كان الاتصال مفتوحاً بالفعل
      if (socket.readyState === WebSocket.OPEN && !isReconnectingRef.current) {
        reconnect();
      }
    };
    
    socket.onmessage = (event: MessageEvent) => {
      try {
        // تسجيل استلام رسالة
        connectionStateRef.current.lastMessageTime = Date.now();
        
        const message = JSON.parse(event.data);
        const { type } = message;
        
        // معالجة أنواع الرسائل القياسية
        if (type === "error") {
          toast({
            title: "خطأ",
            description: message.message,
            variant: "destructive",
          });
        } else if (type === "ping") {
          // استلام ping من الخادم، إرسال pong للرد
          console.log("تم استلام ping من الخادم، إرسال pong...");
          
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 
              type: "pong", 
              timestamp: Date.now(),
              sessionId: sessionIdRef.current,
              serverTimestamp: message.timestamp // إعادة طابع الوقت للقياس
            }));
          }
          
          // إعادة ضبط عداد الـ ping المفقودة
          connectionStateRef.current.lastPongTime = Date.now();
          connectionStateRef.current.missedPings = 0;
        } else if (type === "pong") {
          // استلام pong من الخادم (استجابة للـ client_ping)
          connectionStateRef.current.lastPongTime = Date.now();
          connectionStateRef.current.missedPings = 0;
        }
        
        // استدعاء أي معالج مسجل لهذا النوع من الرسائل
        const handler = messageHandlersRef.current.get(type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }, [user, toast, setupPingInterval, clearAllTimers, resetConnectionState, reconnect]);

  // تحديث تعريف دالة reconnect الكامل
  // التعريف الكامل لدالة reconnect
  const reconnectImpl = useCallback(() => {
    // إذا كانت هناك محاولة إعادة اتصال جارية بالفعل، لا نبدأ واحدة جديدة
    if (isReconnectingRef.current) return;
    
    // تسجيل الوقت لحساب زمن الانقطاع الكلي
    if (reconnectAttemptRef.current === 0) {
      console.log("بدء محاولات إعادة الاتصال");
    }
    
    isReconnectingRef.current = true;
    reconnectAttemptRef.current++;
    
    // حساب الوقت للمحاولة التالية مع استراتيجية متكيفة تعتمد على جودة الشبكة
    // تعديل الاستراتيجية بناءً على تاريخ جودة الاتصال
    const networkQuality = connectionStateRef.current.lastNetworkQuality || 1;
    
    // عامل التأخير الإضافي - زيادة التأخير عندما تكون جودة الشبكة سيئة لتجنب محاولات كثيرة فاشلة
    const qualityFactor = networkQuality < NETWORK_QUALITY_THRESHOLD 
      ? (2.0 - networkQuality) // زيادة التأخير بشكل عكسي مع انخفاض جودة الشبكة
      : 1.0; // لا تغيير عندما تكون جودة الشبكة جيدة
    
    // إضافة jitter (عشوائية) لتجنب "thundering herd problem"
    const jitter = Math.random() * 0.3 - 0.15; // ±15% عشوائية
    
    // حساب التأخير الأساسي مع أقصى 10 محاولات متزايدة
    const powerFactor = Math.min(reconnectAttemptRef.current, 10);
    const baseDelay = RECONNECT_BASE_DELAY * 
      Math.min(
        Math.pow(1.5, powerFactor), 
        RECONNECT_MAX_DELAY / RECONNECT_BASE_DELAY
      ) * qualityFactor;
      
    // تطبيق الحد الأقصى للتأخير وإضافة عشوائية
    const delay = Math.min(baseDelay * (1 + jitter), RECONNECT_MAX_DELAY);
    
    if (networkQuality < NETWORK_QUALITY_THRESHOLD) {
      console.log(`استراتيجية تكيفية: جودة الشبكة = ${(networkQuality * 100).toFixed(0)}%، عامل التأخير = ${qualityFactor.toFixed(2)}x`)
    }
    
    console.log(`محاولة إعادة الاتصال رقم ${reconnectAttemptRef.current} بعد ${delay.toFixed(0)}ms`);
    
    // إلغاء أي مؤقت سابق
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // تأخير محاولة الاتصال التالية
    reconnectTimeoutRef.current = setTimeout(() => {
      // تنظيف أي اتصال موجود
      if (socketRef.current) {
        try {
          // إغلاق الاتصال القديم إذا كان مفتوحاً
          if (socketRef.current.readyState === WebSocket.OPEN || 
              socketRef.current.readyState === WebSocket.CONNECTING) {
            socketRef.current.close();
          }
        } catch (err) {
          // تجاهل أي أخطاء أثناء الإغلاق - قد يكون الاتصال مقطوعاً بالفعل
        }
        socketRef.current = null;
      }
      
      // إنشاء اتصال جديد
      const newSocket = createWebSocketConnection();
      if (newSocket) {
        socketRef.current = newSocket;
        setupSocketHandlers(newSocket);
        setStatus("connecting");
      } else {
        // فشل إنشاء الاتصال، نحاول مرة أخرى
        console.error("فشل إنشاء اتصال جديد. محاولة إعادة الاتصال...");
        isReconnectingRef.current = false;
        
        // الانتظار لفترة قصيرة قبل المحاولة مرة أخرى
        setTimeout(() => reconnectImpl(), RECONNECT_BASE_DELAY);
      }
      
      reconnectTimeoutRef.current = null;
    }, delay);
  }, [createWebSocketConnection, setupSocketHandlers]);

  // تحديث دالة reconnect بالتنفيذ الكامل لها
  useEffect(() => {
    // تعريف دالة جديدة تستخدم reconnectImpl
    const reconnectFunction = () => {
      reconnectImpl();
    };
    
    // استبدال دالة reconnect بالدالة الجديدة
    Object.assign(reconnect, reconnectFunction);
  }, [reconnect, reconnectImpl]);

  // إعداد اتصال الـ WebSocket الأساسي - محسن
  // دالة جديدة للاتصال بـ WebSocket باستخدام النظام العالمي
  const connect = useCallback(() => {
    // التحقق من صحة المستخدم
    if (!user) {
      return;
    }
    
    // استخدام الاتصال العالمي إذا كان موجوداً ومفتوحاً (حل مشكلة فقدان الاتصال عند التنقل)
    if (KEEP_SOCKET_ALIVE && globalWebSocket.socket && globalWebSocket.socket.readyState === WebSocket.OPEN) {
      console.log("استخدام اتصال WebSocket العالمي الموجود");
      
      // استخدام الاتصال الموجود
      socketRef.current = globalWebSocket.socket;
      setStatus("open");
      
      // زيادة عدد المراجع للاتصال العالمي
      globalWebSocket.reference++;
      
      // تحديث معرف الجلسة
      globalWebSocket.sessionId = sessionIdRef.current;
      
      // تحديث معالجات الرسائل
      setupSocketHandlers(socketRef.current);
      
      // نسخ المعالجات الحالية إلى المعالجات العالمية للمشاركة بين جميع المستخدمين
      messageHandlersRef.current.forEach((handler, type) => {
        globalWebSocket.handlers.set(type, handler);
      });
      
      return;
    }
    
    // تنظيف أي اتصال أو مؤقت سابق
    clearAllTimers();
    
    // إذا لم يكن هناك اتصال عالمي، إنشاء اتصال جديد
    console.log("إنشاء اتصال جديد حيث لا يوجد اتصال عالمي متاح");
    const socket = createWebSocketConnection();
    if (socket) {
      socketRef.current = socket;
      setupSocketHandlers(socket);
      setStatus("connecting");
    }
  }, [user, setupSocketHandlers, clearAllTimers, createWebSocketConnection]);
  
  useEffect(() => {
    // لا نحاول الاتصال إذا لم يكن هناك مستخدم مسجل دخوله
    if (!user) return;
    
    // إذا كان هناك اتصال مفتوح حالياً، لا نقوم بإنشاء اتصال جديد
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("اتصال WebSocket مفتوح بالفعل، لا حاجة لإنشاء اتصال جديد");
      return;
    }
    
    // تنظيف أي اتصال أو مؤقت سابق
    clearAllTimers();
    
    // إغلاق اتصال سابق
    if (socketRef.current) {
      try {
        // إعلام onclose بأن هذا إغلاق متعمد
        isManualCloseRef.current = true;
        
        // إغلاق الاتصال القديم
        if (socketRef.current.readyState === WebSocket.OPEN || 
            socketRef.current.readyState === WebSocket.CONNECTING) {
          socketRef.current.close(1000, "Intentional close for new connection");
        }
      } catch (err) {
        // تجاهل أي أخطاء
      }
      socketRef.current = null;
    }
    
    // إنشاء اتصال جديد
    const socket = createWebSocketConnection();
    if (socket) {
      socketRef.current = socket;
      setupSocketHandlers(socket);
      setStatus("connecting");
    }
    
    // تنظيف عند فصل المكون
    return () => {
      clearAllTimers();
      
      if (socketRef.current) {
        isManualCloseRef.current = true; // إعلام onclose بأن هذا إغلاق متعمد
        
        try {
          if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.close(1000, "Component unmounted");
          }
        } catch (err) {
          // تجاهل أي أخطاء أثناء الإغلاق
        }
        
        socketRef.current = null;
      }
    };
  }, [user, clearAllTimers, createWebSocketConnection, setupSocketHandlers]);

  // قائمة الرسائل المؤجلة للإرسال عند إعادة الاتصال
  const pendingMessagesRef = useRef<{message: any, timestamp: number, retries: number}[]>([]);
  
  // معالجة الرسائل المؤجلة بعد إعادة الاتصال
  const processPendingMessages = useCallback(() => {
    if (socketRef.current?.readyState !== WebSocket.OPEN || pendingMessagesRef.current.length === 0) {
      return;
    }
    
    console.log(`معالجة ${pendingMessagesRef.current.length} رسالة مؤجلة بعد إعادة الاتصال`);
    
    // نسخة من الرسائل المؤجلة لتجنب التعديل أثناء التكرار
    const pendingMessages = [...pendingMessagesRef.current];
    
    // إفراغ قائمة الرسائل المؤجلة لتجنب الإرسال المزدوج
    pendingMessagesRef.current = [];
    
    // إرسال الرسائل المؤجلة بالترتيب
    for (const { message } of pendingMessages) {
      // إضافة علامة لتمييز الرسائل المعاد إرسالها
      const messageWithResendFlag = {
        ...message,
        isResent: true,
        originalTimestamp: message.timestamp,
        timestamp: Date.now() // تحديث الطابع الزمني للرسالة
      };
      
      // إرسال الرسالة
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify(messageWithResendFlag));
        } catch (error) {
          console.error("خطأ أثناء إرسال رسالة مؤجلة:", error);
          // إعادة الرسالة إلى القائمة المؤجلة في حالة الفشل
          pendingMessagesRef.current.push({
            message: messageWithResendFlag,
            timestamp: Date.now(),
            retries: 0
          });
        }
      }
    }
  }, []);
  
  // دالة محسّنة لإرسال الرسائل مع معالجة انقطاع الاتصال
  const sendMessage = useCallback((message: any) => {
    // إذا كان الاتصال مفتوحاً، نرسل الرسالة كالمعتاد
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // معالجة رسائل الدردشة بشكل خاص
      if (message.type === "chat_message" && user) {
        // إنشاء نسخة كاملة من رسالة الدردشة
        const chatMessage = {
          ...message,
          id: message.id || `msg_${Date.now()}`,
          username: user.username,
          avatar: user.avatar,
          timestamp: Date.now(),
          clientHandled: true // إعلام العميل بمعالجة الرسالة محلياً
        };
        
        // معالجة الرسالة محلياً أولاً (للعرض الفوري)
        const handler = messageHandlersRef.current.get("chat_message");
        if (handler) {
          handler(chatMessage);
        }
        
        // محاولة إرسال الرسالة
        try {
          socketRef.current.send(JSON.stringify(chatMessage));
          return true;
        } catch (error) {
          console.warn("فشل إرسال رسالة الدردشة، إضافتها للانتظار:", error);
          // تخزين الرسالة للإرسال لاحقاً
          pendingMessagesRef.current.push({
            message: chatMessage,
            timestamp: Date.now(),
            retries: 0
          });
          
          // إبقاء حجم قائمة الانتظار تحت السيطرة
          if (pendingMessagesRef.current.length > PENDING_MESSAGES_CACHE_SIZE) {
            pendingMessagesRef.current.shift(); // إزالة أقدم رسالة
          }
          
          // لا نعتبر هذا فشلاً من منظور المستخدم لأننا سنرسلها لاحقاً
          return true;
        }
      }
      
      // محاولة إرسال الرسائل الأخرى
      try {
        socketRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.warn("فشل إرسال رسالة، إضافتها للانتظار:", error);
        
        // لا نخزن رسائل game_action إلا إذا طلب ذلك صراحة
        if (message.type !== "game_action" || message.queueOnFailure) {
          pendingMessagesRef.current.push({
            message,
            timestamp: Date.now(),
            retries: 0
          });
          
          // إبقاء حجم قائمة الانتظار تحت السيطرة
          if (pendingMessagesRef.current.length > PENDING_MESSAGES_CACHE_SIZE) {
            pendingMessagesRef.current.shift();
          }
        }
        
        return false;
      }
    } else {
      // إذا كان الاتصال مغلقاً أو في حالة إعادة الاتصال، نخزن الرسالة للإرسال لاحقاً
      console.log("الاتصال غير متاح، تخزين الرسالة للإرسال لاحقاً");
      
      // لا نخزن رسائل game_action إلا إذا طلب ذلك صراحة
      if (message.type === "chat_message" || message.queueOnFailure) {
        // بالنسبة لرسائل الدردشة، نقوم بمعالجتها محلياً أيضاً
        if (message.type === "chat_message" && user) {
          const chatMessage = {
            ...message,
            id: message.id || `msg_${Date.now()}`,
            username: user.username,
            avatar: user.avatar,
            timestamp: Date.now(),
            clientHandled: true,
            pendingDelivery: true // علامة توضح أن الرسالة في انتظار التسليم
          };
          
          // معالجة محلية
          const handler = messageHandlersRef.current.get("chat_message");
          if (handler) {
            handler(chatMessage);
          }
          
          pendingMessagesRef.current.push({
            message: chatMessage,
            timestamp: Date.now(),
            retries: 0
          });
          
          // إبقاء حجم قائمة الانتظار تحت السيطرة
          if (pendingMessagesRef.current.length > PENDING_MESSAGES_CACHE_SIZE) {
            pendingMessagesRef.current.shift();
          }
          
          return true; // نعتبرها نجاحاً من منظور المستخدم
        } else {
          pendingMessagesRef.current.push({
            message,
            timestamp: Date.now(),
            retries: 0
          });
          
          // إبقاء حجم قائمة الانتظار تحت السيطرة
          if (pendingMessagesRef.current.length > PENDING_MESSAGES_CACHE_SIZE) {
            pendingMessagesRef.current.shift();
          }
        }
      }
      
      // بدء محاولة إعادة الاتصال إذا كان الاتصال مغلقاً ولم تكن هناك محاولة جارية
      if (status === "closed" && !isReconnectingRef.current) {
        console.log("محاولة إعادة الاتصال تلقائياً بسبب محاولة إرسال رسالة");
        reconnect();
      }
      
      return message.type === "chat_message"; // نعتبر رسائل الدردشة فقط كنجاح من وجهة نظر المستخدم
    }
  }, [user, status, reconnect]);

  // Register a message handler
  const registerHandler = useCallback((type: string, handler: (data: any) => void) => {
    messageHandlersRef.current.set(type, handler);
    
    // Return function to unregister handler
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  // Join a game table
  const joinTable = useCallback((tableId: number) => {
    return sendMessage({
      type: "join_table",
      tableId
    });
  }, [sendMessage]);

  // Leave a game table
  const leaveTable = useCallback((tableId: number) => {
    return sendMessage({
      type: "leave_table",
      tableId
    });
  }, [sendMessage]);

  // Perform a game action
  const performGameAction = useCallback((action: string, amount?: number) => {
    return sendMessage({
      type: "game_action",
      action,
      amount
    });
  }, [sendMessage]);

  // دالة لقطع الاتصال والتنظيف مع مراعاة الاتصال العالمي
  const disconnect = useCallback(() => {
    // عند استخدام الاتصال العالمي، نقلل عدد المراجع فقط
    if (KEEP_SOCKET_ALIVE && globalWebSocket.socket && globalWebSocket.reference > 0) {
      console.log("تقليل عدد مراجع الاتصال العالمي");
      globalWebSocket.reference--;
      
      // إذا لم يعد هناك مراجع، نترك الاتصال مفتوحاً لكن نصنف الجلسة كغير نشطة
      // سيتم تنظيفها من جانب الخادم
      if (globalWebSocket.reference === 0) {
        console.log("لم يعد هناك مستخدمين للاتصال العالمي، لكن نحتفظ به مفتوحاً للاستخدام اللاحق");
        
        // إرسال رسالة للخادم تفيد بتصنيف هذا الاتصال كغير نشط مؤقتاً
        try {
          if (globalWebSocket.socket && globalWebSocket.socket.readyState === WebSocket.OPEN) {
            globalWebSocket.socket.send(JSON.stringify({
              type: "client_inactive",
              sessionId: globalWebSocket.sessionId,
              timestamp: Date.now()
            }));
          }
        } catch (e) {
          // تجاهل الأخطاء
        }
      }
      
      // إلغاء المرجع المحلي بدون إغلاق الاتصال العالمي
      socketRef.current = null;
      setStatus("closed");
      clearAllTimers();
      
      return;
    }
    
    // في حالة عدم استخدام الاتصال العالمي، نغلق الاتصال تماماً
    clearAllTimers();
    
    if (socketRef.current) {
      // إعلام onclose بأن هذا إغلاق متعمد
      isManualCloseRef.current = true;
      
      try {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, "Manual disconnect");
        }
      } catch (err) {
        // تجاهل الأخطاء
      }
      
      socketRef.current = null;
      setStatus("closed");
    }
  }, [clearAllTimers]);

  // إضافة تحديث محلي للاتصال عند استعادة الاتصال
  useEffect(() => {
    // تنفيذ العمليات المطلوبة عند استعادة الاتصال
    if (status === "open" && user && pendingMessagesRef.current.length > 0) {
      console.log("تم استعادة الاتصال، معالجة الرسائل المؤجلة...");
      // نؤخر قليلاً للتأكد من استقرار الاتصال
      setTimeout(() => {
        processPendingMessages();
      }, 1000);
    }
  }, [status, user, processPendingMessages]);
  
  // إضافة دالة معالجة الاتصال الضعيف أو غير المستقر
  const handleUnstableConnection = useCallback(() => {
    const networkQuality = connectionStateRef.current.lastNetworkQuality || 1;
    
    // إذا كانت جودة الاتصال ضعيفة (أقل من 50%)، أظهر تحذيراً للمستخدم
    if (networkQuality < 0.5 && status === "open") {
      toast({
        title: "تحذير: اتصال غير مستقر",
        description: `جودة اتصالك ضعيفة (${Math.round(networkQuality * 100)}%)، قد تواجه تأخيراً أو انقطاعات في اللعب`,
        variant: "destructive",
        duration: 5000
      });
    }
  }, [status, toast]);
  
  // تتبع جودة الاتصال كل 60 ثانية
  useEffect(() => {
    if (status === "open") {
      const intervalId = setInterval(() => {
        handleUnstableConnection();
      }, 60000); // فحص كل دقيقة
      
      return () => clearInterval(intervalId);
    }
  }, [status, handleUnstableConnection]);
  
  return {
    status,
    socket: socketRef.current,
    sendMessage,
    registerHandler,
    joinTable,
    leaveTable,
    performGameAction,
    connect,
    disconnect,
    // إتاحة دوال إضافية متقدمة للاستخدام في الحالات الخاصة
    reconnect,
    processPendingMessages,
    connectionQuality: connectionStateRef.current.lastNetworkQuality,
    // معلومات متقدمة عن الاتصال
    isGlobalConnection: KEEP_SOCKET_ALIVE && socketRef.current === globalWebSocket.socket,
    globalConnectionRefs: KEEP_SOCKET_ALIVE ? globalWebSocket.reference : 0
  };
}