import React, { useRef, useEffect } from "react";

interface RocketProps {
  gameStatus: 'waiting' | 'flying' | 'crashed';
  currentMultiplier: number | null;
}

const EgyptRocket: React.FC<RocketProps> = ({ gameStatus, currentMultiplier }) => {
  const rocketRef = useRef<HTMLDivElement>(null);
  
  // تأثير لتحريك الصاروخ بناءً على المضاعف الحالي
  useEffect(() => {
    if (gameStatus === 'flying' && currentMultiplier && rocketRef.current) {
      const maxHeight = window.innerHeight * 0.6; // ارتفاع الحد الأقصى للصاروخ (60% من ارتفاع النافذة)
      const progress = Math.min(1, (currentMultiplier - 1) / 9); // التقدم من 0 إلى 1 (من مضاعف 1 إلى 10)
      const newY = maxHeight * progress;
      rocketRef.current.style.transform = `translateY(-${newY}px)`;
    } else if (gameStatus === 'waiting' && rocketRef.current) {
      // إعادة تعيين موضع الصاروخ
      rocketRef.current.style.transform = 'translateY(0)';
    }
  }, [gameStatus, currentMultiplier]);

  return (
    <div 
      ref={rocketRef} 
      className="absolute left-1/2 bottom-0 transform -translate-x-1/2 transition-transform duration-100"
      style={{ 
        transitionTimingFunction: "linear",
      }}
    >
      <div className={`
        relative
        ${gameStatus === 'crashed' ? 'animate-bounce rotate-45' : ''}
      `}>
        {/* الصاروخ المصري بألوان علم مصر */}
        <div className="h-20 w-10 relative">
          {/* جسم الصاروخ - أحمر */}
          <div className="absolute top-6 h-14 w-10 bg-red-600 rounded-t-full"></div>
          
          {/* شريط أبيض */}
          <div className="absolute top-10 h-3 w-10 bg-white"></div>
          
          {/* شريط أسود */}
          <div className="absolute top-13 h-3 w-10 bg-black"></div>
          
          {/* رأس الصاروخ - ذهبي */}
          <div className="absolute top-0 h-6 w-10 bg-yellow-500 rounded-t-full flex items-center justify-center">
            {/* نجمة على رأس الصاروخ */}
            <div className="text-white text-xs">★</div>
          </div>
          
          {/* أجنحة الصاروخ */}
          <div className="absolute top-14 left-[-6px] h-6 w-6 bg-red-600 transform rotate-45"></div>
          <div className="absolute top-14 right-[-6px] h-6 w-6 bg-red-600 transform -rotate-45"></div>
          
          {/* لهب الصاروخ */}
          <div className={`
            absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-10
            ${gameStatus === 'flying' ? 'bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full blur-md animate-pulse' : 'hidden'}
          `}></div>
        </div>
      </div>
    </div>
  );
};

export default EgyptRocket;