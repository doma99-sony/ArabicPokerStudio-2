import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GameAction } from "@/types";
import { BetControls } from "./bet-controls";
import { HelpCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameActionsProps {
  currentBet: number;
  minRaise: number;
  maxBet: number;
  playerChips: number;
  isCurrentTurn?: boolean;
  onAction: (action: GameAction, amount?: number) => void;
  tableId?: number; // إضافة معرف الطاولة
  gameStatus?: string; // إضافة حالة اللعبة
}

// مدة الانتظار بالثواني
const TURN_TIMEOUT_SECONDS = 12;

export function GameActions({
  currentBet,
  minRaise,
  maxBet,
  playerChips,
  isCurrentTurn = false,
  onAction,
  tableId,
  gameStatus = "waiting"
}: GameActionsProps) {
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState(minRaise || currentBet * 2 || 0);
  const [showBetControls, setShowBetControls] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT_SECONDS);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionRef = useRef<{action: GameAction, time: number} | null>(null);

  // إعادة ضبط وتحديث قيمة الرهان الافتراضية عندما تتغير مدخلات اللعبة
  useEffect(() => {
    setBetAmount(minRaise || currentBet * 2 || 20); // تحديث للقيمة الافتراضية
  }, [minRaise, currentBet]);

  // إعادة ضبط المؤقت عندما يتغير دور اللاعب
  useEffect(() => {
    // تنبيه المستخدم عندما يحين دوره للعب
    if (isCurrentTurn && !timerRef.current) {
      // تنبيه صوتي (لاحقاً)
      toast({
        title: "دورك للعب!",
        description: `لديك ${TURN_TIMEOUT_SECONDS} ثانية لاتخاذ قرارك`,
        variant: "default"
      });
    }

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
            // إبلاغ المستخدم
            toast({
              title: "انتهى الوقت!",
              description: "سيتم تنفيذ التخلي (Fold) تلقائياً",
              variant: "destructive"
            });
            // استدعاء إجراء الانسحاب تلقائياً بعد تأخير قصير
            setTimeout(() => {
              onAction("fold");
            }, 500);
            return 0;
          }
          // التحذير قبل انتهاء الوقت
          if (prevTime === 5) {
            toast({
              title: "تنبيه!",
              description: "بقي 5 ثوانٍ فقط!",
              variant: "destructive"
            });
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
  }, [isCurrentTurn, onAction, toast]);

  // التحقق من الضغط المتكرر للأزرار (للمنع)
  const isActionTooSoon = (action: GameAction): boolean => {
    const now = Date.now();
    if (lastActionRef.current && 
        lastActionRef.current.action === action && 
        now - lastActionRef.current.time < 1000) {
      return true;
    }
    lastActionRef.current = { action, time: now };
    return false;
  };

  const handleAction = async (action: GameAction, amount?: number) => {
    if (!isCurrentTurn || isActionInProgress) return;
    
    // منع الضغط المتكرر على نفس الزر
    if (isActionTooSoon(action)) {
      console.log("الرجاء الانتظار قبل إعادة نفس الإجراء");
      return;
    }
    
    // إلغاء المؤقت عند اتخاذ إجراء
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // عالج حالة الرفع بشكل منفصل
    if (action === "raise") {
      setShowBetControls(true);
      return;
    }
    
    try {
      // تفعيل مؤشر التحميل
      setIsActionInProgress(true);
      
      // تسجيل الإجراء في وحدة التحكم للتصحيح
      console.log("تنفيذ إجراء اللعبة:", { action, amount });
      
      // إخفاء عناصر التحكم في الرهان عند اتخاذ إجراءات أخرى
      setShowBetControls(false);
      
      // تنفيذ الإجراء
      await onAction(action, amount);
      
      // رسالة نجاح
      const actionMessages = {
        fold: "تم التخلي عن الجولة",
        check: "متابعة بدون رهان",
        call: `مجاراة بمبلغ ${currentBet}`,
        raise: `زيادة الرهان إلى ${amount}`,
        all_in: "المراهنة بكل الرقائق"
      };
      
      toast({
        title: "تم تنفيذ الإجراء",
        description: actionMessages[action] || "تم تنفيذ الإجراء بنجاح",
        variant: "default"
      });
    } catch (error) {
      console.error("خطأ في تنفيذ الإجراء:", error);
      toast({
        title: "فشل تنفيذ الإجراء",
        description: "حدث خطأ، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsActionInProgress(false);
    }
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
      {/* إشعار بحالة اللعبة */}
      {gameStatus === "waiting" && (
        <div className="flex items-center justify-center mb-2">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 rtl:space-x-reverse border border-blue-500/50">
            <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />
            <div className="flex items-center">
              <span className="text-white text-sm">
                في انتظار لاعبين آخرين للبدء...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* مؤشر الوقت المتبقي - يظهر فقط عندما يكون دور اللاعب الحالي */}
      {isCurrentTurn && (
        <div className="flex items-center justify-center mb-3">
          <div className={`
            bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 
            flex items-center space-x-2 rtl:space-x-reverse 
            border-2 ${timeLeft <= 3 ? 'border-red-500 animate-pulse' : 'border-amber-500/50'}
            shadow-lg
          `}>
            <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-500 animate-spin' : 'text-amber-500'}`} />
            <div className="flex items-center">
              <span className={`text-lg font-bold ${
                timeLeft <= 3 ? 'text-red-500 animate-pulse' : 
                timeLeft <= 6 ? 'text-amber-400' : 
                'text-white'
              }`}>
                {timeLeft}
              </span>
              <span className="text-white/70 mr-1 text-sm">ثانية</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-end space-y-3">
        {/* لوحة الأزرار الرئيسية */}
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-gray-700 shadow-xl">
          {/* عنوان لوحة الأزرار */}
          {isCurrentTurn && (
            <div className="text-white text-center mb-2 font-bold text-sm">
              <span className="bg-black/40 rounded-full px-3 py-1">دورك للعب</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            {/* التخلي (Fold) */}
            <Button
              onClick={() => handleAction("fold")}
              disabled={buttonsDisabled || isActionInProgress}
              className={`
                bg-red-600 text-white px-4 py-3 rounded-xl
                hover:bg-red-700 hover:scale-105 transform transition-all duration-200
                shadow-lg flex items-center justify-between 
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-red-500/30
              `}
            >
              <span>تخلي</span>
              <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">F</span>
            </Button>

            {/* المتابعة (Check) أو المجاراة (Call) */}
            <Button
              onClick={() => handleAction(canCheck ? "check" : "call")}
              disabled={buttonsDisabled || (!canCheck && !canCall) || isActionInProgress}
              className={`
                bg-green-600 text-white px-4 py-3 rounded-xl
                hover:bg-green-700 hover:scale-105 transform transition-all duration-200
                shadow-lg flex items-center justify-between 
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-green-500/30
                ${canCheck ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex flex-col">
                <span>{canCheck ? "متابعة" : "مجاراة"}</span>
                {!canCheck && <span className="text-xs opacity-80">{currentBet}</span>}
              </div>
              <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">C</span>
            </Button>

            {/* زيادة (Raise) أو رهان (Bet) */}
            <Button
              onClick={() => handleAction("raise")}
              disabled={buttonsDisabled || (!canRaise && !canBet) || isActionInProgress}
              className={`
                bg-amber-600 text-white px-4 py-3 rounded-xl
                hover:bg-amber-700 hover:scale-105 transform transition-all duration-200
                shadow-lg flex items-center justify-between 
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-amber-500/30
              `}
            >
              <div className="flex flex-col">
                <span>{canBet ? "رهان" : "زيادة"}</span>
                <span className="text-xs opacity-80">{minRaise > 0 ? `${minRaise}+` : ''}</span>
              </div>
              <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">R</span>
            </Button>

            {/* كل ما لديك (All-In) */}
            <Button
              onClick={() => handleAction("all_in", playerChips)}
              disabled={buttonsDisabled || !canAllIn || isActionInProgress}
              className={`
                bg-gradient-to-r from-red-600 to-yellow-500 text-white px-4 py-3 rounded-xl
                hover:from-red-700 hover:to-yellow-600 hover:scale-105 transform transition-all duration-200
                shadow-lg flex items-center justify-between 
                disabled:opacity-50 disabled:cursor-not-allowed
                border border-yellow-500/30
              `}
            >
              <div className="flex flex-col">
                <span>كل شيء!</span>
                <span className="text-xs opacity-80">{playerChips}</span>
              </div>
              <span className="bg-white/20 rounded-full h-6 w-6 flex items-center justify-center text-xs">A</span>
            </Button>
          </div>
        </div>

        {/* مؤشر الرقائق الحالية للاعب */}
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-center shadow-inner border border-gray-700/50">
          <span className="text-gold text-sm">رقائقك: </span>
          <span className="text-white font-bold">{playerChips.toLocaleString()}</span>
        </div>
      </div>

      {/* عناصر التحكم في الرهان */}
      {showBetControls && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <BetControls
            currentBet={currentBet}
            minBet={minRaise}
            maxBet={Math.min(maxBet, playerChips)}
            defaultValue={betAmount}
            onConfirm={handleBetConfirm}
            onCancel={() => setShowBetControls(false)}
          />
        </motion.div>
      )}
    </motion.div>
  );
}