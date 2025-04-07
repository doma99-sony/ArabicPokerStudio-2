/**
 * مكون لوحة التحكم في لعبة صياد السمك
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Cog, 
  VolumeX, 
  Volume2, 
  RotateCw, 
  DollarSign, 
  ChevronUp, 
  ChevronDown,
  FastForward,
  Pause
} from 'lucide-react';
import { GameState } from '../types';

interface ControlPanelProps {
  balance: number; // رصيد اللاعب
  betAmount: number; // قيمة الرهان الحالي
  totalBet: number; // إجمالي الرهان (الرهان × خطوط الدفع)
  lastWin: number; // آخر فوز
  gameState: GameState; // حالة اللعبة
  autoPlayActive: boolean; // حالة اللعب التلقائي
  changeBet: (amount: number) => void; // تغيير قيمة الرهان
  setMaxBet: () => void; // تعيين الرهان الأقصى
  spin: () => void; // بدء الدوران
  toggleAutoPlay: () => void; // تبديل وضع اللعب التلقائي
  onOpenSettings?: () => void; // فتح الإعدادات
  onOpenPaytable?: () => void; // فتح جدول المدفوعات
  muted?: boolean; // حالة كتم الصوت
  toggleMute?: () => void; // تبديل كتم الصوت
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  balance,
  betAmount,
  totalBet,
  lastWin,
  gameState,
  autoPlayActive,
  changeBet,
  setMaxBet,
  spin,
  toggleAutoPlay,
  onOpenSettings,
  onOpenPaytable,
  muted = false,
  toggleMute
}) => {
  // قائمة قيم الرهان المتاحة
  const betValues = [10, 20, 50, 100, 200, 500, 1000];
  
  // الحصول على قيمة الرهان التالية والسابقة
  const currentBetIndex = betValues.indexOf(betAmount);
  const canIncreaseBet = currentBetIndex < betValues.length - 1 && gameState === GameState.IDLE;
  const canDecreaseBet = currentBetIndex > 0 && gameState === GameState.IDLE;
  
  // زيادة قيمة الرهان
  const increaseBet = () => {
    if (canIncreaseBet) {
      changeBet(betValues[currentBetIndex + 1]);
    }
  };
  
  // تقليل قيمة الرهان
  const decreaseBet = () => {
    if (canDecreaseBet) {
      changeBet(betValues[currentBetIndex - 1]);
    }
  };
  
  // التحقق من إمكانية الدوران
  const canSpin = gameState === GameState.IDLE && balance >= totalBet;
  
  // نص زر الدوران
  const getSpinButtonText = () => {
    switch (gameState) {
      case GameState.SPINNING:
        return 'دوران...';
      case GameState.WIN_ANIMATION:
        return 'فوز!';
      default:
        return 'دوران';
    }
  };
  
  return (
    <div className="control-panel">
      <div className="control-panel-background"></div>
      <div className="control-panel-content">
        <div className="player-info">
          <div className="info-box balance">
            <div className="info-label">الرصيد</div>
            <div className="info-value">{balance}</div>
          </div>
          
          <div className="info-box bet">
            <div className="info-label">الرهان</div>
            <div className="info-value">{betAmount}</div>
            <div className="bet-controls">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseBet}
                disabled={!canDecreaseBet}
                className="bet-button decrease"
              >
                <ChevronDown size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={increaseBet}
                disabled={!canIncreaseBet}
                className="bet-button increase"
              >
                <ChevronUp size={20} />
              </Button>
            </div>
          </div>
          
          <div className="info-box total-bet">
            <div className="info-label">إجمالي الرهان</div>
            <div className="info-value">{totalBet}</div>
          </div>
          
          <div className="info-box win">
            <div className="info-label">الفوز</div>
            <div className="info-value">{lastWin}</div>
          </div>
        </div>
        
        <div className="control-buttons">
          <Button
            variant="outline"
            onClick={onOpenSettings}
            className="control-button settings"
          >
            <Cog size={24} />
          </Button>
          
          <Button
            variant="outline"
            onClick={toggleMute}
            className="control-button sound"
          >
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </Button>
          
          <Button
            variant="outline"
            onClick={onOpenPaytable}
            className="control-button paytable"
          >
            <DollarSign size={24} />
          </Button>
          
          <Button
            variant="outline"
            onClick={setMaxBet}
            disabled={gameState !== GameState.IDLE}
            className="control-button max-bet"
          >
            أقصى رهان
          </Button>
          
          <Button
            variant={autoPlayActive ? "destructive" : "outline"}
            onClick={toggleAutoPlay}
            disabled={gameState !== GameState.IDLE}
            className="control-button auto-play"
          >
            {autoPlayActive ? <Pause size={24} /> : <FastForward size={24} />}
          </Button>
          
          <Button
            variant="default"
            onClick={spin}
            disabled={!canSpin}
            className={`control-button spin ${gameState === GameState.WIN_ANIMATION ? 'winning' : ''}`}
          >
            {gameState === GameState.SPINNING ? (
              <RotateCw size={24} className="spin-icon rotating" />
            ) : (
              getSpinButtonText()
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;