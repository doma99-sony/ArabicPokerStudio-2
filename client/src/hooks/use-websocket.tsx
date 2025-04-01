import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // للتتبع إذا تم إنهاء اتصال WebSocket وبحاجة لإعادة الاتصال
  const reconnectAttemptRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create WebSocket connection
  // معالجة إضافية لإعادة الاتصال عند تغير حالة الاتصال
  useEffect(() => {
    if (status === "closed" && user && !reconnectAttemptRef.current) {
      console.log("تم اكتشاف انقطاع الاتصال، محاولة إعادة الاتصال فورًا");
      
      // تعيين علم أننا نحاول إعادة الاتصال
      reconnectAttemptRef.current = true;

      // محاولة إعادة الاتصال فورًا
      console.log("إعادة تعيين اتصال WebSocket");
      socketRef.current = null; // سيؤدي إلى تشغيل useEffect للاتصال
      reconnectAttemptRef.current = false;
      
      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
    }
  }, [status, user]);

  // الاتصال الأساسي بـ WebSocket
  useEffect(() => {
    // عدم محاولة الاتصال إذا لم يكن هناك مستخدم
    if (!user) return;
    
    // عدم محاولة الاتصال إذا كان هناك بالفعل اتصال مفتوح
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("اتصال WebSocket مفتوح بالفعل، لا حاجة لإنشاء اتصال جديد");
      return;
    }

    // التنظيف قبل إنشاء اتصال جديد
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Determine the correct host and protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`; // Use the explicit path we set on the server

    console.log(`إنشاء اتصال WebSocket جديد: ${wsUrl}`);
    
    // Create new WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => {
      setStatus("open");
      console.log("WebSocket connection established");
      
      // Authenticate with the server
      if (user) {
        sendMessage({
          type: "auth",
          userId: user.id
        });
      }
    };

    socket.onclose = (event) => {
      setStatus("closed");
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      
      // إعادة الاتصال تلقائيًا فورًا إذا لم يكن الإغلاق طبيعي
      if (event.code !== 1000) { // 1000 = normal closure
        console.log("محاولة إعادة الاتصال فورًا...");
        
        // تعيين العلم بأننا نحاول إعادة الاتصال
        reconnectAttemptRef.current = true;

        // محاولة إعادة الاتصال فورًا بدون تأخير
        console.log("جاري محاولة إعادة الاتصال...");
        
        // إعادة تشغيل useEffect فورًا
        const retry = () => {
          console.log("إعادة محاولة الاتصال");
          if (user) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const wsUrl = `${protocol}//${host}/ws`;
            
            const newSocket = new WebSocket(wsUrl);
            socketRef.current = newSocket;
            setStatus("connecting");
            
            // تكرار كل التعاملات الخاصة بالـ socket
            newSocket.onopen = socket.onopen;
            newSocket.onclose = socket.onclose;
            newSocket.onerror = socket.onerror;
            newSocket.onmessage = socket.onmessage;
          }
        };
        
        retry();
        reconnectAttemptRef.current = false;
      }
    };

    socket.onerror = (error) => {
      setStatus("error");
      console.error("WebSocket error:", error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type } = message;
        
        // Handle standard message types
        if (type === "error") {
          toast({
            title: "خطأ",
            description: message.message,
            variant: "destructive",
          });
        } else if (type === "ping") {
          // تلقي رسالة ping من الخادم، نرسل pong لإبقاء الاتصال حياً
          console.log("تم استلام ping من الخادم، إرسال pong...");
          
          // إرسال رسالة pong
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ 
              type: "pong", 
              timestamp: Date.now() 
            }));
          }
        }
        
        // Call any registered handlers for this message type
        const handler = messageHandlersRef.current.get(type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      console.log("Closing WebSocket connection");
      socket.close();
      socketRef.current = null;
    };
  }, [user, toast]);

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