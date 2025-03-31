import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { ChristmasLights, ChristmasDecoration } from "@/components/ui/christmas-lights";
import { SantaSleigh, Snowflakes } from "@/components/ui/santa-sleigh";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [showChristmas, setShowChristmas] = useState(true);
  
  // أضف متغير تخزين محلي لمنع الاستعلامات المتكررة
  useEffect(() => {
    // حذف أي توجيه سابق من التخزين المحلي
    localStorage.removeItem("redirectAfterLogin");
    
    // التحقق من إعدادات عرض زينة الكريسماس
    const christmasSetting = localStorage.getItem("showChristmasDecor");
    if (christmasSetting !== null) {
      setShowChristmas(christmasSetting === "true");
    }
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
      
      {/* زينة الكريسماس */}
      {showChristmas && (
        <>
          {/* أضواء الكريسماس في الأعلى */}
          <ChristmasLights 
            className="absolute top-0 left-0 right-0 z-20" 
            count={30} 
            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#4CBB17']}
          />
          
          {/* أضواء الكريسماس في الأسفل */}
          <ChristmasLights 
            className="absolute bottom-0 left-0 right-0 z-20" 
            count={30} 
            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#4CBB17']}
          />
          
          {/* أضواء الكريسماس على اليمين */}
          <ChristmasLights 
            className="absolute top-0 bottom-0 right-0 z-20 flex-col" 
            count={20} 
            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#4CBB17']}
          />
          
          {/* أضواء الكريسماس على اليسار */}
          <ChristmasLights 
            className="absolute top-0 bottom-0 left-0 z-20 flex-col" 
            count={20} 
            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#4CBB17']}
          />
          
          {/* نثر زينة الكريسماس */}
          <ChristmasDecoration className="z-20" />
          
          {/* تساقط الثلج */}
          <Snowflakes count={40} />
          
          {/* بابا نويل بالعربة - حجم كبير */}
          <SantaSleigh size="lg" startDelay={2} />
          
          {/* بابا نويل بالعربة - حجم متوسط، يظهر بعد 15 ثانية */}
          <SantaSleigh size="md" startDelay={15} />
          
          {/* بابا نويل بالعربة - حجم صغير، يظهر بعد 30 ثانية */}
          <SantaSleigh size="sm" startDelay={30} />
        </>
      )}
      
      <div className="relative max-w-md w-full mx-4 rounded-xl overflow-hidden shadow-lg z-10 bg-black/40 backdrop-blur-md">
        {/* أضواء الكريسماس حول النموذج */}
        {showChristmas && (
          <ChristmasLights 
            className="absolute -top-5 left-0 right-0 z-20" 
            count={15} 
            colors={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#4CBB17']}
            speed={800}
          />
        )}
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2 animate-pulse-slow">
              بوكر تكساس هولدم
            </h1>
            <p className="text-[#D4AF37]/80">
              {activeTab === AuthTab.Login ? "تسجيل الدخول للعب" : "تسجيل حساب جديد"}
            </p>
            {showChristmas && (
              <div className="mt-2 text-sm text-white/70">
                <span className="text-red-400">عيد</span>{" "}
                <span className="text-green-400">ميلاد</span>{" "}
                <span className="text-yellow-400">مجيد</span>{" "}
                <span className="text-blue-400">!</span>
              </div>
            )}
          </div>
          
          {activeTab === AuthTab.Login ? (
            <LoginForm onSwitchToRegister={() => setActiveTab(AuthTab.Register)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab(AuthTab.Login)} />
          )}
        </div>
      </div>
      
      {/* زر لتفعيل/إلغاء زينة الكريسماس */}
      <button 
        className="absolute bottom-4 left-4 bg-[#D4AF37] text-black px-3 py-1 rounded-full text-xs opacity-70 hover:opacity-100 z-30"
        onClick={() => {
          const newValue = !showChristmas;
          setShowChristmas(newValue);
          localStorage.setItem("showChristmasDecor", String(newValue));
        }}
      >
        {showChristmas ? "إخفاء زينة الكريسماس" : "إظهار زينة الكريسماس"}
      </button>
    </div>
  );
}
