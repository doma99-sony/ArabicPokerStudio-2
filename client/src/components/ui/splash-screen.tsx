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

  // تأثير النص المضيء
  const [isTextGlowing, setIsTextGlowing] = useState(true);
  
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setIsTextGlowing(prev => !prev);
    }, 800);
    
    return () => clearInterval(glowInterval);
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
      
      {/* شعار اللعبة وعنوانها */}
      <div className="w-32 h-32 mb-6 relative">
        <img 
          src="/assets/poker-logo-alt.jpeg" 
          alt="Poker Logo" 
          className="w-full h-full object-cover rounded-full border-4 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.5)]" 
        />
        <div className="absolute -bottom-4 -right-20 w-16 h-16 rounded-full bg-red-600 border-2 border-white shadow-md flex items-center justify-center rotate-12">
          <span className="text-white font-bold text-xl">A</span>
        </div>
        <div className="absolute -top-4 -left-16 w-14 h-14 rounded-full bg-black border-2 border-white shadow-md flex items-center justify-center -rotate-12">
          <span className="text-white font-bold text-xl">♠</span>
        </div>
      </div>
      
      <h1 
        className={`text-4xl font-bold mb-8 ${
          isTextGlowing 
            ? 'text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.7)]' 
            : 'text-[#BF9B30]'
        } transition-all duration-500`}
      >
        بوكر تكساس عرباوي
      </h1>
      
      {/* شريط التحميل محسن مع العداد */}
      <div className="w-64 md:w-80 relative mb-6">
        {/* خلفية مزخرفة للشريط */}
        <div className="absolute inset-0 bg-black/50 rounded-lg p-1.5 backdrop-blur-sm border border-[#D4AF37]/20 shadow-lg">
          {/* شريط التحميل الأساسي */}
          <div className="relative h-5 w-full overflow-hidden rounded-md bg-gradient-to-br from-slate-900 to-slate-800 border border-[#D4AF37]/10">
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
        
        {/* رقمي الآس عند طرفي الشريط */}
        <div className="absolute -top-4 -left-8 w-12 h-12 bg-slate-900 rounded-full border-2 border-[#D4AF37]/40 shadow-lg flex items-center justify-center text-[#D4AF37] font-bold text-lg z-10">
          A♠
        </div>
        
        <div className="absolute -top-4 -right-8 w-12 h-12 bg-slate-900 rounded-full border-2 border-[#D4AF37]/40 shadow-lg flex items-center justify-center text-red-500 font-bold text-lg z-10">
          A♥
        </div>
        
        {/* العداد */}
        <div className="flex justify-between mt-8">
          <span className="text-[#D4AF37]/90 text-sm font-bold bg-slate-900/80 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
            {Math.floor(progress) === 100 ? "اكتمل!" : "جاري التحميل..."}
          </span>
          <span className="text-white font-bold bg-slate-900/80 px-2 py-0.5 rounded-md border border-[#D4AF37]/20">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      
      <div className="text-[#D4AF37]/80 text-sm mt-2">
        {title}...
      </div>
    </div>
  );
}