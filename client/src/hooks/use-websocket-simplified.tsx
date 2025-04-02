import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

// نهج جديد مبسط للاتصال - إصدار مبسط وفعال للحد من مشاكل الاتصال
// هذا النهج المبسط يتجنب التعقيدات الزائدة ويركز على الموثوقية

interface GlobalStore {
  connection: WebSocket | null;
  messageHandlers: Map<string, (data: any) => void>;
  ready: boolean;
  userId?: number;
}

// تخزين عالمي للاتصال - يتجاوز دورة حياة المكونات
const globalStore: GlobalStore = {
  connection: null,
  messageHandlers: new Map(),
  ready: false,
};

// الإعدادات الأساسية - تم تبسيطها للحد الأدنى
const PING_INTERVAL = 5000; // 5 ثوان
const RECONNECT_INTERVAL = 1000; // 1 ثانية
const MAX_RECONNECT_ATTEMPTS = 15;

// إنشاء معرف جلسة فريد
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// الهوك الرئيسي - استخدام WebSocket المبسط
export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const socketRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>(generateSessionId());
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<any>(null);
  const pingTimerRef = useRef<any>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // إنشاء اتصال WebSocket - بسيط وواضح
  const createConnection = useCallback(() => {
    // لا يمكن إنشاء اتصال بدون مستخدم
    if (!user) return;
    
    // استخدام الاتصال الحالي إذا كان مفتوحاً
    if (globalStore.connection && globalStore.connection.readyState === WebSocket.OPEN) {
      socketRef.current = globalStore.connection;
      return;
    }
    
    // تنظيف أي اتصال قديم
    if (socketRef.current) {
      try {
        socketRef.current.onopen = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.onmessage = null;
        socketRef.current.close();
      } catch (err) {
        console.error("خطأ عند إغلاق الاتصال القديم:", err);
      }
    }
    
    // إنشاء عنوان WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?sid=${sessionIdRef.current}&uid=${user.id}&ts=${Date.now()}`;
    
    // محاولة إنشاء اتصال
    try {
      console.log(`إنشاء اتصال WebSocket جديد: ${wsUrl}`);
      setStatus("connecting");
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // إعداد المعالجات
      socket.onopen = () => {
        console.log("تم فتح اتصال WebSocket بنجاح");
        setStatus("open");
        globalStore.connection = socket;
        globalStore.ready = true;
        reconnectAttemptsRef.current = 0;
        
        // إرسال رسالة المصادقة
        socket.send(JSON.stringify({
          type: "auth",
          userId: user.id,
          sessionId: sessionIdRef.current,
          timestamp: Date.now()
        }));
        
        // بدء نبضات Ping
        startPinging();
      };
      
      socket.onclose = (event) => {
        console.log(`تم إغلاق اتصال WebSocket. الرمز: ${event.code}، السبب: ${event.reason || 'لا يوجد سبب'}`);
        setStatus("closed");
        globalStore.ready = false;
        globalStore.connection = null;
        
        // إعادة الاتصال تلقائياً
        scheduleReconnect();
      };
      
      socket.onerror = (error) => {
        console.error("خطأ في اتصال WebSocket:", error);
        setStatus("error");
      };
      
      socket.onmessage = (event) => {
        handleMessage(event);
      };
      
    } catch (error) {
      console.error("فشل إنشاء اتصال WebSocket:", error);
      setStatus("error");
      scheduleReconnect();
    }
  }, [user]);
  
  // جدولة إعادة الاتصال
  const scheduleReconnect = useCallback(() => {
    // تنظيف أي مؤقت سابق
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    
    // زيادة عدد محاولات إعادة الاتصال
    reconnectAttemptsRef.current++;
    
    // التحقق من عدد المحاولات
    if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
      console.log(`جدولة إعادة الاتصال (المحاولة ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      // تأخير تزايدي مع حد أقصى
      const delay = Math.min(RECONNECT_INTERVAL * Math.pow(1.5, Math.min(reconnectAttemptsRef.current, 10)), 10000);
      
      reconnectTimerRef.current = setTimeout(() => {
        console.log(`محاولة إعادة الاتصال رقم ${reconnectAttemptsRef.current}...`);
        createConnection();
      }, delay);
    } else {
      console.error("تم الوصول للحد الأقصى من محاولات إعادة الاتصال. يرجى تحديث الصفحة.");
      toast({
        title: "انقطع الاتصال",
        description: "تعذر إعادة الاتصال بعد عدة محاولات. يرجى تحديث الصفحة.",
        variant: "destructive"
      });
    }
  }, [createConnection, toast]);
  
  // بدء نبضات ping
  const startPinging = useCallback(() => {
    // تنظيف أي مؤقت سابق
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
    }
    
    // إنشاء مؤقت جديد
    pingTimerRef.current = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({
            type: "client_ping",
            timestamp: Date.now(),
            sessionId: sessionIdRef.current
          }));
        } catch (err) {
          console.warn("خطأ عند إرسال ping:", err);
        }
      }
    }, PING_INTERVAL);
  }, []);
  
  // معالجة الرسائل الواردة
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // معالجة ping/pong خاصة
      if (data.type === "server_pong") {
        return; // تم استلام pong بنجاح
      }
      
      // البحث عن معالج للنوع - نستخدم فقط معالج واحد لمنع ازدواجية المعالجة
      // إذا كان هناك معالج محلي نستخدمه، وإلا نبحث عن معالج عالمي
      const handler = messageHandlersRef.current.get(data.type);
      if (handler) {
        handler(data);
      } else {
        // البحث في المعالجات العالمية فقط إذا لم يكن هناك معالج محلي
        const globalHandler = globalStore.messageHandlers.get(data.type);
        if (globalHandler) {
          globalHandler(data);
        }
      }
      
    } catch (err) {
      console.error("خطأ في معالجة رسالة WebSocket:", err, event.data);
    }
  }, []);
  
  // إرسال رسالة
  const sendMessage = useCallback((type: string, data: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("محاولة إرسال رسالة عندما يكون WebSocket مغلقاً");
      return false;
    }
    
    try {
      const message = {
        type,
        ...data,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current
      };
      
      socketRef.current.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error("خطأ عند إرسال رسالة:", err);
      return false;
    }
  }, []);
  
  // تسجيل معالج رسائل - تم إصلاحه لمنع الازدواجية
  const registerMessageHandler = useCallback((type: string, handler: (data: any) => void) => {
    // نضيف المعالج محلياً فقط إذا كان المكون الحالي نشطاً
    messageHandlersRef.current.set(type, handler);
    
    // إذا لم يكن هناك معالج عالمي لهذا النوع، نضيفه
    // هذا يمنع الازدواجية في معالجة الرسائل
    if (!globalStore.messageHandlers.has(type)) {
      globalStore.messageHandlers.set(type, handler);
    }
    
    return () => {
      // إزالة المعالج المحلي
      messageHandlersRef.current.delete(type);
      
      // إزالة المعالج العالمي فقط إذا كان هو نفس المعالج المحلي
      if (globalStore.messageHandlers.get(type) === handler) {
        globalStore.messageHandlers.delete(type);
      }
    };
  }, []);
  
  // إعداد الاتصال والتنظيف
  useEffect(() => {
    if (user) {
      // تأخير قصير قبل الاتصال في النهج الجديد
      const connectTimer = setTimeout(() => {
        createConnection();
      }, 100);
      
      return () => {
        clearTimeout(connectTimer);
        
        // تنظيف المؤقتات
        if (pingTimerRef.current) {
          clearInterval(pingTimerRef.current);
        }
        
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
      };
    }
  }, [user, createConnection]);
  
  // توفير الواجهة العامة
  return {
    status,
    sendMessage,
    registerMessageHandler,
    isConnected: status === "open",
    reconnect: createConnection
  };
}