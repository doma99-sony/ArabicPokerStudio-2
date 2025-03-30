import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: (props: any) => React.JSX.Element;
}) {
  const { user, isLoading, loginGuestMutation } = useAuth();
  const [location] = useLocation();
  
  // حفظ المسار الحالي في حال الانتقال إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (!user && !isLoading && location !== "/auth") {
      localStorage.setItem("redirectAfterLogin", location);
      
      // تسجيل دخول تلقائي كضيف إذا لم يكن مسجل دخول
      if (!loginGuestMutation.isPending) {
        console.log("محاولة تسجيل دخول تلقائي كضيف...");
        loginGuestMutation.mutate(undefined, {
          onSuccess: (user) => {
            console.log("تم تسجيل الدخول كضيف بنجاح:", user.username);
          },
          onError: (error) => {
            console.error("فشل تسجيل الدخول كضيف:", error);
          }
        });
      }
    }
  }, [user, isLoading, location, loginGuestMutation]);
  
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
          // إعادة توجيه إلى صفحة المصادقة عند عدم وجود مستخدم
          return <Redirect to="/auth" />;
        }

        // المستخدم موجود، عرض الكومبوننت المطلوبة
        return <Component {...params} />;
      }}
    </Route>
  );
}
