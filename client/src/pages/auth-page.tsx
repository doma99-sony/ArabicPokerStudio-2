import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  // أضف متغير تخزين محلي لمنع الاستعلامات المتكررة
  useEffect(() => {
    // حذف أي توجيه سابق من التخزين المحلي
    localStorage.removeItem("redirectAfterLogin");
  }, []);
  
  // اعادة التوجيه إلى اللوبي اذا كان المستخدم مسجل دخوله بالفعل
  useEffect(() => {
    if (user) {
      // تأخير قصير قبل إعادة التوجيه لضمان اكتمال تخزين الجلسة
      const timer = setTimeout(() => {
        // الحصول على الوجهة المخزنة مسبقاً أو الانتقال إلى اللوبي بشكل افتراضي
        const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin"); // حذف المسار بعد التوجيه
        
        // استخدام window.location بدلاً من navigate لضمان إعادة تحميل كاملة
        window.location.href = redirectPath;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center"
         style={{ 
           backgroundImage: "url('/images/egyptian-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center"
         }}>
      <div className="absolute inset-0 bg-[#0A0A0A]/70 backdrop-blur-sm"></div>
      
      <div className="relative max-w-md w-full mx-4 rounded-xl overflow-hidden shadow-lg z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">بوكر تكساس هولدم</h1>
            <p className="text-[#D4AF37]/80">
              {activeTab === AuthTab.Login ? "تسجيل الدخول للعب" : "تسجيل حساب جديد"}
            </p>
          </div>
          
          {activeTab === AuthTab.Login ? (
            <LoginForm onSwitchToRegister={() => setActiveTab(AuthTab.Register)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab(AuthTab.Login)} />
          )}
        </div>
      </div>
    </div>
  );
}
