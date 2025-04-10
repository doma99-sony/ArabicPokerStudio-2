import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface CinematicIntroProps {
  onComplete: () => void;
}

/**
 * مكون المقدمة السينمائية للعبة ملكة مصر ثلاثية الأبعاد
 * يعرض مشهد سينمائي للدخول إلى معبد الملكة قبل بدء اللعبة
 */
const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [skipEnabled, setSkipEnabled] = useState<boolean>(false);
  
  // تشغيل المقدمة
  useEffect(() => {
    // تمكين زر التخطي بعد 2 ثانية
    const skipTimer = setTimeout(() => {
      setSkipEnabled(true);
    }, 2000);
    
    // تجهيز عناصر الصوت
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("عليك النقر على الشاشة أولاً لتشغيل الصوت"));
    }
    
    // تسلسل الرسوم المتحركة
    startAnimation();
    
    return () => {
      clearTimeout(skipTimer);
      // إيقاف جميع الرسوم المتحركة والأصوات عند إزالة المكون
      gsap.killTweensOf(".cinematic-element");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // التحكم في تسلسل الرسوم المتحركة حسب الخطوة الحالية
  useEffect(() => {
    if (currentStep === 1) {
      animateTempleColumns();
    } else if (currentStep === 2) {
      animateThrone();
    } else if (currentStep === 3) {
      animateFinalReveal();
    } else if (currentStep >= 4) {
      // انتهاء المقدمة
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [currentStep]);
  
  // بدء تسلسل الرسوم المتحركة
  const startAnimation = () => {
    if (!containerRef.current) return;
    
    // تعتيم الشاشة في البداية
    gsap.set(".cinematic-overlay", { opacity: 1 });
    
    // رسوم متحركة تدريجية للعنوان
    gsap.fromTo(
      ".cinematic-title",
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          // بعد ظهور العنوان، ننتقل للخطوة التالية
          gsap.to(".cinematic-title", { 
            opacity: 0, 
            y: -50, 
            duration: 1.5,
            delay: 1,
            onComplete: () => setCurrentStep(1)
          });
        }
      }
    );
  };
  
  // الرسوم المتحركة للأعمدة
  const animateTempleColumns = () => {
    // ظهور الأعمدة واحدًا تلو الآخر
    gsap.fromTo(
      ".temple-column",
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.8,
        stagger: 0.3,
        ease: "back.out(1.7)",
        onComplete: () => {
          // حركة الكاميرا بين الأعمدة
          gsap.to(".temple-columns-container", {
            x: "-100%",
            duration: 4,
            ease: "power1.inOut",
            onComplete: () => setCurrentStep(2)
          });
        }
      }
    );
  };
  
  // الرسوم المتحركة للعرش
  const animateThrone = () => {
    gsap.fromTo(
      ".throne-element",
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => {
          // ظهور شخصية الملكة (سيلويت فقط)
          gsap.fromTo(
            ".queen-silhouette",
            { opacity: 0 },
            { 
              opacity: 1, 
              duration: 2,
              onComplete: () => setCurrentStep(3)
            }
          );
        }
      }
    );
  };
  
  // الرسوم المتحركة النهائية
  const animateFinalReveal = () => {
    // وميض أبيض
    gsap.fromTo(
      ".flash-element",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          // ظهور اسم اللعبة النهائي وشعارها
          gsap.fromTo(
            ".final-logo",
            { opacity: 0, scale: 1.5 },
            { 
              opacity: 1, 
              scale: 1, 
              duration: 1,
              ease: "elastic.out(1, 0.5)",
              onComplete: () => setCurrentStep(4)
            }
          );
        }
      }
    );
  };
  
  // تخطي المقدمة
  const handleSkip = () => {
    if (!skipEnabled) return;
    onComplete();
  };
  
  return (
    <div 
      ref={containerRef} 
      className="cinematic-intro fixed inset-0 z-50 overflow-hidden bg-black text-white"
    >
      {/* طبقة التراكب للتحكم في الشفافية */}
      <div className="cinematic-overlay absolute inset-0 bg-black z-10"></div>
      
      {/* عنوان المقدمة */}
      <div className="cinematic-title absolute inset-0 flex items-center justify-center z-20">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 text-center px-4">
          <span className="block mb-2">رحلة إلى</span>
          <span className="block text-5xl md:text-7xl tracking-wider">معبد ملكة مصر</span>
        </h1>
      </div>
      
      {/* مشهد الأعمدة */}
      {currentStep >= 1 && (
        <div className="temple-columns-container absolute inset-0 flex items-center z-20">
          <div className="relative w-[300%] h-full flex items-center">
            {/* صف من الأعمدة المصرية */}
            {[...Array(6)].map((_, index) => (
              <div 
                key={index} 
                className={`temple-column w-1/6 h-full flex items-center justify-center ${index % 2 === 0 ? 'self-start' : 'self-end'}`}
              >
                <div className="w-24 md:w-32 h-screen-80 bg-gradient-to-b from-yellow-700 to-yellow-900 rounded-t-xl relative overflow-hidden">
                  {/* نقوش على العمود */}
                  <div className="absolute inset-0 flex flex-col justify-around overflow-hidden opacity-50">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-12 w-full flex justify-center items-center">
                        <div className="w-16 h-8 bg-yellow-400/20 rounded-sm"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* مشهد العرش */}
      {currentStep >= 2 && (
        <div className="throne-scene absolute inset-0 flex items-center justify-center z-20">
          <div className="throne-element relative w-64 h-80 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-t-2xl">
            {/* تفاصيل العرش */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-yellow-900 to-transparent"></div>
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-yellow-400 to-transparent"></div>
            
            {/* سيلويت الملكة */}
            <div className="queen-silhouette absolute bottom-0 inset-x-0 h-64 opacity-0">
              <div className="w-full h-full flex justify-center items-end">
                <div className="w-32 h-48 bg-black/50 rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* وميض أبيض للكشف النهائي */}
      <div className="flash-element absolute inset-0 bg-white z-30 opacity-0"></div>
      
      {/* الشعار النهائي */}
      {currentStep >= 3 && (
        <div className="final-logo absolute inset-0 flex flex-col items-center justify-center z-30 opacity-0">
          <div className="w-40 h-40 md:w-52 md:h-52 relative mb-8">
            {/* رسم تاج ملكة مصر */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <g>
                <path
                  d="M50,20 L70,40 L90,25 L80,65 L20,65 L10,25 L30,40 Z"
                  fill="#FFD700"
                  stroke="#FFF"
                  strokeWidth="1"
                />
                <circle cx="50" cy="20" r="5" fill="#FFFFFF" />
                <circle cx="30" cy="40" r="4" fill="#FFFFFF" />
                <circle cx="70" cy="40" r="4" fill="#FFFFFF" />
                <circle cx="10" cy="25" r="4" fill="#FFFFFF" />
                <circle cx="90" cy="25" r="4" fill="#FFFFFF" />
              </g>
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 text-center tracking-wider">
            ملكة مصر <span className="text-white">3D</span>
          </h1>
        </div>
      )}
      
      {/* زر التخطي */}
      <button 
        onClick={handleSkip}
        className={`absolute bottom-8 right-8 z-40 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-all ${skipEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        تخطي المقدمة
      </button>
      
      {/* الأصوات */}
      <audio ref={audioRef} loop={false} preload="auto">
        <source src="/assets/sounds/egyptian-cinematic.mp3" type="audio/mpeg" />
      </audio>
      
      {/* الأنماط المضمنة */}
      <style>{`
        .h-screen-80 {
          height: 80vh;
        }
        
        @keyframes temple-light {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        .temple-column:nth-child(odd) {
          animation: temple-light 4s infinite;
        }
        
        .temple-column:nth-child(even) {
          animation: temple-light 4s infinite reverse;
        }
      `}</style>
    </div>
  );
};

export default CinematicIntro;