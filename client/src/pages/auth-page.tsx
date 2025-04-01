import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Loader2, BadgeCheck, ChevronDown, ChevronsUpDown, CircleCheck, History, Shield, Users } from "lucide-react";

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
  
  // إعداد معرفات المميزات
  const features = [
    { 
      id: 'safe', 
      icon: <Shield className="w-5 h-5 text-[#D4AF37]" />, 
      title: 'لعب آمن 100%',
      description: 'تشفير كامل ونظام تحقق متقدم'
    },
    { 
      id: 'players', 
      icon: <Users className="w-5 h-5 text-[#D4AF37]" />, 
      title: 'آلاف اللاعبين',
      description: 'منضمين من جميع أنحاء العالم'
    },
    { 
      id: 'vip', 
      icon: <BadgeCheck className="w-5 h-5 text-[#D4AF37]" />, 
      title: 'مكافآت يومية',
      description: 'رصيد مجاني وهدايا خاصة'
    },
    { 
      id: 'history', 
      icon: <History className="w-5 h-5 text-[#D4AF37]" />, 
      title: 'إحصائيات اللعب',
      description: 'تتبع تقدمك وإنجازاتك'
    }
  ];

  // إنشاء تأثيرات متحركة للمميزات
  const controls = useAnimation();
  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5 }
    }));
  }, [controls]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center">
      {/* فيديو خلفية مع طبقة داكنة */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute w-full h-full object-cover opacity-20"
        >
          <source src="/assets/background-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      {/* صورة كازينو مستقبلية على الجانب الأيسر - خفية على الموبايل */}
      <div className="absolute left-0 top-0 bottom-0 w-1/3 hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-10"></div>
        <img 
          src="/assets/futuristic-casino-architecture.jpg" 
          alt="كازينو مستقبلي" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {/* صورة طاولة البوكر على الجانب الأيمن - خفية على الموبايل */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/20 to-transparent z-10"></div>
        <img 
          src="/assets/poker-table-bg.jpg" 
          alt="طاولة بوكر" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      {/* إضافة طبقة من التأثيرات اللونية */}
      <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/5 to-transparent opacity-30"></div>
      
      {/* كأننا على سطح طاولة البوكر - مؤثر ضوئي مركزي */}
      <div className="absolute inset-0 bg-[#1B4D3E]/10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#D4AF37]/10 to-transparent blur-3xl"></div>
      
      {/* الشعار المتحرك في الأعلى */}
      <motion.div
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <img 
          src="/assets/poker-icon-gold.png" 
          alt="VIP بوكر" 
          className="w-20 h-20 object-contain rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.6)]"
        />
        <h1 className="mt-3 text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] animate-glow-pulse">
          بوكر تكساس العربي
        </h1>
      </motion.div>
      
      {/* تفاصيل كروت اللعب بشكل متقدم */}
      <div className="absolute -top-10 -right-10 w-64 h-64 opacity-20 animate-floating">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="#D4AF37" fillOpacity="0.2" />
          <text x="50" y="55" fontSize="20" fill="#FFFFFF" textAnchor="middle">♠</text>
        </svg>
      </div>
      
      <div className="absolute -bottom-10 -left-10 w-64 h-64 opacity-20 animate-floating" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="#C41E3A" fillOpacity="0.2" />
          <text x="50" y="55" fontSize="20" fill="#FFFFFF" textAnchor="middle">♥</text>
        </svg>
      </div>
      
      {/* رسوم متحركة للنقاط اللامعة */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-[#D4AF37]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>
      
      {/* كروت البوكر المتحركة في المقدمة */}
      <motion.div
        className="absolute -left-5 top-1/3 w-40 h-56 pointer-events-none"
        initial={{ opacity: 0, x: -100, rotate: -10 }}
        animate={{ opacity: 0.8, x: 0, rotate: -10 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="w-full h-full bg-white rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-[3px] rounded-md border-2 border-[#D4AF37]/30 flex flex-col items-center justify-between p-4">
            <div className="text-red-600 font-bold text-2xl self-start">K</div>
            <div className="text-red-600 font-bold text-6xl">♥</div>
            <div className="text-red-600 font-bold text-2xl transform rotate-180 self-end">K</div>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        className="absolute -right-5 top-1/3 w-40 h-56 pointer-events-none"
        initial={{ opacity: 0, x: 100, rotate: 10 }}
        animate={{ opacity: 0.8, x: 0, rotate: 10 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="w-full h-full bg-white rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-[3px] rounded-md border-2 border-[#D4AF37]/30 flex flex-col items-center justify-between p-4">
            <div className="text-black font-bold text-2xl self-start">A</div>
            <div className="text-black font-bold text-6xl">♠</div>
            <div className="text-black font-bold text-2xl transform rotate-180 self-end">A</div>
          </div>
        </div>
      </motion.div>
      
      {/* مكعبات رقائق بوكر */}
      {[...Array(6)].map((_, index) => {
        const colors = [
          'bg-red-600', 'bg-blue-600', 'bg-[#1B4D3E]', 'bg-[#D4AF37]', 'bg-purple-600', 'bg-[#333]'
        ];
        const position = {
          bottom: `${10 + (index * 5)}%`,
          left: index % 2 === 0 ? `${10 + (index * 3)}%` : `${80 - (index * 3)}%`,
        };
        return (
          <motion.div
            key={`chip-${index}`}
            className={`absolute w-12 h-12 rounded-full ${colors[index]} border-2 border-white shadow-lg flex items-center justify-center z-10`}
            style={position}
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: 0.8, 
              y: [0, -15, 0],
              rotate: [0, 360]
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2
              },
              rotate: {
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.2
              },
              opacity: {
                duration: 0.5,
                delay: 0.2 + (index * 0.1)
              }
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs">
              {[100, 500, 1000, 5000, 10000, 25000][index]}
            </div>
          </motion.div>
        );
      })}
      
      {/* المحتوى الرئيسي: نموذج تسجيل الدخول */}
      <div className="relative z-50 w-full max-w-4xl mx-auto px-4">
        <motion.div 
          className="p-6 rounded-2xl backdrop-blur-xl border border-[#D4AF37]/20 bg-gradient-to-br from-black/90 to-[#0A1114]/90 shadow-[0_0_50px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* العمود الأول: النموذج */}
            <div className="order-2 md:order-1">
              {/* أزرار التبديل بين تسجيل الدخول والتسجيل */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-[#D4AF37]/20 bg-black/30">
                  <button
                    onClick={() => setActiveTab(AuthTab.Login)}
                    className={`py-3 px-4 rounded-lg text-base font-medium transition-all ${
                      activeTab === AuthTab.Login
                        ? "bg-gradient-to-b from-[#D4AF37] to-[#BF9B30] text-black shadow-lg"
                        : "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => setActiveTab(AuthTab.Register)}
                    className={`py-3 px-4 rounded-lg text-base font-medium transition-all ${
                      activeTab === AuthTab.Register
                        ? "bg-gradient-to-b from-[#D4AF37] to-[#BF9B30] text-black shadow-lg"
                        : "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    حساب جديد
                  </button>
                </div>
              </div>
              
              {/* النموذج */}
              <div className="bg-black/50 rounded-2xl p-6 border border-[#D4AF37]/10">
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
              </div>
              
              {/* رسالة أمان */}
              <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center bg-[#1B4D3E]/30 text-[#D4AF37] text-sm px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4 ml-2" />
                  تسجيل دخول آمن ومشفر بالكامل
                </div>
              </div>
            </div>
            
            {/* العمود الثاني: مميزات اللعبة */}
            <div className="order-1 md:order-2 flex flex-col items-center justify-center relative">
              {/* كرة توهج خلفية */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl"></div>
              
              {/* الشعار والعنوان */}
              <div className="text-center mb-8">
                <motion.div
                  className="inline-block relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute -inset-3 rounded-full bg-[#D4AF37]/5 blur-xl animate-pulse-slow"></div>
                  <img 
                    src="/assets/poker-icon-gold.png" 
                    alt="بوكر VIP" 
                    className="w-24 h-24 object-contain rounded-full border-2 border-[#D4AF37]/30 p-1"
                  />
                </motion.div>
                
                <motion.h2
                  className="mt-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  بوكر تكساس VIP
                </motion.h2>
                
                <motion.p
                  className="mt-2 text-[#D4AF37]/70"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  أفضل تجربة بوكر عربية على الإطلاق
                </motion.p>
              </div>
              
              {/* مميزات اللعبة */}
              <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.id}
                    className="bg-black/30 rounded-xl p-4 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all"
                    custom={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="bg-black/50 rounded-full p-2 border border-[#D4AF37]/20">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-[#D4AF37] font-bold mb-1">{feature.title}</h3>
                        <p className="text-xs text-[#D4AF37]/70">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* صورة طاولة البوكر */}
              <motion.div
                className="mt-8 w-full rounded-xl overflow-hidden border border-[#D4AF37]/20 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <img 
                  src="/assets/poker-table-bg.jpg" 
                  alt="طاولة بوكر VIP" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-white font-bold text-lg">ابدأ اللعب مجاناً الآن</p>
                  <p className="text-[#D4AF37] text-sm">احصل على 10,000 رقاقة مجانية عند التسجيل</p>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* شعارات الثقة والأمان */}
          <div className="mt-8 pt-6 border-t border-[#D4AF37]/10 grid grid-cols-4 gap-3">
            {['لعب آمن', 'دفع مضمون', 'مراقبة 24/7', 'دعم فني'].map((text, i) => (
              <motion.div
                key={`trust-${i}`}
                className="flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + (i * 0.1) }}
              >
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/30 flex items-center justify-center">
                    <CircleCheck className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                </div>
                <span className="text-xs text-[#D4AF37]/70">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* زر معلومات سريع */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        <motion.button
          className="bg-[#D4AF37] text-black rounded-full py-2 px-4 font-bold text-sm flex items-center gap-2 hover:bg-[#BF9B30] transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronDown className="w-5 h-5" />
          نبذة عن اللعبة
        </motion.button>
      </div>
      
      {/* زر متجر الرقائق */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <motion.button
          className="bg-[#1B4D3E] text-white rounded-full py-2 px-4 font-bold text-sm flex items-center gap-2 hover:bg-[#16423a] transition-colors shadow-lg border border-[#D4AF37]/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[#D4AF37]">💰</span>
          متجر الرقائق
        </motion.button>
      </div>
    </div>
  );
}
