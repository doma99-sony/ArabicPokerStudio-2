import React from 'react';
import { FreeSpinsState } from '../types';

interface FreeSpinProps {
  freeSpins: FreeSpinsState;
}

/**
 * مكون عرض اللفات المجانية
 */
const FreeSpin: React.FC<FreeSpinProps> = ({ freeSpins }) => {
  if (!freeSpins.active) return null;

  return (
    <div className="free-spins-container">
      <div className="free-spins-effect"></div>
      <div className="free-spins-label">لفات مجانية</div>
      <div className="free-spins-count">{freeSpins.count}</div>
      {freeSpins.multiplier > 1 && (
        <div className="free-spins-multiplier">
          <span>مضاعف</span>
          <span className="multiplier-value">x{freeSpins.multiplier}</span>
        </div>
      )}
    </div>
  );
};

export default FreeSpin;