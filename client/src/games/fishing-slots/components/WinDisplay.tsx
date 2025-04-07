// مكون عرض الفوز للعبة صياد السمك
import React, { useState, useEffect } from 'react';

interface WinDisplayProps {
  amount: number;
  multiplier?: number;
}

/**
 * مكون عرض الفوز
 * يعرض قيمة الفوز والتأثيرات المصاحبة
 */
const WinDisplay: React.FC<WinDisplayProps> = ({ 
  amount, 
  multiplier = 1
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(0);
  const [counterFinished, setCounterFinished] = useState(false);
  
  // تصنيف حجم الفوز
  const winSize = amount >= 50000 ? 'mega' : 
                 amount >= 10000 ? 'large' : 
                 amount >= 5000 ? 'medium' : 'small';
  
  // مدة العرض بناءً على حجم الفوز
  const displayDuration = winSize === 'mega' ? 6000 : 
                         winSize === 'large' ? 4000 : 
                         winSize === 'medium' ? 3000 : 2000;
  
  // تأثير عداد الفوز المتزايد
  useEffect(() => {
    if (amount <= 0) return;
    
    // إعادة تعيين العداد
    setDisplayedAmount(0);
    setCounterFinished(false);
    
    // حساب الزيادة لكل خطوة
    const steps = 50;
    const increment = amount / steps;
    const stepDuration = displayDuration / steps;
    let currentStep = 0;
    
    // بدء العداد
    const counter = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        // اكتمال العداد
        setDisplayedAmount(amount);
        setCounterFinished(true);
        clearInterval(counter);
      } else {
        // زيادة القيمة المعروضة
        setDisplayedAmount(Math.floor(increment * currentStep));
      }
    }, stepDuration);
    
    return () => clearInterval(counter);
  }, [amount, displayDuration]);
  
  // تحديد نص الفوز بناءً على حجمه
  const winText = winSize === 'mega' ? 'فوز ضخم!' : 
                 winSize === 'large' ? 'فوز كبير!' : 
                 winSize === 'medium' ? 'فوز جيد!' : 'فزت!';
  
  // تأثيرات حسب حجم الفوز
  const winEffectClass = `win-effect ${winSize}-win-effect`;
  
  return (
    <div className={`win-display ${winSize}-win ${counterFinished ? 'completed' : ''}`}>
      <div className={winEffectClass}></div>
      
      <div className="win-content">
        <div className="win-text">{winText}</div>
        
        {/* عرض المضاعف إذا كان أكبر من 1 */}
        {multiplier > 1 && (
          <div className="win-multiplier">x{multiplier}</div>
        )}
        
        <div className="win-amount">
          {displayedAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default WinDisplay;