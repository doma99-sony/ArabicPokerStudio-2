import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// حجم عداد العملات
type CoinCounterSize = 'small' | 'medium' | 'large';

// خصائص عداد العملات المتحرك
interface AnimatedCoinCounterProps {
  initialValue: number;         // القيمة الابتدائية
  targetValue: number;          // القيمة المستهدفة
  size?: CoinCounterSize;       // حجم العداد
  duration?: number;            // مدة الرسوم المتحركة
  showCoinIcon?: boolean;       // إظهار أيقونة العملة
  animate?: boolean;            // تفعيل الرسوم المتحركة
  onAnimationComplete?: () => void; // دالة تُستدعى عند اكتمال الرسوم المتحركة
}

/**
 * عداد عملات متحرك مع تأثيرات بصرية جذابة
 * يستخدم في الواجهة لإظهار التغييرات في رصيد اللاعب
 */
export default function AnimatedCoinCounter({
  initialValue,
  targetValue,
  size = 'medium',
  duration = 1.5,
  showCoinIcon = true,
  animate = true,
  onAnimationComplete
}: AnimatedCoinCounterProps) {
  // حالة قيمة العداد الحالية
  const [displayValue, setDisplayValue] = useState<number>(initialValue);
  
  // مراجع لحاويات العملات الطائرة
  const containerRef = useRef<HTMLDivElement>(null);
  const flyingCoinsRef = useRef<HTMLDivElement>(null);
  
  // حالة الفوز (زيادة أو نقصان)
  const isIncreasing = targetValue > initialValue;
  const difference = Math.abs(targetValue - initialValue);
  
  // عدد العملات الطائرة يعتمد على حجم الفرق وحجم العداد
  const getNumberOfCoins = () => {
    if (difference <= 0) return 0;
    
    if (difference > 10000) return 20;
    if (difference > 5000) return 15;
    if (difference > 1000) return 10;
    if (difference > 500) return 7;
    if (difference > 100) return 5;
    
    return 3;
  };
  
  // تحريك العملات الطائرة عبر الشاشة
  const animateFlyingCoins = () => {
    if (!flyingCoinsRef.current || !isIncreasing || difference <= 0) return;
    
    const numberOfCoins = getNumberOfCoins();
    flyingCoinsRef.current.innerHTML = '';
    
    for (let i = 0; i < numberOfCoins; i++) {
      const coin = document.createElement('div');
      coin.className = 'absolute rounded-full bg-yellow-400 shadow-lg';
      
      // جعل أحجام العملات متنوعة
      const size = Math.floor(Math.random() * 16) + 8; // 8px to 24px
      coin.style.width = `${size}px`;
      coin.style.height = `${size}px`;
      
      // وضع العملة في مكان عشوائي بالقرب من أسفل الشاشة
      coin.style.bottom = `-${Math.random() * 20 + 10}px`;
      coin.style.left = `${Math.random() * 100}%`;
      
      // إضافة تأثير لمعان للبعض
      if (Math.random() > 0.6) {
        coin.style.boxShadow = '0 0 10px 2px rgba(255, 215, 0, 0.7)';
      }
      
      flyingCoinsRef.current.appendChild(coin);
      
      // تطبيق حركة عشوائية للعملة
      gsap.to(coin, {
        y: `-${Math.random() * 200 + 100}px`,
        x: `${(Math.random() - 0.5) * 150}px`,
        opacity: 0,
        duration: Math.random() * 1.5 + 1.5,
        ease: 'power2.out',
        onComplete: () => {
          // إزالة العملة بعد انتهاء الحركة لتوفير الذاكرة
          if (flyingCoinsRef.current) {
            flyingCoinsRef.current.removeChild(coin);
          }
        }
      });
    }
  };
  
  // تنفيذ الرسوم المتحركة عند تغيّر القيم
  useEffect(() => {
    if (!animate) {
      setDisplayValue(targetValue);
      return;
    }
    
    // تحريك قيمة العداد تدريجياً
    let startValue = initialValue;
    const endValue = targetValue;
    const changeValue = endValue - startValue;
    
    // تقنية التحريك البسيطة لعرض الأرقام المتغيرة
    const updateCounter = () => {
      const progress = Math.min(1, (Date.now() - startTime) / (duration * 1000));
      const easedProgress = easeOutCubic(progress);
      const currentValue = Math.round(startValue + changeValue * easedProgress);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        // استدعاء دالة إكمال الرسوم المتحركة إذا وجدت
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };
    
    // دالة تسهيل حركة النمط الخارجي التكعيبي
    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };
    
    const startTime = Date.now();
    
    // إضافة تأثير العملات الطائرة للفوز الكبير
    if (isIncreasing && difference > 100) {
      animateFlyingCoins();
    }
    
    // بدء تحديث العداد
    updateCounter();
    
  }, [initialValue, targetValue, duration, animate, onAnimationComplete, isIncreasing, difference]);
  
  // تحديد أحجام وأنماط مختلفة بناءً على حجم العداد
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-lg md:text-xl';
      case 'large':
        return 'text-2xl md:text-4xl font-bold';
      case 'medium':
      default:
        return 'text-xl md:text-2xl';
    }
  };
  
  return (
    <div className="animated-coin-counter relative" ref={containerRef}>
      {/* العملات الطائرة */}
      <div 
        ref={flyingCoinsRef}
        className="flying-coins-container absolute inset-0 overflow-hidden pointer-events-none z-10"
      ></div>
      
      {/* عداد الرصيد */}
      <div className={`coin-counter-display flex items-center justify-center ${getSizeClasses()}`}>
        {showCoinIcon && (
          <div className="coin-icon mr-2 relative">
            <div className={`
              coin-shape rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300
              ${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-7 h-7' : 'w-5 h-5'}
              flex items-center justify-center shadow-md
            `}>
              <span className="text-yellow-800 font-bold text-[8px]">$</span>
            </div>
          </div>
        )}
        
        <div className="coin-value text-amber-300 font-bold">
          {displayValue.toLocaleString()}
        </div>
      </div>
    </div>
  );
}