import { useState, useEffect, useRef, useMemo } from "react";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, ArrowLeft, Volume2, VolumeX, Trophy, Settings, 
  Info, RotateCw, Sparkles, Gift, GiftIcon, X 
} from "lucide-react";
import { formatChips } from "@/lib/utils";
import { GoldDustEffect } from "@/components/effects/snow-effect";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// تعريف أنواع رموز اللعبة
type SymbolType = 
  | "cleopatra" // كليوباترا (رمز عالي القيمة)
  | "book" // كتاب الأسرار (Scatter)
  | "eye" // عين حورس
  | "anubis" // أنوبيس
  | "cat" // القط المصري
  | "A" | "K" | "Q" | "J" | "10" // الرموز التقليدية للبطاقات
  | "wild"; // الجوكر (يمكن أن يحل محل أي رمز)

// واجهة تمثل موضع الرمز في البكرات
interface ReelPosition {
  row: number;
  col: number;
  symbol: SymbolType;
}

export default function EgyptQueenPage() {
  const [location, navigate] = useLocation();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const globalWs = useGlobalWebSocket();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10000);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spinAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  
  // حالة البكرات - 5 بكرات × 3 صفوف
  const [reels, setReels] = useState<SymbolType[][]>([
    ["cat", "A", "cleopatra"],
    ["eye", "book", "K"],
    ["cleopatra", "anubis", "Q"],
    ["J", "wild", "cat"],
    ["book", "10", "anubis"],
  ]);
  
  // مؤقت الدوران للحصول على تأثير الحركة
  const [spinTimer, setSpinTimer] = useState<NodeJS.Timeout | null>(null);
  
  // حالة الخطوط الفائزة
  const [winningLines, setWinningLines] = useState<ReelPosition[][]>([]);
  
  // عدد اللفات المجانية المتبقية
  const [freeSpins, setFreeSpins] = useState(0);
  
  // مضاعف الفوز الحالي
  const [winMultiplier, setWinMultiplier] = useState(1);
  
  // حالة لعبة المكافأة (الصناديق الفرعونية)
  const [bonusGameOpen, setBonusGameOpen] = useState(false);
  // تعريف أنواع صناديق الكنز
  type TreasureChestValues = 'normal' | 'special' | 'golden';
  const [treasureChests, setTreasureChests] = useState<Array<{opened: boolean, reward: number, type: TreasureChestValues}>>([]);
  const [chestsOpened, setChestsOpened] = useState(0);
  const [totalBonusWin, setTotalBonusWin] = useState(0);
  
  // التأكد من اتصال WebSocket عند دخول الصفحة
  useEffect(() => {
    if (user && user.id && !globalWs.isConnected) {
      console.log('إنشاء اتصال WebSocket في صفحة ملكة مصر');
      globalWs.connect(user.id);
    }
    
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة صفحة ملكة مصر');
    };
  }, [user, globalWs]);
  
  // الاستماع لرسائل WebSocket
  useEffect(() => {
    if (globalWs) {
      // اشتراك في رسائل WebSocket
      const handleWebSocketMessage = (message: any) => {
        if (!message) return;
        
        // تحديث رصيد اللاعب عند تلقي تحديث الرصيد
        if (message.type === 'chips_update') {
          console.log('تم استلام تحديث الرصيد:', message);
          
          // إذا كان التحديث متعلق بلعبة ملكة مصر، نعرض رسالة توضيحية
          if (message.game === 'egypt-queen') {
            if (message.action === 'slot_bet') {
              // رسالة خصم الرهان (لا نعرضها هنا لتجنب التكرار)
            } else if (message.action === 'slot_win' || message.action === 'bonus_win') {
              // رسالة إضافة الفوز (تم عرضها بالفعل في وظيفة التحقق من الفوز)
            }
          }
          
          // تحديث حالة المستخدم المحلية
          setUser(prevUser => {
            if (!prevUser) return prevUser;
            return {
              ...prevUser,
              chips: message.chips
            };
          });
        }
        // التعامل مع رسائل الخطأ
        else if (message.type === 'error') {
          console.error('خطأ WebSocket:', message.message);
          toast({
            title: "خطأ",
            description: message.message,
            variant: "destructive"
          });
        }
      };
      
      // إضافة مستمع الرسائل
      globalWs.addMessageHandler('egypt-queen-page', handleWebSocketMessage);
      
      // إزالة المستمع عند مغادرة الصفحة
      return () => {
        globalWs.removeMessageHandler('egypt-queen-page');
        console.log('تم إزالة مستمع WebSocket عند مغادرة صفحة ملكة مصر');
      };
    }
  }, [globalWs, toast]);

  // تشغيل الموسيقى الخلفية عند تحميل الصفحة
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      
      // تشغيل الموسيقى الخلفية عند التفاعل مع الصفحة
      const playOnInteraction = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error('فشل في تشغيل الموسيقى:', error);
          });
        }
        
        document.removeEventListener('click', playOnInteraction);
      };
      
      document.addEventListener('click', playOnInteraction);
      
      return () => {
        document.removeEventListener('click', playOnInteraction);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, []);
  
  // تحديث كتم/تشغيل الصوت
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (spinAudioRef.current) {
      spinAudioRef.current.muted = isMuted;
    }
    if (winAudioRef.current) {
      winAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // دالة لبدء اللعبة
  const startGame = () => {
    // تشغيل صوت النقر
    const clickSound = document.getElementById('egypt-click-sound') as HTMLAudioElement;
    if (clickSound && !isMuted) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.error(e));
    }
    
    setIsGameStarted(true);
    
    // تشغيل الموسيقى إذا لم تكن مكتومة
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(error => {
        console.error('فشل في تشغيل الموسيقى:', error);
      });
    }
  };
  
  // دالة مساعدة لإنشاء رمز عشوائي
  const generateRandomSymbol = (): SymbolType => {
    const allSymbols: SymbolType[] = [
      "cleopatra", "book", "eye", "anubis", "cat", 
      "A", "K", "Q", "J", "10", "wild"
    ];
    
    // توزيع وزن الاحتمالات - الرموز ذات القيمة العالية أقل احتمالية
    const weights = {
      "cleopatra": 1, // نادر
      "book": 1,      // نادر (Scatter)
      "wild": 1,      // نادر (يمكن أن يحل محل أي رمز)
      "eye": 2,       // أقل شيوعاً
      "anubis": 2,    // أقل شيوعاً
      "cat": 3,       // متوسط الشيوع
      "A": 4,         // شائع
      "K": 4,         // شائع
      "Q": 5,         // شائع جداً
      "J": 5,         // شائع جداً
      "10": 5,        // شائع جداً
    };
    
    // إنشاء مصفوفة موزونة للسحب العشوائي
    const weightedArray: SymbolType[] = [];
    
    for (const symbol of allSymbols) {
      const weight = weights[symbol as keyof typeof weights];
      for (let i = 0; i < weight; i++) {
        weightedArray.push(symbol);
      }
    }
    
    // اختيار رمز عشوائي من المصفوفة الموزونة
    const randomIndex = Math.floor(Math.random() * weightedArray.length);
    return weightedArray[randomIndex];
  };
  
  // دالة لإنشاء بكرات عشوائية جديدة
  const generateNewReels = (): SymbolType[][] => {
    const newReels: SymbolType[][] = [];
    
    // إنشاء 5 بكرات كل منها بـ 3 صفوف
    for (let i = 0; i < 5; i++) {
      const reel: SymbolType[] = [];
      for (let j = 0; j < 3; j++) {
        reel.push(generateRandomSymbol());
      }
      newReels.push(reel);
    }
    
    return newReels;
  };
  
  // دالة للتحقق من خطوط الفوز
  const checkWinningLines = (reelsState: SymbolType[][]): ReelPosition[][] => {
    const winningLines: ReelPosition[][] = [];
    
    // خطوط الدفع (3 خطوط أفقية)
    // خط الصف العلوي
    checkLine(reelsState, 0, winningLines);
    // خط الصف الأوسط
    checkLine(reelsState, 1, winningLines);
    // خط الصف السفلي
    checkLine(reelsState, 2, winningLines);
    
    return winningLines;
  };
  
  // دالة مساعدة للتحقق من خط فوز محدد
  const checkLine = (reelsState: SymbolType[][], row: number, winningLines: ReelPosition[][]) => {
    const line: ReelPosition[] = [];
    
    // الرمز المرجعي (الأول في الخط)
    const firstSymbol = reelsState[0][row];
    let matchCount = 1;
    
    // إضافة الرمز الأول إلى الخط
    line.push({ row, col: 0, symbol: firstSymbol });
    
    // التحقق من بقية الرموز في نفس الصف
    for (let col = 1; col < reelsState.length; col++) {
      const currentSymbol = reelsState[col][row];
      
      // إذا كان الرمز الحالي يتطابق مع الأول أو كان "wild"
      if (currentSymbol === firstSymbol || currentSymbol === "wild" || firstSymbol === "wild") {
        matchCount++;
        line.push({ row, col, symbol: currentSymbol });
      } else {
        break; // توقف عند أول رمز غير متطابق
      }
    }
    
    // إذا كان هناك 3 رموز متطابقة على الأقل، فهناك فوز
    if (matchCount >= 3) {
      winningLines.push(line);
    }
  };
  
  // حساب قيمة الفوز بناءً على خطوط الفوز والرموز والرهان
  const calculateWinAmount = (winningLines: ReelPosition[][], bet: number): number => {
    let totalWin = 0;
    
    // قيم الرموز
    const symbolValues = {
      "cleopatra": 10, // أعلى قيمة
      "book": 0,       // يعامل بشكل خاص (scatter)
      "wild": 8,       // قيمة عالية
      "anubis": 6,     
      "eye": 5,
      "cat": 4,
      "A": 3,
      "K": 3,
      "Q": 2,
      "J": 2,
      "10": 1,
    };
    
    // حساب القيمة لكل خط فائز
    for (const line of winningLines) {
      // تحديد قيمة الرمز الأساسي (مع مراعاة الـ wild)
      const baseSymbol = line[0].symbol === "wild" && line.length > 1 
        ? line[1].symbol 
        : line[0].symbol;
      
      // تجاهل خطوط الـ scatter (سيتم التعامل معها بشكل منفصل)
      if (baseSymbol === "book") continue;
      
      // عدد الرموز المتطابقة
      const matchCount = line.length;
      
      // القيمة الأساسية للرمز
      const baseValue = symbolValues[baseSymbol as keyof typeof symbolValues];
      
      // حساب القيمة بناءً على عدد التطابقات
      // 3 رموز = 1x القيمة، 4 رموز = 2x القيمة، 5 رموز = 5x القيمة
      let multiplier = 1;
      if (matchCount === 4) multiplier = 2;
      if (matchCount === 5) multiplier = 5;
      
      // حساب الفوز لهذا الخط مع تطبيق مضاعف اللفات المجانية
      const lineWin = baseValue * multiplier * bet / 10 * winMultiplier;
      totalWin += lineWin;
    }
    
    // إضافة مكافأة خاصة إذا كان هناك 3 أو أكثر من رمز "book" (scatter) في أي مكان
    const scatterCount = countScatters(reels);
    if (scatterCount >= 3) {
      // 3 scatters = 5x الرهان، 4 scatters = 20x الرهان، 5 scatters = 50x الرهان
      let scatterMultiplier = 0;
      if (scatterCount === 3) scatterMultiplier = 5;
      if (scatterCount === 4) scatterMultiplier = 20;
      if (scatterCount === 5) scatterMultiplier = 50;
      
      totalWin += scatterMultiplier * bet;
      
      // منح لفات مجانية
      if (scatterCount >= 3) {
        // تعيين عدد اللفات المجانية بناءً على عدد رموز الـ scatter
        // 3 كتب = 10 لفات، 4 كتب = 15 لفة، 5 كتب = 20 لفة
        let spinCount = 10;
        if (scatterCount === 4) spinCount = 15;
        if (scatterCount === 5) spinCount = 20;
        
        // منح لفات مجانية
        setFreeSpins(prev => prev + spinCount);
        
        // ضبط مضاعف الربح للفات المجانية
        setWinMultiplier(2); // مضاعف 2x خلال اللفات المجانية
      }
    }
    
    return Math.round(totalWin);
  };
  
  // دالة مساعدة لعد رموز الـ scatter في أي مكان على الشاشة
  const countScatters = (reelsState: SymbolType[][]): number => {
    let count = 0;
    
    for (let col = 0; col < reelsState.length; col++) {
      for (let row = 0; row < reelsState[col].length; row++) {
        if (reelsState[col][row] === "book") {
          count++;
        }
      }
    }
    
    return count;
  };
  
  // دالة إعداد لعبة المكافأة - صناديق الكنز الفرعونية
  const setupBonusGame = () => {
    // إنشاء 5 صناديق للكنز
    const chests: Array<{opened: boolean, reward: number, type: TreasureChestValues}> = Array(5).fill(null).map(() => {
      // إنشاء جائزة عشوائية تتناسب مع مستوى الرهان
      // زيادة نطاق المكافآت المحتملة لتكون أكثر إثارة
      // صندوق واحد على الأقل سيحتوي على مكافأة كبيرة
      // القيمة الأساسية بين 5 و 30 مضروبة في مستوى الرهان
      const rewardMultiplier = Math.floor(Math.random() * 25) + 5;
      // تحديد نوع الصندوق عشوائيًا 
      const chestType: TreasureChestValues = Math.random() < 0.2 ? 'special' : 'normal';
      return {
        opened: false,
        reward: rewardMultiplier * betAmount,
        // إضافة نوع الصندوق للحصول على تأثيرات بصرية مختلفة
        type: chestType
      };
    });
    
    // التأكد من وجود صندوق واحد على الأقل ذو قيمة عالية جداً (50-100x)
    const luckyIndex = Math.floor(Math.random() * 5);
    const superRewardMultiplier = Math.floor(Math.random() * 50) + 50;
    // تعريف الصندوق الذهبي (الخاص بالمكافأة الكبيرة)
    chests[luckyIndex] = {
      opened: false,
      reward: superRewardMultiplier * betAmount,
      type: 'golden'
    };
    
    // إعادة تعيين المتغيرات
    setTreasureChests(chests);
    setChestsOpened(0);
    setTotalBonusWin(0);
    
    // تشغيل صوت بدء لعبة المكافأة
    const bonusSound = document.getElementById('egypt-bonus-sound') as HTMLAudioElement;
    if (bonusSound && !isMuted) {
      bonusSound.currentTime = 0;
      bonusSound.play().catch(e => console.error(e));
    }
    
    // عرض نافذة لعبة المكافأة
    setBonusGameOpen(true);
    
    // إظهار رسالة لعبة المكافأة
    toast({
      title: "لعبة المكافأة! 🏺",
      description: "اختر 3 صناديق للحصول على جوائز إضافية من كنوز الفراعنة!",
      variant: "default"
    });
  };

  // دالة لفتح صندوق كنز
  const openTreasureChest = (index: number) => {
    // تجنب فتح صندوق سبق فتحه
    if (treasureChests[index].opened) return;
    
    // نسخ حالة الصناديق
    const updatedChests = [...treasureChests];
    
    // فتح الصندوق
    updatedChests[index].opened = true;
    
    // تحديد نوع الصوت بناءً على نوع الصندوق
    let soundElement;
    
    if (updatedChests[index].type === 'golden') {
      // صوت مميز للكنز الذهبي
      soundElement = document.getElementById('egypt-big-win-sound') as HTMLAudioElement;
    } else {
      // صوت عادي لفتح الصندوق
      soundElement = document.getElementById('egypt-chest-open-sound') as HTMLAudioElement;
    }
    
    if (soundElement && !isMuted) {
      soundElement.currentTime = 0;
      soundElement.play().catch(e => console.error(e));
    }
    
    // تحديث العدد
    const newChestsOpened = chestsOpened + 1;
    
    // إضافة الجائزة إلى المجموع
    const chestReward = updatedChests[index].reward;
    const newTotalBonus = totalBonusWin + chestReward;
    
    // تحديث الحالة
    setTreasureChests(updatedChests);
    setChestsOpened(newChestsOpened);
    setTotalBonusWin(newTotalBonus);
    
    // تحديد نوع الرسالة بناءً على نوع الصندوق وقيمة المكافأة
    let messageTitle = "كنز فرعوني! 💰";
    let messageVariant = "default";
    
    if (updatedChests[index].type === 'golden') {
      messageTitle = "كنز ذهبي عظيم! 👑✨";
      messageVariant = "default";
    } else if (updatedChests[index].type === 'special') {
      messageTitle = "كنز مميز! 🏺✨";
    }
    
    // عرض رسالة بالمكافأة التي تم الحصول عليها
    toast({
      title: messageTitle,
      description: `وجدت ${chestReward} رقاقة في هذا الصندوق!`,
      variant: messageVariant as any
    });
    
    // إذا تم فتح 3 صناديق، أغلق اللعبة بعد عرض النتائج
    if (newChestsOpened >= 3) {
      // تأثير التأخير للجوائز المتتالية
      setTimeout(() => {
        // تشغيل صوت الفوز الكبير
        const bigWinSound = document.getElementById('egypt-big-win-sound') as HTMLAudioElement;
        if (bigWinSound && !isMuted) {
          bigWinSound.currentTime = 0;
          bigWinSound.play().catch(e => console.error(e));
        }
        
        // إغلاق لعبة المكافأة بعد فترة
        setTimeout(() => {
          setBonusGameOpen(false);
          
          // عرض الفوز الإجمالي
          toast({
            title: "مكافأة كاملة! 🏆",
            description: `مجموع المكافأة: ${newTotalBonus} رقاقة!`,
            variant: "default"
          });
          
          // إرسال المكافأة إلى الخادم (إذا كان المستخدم متصلاً)
          if (user && user.id && globalWs && globalWs.isConnected) {
            try {
              globalWs.sendMessage({
                type: 'game_action',
                data: {
                  userId: user.id,
                  action: 'slot_bonus_win',
                  amount: newTotalBonus,
                  game: 'egypt-queen',
                  timestamp: Date.now()
                }
              });
              
              console.log('تم إرسال معلومات مكافأة السلوت للخادم');
            } catch (error) {
              console.error('فشل في إرسال معلومات المكافأة:', error);
            }
          } else {
            // حفظ في المتصفح مؤقتاً إذا لم يكن هناك اتصال بالخادم
            console.log('لا يمكن إرسال معلومات المكافأة للخادم - المستخدم غير متصل');
          }
        }, 2000);
      }, 500);
    }
  };

  // دالة محاكاة دوران البكرات مع تأثير بصري متطور
  const animateReels = () => {
    // إيقاف أي مؤقت سابق
    if (spinTimer) {
      clearInterval(spinTimer);
    }
    
    // محاكاة دوران تدريجي للبكرات - كل بكرة تتوقف بعد الأخرى
    const totalSpinTime = 3000; // 3 ثواني للدوران الكامل
    const initialSpinFrames = 10; // عدد إطارات الدوران السريع الأولي
    const reelStopDelay = 300; // الفاصل الزمني بين توقف كل بكرة (بالمللي ثانية)
    
    let currentFrame = 0;
    const totalReels = 5;
    let stoppedReels = 0;
    let finalReelsResult = generateNewReels(); // النتيجة النهائية محددة مسبقاً
    
    // تحديث الرمز الدوار مع تأثير محسن
    const updateSpinningReels = () => {
      // نسخة من الحالة الحالية
      let updatedReels = [...reels];
      
      // تحديث البكرات التي لا تزال تدور
      for (let i = stoppedReels; i < totalReels; i++) {
        // إنشاء بكرة جديدة مع رموز عشوائية
        const spinningReel: SymbolType[] = [];
        for (let j = 0; j < 3; j++) {
          spinningReel.push(generateRandomSymbol());
        }
        updatedReels[i] = spinningReel;
      }
      
      // تحديث الحالة
      setReels(updatedReels);
    };
    
    // تشغيل صوت النقرة عند توقف كل بكرة
    const playReelStopSound = () => {
      const clickSound = document.getElementById('egypt-click-sound') as HTMLAudioElement;
      if (clickSound && !isMuted) {
        clickSound.currentTime = 0;
        clickSound.volume = 0.5;
        clickSound.play().catch(e => console.error(e));
      }
    };
    
    // إنشاء مؤقت للتحريك الأولي السريع
    const initialSpinTimer = setInterval(() => {
      if (currentFrame < initialSpinFrames) {
        // تحريك سريع في البداية
        updateSpinningReels();
        currentFrame++;
      } else {
        // إيقاف المؤقت الأولي والانتقال إلى مرحلة توقف البكرات
        clearInterval(initialSpinTimer);
        
        // بدء توقف البكرات واحدة تلو الأخرى
        const stopReelsSequentially = () => {
          if (stoppedReels < totalReels) {
            // تثبيت رموز البكرة التي ستتوقف
            let updatedReels = [...reels];
            updatedReels[stoppedReels] = finalReelsResult[stoppedReels];
            setReels(updatedReels);
            
            // تشغيل صوت توقف البكرة
            playReelStopSound();
            
            // زيادة عداد البكرات المتوقفة
            stoppedReels++;
            
            // استمرار تحريك البكرات المتبقية
            const spinRemainingTimer = setInterval(() => {
              updateSpinningReels();
            }, 100);
            
            // جدولة توقف البكرة التالية
            if (stoppedReels < totalReels) {
              setTimeout(() => {
                clearInterval(spinRemainingTimer);
                stopReelsSequentially();
              }, reelStopDelay);
            } else {
              // عند توقف جميع البكرات، تنظيف وإنهاء
              clearInterval(spinRemainingTimer);
              
              // التحقق من الفوز
              const wins = checkWinningLines(finalReelsResult);
              setWinningLines(wins);
              
              // حساب مبلغ الفوز
              if (wins.length > 0) {
                const winAmount = calculateWinAmount(wins, betAmount);
                
                // تشغيل صوت الفوز بعد تأخير قصير
                setTimeout(() => {
                  if (winAudioRef.current && !isMuted) {
                    winAudioRef.current.currentTime = 0;
                    winAudioRef.current.play().catch(e => console.error(e));
                  }
                  
                  // عرض رسالة الفوز
                  toast({
                    title: "مبروك! 🎉",
                    description: `لقد ربحت ${formatChips(winAmount)} رقاقة`,
                    variant: "default"
                  });
                }, 500);
                
                // إرسال معلومات الفوز إلى الخادم
                if (user && user.id && globalWs && globalWs.isConnected) {
                  try {
                    globalWs.sendMessage({
                      type: 'game_action',
                      data: {
                        userId: user.id,
                        action: 'slot_win',
                        amount: winAmount,
                        game: 'egypt-queen',
                        timestamp: Date.now()
                      }
                    });
                    
                    console.log('تم إرسال معلومات الفوز للخادم');
                  } catch (error) {
                    console.error('فشل في إرسال معلومات الفوز:', error);
                  }
                }
              }
              
              // التحقق من تفعيل لعبة المكافأة
              const scatterCount = countScatters(finalReelsResult);
              if (scatterCount >= 3) {
                // بدء لعبة المكافأة بعد ثانية للسماح للاعب برؤية الفوز أولاً
                setTimeout(() => {
                  setupBonusGame();
                }, 1500);
              }
              
              // إنهاء حالة الدوران
              setSpinTimer(null);
              setIsSpinning(false);
            }
          }
        };
        
        // بدء تسلسل توقف البكرات
        setTimeout(stopReelsSequentially, 500);
      }
    }, 100);
    
    // حفظ مرجع المؤقت
    setSpinTimer(initialSpinTimer);
  };
  
  // دالة لتدوير عجلات السلوت
  const spin = () => {
    if (isSpinning) return;
    
    // إذا كان لدينا لفات مجانية، نستخدمها
    const isFreeSpinUsed = freeSpins > 0;
    
    // التحقق من أن لدى اللاعب رصيد كاف (فقط إذا لم تكن لفة مجانية)
    if (!isFreeSpinUsed && (user?.chips || 0) < betAmount) {
      toast({
        title: "رصيد غير كاف",
        description: "لا يوجد لديك رصيد كاف للمراهنة",
        variant: "destructive"
      });
      return;
    }
    
    // إرسال معلومات الرهان إلى الخادم (فقط إذا لم تكن لفة مجانية)
    if (!isFreeSpinUsed && user && user.id && globalWs && globalWs.isConnected) {
      try {
        globalWs.sendMessage({
          type: 'game_action',
          action: 'slot_bet',
          amount: betAmount,
          data: {
            game: 'egypt-queen',
            timestamp: Date.now()
          }
        });
        
        // تحديث الرصيد محلياً للاستجابة السريعة
        setUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            chips: prevUser.chips - betAmount
          };
        });
        
        console.log(`تم إرسال معلومات الرهان للخادم: ${betAmount} رقاقة`);
      } catch (error) {
        console.error('فشل في إرسال معلومات الرهان:', error);
        toast({
          title: "خطأ في المراهنة",
          description: "حدث خطأ أثناء محاولة المراهنة. يرجى المحاولة مرة أخرى.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // تشغيل صوت النقر
    const clickSound = document.getElementById('egypt-click-sound') as HTMLAudioElement;
    if (clickSound && !isMuted) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.error(e));
      
      // بعد صوت النقر بفترة قصيرة، نشغل صوت الدوران
      setTimeout(() => {
        // إذا كانت هذه لفة مجانية، نشغل صوت خاص باللفات المجانية
        if (isFreeSpinUsed) {
          const freeSpinSound = document.getElementById('egypt-free-spins-sound') as HTMLAudioElement;
          if (freeSpinSound && !isMuted) {
            freeSpinSound.currentTime = 0;
            freeSpinSound.play().catch(e => console.error(e));
          }
        } else if (spinAudioRef.current && !isMuted) {
          // صوت الدوران العادي
          spinAudioRef.current.currentTime = 0;
          spinAudioRef.current.play().catch(e => console.error(e));
        }
      }, 200);
    } else if (spinAudioRef.current && !isMuted) {
      // في حالة عدم وجود صوت النقر
      if (isFreeSpinUsed) {
        const freeSpinSound = document.getElementById('egypt-free-spins-sound') as HTMLAudioElement;
        if (freeSpinSound && !isMuted) {
          freeSpinSound.currentTime = 0;
          freeSpinSound.play().catch(e => console.error(e));
        }
      } else {
        // صوت الدوران العادي
        spinAudioRef.current.currentTime = 0;
        spinAudioRef.current.play().catch(e => console.error(e));
      }
    }
    
    // إذا كانت لفة مجانية، نقلل العداد
    if (isFreeSpinUsed) {
      setFreeSpins(prevSpins => {
        const remainingSpins = prevSpins - 1;
        
        // إذا كانت هذه هي اللفة المجانية الأخيرة
        if (remainingSpins === 0) {
          // إعادة تعيين المضاعف عند انتهاء اللفات المجانية
          setWinMultiplier(1);
          
          // إظهار رسالة انتهاء اللفات المجانية
          toast({
            title: "انتهت اللفات المجانية! 🎲",
            description: "استمتع بألعاب ملكة مصر!",
            variant: "default"
          });
        }
        
        return remainingSpins;
      });
    }
    
    // إعادة تعيين خطوط الفوز
    setWinningLines([]);
    
    // بدء الدوران
    setIsSpinning(true);
    
    // تحريك البكرات
    animateReels();
  };
  
  // زيادة مبلغ الرهان (مضاعفة)
  const increaseBet = () => {
    if (isSpinning) return;
    
    // تشغيل صوت النقر
    const clickSound = document.getElementById('egypt-click-sound') as HTMLAudioElement;
    if (clickSound && !isMuted) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.error(e));
    }
    
    // مضاعفة المبلغ
    setBetAmount(prev => Math.min(prev * 2, 100000));
  };
  
  // تقليل مبلغ الرهان (النصف)
  const decreaseBet = () => {
    if (isSpinning) return;
    
    // تشغيل صوت النقر
    const clickSound = document.getElementById('egypt-click-sound') as HTMLAudioElement;
    if (clickSound && !isMuted) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.error(e));
    }
    
    // تقليل المبلغ إلى النصف
    setBetAmount(prev => Math.max(Math.floor(prev / 2), 10000));
  };
  
  // دالة للعودة إلى القائمة الرئيسية
  const goToHome = () => {
    navigate('/');
  };
  
  // تبديل كتم الصوت
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // دالة لعرض رمز معين باستخدام الصور أو الرموز التعبيرية
  const renderSymbol = (symbol: SymbolType, isWinning: boolean = false): React.ReactNode => {
    // تعيين الرموز المرئية لكل نوع
    const symbolMap: Record<SymbolType, { icon: React.ReactNode; description: string }> = {
      "cleopatra": { 
        icon: <img src="/images/egypt-queen/symbols/cleopatra.svg" alt="كليوباترا" className="w-16 h-16 object-contain" 
          onError={(e) => (e.currentTarget.textContent = "👸")}/>, 
        description: "كليوباترا" 
      },
      "book": { 
        icon: <img src="/images/egypt-queen/symbols/book.svg" alt="كتاب الأسرار" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "📜")}/>,
        description: "كتاب الأسرار" 
      },
      "eye": { 
        icon: <img src="/images/egypt-queen/symbols/eye.svg" alt="عين حورس" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "👁️")}/>,
        description: "عين حورس" 
      },
      "anubis": { 
        icon: <img src="/images/egypt-queen/symbols/anubis.svg" alt="أنوبيس" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🐺")}/>,
        description: "أنوبيس" 
      },
      "cat": { 
        icon: <img src="/images/egypt-queen/symbols/cat.svg" alt="القط المصري" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🐱")}/>,
        description: "القط المصري" 
      },
      "wild": { 
        icon: <span className="text-4xl font-bold text-amber-500">✨</span>, 
        description: "الجوكر" 
      },
      "A": { 
        icon: <img src="/images/egypt-queen/symbols/A.svg" alt="A" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🅰️")}/>,
        description: "A" 
      },
      "K": { 
        icon: <img src="/images/egypt-queen/symbols/K.svg" alt="K" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🎰")}/>,
        description: "K" 
      },
      "Q": { 
        icon: <img src="/images/egypt-queen/symbols/Q.svg" alt="Q" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🎯")}/>,
        description: "Q" 
      },
      "J": { 
        icon: <img src="/images/egypt-queen/symbols/J.svg" alt="J" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🎲")}/>,
        description: "J" 
      },
      "10": { 
        icon: <img src="/images/egypt-queen/symbols/10.svg" alt="10" className="w-16 h-16 object-contain"
          onError={(e) => (e.currentTarget.textContent = "🔟")}/>,
        description: "10" 
      },
    };
    
    // استخدام رموز تعبيرية احتياطية إذا تعذر تحميل الصور
    const fallbackSymbols: Record<SymbolType, string> = {
      "cleopatra": "👸",
      "book": "📜",
      "eye": "👁️",
      "anubis": "🐺",
      "cat": "🐱",
      "wild": "✨",
      "A": "🅰️",
      "K": "🎰",
      "Q": "🎯",
      "J": "🎲",
      "10": "🔟",
    };
    
    // إذا كان رمزاً فائزاً، أضف تأثيرات إضافية
    if (isWinning) {
      return (
        <div className="relative animate-pulse">
          {symbolMap[symbol].icon}
          <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full animate-ping-slow"></div>
        </div>
      );
    }
    
    // في حالة عدم الفوز، عرض الرمز العادي
    return symbolMap[symbol].icon || <span className="text-4xl">{fallbackSymbols[symbol]}</span>;
  };
  
  // إذا لم تبدأ اللعبة بعد، اعرض شاشة البداية
  if (!isGameStarted) {
    return (
      <div 
        className="h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/egypt-queen/backgrounds/egyptian-temple.svg')" }}
      >
        {/* تأثير الغبار الذهبي */}
        <GoldDustEffect />
        
        {/* طبقات الإضاءة والتأثيرات */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="absolute inset-0 bg-[url('/images/fog-overlay.png')] bg-cover opacity-15 mix-blend-overlay animate-float-slow"></div>
        
        {/* محتوى شاشة البداية */}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-6xl font-bold text-[#D4AF37] mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-pulse-slow">
            ملكة مصر
          </h1>
          <h2 className="text-3xl font-semibold text-white mb-12 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Queen of Egypt Slots
          </h2>
          
          {/* صورة الملكة (ستضاف لاحقاً) */}
          <div className="w-64 h-64 mb-10 relative overflow-hidden rounded-full border-4 border-[#D4AF37] shadow-xl">
            <img 
              src="/images/egypt-queen/queen-icon.png" 
              alt="ملكة مصر" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/poker-icon-gold.png';
                console.log('صورة الملكة غير متوفرة، تم استخدام صورة بديلة');
              }}
            />
            {/* توهج حول الصورة */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/40 to-[#D4AF37]/0 rounded-full animate-pulse-slow opacity-60"></div>
          </div>
          
          {/* زر ابدأ اللعب */}
          <Button 
            className="bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#FFD700] hover:to-[#B8860B] text-white text-xl font-bold py-6 px-12 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95"
            onClick={startGame}
          >
            ابدأ اللعب
          </Button>
          
          {/* زر العودة */}
          <Button
            variant="link"
            className="text-white/70 mt-8 hover:text-white"
            onClick={goToHome}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </div>
        
        {/* الصوتيات */}
        <audio ref={audioRef} src="/audio/egypt-theme.mp3"></audio>
      </div>
    );
  }
  
  // واجهة اللعبة الرئيسية
  return (
    <div 
      className="h-screen w-full overflow-hidden flex flex-col bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/egypt-queen/backgrounds/pyramids-desert.svg')" }}
    >
      {/* نافذة لعبة المكافأة - صناديق الكنز الفرعونية */}
      <Dialog open={bonusGameOpen} onOpenChange={setBonusGameOpen}>
        <DialogContent 
          className="border-4 border-[#D4AF37] p-6 max-w-3xl mx-auto bg-cover bg-center overflow-hidden relative"
          style={{
            backgroundImage: "url('/images/egypt-queen/backgrounds/nile-queen.svg')",
            backgroundColor: "#000"
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center text-[#D4AF37] font-bold">
                لعبة الكنوز الفرعونية 🏺
              </DialogTitle>
              <DialogDescription className="text-xl text-center text-white/80">
                اختر 3 صناديق لاكتشاف الكنوز المخفية!
              </DialogDescription>
            </DialogHeader>
            
            {/* عرض صناديق الكنز */}
            <div className="grid grid-cols-5 gap-4 my-8">
              {treasureChests.map((chest, index) => {
                // تحديد الفئة والمظهر حسب نوع الصندوق
                let chestBorderClass = "border-[#D4AF37]";
                let chestIconColor = "text-[#D4AF37]";
                let chestGlowEffect = "";
                let chestBackground = chest.opened ? 'bg-[#D4AF37]/10' : 'hover:bg-[#D4AF37]/5 bg-[#2D1B09]';
                
                // مظهر خاص للصناديق الذهبية
                if (chest.type === 'golden') {
                  chestBorderClass = "border-[#FFD700]";
                  chestIconColor = "text-[#FFD700]";
                  chestGlowEffect = "shadow-[0_0_15px_rgba(255,215,0,0.5)]";
                  chestBackground = chest.opened ? 'bg-gradient-to-b from-[#5A3805]/30 to-[#FFD700]/20' : 'hover:bg-[#5A3805]/30 bg-gradient-to-b from-[#3A2604] to-[#2D1B09]';
                } 
                // مظهر للصناديق المميزة
                else if (chest.type === 'special') {
                  chestBorderClass = "border-[#F5DEB3]";
                  chestIconColor = "text-[#F5DEB3]";
                  chestGlowEffect = "shadow-[0_0_10px_rgba(245,222,179,0.3)]";
                  chestBackground = chest.opened ? 'bg-[#F5DEB3]/10' : 'hover:bg-[#F5DEB3]/5 bg-[#2D1B09]';
                }
              
                return (
                  <div 
                    key={index}
                    className={`h-32 cursor-pointer transition-all duration-300 transform ${
                      chest.opened ? 'scale-105' : 'hover:scale-105'
                    } ${chestBackground} border-2 ${chestBorderClass} rounded-md flex flex-col items-center justify-center relative overflow-hidden ${chestGlowEffect}`}
                    onClick={() => !chest.opened && openTreasureChest(index)}
                  >
                    {chest.opened ? (
                      // صندوق مفتوح يعرض المكافأة
                      <div className="flex flex-col items-center gap-1">
                        {chest.type === 'golden' ? (
                          <Sparkles className={`h-12 w-12 ${chestIconColor} animate-pulse`} />
                        ) : (
                          <GiftIcon className={`h-12 w-12 ${chestIconColor}`} />
                        )}
                        <span className={`font-bold text-xl ${chest.type === 'golden' ? 'text-[#FFD700]' : 'text-white'}`}>
                          {chest.reward}
                        </span>
                      </div>
                    ) : (
                      // صندوق مغلق
                      <div className="flex flex-col items-center">
                        {chest.type === 'golden' ? (
                          <>
                            <Gift className={`h-16 w-16 ${chestIconColor}`} />
                            <div className="absolute inset-0 bg-[#FFD700]/5 animate-pulse-slow"></div>
                          </>
                        ) : chest.type === 'special' ? (
                          <Gift className={`h-16 w-16 ${chestIconColor}`} />
                        ) : (
                          <Gift className={`h-16 w-16 ${chestIconColor}`} />
                        )}
                      </div>
                    )}
                    {/* تأثير لامع على الصندوق المفتوح */}
                    {chest.opened && (
                      <div className={`absolute inset-0 ${
                        chest.type === 'golden' 
                          ? 'bg-[#FFD700]/15 animate-pulse-fast' 
                          : chest.type === 'special'
                            ? 'bg-[#F5DEB3]/10 animate-pulse' 
                            : 'bg-[#D4AF37]/10 animate-pulse'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* عداد الصناديق المفتوحة والمجموع */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-[#0F0904] border border-[#D4AF37] rounded-md px-4 py-2 text-center w-full">
                <span className="text-white text-lg">الصناديق المفتوحة: <span className="text-[#D4AF37] font-bold">{chestsOpened}/3</span></span>
              </div>
              <div className="bg-[#0F0904] border border-[#D4AF37] rounded-md px-4 py-2 text-center w-full">
                <span className="text-white text-lg">مجموع المكافآت: <span className="text-[#D4AF37] font-bold">{totalBonusWin}</span></span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* تأثير الغبار الذهبي */}
      <GoldDustEffect />
      
      {/* طبقات الإضاءة والتأثيرات */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
      <div className="absolute inset-0 bg-[url('/images/fog-overlay.png')] bg-cover opacity-10 mix-blend-overlay animate-float-slow"></div>
      
      {/* شريط الأدوات العلوي */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm p-3 border-b border-[#D4AF37]/50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* زر الرجوع والعنوان */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 mr-2"
              onClick={goToHome}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-[#D4AF37]">ملكة مصر</h1>
          </div>
          
          {/* معلومات اللاعب */}
          <div className="flex items-center gap-4">
            <div className="bg-black/50 border border-[#D4AF37]/70 rounded-full py-1 px-4 flex items-center shadow-md">
              <Coins className="h-5 w-5 text-[#D4AF37] mr-2" />
              <span className="text-white font-bold">{formatChips(user?.chips || 0)}</span>
            </div>
            
            {/* أزرار الواجهة */}
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full bg-black/20 border border-white/20 text-white hover:bg-white/10"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full bg-black/20 border border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/rankings')}
            >
              <Trophy className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full bg-black/20 border border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-full bg-black/20 border border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                toast({
                  title: "قواعد اللعبة",
                  description: "ملكة مصر هي لعبة سلوت. قم بمطابقة الرموز من اليسار إلى اليمين على خطوط الدفع.",
                  variant: "default"
                });
              }}
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* محتوى اللعبة الرئيسي */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-4" ref={gameContainerRef}>
        {/* حاوية آلة السلوت */}
        <div className="bg-[#361F10]/90 border-4 border-[#D4AF37] rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm w-full max-w-5xl h-[600px] flex flex-col">
          {/* منطقة عرض البكرات (reels) مع شبكة 5×3 */}
          <div className="flex-1 bg-[url('/images/egypt-queen/reels-bg.jpg')] bg-cover bg-center relative p-2">
            {/* خطوط الدفع */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 z-10 pointer-events-none">
              <div className="border-l-4 border-r-4 border-[#D4AF37] h-[30%] rounded-md border-opacity-50"></div>
              <div className="border-l-4 border-r-4 border-[#D4AF37] h-[30%] rounded-md border-opacity-70"></div>
              <div className="border-l-4 border-r-4 border-[#D4AF37] h-[30%] rounded-md border-opacity-50"></div>
            </div>
            
            {/* إطار البكرات - عرض البكرات 5×3 */}
            <div className="grid grid-cols-5 gap-1 h-full relative z-20">
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="flex flex-col gap-1">
                  {reel.map((symbol, symbolIndex) => {
                    // تحديد ما إذا كان هذا الرمز جزءاً من خط فائز
                    const isWinningSymbol = winningLines.some(line => 
                      line.some(pos => pos.col === reelIndex && pos.row === symbolIndex)
                    );
                    
                    // تعيين الرموز المرئية لكل نوع
                    let symbolContent;
                    let symbolClass = "text-4xl";
                    
                    switch(symbol) {
                      case "cleopatra":
                        symbolContent = "👸";
                        break;
                      case "book":
                        symbolContent = "📜";
                        break;
                      case "eye":
                        symbolContent = "👁️";
                        break;
                      case "anubis":
                        symbolContent = "🐺";
                        break;
                      case "cat":
                        symbolContent = "🐱";
                        break;
                      case "wild":
                        symbolContent = "✨";
                        symbolClass = "text-5xl text-[#D4AF37]";
                        break;
                      case "A":
                        symbolContent = "A";
                        symbolClass = "text-4xl font-bold text-red-600";
                        break;
                      case "K":
                        symbolContent = "K";
                        symbolClass = "text-4xl font-bold text-blue-600";
                        break;
                      case "Q":
                        symbolContent = "Q";
                        symbolClass = "text-4xl font-bold text-purple-600";
                        break;
                      case "J":
                        symbolContent = "J";
                        symbolClass = "text-4xl font-bold text-green-600";
                        break;
                      case "10":
                        symbolContent = "10";
                        symbolClass = "text-4xl font-bold text-yellow-600";
                        break;
                      default:
                        symbolContent = "?";
                    }
                    
                    return (
                      <div 
                        key={`${reelIndex}-${symbolIndex}`} 
                        className={`flex-1 rounded-md flex items-center justify-center p-3
                          ${isSpinning ? 'animate-pulse-slow' : ''}
                          ${isWinningSymbol 
                            ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B6914]/40 border-2 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.6)]' 
                            : 'bg-[#222]/80 hover:bg-[#333]/80 transition-colors duration-300'}`}
                      >
                        <span className={`${symbolClass} ${isWinningSymbol ? 'scale-110 transform transition-transform duration-300' : ''}`}>
                          {isWinningSymbol ? (
                            <div className="animate-pulse relative">
                              <div className="z-10 relative">{symbolContent}</div>
                              <div className="absolute inset-0 bg-[#FFD700]/20 rounded-full animate-ping-slow"></div>
                              <div className="absolute -inset-3 bg-gradient-to-r from-[#FFD700]/10 to-[#D4AF37]/5 rounded-full animate-pulse-slow"></div>
                            </div>
                          ) : (
                            symbolContent
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* عرض اللفات المجانية إذا كانت متاحة */}
            {freeSpins > 0 && (
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-bl-lg z-30 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" /> 
                <span>{freeSpins} لفة مجانية</span>
              </div>
            )}
            
            {/* عرض المضاعف إذا كان أكثر من 1 */}
            {winMultiplier > 1 && (
              <div className="absolute top-0 left-0 bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-br-lg z-30">
                <span>مضاعف {winMultiplier}×</span>
              </div>
            )}
          </div>
          
          {/* لوحة التحكم */}
          <div className="bg-[#0C0907] p-4 border-t-2 border-[#D4AF37] flex items-center justify-between">
            {/* ضبط المراهنة واللفات المجانية */}
            <div className="flex items-center gap-4">
              {/* عرض اللفات المجانية */}
              {freeSpins > 0 && (
                <div className="flex flex-col items-center bg-[#8B6914] border border-[#D4AF37] px-4 py-2 rounded-md animate-pulse-slow">
                  <span className="text-white text-xs">لفات مجانية</span>
                  <span className="text-[#FFD700] font-bold text-lg">{freeSpins}</span>
                  {winMultiplier > 1 && (
                    <span className="text-white text-xs">x{winMultiplier} مضاعف</span>
                  )}
                </div>
              )}
              
              {/* أزرار الرهان */}
              <div className="flex items-center gap-2">
                <Button 
                  className="h-12 w-12 rounded-full bg-[#D4AF37] text-black font-bold text-xl"
                  onClick={decreaseBet}
                  disabled={isSpinning || betAmount <= 10000}
                  title="تنصيف المبلغ"
                >
                  ½
                </Button>
                
                <div className="bg-black/80 border border-[#D4AF37] px-4 py-2 rounded-md min-w-[120px] text-center">
                  <span className="text-[#D4AF37] font-bold">{formatChips(betAmount)}</span>
                </div>
                
                <Button 
                  className="h-12 w-12 rounded-full bg-[#D4AF37] text-black font-bold text-xl"
                  onClick={increaseBet}
                  disabled={isSpinning || betAmount >= 100000}
                  title="مضاعفة المبلغ"
                >
                  x2
                </Button>
              </div>
            </div>
            
            {/* زر البدء */}
            <Button 
              className={`h-20 w-40 rounded-full ${isSpinning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#FFD700] hover:to-[#B8860B]'
              } text-white text-2xl font-bold shadow-lg shadow-[#D4AF37]/20 transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-[#FFD700]/30`}
              onClick={spin}
              disabled={isSpinning}
            >
              {isSpinning ? (
                <RotateCw className="h-8 w-8 animate-spin" />
              ) : (
                <>دوران</>
              )}
            </Button>
            
            {/* وضع سبين تلقائي (سيتم إضافة المنطق لاحقاً) */}
            <Button 
              className="bg-[#333] hover:bg-[#444] text-white font-semibold px-4 py-2 rounded-md shadow-md"
              disabled={isSpinning}
            >
              دوران تلقائي
            </Button>
          </div>
        </div>
      </div>
      
      {/* الصوتيات */}
      <audio ref={audioRef} src="/audio/egypt-theme.mp3"></audio>
      <audio ref={spinAudioRef} src="/audio/egypt-spin.wav"></audio>
      <audio ref={winAudioRef} src="/audio/egypt-win.wav"></audio>
      
      {/* إضافة عناصر صوت إضافية للعبة المكافأة والنقر */}
      <audio id="egypt-bonus-sound" src="/audio/egypt-bonus.wav"></audio>
      <audio id="egypt-click-sound" src="/audio/egypt-click.wav"></audio>
      <audio id="egypt-chest-open-sound" src="/audio/egypt-chest-open.wav"></audio>
      <audio id="egypt-big-win-sound" src="/audio/egypt-big-win.wav"></audio>
      <audio id="egypt-free-spins-sound" src="/audio/egypt-bonus.wav"></audio>
      
      {/* تحميل مكتبة الصوت */}
      <script src="/audio/egypt-theme.js"></script>
    </div>
  );
}