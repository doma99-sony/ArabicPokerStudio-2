import React, { useEffect, useState, useRef } from 'react';
import { GoldCoinIcon } from '../assets/egyptian-icons';

export enum WinType {
  SMALL_WIN = 'small_win',
  MEDIUM_WIN = 'medium_win',
  BIG_WIN = 'big_win',
  MEGA_WIN = 'mega_win',
  SUPER_MEGA_WIN = 'super_mega_win',
  JACKPOT = 'jackpot'
}

interface AnimatedCoinCounterProps {
  initialValue: number;
  targetValue: number;
  duration?: number; // بالثواني
  size?: 'small' | 'medium' | 'large';
  winType?: WinType | null;
  onAnimationComplete?: () => void;
}

/**
 * مكون عداد العملات المصرية المتحرك
 * يقوم بعرض تعداد تصاعدي للعملات مع حركات رسومية متطورة
 */
const AnimatedCoinCounter: React.FC<AnimatedCoinCounterProps> = ({
  initialValue,
  targetValue,
  duration = 2,
  size = 'medium',
  winType = null,
  onAnimationComplete
}) => {
  const [displayValue, setDisplayValue] = useState<number>(initialValue);
  const [animationActive, setAnimationActive] = useState<boolean>(false);
  const [coinsVisible, setCoinsVisible] = useState<boolean>(false);
  const [winLabelVisible, setWinLabelVisible] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ضبط أحجام العناصر المختلفة
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'text-xl',
          icon: { width: 16, height: 16 },
          winLabel: 'text-xl',
          coins: 'w-3 h-3'
        };
      case 'large':
        return {
          container: 'text-4xl md:text-5xl',
          icon: { width: 32, height: 32 },
          winLabel: 'text-4xl md:text-5xl',
          coins: 'w-6 h-6'
        };
      default: // medium
        return {
          container: 'text-2xl md:text-3xl',
          icon: { width: 24, height: 24 },
          winLabel: 'text-2xl md:text-3xl',
          coins: 'w-4 h-4'
        };
    }
  };
  
  // الحصول على نص علامة الفوز بناءً على نوع الفوز
  const getWinLabel = () => {
    switch (winType) {
      case WinType.SMALL_WIN:
        return 'فوز صغير!';
      case WinType.MEDIUM_WIN:
        return 'فوز رائع!';
      case WinType.BIG_WIN:
        return 'فوز كبير!';
      case WinType.MEGA_WIN:
        return 'فوز ضخم!';
      case WinType.SUPER_MEGA_WIN:
        return 'فوز خارق!';
      case WinType.JACKPOT:
        return 'جاكبوت!';
      default:
        return '';
    }
  };
  
  // الحصول على لون علامة الفوز بناءً على نوع الفوز
  const getWinLabelColor = () => {
    switch (winType) {
      case WinType.SMALL_WIN:
        return 'text-yellow-400';
      case WinType.MEDIUM_WIN:
        return 'text-yellow-300';
      case WinType.BIG_WIN:
        return 'text-amber-400';
      case WinType.MEGA_WIN:
        return 'text-amber-300';
      case WinType.SUPER_MEGA_WIN:
        return 'text-purple-300';
      case WinType.JACKPOT:
        return 'text-fuchsia-300';
      default:
        return 'text-yellow-400';
    }
  };
  
  // الحصول على تأثير مؤثرات الفوز بناءً على نوع الفوز
  const getWinEffects = () => {
    const isJackpot = winType === WinType.JACKPOT;
    const isSuperMega = winType === WinType.SUPER_MEGA_WIN;
    const isMega = winType === WinType.MEGA_WIN;
    const isBig = winType === WinType.BIG_WIN;
    
    return {
      glow: isJackpot || isSuperMega || isMega,
      shake: isJackpot || isSuperMega,
      pulse: isJackpot || isSuperMega || isMega || isBig,
      winLabel: winType !== null
    };
  };
  
  const sizeClasses = getSizeClasses();
  const winLabel = getWinLabel();
  const winLabelColor = getWinLabelColor();
  const winEffects = getWinEffects();
  
  // إنشاء حركة للعداد عند تغيير القيمة المستهدفة
  useEffect(() => {
    if (targetValue === initialValue) return;
    
    setAnimationActive(true);
    
    // القيمة المستهدفة أكبر من القيمة الأولية، ابدأ حركة العد
    if (targetValue > initialValue) {
      const startTime = performance.now();
      const endTime = startTime + duration * 1000;
      const totalChange = targetValue - initialValue;
      
      // عرض علامة الفوز إذا كان هناك نوع فوز
      if (winEffects.winLabel) {
        setTimeout(() => {
          setWinLabelVisible(true);
        }, 200);
      }
      
      // إظهار العملات المتطايرة إذا كان الفوز كبيرًا
      if (winType && [WinType.BIG_WIN, WinType.MEGA_WIN, WinType.SUPER_MEGA_WIN, WinType.JACKPOT].includes(winType)) {
        setTimeout(() => {
          setCoinsVisible(true);
        }, 500);
      }
      
      // وظيفة التحريك الإطارية
      const animateValue = (timestamp: number) => {
        // حساب القيمة الحالية بناءً على الوقت المنقضي
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / (duration * 1000), 1);
        
        // حساب القيمة الحالية بتأثير تناقص السرعة
        const easedProgress = 1 - Math.pow(1 - progress, 3); // استخدام تأثير التخفيف outCubic
        const currentValue = Math.floor(initialValue + easedProgress * totalChange);
        
        setDisplayValue(currentValue);
        
        // استمرار الحركة إذا لم نصل للقيمة النهائية بعد
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateValue);
        } else {
          // الانتهاء من الحركة
          setDisplayValue(targetValue);
          
          // إخفاء العملات المتطايرة بعد فترة
          if (coinsVisible) {
            setTimeout(() => {
              setCoinsVisible(false);
            }, 3000);
          }
          
          // إخفاء علامة الفوز بعد فترة
          if (winLabelVisible) {
            setTimeout(() => {
              setWinLabelVisible(false);
            }, 4000);
          }
          
          // استدعاء الدالة عند اكتمال الحركة
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          
          // إيقاف حالة الحركة
          setTimeout(() => {
            setAnimationActive(false);
          }, 4000);
        }
      };
      
      // بدء الحركة
      animationRef.current = requestAnimationFrame(animateValue);
      
      // تنظيف عند إزالة المكون
      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [initialValue, targetValue, duration, onAnimationComplete, winEffects.winLabel, winType]);
  
  // إنشاء مصفوفة من العملات المتطايرة
  const renderCoins = () => {
    if (!coinsVisible) return null;
    
    // عدد العملات يعتمد على نوع الفوز
    const getCoinsCount = () => {
      switch (winType) {
        case WinType.BIG_WIN: return 10;
        case WinType.MEGA_WIN: return 20;
        case WinType.SUPER_MEGA_WIN: return 30;
        case WinType.JACKPOT: return 50;
        default: return 5;
      }
    };
    
    const coinsCount = getCoinsCount();
    const coins = [];
    
    for (let i = 0; i < coinsCount; i++) {
      // توليد قيم عشوائية للحركة والموضع
      const randomDelay = Math.random() * 2;
      const randomDuration = 2 + Math.random() * 3;
      const randomX = Math.random() * 100;
      const randomRotation = Math.random() * 360;
      
      coins.push(
        <div
          key={`coin-${i}`}
          className={`absolute ${sizeClasses.coins} animate-coin-fall`}
          style={{
            left: `${randomX}%`,
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`,
            transform: `rotate(${randomRotation}deg)`,
            opacity: 0
          }}
        >
          <GoldCoinIcon width={20} height={20} color="#FFD700" />
        </div>
      );
    }
    
    return coins;
  };
  
  // تنسيق العدد للعرض (إضافة فواصل للآلاف)
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <div 
      ref={containerRef}
      className={`animated-coin-counter relative flex flex-col items-center justify-center ${
        animationActive ? 'animate-in fade-in' : ''
      }`}
    >
      {/* عرض علامة الفوز */}
      {winLabelVisible && (
        <div 
          className={`win-label absolute top-0 transform -translate-y-full ${
            winLabelColor
          } ${sizeClasses.winLabel} font-bold animate-in zoom-in duration-500 ${
            winEffects.pulse ? 'animate-pulse' : ''
          }`}
        >
          {winLabel}
        </div>
      )}
      
      {/* العملات المتطايرة */}
      {renderCoins()}
      
      {/* عرض العداد والأيقونة */}
      <div 
        className={`counter-display flex items-center justify-center ${sizeClasses.container} font-bold ${
          winEffects.glow ? 'text-shadow-glow' : ''
        } ${
          winEffects.shake ? 'animate-wiggle' : ''
        } ${
          winEffects.pulse ? 'animate-pulse' : ''
        }`}
      >
        <GoldCoinIcon 
          width={sizeClasses.icon.width} 
          height={sizeClasses.icon.height} 
          className="mr-2"
        />
        <span>{formatNumber(displayValue)}</span>
      </div>
      
      {/* الأنماط الداخلية */}
      <style jsx>{`
        @keyframes coin-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-coin-fall {
          animation: coin-fall linear forwards;
        }
        
        .animate-in {
          animation-duration: 300ms;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fadeIn;
        }
        
        .zoom-in {
          animation-name: zoomIn;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: translateY(-100%) scale(0.8); }
          to { transform: translateY(-100%) scale(1); }
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
        }
        
        .text-shadow-glow {
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.7),
                       0 0 20px rgba(255, 215, 0, 0.5),
                       0 0 30px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AnimatedCoinCounter;