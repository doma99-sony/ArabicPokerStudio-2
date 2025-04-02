import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

// تكوين إعادة الاتصال - محسن
const RECONNECT_MAX_RETRIES = Infinity; // عدد غير محدود من المحاولات - لضمان استمرار الاتصال دائماً
const RECONNECT_BASE_DELAY = 200; // تأخير أساسي أقل (200 مللي ثانية) للاستجابة السريعة
const RECONNECT_MAX_DELAY = 2000; // الحد الأقصى للتأخير 2 ثوانٍ للاستجابة السريعة
const PING_INTERVAL = 5000; // إرسال ping كل 5 ثوانٍ لضمان استمرار الاتصال
const BACKOFF_RESET_TIMEOUT = 30000; // إعادة ضبط معامل التأخير المتزايد بعد 30 ثانية من الاتصال الناجح

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
  }>({
    lastMessageTime: 0,
    lastPingTime: 0,
    lastPongTime: 0,
    missedPings: 0
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
  const resetConnectionState = useCallback(() => {
    const now = Date.now();
    connectionStateRef.current = {
      lastMessageTime: now,
      lastPingTime: now,
      lastPongTime: now,
      missedPings: 0
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
  }, []);

  // دالة إعادة الاتصال مع استراتيجية تأخير متزايد - محسنة
  const reconnect = useCallback(() => {
    // إذا كانت هناك محاولة إعادة اتصال جارية بالفعل، لا نبدأ واحدة جديدة
    if (isReconnectingRef.current) return;
    
    // تسجيل الوقت لحساب زمن الانقطاع الكلي
    if (reconnectAttemptRef.current === 0) {
      console.log("بدء محاولات إعادة الاتصال");
    }
    
    isReconnectingRef.current = true;
    reconnectAttemptRef.current++;
    
    // حساب الوقت للمحاولة التالية (مع تأخير متزايد ولكن مع حد أقصى)
    // إضافة jitter (عشوائية) لتجنب "thundering herd problem"
    const jitter = Math.random() * 0.3 - 0.15; // ±15% عشوائية
    const baseDelay = RECONNECT_BASE_DELAY * Math.min(Math.pow(1.5, Math.min(reconnectAttemptRef.current, 10)), RECONNECT_MAX_DELAY / RECONNECT_BASE_DELAY);
    const delay = Math.min(baseDelay * (1 + jitter), RECONNECT_MAX_DELAY);
    
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
        setTimeout(() => {
          reconnect();
        }, RECONNECT_BASE_DELAY);
      }
      
      reconnectTimeoutRef.current = null;
    }, delay);
  }, [createWebSocketConnection, setupSocketHandlers]);

  // إعداد معالجات الأحداث للـ WebSocket
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
    
    socket.onclose = (event) => {
      const closeTime = new Date().toLocaleTimeString();
      console.log(`WebSocket connection closed at ${closeTime}. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      setStatus("closed");
      clearAllTimers();
      
      // إذا لم يكن الإغلاق طبيعياً وليس يدوياً، نحاول إعادة الاتصال
      if (event.code !== 1000 && !isManualCloseRef.current) {
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
    
    socket.onerror = (error) => {
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
    
    socket.onmessage = (event) => {
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
  }, [user, toast, setupPingInterval, reconnect, clearAllTimers, resetConnectionState]);

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