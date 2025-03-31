import { useEffect, useState } from 'react';

interface SantaSleighProps {
  className?: string;
  startDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function SantaSleigh({ 
  className = '', 
  startDelay = 0,
  size = 'md'
}: SantaSleighProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // حجم العربة
  const sizeMap = {
    sm: { fontSize: '1.5rem', duration: '15s' },
    md: { fontSize: '3rem', duration: '20s' },
    lg: { fontSize: '5rem', duration: '25s' }
  };
  
  useEffect(() => {
    // تأخير ظهور بابا نويل (عشوائي)
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // إعادة تشغيل الرسوم المتحركة بعد انتهائها
      const flyTime = parseInt(sizeMap[size].duration);
      const intervalTimer = setInterval(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 1000);
      }, (flyTime + 2) * 1000);
      
      return () => clearInterval(intervalTimer);
    }, startDelay * 1000);
    
    return () => clearTimeout(timer);
  }, [size, startDelay]);
  
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed ${className} pointer-events-none`}
      style={{
        fontSize: sizeMap[size].fontSize,
        top: '10%',
        left: '-10%',
        zIndex: 50,
        whiteSpace: 'nowrap'
      }}
    >
      <div
        className="animate-santa-fly"
        style={{
          animationDuration: sizeMap[size].duration,
        }}
      >
        <div className="flex items-center gap-1 text-shadow">
          <span role="img" aria-label="reindeer">🦌</span>
          <span role="img" aria-label="reindeer">🦌</span>
          <span role="img" aria-label="reindeer">🦌</span>
          <span role="img" aria-label="sleigh">🛷</span>
          <span role="img" aria-label="santa">🎅</span>
          <div className="relative">
            <div className="absolute -top-5 -left-5 text-xs animate-float">
              <span role="img" aria-label="gift">🎁</span>
            </div>
            <div className="absolute -top-3 -right-3 text-xs animate-float" style={{ animationDelay: '0.5s' }}>
              <span role="img" aria-label="gift">🎁</span>
            </div>
            <div className="absolute -bottom-4 -left-2 text-xs animate-float" style={{ animationDelay: '1s' }}>
              <span role="img" aria-label="gift">🎁</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SnowflakesProps {
  count?: number;
}

export function Snowflakes({ count = 30 }: SnowflakesProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
      {Array.from({ length: count }).map((_, index) => {
        const size = Math.random() * 1.5 + 0.5; // حجم عشوائي
        const left = `${Math.random() * 100}%`;
        const animationDuration = `${Math.random() * 10 + 5}s`;
        const animationDelay = `${Math.random() * 5}s`;
        const opacity = Math.random() * 0.7 + 0.3;
        
        return (
          <div
            key={index}
            className="absolute animate-snow"
            style={{
              left,
              top: '-5%',
              fontSize: `${size}rem`,
              animationDuration,
              animationDelay,
              opacity
            }}
          >
            <span role="img" aria-label="snowflake">❄️</span>
          </div>
        );
      })}
    </div>
  );
}