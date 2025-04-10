import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface ScrollBackgroundProps {
  isRevealed?: boolean;
  bgImage?: string;
  layerImage1?: string;
  layerImage2?: string;
  children?: React.ReactNode;
}

/**
 * مكون خلفية متحركة بتأثير البردية المصرية المتفتحة وتأثير parallax
 * يعرض خلفية اللعبة مع تأثير فتح وطي البردية المصرية وحركة أفقية للطبقات
 */
const ScrollBackground: React.FC<ScrollBackgroundProps> = ({
  isRevealed = true,
  bgImage = '/images/egypt-papyrus-bg.jpg',
  layerImage1 = '/images/egypt-hieroglyphs-layer.png',
  layerImage2 = '/images/egypt-symbols-layer.png',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const parallaxLayer1Ref = useRef<HTMLDivElement>(null);
  const parallaxLayer2Ref = useRef<HTMLDivElement>(null);
  const symbolsRef = useRef<HTMLDivElement>(null);
  
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  
  // تطبيق تأثير البردية المتفتحة عند تغيير الحالة
  useEffect(() => {
    if (!containerRef.current || !scrollRef.current || !contentRef.current) return;
    
    // إلغاء الرسوم المتحركة الحالية
    gsap.killTweensOf([
      scrollRef.current, 
      contentRef.current, 
      parallaxLayer1Ref.current, 
      parallaxLayer2Ref.current,
      symbolsRef.current
    ]);
    
    if (isRevealed) {
      // فتح البردية
      const tl = gsap.timeline({
        onComplete: () => {
          // بدء الحركة الأفقية المستمرة بعد الانتهاء من الفتح
          startHorizontalScrolling();
        }
      });
      
      tl.to(scrollRef.current, {
        scaleY: 1,
        duration: 1.2,
        ease: "back.out(1.2)"
      })
      .to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.4")
      .to([parallaxLayer1Ref.current, parallaxLayer2Ref.current], {
        opacity: 1,
        duration: 0.8,
        stagger: 0.2
      }, "-=0.6")
      .fromTo(symbolsRef.current, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, 
        "-=0.4"
      );
      
    } else {
      // طي البردية وإيقاف الحركة الأفقية
      stopHorizontalScrolling();
      
      gsap.timeline()
        .to(symbolsRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.3
        })
        .to([parallaxLayer1Ref.current, parallaxLayer2Ref.current], {
          opacity: 0,
          duration: 0.5,
          stagger: 0.1
        }, "-=0.2")
        .to(contentRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.in"
        }, "-=0.4")
        .to(scrollRef.current, {
          scaleY: 0.05,
          duration: 0.8,
          ease: "back.in(1.2)"
        }, "-=0.2");
    }
  }, [isRevealed]);
  
  // حركة الخلفية أفقياً
  const startHorizontalScrolling = () => {
    if (!parallaxLayer1Ref.current || !parallaxLayer2Ref.current) return;
    setIsScrolling(true);
    
    // حركة الطبقة الأولى (بطيئة)
    gsap.to(parallaxLayer1Ref.current, {
      backgroundPosition: '100% 0%',
      duration: 90,
      repeat: -1,
      ease: "none"
    });
    
    // حركة الطبقة الثانية (أسرع)
    gsap.to(parallaxLayer2Ref.current, {
      backgroundPosition: '100% 0%',
      duration: 60,
      repeat: -1,
      ease: "none",
      reversed: true // اتجاه معاكس
    });
  };
  
  // إيقاف حركة الخلفية
  const stopHorizontalScrolling = () => {
    if (!parallaxLayer1Ref.current || !parallaxLayer2Ref.current) return;
    setIsScrolling(false);
    
    gsap.killTweensOf([parallaxLayer1Ref.current, parallaxLayer2Ref.current]);
  };
  
  // تغيير اتجاه التمرير عند النقر على الخلفية
  const handleBackgroundClick = () => {
    if (!isScrolling || !parallaxLayer1Ref.current || !parallaxLayer2Ref.current) return;
    
    // إنشاء تأثير التمرير في الاتجاه المعاكس
    gsap.to(parallaxLayer1Ref.current, {
      backgroundPosition: gsap.getProperty(parallaxLayer1Ref.current, "backgroundPosition") === "100% 0%" ? "0% 0%" : "100% 0%",
      duration: 90,
      repeat: -1,
      ease: "none",
      overwrite: true
    });
    
    gsap.to(parallaxLayer2Ref.current, {
      backgroundPosition: gsap.getProperty(parallaxLayer2Ref.current, "backgroundPosition") === "100% 0%" ? "0% 0%" : "100% 0%",
      duration: 60,
      repeat: -1,
      ease: "none",
      overwrite: true
    });
  };
  
  return (
    <div 
      ref={containerRef}
      className="scroll-background relative w-full h-full overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {/* الخلفية المظلمة */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-0"></div>
      
      {/* تأثيرات ضوئية للخلفية */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-yellow-500/10 blur-3xl rounded-full z-0 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-yellow-500/10 blur-3xl rounded-full z-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      {/* العناصر الزخرفية الفرعونية */}
      <div className="absolute top-4 left-4 w-16 h-16 opacity-30 z-10">
        <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,10 L40,25 L25,40 L10,25 Z" fill="#D4AF37" />
          <circle cx="25" cy="25" r="3" fill="#FFF" />
        </svg>
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16 opacity-30 z-10">
        <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,10 L40,25 L25,40 L10,25 Z" fill="#D4AF37" />
          <circle cx="25" cy="25" r="3" fill="#FFF" />
        </svg>
      </div>
      
      {/* حاوية البردية */}
      <div 
        ref={scrollRef}
        className="absolute inset-0 origin-top bg-cover bg-center z-20"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          transformOrigin: 'center top',
          transform: `scaleY(${isRevealed ? 1 : 0.05})`
        }}
      >
        {/* طبقة تأثيرات البردية */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/10 to-yellow-900/20 z-0"></div>
        
        {/* طبقات parallax للعمق */}
        <div 
          ref={parallaxLayer1Ref} 
          className="absolute inset-0 bg-repeat-x z-10 opacity-0"
          style={{
            backgroundImage: `url(${layerImage1})`,
            backgroundSize: 'auto 100%',
            backgroundPosition: '0% 0%'
          }}
        ></div>
        
        <div 
          ref={parallaxLayer2Ref} 
          className="absolute inset-0 bg-repeat-x z-11 opacity-0"
          style={{
            backgroundImage: `url(${layerImage2})`,
            backgroundSize: 'auto 80%',
            backgroundPosition: '0% 0%',
            mixBlendMode: 'overlay'
          }}
        ></div>
        
        {/* الأطراف المزخرفة للبردية */}
        <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-yellow-800/50 to-transparent z-12"></div>
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-yellow-800/50 to-transparent z-12"></div>
        
        {/* العناصر الزخرفية المتحركة على البردية */}
        <div ref={symbolsRef} className="absolute inset-0 z-13 opacity-0">
          {/* شكل العين المصرية (عين حورس) */}
          <div className="absolute top-4 left-8 w-20 h-10 opacity-30">
            <svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5,15 Q15,0 30,15 T55,15" stroke="#D4AF37" strokeWidth="2" fill="none" />
              <circle cx="30" cy="15" r="5" fill="#D4AF37" />
              <path d="M25,25 L30,15 L35,25" stroke="#D4AF37" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          {/* هرم مصري */}
          <div className="absolute top-4 right-8 w-20 h-20 opacity-30">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30,5 L55,55 H5 Z" fill="#D4AF37" />
              <path d="M30,5 L30,55" stroke="#FFF" strokeWidth="0.5" strokeDasharray="2" />
            </svg>
          </div>
          
          {/* خنفساء الجعران المصرية */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-16 opacity-30">
            <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="30" cy="25" rx="25" ry="15" fill="#D4AF37" />
              <path d="M15,25 Q30,5 45,25" stroke="#FFF" strokeWidth="1" fill="none" />
              <circle cx="20" cy="20" r="3" fill="#FFF" />
              <circle cx="40" cy="20" r="3" fill="#FFF" />
            </svg>
          </div>
        </div>
        
        {/* العناصر الزخرفية على حواف البردية */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-80 h-4 flex items-center justify-center z-14">
          <div className="w-64 h-0.5 bg-gradient-to-r from-yellow-900/0 via-yellow-900/50 to-yellow-900/0"></div>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-80 h-4 flex items-center justify-center z-14">
          <div className="w-64 h-0.5 bg-gradient-to-r from-yellow-900/0 via-yellow-900/50 to-yellow-900/0"></div>
        </div>
        
        {/* محتوى البردية الرئيسي */}
        <div 
          ref={contentRef}
          className="scroll-content absolute inset-0 z-30 flex items-center justify-center px-8 py-12"
          style={{ 
            opacity: isRevealed ? 1 : 0,
            transform: `translateY(${isRevealed ? '0px' : '20px'})`
          }}
        >
          {children}
        </div>
      </div>
      
      {/* النقوش والزخارف المصرية على الجوانب */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-4 z-40">
        <div className="h-full w-full flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 w-full flex justify-center items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-600/30"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-1/4 bottom-1/4 w-4 z-40">
        <div className="h-full w-full flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 w-full flex justify-center items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-600/30"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* تلميح للمستخدم */}
      {isScrolling && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400/70 z-50 animate-pulse">
          انقر لتغيير اتجاه البردية
        </div>
      )}
      
      {/* أنماط إضافية */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.2); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        
        .scroll-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
          z-index: 45;
          pointer-events: none;
        }
        
        .scroll-background::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
          z-index: 45;
          pointer-events: none;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-reverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default ScrollBackground;