import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { formatChips } from '@/lib/utils';

interface GameControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  autoCashoutMultiplier: number;
  setAutoCashoutMultiplier: (multiplier: number) => void;
  userChips: number;
  isBetting: boolean;
  gameStatus: 'waiting' | 'flying' | 'crashed';
  hasCashedOut: boolean;
  currentMultiplier: number;
  onPlaceBet: () => void;
  onCancelBet: () => void;
  onCashout: () => void;
}

const GameControls = ({
  betAmount,
  setBetAmount,
  autoCashoutMultiplier,
  setAutoCashoutMultiplier,
  userChips,
  isBetting,
  gameStatus,
  hasCashedOut,
  currentMultiplier,
  onPlaceBet,
  onCancelBet,
  onCashout
}: GameControlsProps) => {
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  const handleBetAmountChange = (value: string) => {
    const amount = parseInt(value);
    if (!isNaN(amount) && amount > 0) {
      setBetAmount(amount);
    } else {
      setBetAmount(0);
    }
  };
  
  const handleAutoCashoutChange = (value: number[]) => {
    setAutoCashoutMultiplier(value[0]);
  };
  
  // وظيفة تطبيق نسبة محددة من الرصيد
  const applyQuickBet = (percentage: number) => {
    if (userChips <= 0) return;
    
    const newBet = Math.floor(userChips * (percentage / 100));
    if (newBet > 0) {
      setBetAmount(newBet);
    }
  };
  
  return (
    <div className="p-4 bg-black/30 backdrop-blur-sm rounded-lg border border-[#D4AF37]/20 transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-4">
        {/* جانب معلومات الرصيد */}
        <div className="flex-1">
          <div className="text-sm text-gray-300 mb-1">رصيدك</div>
          <div className="text-xl font-bold text-[#D4AF37]">
            {formatChips(userChips)} <span className="text-sm">رقائق</span>
          </div>
          
          <div className="flex items-center flex-wrap mt-3 gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#D4AF37]/50 text-[#D4AF37] h-7"
              onClick={() => applyQuickBet(5)}
              disabled={isBetting}
            >
              5%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#D4AF37]/50 text-[#D4AF37] h-7"
              onClick={() => applyQuickBet(10)}
              disabled={isBetting}
            >
              10%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#D4AF37]/50 text-[#D4AF37] h-7"
              onClick={() => applyQuickBet(25)}
              disabled={isBetting}
            >
              25%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#D4AF37]/50 text-[#D4AF37] h-7"
              onClick={() => applyQuickBet(50)}
              disabled={isBetting}
            >
              50%
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#D4AF37]/50 text-[#D4AF37] h-7"
              onClick={() => applyQuickBet(100)}
              disabled={isBetting}
            >
              كل الرصيد
            </Button>
          </div>
          
          {/* معلومات المكسب المحتمل */}
          {isBetting && gameStatus === 'flying' && !hasCashedOut && (
            <div className="mt-3 bg-[#D4AF37]/10 p-2 rounded-md border border-[#D4AF37]/20">
              <div className="text-xs text-gray-300">المكسب المحتمل</div>
              <div className="font-bold text-green-500">
                {formatChips(Math.floor(betAmount * currentMultiplier) - betAmount)} <span className="text-xs">رقائق</span>
              </div>
            </div>
          )}
        </div>
        
        {/* جانب التحكم بالرهان */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-300">مبلغ الرهان</label>
            <div className="flex items-center">
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 px-2 text-xs ${isAutoMode ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400'}`}
                onClick={() => setIsAutoMode(true)}
              >
                تلقائي
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`h-6 px-2 text-xs ${!isAutoMode ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400'}`}
                onClick={() => setIsAutoMode(false)}
              >
                يدوي
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Input 
              type="number" 
              value={betAmount} 
              onChange={(e) => handleBetAmountChange(e.target.value)}
              className="border-[#D4AF37]/30 bg-black/30"
              min={10}
              disabled={isBetting}
            />
            <Button 
              onClick={() => setBetAmount(betAmount + 10)} 
              className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20"
              disabled={isBetting}
            >
              +
            </Button>
            <Button 
              onClick={() => setBetAmount(Math.max(10, betAmount - 10))} 
              className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20"
              disabled={isBetting}
            >
              -
            </Button>
          </div>
          
          {isAutoMode && (
            <div className="mb-3">
              <label className="text-sm text-gray-300 flex items-center gap-1">
                خروج تلقائي ({autoCashoutMultiplier.toFixed(1)}x)
              </label>
              <Slider
                value={[autoCashoutMultiplier]}
                min={1.1}
                max={10}
                step={0.1}
                onValueChange={handleAutoCashoutChange}
                disabled={isBetting}
                className="py-2"
              />
            </div>
          )}
          
          {/* زر لبدء/إلغاء/جمع الرهان */}
          {!isBetting ? (
            <Button 
              onClick={onPlaceBet} 
              className="mt-auto flex-grow bg-[#D4AF37] hover:bg-[#B08D2A] text-black font-bold py-3"
              disabled={
                gameStatus === 'flying' || 
                betAmount <= 0 || 
                userChips < betAmount
              }
            >
              راهن الآن
            </Button>
          ) : (
            gameStatus === 'waiting' ? (
              <Button 
                onClick={onCancelBet} 
                className="mt-auto flex-grow bg-red-600 hover:bg-red-700 text-white py-3"
              >
                إلغاء الرهان
              </Button>
            ) : (
              <Button 
                onClick={onCashout} 
                className="mt-auto flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                disabled={hasCashedOut || gameStatus !== 'flying'}
              >
                جمع {formatChips(Math.floor(betAmount * currentMultiplier))}
              </Button>
            )
          )}
          
          {/* رسالة تحذير للمستخدم عند الحاجة */}
          {userChips < betAmount && (
            <div className="text-red-500 text-xs mt-2 text-center">
              رصيدك غير كافٍ للرهان
            </div>
          )}
        </div>
      </div>
      
      {isAutoMode && isBetting && gameStatus === 'flying' && !hasCashedOut && (
        <div className="mt-3 text-xs text-center text-[#D4AF37]">
          سيتم الجمع تلقائياً عند {autoCashoutMultiplier.toFixed(1)}x
        </div>
      )}
    </div>
  );
};

export default GameControls;