/**
 * لوحة التحكم للعبة صياد السمك
 * تحتوي على زر الدوران وإعدادات الرهان وأزرار التحكم الأخرى
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { 
  SPIN_BUTTON_IMAGE, 
  AUTOPLAY_BUTTON_IMAGE, 
  MAX_BET_BUTTON_IMAGE 
} from '../assets/images';

interface ControlPanelProps {
  balance: number;
  betAmount: number;
  onChangeBet: (amount: number) => void;
  onSpin: () => void;
  onAutoPlay: () => void;
  onMaxBet: () => void;
  isSpinning: boolean;
  isAutoPlaying: boolean;
  canSpin: boolean;
  minBet: number;
  maxBet: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  balance,
  betAmount,
  onChangeBet,
  onSpin,
  onAutoPlay,
  onMaxBet,
  isSpinning,
  isAutoPlaying,
  canSpin,
  minBet,
  maxBet
}) => {
  // سلسلة قيم الرهان المتاحة
  const betValues = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  
  // مؤشر الرهان الحالي في المصفوفة
  const [betIndex, setBetIndex] = useState(0);
  
  // تحديث مؤشر الرهان عند تغيير قيمة الرهان
  useEffect(() => {
    const index = betValues.findIndex(value => value === betAmount);
    if (index !== -1) {
      setBetIndex(index);
    }
  }, [betAmount]);

  // زيادة الرهان
  const increaseBet = () => {
    if (betIndex < betValues.length - 1) {
      const newIndex = betIndex + 1;
      setBetIndex(newIndex);
      onChangeBet(betValues[newIndex]);
    }
  };

  // إنقاص الرهان
  const decreaseBet = () => {
    if (betIndex > 0) {
      const newIndex = betIndex - 1;
      setBetIndex(newIndex);
      onChangeBet(betValues[newIndex]);
    }
  };

  // تحديث الرهان من شريط التمرير
  const handleSliderChange = (value: number[]) => {
    const newIndex = Math.min(Math.max(Math.round(value[0] / (100 / (betValues.length - 1))), 0), betValues.length - 1);
    setBetIndex(newIndex);
    onChangeBet(betValues[newIndex]);
  };

  return (
    <div className="control-panel">
      {/* معلومات الرهان والرصيد */}
      <div className="bet-info">
        <div className="balance-display">
          <span className="label">الرصيد:</span>
          <span className="value">{balance.toLocaleString()}</span>
        </div>
        
        <div className="bet-controls">
          <button 
            className="bet-button decrease" 
            onClick={decreaseBet} 
            disabled={isSpinning || betIndex === 0}
          >
            -
          </button>
          
          <div className="bet-amount">
            <span className="label">الرهان:</span>
            <span className="value">{betAmount.toLocaleString()}</span>
          </div>
          
          <button 
            className="bet-button increase" 
            onClick={increaseBet} 
            disabled={isSpinning || betIndex === betValues.length - 1 || betValues[betIndex + 1] > balance}
          >
            +
          </button>
        </div>
      </div>
      
      {/* شريط تمرير الرهان */}
      <div className="bet-slider">
        <Slider
          value={[betIndex * (100 / (betValues.length - 1))]}
          min={0}
          max={100}
          step={100 / (betValues.length - 1)}
          onValueChange={handleSliderChange}
          disabled={isSpinning}
          className="slider"
        />
      </div>
      
      {/* أزرار التحكم */}
      <div className="action-buttons">
        {/* زر أقصى رهان */}
        <motion.button
          className="max-bet-button"
          onClick={onMaxBet}
          disabled={isSpinning || balance < maxBet}
          whileTap={{ scale: 0.95 }}
        >
          <img src={MAX_BET_BUTTON_IMAGE} alt="أقصى رهان" />
          <span>أقصى رهان</span>
        </motion.button>
        
        {/* زر الدوران */}
        <motion.button
          className={`spin-button ${isSpinning ? 'spinning' : ''}`}
          onClick={onSpin}
          disabled={!canSpin || isSpinning || balance < betAmount}
          whileTap={{ scale: 0.95 }}
          animate={isSpinning ? { rotate: 360 } : {}}
          transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          <img src={SPIN_BUTTON_IMAGE} alt="دوران" />
          <span>{isSpinning ? 'جاري الدوران...' : 'دوران'}</span>
        </motion.button>
        
        {/* زر اللعب التلقائي */}
        <motion.button
          className={`autoplay-button ${isAutoPlaying ? 'active' : ''}`}
          onClick={onAutoPlay}
          disabled={isSpinning || balance < betAmount}
          whileTap={{ scale: 0.95 }}
        >
          <img src={AUTOPLAY_BUTTON_IMAGE} alt="لعب تلقائي" />
          <span>{isAutoPlaying ? 'إيقاف' : 'لعب تلقائي'}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ControlPanel;