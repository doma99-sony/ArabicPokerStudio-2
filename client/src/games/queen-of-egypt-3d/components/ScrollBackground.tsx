import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ScrollBackgroundProps {
  isRevealed?: boolean;
  bgImage?: string;
  children?: React.ReactNode;
}

/**
 * مكون خلفية متحركة بتأثير البردية المصرية المتفتحة
 * يعرض خلفية اللعبة مع تأثير فتح وطي البردية المصرية
 */
const ScrollBackground: React.FC<ScrollBackgroundProps> = ({
  isRevealed = true,
  bgImage = '/images/egypt-papyrus-bg.jpg',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // تطبيق تأثير البردية المتفتحة عند تغيير الحالة
  useEffect(() => {
    if (!containerRef.current || !scrollRef.current || !contentRef.current) return;
    
    // إلغاء الرسوم المتحركة الحالية
    gsap.killTweensOf([scrollRef.current, contentRef.current]);
    
    if (isRevealed) {
      // فتح البردية
      gsap.timeline()
        .to(scrollRef.current, {
          scaleY: 1,
          duration: 1.2,
          ease: "back.out(1.2)"
        })
        .to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.4");
    } else {
      // طي البردية
      gsap.timeline()
        .to(contentRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.in"
        })
        .to(scrollRef.current, {
          scaleY: 0.05,
          duration: 0.8,
          ease: "back.in(1.2)"
        }, "-=0.2");
    }
  }, [isRevealed]);
  
  return (
    <div 
      ref={containerRef}
      className="scroll-background relative w-full h-full overflow-hidden"
    >
      {/* الخلفية المظلمة */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80 z-0"></div>
      
      {/* تأثيرات ضوئية للخلفية */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-yellow-500/10 blur-3xl rounded-full z-0 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-yellow-500/10 blur-3xl rounded-full z-0 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      {/* العناصر الزخرفية الفرعونية */}
      <div className="absolute top-0 left-0 w-16 h-16 opacity-30 z-10">
        <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M25,10 L40,25 L25,40 L10,25 Z" fill="#D4AF37" />
          <circle cx="25" cy="25" r="3" fill="#FFF" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 opacity-30 z-10">
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
        
        {/* الأطراف المزخرفة للبردية */}
        <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-yellow-800/50 to-transparent z-10"></div>
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-yellow-800/50 to-transparent z-10"></div>
        
        {/* العناصر الزخرفية على البردية */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-80 h-4 flex items-center justify-center z-20">
          <div className="w-64 h-0.5 bg-gradient-to-r from-yellow-900/0 via-yellow-900/50 to-yellow-900/0"></div>
        </div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-80 h-4 flex items-center justify-center z-20">
          <div className="w-64 h-0.5 bg-gradient-to-r from-yellow-900/0 via-yellow-900/50 to-yellow-900/0"></div>
        </div>
        
        {/* محتوى البردية */}
        <div 
          ref={contentRef}
          className="scroll-content absolute inset-0 z-30 flex items-center justify-center p-8"
          style={{ 
            opacity: isRevealed ? 1 : 0,
            transform: `translateY(${isRevealed ? '0px' : '20px'})`
          }}
        >
          {children}
        </div>
      </div>
      
      {/* النقوش والزخارف المصرية على الجوانب */}
      <div className="absolute left-0 top-1/4 bottom-1/4 w-4 z-30">
        <div className="h-full w-full flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 w-full flex justify-center items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-600/30"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-1/4 bottom-1/4 w-4 z-30">
        <div className="h-full w-full flex flex-col justify-around">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 w-full flex justify-center items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-600/30"></div>
            </div>
          ))}
        </div>
      </div>
      
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
          z-index: 25;
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
          z-index: 25;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ScrollBackground;