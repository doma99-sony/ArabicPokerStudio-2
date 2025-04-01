import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

// قائمة بالنصوص التحفيزية العشوائية للظهور أثناء التحميل
const motivationalTexts = [
  "أفضل لاعبي البوكر في العالم العربي",
  "استمتع بتجربة لعب مميزة",
  "اجمع الرقائق وتنافس مع الأفضل",
  "اربح البطولات واحصل على جوائز قيمة",
  "تحدى أصدقاءك في مباريات خاصة",
  "قريباً... بطولات أسبوعية بجوائز كبيرة",
  "ابدأ من الصفر وكن بطل العرب",
  "تعلم استراتيجيات البوكر المتقدمة",
  "اكتسب خبرة أكبر مع كل لعبة",
  "طور مهاراتك وصبح محترف بوكر",
];

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('تحميل الموارد');
  const [motivationalText, setMotivationalText] = useState(motivationalTexts[0]);
  const [textIndex, setTextIndex] = useState(0);
  const [showMotivational, setShowMotivational] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  
  // مرجع للأنيميشن والكانفاس
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });

  // تأثير تحريك البطاقة بناءً على حركة الماوس
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // تحويل الإحداثيات إلى درجات دوران
      // كلما كان الماوس أبعد عن المركز، كان الدوران أكبر
      const rotateY = -(x / 10);
      const rotateX = y / 10;
      
      setCardRotation({ x: rotateX, y: rotateY });
    };
    
    const handleMouseLeave = () => {
      // إعادة البطاقة تدريجياً إلى وضعها الطبيعي
      setCardRotation({ x: 0, y: 0 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    cardRef.current?.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cardRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  // تحديث التشويقات النصية
  useEffect(() => {
    const textTimer = setInterval(() => {
      setShowMotivational(false);
      
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % motivationalTexts.length);
        setMotivationalText(motivationalTexts[(textIndex + 1) % motivationalTexts.length]);
        setShowMotivational(true);
      }, 500);
    }, 4000);
    
    return () => clearInterval(textTimer);
  }, [textIndex]);
  
  // متغير لتتبع ما إذا كان الانتقال قيد التنفيذ
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // تنفيذ عداد التقدم
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            
            // بدء تأثير الانتقال
            setIsTransitioning(true);
            
            // قم بإنهاء شاشة البداية بعد اكتمال التحميل
            setTimeout(() => onComplete(), 2000);
            return 100;
          }
          
          // تغيير النص حسب تقدم التحميل
          if (prevProgress > 30 && prevProgress < 60) {
            setTitle('تهيئة اللعبة');
          } else if (prevProgress >= 60 && prevProgress < 90) {
            setTitle('الاتصال بالخادم');
          } else if (prevProgress >= 90) {
            setTitle('كل شيء جاهز');
          }
          
          // تسريع التقدم في نهاية التحميل للتجربة الأفضل
          let increment;
          if (prevProgress < 50) {
            increment = Math.floor(Math.random() * 2) + 1;
          } else if (prevProgress < 80) {
            increment = Math.floor(Math.random() * 3) + 1;
          } else {
            increment = Math.floor(Math.random() * 2) + 0.5;
          }
          
          return Math.min(prevProgress + increment, 100);
        });
      }, 100);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-black z-50 ${isTransitioning ? 'blur-in fade-transition fade-transition-exit-active' : 'blur-in'}`}>
      {/* خلفية البوكر المحسنة */}
      <div className="absolute inset-0 overflow-hidden">
        {/* خلفية بنمط قماش طاولة البوكر */}
        <div className="absolute inset-0 bg-[#0A1C1A] opacity-90"></div>
        
        {/* نمط حلقات دائرية متداخلة على الخلفية */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 25% 25%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 75% 75%, #D4AF37 0%, transparent 50%)',
               backgroundSize: '80% 80%',
               backgroundPosition: 'center center'
             }}></div>
        
        {/* رموز ورق اللعب كعناصر خلفية */}
        <div className="absolute top-[10%] left-[10%] text-[#D4AF37]/15 text-[200px] transform rotate-6 filter drop-shadow-lg">♠</div>
        <div className="absolute top-[20%] right-[15%] text-[#D4AF37]/15 text-[180px] transform -rotate-6 filter drop-shadow-lg">♥</div>
        <div className="absolute bottom-[15%] left-[20%] text-[#D4AF37]/15 text-[190px] transform rotate-12 filter drop-shadow-lg">♣</div>
        <div className="absolute bottom-[25%] right-[10%] text-[#D4AF37]/15 text-[170px] transform -rotate-8 filter drop-shadow-lg">♦</div>
        
        {/* ورقتي لعب AA */}
        <div className="absolute top-[25%] left-[30%] w-24 h-32 bg-white rounded-lg shadow-xl transform rotate-6 border-2 border-gray-300">
          <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
            <div className="text-red-600 font-bold text-2xl self-start">A</div>
            <div className="text-red-600 font-bold text-5xl">♥</div>
            <div className="text-red-600 font-bold text-2xl transform rotate-180 self-end">A</div>
          </div>
        </div>
        
        <div className="absolute top-[25%] right-[30%] w-24 h-32 bg-white rounded-lg shadow-xl transform -rotate-6 border-2 border-gray-300">
          <div className="absolute inset-0 flex flex-col items-center justify-between p-2">
            <div className="text-black font-bold text-2xl self-start">A</div>
            <div className="text-black font-bold text-5xl">♠</div>
            <div className="text-black font-bold text-2xl transform rotate-180 self-end">A</div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-radial from-black/30 via-black/60 to-black"></div>
      
      {/* تساقط أوراق البوكر */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, index) => {
          const cardType = index % 4;
          const cardSymbol = cardType === 0 ? '♠' : cardType === 1 ? '♥' : cardType === 2 ? '♣' : '♦';
          const cardColor = cardType === 0 || cardType === 2 ? '#333' : '#CC0000';
          
          const size = Math.random() * 0.8 + 0.5; // حجم عشوائي
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 15 + 5}s`;
          const animationDelay = `${Math.random() * 5}s`;
          const rotateAnimation = `${Math.random() * 10 + 2}s`;
          const rotateAmount = Math.random() * 360;
          const opacity = Math.random() * 0.7 + 0.3;
          
          // تأثير دوران 3D عشوائي
          const perspective = Math.random() * 500 + 300;
          const rotateX = Math.random() * 360;
          const rotateY = Math.random() * 360;
          
          return (
            <motion.div
              key={index}
              className="absolute"
              initial={{ opacity: 0, y: -100, rotate: 0 }}
              animate={{ 
                opacity: [0, opacity, opacity, 0],
                y: ['0vh', '100vh'],
                rotate: [0, rotateAmount, rotateAmount * 2],
              }}
              transition={{ 
                duration: parseFloat(animationDuration),
                delay: parseFloat(animationDelay),
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left,
                top: '-5%',
                fontSize: `${size}rem`,
                color: cardColor,
                textShadow: '0 0 3px rgba(0,0,0,0.5)',
                filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.7))',
                transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              }}
            >
              {cardSymbol}
            </motion.div>
          );
        })}
        
        {/* تساقط رقائق البوكر */}
        {Array.from({ length: 15 }).map((_, index) => {
          const size = Math.random() * 30 + 20; // حجم عشوائي
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 20 + 15}s`;
          const animationDelay = `${Math.random() * 10}s`;
          const rotateAnimation = `${Math.random() * 10 + 5}s`;
          const opacity = Math.random() * 0.5 + 0.3;
          
          return (
            <motion.div
              key={`chip-${index}`}
              className="absolute rounded-full"
              initial={{ opacity: 0, y: -50, rotate: 0 }}
              animate={{ 
                opacity: [0, opacity, opacity, 0],
                y: ['0vh', '100vh'],
                rotate: [0, 360, 720],
              }}
              transition={{ 
                duration: parseFloat(animationDuration),
                delay: parseFloat(animationDelay),
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left,
                top: '-5%',
                width: `${size}px`,
                height: `${size}px`,
                backgroundImage: 'radial-gradient(circle, #D4AF37, #BF9B30)',
                boxShadow: '0 0 10px rgba(212,175,55,0.6), inset 0 0 5px rgba(255,255,255,0.8)',
                border: '2px solid rgba(255,255,255,0.5)',
              }}
            >
              <div className="w-full h-full rounded-full border-4 border-dashed border-white/30 flex items-center justify-center">
                <div className="w-1/2 h-1/2 rounded-full bg-black/50"></div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* رسم كونفاس متحرك للخلفية */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-20"
      />
      
      {/* جسيمات متحركة 3D */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, index) => {
          const size = Math.random() * 4 + 2;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const blurAmount = Math.random() * 2 + 1;
          const duration = Math.random() * 30 + 30;
          const delay = Math.random() * 10;
          
          return (
            <motion.div
              key={`particle-${index}`}
              className="absolute rounded-full"
              initial={{ 
                left: `${x}%`, 
                top: `${y}%`, 
                width: `${size}px`, 
                height: `${size}px`,
                background: `rgba(212, 175, 55, ${Math.random() * 0.3 + 0.1})`,
                boxShadow: `0 0 ${blurAmount}px ${blurAmount}px rgba(212, 175, 55, 0.3)`,
              }}
              animate={{ 
                left: [`${x}%`, `${x + (Math.random() * 10 - 5)}%`, `${x}%`],
                top: [`${y}%`, `${y + (Math.random() * 10 - 5)}%`, `${y}%`],
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
      
      {/* شعار اللعبة محسن */}
      <div className="w-48 h-48 mb-10 relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0A1C1A] to-black border-8 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.7)] overflow-hidden animate-pulse-slow">
          <div className="absolute inset-0 bg-black/50"></div>
          <img 
            src="/assets/poker-icon-gold.png" 
            alt="Poker Logo" 
            className="w-full h-full object-contain p-2 filter drop-shadow-lg" 
          />
        </div>
        
        {/* تأثير توهج حول الشعار */}
        <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 filter blur-xl transform scale-110 animate-pulse-slow"></div>
        
        {/* ورقة لعب حمراء */}
        <div className="absolute -bottom-6 -right-20 w-20 h-24 rounded-lg bg-white border-4 border-[#D4AF37] shadow-xl flex flex-col items-center justify-between p-1 rotate-12 overflow-hidden">
          <span className="text-red-600 font-bold text-xl self-start">A</span>
          <span className="text-red-600 font-bold text-5xl">♥</span>
          <span className="text-red-600 font-bold text-xl transform rotate-180 self-end">A</span>
          
          {/* تأثير توهج على الورقة */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
        </div>
        
        {/* ورقة لعب سوداء */}
        <div className="absolute -top-6 -left-20 w-20 h-24 rounded-lg bg-white border-4 border-[#D4AF37] shadow-xl flex flex-col items-center justify-between p-1 -rotate-12 overflow-hidden">
          <span className="text-black font-bold text-xl self-start">A</span>
          <span className="text-black font-bold text-5xl">♠</span>
          <span className="text-black font-bold text-xl transform rotate-180 self-end">A</span>
          
          {/* تأثير توهج على الورقة */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>
      
      {/* شريط التحميل محسن مع العداد */}
      <div className="w-72 md:w-96 relative mb-12">
        {/* خلفية مزخرفة للشريط */}
        <div className="absolute inset-0 bg-black/50 rounded-lg p-1.5 backdrop-blur-sm border border-[#D4AF37]/20 shadow-lg">
          {/* شريط التحميل الأساسي */}
          <div className="relative h-6 w-full overflow-hidden rounded-md bg-gradient-to-br from-slate-900 to-slate-800 border border-[#D4AF37]/10">
            {/* مؤشر التقدم */}
            <div 
              className="h-full flex-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] transition-all relative"
              style={{ width: `${progress}%` }}
            >
              {/* تأثير اللمعان على الشريط */}
              <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
            </div>
            
            {/* النقاط المتحركة على الشريط */}
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-white/90 -translate-y-1/2 animate-pulse-slow"
                style={{ 
                  left: `${Math.min(100, progress + (i * 5) - 10)}%`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: Math.random() * 0.5 + 0.5
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* رقمي الآس عند طرفي الشريط بشكل أكثر وضوحاً */}
        <div className="absolute -top-5 -left-10 w-16 h-16 bg-slate-900 rounded-full border-2 border-[#D4AF37]/60 shadow-xl flex items-center justify-center text-[#D4AF37] font-bold text-xl z-10 animate-pulse-slow">
          A♠
        </div>
        
        <div className="absolute -top-5 -right-10 w-16 h-16 bg-slate-900 rounded-full border-2 border-[#D4AF37]/60 shadow-xl flex items-center justify-center text-red-500 font-bold text-xl z-10 animate-pulse-slow">
          A♥
        </div>
        
        {/* العداد بشكل أكثر وضوحاً */}
        <div className="flex justify-between mt-8">
          <span className="text-[#D4AF37] text-sm font-bold bg-slate-900/90 px-3 py-1 rounded-md border border-[#D4AF37]/30 shadow-lg">
            {Math.floor(progress) === 100 ? "اكتمل!" : "جاري التحميل..."}
          </span>
          <span className="text-white font-bold bg-slate-900/90 px-3 py-1 rounded-md border border-[#D4AF37]/30 shadow-lg">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      
      {/* عنوان تحت شريط التحميل بتأثير وميض محسن مع توهج متدرج */}
      <h1 
        className="text-6xl font-bold mt-2 mb-4 transition-all duration-100 tracking-wider"
        style={{
          color: 'rgba(212, 175, 55, 0.85)',
          filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.7))',
          textShadow: '0 0 12px rgba(212, 175, 55, 0.5)',
          transform: 'scale(1.015)',
        }}
      >
        بوكر تكساس عرباوي
      </h1>
      
      {/* تأثير توهج إضافي تحت النص */}
      <div 
        className="absolute h-4 w-80 rounded-full blur-xl -z-10 bg-[#D4AF37] opacity-30 transition-all duration-100"
        style={{
          opacity: 0.3,
          transform: 'scale(1.0)',
          bottom: "16%"
        }}
      ></div>
      
      {/* حالة التحميل والنص التحفيزي */}
      <div className="text-[#D4AF37] text-sm mt-2 font-bold bg-black/40 px-4 py-1 rounded-full border border-[#D4AF37]/20 shadow-inner">
        {title}...
      </div>
      
      {/* النص التحفيزي المتغير */}
      <AnimatePresence>
        {showMotivational && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 px-6 py-3 bg-black/30 backdrop-blur-sm border border-[#D4AF37]/10 rounded-lg max-w-md text-center"
          >
            <p className="text-white/80 text-sm italic">"{motivationalText}"</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* إضافة شعار VIP */}
      <div className="absolute bottom-5 right-5 flex items-center">
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold px-4 py-1 rounded-full text-sm border-2 border-white shadow-lg transform rotate-12">
          VIP
        </div>
        <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-l-full -mr-2 shadow-lg border border-[#D4AF37]/20">
          انضم للحصول على مميزات حصرية
        </div>
      </div>
      
      {/* شعار لموثوقية التعاملات */}
      <div className="absolute bottom-5 left-5 flex items-center">
        <div className="bg-black/70 backdrop-blur-sm text-[#D4AF37] text-xs px-3 py-1 rounded-full shadow-lg border border-[#D4AF37]/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          لعب آمن 100%
        </div>
      </div>
    </div>
  );
}