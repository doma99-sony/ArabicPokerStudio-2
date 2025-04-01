import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

// تكوين إعادة الاتصال
const RECONNECT_MAX_RETRIES = 100; // عدد أكبر جداً للمحاولات - لضمان استمرار الاتصال دائماً
const RECONNECT_BASE_DELAY = 500; // تأخير أساسي 500 مللي ثانية
const RECONNECT_MAX_DELAY = 3000; // الحد الأقصى للتأخير 3 ثوانٍ
const PING_INTERVAL = 10000; // إرسال ping كل 10 ثوانٍ

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // مراجع لإدارة إعادة الاتصال
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnectingRef = useRef<boolean>(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isManualCloseRef = useRef<boolean>(false);

  // دالة مساعدة لإيقاف جميع المؤقتات
  const clearAllTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // دالة إنشاء اتصال WebSocket
  const createWebSocketConnection = useCallback(() => {
    if (!user) return null;
    
    // بناء رابط الاتصال
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    
    console.log(`إنشاء اتصال WebSocket جديد: ${wsUrl}`);
    
    try {
      return new WebSocket(wsUrl);
    } catch (error) {
      console.error("خطأ في إنشاء اتصال WebSocket:", error);
      return null;
    }
  }, [user]);

  // دالة ping دورية للتأكد من استمرار الاتصال
  const setupPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ 
            type: "client_ping", 
            timestamp: Date.now() 
          }));
        } catch (err) {
          console.warn("خطأ في إرسال ping:", err);
          // لا نغلق الاتصال هنا، بل نترك آلية الخطأ العادية تتعامل معه
        }
      }
    }, PING_INTERVAL);
    
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, []);

  // دالة إعادة الاتصال مع استراتيجية تأخير متزايد
  const reconnect = useCallback(() => {
    // إذا كانت هناك محاولة إعادة اتصال جارية بالفعل، لا نبدأ واحدة جديدة
    if (isReconnectingRef.current) return;
    
    isReconnectingRef.current = true;
    reconnectAttemptRef.current++;
    
    // حساب الوقت للمحاولة التالية (مع تأخير متزايد ولكن مع حد أقصى)
    // استخدام min للتأكد من أن التأخير لا يتجاوز الحد الأقصى
    // استخدام jitter (عشوائية) لتجنب "thundering herd problem"
    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(1.5, Math.min(reconnectAttemptRef.current, 10)) + 
      Math.random() * 100, 
      RECONNECT_MAX_DELAY
    );
    
    console.log(`محاولة إعادة الاتصال رقم ${reconnectAttemptRef.current} بعد ${delay}ms`);
    
    // إلغاء أي مؤقت سابق
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      // تنظيف أي اتصال موجود
      if (socketRef.current) {
        socketRef.current.close();
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
        isReconnectingRef.current = false;
        reconnect();
      }
    }, delay);
  }, [createWebSocketConnection]);

  // إعداد معالجات الأحداث للـ WebSocket
  const setupSocketHandlers = useCallback((socket: WebSocket) => {
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setStatus("open");
      isReconnectingRef.current = false;
      reconnectAttemptRef.current = 0; // إعادة ضبط عداد محاولات إعادة الاتصال
      
      // إعادة تأسيس الجلسة مع الخادم
      if (user) {
        socket.send(JSON.stringify({
          type: "auth",
          userId: user.id
        }));
      }
      
      // بدء مؤقت ping للحفاظ على الاتصال نشطاً
      setupPingInterval();
    };
    
    socket.onclose = (event) => {
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
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
      
      // التشجيع على محاولة إعادة الاتصال في حالة الخطأ
      // لا حاجة للتصرف هنا، سيتم التعامل معه في onclose
    };
    
    socket.onmessage = (event) => {
      try {
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
              timestamp: Date.now() 
            }));
          }
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
  }, [user, toast, setupPingInterval, reconnect, clearAllTimers]);

  // إعداد اتصال الـ WebSocket الأساسي
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
    if (socketRef.current) {
      isManualCloseRef.current = true; // تعيين علامة الإغلاق اليدوي
      socketRef.current.close();
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
        isManualCloseRef.current = true; // تعيين علامة الإغلاق اليدوي
        socketRef.current.close();
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