import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { Snowflakes } from "@/components/ui/santa-sleigh";

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
           background: "linear-gradient(135deg, #000000 0%, #1A1A1A 25%, #0F0F0F 50%, #1A1A1A 75%, #000000 100%)"
         }}>
      {/* Decorative elements for the poker theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Card suits as subtle background elements */}
        <div className="absolute top-[10%] left-[10%] text-[#D4AF37]/5 text-[150px] transform rotate-12">♠</div>
        <div className="absolute top-[20%] right-[15%] text-[#D4AF37]/5 text-[130px] transform -rotate-12">♥</div>
        <div className="absolute bottom-[15%] left-[20%] text-[#D4AF37]/5 text-[120px] transform rotate-45">♣</div>
        <div className="absolute bottom-[25%] right-[10%] text-[#D4AF37]/5 text-[140px] transform -rotate-20">♦</div>
      </div>
      
      <div className="absolute inset-0 bg-[#0A0A0A]/70 backdrop-blur-sm">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-50"></div>
        
        {/* Radial light effect */}
        <div className="absolute inset-0" style={{ 
          background: "radial-gradient(circle at center, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)" 
        }}></div>
      </div>
      
      {/* تساقط الثلج فقط على الصفحة */}
      <Snowflakes count={40} />
      
      <div className="relative max-w-md w-full mx-4 z-10">
        {/* Card decorations at the corners */}
        <div className="absolute -top-12 -right-12 w-24 h-32 transform rotate-12 opacity-50 z-0">
          <div className="w-20 h-28 rounded-lg bg-white shadow-md flex items-center justify-center text-red-600 font-bold text-3xl">A♥</div>
        </div>
        <div className="absolute -bottom-12 -left-12 w-24 h-32 transform -rotate-12 opacity-50 z-0">
          <div className="w-20 h-28 rounded-lg bg-white shadow-md flex items-center justify-center text-black font-bold text-3xl">K♠</div>
        </div>
        
        {/* Poker chips */}
        <div className="absolute top-1/4 -right-6 w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-lg opacity-60 z-0"></div>
        <div className="absolute bottom-1/4 -left-6 w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg opacity-60 z-0"></div>
        
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-xl bg-[#D4AF37] blur-xl opacity-20 transform scale-105"></div>
        
        {/* Main content container */}
        <div className="relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.3)] bg-gradient-to-b from-[#0A0A0A] to-[#121212] backdrop-blur-md">
          <div className="p-8">
            {/* Gold header strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37] to-[#D4AF37]/30"></div>
            
            <div className="text-center mb-8">
              <div className="flex justify-center">
                <img src="/assets/poker-logo-alt.jpeg" alt="Poker Logo" className="w-16 h-16 object-cover rounded-full border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] mb-2" />
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] mb-2">
                بوكر تكساس هولدم
              </h1>
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
    </div>
  );
}
