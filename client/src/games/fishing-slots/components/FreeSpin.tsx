// مكون اللفات المجانية للعبة صياد السمك
import React from 'react';

interface FreeSpinProps {
  count: number;
  multiplier: number;
}

/**
 * مكون اللفات المجانية
 * يعرض عدد اللفات المجانية المتبقية والمضاعف الحالي
 */
const FreeSpin: React.FC<FreeSpinProps> = ({ count, multiplier }) => {
  return (
    <div className="free-spins-container">
      <div className="free-spins-label">لفات مجانية</div>
      <div className="free-spins-count">{count}</div>
      
      {multiplier > 1 && (
        <div className="free-spins-multiplier">
          <span className="multiplier-text">مضاعف</span>
          <span className="multiplier-value">x{multiplier}</span>
        </div>
      )}
      
      {/* عنصر التأثير المرئي */}
      <div className="free-spins-effect"></div>
    </div>
  );
};

export default FreeSpin;