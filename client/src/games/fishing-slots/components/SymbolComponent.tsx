// مكون الرمز الواحد في لعبة صياد السمك
import React, { useState, useEffect } from 'react';
import { Symbol } from '../types';

interface SymbolComponentProps {
  symbol: Symbol;
  position: number;
  isHighlighted?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * مكون الرمز الواحد
 * يعرض صورة الرمز وتأثيراته
 */
const SymbolComponent: React.FC<SymbolComponentProps> = ({
  symbol,
  position,
  isHighlighted = false,
  onAnimationComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // تتبع تغييرات حالة التمييز
  useEffect(() => {
    if (isHighlighted) {
      setIsAnimating(true);
      
      // إنهاء التحريك بعد فترة زمنية
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isHighlighted, onAnimationComplete]);
  
  // إضافة قيمة الرمز إذا كانت متاحة (للأسماك)
  const showValue = symbol.value && symbol.value > 0;
  
  return (
    <div 
      className={`symbol-container ${isHighlighted ? 'highlighted' : ''} ${isAnimating ? 'animating' : ''}`}
      data-position={position}
      data-symbol-type={symbol.type}
    >
      <div className="symbol">
        <img src={symbol.image} alt={symbol.type} className="symbol-image" />
        
        {/* عرض قيمة الرمز للأسماك */}
        {showValue && (
          <div className="symbol-value">{symbol.value}</div>
        )}
        
        {/* رمز خاص للرموز المميزة */}
        {symbol.isWild && (
          <div className="wild-overlay">WILD</div>
        )}
        
        {symbol.isScatter && (
          <div className="scatter-overlay">SCATTER</div>
        )}
        
        {/* تأثيرات الرمز */}
        <div className={`symbol-effect ${isAnimating ? 'active' : ''}`}></div>
      </div>
    </div>
  );
};

export default SymbolComponent;