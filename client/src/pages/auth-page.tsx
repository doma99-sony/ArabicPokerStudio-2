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
      <div className="fixed inset-0 overflow-hidden bg-black">
        {/* فيديو خلفية كازينو حقيقي */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute w-full h-full object-cover"
            style={{ filter: "brightness(0.4) contrast(1.2)" }}
          >
            <source src="/assets/loading-background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        </div>
        
        {/* إضافة طبقة من الفلاتر المتحركة */}
        <div className="absolute inset-0 bg-[#0a0f18]/50 mix-blend-overlay"></div>
        
        {/* توهج مركزي */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#D4AF37]/20 to-transparent blur-3xl"
          animate={{ 
            opacity: [0.4, 0.8, 0.4],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
        
        {/* خطوط وعناصر زخرفية */}
        <div className="absolute inset-0 overflow-hidden">
          {/* خطوط أفقية */}
          <motion.div 
            className="absolute h-px w-screen bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent top-1/3" 
            animate={{ 
              x: [-500, 2000], 
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear"
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute h-px w-screen bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent top-2/3" 
            animate={{ 
              x: [2000, -500], 
              opacity: [0, 0.8, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: 2
            }}
          ></motion.div>
          
          {/* خطوط عمودية */}
          <motion.div 
            className="absolute w-px h-screen bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent left-1/3" 
            animate={{ 
              y: [-500, 2000], 
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear",
              delay: 1
            }}
          ></motion.div>
          
          <motion.div 
            className="absolute w-px h-screen bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent right-1/3" 
            animate={{ 
              y: [2000, -500], 
              opacity: [0, 0.6, 0]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "linear",
              delay: 3
            }}
          ></motion.div>
        </div>
        
        {/* حاوية المحتوى الرئيسي للتحميل */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center">
          {/* شعار بوكر VIP */}
          <div className="relative">
            <motion.div
              className="absolute -inset-6 bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/20 to-[#D4AF37]/5 rounded-full blur-2xl"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.1, 0.8],
                rotate: [0, 360],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            ></motion.div>
            
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ 
                duration: 1.2,
                type: "spring",
                stiffness: 100
              }}
              className="relative"
            >
              <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#333]/80 to-black/90 p-4 border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-black/90 to-[#111]/95"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#BF9B30] opacity-20 animate-pulse-slow"></div>
                    <img 
                      src="/assets/poker-logo-new.jpg"
                      alt="VIP Poker" 
                      className="absolute inset-0 w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                
                {/* عناصر زخرفية حول الشعار */}
                {[...Array(4)].map((_, i) => {
                  const angle = (i * Math.PI) / 2; // 90 درجة لكل عنصر
                  const radius = 65;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const suits = ['♠', '♥', '♦', '♣'];
                  const colors = ['text-white', 'text-red-600', 'text-red-600', 'text-white'];
                  
                  return (
                    <motion.div
                      key={`ornament-${i}`}
                      className={`absolute w-8 h-8 rounded-full bg-black/80 border border-[#D4AF37]/40 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center ${colors[i]} text-xl font-bold`}
                      style={{
                        left: `calc(50% + ${x}px - 16px)`,
                        top: `calc(50% + ${y}px - 16px)`,
                      }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {suits[i]}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
          
          {/* عنوان مع تأثير كتابة */}
          <motion.h1 
            className="mt-10 text-5xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] animate-glow-pulse">
              VIP بوكر تكساس
            </span>
          </motion.h1>
          
          {/* شريط تحميل فاخر */}
          <div className="mt-12 relative w-80">
            <motion.div 
              className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/20 to-[#D4AF37]/5 blur-lg"
              animate={{
                opacity: [0.5, 1, 0.5],
                background: [
                  'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0) 70%)',
                  'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)',
                  'radial-gradient(circle, rgba(212,175,55,0.1) 0%, rgba(0,0,0,0) 70%)'
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>
            
            <div className="relative h-4 w-full rounded-full bg-black/40 border border-[#D4AF37]/30 overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <motion.div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#D4AF37] via-[#EFC75E] to-[#D4AF37] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
              />
              
              {/* نقاط لامعة على شريط التقدم */}
              <motion.div
                className="absolute h-12 w-12 top-1/2 -translate-y-1/2 bg-white rounded-full blur-xl"
                animate={{
                  left: ['-10%', '110%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  delay: 0.1
                }}
                style={{ opacity: 0.3 }}
              />
            </div>
          </div>
          
          {/* رسائل التحميل المتغيرة */}
          <div className="mt-6 h-8 relative overflow-hidden">
            {[
              "جاري تحميل طاولات VIP الخاصة...",
              "تجهيز ألعاب البوكر المباشرة...",
              "إعداد الرسومات والتأثيرات البصرية...",
              "تجهيز خزائن الرقائق والجوائز...",
              "الاتصال بخوادم اللعب الآمنة..."
            ].map((text, index) => (
              <motion.div
                key={`loading-text-${index}`}
                className="absolute inset-x-0 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [20, 0, 0, -20]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: index * 3.5,
                  times: [0, 0.1, 0.9, 1],
                  repeatDelay: 14 // مدة الدورة الكاملة للنصوص الخمسة: 5 * 3.5 = 17.5
                }}
              >
                <p className="text-[#D4AF37] text-lg font-medium px-4 py-1 rounded-full bg-[#0a0f18]/50 backdrop-blur-md border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
          
          {/* نسبة التحميل */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.p
              className="text-[#D4AF37] text-xl font-bold"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                100%
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
        
        {/* عناصر كروت بوكر متحركة في الخلفية */}
        <div className="absolute inset-0 pointer-events-none">
          {/* بطاقات كبيرة بعيدة */}
          {[...Array(3)].map((_, index) => {
            const positions = [
              { bottom: '-5%', right: '5%', rotate: 15 },
              { top: '10%', left: '5%', rotate: -20 },
              { top: '50%', right: '10%', rotate: 10 }
            ];
            
            return (
              <motion.div
                key={`big-card-${index}`}
                className="absolute w-40 h-56 bg-white rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.7)] overflow-hidden"
                style={{ 
                  ...positions[index],
                  transformOrigin: 'center center',
                  perspective: '1000px',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0.5, 0.7, 0.5],
                  rotateY: [0, 180, 360],
                  z: [-100, 100, -100]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 5
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#050505]"></div>
                  <div className="absolute inset-[3px] border-2 border-[#D4AF37]/20 rounded-lg"></div>
                  <div className="relative">
                    <div className={`text-[#D4AF37] text-9xl opacity-50`}>
                      {['♠', '♥', '♦'][index]}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* بطاقات صغيرة تتحرك */}
          {[...Array(8)].map((_, index) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 10;
            const randomDuration = Math.random() * 10 + 15;
            const isRed = index % 2 === 0;
            
            return (
              <motion.div
                key={`floating-card-${index}`}
                className="absolute w-12 h-16 rounded-md bg-white shadow-xl"
                style={{
                  left: `${randomX}%`,
                  top: '-10%',
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.7, 0],
                  y: ['0vh', '120vh'],
                  x: [`${randomX}%`, `${randomX + (Math.random() * 20 - 10)}%`],
                  rotate: [Math.random() * 60 - 30, Math.random() * 60 - 30],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: randomDelay,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-between p-1 overflow-hidden">
                  <div className={`text-xs font-bold self-start ${isRed ? 'text-red-600' : 'text-black'}`}>A</div>
                  <div className={`text-xl ${isRed ? 'text-red-600' : 'text-black'}`}>
                    {isRed ? '♥' : '♠'}
                  </div>
                  <div className={`text-xs font-bold self-end transform rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>A</div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* رقائق البوكر متناثرة */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, index) => {
            const colors = [
              'bg-red-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-yellow-600',
              'bg-[#D4AF37]', 'bg-[#1B4D3E]', 'bg-black', 'bg-orange-600', 'bg-pink-600'
            ];
            const sizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26];
            const values = [5, 10, 25, 50, 100, 250, 500, 1000, 5000, 10000];
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 10;
            const randomDuration = Math.random() * 5 + 10;
            
            return (
              <motion.div
                key={`chip-${index}`}
                className={`absolute ${colors[index]} rounded-full flex items-center justify-center`}
                style={{
                  width: `${sizes[index]}px`,
                  height: `${sizes[index]}px`,
                  left: `${randomX}%`,
                  top: '-5%',
                  border: '2px solid white',
                  zIndex: 10 - index // كلما كان الـindex أكبر، كلما كان zIndex أقل
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: ['0vh', '120vh'],
                  x: [`${randomX}%`, `${randomX + (Math.random() * 30 - 15)}%`],
                  rotate: [0, 360 + Math.random() * 720],
                }}
                transition={{
                  duration: randomDuration,
                  repeat: Infinity,
                  ease: "easeIn",
                  delay: randomDelay,
                }}
              >
                {sizes[index] >= 16 && (
                  <div className="text-white text-[7px] font-bold">
                    {values[index]}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
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
          src="/assets/poker-logo-new.jpg" 
          alt="VIP بوكر" 
          className="w-20 h-20 object-cover rounded-full border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.6)]"
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
                    src="/assets/poker-logo-new.jpg" 
                    alt="بوكر VIP" 
                    className="w-24 h-24 object-cover rounded-full border-2 border-[#D4AF37]/30"
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
