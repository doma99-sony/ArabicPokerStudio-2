import { useState, useEffect, useRef } from "react";

interface DragonEffectProps {
  speed?: number;
  fireRate?: number;
  initialDelay?: number;
  dragonType?: 'fire' | 'ice' | 'thunder';
}

// وظائف مساعدة لتحريك التنين بشكل طبيعي
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// قوى الطبيعة
type ElementalPower = 'fire' | 'ice' | 'thunder';

// تكوين خصائص التنين بناءً على نوع القوة
const getDragonConfig = (type: ElementalPower) => {
  switch (type) {
    case 'fire':
      return {
        bodyColor: '#A91B0D',
        glowColor: '#FFDD00',
        fireColors: {
          inner: 'white',
          middle: '#FFDD00',
          outer: '#FF3700'
        },
        scale: 0.7,
        wingSpan: 1.2
      };
    case 'ice':
      return {
        bodyColor: '#0077be',
        glowColor: '#A5F2F3',
        fireColors: {
          inner: 'white',
          middle: '#A5F2F3',
          outer: '#0077be'
        },
        scale: 0.65,
        wingSpan: 1.1
      };
    case 'thunder':
      return {
        bodyColor: '#4B0082',
        glowColor: '#FFFF00',
        fireColors: {
          inner: 'white',
          middle: '#FFFF00',
          outer: '#4B0082'
        },
        scale: 0.8,
        wingSpan: 1.3
      };
    default:
      return {
        bodyColor: '#A91B0D',
        glowColor: '#FFDD00',
        fireColors: {
          inner: 'white',
          middle: '#FFDD00',
          outer: '#FF3700'
        },
        scale: 0.7,
        wingSpan: 1.2
      };
  }
};

export function DragonEffect({
  speed = 40,
  fireRate = 8000,
  initialDelay = 2000,
  dragonType = 'fire'
}: DragonEffectProps) {
  // حالة التنين
  const [dragonPosition, setDragonPosition] = useState({ x: -300, y: 150, z: 1 });
  const [targetPosition, setTargetPosition] = useState({ x: -300, y: 150 });
  const [breathingFire, setBreathingFire] = useState(false);
  const [visible, setVisible] = useState(false);
  const [direction, setDirection] = useState(1); // 1 للاتجاه من اليسار إلى اليمين، -1 من اليمين إلى اليسار
  const [flightPath, setFlightPath] = useState<{ x: number, y: number }[]>([]);
  const [pathIndex, setPathIndex] = useState(0);
  const [dragonConfig] = useState(getDragonConfig(dragonType));
  const [flyingUp, setFlyingUp] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0.6);
  
  // مراجع للرسوم المتحركة
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fireAudioRef = useRef<HTMLAudioElement | null>(null);
  const dragonAudioRef = useRef<HTMLAudioElement | null>(null);
  const pathTimeRef = useRef<number>(0);
  
  // إنشاء مسار رحلة جديد للتنين
  const createNewFlightPath = () => {
    // قم بإنشاء مسار مكون من 5-8 نقاط عشوائية على الشاشة
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const startSide = Math.random() > 0.5 ? 'left' : 'right';
    const points = [];
    const numPoints = Math.floor(Math.random() * 4) + 5; // 5-8 نقاط
    
    // نقطة البداية (خارج الشاشة)
    const startX = startSide === 'left' ? -400 : screenWidth + 400;
    const startY = Math.random() * (screenHeight * 0.7) + 100;
    points.push({ x: startX, y: startY });
    
    // نقاط متوسطة (داخل الشاشة)
    for (let i = 1; i < numPoints - 1; i++) {
      const point = {
        x: Math.random() * (screenWidth - 400) + 200,
        y: Math.random() * (screenHeight * 0.6) + 100
      };
      points.push(point);
    }
    
    // نقطة النهاية (خارج الشاشة من الجانب الآخر)
    const endX = startSide === 'left' ? screenWidth + 400 : -400;
    const endY = Math.random() * (screenHeight * 0.7) + 100;
    points.push({ x: endX, y: endY });
    
    // تعيين المسار الجديد
    setFlightPath(points);
    setPathIndex(0);
    setDirection(startSide === 'left' ? 1 : -1);
    
    // انقل التنين إلى النقطة الأولى من المسار
    setDragonPosition({ x: points[0].x, y: points[0].y, z: 1 });
    // حدد الهدف التالي كالنقطة الثانية في المسار
    setTargetPosition(points[1]);
    
    // إعادة تعيين مقياس التقدم
    progressRef.current = 0;
    
    return points;
  };
  
  // تحديث موقع التنين في كل إطار
  const updateDragonPosition = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // تحديث مقياس التقدم
    const progressIncrement = (speed * deltaTime) / 10000;
    progressRef.current += progressIncrement;
    
    // إذا وصلنا إلى الهدف، انتقل إلى النقطة التالية في المسار
    if (progressRef.current >= 1) {
      const nextIndex = pathIndex + 1;
      
      // إذا انتهى المسار، أنشئ مسارًا جديدًا
      if (nextIndex >= flightPath.length) {
        setVisible(false);
        
        // أنشئ مسارًا جديدًا بعد تأخير
        setTimeout(() => {
          const newPath = createNewFlightPath();
          setVisible(true);
          
          // تشغيل صوت التنين عند ظهوره
          if (dragonAudioRef.current) {
            dragonAudioRef.current.volume = 0.3;
            dragonAudioRef.current.currentTime = 0;
            dragonAudioRef.current.play().catch(() => {
              // تجاهل أخطاء تشغيل الصوت (قد تحدث بسبب قيود المتصفح)
            });
          }
        }, 2000 + Math.random() * 3000);
        
        animationRef.current = requestAnimationFrame(updateDragonPosition);
        return;
      }
      
      // انتقل إلى النقطة التالية في المسار
      setPathIndex(nextIndex);
      setTargetPosition(flightPath[nextIndex]);
      progressRef.current = 0;
      
      // تعديل الاتجاه بناءً على الحركة الأفقية
      const currentX = dragonPosition.x;
      const nextX = flightPath[nextIndex].x;
      if (nextX > currentX) {
        setDirection(1);
      } else if (nextX < currentX) {
        setDirection(-1);
      }
      
      // تعديل ارتفاع الطيران (للأعلى أو للأسفل)
      const currentY = dragonPosition.y;
      const nextY = flightPath[nextIndex].y;
      setFlyingUp(nextY < currentY);
      
      // تعديل عشوائي للدوران
      setRotation(Math.random() * 10 - 5);
      
      // تعديل عشوائي لتوهج التنين
      setGlowOpacity(0.4 + Math.random() * 0.4);
      
      // إضافة فرصة لإطلاق النار عند تغيير النقطة
      if (Math.random() < 0.3) {
        breathFire();
      }
    }
    
    // تدرج لتنعيم الحركة
    const progress = easeInOutQuad(progressRef.current);
    
    // حساب الموقع الجديد بناءً على التقدم الحالي
    const current = dragonPosition;
    const target = targetPosition;
    
    const newX = current.x + (target.x - current.x) * progress;
    const newY = current.y + (target.y - current.y) * progress;
    
    // تحديث حجم التنين (الأبعاد) بناءً على المسافة من المشاهد
    // تنين أصغر = أبعد، تنين أكبر = أقرب
    const distanceFactor = 0.8 + Math.sin(timestamp / 5000) * 0.2;
    
    // تحديث موقع التنين
    setDragonPosition({ 
      x: newX, 
      y: newY, 
      z: distanceFactor
    });
    
    // استمر في حلقة الرسوم المتحركة
    animationRef.current = requestAnimationFrame(updateDragonPosition);
  };
  
  // إطلاق النار
  const breathFire = () => {
    if (!visible || breathingFire) return; // لا تطلق النار إذا كان التنين غير مرئي أو يطلق النار بالفعل
    
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
    }, 2000 + Math.random() * 1000);
  };
  
  // بدء حلقة الرسوم المتحركة
  useEffect(() => {
    // تأخير البداية لتحميل الصفحة
    const initialTimer = setTimeout(() => {
      const initialPath = createNewFlightPath();
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
  
  // تنفيذ إطلاق النار بشكل دوري وعشوائي
  useEffect(() => {
    const randomFireInterval = () => fireRate + (Math.random() * 6000 - 3000); // تغيير عشوائي للتوقيت
    
    const fireTimer = setInterval(() => {
      if (visible && Math.random() > 0.4) { // 60% احتمالية إطلاق النار عند كل فاصل زمني
        breathFire();
      }
    }, randomFireInterval());
    
    return () => clearInterval(fireTimer);
  }, [visible, fireRate]);
  
  // لا شيء للعرض إذا لم يكن التنين مرئياً
  if (!visible) return null;
  
  // استخراج إعدادات تنين الأنمي
  const { bodyColor, glowColor, fireColors, scale, wingSpan } = dragonConfig;
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 30 }}
    >
      {/* تأثير التوهج من خلف التنين */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-500 mix-blend-screen"
        style={{
          left: `${dragonPosition.x - 150}px`,
          top: `${dragonPosition.y - 150}px`,
          opacity: breathingFire ? 0.8 : glowOpacity,
          backgroundColor: glowColor,
          transform: `scale(${dragonPosition.z * 1.2})`,
          filter: `blur(${40 * dragonPosition.z}px)`,
          zIndex: 29
        }}
      />
      
      {/* تنين الأنمي */}
      <div
        className="absolute transition-transform duration-300 transform-gpu"
        style={{
          left: `${dragonPosition.x}px`,
          top: `${dragonPosition.y}px`,
          transform: `
            translateZ(0)
            scaleX(${direction}) 
            scale(${scale * dragonPosition.z})
            rotate(${direction * (flyingUp ? -rotation : rotation)}deg)
          `,
          transformOrigin: 'center',
          width: '800px',
          height: '400px',
          zIndex: 30
        }}
      >
        {/* جسم تنين الأنمي - بخصائص أكثر تفصيلاً وواقعية */}
        <div className="relative w-full h-full">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transform-gpu"
          >
            {/* جسم التنين - مسار أكثر تعقيدًا للحصول على مظهر حقيقي */}
            <path
              d="M200 200 
                 C250 150, 350 140, 400 180 
                 C450 220, 500 220, 550 200 
                 C620 170, 650 190, 680 220 
                 C710 250, 700 280, 670 300 
                 C640 320, 610 330, 580 320 
                 C550 310, 500 300, 450 290 
                 C400 280, 350 290, 300 300 
                 C250 310, 200 320, 150 310 
                 C80 290, 50 250, 70 200 
                 C90 150, 150 150, 200 200Z"
              fill={`url(#dragon-body-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="3"
              className="animate-pulse-slow"
              filter="url(#dragon-shadow)"
            />
            
            {/* ذيل التنين المتموج */}
            <path
              d="M670 250 
                 C720 220, 750 200, 770 230 
                 C790 260, 780 290, 740 300 
                 C700 310, 660 290, 670 250Z"
              fill={`url(#dragon-body-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="2"
              className="animate-tail"
              filter="url(#dragon-shadow)"
            />
            
            {/* رأس التنين الحاد */}
            <path
              d="M120 200
                 C90 180, 70 150, 80 130
                 C90 110, 120 100, 150 110
                 C180 120, 200 150, 200 180
                 C200 210, 180 220, 150 220
                 C120 220, 90 220, 120 200Z"
              fill={`url(#dragon-head-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="3"
              filter="url(#dragon-shadow)"
            />
            
            {/* فك التنين */}
            <path
              d="M120 200
                 C100 210, 80 220, 60 210
                 C40 200, 30 180, 40 160
                 C50 140, 70 130, 90 140
                 C110 150, 120 170, 120 200Z"
              fill={`url(#dragon-head-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="2"
              filter="url(#dragon-shadow)"
            />
            
            {/* أنف وأنياب التنين */}
            <path 
              d="M60 180 C50 175, 40 170, 30 180" 
              stroke="#444" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M60 190 L45 200" 
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M70 190 L55 205" 
              stroke="white" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
            />
            
            {/* عيون التنين المتوهجة */}
            <circle cx="90" cy="160" r="12" fill={`url(#dragon-eye-gradient-${dragonType})`} className="animate-pulse" />
            <circle cx="90" cy="160" r="6" fill="#000000" />
            <circle cx="87" cy="157" r="3" fill="white" />
            
            {/* أجنحة التنين الضخمة */}
            <path
              d={`M350 180 
                  C320 80, 250 30, 200 60 
                  C250 70, 300 120, 350 180Z`}
              fill={`url(#dragon-wing-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="2"
              className="animate-wing"
              style={{ transformOrigin: '350px 180px', transform: `scaleY(${wingSpan})` }}
            />
            <path
              d={`M450 180 
                  C480 80, 550 30, 600 60 
                  C550 70, 500 120, 450 180Z`}
              fill={`url(#dragon-wing-gradient-${dragonType})`}
              stroke="#444"
              strokeWidth="2"
              className="animate-wing"
              style={{ animationDelay: '0.2s', transformOrigin: '450px 180px', transform: `scaleY(${wingSpan})` }}
            />
            
            {/* قرون التنين الحادة */}
            <path
              d="M120 140 C100 100, 90 80, 110 70 C130 60, 140 100, 120 140Z"
              fill={bodyColor}
              stroke="#444"
              strokeWidth="2"
              filter="url(#dragon-shadow)"
            />
            <path
              d="M160 130 C180 90, 190 70, 170 60 C150 50, 140 90, 160 130Z"
              fill={bodyColor}
              stroke="#444"
              strokeWidth="2"
              filter="url(#dragon-shadow)"
            />
            
            {/* نار التنين المتدفقة - مختلفة حسب نوع التنين */}
            {breathingFire && (
              <g className="dragon-fire">
                <path
                  d={`M30 180 
                      C-40 150, -120 180, -200 150 
                      C-150 170, -100 160, -50 180 
                      C-80 190, -120 200, -170 190 
                      C-130 200, -90 195, -40 210 
                      C-70 220, -120 230, -190 220`}
                  fill={`url(#fire-gradient-${dragonType})`}
                  stroke="none"
                  className="animate-fire"
                  style={{ transformOrigin: '30px 180px' }}
                />
                <ellipse 
                  cx="30" 
                  cy="180" 
                  rx="35" 
                  ry="25" 
                  fill={`url(#fire-center-gradient-${dragonType})`}
                  className="animate-pulse-fast" 
                />
                
                {/* جزيئات إضافية من النار (مختلفة حسب نوع التنين) */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={10 - i * 15}
                    cy={180 + (i % 2 === 0 ? 10 : -10) * Math.random()}
                    r={10 - i}
                    fill={i % 2 === 0 ? fireColors.middle : fireColors.outer}
                    className="animate-pulse-fast"
                    style={{ animationDuration: `${0.3 + Math.random() * 0.5}s` }}
                  />
                ))}
              </g>
            )}
            
            {/* التعريفات للتدرجات اللونية */}
            <defs>
              {/* تدرج لون جسم التنين */}
              <radialGradient id={`dragon-body-gradient-${dragonType}`} cx="0.5" cy="0.5" r="0.7" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={bodyColor} />
                <stop offset="70%" stopColor={`${bodyColor}dd`} />
                <stop offset="100%" stopColor={`${bodyColor}aa`} />
              </radialGradient>
              
              {/* تدرج لون رأس التنين */}
              <radialGradient id={`dragon-head-gradient-${dragonType}`} cx="0.4" cy="0.4" r="0.8" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={bodyColor} />
                <stop offset="80%" stopColor={`${bodyColor}dd`} />
                <stop offset="100%" stopColor={`${bodyColor}aa`} />
              </radialGradient>
              
              {/* تدرج لون أجنحة التنين */}
              <radialGradient id={`dragon-wing-gradient-${dragonType}`} cx="0.5" cy="0.3" r="0.8" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={bodyColor} />
                <stop offset="50%" stopColor={`${bodyColor}dd`} />
                <stop offset="90%" stopColor={`${bodyColor}99`} />
                <stop offset="100%" stopColor={`${bodyColor}77`} />
              </radialGradient>
              
              {/* تدرج لون عين التنين */}
              <radialGradient id={`dragon-eye-gradient-${dragonType}`} cx="0.5" cy="0.5" r="0.9" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="white" />
                <stop offset="40%" stopColor={glowColor} />
                <stop offset="100%" stopColor={bodyColor} />
              </radialGradient>
              
              {/* تدرج لون النار */}
              <radialGradient id={`fire-gradient-${dragonType}`} cx="0" cy="0.5" r="1.2" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={fireColors.inner} stopOpacity="0.9" />
                <stop offset="30%" stopColor={fireColors.middle} stopOpacity="0.8" />
                <stop offset="70%" stopColor={fireColors.outer} stopOpacity="0.6" />
                <stop offset="100%" stopColor={fireColors.outer} stopOpacity="0" />
              </radialGradient>
              
              {/* تدرج لون مركز النار */}
              <radialGradient id={`fire-center-gradient-${dragonType}`} cx="0.5" cy="0.5" r="0.9" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="white" />
                <stop offset="30%" stopColor={fireColors.inner} />
                <stop offset="70%" stopColor={fireColors.middle} />
                <stop offset="100%" stopColor={fireColors.outer} />
              </radialGradient>
              
              {/* ظل التنين */}
              <filter id="dragon-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="black" floodOpacity="0.3" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* إضافة تأثير الجزيئات المتطايرة من النار */}
      {breathingFire && (
        <div 
          className="absolute transition-all duration-300"
          style={{
            left: `${dragonPosition.x}px`,
            top: `${dragonPosition.y}px`,
            width: '600px',
            height: '400px',
            transform: `scaleX(${direction})`
          }}
        >
          <div className="relative w-full h-full">
            {/* جزيئات النار - تتكيف مع اتجاه التنين */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float-fire-particle"
                style={{
                  left: `-${50 + i * 10}px`,
                  top: `${180 + (Math.random() * 40 - 20)}px`,
                  width: `${8 - i * 0.5}px`,
                  height: `${8 - i * 0.5}px`,
                  backgroundColor: i % 2 === 0 ? fireColors.middle : fireColors.outer,
                  opacity: 0.7 - i * 0.05,
                  animationDuration: `${1 + Math.random()}s`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* تأثير الإضاءة المتغيرة على الشاشة عند إطلاق النار */}
      {breathingFire && (
        <div 
          className="fixed inset-0 pointer-events-none animate-fire-ambient"
          style={{ 
            background: `radial-gradient(circle at ${dragonPosition.x}px ${dragonPosition.y}px, ${fireColors.outer}22 0%, transparent 70%)`,
            zIndex: 15
          }}
        ></div>
      )}
    </div>
  );
}

// استخدام عنصر منفصل للنار المتطايرة
export function FireEmbers() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 25 }}>
      <div className="w-full h-full relative overflow-hidden opacity-70">
        {Array.from({ length: 30 }).map((_, index) => (
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
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    </div>
  );
}