import { useState, useEffect, useRef } from 'react';
import { formatChips } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface AnimatedChipsProps {
  value: number;
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
  iconClassName?: string;
}

/**
 * مكوّن الرصيد المتحرك الذي يوفر تأثيراً انتقالياً سلساً عند تغيير قيمة الرصيد
 * يقوم بعرض تأثير متحرك للزيادة أو النقصان
 */
export function AnimatedChips({ 
  value, 
  className = "",
  showIcon = true,
  iconSize = 3.5,
  iconClassName = "text-[#D4AF37] ml-1"
}: AnimatedChipsProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const [increased, setIncreased] = useState(false); // هل زاد الرصيد أم نقص
  const prevValueRef = useRef(value);
  
  useEffect(() => {
    // تحقق إذا كانت القيمة قد تغيرت
    if (value !== prevValueRef.current) {
      setIncreased(value > prevValueRef.current);
      setAnimating(true);
      
      // بعد 1 ثانية، إيقاف التحريك
      const animationTimer = setTimeout(() => {
        setAnimating(false);
      }, 1000);
      
      // تحديث القيمة المعروضة
      setDisplayValue(value);
      prevValueRef.current = value;
      
      return () => clearTimeout(animationTimer);
    }
  }, [value]);
  
  return (
    <div className="flex items-center relative">
      {showIcon && <Coins className={`h-${iconSize} w-${iconSize} ${iconClassName}`} />}
      <span 
        className={`font-bold ${className} relative transition-colors`}
      >
        {formatChips(displayValue)}
        
        {/* تأثير الزيادة أو النقصان - يظهر عند تغير القيمة */}
        {animating && (
          <span 
            className={`absolute -top-4 right-0 text-xs font-bold transition-opacity duration-1000 ${
              increased ? "text-green-500" : "text-red-500"
            }`}
          >
            {increased ? "+" : "-"}{Math.abs(value - (prevValueRef.current === value ? displayValue : prevValueRef.current))}
          </span>
        )}
      </span>
    </div>
  );
}