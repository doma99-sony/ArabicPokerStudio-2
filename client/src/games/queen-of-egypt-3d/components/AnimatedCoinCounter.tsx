import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

// أنواع الفوز للعروض المختلفة
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
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  duration?: number;
  coinsCount?: number;
  winType?: WinType | null;
  // أقسام اللعبة للعملات المتطايرة (لتحديد مكان تطاير العملات)
  gameAreaRef?: React.RefObject<HTMLDivElement>;
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
  coinsCount = 15,
  winType = null,
  gameAreaRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState<number>(initialValue);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [showSpecialEffect, setShowSpecialEffect] = useState<boolean>(false);
  
  // رمز العملة
  const coinSymbol = "🪙";

  // تحديد الحجم بناءً على الخيار المحدد
  const getSize = () => {
    switch (size) {
      case 'small': return { container: 'h-12', text: 'text-lg', coin: 'w-6 h-6' };
      case 'large': return { container: 'h-20', text: 'text-3xl', coin: 'w-10 h-10' };
      default: return { container: 'h-16', text: 'text-2xl', coin: 'w-8 h-8' };
    }
  };
  
  const sizeClasses = getSize();

  // تحديد العرض الخاص بناءً على نوع الفوز
  const getWinTypeSettings = useCallback(() => {
    if (!winType) return { 
      coinsMultiplier: 1, 
      flashColor: "#FFD700",
      countDuration: duration,
      specialEffect: false
    };

    switch (winType) {
      case WinType.JACKPOT:
        return { 
          coinsMultiplier: 5,
          flashColor: "#FF5722",
          countDuration: duration * 1.5,
          specialEffect: true
        };
      case WinType.SUPER_MEGA_WIN:
        return { 
          coinsMultiplier: 4,
          flashColor: "#EF5350",
          countDuration: duration * 1.3,
          specialEffect: true
        };
      case WinType.MEGA_WIN:
        return { 
          coinsMultiplier: 3,
          flashColor: "#AB47BC",
          countDuration: duration * 1.2,
          specialEffect: true
        };
      case WinType.BIG_WIN:
        return { 
          coinsMultiplier: 2,
          flashColor: "#42A5F5",
          countDuration: duration * 1.1,
          specialEffect: false
        };
      case WinType.MEDIUM_WIN:
        return { 
          coinsMultiplier: 1.5,
          flashColor: "#66BB6A",
          countDuration: duration,
          specialEffect: false
        };
      default:
        return { 
          coinsMultiplier: 1,
          flashColor: "#FFD700",
          countDuration: duration,
          specialEffect: false
        };
    }
  }, [winType, duration]);

  // تهيئة الرسوم المتحركة عند تغيير القيمة المستهدفة
  useEffect(() => {
    if (!containerRef.current || hasAnimated || initialValue === targetValue) return;
    
    // منع تكرار الرسوم المتحركة
    setHasAnimated(true);
    
    // الحصول على إعدادات الفوز
    const settings = getWinTypeSettings();
    
    // إظهار تأثير خاص للفوز الكبير
    if (settings.specialEffect) {
      setShowSpecialEffect(true);
      
      // وميض للشاشة عند الفوز الكبير
      const flashOverlay = document.createElement('div');
      flashOverlay.className = 'fixed inset-0 z-50 pointer-events-none flash-overlay';
      flashOverlay.style.backgroundColor = settings.flashColor;
      flashOverlay.style.opacity = '0';
      document.body.appendChild(flashOverlay);
      
      // تأثير وميض بلون قوي
      gsap.timeline()
        .to(flashOverlay, { opacity: 0.7, duration: 0.2 })
        .to(flashOverlay, { opacity: 0, duration: 0.3 })
        .to(flashOverlay, { opacity: 0.5, duration: 0.2 })
        .to(flashOverlay, { opacity: 0, duration: 0.5, onComplete: () => {
          flashOverlay.remove();
        }});
      
      // تشغيل صوت الفوز الكبير (في التطبيق الفعلي)
      console.log(`تشغيل صوت فوز من النوع: ${winType}`);
    }
    
    // تحديث قيمة العداد تدريجياً
    const counterTween = gsap.to({}, {
      duration: settings.countDuration,
      ease: settings.specialEffect ? "elastic.out(1, 0.3)" : "power2.out",
      onUpdate: function() {
        const progress = gsap.getProperty(this.targets()[0], "progress") as number;
        const currentValue = Math.round(initialValue + (targetValue - initialValue) * progress);
        setDisplayValue(currentValue);
      },
      onComplete: function() {
        setDisplayValue(targetValue);
        
        // إظهار تأثير وميض إضافي عند الانتهاء
        if (containerRef.current && settings.specialEffect) {
          gsap.fromTo(containerRef.current, 
            { scale: 1.1, filter: 'brightness(1.5)' },
            { scale: 1, filter: 'brightness(1)', duration: 0.5, ease: "elastic.out(1, 0.3)" }
          );
        }
        
        // إخفاء التأثير الخاص بعد فترة
        setTimeout(() => {
          setShowSpecialEffect(false);
          onComplete?.();
        }, 2000);
      }
    });
    
    // إنشاء وتحريك العملات المتطايرة
    createCoins(settings.coinsMultiplier);
    
    return () => {
      counterTween.kill();
      gsap.killTweensOf(".animated-coin");
      
      // إزالة أي تأثيرات وميض متبقية
      const flashOverlays = document.querySelectorAll('.flash-overlay');
      flashOverlays.forEach(overlay => overlay.remove());
    };
  }, [initialValue, targetValue, hasAnimated, getWinTypeSettings, onComplete, winType]);
  
  // إنشاء العملات المتطايرة
  const createCoins = (multiplier = 1) => {
    // استخدام منطقة اللعبة بدلاً من الحاوية إذا كانت متوفرة
    const target = gameAreaRef?.current || containerRef.current;
    if (!target) return;
    
    const targetRect = target.getBoundingClientRect();
    
    // تنظيف أي عملات سابقة
    const oldCoins = document.querySelectorAll('.animated-coin');
    oldCoins.forEach(coin => coin.remove());
    
    // حساب عدد العملات المطلوبة
    const actualCoinsCount = Math.floor(coinsCount * multiplier);
    
    // إنشاء عملات جديدة
    for (let i = 0; i < actualCoinsCount; i++) {
      const coin = document.createElement('div');
      
      // تحديد نوع العملة (3 أنواع مختلفة)
      const coinType = i % 3;
      const coinSize = sizeClasses.coin;
      
      coin.className = `animated-coin fixed ${coinSize} z-50 opacity-0 select-none`;
      
      // تموضع العملة في نقطة بداية عشوائية
      const startPos = getRandomPosition(targetRect);
      coin.style.left = `${startPos.x}px`;
      coin.style.top = `${targetRect.bottom + 20}px`;
      
      // إضافة محتوى العملة بناءً على نوعها
      if (coinType === 0) {
        coin.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#F59E0B" strokeWidth="2" />
            <path d="M12 6V18M8 10L12 6L16 10M8 14L12 18L16 14" stroke="#FFD700" strokeWidth="1.5" />
          </svg>
        `;
      } else if (coinType === 1) {
        coin.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#FFA000" strokeWidth="2" />
            <path d="M10 8H14M8 12H16M10 16H14" stroke="#FFA000" strokeWidth="2" />
          </svg>
        `;
      } else {
        coin.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#F57F17" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill="#F57F17" />
          </svg>
        `;
      }
      
      // إضافة وميض للعملات في حالة الفوز الكبير
      if (winType === WinType.JACKPOT || winType === WinType.SUPER_MEGA_WIN) {
        coin.style.filter = 'drop-shadow(0 0 3px gold)';
      }
      
      // إضافة العملة للمستند
      document.body.appendChild(coin);
      
      // تحريك العملة
      animateCoin(coin, startPos, i * (0.1 / multiplier), targetRect);
    }
  };
  
  // إنشاء موضع بدء عشوائي للعملة
  const getRandomPosition = (containerRect: DOMRect) => {
    const margin = 50;
    const x = containerRect.left + Math.random() * (containerRect.width - margin);
    const endY = containerRect.top + Math.random() * (containerRect.height - margin);
    return { x, endY };
  };
  
  // تحريك العملة
  const animateCoin = (
    coin: HTMLDivElement, 
    startPos: { x: number, endY: number }, 
    delay: number,
    targetRect: DOMRect
  ) => {
    // حركة مختلفة للعملات في حالة الفوز الكبير
    const isJackpot = winType === WinType.JACKPOT || winType === WinType.SUPER_MEGA_WIN;
    
    // ظهور العملة
    gsap.to(coin, { 
      opacity: 1, 
      duration: 0.3,
      delay
    });
    
    // مسار حركة العملة
    const timeline = gsap.timeline({
      defaults: { ease: "power1.inOut" },
      onComplete: () => {
        // اختفاء العملة بعد الانتهاء
        gsap.to(coin, { 
          opacity: 0, 
          duration: 0.3,
          onComplete: () => coin.remove()
        });
      }
    });
    
    if (isJackpot) {
      // مسار متقدم للعملات في حالة الفوز الكبير
      timeline
        .to(coin, {
          top: targetRect.top + targetRect.height * 0.4,
          x: startPos.x + (Math.random() * 100 - 50),
          rotation: Math.random() * 180,
          duration: 0.8 + Math.random() * 0.5,
          delay
        })
        .to(coin, {
          top: startPos.endY,
          x: startPos.x + (Math.random() * 200 - 100),
          rotation: Math.random() * 360,
          duration: 0.8 + Math.random() * 0.7,
          scale: 0.8 + Math.random() * 0.4
        })
        .to(coin, {
          top: targetRect.top + targetRect.height,
          x: startPos.x + (Math.random() * 100 - 50),
          rotation: Math.random() * 540,
          duration: 0.8 + Math.random() * 0.5,
          scale: 1
        });
    } else {
      // مسار بسيط للعملات في حالة الفوز العادي
      timeline
        .to(coin, {
          top: startPos.endY,
          x: startPos.x + (Math.random() * 50 - 25),
          rotation: Math.random() * 360,
          duration: 1 + Math.random() * 1,
          delay
        })
        .to(coin, {
          top: targetRect.top + targetRect.height,
          x: startPos.x + (Math.random() * 50 - 25),
          rotation: Math.random() * 360 + 180,
          duration: 0.8 + Math.random() * 0.5
        });
    }
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
      <div 
        className={`relative z-20 ${sizeClasses.text} font-bold flex items-center ${
          showSpecialEffect ? 'text-white' : 'text-yellow-400'
        }`}
      >
        <span className="mr-1">
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FFC107" stroke="#F59E0B" strokeWidth="2" />
            <path d="M12 6V18M8 10L12 6L16 10M8 14L12 18L16 14" stroke={showSpecialEffect ? "#FFFFFF" : "#FFD700"} strokeWidth="1.5" />
          </svg>
        </span>
        <span className={showSpecialEffect ? 'animate-pulse-fast' : ''}>{formatValue(displayValue)}</span>
      </div>
      
      {/* تأثير توهج خلفي */}
      <div 
        className={`absolute inset-0 w-full h-full blur-xl rounded-full transform scale-75 ${
          showSpecialEffect ? 'bg-yellow-500 animate-pulse-fast' : 'bg-yellow-500/10 animate-pulse-slow'
        }`}
      ></div>
      
      {/* تأثير وميض للجاكبوت */}
      {showSpecialEffect && (
        <>
          <div className="absolute inset-0 w-full h-full bg-yellow-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-x-0 -top-5 -bottom-5 w-full bg-yellow-500/20 rounded-full animate-pulse-fast"></div>
          <div className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] border-2 border-yellow-400 rounded-full animate-spin-slow"></div>
        </>
      )}
      
      {/* عرض نص الفوز لأنواع الفوز الكبيرة */}
      {showSpecialEffect && winType && (
        <div className="absolute bottom-full left-0 right-0 mb-2 text-center animate-bounce">
          <div className={`inline-block px-3 py-1 rounded-full font-bold text-white ${
            winType === WinType.JACKPOT 
              ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600'
              : winType === WinType.SUPER_MEGA_WIN
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600'
                : 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600'
          }`}>
            {winType === WinType.JACKPOT 
              ? 'JACKPOT 🏆' 
              : winType === WinType.SUPER_MEGA_WIN 
                ? 'SUPER WIN 💰' 
                : 'MEGA WIN 🔥'}
          </div>
        </div>
      )}
      
      {/* أنماط إضافية */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 0.5s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animated-coin {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};

export default AnimatedCoinCounter;