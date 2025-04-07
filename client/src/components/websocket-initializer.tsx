import { useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { useLocation } from "wouter";

/**
 * مكون لبدء وإدارة اتصال WebSocket المركزي
 * يقوم هذا المكون بإنشاء الاتصال وضمان استمراريته في جميع أنحاء التطبيق
 */
export function WebSocketInitializer() {
  const { user } = useAuth();
  const ws = useGlobalWebSocket();
  const [location] = useLocation();
  
  // وظيفة لإنشاء الاتصال واستعادته
  const ensureConnection = useCallback(() => {
    // محاولة استعادة معرف المستخدم من التخزين المحلي
    const storedUserId = localStorage.getItem('userId');
    
    if (user?.id) {
      // لدينا معلومات المستخدم، قم بالاتصال باستخدام معرف المستخدم الحالي
      if (!ws.isConnected) {
        console.log(`بدء اتصال WebSocket للمستخدم ${user.id}`);
        // استخدام WebSocket الداخلي في Node.js بدلاً من Python WebSocket
        ws.connect(user.id);
      }
    } else if (storedUserId) {
      // ليس لدينا معلومات المستخدم، ولكن وجدنا معرف مستخدم مخزن
      const userId = parseInt(storedUserId);
      if (!ws.isConnected) {
        console.log(`بدء اتصال WebSocket باستخدام معرف المستخدم المخزن ${userId}`);
        ws.connect(userId);
      }
    }
  }, [user, ws]);
  
  // بدء اتصال WebSocket عند تحميل التطبيق
  useEffect(() => {
    ensureConnection();
    
    // فحص دوري للتأكد من استمرارية الاتصال
    const intervalId = setInterval(() => {
      if (!ws.isConnected && (user?.id || localStorage.getItem('userId'))) {
        console.log('إعادة التأكد من اتصال WebSocket');
        ensureConnection();
      }
    }, 10000); // كل 10 ثوانٍ
    
    // ليست هناك حاجة لتنظيف الاتصال عند فك المكون
    // لأننا نريد الحفاظ على الاتصال حتى عند تغيير الصفحات
    return () => {
      clearInterval(intervalId);
    };
  }, [user, ws, ensureConnection]);
  
  // عند تغيير الصفحة، تأكد من أن الاتصال لا يزال قائماً
  useEffect(() => {
    console.log(`تغيير الصفحة إلى: ${location}، التأكد من اتصال WebSocket`);
    ensureConnection();
  }, [location, ensureConnection]);
  
  // للإشارة إلى حالة الاتصال (يمكن استخدامها لعرض مؤشر حالة الاتصال)
  useEffect(() => {
    if (ws.isConnected) {
      console.log('WebSocket متصل: نعم');
    } else {
      console.log('WebSocket متصل: لا');
    }
  }, [ws.isConnected]);
  
  // هذا المكون لا يعرض شيئاً، فهو فقط للمنطق
  return null;
}

export default WebSocketInitializer;