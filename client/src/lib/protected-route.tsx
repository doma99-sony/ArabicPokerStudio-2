import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { redirectToHome } from "@/components/navigation/home-redirect";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: (props: any) => React.JSX.Element;
}) {
  const { user, isLoading, loginGuestMutation } = useAuth();
  const [location] = useLocation();
  const { connect, isConnected } = useGlobalWebSocket();
  
  // حفظ المسار الحالي في حال الانتقال إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (!user && !isLoading && location !== "/auth") {
      localStorage.setItem("redirectAfterLogin", location);
      
      // تم تعطيل تسجيل الدخول التلقائي كضيف لمنع حلقة التكرار
      // وتوجيه المستخدم للتفاعل المباشر مع واجهة تسجيل الدخول
    }
  }, [user, isLoading, location]);
  
  // ضمان استمرارية اتصال WebSocket بعد تسجيل الدخول وفي كل الصفحات المحمية
  useEffect(() => {
    if (user && user.id && !isConnected) {
      console.log(`إنشاء/إعادة اتصال WebSocket للمستخدم ${user.id} في الصفحة المحمية: ${path}`);
      connect(user.id);
    }
  }, [user, isConnected, connect, path]);
  
  // عرض حالة التحميل
  if (isLoading || loginGuestMutation.isPending) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37] mb-4" />
          {loginGuestMutation.isPending && (
            <p className="text-[#D4AF37]">جاري تسجيل الدخول كضيف...</p>
          )}
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => {
        if (!user) {
          console.log("مستخدم غير موجود، إعادة توجيه إلى المصادقة...");
          
          // تخزين المسار الحالي للعودة إليه بعد تسجيل الدخول
          const currentLocation = window.location.pathname;
          if (currentLocation !== "/auth") {
            localStorage.setItem("redirectAfterLogin", currentLocation);
            console.log(`تم تخزين مسار التوجيه: ${currentLocation}`);
          }
          
          // إعادة توجيه إلى صفحة المصادقة عند عدم وجود مستخدم
          return <Redirect to="/auth" />;
        }

        console.log(`المستخدم موجود، عرض صفحة: ${path} للمستخدم ${user.username}`);
        // المستخدم موجود، عرض الكومبوننت المطلوبة
        return <Component {...params} />;
      }}
    </Route>
  );
}
