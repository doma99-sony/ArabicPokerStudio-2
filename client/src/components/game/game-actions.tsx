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
    console.log("handleAction called with:", action, amount);
    console.log("isCurrentTurn:", isCurrentTurn);
    console.log("isActionInProgress:", isActionInProgress);
    
    // أضف معالجة خاصة إذا لم يكن دور اللاعب الحالي
    if (!isCurrentTurn) {
      console.log("ليس دورك للعب حاليًا");
      toast({
        title: "انتبه!",
        description: "ليس دورك للعب حاليًا، انتظر دورك.",
        variant: "destructive",
      });
      return;
    }
    
    // منع تنفيذ الإجراءات أثناء المعالجة
    if (isActionInProgress) {
      console.log("هناك إجراء قيد التنفيذ بالفعل");
      return;
    }
    
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
      console.log("عرض عناصر التحكم في الرهان");
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
        all_in: "المراهنة بكل الرقائق",
        restart_round: "تم بدء جولة جديدة"
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

  const buttonsDisabled = false; // تجاوز للاختبار - السماح بالتفاعل مع الأزرار دائمًا

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
              <span className={`text-lg font-bold font-arabic-numbers ${
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
        {/* لوحة الأزرار الرئيسية - تصميم VIP فاخر */}
        <div className="bg-gradient-to-b from-black/80 to-[#0A0A0A]/95 backdrop-blur-xl p-4 rounded-2xl border border-[#D4AF37]/30 shadow-[0_5px_20px_rgba(0,0,0,0.7)]">
          {/* عنوان لوحة الأزرار */}
          {isCurrentTurn && (
            <motion.div 
              className="text-white text-center mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-full px-4 py-1.5 text-[#D4AF37] font-bold text-sm border border-[#D4AF37]/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                دورك للعب
              </span>
            </motion.div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {/* التخلي (Fold) - تصميم محسن */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => handleAction("fold")}
                disabled={buttonsDisabled || isActionInProgress}
                className={`
                  relative w-full bg-gradient-to-br from-red-900/90 to-red-700/90 text-white px-4 py-3 rounded-xl
                  hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transform transition-all duration-200
                  shadow-lg flex items-center justify-between overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-red-600/30 group
                `}
              >
                {/* تأثير توهج عند الحركة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* محتوى الزر */}
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M19 5L5 19M5 5L19 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <span className="font-medium">تخلي</span>
                </div>
                <span className="bg-black/30 rounded-lg h-6 w-6 flex items-center justify-center text-xs font-bold border border-red-500/20">F</span>
              </Button>
            </motion.div>

            {/* المتابعة (Check) أو المجاراة (Call) - تصميم محسن */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => handleAction(canCheck ? "check" : "call")}
                disabled={buttonsDisabled || (!canCheck && !canCall) || isActionInProgress}
                className={`
                  relative w-full bg-gradient-to-br from-green-900/90 to-green-700/90 text-white px-4 py-3 rounded-xl
                  hover:shadow-[0_0_15px_rgba(22,163,74,0.5)] transform transition-all duration-200
                  shadow-lg flex items-center justify-between overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-green-600/30 group
                  ${canCheck ? 'ring-1 ring-green-400/50' : ''}
                `}
              >
                {/* تأثير توهج عند الحركة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* تأثير دور اللاعب */}
                {canCheck && isCurrentTurn && (
                  <motion.div 
                    className="absolute inset-0 opacity-30 z-10 pointer-events-none"
                    animate={{ 
                      boxShadow: ['inset 0 0 5px rgba(22,163,74,0.3)', 'inset 0 0 15px rgba(22,163,74,0.7)', 'inset 0 0 5px rgba(22,163,74,0.3)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                {/* محتوى الزر */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                      <path d="M5 12L9 16L19 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium">{canCheck ? "متابعة" : "مجاراة"}</span>
                  </div>
                  {!canCheck && (
                    <span className="text-xs text-green-200/80 mr-6 font-arabic-numbers">
                      {currentBet.toLocaleString()} رقاقة
                    </span>
                  )}
                </div>
                <span className="bg-black/30 rounded-lg h-6 w-6 flex items-center justify-center text-xs font-bold border border-green-500/20">C</span>
              </Button>
            </motion.div>

            {/* زيادة (Raise) أو رهان (Bet) - تصميم محسن */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => handleAction("raise")}
                disabled={buttonsDisabled || (!canRaise && !canBet) || isActionInProgress}
                className={`
                  relative w-full bg-gradient-to-br from-amber-800/90 to-amber-600/90 text-white px-4 py-3 rounded-xl
                  hover:shadow-[0_0_15px_rgba(217,119,6,0.5)] transform transition-all duration-200
                  shadow-lg flex items-center justify-between overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-amber-500/30 group
                `}
              >
                {/* تأثير توهج عند الحركة */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* محتوى الزر */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                      <path d="M12 20V4M12 4L5 11M12 4L19 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium">{canBet ? "رهان" : "زيادة"}</span>
                  </div>
                  {minRaise > 0 && (
                    <span className="text-xs text-amber-200/80 mr-6 font-arabic-numbers">
                      {minRaise.toLocaleString()}+ رقاقة
                    </span>
                  )}
                </div>
                <span className="bg-black/30 rounded-lg h-6 w-6 flex items-center justify-center text-xs font-bold border border-amber-500/20">R</span>
              </Button>
            </motion.div>

            {/* كل ما لديك (All-In) - تصميم محسن بتأثيرات متقدمة */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => handleAction("all_in", playerChips)}
                disabled={buttonsDisabled || !canAllIn || isActionInProgress}
                className={`
                  relative w-full bg-gradient-to-br from-purple-900/90 to-red-700/90 text-white px-4 py-3 rounded-xl
                  hover:shadow-[0_0_15px_rgba(220,38,38,0.7)] transform transition-all duration-200
                  shadow-lg flex items-center justify-between overflow-hidden group
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-red-600/30
                `}
              >
                {/* تأثير الخلفية المتحركة */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-yellow-400/10 to-red-600/20 group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                
                {/* تأثير النبض */}
                <motion.div
                  className="absolute inset-0 bg-red-500/10 rounded-xl"
                  animate={{
                    boxShadow: ['inset 0 0 5px rgba(255,0,0,0.3)', 'inset 0 0 15px rgba(255,0,0,0.7)', 'inset 0 0 5px rgba(255,0,0,0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* محتوى الزر */}
                <div className="flex flex-col items-start z-10">
                  <div className="flex items-center gap-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                      <path d="M12 12.5L7 7.5M12 12.5L17 7.5M12 12.5V3M21 16V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-bold">كل الرقائق!</span>
                  </div>
                  <span className="text-xs text-red-200/90 mr-6 font-arabic-numbers">
                    {playerChips.toLocaleString()} رقاقة
                  </span>
                </div>
                <span className="bg-black/30 rounded-lg h-6 w-6 flex items-center justify-center text-xs font-bold border border-red-500/20">A</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* مؤشر الرقائق الحالية للاعب */}
        <motion.div 
          className="bg-gradient-to-r from-[#0A0A0A]/95 to-black/90 backdrop-blur-xl rounded-full px-4 py-2 text-center shadow-lg border border-[#D4AF37]/30 flex items-center gap-2"
          animate={{ 
            boxShadow: ['0 0 5px rgba(212,175,55,0.2)', '0 0 10px rgba(212,175,55,0.3)', '0 0 5px rgba(212,175,55,0.2)']
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          {/* أيقونة الرقائق */}
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-amber-600 shadow-md flex items-center justify-center transform rotate-12 border border-white/30"></div>
          </div>
          
          <div>
            <span className="text-gold/90 text-sm mr-1">رقائقك: </span>
            <span className="text-white font-bold">{playerChips.toLocaleString()}</span>
          </div>
        </motion.div>
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