import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface PokerActionsProps {
  minBet: number;
  maxBet: number;
  currentBet: number;
  playerChips: number;
  canCheck: boolean;
  isPlayerTurn: boolean;
  onAction: (action: string, amount?: number) => void;
}

/**
 * مكون أزرار إجراءات البوكر (طي، تمرير، مجاراة، زيادة، كل الرقائق)
 */
export default function PokerActions({
  minBet,
  maxBet,
  currentBet,
  playerChips,
  canCheck,
  isPlayerTurn,
  onAction
}: PokerActionsProps) {
  const [betAmount, setBetAmount] = useState(minBet);
  const [showBetSlider, setShowBetSlider] = useState(false);
  
  // ضبط قيمة الرهان عند تغير الحد الأدنى
  React.useEffect(() => {
    setBetAmount(minBet);
  }, [minBet]);
  
  // التعامل مع ضبط قيمة الرهان
  const handleBetChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  // التعامل مع نقر زر الرهان
  const handleBetClick = () => {
    setShowBetSlider(!showBetSlider);
  };
  
  // إرسال الإجراء المطلوب إلى المكون الأب
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'fold':
      case 'check':
        onAction(action);
        break;
      case 'call':
        onAction(action, currentBet);
        break;
      case 'raise':
        onAction(action, betAmount);
        setShowBetSlider(false);
        break;
      case 'all_in':
        onAction(action, playerChips);
        break;
    }
  };
  
  return (
    <div className="poker-actions-container w-full p-4 text-center">
      {isPlayerTurn ? (
        <div className="space-y-4">
          {/* شريط الإجراءات الرئيسي */}
          <div className="actions-row flex justify-center gap-2 rtl:flex-row-reverse">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
              onClick={() => handleActionClick('fold')}
            >
              طي
            </Button>
            
            {canCheck && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                onClick={() => handleActionClick('check')}
              >
                تمرير
              </Button>
            )}
            
            {!canCheck && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                onClick={() => handleActionClick('call')}
                disabled={playerChips < currentBet}
              >
                مجاراة ${currentBet}
              </Button>
            )}
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
              onClick={handleBetClick}
              disabled={playerChips <= currentBet}
            >
              رهان
            </Button>
            
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
              onClick={() => handleActionClick('all_in')}
              disabled={playerChips <= 0}
            >
              كل الرقائق (${playerChips})
            </Button>
          </div>
          
          {/* شريط ضبط الرهان */}
          {showBetSlider && (
            <div className="bet-slider-container bg-black/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">الحد الأدنى: ${minBet}</span>
                <span className="text-white text-lg font-bold">الرهان: ${betAmount}</span>
                <span className="text-white">الحد الأقصى: ${maxBet}</span>
              </div>
              
              <Slider
                defaultValue={[minBet]} 
                min={minBet}
                max={maxBet}
                step={minBet / 2}
                onValueChange={handleBetChange}
                className="mb-4"
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBetSlider(false)}
                >
                  إلغاء
                </Button>
                
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleActionClick('raise')}
                >
                  تأكيد الرهان
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // رسالة انتظار عندما لا يكون دور اللاعب
        <div className="waiting-message text-white text-lg">
          في انتظار دورك...
        </div>
      )}
    </div>
  );
}