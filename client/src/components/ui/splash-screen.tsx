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
      {/* خلفية البوكر */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Card suits as subtle background elements */}
        <div className="absolute top-[10%] left-[10%] text-[#D4AF37]/10 text-[200px] transform rotate-12">♠</div>
        <div className="absolute top-[20%] right-[15%] text-[#D4AF37]/10 text-[180px] transform -rotate-12">♥</div>
        <div className="absolute bottom-[15%] left-[20%] text-[#D4AF37]/10 text-[190px] transform rotate-45">♣</div>
        <div className="absolute bottom-[25%] right-[10%] text-[#D4AF37]/10 text-[170px] transform -rotate-20">♦</div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-radial from-black/60 via-black/80 to-black"></div>
      
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
      
      {/* شريط التحميل مع العداد */}
      <div className="w-64 md:w-80 relative mb-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800 border border-[#D4AF37]/30">
          <div 
            className="h-full flex-1 bg-gradient-to-r from-[#D4AF37] to-[#BF9B30] transition-all" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="absolute -top-6 right-0 text-white/70 text-sm">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="text-[#D4AF37]/80 text-sm mt-2">
        {title}...
      </div>
    </div>
  );
}