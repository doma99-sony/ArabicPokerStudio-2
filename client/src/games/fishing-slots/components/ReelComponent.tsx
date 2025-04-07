// مكون البكرة الواحدة في لعبة صياد السمك
import React, { useRef, useEffect } from 'react';
import { Reel, Symbol } from '../types';
import SymbolComponent from './SymbolComponent';

interface ReelComponentProps {
  reel: Reel;
  isSpinning: boolean;
}

/**
 * مكون البكرة الواحدة
 * يعرض الرموز المرئية ويدير حركة دوران البكرة
 */
const ReelComponent: React.FC<ReelComponentProps> = ({ reel, isSpinning }) => {
  const reelRef = useRef<HTMLDivElement>(null);
  
  // إضافة تأثير الدوران عند تغيير حالة الدوران
  useEffect(() => {
    const reelElement = reelRef.current;
    
    if (!reelElement) return;
    
    if (isSpinning) {
      // بدء تأثير الدوران
      reelElement.style.transition = 'none';
      reelElement.style.transform = 'translateY(0)';
      
      // انتظار إطار واحد للتأكد من تطبيق التغييرات
      requestAnimationFrame(() => {
        if (reelElement) {
          // بدء الحركة السلسة للدوران
          reelElement.style.transition = 'transform 0.5s linear';
          reelElement.style.transform = 'translateY(-100%)';
        }
      });
      
      // تكرار الدوران بتأثير مستمر
      const spinInterval = setInterval(() => {
        if (reelElement && isSpinning) {
          reelElement.style.transition = 'none';
          reelElement.style.transform = 'translateY(0)';
          
          requestAnimationFrame(() => {
            if (reelElement) {
              reelElement.style.transition = 'transform 0.5s linear';
              reelElement.style.transform = 'translateY(-100%)';
            }
          });
        }
      }, 500);
      
      return () => clearInterval(spinInterval);
    } else {
      // إيقاف الدوران وعرض النتيجة النهائية
      reelElement.style.transition = 'transform 0.3s ease-out';
      reelElement.style.transform = `translateY(-${(reel.position * 100) / reel.symbols.length}%)`;
    }
  }, [isSpinning, reel.position, reel.symbols.length]);
  
  // الحصول على الرموز المرئية فقط
  const visibleSymbols = getVisibleSymbols(reel);
  
  return (
    <div className={`reel ${isSpinning ? 'spinning' : ''}`}>
      <div ref={reelRef} className="reel-strip">
        {visibleSymbols.map((symbol, index) => (
          <SymbolComponent 
            key={`${symbol.id}-${index}`} 
            symbol={symbol} 
            position={index}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * الحصول على الرموز المرئية في البكرة
 */
function getVisibleSymbols(reel: Reel): Symbol[] {
  // عدد الرموز المرئية في كل بكرة (عادة 3 أو 4)
  const visibleCount = 3;
  
  // الحصول على الرموز بدءًا من موضع الإيقاف الحالي
  const start = reel.spinning ? 0 : reel.position;
  
  // نسخ مجموعة الرموز المرئية
  const symbols: Symbol[] = [];
  
  for (let i = 0; i < visibleCount; i++) {
    const index = (start + i) % reel.symbols.length;
    symbols.push({ ...reel.symbols[index] });
  }
  
  return symbols;
}

export default ReelComponent;