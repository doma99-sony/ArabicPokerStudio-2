import { useState, useEffect, useRef, useContext } from 'react';
import { useAuth, AuthContext } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import BetHistory from './components/bet-history';
import LiveBets from './components/live-bets';
import GameControls from './components/game-controls';
import RocketGame from './components/rocket-game';
import './assets/egypt-rocket.css';
import { motion } from 'framer-motion';

// استيراد سمات مصرية وتأثيرات بصرية
import { Pyramid as PyramidIcon, ScrollText as ScrollIcon, Compass as AnkhIcon } from 'lucide-react';

// نوع اللاعب في اللعبة
interface GamePlayer {
  username: string;
  amount: number;
  multiplier: number | null;
  profit: number | null;
  isCashedOut: boolean;
}

const EgyptRocketPage = () => {
  const { user } = useAuth();
  const authContext = useContext(AuthContext);
  const { toast } = useToast();
  const rocketRef = useRef<{ triggerExplosion: () => void }>(null);
  
  // حالة اللعبة
  const [gameStatus, setGameStatus] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [gameHistory, setGameHistory] = useState<Array<{ multiplier: number, timestamp: Date }>>([]);
  const [liveBets, setLiveBets] = useState<GamePlayer[]>([]);
  
  // حالة اللاعب
  const [userChips, setUserChips] = useState<number>(user?.chips || 1000);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState<number>(2.0);
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  
  // وظيفة مساعدة لتحديث رصيد المستخدم في الحالة المحلية وفي سياق المصادقة
  const updateUserChipsData = (newChips: number) => {
    setUserChips(newChips);
    // تحديث كاش المستخدم في سياق المصادقة للحفاظ على التزامن
    if (user && authContext) {
      authContext.setUser({
        ...user,
        chips: newChips
      });
    }
  };
  
  // مراجع للمؤقتات
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const multiplierIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // محاكاة اتصال الويب سوكت (يجب استبدالها بالاتصال الحقيقي لاحقاً)
  useEffect(() => {
    // تنظيف المؤقتات عند مغادرة الصفحة
    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
      if (multiplierIntervalRef.current) clearInterval(multiplierIntervalRef.current);
    };
  }, []);
  
  // محاكاة الخوارزمية بشكل مؤقت - يجب استبدالها بمنطق الخادم الحقيقي
  const simulateGame = () => {
    // إيقاف أي جلسة لعب سابقة
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    if (multiplierIntervalRef.current) clearInterval(multiplierIntervalRef.current);
    
    // بدء اللعبة في وضع الانتظار
    setGameStatus('waiting');
    setCurrentMultiplier(1.00);
    setHasCashedOut(false);
    
    // بدء اللعبة بعد فترة انتظار
    const waitingTime = 5000; // 5 ثوانٍ للانتظار
    
    // إضافة لاعبين وهميين
    generateAIPlayers();
    
    gameTimerRef.current = setTimeout(() => {
      // تبدأ اللعبة
      setGameStatus('flying');
      
      // بدء زيادة المضاعف تدريجياً
      let interval = 50; // تحديث كل 50 مللي ثانية
      let crashMultiplier = generateCrashPoint(); // توليد نقطة انفجار عشوائية
      let startTime = Date.now();
      
      // حساب المضاعف مع مرور الوقت
      multiplierIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newMultiplier = calculateMultiplier(elapsed);
        
        // جمع تلقائي إذا وصل المضاعف إلى القيمة المحددة
        if (isBetting && !hasCashedOut && newMultiplier >= autoCashoutMultiplier) {
          cashout();
        }
        
        // إنهاء اللعبة إذا وصل المضاعف إلى نقطة الانفجار
        if (newMultiplier >= crashMultiplier) {
          if (multiplierIntervalRef.current) clearInterval(multiplierIntervalRef.current);
          
          // تحديث المضاعف النهائي وحالة اللعبة
          setCurrentMultiplier(parseFloat(crashMultiplier.toFixed(2)));
          setGameStatus('crashed');
          
          // إضافة نتيجة اللعبة إلى التاريخ
          setGameHistory(prev => [
            { multiplier: parseFloat(crashMultiplier.toFixed(2)), timestamp: new Date() },
            ...prev.slice(0, 9) // الاحتفاظ بآخر 10 نتائج فقط
          ]);
          
          // حساب النتائج النهائية للاعبين
          calculateResults(crashMultiplier);
          
          // استدعاء تأثير الانفجار
          if (rocketRef.current) {
            rocketRef.current.triggerExplosion();
          }
          
          // بدء جولة جديدة بعد فترة
          gameTimerRef.current = setTimeout(simulateGame, 5000);
        } else {
          setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
        }
      }, interval);
      
    }, waitingTime);
  };
  
  // تسجيل الخسارة في قاعدة البيانات عند انفجار الصاروخ
  const updateLossInDatabase = async (betAmount: number) => {
    if (!user) return;
    
    try {
      // إرسال طلب لتحديث رصيد المستخدم بعد الخسارة
      const response = await fetch('/api/games/egypt-rocket/update-chips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: betAmount,
          winAmount: 0, // المبلغ المربوح هو صفر في حالة الخسارة
          multiplier: 0,
          gameResult: 'rocket_crashed'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('خطأ في تسجيل الخسارة:', data.error);
      } else {
        // رصيد المستخدم تم تحديثه بالفعل عند وضع الرهان
        console.log('تم تسجيل الخسارة بنجاح');
        
        // تحديث حالة اللعب
        setIsBetting(false);
      }
    } catch (error) {
      console.error('خطأ في الاتصال بخادم API:', error);
    }
  };
  
  // توليد نقطة انفجار عشوائية باستخدام توزيع احتمالي واقعي
  const generateCrashPoint = (): number => {
    // استخدام توزيع يميل نحو القيم المنخفضة
    const r = Math.random();
    // معادلة تضمن أن معظم القيم تكون بين 1 و 2 مع احتمالية قليلة للقيم الأعلى
    let crashPoint = 0.5 + (1 / (r * 0.15 + 0.1));
    
    // تحديد الحد الأقصى للمضاعف (نادراً ما يتجاوز 10)
    return Math.min(crashPoint, 20);
  };
  
  // حساب المضاعف بناءً على الوقت المنقضي
  const calculateMultiplier = (elapsedMs: number): number => {
    // استخدام نموذج نمو أسي للمضاعف
    // البدء من 1.0 والنمو بسرعة في البداية ثم أبطأ تدريجياً
    const baseMultiplier = 1.0;
    const growthRate = 0.05; // معدل النمو
    const seconds = elapsedMs / 1000;
    
    return baseMultiplier * Math.pow(1 + growthRate, seconds * 10);
  };
  
  // إضافة لاعبين وهميين للعبة
  const generateAIPlayers = () => {
    const aiNames = ['فرعون', 'حورس', 'رع', 'أنوبيس', 'إيزيس', 'نفرتيتي', 'أوزوريس'];
    const aiCount = Math.floor(Math.random() * 5) + 2; // 2-6 لاعبين وهميين
    
    const aiBets: GamePlayer[] = [];
    
    // إضافة اللاعب الحقيقي إذا كان يراهن
    if (isBetting) {
      aiBets.push({
        username: user?.username || 'ضيف',
        amount: betAmount,
        multiplier: null,
        profit: null,
        isCashedOut: false
      });
    }
    
    // إضافة لاعبين وهميين
    for (let i = 0; i < aiCount; i++) {
      const name = aiNames[Math.floor(Math.random() * aiNames.length)];
      const amount = Math.floor(Math.random() * 900) + 100; // رهان بين 100 و 1000
      
      aiBets.push({
        username: name + (Math.floor(Math.random() * 100)),
        amount: amount,
        multiplier: null,
        profit: null,
        isCashedOut: false
      });
    }
    
    setLiveBets(aiBets);
  };
  
  // حساب النتائج النهائية للاعبين
  const calculateResults = (crashMultiplier: number) => {
    setLiveBets(prev => {
      return prev.map(bet => {
        // إذا كان اللاعب قد جمع رهانه بالفعل، لا تغير حالته
        if (bet.isCashedOut) return bet;
        
        // إذا كان هذا هو اللاعب الحقيقي وهو يلعب حاليًا، سجل الخسارة
        if (bet.username === user?.username && isBetting && !hasCashedOut) {
          // تسجيل خسارة اللاعب الحقيقي في قاعدة البيانات
          updateLossInDatabase(bet.amount);
          
          // المستخدم خسر رهانه (تم تحديثه بالفعل في الواجهة عند وضع الرهان)
          return {
            ...bet,
            multiplier: 0,
            profit: -bet.amount,
            isCashedOut: false
          };
        }
        
        // إذا كان هذا هو اللاعب الحقيقي، يبقى كما هو (نحن نتحكم في حالته بشكل منفصل)
        if (bet.username === user?.username) {
          if (hasCashedOut) {
            return {
              ...bet,
              multiplier: autoCashoutMultiplier,
              profit: Math.floor(bet.amount * autoCashoutMultiplier) - bet.amount,
              isCashedOut: true
            };
          } else {
            return {
              ...bet,
              multiplier: crashMultiplier,
              profit: -bet.amount,
              isCashedOut: false
            };
          }
        }
        
        // منطق اللاعب الوهمي - احتمالية أن يجمع اللاعب الوهمي رهانه قبل الانفجار
        const willCashout = Math.random() > 0.4; // 60% احتمالية الجمع قبل الانفجار
        
        if (willCashout) {
          // اختيار مضاعف الجمع بشكل عشوائي بين 1.1 والمضاعف النهائي
          const aiCashoutMultiplier = parseFloat((1.1 + Math.random() * (crashMultiplier - 1.1)).toFixed(2));
          const profit = Math.floor(bet.amount * aiCashoutMultiplier) - bet.amount;
          
          return {
            ...bet,
            multiplier: aiCashoutMultiplier,
            profit: profit,
            isCashedOut: true
          };
        } else {
          // اللاعب لم يجمع وخسر رهانه
          return {
            ...bet,
            multiplier: crashMultiplier,
            profit: -bet.amount,
            isCashedOut: false
          };
        }
      });
    });
  };
  
  // وضع رهان
  const placeBet = async () => {
    if (!user) {
      toast({
        title: "تنبيه",
        description: "يجب تسجيل الدخول أولاً للمراهنة",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0 || betAmount > userChips) {
      toast({
        title: "خطأ في الرهان",
        description: "مبلغ الرهان غير صالح أو أكبر من رصيدك",
        variant: "destructive"
      });
      return;
    }
    
    // تحديث الواجهة المحلية فورًا لتجربة مستخدم أفضل
    setIsBetting(true);
    setHasCashedOut(false);
    updateUserChipsData(userChips - betAmount);
    
    // تحديث قائمة الرهانات الحية
    setLiveBets(prev => {
      // إزالة اللاعب الحالي إذا كان موجوداً
      const filtered = prev.filter(bet => bet.username !== user.username);
      
      // إضافة رهان اللاعب
      return [
        {
          username: user.username,
          amount: betAmount,
          multiplier: null,
          profit: null,
          isCashedOut: false
        },
        ...filtered
      ];
    });
    
    // سجل الرهان في قاعدة البيانات (المراهنة = خسارة محتملة)
    try {
      const response = await fetch('/api/games/egypt-rocket/update-chips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: betAmount,
          winAmount: 0, // في البداية، المبلغ المربوح هو صفر
          multiplier: 0,
          gameResult: 'bet_placed'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('خطأ في تسجيل الرهان:', data.error);
        // إذا فشلت العملية، يمكن التراجع عن التغييرات المحلية (اختياري)
      }
    } catch (error) {
      console.error('خطأ في الاتصال بخادم API:', error);
    }
    
    toast({
      title: "تم وضع الرهان",
      description: `تم وضع رهان بقيمة ${betAmount} رقاقة`,
    });
  };
  
  // إلغاء الرهان (فقط في وضع الانتظار)
  const cancelBet = async () => {
    if (gameStatus !== 'waiting' || !user) return;
    
    // تحديث الواجهة المحلية فورًا
    setIsBetting(false);
    updateUserChipsData(userChips + betAmount);
    
    // إزالة رهان اللاعب من القائمة
    setLiveBets(prev => prev.filter(bet => bet.username !== user.username));
    
    // إعادة الرهان للمستخدم في قاعدة البيانات
    try {
      const response = await fetch('/api/games/egypt-rocket/update-chips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: 0,
          winAmount: betAmount, // إعادة المبلغ كاملاً
          multiplier: 1,
          gameResult: 'bet_cancelled'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('خطأ في إلغاء الرهان:', data.error);
      } else {
        // تحديث الرصيد من الخادم بدلاً من القيمة المحلية
        if (data.user && data.user.chips) {
          updateUserChipsData(data.user.chips);
        }
      }
    } catch (error) {
      console.error('خطأ في الاتصال بخادم API:', error);
    }
    
    toast({
      title: "تم إلغاء الرهان",
      description: "تم إلغاء رهانك بنجاح",
    });
  };
  
  // جمع الرهان قبل الانفجار
  const cashout = async () => {
    if (gameStatus !== 'flying' || !isBetting || hasCashedOut || !user) return;
    
    const profit = Math.floor(betAmount * currentMultiplier) - betAmount;
    const totalWin = betAmount + profit;
    
    // تحديث الواجهة المحلية فورًا
    setHasCashedOut(true);
    updateUserChipsData(userChips + totalWin);
    
    // تحديث حالة اللاعب في قائمة الرهانات الحية
    setLiveBets(prev => {
      return prev.map(bet => {
        if (bet.username === user.username) {
          return {
            ...bet,
            multiplier: currentMultiplier,
            profit: profit,
            isCashedOut: true
          };
        }
        return bet;
      });
    });
    
    // تسجيل الربح في قاعدة البيانات
    try {
      const response = await fetch('/api/games/egypt-rocket/update-chips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: betAmount,
          winAmount: totalWin,
          multiplier: currentMultiplier,
          gameResult: 'cashout_success'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('خطأ في تسجيل الربح:', data.error);
      } else {
        // تحديث الرصيد من الخادم بدلاً من القيمة المحلية
        if (data.user && data.user.chips) {
          updateUserChipsData(data.user.chips);
        }
      }
    } catch (error) {
      console.error('خطأ في الاتصال بخادم API:', error);
    }
    
    toast({
      title: "تم الجمع بنجاح!",
      description: `ربحت ${profit} رقاقة عند ${currentMultiplier.toFixed(2)}x`,
    });
  };
  
  // تحديث رصيد المستخدم عند تغير بيانات المستخدم
  useEffect(() => {
    if (user && user.chips) {
      setUserChips(user.chips);
    }
  }, [user]);
  
  // ابدأ اللعبة عند تحميل الصفحة
  useEffect(() => {
    simulateGame();
    
    // إضافة بعض البيانات التاريخية للعرض
    setGameHistory([
      { multiplier: 1.24, timestamp: new Date(Date.now() - 60000) },
      { multiplier: 3.57, timestamp: new Date(Date.now() - 120000) },
      { multiplier: 1.89, timestamp: new Date(Date.now() - 180000) },
      { multiplier: 4.62, timestamp: new Date(Date.now() - 240000) },
      { multiplier: 1.35, timestamp: new Date(Date.now() - 300000) },
    ]);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06071A] to-[#141E30] pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة وأيقونات مصرية */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <PyramidIcon className="h-8 w-8 text-[#D4AF37] mr-2" />
            <h1 className="text-2xl font-bold text-white">
              صاروخ <span className="text-[#D4AF37]">مصر</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="bg-black/30 p-2 rounded-lg border border-[#D4AF37]/20">
              <AnkhIcon className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-[#D4AF37]/20">
              <ScrollIcon className="h-5 w-5 text-[#D4AF37]" />
            </div>
          </div>
        </div>
        
        {/* الجزء الرئيسي من اللعبة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* منطقة عرض اللعبة */}
            <div className="bg-black/20 rounded-xl overflow-hidden border border-[#D4AF37]/10">
              <div className="relative h-[60vh]">
                <RocketGame 
                  ref={rocketRef}
                  gameStatus={gameStatus} 
                  multiplier={currentMultiplier} 
                />
                
                {/* عرض المضاعف الحالي */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D4AF37]/20">
                  <div className={`text-3xl font-bold ${
                    gameStatus === 'crashed' 
                      ? 'text-red-500' 
                      : (currentMultiplier >= 2 ? 'text-[#D4AF37] gold-text-glow' : 'text-white')
                  }`}>
                    {currentMultiplier.toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>
            
            {/* منطقة التحكم */}
            <GameControls 
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              autoCashoutMultiplier={autoCashoutMultiplier}
              setAutoCashoutMultiplier={setAutoCashoutMultiplier}
              userChips={userChips}
              isBetting={isBetting}
              gameStatus={gameStatus}
              hasCashedOut={hasCashedOut}
              currentMultiplier={currentMultiplier}
              onPlaceBet={placeBet}
              onCancelBet={cancelBet}
              onCashout={cashout}
            />
          </div>
          
          <div className="space-y-6">
            {/* الرهانات الحية */}
            <div className="bg-black/20 rounded-xl p-4 border border-[#D4AF37]/10">
              <LiveBets bets={liveBets} />
            </div>
            
            {/* تاريخ الرهانات */}
            <div className="bg-black/20 rounded-xl p-4 border border-[#D4AF37]/10">
              <BetHistory history={gameHistory} />
            </div>
            
            {/* نصائح للاعبين */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-[#D4AF37]/5 rounded-xl p-4 border border-[#D4AF37]/20"
            >
              <h3 className="text-[#D4AF37] font-bold mb-2 text-center">نصائح ذهبية</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-[#D4AF37] mr-1">•</span> اجمع رهانك قبل انفجار الصاروخ للفوز
                </li>
                <li className="flex items-start">
                  <span className="text-[#D4AF37] mr-1">•</span> كلما تأخرت في الجمع، زادت أرباحك ولكن زادت المخاطرة
                </li>
                <li className="flex items-start">
                  <span className="text-[#D4AF37] mr-1">•</span> استخدم الجمع التلقائي للحصول على نتائج متسقة
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
        
        {/* تذييل الصفحة مع زخارف مصرية */}
        <div className="mt-10 border-t border-[#D4AF37]/20 pt-4 flex justify-center">
          <div className="flex items-center">
            <div className="h-[1px] w-10 bg-[#D4AF37]/50"></div>
            <PyramidIcon className="h-5 w-5 text-[#D4AF37] mx-2" />
            <div className="h-[1px] w-10 bg-[#D4AF37]/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EgyptRocketPage;