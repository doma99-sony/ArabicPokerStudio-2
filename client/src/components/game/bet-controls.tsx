import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { formatChips } from "@/lib/utils";

interface BetControlsProps {
  currentBet: number;
  minBet: number;
  maxBet: number;
  defaultValue?: number;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export function BetControls({
  currentBet,
  minBet,
  maxBet,
  defaultValue,
  onConfirm,
  onCancel
}: BetControlsProps) {
  const initialBet = defaultValue || Math.max(minBet, currentBet * 2);
  const [betAmount, setBetAmount] = useState(Math.min(initialBet, maxBet));
  const [sliderValue, setSliderValue] = useState(calculateSliderValue(betAmount));

  // Calculate slider percentage based on bet amount
  function calculateSliderValue(bet: number): number[] {
    // 扭曲值以使滑块更有用 - 小提高较大比例
    const percentage = Math.max(0, Math.min(100, ((bet - minBet) / (maxBet - minBet)) * 100));
    return [percentage];
  }

  // Calculate bet amount based on slider percentage
  function calculateBetFromSlider(value: number[]): number {
    const percentage = value[0];
    let bet = minBet + ((maxBet - minBet) * percentage) / 100;
    // 取整到最接近的100
    bet = Math.round(bet / 100) * 100;
    return Math.max(minBet, Math.min(maxBet, bet));
  }

  // Handling slider change
  function handleSliderChange(value: number[]) {
    setSliderValue(value);
    setBetAmount(calculateBetFromSlider(value));
  }

  // 处理输入框变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value, 10) || 0;
    
    // 控制限制
    if (newValue < minBet) {
      setBetAmount(minBet);
      setSliderValue(calculateSliderValue(minBet));
    } else if (newValue > maxBet) {
      setBetAmount(maxBet);
      setSliderValue(calculateSliderValue(maxBet));
    } else {
      setBetAmount(newValue);
      setSliderValue(calculateSliderValue(newValue));
    }
  }

  // Quick bet buttons - percentages of the pot
  const quickBets = [
    { label: "2x", value: currentBet * 2 },
    { label: "3x", value: currentBet * 3 },
    { label: "نصف", value: minBet + ((maxBet - minBet) / 2) },
    { label: "الكل", value: maxBet }
  ];

  // Make sure the bet is always valid when min/max changes
  useEffect(() => {
    if (betAmount < minBet) {
      setBetAmount(minBet);
      setSliderValue(calculateSliderValue(minBet));
    } else if (betAmount > maxBet) {
      setBetAmount(maxBet);
      setSliderValue(calculateSliderValue(maxBet));
    }
  }, [minBet, maxBet]);

  return (
    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gold/30 shadow-lg flex flex-col space-y-2 w-[300px]">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white text-sm">قيمة الرهان</span>
        <div className="text-amber-400 font-bold">
          {formatChips(betAmount)}
        </div>
      </div>
      
      {/* Slider control */}
      <div className="px-1">
        <Slider
          value={sliderValue}
          min={0}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
          className="accent-gold"
        />
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-white/70">
        <span>{formatChips(minBet)}</span>
        <span>{formatChips(maxBet)}</span>
      </div>
      
      {/* Input with confirm button */}
      <div className="flex space-x-2 rtl:space-x-reverse">
        <Input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          min={minBet}
          max={maxBet}
          step={100}
          className="flex-grow text-right"
        />
        
        <div className="flex space-x-1 rtl:space-x-reverse">
          <Button 
            onClick={() => onConfirm(betAmount)}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 p-0"
          >
            <Check className="h-5 w-5" />
          </Button>
          
          <Button 
            onClick={onCancel}
            size="sm"
            variant="outline"
            className="bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-white w-10 h-10 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Quick bet buttons */}
      <div className="flex justify-between mt-2">
        {quickBets.map((bet, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className="text-xs bg-slate-800 border-slate-600 hover:bg-slate-700 text-white px-2"
            onClick={() => {
              const newBet = Math.min(maxBet, Math.max(minBet, bet.value));
              setBetAmount(newBet);
              setSliderValue(calculateSliderValue(newBet));
            }}
          >
            {bet.label}
          </Button>
        ))}
      </div>
    </div>
  );
}