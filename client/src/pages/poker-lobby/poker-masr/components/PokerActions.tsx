import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePokerStore } from '../store/poker-store';
import { PlayerAction } from '../logic/poker-engine';
import { Loader2 } from 'lucide-react';

interface PokerActionsProps {
  isCurrentTurn: boolean; // هل الدور الحالي للاعب؟
  currentBet: number; // الرهان الحالي على الطاولة
  chipCount: number; // عدد الرقائق المتاحة للاعب
  lastBet: number; // آخر مزايدة تمت في الجولة
  minRaise: number; // الحد الأدنى للزيادة
}

/**
 * مكون أزرار الإجراءات للاعب البوكر
 * يعرض أزرار: طي، تمرير/فحص، مجاراة، زيادة، كل الرقائق
 */
const PokerActions: React.FC<PokerActionsProps> = ({
  isCurrentTurn,
  currentBet,
  chipCount,
  lastBet,
  minRaise
}) => {
  const { performAction, clearActionResult, actionResult } = usePokerStore();
  
  // حالة مبلغ الزيادة
  const [raiseAmount, setRaiseAmount] = useState(Math.min(currentBet + minRaise, chipCount));
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // حساب القيمة المطلوب دفعها للمجاراة
  const callAmount = Math.min(currentBet, chipCount);
  
  // التحقق مما إذا كان اللاعب يستطيع الزيادة
  const canRaise = chipCount > currentBet + minRaise;
  
  // تحديث مبلغ الزيادة عند تغير الرهان الحالي
  useEffect(() => {
    // تعيين الزيادة الافتراضية (الرهان الحالي + الحد الأدنى للزيادة)
    const defaultRaise = Math.min(currentBet + minRaise, chipCount);
    setRaiseAmount(defaultRaise);
  }, [currentBet, minRaise, chipCount]);
  
  // إعادة ضبط الزر بعد تنفيذ الإجراء
  useEffect(() => {
    if (actionResult) {
      setIsSubmitting(false);
      clearActionResult();
    }
  }, [actionResult, clearActionResult]);
  
  // تنفيذ إجراء الطي
  const handleFold = () => {
    setIsSubmitting(true);
    performAction(PlayerAction.FOLD);
  };
  
  // تنفيذ إجراء التمرير/الفحص
  const handleCheck = () => {
    setIsSubmitting(true);
    performAction(PlayerAction.CHECK);
  };
  
  // تنفيذ إجراء المجاراة
  const handleCall = () => {
    setIsSubmitting(true);
    performAction(PlayerAction.CALL, callAmount);
  };
  
  // تنفيذ إجراء الزيادة
  const handleRaise = () => {
    setIsSubmitting(true);
    performAction(PlayerAction.RAISE, raiseAmount);
    setShowRaiseSlider(false);
  };
  
  // تنفيذ إجراء كل الرقائق
  const handleAllIn = () => {
    setIsSubmitting(true);
    performAction(PlayerAction.ALL_IN, chipCount);
  };
  
  // تبديل عرض شريط تمرير الزيادة
  const toggleRaiseSlider = () => {
    setShowRaiseSlider(!showRaiseSlider);
  };
  
  // تحديث قيمة الزيادة من شريط التمرير
  const handleSliderChange = (value: number[]) => {
    setRaiseAmount(value[0]);
  };
  
  // اختيار نسبة من الرقائق للزيادة
  const setPercentageOfChips = (percent: number) => {
    const amount = Math.min(Math.floor(chipCount * percent), chipCount);
    // التأكد من أن المبلغ أكبر من أو يساوي الحد الأدنى للزيادة
    setRaiseAmount(Math.max(amount, currentBet + minRaise));
  };
  
  // إذا لم يكن دور اللاعب، لا تعرض الأزرار
  if (!isCurrentTurn) {
    return null;
  }
  
  return (
    <div className="poker-actions-container w-full p-4 border rounded-lg bg-black/80 backdrop-blur-md">
      <div className="actions-row flex space-x-2 mb-2">
        {/* زر الطي */}
        <Button 
          variant="destructive" 
          className="w-full fold-animation"
          onClick={handleFold}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          طي
        </Button>
        
        {/* زر التمرير/الفحص - يظهر فقط إذا كان الرهان الحالي 0 */}
        {currentBet === 0 && (
          <Button 
            variant="outline" 
            className="w-full check-animation"
            onClick={handleCheck}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            تمرير
          </Button>
        )}
        
        {/* زر المجاراة - يظهر فقط إذا كان هناك رهان حالي أكبر من 0 */}
        {currentBet > 0 && (
          <Button 
            variant="default" 
            className="w-full bg-green-700 hover:bg-green-800 call-animation"
            onClick={handleCall}
            disabled={isSubmitting || chipCount === 0}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            مجاراة ${callAmount}
          </Button>
        )}
        
        {/* زر الزيادة - يظهر فقط إذا كان اللاعب يستطيع الزيادة */}
        {canRaise && (
          <Button 
            variant="default" 
            className="w-full bg-amber-600 hover:bg-amber-700 raise-animation"
            onClick={toggleRaiseSlider}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            زيادة
          </Button>
        )}
        
        {/* زر كل الرقائق */}
        <Button 
          variant="default" 
          className="w-full bg-purple-700 hover:bg-purple-800 all-in-animation"
          onClick={handleAllIn}
          disabled={isSubmitting || chipCount === 0}
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          الكل ${chipCount}
        </Button>
      </div>
      
      {/* شريط تمرير الزيادة - يظهر فقط عند النقر على زر الزيادة */}
      {showRaiseSlider && (
        <div className="raise-slider-container mt-4 p-2 bg-gray-800 rounded-lg">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">الحد الأدنى: ${currentBet + minRaise}</span>
            <span className="text-xs text-gray-400">أقصى: ${chipCount}</span>
          </div>
          
          <Slider
            defaultValue={[raiseAmount]}
            max={chipCount}
            min={currentBet + minRaise}
            step={1}
            onValueChange={handleSliderChange}
            className="my-2"
          />
          
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white font-bold">الزيادة إلى: ${raiseAmount}</span>
          </div>
          
          <div className="percentage-buttons flex justify-between space-x-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => setPercentageOfChips(0.25)} className="text-xs">25%</Button>
            <Button variant="outline" size="sm" onClick={() => setPercentageOfChips(0.5)} className="text-xs">50%</Button>
            <Button variant="outline" size="sm" onClick={() => setPercentageOfChips(0.75)} className="text-xs">75%</Button>
            <Button variant="outline" size="sm" onClick={() => setPercentageOfChips(1)} className="text-xs">100%</Button>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowRaiseSlider(false)} className="w-1/2">إلغاء</Button>
            <Button 
              variant="default" 
              onClick={handleRaise} 
              className="w-1/2 bg-amber-600 hover:bg-amber-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              تأكيد ${raiseAmount}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokerActions;