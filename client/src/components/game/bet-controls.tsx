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
    <div className="relative bg-gradient-to-b from-[#111]/95 to-[#050505]/95 backdrop-blur-xl rounded-xl p-5 border border-[#D4AF37]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex flex-col space-y-3 w-[320px] overflow-hidden">
      {/* Background pattern - poker theme */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      {/* Header with gold accent */}
      <div className="flex justify-between items-center mb-1 relative">
        <div className="flex items-center">
          <div className="w-1 h-6 bg-gold rounded-full mr-2"></div>
          <span className="text-white text-sm font-semibold">مبلغ الرهان</span>
        </div>
        <div className="bg-black/50 px-3 py-1 rounded-full border border-[#D4AF37]/30">
          <span className="text-gold font-bold text-lg">
            {formatChips(betAmount)}
          </span>
        </div>
      </div>
      
      {/* Slider control - luxurious stylish look */}
      <div className="px-2 py-2">
        <div className="relative">
          {/* Track decoration */}
          <div className="absolute inset-0 h-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-900/20 via-gold/20 to-green-900/20 rounded-full"></div>
          
          {/* Enhanced slider */}
          <Slider
            value={sliderValue}
            min={0}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="accent-gold"
          />
        </div>
      </div>
      
      {/* Min/Max labels with elegant styling */}
      <div className="flex justify-between text-xs text-white/60 px-1 -mt-1">
        <div className="flex flex-col items-center">
          <span className="text-gold/80 mb-1">الحد الأدنى</span>
          <span className="bg-black/30 px-2 py-0.5 rounded border border-gold/10">
            {formatChips(minBet)}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gold/80 mb-1">الحد الأقصى</span>
          <span className="bg-black/30 px-2 py-0.5 rounded border border-gold/10">
            {formatChips(maxBet)}
          </span>
        </div>
      </div>
      
      {/* Input with stylish confirm buttons */}
      <div className="flex space-x-2 rtl:space-x-reverse mt-1">
        <Input
          type="number"
          value={betAmount}
          onChange={handleInputChange}
          min={minBet}
          max={maxBet}
          step={100}
          className="flex-grow text-right bg-black/30 border-gold/20 text-white focus-visible:ring-gold/30 focus-visible:ring-offset-0 focus-visible:border-gold/50 text-lg"
        />
        
        <div className="flex space-x-1 rtl:space-x-reverse">
          {/* Confirm button */}
          <Button 
            onClick={() => onConfirm(betAmount)}
            size="sm"
            className="bg-gradient-to-br from-green-800 to-green-600 hover:from-green-700 hover:to-green-500 text-white w-10 h-10 p-0 border border-green-500/30 shadow-lg"
          >
            <Check className="h-5 w-5" />
          </Button>
          
          {/* Cancel button */}
          <Button 
            onClick={onCancel}
            size="sm"
            variant="outline"
            className="bg-gradient-to-br from-red-900/60 to-red-700/60 hover:from-red-800/80 hover:to-red-600/80 border-red-500/30 text-white w-10 h-10 p-0 shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Quick bet buttons with improved styling */}
      <div className="grid grid-cols-4 gap-1 mt-2">
        {quickBets.map((bet, index) => (
          <Button
            key={index}
            size="sm"
            variant="outline"
            className={`
              text-xs bg-gradient-to-b from-[#222]/90 to-[#111]/90 
              border-gold/20 hover:border-gold/50 hover:bg-gold/10 
              text-white px-2 py-3 transition-all duration-200 rounded-lg
              ${index === 3 ? 'bg-gradient-to-b from-amber-900/40 to-amber-800/30 border-amber-500/30' : ''}
            `}
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