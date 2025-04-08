/**
 * مكون أزرار إجراءات البوكر
 * يعرض الأزرار للتحكم في اللعبة (انسحاب، تمرير، مجاراة، زيادة، كل الرقائق)
 */
import React, { useState, useEffect } from 'react';
import { PlayerAction } from '../logic/poker-engine';
import { usePokerStore } from '../store/poker-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

/**
 * واجهة خصائص مكون أزرار إجراءات البوكر
 */
interface PokerActionsProps {
  className?: string;
}

/**
 * مكون أزرار إجراءات البوكر
 */
const PokerActions: React.FC<PokerActionsProps> = ({ className }) => {
  // استخدام متجر البوكر
  const {
    gameState,
    performAction,
    actionInProgress,
    currentAction,
    getLocalPlayer,
    canCheck,
    canRaise,
    getMinRaise,
    getMaxRaise,
    isPlayerTurn
  } = usePokerStore();
  
  // حالة المكون
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  const [customRaise, setCustomRaise] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number[]>([0]);
  
  // استخراج معلومات من حالة اللعبة
  const localPlayer = getLocalPlayer();
  const currentBet = gameState?.currentRound.currentBet || 0;
  const playerBet = localPlayer?.betAmount || 0;
  const toCall = Math.max(0, currentBet - playerBet);
  const minRaise = Math.max(getMinRaise(), toCall);
  const maxRaise = getMaxRaise();
  
  // تحديث قيمة الزيادة عند تغير حالة اللعبة
  useEffect(() => {
    // تعيين الحد الأدنى للزيادة كقيمة افتراضية
    const defaultRaise = Math.min(maxRaise, minRaise);
    setRaiseAmount(defaultRaise);
    setSliderValue([defaultRaise]);
    setCustomRaise(defaultRaise.toString());
  }, [currentBet, minRaise, maxRaise]);
  
  // معالجة تغيير شريط التمرير
  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    setSliderValue(values);
    setRaiseAmount(value);
    setCustomRaise(value.toString());
  };
  
  // معالجة تغيير قيمة الزيادة المخصصة
  const handleCustomRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomRaise(value);
    
    // تحويل القيمة إلى رقم
    const numValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      // ضمان أن القيمة في النطاق المسموح به
      const validValue = Math.min(Math.max(numValue, minRaise), maxRaise);
      setRaiseAmount(validValue);
      setSliderValue([validValue]);
    }
  };
  
  // معالجة الضغط على زر الانسحاب
  const handleFold = async () => {
    try {
      await performAction(PlayerAction.FOLD);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ إجراء الانسحاب.',
        variant: 'destructive'
      });
    }
  };
  
  // معالجة الضغط على زر التمرير
  const handleCheck = async () => {
    try {
      await performAction(PlayerAction.CHECK);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ إجراء التمرير.',
        variant: 'destructive'
      });
    }
  };
  
  // معالجة الضغط على زر المجاراة
  const handleCall = async () => {
    try {
      await performAction(PlayerAction.CALL, toCall);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ إجراء المجاراة.',
        variant: 'destructive'
      });
    }
  };
  
  // معالجة الضغط على زر الزيادة
  const handleRaise = async () => {
    try {
      // تحديد كمية الزيادة الكلية (المبلغ الموجود بالفعل + الزيادة الإضافية)
      const amountToRaise = raiseAmount + playerBet;
      await performAction(PlayerAction.RAISE, amountToRaise);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ إجراء الزيادة.',
        variant: 'destructive'
      });
    }
  };
  
  // معالجة الضغط على زر كل الرقائق
  const handleAllIn = async () => {
    try {
      await performAction(PlayerAction.ALL_IN);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تنفيذ إجراء وضع كل الرقائق.',
        variant: 'destructive'
      });
    }
  };
  
  // إذا لم يكن دور اللاعب، لا يعرض أي أزرار
  if (!isPlayerTurn() || !localPlayer) {
    return null;
  }
  
  return (
    <div className={`poker-actions-container ${className || ''}`}>
      <div className="flex items-center justify-between gap-2 p-4 bg-gradient-to-br from-blue-700/80 to-blue-900/80 backdrop-blur rounded-xl">
        {/* زر الانسحاب */}
        <Button
          variant="destructive"
          onClick={handleFold}
          disabled={actionInProgress}
          className="w-24"
        >
          انسحاب
        </Button>
        
        {/* زر التمرير - يظهر فقط إذا كان يمكن التمرير */}
        {canCheck() && (
          <Button
            variant="outline"
            onClick={handleCheck}
            disabled={actionInProgress}
            className="w-24"
          >
            تمرير
          </Button>
        )}
        
        {/* زر المجاراة - يظهر إذا كان هناك رهان للمجاراة */}
        {toCall > 0 && (
          <Button
            variant="secondary"
            onClick={handleCall}
            disabled={actionInProgress || localPlayer.chips < toCall}
            className="w-24"
          >
            {`مجاراة ${toCall.toLocaleString()}`}
          </Button>
        )}
        
        {/* منطقة الزيادة - تظهر إذا كان يمكن الزيادة */}
        {canRaise() && (
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex items-center gap-2">
              <Slider
                value={sliderValue}
                min={minRaise}
                max={maxRaise}
                step={minRaise}
                onValueChange={handleSliderChange}
                disabled={actionInProgress || maxRaise < minRaise}
                className="flex-grow"
              />
              <Input
                type="number"
                value={customRaise}
                onChange={handleCustomRaiseChange}
                min={minRaise}
                max={maxRaise}
                disabled={actionInProgress || maxRaise < minRaise}
                className="w-24 text-center"
              />
            </div>
            <Button
              variant="default"
              onClick={handleRaise}
              disabled={actionInProgress || maxRaise < minRaise || raiseAmount < minRaise}
              className="w-full"
            >
              {`زيادة إلى ${(raiseAmount + playerBet).toLocaleString()}`}
            </Button>
          </div>
        )}
        
        {/* زر كل الرقائق */}
        <Button
          variant="default"
          onClick={handleAllIn}
          disabled={actionInProgress || localPlayer.chips === 0}
          className="w-24 bg-red-600 hover:bg-red-700"
        >
          كل الرقائق
        </Button>
      </div>
    </div>
  );
};

export default PokerActions;