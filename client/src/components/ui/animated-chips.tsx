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
  const isInitialMount = useRef(true);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // تخطي أول تحديث للصفحة لتجنب ظهور تأثير الأنيميشن عند بدء التشغيل
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevValueRef.current = value;
      setDisplayValue(value);
      return;
    }
    
    // تحقق إذا كانت القيمة قد تغيرت فعلاً
    if (value !== prevValueRef.current) {
      // تنظيف أي مؤقت سابق لتجنب التداخل
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
      
      setIncreased(value > prevValueRef.current);
      setAnimating(true);
      
      // بعد 1 ثانية، إيقاف التحريك
      animationTimerRef.current = setTimeout(() => {
        setAnimating(false);
        animationTimerRef.current = null;
      }, 1000);
      
      // تحديث القيمة المعروضة
      setDisplayValue(value);
      prevValueRef.current = value;
    }
    
    // تنظيف المؤقت عند إلغاء تحميل المكون
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [value]);
  
  // قيمة الفرق بين الرصيد الحالي والسابق
  const difference = Math.abs(value - (prevValueRef.current === value ? displayValue : prevValueRef.current));
  
  return (
    <div className="flex items-center relative">
      {showIcon && <Coins className={`${iconClassName}`} style={{ width: `${iconSize}rem`, height: `${iconSize}rem` }} />}
      <span 
        className={`font-bold ${className} relative transition-colors`}
      >
        {formatChips(displayValue)}
        
        {/* تأثير الزيادة أو النقصان - يظهر عند تغير القيمة */}
        {animating && difference > 0 && (
          <span 
            className={`absolute -top-4 right-0 text-xs font-bold transition-opacity duration-1000 ${
              increased ? "text-green-500" : "text-red-500"
            }`}
          >
            {increased ? "+" : "-"}{formatChips(difference)}
          </span>
        )}
      </span>
    </div>
  );
}