import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Navigate, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: (props: any) => React.JSX.Element;
}) {
  const { user, isLoading, loginGuestMutation } = useAuth();
  const [location] = useLocation();
  const [redirectCounter, setRedirectCounter] = useState(0);
  
  // منع الدخول في حلقة لانهائية من إعادة التوجيه
  useEffect(() => {
    // إذا كان المستخدم غير مسجل دخوله بعد محاولتين، سنقوم بتسجيل دخوله كضيف تلقائيًا
    if (!user && !isLoading && redirectCounter >= 2) {
      console.log("محاولة تسجيل دخول تلقائي كضيف...");
      
      loginGuestMutation.mutate(undefined, {
        onSuccess: (user) => {
          console.log("تم تسجيل الدخول كضيف بنجاح:", user.username);
          setRedirectCounter(0);
        },
        onError: (error) => {
          console.error("فشل تسجيل الدخول كضيف:", error);
        }
      });
    }
  }, [user, isLoading, redirectCounter, loginGuestMutation]);
  
  // حفظ المسار الحالي في حال الانتقال إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (!user && !isLoading && location !== "/auth") {
      localStorage.setItem("redirectAfterLogin", location);
      // زيادة عداد إعادة التوجيه
      setRedirectCounter(prev => prev + 1);
    }
  }, [user, isLoading, location]);
  
  // عرض حالة التحميل عندما تكون المصادقة قيد التحميل أو تكون عملية تسجيل دخول الضيف قيد التنفيذ
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
          // إذا كان عداد إعادة التوجيه منخفضًا، نقوم بالتوجيه إلى صفحة تسجيل الدخول
          if (redirectCounter < 2) {
            return <Navigate to="/auth" />;
          }
          
          // إذا تجاوزنا حد إعادة التوجيه، نعرض رسالة انتظار بدلاً من إعادة التوجيه
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black">
              <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37] mb-4" />
              <p className="text-[#D4AF37]">جاري محاولة تسجيل الدخول تلقائيًا...</p>
            </div>
          );
        }

        // المستخدم موجود، عرض الكومبوننت المطلوبة
        return <Component {...params} />;
      }}
    </Route>
  );
}
