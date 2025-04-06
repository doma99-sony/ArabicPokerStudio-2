import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface BettingControlsProps {
  onPlaceBet: (amount: number, autoCashout: number | null) => void;
  onCashout: () => void;
  gameStatus: 'waiting' | 'flying' | 'crashed';
  isBetPlaced: boolean;
  isCashedOut: boolean;
  countdown: number;
  userChips: number;
}

const BettingControls: React.FC<BettingControlsProps> = ({
  onPlaceBet,
  onCashout,
  gameStatus,
  isBetPlaced,
  isCashedOut,
  countdown,
  userChips
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [autoCashout, setAutoCashout] = useState<number>(2);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState<boolean>(false);

  // وظائف لزيادة/تقليل مبلغ الرهان
  const increaseBet = () => {
    if (gameStatus === 'waiting' && !isBetPlaced) {
      setBetAmount(prev => prev + 50);
    }
  };
  
  const decreaseBet = () => {
    if (gameStatus === 'waiting' && !isBetPlaced) {
      setBetAmount(prev => Math.max(50, prev - 50));
    }
  };
  
  // وظائف لزيادة/تقليل مضاعف الخروج التلقائي
  const increaseAutoCashout = () => {
    setAutoCashout(prev => parseFloat((prev + 0.5).toFixed(2)));
  };
  
  const decreaseAutoCashout = () => {
    setAutoCashout(prev => parseFloat(Math.max(1.5, prev - 0.5).toFixed(2)));
  };

  // التعامل مع وضع الرهان
  const handlePlaceBet = () => {
    if (gameStatus !== 'waiting' || countdown === 0) {
      return; // لا يمكن وضع رهان بعد انتهاء العد التنازلي
    }
    
    if (betAmount <= 0) {
      return; // مبلغ الرهان يجب أن يكون أكبر من 0
    }
    
    if (betAmount > userChips) {
      return; // لا يوجد رصيد كافٍ
    }
    
    // إرسال الرهان مع مضاعف الخروج التلقائي إذا كان مفعّلاً
    onPlaceBet(betAmount, isAutoCashoutEnabled ? autoCashout : null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* المراهنة */}
      <Card className="p-4 bg-slate-700 border-none shadow-md">
        <h2 className="text-lg font-bold text-white mb-3">المراهنة</h2>
        
        <div className="flex items-center mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-slate-600 text-white border-none"
            onClick={decreaseBet}
            disabled={isBetPlaced || gameStatus !== 'waiting'}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="mx-2 text-center bg-slate-800 border-slate-600 text-white"
            disabled={isBetPlaced || gameStatus !== 'waiting'}
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-slate-600 text-white border-none"
            onClick={increaseBet}
            disabled={isBetPlaced || gameStatus !== 'waiting'}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className={`w-full ${isBetPlaced ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          onClick={isBetPlaced ? onCashout : handlePlaceBet}
          disabled={(isBetPlaced && gameStatus !== 'flying') || (gameStatus === 'waiting' && countdown === 0) || isCashedOut}
        >
          {!isBetPlaced && gameStatus === 'waiting' ? 'مراهنة' : 
           isBetPlaced && !isCashedOut && gameStatus === 'flying' ? 'سحب' : 
           isCashedOut ? 'تم السحب' : 'مراهنة'}
        </Button>
      </Card>
      
      {/* السحب التلقائي */}
      <Card className="p-4 bg-slate-700 border-none shadow-md">
        <h2 className="text-lg font-bold text-white mb-3">السحب التلقائي</h2>
        
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="auto-cashout" className="text-white">
            {isAutoCashoutEnabled ? 'مفعّل' : 'غير مفعّل'}
          </Label>
          <Switch 
            id="auto-cashout" 
            checked={isAutoCashoutEnabled}
            onCheckedChange={setIsAutoCashoutEnabled}
            disabled={isBetPlaced}
          />
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-slate-600 text-white border-none"
            onClick={decreaseAutoCashout}
            disabled={isBetPlaced}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            value={autoCashout}
            onChange={(e) => setAutoCashout(Number(e.target.value))}
            className="mx-2 text-center bg-slate-800 border-slate-600 text-white"
            disabled={isBetPlaced}
            step={0.1}
          />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-slate-600 text-white border-none"
            onClick={increaseAutoCashout}
            disabled={isBetPlaced}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BettingControls;