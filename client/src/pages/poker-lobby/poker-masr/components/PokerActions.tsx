import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface PokerActionsProps {
  minBet: number;
  maxBet: number;
  currentBet: number;
  playerChips: number;
  onAction: (action: string, amount?: number) => void;
  canCheck: boolean;
  isPlayerTurn: boolean;
}

/**
 * مكون إجراءات البوكر - يعرض أزرار الإجراءات المتاحة للاعب (فولد، شيك، كول، رايز، أول إن)
 */
export default function PokerActions({
  minBet,
  maxBet,
  currentBet,
  playerChips,
  onAction,
  canCheck,
  isPlayerTurn
}: PokerActionsProps) {
  const [raiseAmount, setRaiseAmount] = useState(minBet);
  
  const handleSliderChange = (value: number[]) => {
    setRaiseAmount(value[0]);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minBet && value <= playerChips) {
      setRaiseAmount(value);
    }
  };
  
  return (
    <div className="poker-actions-container w-full p-4 bg-black/70 rounded-lg border border-[#D4AF37]/30">
      <div className="actions-buttons flex gap-2 mb-4">
        <Button 
          variant="destructive" 
          onClick={() => onAction('fold')}
          disabled={!isPlayerTurn}
          className="flex-1"
        >
          فولد
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onAction('check')}
          disabled={!isPlayerTurn || !canCheck}
          className="flex-1"
        >
          شيك
        </Button>
        
        <Button 
          variant="default" 
          onClick={() => onAction('call', currentBet)}
          disabled={!isPlayerTurn || currentBet === 0 || playerChips < currentBet}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          كول {currentBet > 0 ? `(${currentBet})` : ''}
        </Button>
        
        <Button 
          variant="default" 
          onClick={() => onAction('raise', raiseAmount)}
          disabled={!isPlayerTurn || playerChips < minBet}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
        >
          رايز
        </Button>
        
        <Button 
          variant="default" 
          onClick={() => onAction('all_in', playerChips)}
          disabled={!isPlayerTurn || playerChips === 0}
          className="flex-1 bg-red-600 hover:bg-red-700"
        >
          أول إن
        </Button>
      </div>
      
      {/* شريط تمرير وإدخال لتحديد مبلغ الرايز */}
      <div className="raise-controls flex gap-4 items-center">
        <div className="w-2/3">
          <Slider
            defaultValue={[minBet]}
            min={minBet}
            max={playerChips}
            step={minBet}
            onValueChange={handleSliderChange}
            disabled={!isPlayerTurn || playerChips < minBet}
          />
        </div>
        <div className="w-1/3">
          <Input
            type="number"
            value={raiseAmount}
            onChange={handleInputChange}
            disabled={!isPlayerTurn || playerChips < minBet}
            min={minBet}
            max={playerChips}
            step={minBet}
            className="text-center"
          />
        </div>
      </div>
    </div>
  );
}