import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { useGlobalWebSocket, WebSocketMessageType } from "./use-global-websocket";

// الهوك المبسط الذي يستخدم مخزن Zustand المركزي بدلاً من إنشاء اتصالات متعددة
export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // استخدام مخزن Zustand المركزي للـ WebSocket
  const { 
    isConnected, 
    error, 
    connect, 
    sendMessage: globalSendMessage, 
    onMessage: addGlobalMessageListener,
    lastMessage 
  } = useGlobalWebSocket();
  
  // تأكد من وجود اتصال WebSocket عند تحميل المكون
  // مع تعديلات لتحسين الأداء وتجنب الاتصالات المتكررة
  const userIdRef = useRef<number | null>(null);
  
  useEffect(() => {
    // فقط محاولة الاتصال إذا كان هناك مستخدم وتغير معرف المستخدم
    // أو لم يكن هناك اتصال نشط حالياً
    if (user && (!isConnected || user.id !== userIdRef.current)) {
      // تحديث المعرف المرجعي للمستخدم
      userIdRef.current = user.id;
      
      // تأخير قصير لمنع المحاولات المتعددة المتزامنة
      const timer = setTimeout(() => {
        console.log("الاتصال بـ WebSocket عبر المخزن المركزي...");
        connect(user.id);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, isConnected, connect]);

  // إرسال رسالة عبر الاتصال المركزي
  const sendMessage = useCallback((type: string, data: any) => {
    if (!isConnected) {
      console.warn("محاولة إرسال رسالة عندما يكون WebSocket مغلقاً");
      
      // تنبيه المستخدم عند وجود مشكلة في الاتصال
      if (error) {
        toast({
          title: "مشكلة في الاتصال",
          description: "يرجى التأكد من اتصالك بالإنترنت وتحديث الصفحة.",
          variant: "destructive"
        });
      }
      
      return false;
    }
    
    return globalSendMessage({
      type: type as WebSocketMessageType,
      ...data,
      timestamp: Date.now()
    });
  }, [isConnected, error, globalSendMessage, toast]);
  
  // تسجيل معالج رسائل موحد
  const registerMessageHandler = useCallback((type: string, handler: (data: any) => void) => {
    // استخدام المستمع العمومي مع فلترة حسب نوع الرسالة
    return addGlobalMessageListener(type as WebSocketMessageType, handler);
  }, [addGlobalMessageListener]);
  
  // إضافة معالج رسائل عام - يستخدم لاستقبال أي نوع من الرسائل
  const addMessageListener = useCallback((handler: (message: string) => void) => {
    // في هذه الحالة سنترك تنفيذ هذه الوظيفة فارغة لأننا نستخدم نظام المراقبة المركزي
    // إذا كان هناك حاجة لهذه الوظيفة في المستقبل، يمكن تنفيذها من خلال المخزن المركزي
    console.warn("addMessageListener: هذه الطريقة لم تعد ضرورية مع النهج الجديد وتم الاستعاضة عنها بـ registerMessageHandler");
    return () => {}; // نرجع دالة تنظيف فارغة
  }, []);

  // توفير واجهة مشابهة للواجهة السابقة للحفاظ على التوافق مع الشيفرة الموجودة
  return {
    status: isConnected ? "open" : (error ? "error" : "connecting"),
    sendMessage,
    registerMessageHandler,
    addMessageListener,
    isConnected: isConnected,
    reconnect: () => user && connect(user.id),
    lastMessage
  };
}