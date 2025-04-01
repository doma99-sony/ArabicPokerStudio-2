import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState('تحميل الموارد');
  
  useEffect(() => {
    // إنشاء عداد يزداد تدريجياً
    let interval: NodeJS.Timeout;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            // قم بإنهاء شاشة البداية بعد اكتمال التحميل
            setTimeout(() => onComplete(), 500);
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
          
          const increment = Math.floor(Math.random() * 3) + 1;
          return Math.min(prevProgress + increment, 100);
        });
      }, 100);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [onComplete]);

  // تأثير النص المضيء بشكل متموج وطبيعي
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [isTextGlowing, setIsTextGlowing] = useState(true);
  
  useEffect(() => {
    let direction = 1; // 1 للزيادة، -1 للنقصان
    let value = 0.5;
    
    // إنشاء تأثير نبض متموج بدلاً من تبديل ثنائي بسيط
    const pulseInterval = setInterval(() => {
      value += 0.03 * direction;
      
      // عكس الاتجاه عند الوصول للحدود
      if (value >= 1) {
        direction = -1;
        value = 1;
      } else if (value <= 0) {
        direction = 1;
        value = 0;
      }
      
      setGlowIntensity(value);
      setIsTextGlowing(value > 0.5); // لإبقاء التأثير الموجود للاحتفاظ بالتوافق
    }, 30); // تحديث أكثر تواتراً للحصول على انتقال أكثر سلاسة
    
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
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
      
      {/* تساقط الثلج */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, index) => {
          const size = Math.random() * 0.8 + 0.3; // حجم عشوائي
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${Math.random() * 10 + 5}s`;
          const animationDelay = `${Math.random() * 5}s`;
          const opacity = Math.random() * 0.7 + 0.3;
          
          return (
            <div
              key={index}
              className="absolute animate-snow"
              style={{
                left,
                top: '-5%',
                fontSize: `${size}rem`,
                animationDuration,
                animationDelay,
                opacity
              }}
            >
              <span role="img" aria-label="snowflake">❄️</span>
            </div>
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
          color: `rgba(212, 175, 55, ${0.7 + (glowIntensity * 0.3)})`,
          filter: `drop-shadow(0 0 ${2 + (glowIntensity * 8)}px rgba(212, 175, 55, ${0.4 + (glowIntensity * 0.6)}))`,
          textShadow: `0 0 ${5 + (glowIntensity * 15)}px rgba(212, 175, 55, ${0.3 + (glowIntensity * 0.4)})`,
          transform: `scale(${1 + (glowIntensity * 0.03)})`,
        }}
      >
        بوكر تكساس عرباوي
      </h1>
      
      {/* تأثير توهج إضافي تحت النص */}
      <div 
        className="absolute h-4 w-80 rounded-full blur-xl -z-10 bg-[#D4AF37] opacity-30 transition-all duration-100"
        style={{
          opacity: 0.1 + (glowIntensity * 0.3),
          transform: `scale(${0.8 + (glowIntensity * 0.4)})`,
          bottom: "16%"
        }}
      ></div>
      
      <div className="text-[#D4AF37] text-sm mt-2 font-bold bg-black/40 px-4 py-1 rounded-full border border-[#D4AF37]/20 shadow-inner">
        {title}...
      </div>
    </div>
  );
}