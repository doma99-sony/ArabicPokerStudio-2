import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [floatingCards, setFloatingCards] = useState<Array<{x: number, y: number, rotation: number, suit: string, size: number, speed: number}>>([]);
  
  // إعداد تأثير الخلفية المتحركة والبطاقات العائمة
  useEffect(() => {
    // إنشاء الخلفية المتحركة
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تعيين حجم الكانفاس
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // إنشاء النقاط والخطوط
    const points: {x: number, y: number, vx: number, vy: number}[] = [];
    const numPoints = 100;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
    
    const draw = () => {
      // تحديث الخلفية
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // رسم الخطوط والنقاط
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        
        // تحريك النقطة
        point.x += point.vx;
        point.y += point.vy;
        
        // ارتداد من الحدود
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
        
        // رسم النقطة
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
        ctx.fill();
        
        // رسم الخطوط بين النقاط القريبة
        for (let j = i + 1; j < points.length; j++) {
          const point2 = points[j];
          const distance = Math.sqrt(Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2));
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    // بدء الرسم
    draw();
    
    // إنشاء بطاقات عائمة
    const suits = ['♠', '♥', '♣', '♦'];
    const newFloatingCards = [];
    for (let i = 0; i < 10; i++) {
      newFloatingCards.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        suit: suits[Math.floor(Math.random() * suits.length)],
        size: Math.random() * 50 + 20,
        speed: Math.random() * 5 + 2
      });
    }
    setFloatingCards(newFloatingCards);
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);
  
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
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] blur animate-pulse"></div>
          <Loader2 className="absolute inset-0 h-24 w-24 animate-spin text-[#D4AF37]" />
        </div>
        <p className="mt-4 text-[#D4AF37] animate-pulse text-lg">جاري تحميل البوكر...</p>
      </div>
    );
  }

  // مصفوفة رموز أوراق اللعب 
  const cardSuits = ['♠', '♥', '♦', '♣'];
  
  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-black">
      {/* خلفية متحركة */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20"
      />

      {/* خلفية تدرج الألوان وتأثيراتها */}
      <div className="absolute inset-0" style={{ 
        background: "radial-gradient(circle at center, rgba(20, 20, 20, 1) 0%, rgba(0, 0, 0, 1) 100%)",
        boxShadow: "inset 0 0 100px rgba(212, 175, 55, 0.15)"
      }}></div>
      
      {/* تأثير اللمعان الذهبي من الأعلى */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-60"></div>
      
      {/* تأثير الخطوط والنقاط الذهبية المتحركة */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse-slow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`
            }}
          />
        ))}
      </div>
      
      {/* البطاقات العائمة باستخدام Framer Motion */}
      {floatingCards.map((card, index) => (
        <motion.div
          key={`floating-card-${index}`}
          className="absolute pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0.8, 0],
            x: [card.x + '%', (card.x + 5) + '%', (card.x - 5) + '%', card.x + '%'],
            y: [card.y + '%', (card.y - 5) + '%', (card.y + 5) + '%', card.y + '%'],
            rotate: [card.rotation, card.rotation + 20, card.rotation - 20, card.rotation],
          }}
          transition={{
            duration: card.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            fontSize: `${card.size}px`,
            color: card.suit === '♥' || card.suit === '♦' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(212, 175, 55, 0.2)',
            textShadow: `0 0 15px ${card.suit === '♥' || card.suit === '♦' ? 'rgba(220, 53, 69, 0.3)' : 'rgba(212, 175, 55, 0.3)'}`,
            filter: 'blur(1px)'
          }}
        >
          {card.suit}
        </motion.div>
      ))}
      
      {/* كروت أكثر وضوحاً ودوارة بشكل منفصل */}
      <div className="absolute w-32 h-40 top-20 left-32 transform -rotate-12 filter drop-shadow-lg animate-floating">
        <div className="w-full h-full bg-white rounded-xl shadow-xl flex flex-col items-center justify-between p-3 border-2 border-[#D4AF37]/30">
          <div className="text-red-600 font-bold text-2xl self-start">A</div>
          <div className="text-red-600 font-bold text-6xl">♥</div>
          <div className="text-red-600 font-bold text-2xl transform rotate-180 self-end">A</div>
        </div>
      </div>
      
      <div className="absolute w-28 h-36 bottom-32 right-36 transform rotate-12 filter drop-shadow-lg animate-floating" style={{ animationDelay: '1s' }}>
        <div className="w-full h-full bg-white rounded-xl shadow-xl flex flex-col items-center justify-between p-3 border-2 border-[#D4AF37]/30">
          <div className="text-black font-bold text-2xl self-start">A</div>
          <div className="text-black font-bold text-6xl">♠</div>
          <div className="text-black font-bold text-2xl transform rotate-180 self-end">A</div>
        </div>
      </div>
      
      {/* رقائق بوكر دائرية متحركة في الخلفية */}
      {[...Array(5)].map((_, index) => {
        const size = Math.random() * 20 + 40;
        const position = {
          top: `${Math.random() * 60 + 20}%`,
          left: index % 2 === 0 ? `${Math.random() * 20 + 5}%` : `${Math.random() * 20 + 75}%`
        };
        const colors = [
          'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-black', 'bg-purple-600'
        ];
        const color = colors[index % colors.length];
        
        return (
          <motion.div
            key={`chip-${index}`}
            className={`absolute rounded-full ${color} border-4 border-white flex items-center justify-center shadow-xl`}
            style={{
              top: position.top,
              left: position.left,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${index * 0.5}s`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.7
            }}
          >
            <div className="rounded-full w-2/3 h-2/3 border-2 border-dashed border-white/40"></div>
          </motion.div>
        );
      })}
      
      {/* صندوق تسجيل الدخول المتحرك */}
      <motion.div 
        className="relative max-w-lg w-full mx-4 z-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* توهج خلفي */}
        <div className="absolute -inset-4 bg-[#D4AF37]/5 rounded-3xl blur-xl animate-pulse-slow"></div>
        
        {/* توهج حول الحدود */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] via-[#D4AF37]/20 to-[#D4AF37] rounded-2xl blur-md opacity-50"></div>
        
        {/* الحاوية الرئيسية مع تأثيرات زجاجية */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-black/90 to-[#121212]/95 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_0_35px_rgba(0,0,0,0.8)]">
          {/* شريط ذهبي علوي */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          
          {/* شريط ذهبي سفلي */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          
          {/* تقسيم الصفحة إلى عمودين للوضع المكتبي، وعمود واحد للوضع المحمول */}
          <div className="md:grid md:grid-cols-5 items-stretch">
            {/* عمود الصورة والمعلومات (الجهة اليمنى في لغات RTL) */}
            <div className="md:col-span-2 relative bg-[#0a0f18] overflow-hidden p-6 md:p-8 flex flex-col items-center justify-center min-h-[250px] md:min-h-0">
              {/* خلفية بإضاءة متموجة */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/70"></div>
              <div className="absolute inset-0 bg-[length:400%_400%] animate-subtle-gradient" style={{
                backgroundImage: "linear-gradient(45deg, #000000 0%, #0a0f18 25%, #D4AF37/5 50%, #0a0f18 75%, #000000 100%)"
              }}></div>
              
              {/* الشعار والمحتوى */}
              <motion.div
                className="relative flex flex-col items-center text-center z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <div className="mb-6 relative">
                  <div className="absolute -inset-2 rounded-full bg-[#D4AF37]/10 blur-md animate-pulse-slow"></div>
                  <img 
                    src="/assets/poker-icon-gold.png" 
                    alt="بوكر تكساس" 
                    className="w-28 h-28 object-contain rounded-full border-2 border-[#D4AF37] p-1"
                  />
                </div>
                
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] animate-glow-pulse">
                  بوكر تكساس
                </h1>
                
                <p className="mt-3 text-[#D4AF37]/70 max-w-[200px]">
                  العب واربح رقائق مجانية واستمتع بالمميزات الحصرية!
                </p>
                
                {/* بطاقات تزيينية حول الشعار */}
                <div className="absolute -bottom-4 -right-4 w-12 h-16 transform rotate-12">
                  <div className="w-full h-full rounded-md bg-white border border-[#D4AF37]/50 shadow-md flex items-center justify-center text-red-600 font-bold text-xl">
                    A♥
                  </div>
                </div>
                
                <div className="absolute -top-5 -left-5 w-12 h-16 transform -rotate-12">
                  <div className="w-full h-full rounded-md bg-white border border-[#D4AF37]/50 shadow-md flex items-center justify-center text-black font-bold text-xl">
                    A♠
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* عمود النموذج (الجهة اليسرى في لغات RTL) */}
            <div className="md:col-span-3 p-6 md:p-8">
              {/* أزرار التبديل بين تسجيل الدخول والتسجيل الجديد */}
              <div className="mb-8 flex justify-center">
                <div className="grid grid-cols-2 gap-1 bg-black/50 p-1 rounded-full">
                  <button
                    onClick={() => setActiveTab(AuthTab.Login)}
                    className={`py-2 px-6 rounded-full text-sm font-medium transition-all ${
                      activeTab === AuthTab.Login
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] text-black shadow-lg"
                        : "text-[#D4AF37]/70 hover:text-[#D4AF37]"
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => setActiveTab(AuthTab.Register)}
                    className={`py-2 px-6 rounded-full text-sm font-medium transition-all ${
                      activeTab === AuthTab.Register
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] text-black shadow-lg"
                        : "text-[#D4AF37]/70 hover:text-[#D4AF37]"
                    }`}
                  >
                    حساب جديد
                  </button>
                </div>
              </div>
              
              {/* عرض النموذج النشط مع تأثير انتقالي */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === AuthTab.Login ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === AuthTab.Login ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === AuthTab.Login ? (
                    <LoginForm onSwitchToRegister={() => setActiveTab(AuthTab.Register)} />
                  ) : (
                    <RegisterForm onSwitchToLogin={() => setActiveTab(AuthTab.Login)} />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* ملاحظة أمان أسفل النموذج */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center bg-[#D4AF37]/5 text-[#D4AF37]/70 text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  تسجيل دخول آمن 100%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* شارة VIP متحركة */}
        <motion.div 
          className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ 
            y: [0, -5, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] text-black font-bold px-6 py-2 rounded-full text-sm border-2 border-white shadow-lg">
            VIP بوكر
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
