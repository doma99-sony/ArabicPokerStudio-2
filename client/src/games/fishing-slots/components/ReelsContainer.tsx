// مكون حاوية البكرات لعبة صياد السمك
import React from 'react';
import { Reel, Payline, Symbol } from '../types';
import ReelComponent from './ReelComponent';
import PaylineOverlay from './PaylineOverlay';

interface ReelsContainerProps {
  reels: Reel[];
  paylines: Payline[];
  isSpinning: boolean;
  showWinLines: boolean;
  winningLines: Payline[];
}

/**
 * مكون حاوية بكرات اللعبة
 * يعرض البكرات وخطوط الدفع والرموز المرئية
 */
const ReelsContainer: React.FC<ReelsContainerProps> = ({
  reels,
  paylines,
  isSpinning,
  showWinLines,
  winningLines,
}) => {
  return (
    <div className="reels-container">
      {/* شبكة البكرات */}
      <div className="reels-grid">
        {reels.map((reel) => (
          <ReelComponent
            key={reel.id}
            reel={reel}
            isSpinning={isSpinning && reel.spinning}
          />
        ))}
      </div>
      
      {/* خطوط الدفع الفائزة */}
      {showWinLines && winningLines.length > 0 && (
        <div className="paylines-overlay">
          {winningLines.map((line) => (
            <PaylineOverlay 
              key={line.id} 
              payline={line} 
              color={getPaylineColor(line.id)} 
            />
          ))}
        </div>
      )}
      
      {/* تأثيرات الفوز */}
      {showWinLines && (
        <div className="win-effects">
          <div className="splash-effect"></div>
          <div className="coins-effect"></div>
        </div>
      )}
    </div>
  );
};

/**
 * الحصول على لون لخط الدفع
 */
function getPaylineColor(id: number): string {
  // ألوان مختلفة لخطوط الدفع المختلفة
  const colors = [
    '#ff0000', // أحمر
    '#00ff00', // أخضر
    '#0000ff', // أزرق
    '#ffff00', // أصفر
    '#ff00ff', // وردي
    '#00ffff', // سماوي
    '#ff8000', // برتقالي
    '#8000ff', // بنفسجي
    '#0080ff', // أزرق فاتح
    '#ff0080', // وردي داكن
    '#ff8080', // وردي فاتح
    '#80ff80', // أخضر فاتح
    '#8080ff', // أزرق فاتح
    '#ffff80', // أصفر فاتح
    '#ff80ff', // وردي فاتح
    '#80ffff', // سماوي فاتح
    '#ff8080', // برتقالي فاتح
    '#8080ff', // بنفسجي فاتح
    '#80ff80', // أخضر فاتح
    '#ffff80', // أصفر فاتح
  ];
  
  // استخدام معرّف خط الدفع للحصول على لون فريد
  return colors[(id - 1) % colors.length];
}

export default ReelsContainer;