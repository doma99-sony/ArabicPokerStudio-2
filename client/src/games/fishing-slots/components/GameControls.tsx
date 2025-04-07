// مكون أزرار التحكم في لعبة صياد السمك
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, RotateCcw, Settings, List, VolumeX, Volume2,
  ChevronUp, ChevronDown, Plus, Minus, Maximize
} from 'lucide-react';

interface GameControlsProps {
  onSpin: () => void;
  onAutoSpin: (count: number) => void;
  onStopAutoSpin: () => void;
  isSpinning: boolean;
  isAutoSpinning: boolean;
  onToggleSettings: () => void;
  onTogglePaytable: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  increaseBet: () => void;
  decreaseBet: () => void;
  paylineCount: number;
  setPaylineCount: (count: number) => void;
  increasePaylines: () => void;
  decreasePaylines: () => void;
  maxBet: () => void;
  disabled: boolean;
}

/**
 * مكون أزرار التحكم في اللعبة
 */
const GameControls: React.FC<GameControlsProps> = ({
  onSpin,
  onAutoSpin,
  onStopAutoSpin,
  isSpinning,
  isAutoSpinning,
  onToggleSettings,
  onTogglePaytable,
  onToggleMute,
  isMuted,
  betAmount,
  setBetAmount,
  increaseBet,
  decreaseBet,
  paylineCount,
  setPaylineCount,
  increasePaylines,
  decreasePaylines,
  maxBet,
  disabled,
}) => {
  const [showAutoSpinOptions, setShowAutoSpinOptions] = useState(false);
  
  // خيارات الدوران التلقائي
  const autoSpinOptions = [10, 20, 50, 100];
  
  // إظهار/إخفاء خيارات الدوران التلقائي
  const toggleAutoSpinOptions = () => {
    setShowAutoSpinOptions(!showAutoSpinOptions);
  };
  
  // اختيار عدد محدد من اللفات التلقائية
  const handleAutoSpin = (count: number) => {
    onAutoSpin(count);
    setShowAutoSpinOptions(false);
  };
  
  return (
    <div className="game-controls">
      {/* قسم قيمة الرهان */}
      <div className="bet-controls">
        <div className="control-label">قيمة الرهان</div>
        <div className="bet-amount-controls">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={decreaseBet} 
            disabled={disabled}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="bet-amount">{betAmount}</div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={increaseBet}
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* قسم خطوط الدفع */}
      <div className="paylines-controls">
        <div className="control-label">خطوط الدفع</div>
        <div className="paylines-count-controls">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={decreasePaylines}
            disabled={disabled}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="paylines-count">{paylineCount}</div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={increasePaylines}
            disabled={disabled}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* أزرار الأقصى */}
      <Button 
        variant="secondary" 
        onClick={maxBet}
        disabled={disabled}
        className="max-bet-button"
      >
        <Maximize className="w-4 h-4 mr-2" />
        الحد الأقصى
      </Button>
      
      {/* أزرار التحكم الأساسية */}
      <div className="main-controls">
        {/* زر الإعادة */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={onToggleSettings}
          className="settings-button"
        >
          <Settings className="w-6 h-6" />
        </Button>
        
        {/* زر جدول المدفوعات */}
        <Button 
          variant="outline"
          size="icon"
          onClick={onTogglePaytable}
          className="paytable-button"
        >
          <List className="w-6 h-6" />
        </Button>
        
        {/* زر كتم الصوت */}
        <Button 
          variant="outline"
          size="icon"
          onClick={onToggleMute}
          className="mute-button"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </Button>
        
        {/* أزرار اللعب */}
        <div className="play-controls">
          {/* زر الدوران التلقائي */}
          <div className="autospin-container">
            {isAutoSpinning ? (
              <Button 
                variant="destructive"
                onClick={onStopAutoSpin}
                className="stop-autospin-button"
              >
                <Pause className="w-6 h-6 mr-2" />
                إيقاف التلقائي
              </Button>
            ) : (
              <>
                <Button 
                  variant="secondary"
                  onClick={toggleAutoSpinOptions}
                  disabled={disabled || isSpinning}
                  className="autospin-button"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
                  دوران تلقائي
                </Button>
                
                {/* خيارات الدوران التلقائي */}
                {showAutoSpinOptions && (
                  <div className="autospin-options">
                    {autoSpinOptions.map(count => (
                      <Button 
                        key={count}
                        variant="outline"
                        onClick={() => handleAutoSpin(count)}
                        className="autospin-option"
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* زر الدوران */}
          <Button 
            variant="default"
            size="lg"
            onClick={onSpin}
            disabled={disabled || isSpinning || isAutoSpinning}
            className="spin-button"
          >
            <Play className="w-6 h-6 mr-2" />
            دوران
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;