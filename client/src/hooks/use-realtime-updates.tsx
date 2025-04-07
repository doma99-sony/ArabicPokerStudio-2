import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

// نوع حالة الاتصال
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// نوع الرسالة الواردة
interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

// نوع مستمع الرسائل
type MessageListener = (message: RealtimeMessage) => void;

// واجهة هوك التحديثات الفورية
interface UseRealtimeUpdatesReturn {
  status: ConnectionStatus;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  addMessageListener: (type: string, listener: MessageListener) => void;
  removeMessageListener: (type: string, listener: MessageListener) => void;
  send: (message: any) => void;
}

/**
 * هوك لإدارة اتصالات WebSocket مع خادم التحديثات الفورية
 */
export function useRealtimeUpdates(): UseRealtimeUpdatesReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // حالة الاتصال
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  
  // مراجع للحالة الداخلية
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<MessageListener>>>(new Map());
  const reconnectCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // إعادة الاتصال مع تأخير تصاعدي
  const reconnect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // حساب وقت الانتظار بناءً على عدد المحاولات السابقة (exponential backoff)
    const delay = Math.min(1000 * Math.pow(1.5, reconnectCountRef.current), 30000);
    
    timeoutRef.current = setTimeout(() => {
      console.log(`محاولة إعادة الاتصال رقم ${reconnectCountRef.current + 1}...`);
      connect();
    }, delay);
  }, []);
  
  // دالة إضافة مستمع للرسائل
  const addMessageListener = useCallback((type: string, listener: MessageListener) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    
    listenersRef.current.get(type)?.add(listener);
  }, []);
  
  // دالة إزالة مستمع للرسائل
  const removeMessageListener = useCallback((type: string, listener: MessageListener) => {
    const listeners = listenersRef.current.get(type);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        listenersRef.current.delete(type);
      }
    }
  }, []);
  
  // دالة معالجة الرسائل الواردة
  const handleMessage = useCallback((message: RealtimeMessage) => {
    const { type } = message;
    
    // إذا لم يكن هناك نوع محدد، لا يمكن معالجة الرسالة
    if (!type) {
      console.warn('تم استلام رسالة بدون نوع محدد:', message);
      return;
    }
    
    // تسجيل استلام الرسالة للتصحيح
    console.log(`استلام رسالة من النوع ${type}:`, message);
    
    // استدعاء المستمعين المسجلين لهذا النوع من الرسائل
    const listeners = listenersRef.current.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(message);
        } catch (err) {
          console.error(`خطأ في معالجة رسالة من النوع "${type}":`, err);
        }
      });
    }
    
    // معالجة بعض أنواع الرسائل بشكل افتراضي
    switch (type) {
      case 'chips_update':
        if (message.user && message.user.chips) {
          // تحديث رصيد المستخدم في واجهة المستخدم
          console.log(`تم تحديث رصيد المستخدم: ${message.user.chips}`);
          
          // عرض إشعار للمستخدم
          toast({
            title: "تم تحديث الرصيد",
            description: message.message || `تم تحديث رصيدك إلى ${message.user.chips}`,
          });
        }
        break;
      
      case 'game_update':
        // إشعارات تحديثات اللعبة
        if (message.message) {
          toast({
            title: "تحديث اللعبة",
            description: message.message,
          });
        }
        break;
        
      case 'error':
        // عرض رسالة الخطأ
        toast({
          title: "خطأ",
          description: message.message || "حدث خطأ غير معروف",
          variant: "destructive"
        });
        break;
        
      case 'pong':
        // استجابة نبض الحياة، لا حاجة للإشعار
        console.log('تم استلام استجابة نبض الحياة من الخادم');
        break;
        
      case 'connection_established':
        // تم إنشاء الاتصال
        console.log('تم تأكيد الاتصال بخادم التحديثات الفورية');
        break;
        
      default:
        console.log(`استلام رسالة غير معالجة من النوع ${type}`);
        break;
    }
  }, [toast]);
  
  // دالة إرسال رسالة
  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('محاولة إرسال رسالة ولكن الاتصال غير مفتوح:', message);
    }
  }, []);
  
  // دالة الاتصال بالخادم
  const connect = useCallback(() => {
    // يجب أن يكون المستخدم مسجل دخوله
    if (!user || !user.id) {
      console.log('لا يمكن الاتصال بخادم التحديثات الفورية: المستخدم غير مسجل دخوله');
      return;
    }
    
    // إغلاق أي اتصال سابق
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (err) {
        // تجاهل أي أخطاء أثناء الإغلاق
      }
    }
    
    setStatus('connecting');
    
    // إنشاء اتصال WebSocket جديد
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = 3005; // منفذ خادم FastAPI المحدث
      
      console.log(`محاولة الاتصال بـ WebSocket على العنوان: ${protocol}//${host}:${port}/ws/${user.id}`);
      const wsUrl = `${protocol}//${host}:${port}/ws/${user.id}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('تم فتح اتصال التحديثات الفورية');
        setStatus('connected');
        setError(null);
        reconnectCountRef.current = 0;
        
        // إرسال رسالة ping دورية للحفاظ على الاتصال
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000); // كل 30 ثانية
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('رسالة واردة من خادم التحديثات:', message);
          handleMessage(message);
        } catch (err) {
          console.error('خطأ في معالجة رسالة واردة:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log(`تم إغلاق اتصال التحديثات الفورية: ${event.code} ${event.reason}`);
        setStatus('disconnected');
        
        // إعادة الاتصال تلقائيًا إلا إذا كان الإغلاق متعمدًا
        if (event.code !== 1000) {
          reconnectCountRef.current++;
          reconnect();
        }
      };
      
      ws.onerror = (event) => {
        console.error('خطأ في اتصال التحديثات الفورية:', event);
        setStatus('error');
        setError(new Error('حدث خطأ في الاتصال بخادم التحديثات الفورية'));
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('خطأ في إنشاء اتصال WebSocket:', err);
      setStatus('error');
      setError(err instanceof Error ? err : new Error('حدث خطأ في إنشاء اتصال WebSocket'));
      
      // محاولة إعادة الاتصال
      reconnectCountRef.current++;
      reconnect();
    }
  }, [user, handleMessage, reconnect]);
  
  // دالة قطع الاتصال
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'تم إغلاق الاتصال عمداً');
      } catch (err) {
        console.error('خطأ أثناء إغلاق اتصال WebSocket:', err);
      }
      
      wsRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setStatus('disconnected');
  }, []);
  
  // الاتصال عند تحميل المكون إذا كان المستخدم مسجل دخوله
  useEffect(() => {
    if (user && user.id) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);
  
  return {
    status,
    error,
    connect,
    disconnect,
    addMessageListener,
    removeMessageListener,
    send
  };
}

/**
 * مكون مزود التحديثات الفورية
 */
import { createContext, useContext, ReactNode } from 'react';

interface RealtimeUpdatesContextType {
  status: ConnectionStatus;
  error: Error | null;
  addMessageListener: (type: string, listener: MessageListener) => void;
  removeMessageListener: (type: string, listener: MessageListener) => void;
  send: (message: any) => void;
}

const RealtimeUpdatesContext = createContext<RealtimeUpdatesContextType | null>(null);

export function RealtimeUpdatesProvider({ children }: { children: ReactNode }) {
  const realtimeUpdates = useRealtimeUpdates();
  
  return (
    <RealtimeUpdatesContext.Provider value={realtimeUpdates}>
      {children}
    </RealtimeUpdatesContext.Provider>
  );
}

export function useRealtimeUpdatesContext() {
  const context = useContext(RealtimeUpdatesContext);
  if (!context) {
    throw new Error('useRealtimeUpdatesContext يجب استخدامه داخل RealtimeUpdatesProvider');
  }
  return context;
}