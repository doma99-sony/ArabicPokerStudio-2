import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GameAction } from "@/types";
import { BetControls } from "./bet-controls";
import { HelpCircle, Clock } from "lucide-react";

interface GameActionsProps {
  currentBet: number;
  minRaise: number;
  maxBet: number;
  playerChips: number;
  isCurrentTurn?: boolean;
  onAction: (action: GameAction, amount?: number) => void;
}

// مدة الانتظار بالثواني
const TURN_TIMEOUT_SECONDS = 12;

export function GameActions({
  currentBet,
  minRaise,
  maxBet,
  playerChips,
  isCurrentTurn = false,
  onAction
}: GameActionsProps) {
  const [betAmount, setBetAmount] = useState(minRaise || currentBet * 2 || 0);
  const [showBetControls, setShowBetControls] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // إعادة ضبط المؤقت عندما يتغير دور اللاعب
  useEffect(() => {
    // إلغاء المؤقت الحالي إذا كان موجوداً
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // إذا كان دور اللاعب الحالي، ابدأ العد التنازلي
    if (isCurrentTurn) {
      setTimeLeft(TURN_TIMEOUT_SECONDS);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          // عندما ينفد الوقت، اعتبر اللاعب منسحباً
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            // استدعاء إجراء الانسحاب تلقائياً
            onAction("fold");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // إذا لم يكن دوره، اضبط الوقت على القيمة الافتراضية
      setTimeLeft(TURN_TIMEOUT_SECONDS);
    }

    // تنظيف المؤقت عند فك المكون
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCurrentTurn, onAction]);

  const handleAction = (action: GameAction, amount?: number) => {
    if (!isCurrentTurn) return;
    
    // إلغاء المؤقت عند اتخاذ إجراء
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (action === "raise") {
      // Show bet controls for raise
      setShowBetControls(true);
      return;
    }
    
    // Hide bet controls when other actions are taken
    setShowBetControls(false);
    onAction(action, amount);
  };

  const handleBetConfirm = (amount: number) => {
    setShowBetControls(false);
    onAction("raise", amount);
  };

  const canCheck = currentBet === 0;
  const canCall = currentBet > 0 && playerChips >= currentBet;
  const canRaise = playerChips > currentBet && playerChips >= minRaise;
  const canBet = currentBet === 0 && playerChips > 0;
  const canAllIn = playerChips > 0;

  const buttonsDisabled = !isCurrentTurn;

  return (
    <motion.div 
      className="flex flex-col space-y-2 z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* مؤشر الوقت المتبقي - يظهر فقط عندما يكون دور اللاعب الحالي */}
      {isCurrentTurn && (
        <div className="flex items-center justify-center mb-2">
          <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-1 flex items-center space-x-2 rtl:space-x-reverse border border-amber-500/50">
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="flex items-center">
              <span className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                {timeLeft}
              </span>
              <span className="text-white/70 mr-1 text-sm">ثانية</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-end space-y-2">
        {/* التخلي (Fold) */}
        <Button
          onClick={() => handleAction("fold")}
          disabled={buttonsDisabled}
          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 shadow-lg w-28 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>تخلي</span>
          <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">F</span>
        </Button>

        {/* المتابعة (Check) أو المجاراة (Call) */}
        <Button
          onClick={() => handleAction(canCheck ? "check" : "call")}
          disabled={buttonsDisabled || (!canCheck && !canCall)}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 shadow-lg w-28 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{canCheck ? "متابعة" : `مجاراة ${currentBet}`}</span>
          <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">C</span>
        </Button>

        {/* زيادة (Raise) أو رهان (Bet) */}
        <Button
          onClick={() => handleAction("raise")}
          disabled={buttonsDisabled || (!canRaise && !canBet)}
          className="bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 shadow-lg w-28 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{canBet ? "رهان" : "زيادة"}</span>
          <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">R</span>
        </Button>

        {/* كل ما لديك (All-In) */}
        <Button
          onClick={() => handleAction("all_in", playerChips)}
          disabled={buttonsDisabled || !canAllIn}
          className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-2 rounded-full hover:from-red-700 hover:to-yellow-600 shadow-lg w-28 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>كل شيء</span>
          <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">A</span>
        </Button>
      </div>

      {showBetControls && (
        <BetControls
          currentBet={currentBet}
          minBet={minRaise}
          maxBet={Math.min(maxBet, playerChips)}
          defaultValue={betAmount}
          onConfirm={handleBetConfirm}
          onCancel={() => setShowBetControls(false)}
        />
      )}
    </motion.div>
  );
}