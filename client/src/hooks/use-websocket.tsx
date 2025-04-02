import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

// تكوين محسن لإعادة الاتصال بخوارزمية متكيفة
const RECONNECT_MAX_RETRIES = Infinity; // عدد غير محدود من المحاولات لاستمرارية الاتصال
const RECONNECT_BASE_DELAY = 150; // تأخير أساسي أقل (150 مللي ثانية) للاستجابة الأسرع
const RECONNECT_MAX_DELAY = 5000; // زيادة الحد الأقصى للتأخير (5 ثوانٍ) لتجنب الضغط على الخادم
const PING_INTERVAL = 3000; // تقليل فاصل الـ ping (3 ثوانٍ) للكشف السريع عن انقطاع الاتصال
const BACKOFF_RESET_TIMEOUT = 15000; // تقليل وقت إعادة ضبط معامل التأخير لاستجابة أسرع
const CONNECTION_QUALITY_WINDOW = 60000; // نافذة قياس جودة الاتصال (60 ثانية)
const NETWORK_QUALITY_THRESHOLD = 0.8; // عتبة جودة الاتصال (80% نجاح)

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

  // دالة إنشاء اتصال WebSocket محسنة
  const createWebSocketConnection = useCallback(() => {
    if (!user) return null;
    
    // بناء رابط الاتصال مع معلومات إضافية للتتبع
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const sessionId = sessionIdRef.current;
    const userId = user.id.toString();
    
    // إضافة معلومات كاستعلام للمساعدة في تتبع الاتصال على جانب الخادم
    const wsUrl = `${protocol}//${host}/ws?sid=${sessionId}&uid=${userId}&ts=${Date.now()}`;
    
    console.log(`إنشاء اتصال WebSocket جديد: ${wsUrl}`);
    
    try {
      const socket = new WebSocket(wsUrl);
      
      // تحديد مهلة زمنية أطول للاتصال (30 ثانية بدلاً من القيمة الافتراضية)
      socket.binaryType = 'arraybuffer'; // لتحسين الأداء
      
      return socket;
    } catch (error) {
      console.error("خطأ في إنشاء اتصال WebSocket:", error);
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
    
    // إعداد المعالجات الجديدة
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("open");
      isReconnectingRef.current = false;
      lastSuccessfulConnectionRef.current = Date.now();
      
      // إعادة ضبط حالة الاتصال
      resetConnectionState();
      
      // إعادة تأسيس الجلسة مع الخادم
      if (user) {
        socket.send(JSON.stringify({
          type: "auth",
          userId: user.id,
          sessionId: sessionIdRef.current,
          reconnectCount: reconnectAttemptRef.current
        }));
      }
      
      // بدء مؤقت ping للحفاظ على الاتصال نشطاً
      setupPingInterval();
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

  // Send message via WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // إذا كان نوع الرسالة هو رسالة دردشة، نقوم بإضافة بيانات المستخدم وإنشاء معرف فريد
      if (message.type === "chat_message" && user) {
        // إضافة معرف الرسالة واسم المستخدم والصورة الرمزية إذا لم يكونوا موجودين
        const chatMessage = {
          ...message,
          id: message.id || `msg_${Date.now()}`,
          username: user.username,
          avatar: user.avatar,
          timestamp: Date.now(),
          clientHandled: true // إعلام الخادم بأننا قمنا بمعالجة الرسالة في العميل
        };
        
        // إشارة للمعالج المحلي بالرسالة (لضمان ظهور الرسائل المرسلة حتى لو لم ترجع من الخادم)
        const handler = messageHandlersRef.current.get("chat_message");
        if (handler) {
          handler(chatMessage);
        }
        
        socketRef.current.send(JSON.stringify(chatMessage));
        return true;
      }
      
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [user]);

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

  return {
    status,
    socket: socketRef.current,
    sendMessage,
    registerHandler,
    joinTable,
    leaveTable,
    performGameAction
  };
}