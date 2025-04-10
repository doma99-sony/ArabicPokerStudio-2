import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface AnimatedCoinCounterProps {
  initialValue: number;
  targetValue: number;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  duration?: number;
  coinsCount?: number;
}

/**
 * مكون عداد أرباح متحرك مع تأثير العملات المتطايرة
 * يستخدم في عرض المكاسب بطريقة تفاعلية وجذابة
 */
const AnimatedCoinCounter: React.FC<AnimatedCoinCounterProps> = ({
  initialValue,
  targetValue,
  onComplete,
  size = 'medium',
  duration = 2,
  coinsCount = 15
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState<number>(initialValue);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);

  // تحديد الحجم بناءً على الخيار المحدد
  const getSize = () => {
    switch (size) {
      case 'small': return { container: 'h-12', text: 'text-lg', coin: 'w-6 h-6' };
      case 'large': return { container: 'h-20', text: 'text-3xl', coin: 'w-10 h-10' };
      default: return { container: 'h-16', text: 'text-2xl', coin: 'w-8 h-8' };
    }
  };
  
  const sizeClasses = getSize();

  // تهيئة الرسوم المتحركة عند تغيير القيمة المستهدفة
  useEffect(() => {
    if (!containerRef.current || hasAnimated) return;
    
    // منع تكرار الرسوم المتحركة
    setHasAnimated(true);
    
    // تحديث قيمة العداد تدريجياً
    const counterTween = gsap.to({}, {
      duration: duration,
      onUpdate: function() {
        const progress = gsap.getProperty(this.targets()[0], "progress") as number;
        const currentValue = Math.round(initialValue + (targetValue - initialValue) * progress);
        setDisplayValue(currentValue);
      },
      onComplete: function() {
        setDisplayValue(targetValue);
        onComplete?.();
      }
    });
    
    // إنشاء وتحريك العملات المتطايرة
    createCoins();
    
    return () => {
      counterTween.kill();
      gsap.killTweensOf(".animated-coin");
    };
  }, [initialValue, targetValue, duration, hasAnimated]);
  
  // إنشاء العملات المتطايرة
  const createCoins = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // تنظيف أي عملات سابقة
    const oldCoins = container.querySelectorAll('.animated-coin');
    oldCoins.forEach(coin => coin.remove());
    
    // إنشاء عملات جديدة
    for (let i = 0; i < coinsCount; i++) {
      const coin = document.createElement('div');
      coin.className = `animated-coin absolute ${sizeClasses.coin} rounded-full bg-yellow-400 shadow-md z-10 opacity-0`;
      
      // تموضع العملة في نقطة بداية عشوائية
      const startPos = getRandomPosition(containerRect);
      coin.style.left = `${startPos.x}px`;
      coin.style.bottom = `${-20}px`;
      
      // إضافة محتوى العملة
      coin.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#F59E0B" strokeWidth="2" />
          <path d="M12 6V18M8 10L12 6L16 10M8 14L12 18L16 14" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      `;
      
      // إضافة العملة للحاوية
      container.appendChild(coin);
      
      // تحريك العملة
      animateCoin(coin, startPos, i * 0.1);
    }
  };
  
  // إنشاء موضع بدء عشوائي للعملة
  const getRandomPosition = (containerRect: DOMRect) => {
    const margin = 50;
    const x = Math.random() * (containerRect.width - margin * 2) + margin;
    return { x };
  };
  
  // تحريك العملة
  const animateCoin = (coin: HTMLDivElement, startPos: { x: number }, delay: number) => {
    // ظهور العملة
    gsap.to(coin, { 
      opacity: 1, 
      duration: 0.3,
      delay: delay
    });
    
    // مسار حركة العملة
    gsap.to(coin, {
      bottom: "100%",
      x: startPos.x * (Math.random() * 0.4 - 0.2), // تغيير بسيط في المسار
      rotation: Math.random() * 360,
      duration: 1 + Math.random() * 1.5,
      delay: delay,
      ease: "power1.out",
      onComplete: () => {
        // اختفاء العملة عند الوصول للأعلى
        gsap.to(coin, { 
          opacity: 0, 
          duration: 0.3,
          onComplete: () => coin.remove()
        });
      }
    });
  };
  
  // تنسيق القيمة لعرضها (إضافة فواصل الآلاف)
  const formatValue = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div 
      ref={containerRef} 
      className={`animated-coin-counter relative ${sizeClasses.container} flex items-center justify-center overflow-hidden`}
    >
      {/* القيمة المعروضة */}
      <div className={`relative z-20 ${sizeClasses.text} font-bold text-yellow-400 flex items-center`}>
        <span className="mr-1">
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#F59E0B" strokeWidth="2" />
            <path d="M12 6V18M8 10L12 6L16 10M8 14L12 18L16 14" stroke="#FFD700" strokeWidth="1.5" />
          </svg>
        </span>
        <span>{formatValue(displayValue)}</span>
      </div>
      
      {/* تأثير توهج خلفي */}
      <div className="absolute inset-0 w-full h-full bg-yellow-500/10 blur-xl rounded-full transform scale-75 animate-pulse-slow"></div>
      
      {/* أنماط إضافية */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedCoinCounter;