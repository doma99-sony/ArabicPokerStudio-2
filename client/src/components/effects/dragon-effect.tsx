import { useState, useEffect, useRef } from "react";

interface DragonEffectProps {
  speed?: number;
  fireRate?: number;
  initialDelay?: number;
}

export function DragonEffect({
  speed = 25,
  fireRate = 5000,
  initialDelay = 2000,
}: DragonEffectProps) {
  const [dragonPosition, setDragonPosition] = useState({ x: -300, y: 100 });
  const [breathingFire, setBreathingFire] = useState(false);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(1); // 1 للاتجاه من اليسار إلى اليمين، -1 من اليمين إلى اليسار
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fireAudioRef = useRef<HTMLAudioElement | null>(null);
  const dragonAudioRef = useRef<HTMLAudioElement | null>(null);

  // تحديث موقع التنين في كل إطار
  const updateDragonPosition = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    const screenWidth = window.innerWidth;
    
    setDragonPosition(prev => {
      // حساب الموقع الجديد بناءً على الاتجاه والسرعة
      let newX = prev.x + direction * (speed * deltaTime / 60);
      
      // تغيير الاتجاه عندما يصل إلى حدود الشاشة
      if ((direction > 0 && newX > screenWidth + 300) || (direction < 0 && newX < -300)) {
        // إخفاء التنين عند الخروج من الشاشة
        setVisible(false);
        
        // حدد موعد ظهور التنين في الجانب الآخر بعد تأخير عشوائي
        setTimeout(() => {
          // غير الاتجاه وحدد موقع البداية
          const newDirection = direction * -1;
          setDirection(newDirection);
          setDragonPosition({ 
            x: newDirection > 0 ? -300 : screenWidth + 300, 
            y: Math.random() * 150 + 50
          });
          setVisible(true);
          
          // تشغيل صوت التنين عند ظهوره
          if (dragonAudioRef.current) {
            dragonAudioRef.current.volume = 0.3;
            dragonAudioRef.current.currentTime = 0;
            dragonAudioRef.current.play().catch(() => {
              // تجاهل أخطاء تشغيل الصوت (قد تحدث بسبب قيود المتصفح)
            });
          }
        }, 3000 + Math.random() * 10000); // ظهور عشوائي بين 3-13 ثانية
        
        return prev; // حافظ على الموقع الحالي حتى يُعاد تحديده
      }
      
      return { ...prev, x: newX };
    });
    
    animationRef.current = requestAnimationFrame(updateDragonPosition);
  };
  
  // إطلاق النار
  const breathFire = () => {
    if (!visible) return; // لا تطلق النار إذا كان التنين غير مرئي
    
    setBreathingFire(true);
    
    // تشغيل صوت النار
    if (fireAudioRef.current) {
      fireAudioRef.current.volume = 0.4;
      fireAudioRef.current.currentTime = 0;
      fireAudioRef.current.play().catch(() => {
        // تجاهل أخطاء تشغيل الصوت
      });
    }
    
    // إيقاف إطلاق النار بعد فترة
    setTimeout(() => {
      setBreathingFire(false);
    }, 2000);
  };
  
  // بدء حلقة الرسوم المتحركة
  useEffect(() => {
    // تأخير البداية لتحميل الصفحة
    const initialTimer = setTimeout(() => {
      setVisible(true);
      animationRef.current = requestAnimationFrame(updateDragonPosition);
    }, initialDelay);
    
    // إعداد الأصوات
    fireAudioRef.current = new Audio("/sounds/dragon-fire.mp3");
    dragonAudioRef.current = new Audio("/sounds/dragon-roar.mp3");
    
    // تنظيف
    return () => {
      clearTimeout(initialTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // تنفيذ إطلاق النار بشكل دوري
  useEffect(() => {
    const randomFireInterval = () => fireRate + (Math.random() * 3000 - 1500); // تغيير عشوائي للتوقيت
    
    const fireTimer = setInterval(() => {
      if (visible && Math.random() > 0.3) { // 70% احتمالية إطلاق النار عند كل فاصل زمني
        breathFire();
      }
    }, randomFireInterval());
    
    return () => clearInterval(fireTimer);
  }, [visible, fireRate]);
  
  // لا شيء للعرض إذا لم يكن التنين مرئياً
  if (!visible) return null;
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 30 }}
    >
      <div
        className="absolute transform-gpu transition-transform duration-300"
        style={{
          left: `${dragonPosition.x}px`,
          top: `${dragonPosition.y}px`,
          transform: `scaleX(${direction}) scale(0.6)`,
          transformOrigin: 'center',
          width: '600px',
          height: '300px',
        }}
      >
        {/* جسم التنين */}
        <div className="relative w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 600 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform-gpu"
          >
            {/* جسم التنين */}
            <path
              d="M150 150 C200 100, 300 100, 350 150 C400 200, 450 200, 500 150 C550 100, 560 120, 570 150 C580 180, 560 200, 550 220 C540 240, 530 250, 510 250 C490 250, 450 230, 400 230 C350 230, 300 250, 250 250 C200 250, 150 230, 100 200 C50 170, 30 150, 40 130 C50 110, 100 120, 150 150Z"
              fill="url(#dragon-gradient)"
              stroke="#731C1C"
              strokeWidth="3"
              className="animate-pulse-slow"
            />
            
            {/* رأس التنين */}
            <ellipse cx="80" cy="120" rx="50" ry="30" fill="url(#dragon-head-gradient)" stroke="#731C1C" strokeWidth="3" />
            
            {/* عين التنين */}
            <circle cx="60" cy="110" r="8" fill="#FFD700" className="animate-pulse" />
            <circle cx="60" cy="110" r="4" fill="#000000" />
            
            {/* أجنحة التنين */}
            <path
              d="M250 150 C220 50, 150 20, 100 50 C150 60, 200 100, 250 150Z"
              fill="url(#dragon-wing-gradient)"
              stroke="#731C1C"
              strokeWidth="2"
              className="animate-wing"
            />
            <path
              d="M350 150 C380 70, 450 30, 500 60 C450 70, 400 100, 350 150Z"
              fill="url(#dragon-wing-gradient)"
              stroke="#731C1C"
              strokeWidth="2"
              className="animate-wing"
              style={{ animationDelay: '0.2s' }}
            />
            
            {/* ذيل التنين */}
            <path
              d="M550 150 C600 120, 620 100, 620 150 C620 200, 580 220, 550 180 Z"
              fill="url(#dragon-gradient)"
              stroke="#731C1C"
              strokeWidth="2"
              className="animate-tail"
            />
            
            {/* قرون التنين */}
            <path
              d="M40 100 C20 70, 10 50, 20 40 C30 30, 50 60, 40 100Z"
              fill="#731C1C"
              stroke="#510000"
              strokeWidth="2"
            />
            <path
              d="M70 90 C90 60, 100 40, 90 30 C80 20, 60 50, 70 90Z"
              fill="#731C1C"
              stroke="#510000"
              strokeWidth="2"
            />
            
            {/* نار التنين */}
            {breathingFire && (
              <g className="dragon-fire">
                <path
                  d="M30 120 C-50 100, -100 140, -150 120 C-100 125, -50 110, 0 120 C-50 130, -100 150, -150 140 C-100 145, -50 135, 0 140 C-50 145, -100 155, -150 160"
                  fill="url(#fire-gradient)"
                  stroke="none"
                  className="animate-fire"
                />
                <circle cx="10" cy="120" r="25" fill="url(#fire-center-gradient)" className="animate-pulse-fast" />
              </g>
            )}
            
            {/* التعريفات للتدرجات اللونية */}
            <defs>
              <radialGradient id="dragon-gradient" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#A91B0D" />
                <stop offset="50%" stopColor="#731C1C" />
                <stop offset="100%" stopColor="#510000" />
              </radialGradient>
              
              <radialGradient id="dragon-head-gradient" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#C01B0D" />
                <stop offset="70%" stopColor="#731C1C" />
                <stop offset="100%" stopColor="#510000" />
              </radialGradient>
              
              <radialGradient id="dragon-wing-gradient" cx="0.5" cy="0.5" r="0.7" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#C01B0D" />
                <stop offset="60%" stopColor="#731C1C" />
                <stop offset="100%" stopColor="#510000" />
              </radialGradient>
              
              <radialGradient id="fire-gradient" cx="0" cy="0.5" r="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="#FFDD00" />
                <stop offset="40%" stopColor="#FF6B00" />
                <stop offset="80%" stopColor="#FF3700" />
                <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
              </radialGradient>
              
              <radialGradient id="fire-center-gradient" cx="0.5" cy="0.5" r="0.8" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="white" />
                <stop offset="20%" stopColor="#FFDD00" />
                <stop offset="60%" stopColor="#FF6B00" />
                <stop offset="100%" stopColor="#FF3700" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* إضافة تأثير تساقط الرماد */}
      {breathingFire && (
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-full h-24 overflow-hidden opacity-30 pointer-events-none">
            <div className="fire-ash-particles"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// استخدام عنصر منفصل للنار المتطايرة
export function FireEmbers() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 25 }}>
      <div className="w-full h-full relative overflow-hidden opacity-70">
        {Array.from({ length: 15 }).map((_, index) => (
          <div 
            key={index}
            className="absolute bg-gradient-to-b from-amber-500 to-red-600 rounded-full animate-float-embers"
            style={{
              width: `${Math.random() * 10 + 3}px`,
              height: `${Math.random() * 10 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 30 + 60}%`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDuration: `${Math.random() * 3 + 4}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}