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
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // حفظ المسار الحالي في حال الانتقال إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (!user && !isLoading && location !== "/auth") {
      localStorage.setItem("redirectAfterLogin", location);
    }
  }, [user, isLoading, location]);
  
  // عرض حالة التحميل
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
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
