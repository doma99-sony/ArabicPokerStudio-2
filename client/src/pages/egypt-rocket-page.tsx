import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import BetHistory from './egypt-rocket/components/bet-history';
import LiveBets from './egypt-rocket/components/live-bets';
import GameControls from './egypt-rocket/components/game-controls';
import RocketGame from './egypt-rocket/components/rocket-game';
import './egypt-rocket/assets/egypt-rocket.css';
import { motion } from 'framer-motion';
import { useRealtimeUpdatesContext } from '@/hooks/use-realtime-updates';

// استيراد سمات مصرية وتأثيرات بصرية
import { Pyramid as PyramidIcon, ScrollText as ScrollIcon, Compass as AnkhIcon, LogOut as LogOutIcon, Home as HomeIcon } from 'lucide-react';

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
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const rocketRef = useRef<{ triggerExplosion: () => void }>(null);
  const realtimeUpdates = useRealtimeUpdatesContext();
  
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
  
  // مراجع للمؤقتات
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const multiplierIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // إضافة مستمع للتحديثات الفورية لتحديث رصيد اللاعب
  useEffect(() => {
    // دالة معالجة تحديث الرصيد
    const handleChipsUpdate = (message: any) => {
      if (message.user && message.user.chips !== undefined) {
        console.log('تم استلام تحديث للرصيد من خادم التحديثات الفورية:', message);
        
        // تحديث حالة الرصيد المحلي
        setUserChips(message.user.chips);
      }
    };
    
    // تسجيل مستمع للتحديثات الفورية
    realtimeUpdates.addMessageListener('user_update', handleChipsUpdate);
    
    // تنظيف المستمع عند إزالة المكون
    return () => {
      realtimeUpdates.removeMessageListener('user_update', handleChipsUpdate);
    };
  }, [realtimeUpdates]);
  
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
    
    // إعادة تعيين حالة المراهنة في بداية كل جولة
    // هذا يضمن أن المستخدم يجب أن يشارك في كل جولة بشكل صريح
    setIsBetting(false);
    
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
          
          // إظهار تنبيه للاعب إذا كان مشاركاً في الجولة (ولم يخرج) بأنه سيحتاج للمشاركة من جديد في الجولة القادمة
          if (isBetting && !hasCashedOut) {
            // المستخدم لم يجمع رهانه وخسر - نعلمه بضرورة وضع رهان جديد في الجولة القادمة
            setTimeout(() => {
              toast({
                title: "انتهت الجولة",
                description: "يجب عليك وضع رهان جديد للمشاركة في الجولة القادمة",
                variant: "default"
              });
            }, 1000);
          }
          
          // بدء جولة جديدة بعد فترة
          gameTimerRef.current = setTimeout(simulateGame, 5000);
        } else {
          setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
        }
      }, interval);
      
    }, waitingTime);
  };
  
  // توليد نقطة انفجار عشوائية - محاكاة لعبة "البحث عن الآثار المصرية"
  const generateCrashPoint = (): number => {
    // نظام توزيع المضاعفات يشبه اكتشاف كنوز فرعونية - أحياناً تجد كنزاً ثميناً!
    const r = Math.random();
    const specialEvent = Math.random(); // احتمالية حدث خاص
    
    // 5% من الوقت سيكون هناك انفجار مبكر (حظ سيء!)
    if (r < 0.05) {
      return 1.0 + (r * 0.2); // بين 1.0 و 1.2
    }
    
    // 65% من الوقت ستكون القيمة طبيعية بين 1.2x و 3.0x
    if (r < 0.7) {
      return 1.2 + (r * 1.8); // توزيع عادي للمضاعفات
    }
    
    // 27% من الوقت ستكون قيمة جيدة بين 3.0x و 10.0x
    if (r < 0.97) {
      return 3.0 + (r * 7.0); // مضاعفات جيدة
    }
    
    // 3% من الوقت: فرصة لحدث خاص "وجدنا آثاراً ثمينة!"
    if (specialEvent < 0.7) {
      // 70% من الأحداث الخاصة - كنز صغير (10x - 30x)
      return 10.0 + (Math.random() * 20.0);
    } else if (specialEvent < 0.95) {
      // 25% من الأحداث الخاصة - كنز متوسط (30x - 80x)
      return 30.0 + (Math.random() * 50.0);
    } else {
      // 5% من الأحداث الخاصة - كنز فرعوني ضخم! (80x - 200x)
      return 80.0 + (Math.random() * 120.0);
    }
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
    
    // في بداية كل جولة جديدة، يتم إعادة تعيين قائمة اللاعبين المشاركين
    // إضافة اللاعب الحقيقي فقط إذا كان يراهن في هذه الجولة تحديداً
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
        
        // منطق اللاعب الوهمي المحسن - الأكثر واقعية في الألعاب الاحترافية
        // معظم اللاعبين الوهميين سينسحبون مبكراً (مثل الألعاب الحقيقية)
        const willCashout = Math.random() > 0.25; // 75% احتمالية الجمع قبل الانفجار
        
        if (willCashout) {
          // توزيع أكثر واقعية للمضاعفات - معظم اللاعبين يجمعون مبكراً
          // 70% من اللاعبين يجمعون بين 1.1x و 1.8x
          // 25% من اللاعبين يجمعون بين 1.8x و 3.0x
          // 5% فقط يجمعون فوق 3.0x
          
          let aiCashoutMultiplier = 1.1;
          const cashoutBehavior = Math.random();
          
          if (cashoutBehavior < 0.7) {
            // معظم اللاعبين محافظين جداً
            aiCashoutMultiplier = 1.1 + (Math.random() * 0.7);
          } else if (cashoutBehavior < 0.95) {
            // بعض اللاعبين يخاطرون قليلاً
            aiCashoutMultiplier = 1.8 + (Math.random() * 1.2);
          } else {
            // القليل جداً من اللاعبين يخاطرون كثيراً
            aiCashoutMultiplier = 3.0 + (Math.random() * (crashMultiplier - 3.0));
          }
          
          // التأكد من أن مضاعف اللاعب الوهمي لا يتجاوز مضاعف الانفجار
          aiCashoutMultiplier = Math.min(aiCashoutMultiplier, crashMultiplier - 0.02);
          
          // تصحيح المضاعف ليكون رقماً مناسباً مع رقمين عشريين فقط
          aiCashoutMultiplier = parseFloat(aiCashoutMultiplier.toFixed(2));
          
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
  const placeBet = () => {
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
    
    setIsBetting(true);
    setHasCashedOut(false);
    setUserChips(prev => prev - betAmount);
    
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
    
    toast({
      title: "تم وضع الرهان",
      description: `تم وضع رهان بقيمة ${betAmount} رقاقة`,
    });
  };
  
  // إلغاء الرهان (فقط في وضع الانتظار)
  const cancelBet = () => {
    if (gameStatus !== 'waiting') return;
    
    setIsBetting(false);
    setUserChips(prev => prev + betAmount);
    
    // إزالة رهان اللاعب من القائمة
    setLiveBets(prev => prev.filter(bet => bet.username !== user?.username));
    
    toast({
      title: "تم إلغاء الرهان",
      description: "تم إلغاء رهانك بنجاح",
    });
  };
  
  // جمع الرهان قبل الانفجار
  const cashout = async () => {
    if (gameStatus !== 'flying' || !isBetting || hasCashedOut) return;
    
    const profit = Math.floor(betAmount * currentMultiplier) - betAmount;
    const totalWin = betAmount + profit;
    
    // تعيين حالة جمع الرهان والمشاركة
    setHasCashedOut(true);
    
    // تنبيه المستخدم بأنه يجب إعادة المراهنة في الجولة القادمة
    // هذا التنبيه يظهر بعد جمع الرهان بنجاح
    setTimeout(() => {
      toast({
        title: "تذكير",
        description: "ستحتاج إلى وضع رهان جديد للمشاركة في الجولة القادمة",
        variant: "default"
      });
    }, 1500); // تأخير قصير لتجنب ظهور التنبيهات في نفس الوقت
    
    // تحديث حالة اللاعب في قائمة الرهانات الحية
    setLiveBets(prev => {
      return prev.map(bet => {
        if (bet.username === user?.username) {
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
    
    toast({
      title: "تم الجمع بنجاح!",
      description: `ربحت ${profit} رقاقة عند ${currentMultiplier.toFixed(2)}x`,
    });
    
    // تحديث الرصيد على الخادم - ملاحظة: لا نقوم بتعديل الرصيد المحلي هنا
    // سيتم تحديث الرصيد تلقائياً عند استلام إشعار من خادم التحديثات الفورية
    try {
      console.log('جاري إرسال طلب تحديث الرصيد إلى الخادم...');
      const response = await fetch('/api/games/egypt-rocket/update-chips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betAmount: betAmount,
          winAmount: totalWin,
          multiplier: currentMultiplier,
          gameResult: 'win'
        }),
      });
      
      if (!response.ok) {
        console.error('فشل في تحديث الرصيد على الخادم:', await response.text());
        toast({
          title: "تنبيه",
          description: "حدث خطأ في تحديث الرصيد على الخادم. سيتم المحاولة مرة أخرى",
          variant: "destructive"
        });
        
        // في حالة الفشل، نقوم بتحديث الرصيد محلياً كإجراء احتياطي
        setUserChips(prev => prev + totalWin);
      } else {
        // قراءة البيانات من الاستجابة
        const result = await response.json();
        console.log('تم تحديث الرصيد على الخادم بنجاح:', result);
        
        // في حالة عدم استلام تحديث من WebSocket، نحدث الرصيد المحلي من الاستجابة مباشرة
        if (result.user && result.user.chips !== undefined) {
          setUserChips(result.user.chips);
        } else {
          // إجراء احتياطي إذا لم تكن البيانات كاملة في الاستجابة
          setUserChips(prev => prev + totalWin);
          
          // محاولة إرسال تحديث عبر WebSocket إذا كان متصلاً
          if (realtimeUpdates.status === 'connected') {
            realtimeUpdates.send({
              type: 'local_update',
              data: {
                user_id: user?.id,
                chips: userChips + totalWin,
                action: 'cashout',
                multiplier: currentMultiplier,
                amount: totalWin
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('خطأ أثناء إرسال طلب تحديث الرصيد:', error);
      toast({
        title: "تنبيه",
        description: "حدث خطأ في الاتصال بالخادم. تم تحديث الرصيد محلياً فقط",
        variant: "destructive"
      });
      
      // في حالة وجود خطأ في الاتصال، نحدث الرصيد محلياً
      setUserChips(prev => prev + totalWin);
      
      // محاولة إرسال تحديث عبر WebSocket إذا كان متصلاً
      if (realtimeUpdates.status === 'connected') {
        realtimeUpdates.send({
          type: 'local_update',
          data: {
            user_id: user?.id,
            chips: userChips + totalWin,
            action: 'cashout',
            multiplier: currentMultiplier,
            amount: totalWin
          }
        });
      }
    }
  };
  
  // ابدأ اللعبة عند تحميل الصفحة
  useEffect(() => {
    simulateGame();
    
    // إضافة بيانات تاريخية تتضمن بعض "اكتشافات الآثار النادرة" - مضاعفات مرتفعة جداً!
    setGameHistory([
      { multiplier: 1.52, timestamp: new Date(Date.now() - 60000) },
      { multiplier: 2.14, timestamp: new Date(Date.now() - 120000) },
      { multiplier: 1.05, timestamp: new Date(Date.now() - 180000) }, // انفجار مبكر
      { multiplier: 3.27, timestamp: new Date(Date.now() - 240000) },
      { multiplier: 24.87, timestamp: new Date(Date.now() - 300000) }, // اكتشاف كنز صغير! 🏺
      { multiplier: 1.78, timestamp: new Date(Date.now() - 360000) },
      { multiplier: 1.31, timestamp: new Date(Date.now() - 420000) },
      { multiplier: 2.54, timestamp: new Date(Date.now() - 480000) },
      { multiplier: 1.92, timestamp: new Date(Date.now() - 540000) },
      { multiplier: 64.35, timestamp: new Date(Date.now() - 600000) }, // اكتشاف كنز متوسط! 💎
      { multiplier: 1.67, timestamp: new Date(Date.now() - 660000) },
      { multiplier: 1.22, timestamp: new Date(Date.now() - 720000) },
      { multiplier: 4.89, timestamp: new Date(Date.now() - 780000) },
      { multiplier: 1.07, timestamp: new Date(Date.now() - 840000) }, // انفجار مبكر
      { multiplier: 182.46, timestamp: new Date(Date.now() - 900000) }, // اكتشاف كنز فرعوني نادر جداً! 👑
    ]);
  }, []);
  
  // الاستماع لتحديثات WebSocket
  useEffect(() => {
    if (realtimeUpdates.status === 'connected' && user?.id) {
      // إضافة مستمع لتحديثات الرصيد
      const handleBalanceUpdate = (message: any) => {
        if (message.type === 'balance_update' && message.data && message.data.userId === user.id) {
          console.log('تم استلام تحديث رصيد عبر WebSocket:', message.data);
          setUserChips(message.data.balance);
          toast({
            title: "تم تحديث الرصيد",
            description: `تم تحديث رصيدك إلى ${message.data.balance} رقاقة`,
            variant: "default"
          });
        }
      };
      
      // إضافة مستمع للتحديثات المحلية المؤكدة
      const handleLocalUpdate = (message: any) => {
        if (message.type === 'local_update_confirmed' && message.data && message.data.user_id === user.id) {
          console.log('تم تأكيد التحديث المحلي عبر WebSocket:', message.data);
          if (message.data.chips !== undefined) {
            setUserChips(message.data.chips);
          }
        }
      };

      // تسجيل المستمعين
      realtimeUpdates.addMessageListener('balance_update', handleBalanceUpdate);
      realtimeUpdates.addMessageListener('local_update_confirmed', handleLocalUpdate);
      
      // إزالة المستمعين عند تفكيك المكون
      return () => {
        realtimeUpdates.removeMessageListener('balance_update', handleBalanceUpdate);
        realtimeUpdates.removeMessageListener('local_update_confirmed', handleLocalUpdate);
      };
    }
  }, [realtimeUpdates.status, user?.id, realtimeUpdates]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06071A] to-[#141E30] pt-10 pb-2 px-2">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة وأيقونات مصرية */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <PyramidIcon className="h-5 w-5 text-[#D4AF37] mr-2" />
            <h1 className="text-lg font-bold text-white">
              صاروخ <span className="text-[#D4AF37]">مصر</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button 
              onClick={() => {
                if (isBetting && gameStatus === 'flying' && !hasCashedOut) {
                  if (window.confirm('لديك رهان نشط! هل أنت متأكد من أنك تريد الخروج وخسارة الرهان؟')) {
                    navigate('/');
                  }
                } else {
                  navigate('/');
                }
              }} 
              className="bg-[#FFD700] hover:bg-[#F0C000] text-black font-bold py-1.5 px-3 rounded-lg flex items-center transition-all duration-300 shadow-xl border-2 border-[#B8860B] text-xs animate-pulse"
            >
              <HomeIcon className="h-3.5 w-3.5 mr-1.5" strokeWidth={2.5} />
              العودة للصفحة الرئيسية
            </button>
            <div className="bg-black/30 p-1 rounded-lg border border-[#D4AF37]/20">
              <AnkhIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
            </div>
            <div className="bg-black/30 p-1 rounded-lg border border-[#D4AF37]/20">
              <ScrollIcon className="h-3.5 w-3.5 text-[#D4AF37]" />
            </div>
          </div>
        </div>
        
        {/* الجزء الرئيسي من اللعبة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* تاريخ الجولات بشكل أفقي */}
            <div className="bg-black/20 rounded-xl p-2 border border-[#D4AF37]/10">
              <BetHistory history={gameHistory} horizontal={true} />
            </div>
            
            {/* منطقة عرض اللعبة */}
            <div className="bg-black/20 rounded-xl overflow-hidden border border-[#D4AF37]/10">
              <div className="relative h-[38vh]">
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
          
          <div className="space-y-4">
            {/* الرهانات الحية */}
            <div className="bg-black/20 rounded-xl p-3 border border-[#D4AF37]/10">
              <h3 className="text-[#D4AF37] font-bold mb-2 text-center text-base">الرهانات الحية</h3>
              <div className="max-h-[32vh] overflow-y-auto">
                <LiveBets bets={liveBets} />
              </div>
            </div>
            
            {/* إحصائيات مختصرة */}
            <div className="bg-black/20 rounded-xl p-3 border border-[#D4AF37]/10">
              <h3 className="text-[#D4AF37] font-bold mb-1 text-center text-sm">إحصائيات</h3>
              {gameHistory.length > 0 ? (
                <div className="flex justify-between items-center text-center">
                  <div>
                    <div className="text-sm font-bold text-green-500">
                      {gameHistory.reduce((max, curr) => Math.max(max, curr.multiplier), 0).toFixed(2)}x
                    </div>
                    <div className="text-xs text-gray-400">أعلى</div>
                  </div>
                  <div className="border-l border-r px-2 border-[#D4AF37]/20">
                    <div className="text-sm font-bold text-[#D4AF37]">
                      {(gameHistory.reduce((sum, curr) => sum + curr.multiplier, 0) / gameHistory.length).toFixed(2)}x
                    </div>
                    <div className="text-xs text-gray-400">المتوسط</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-500">
                      {gameHistory.reduce((min, curr) => Math.min(min, curr.multiplier), Infinity).toFixed(2)}x
                    </div>
                    <div className="text-xs text-gray-400">أدنى</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-center text-gray-400">لا توجد بيانات كافية</div>
              )}
            </div>
            
            {/* نصائح للاعبين - تم تبسيط المحتوى */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-[#D4AF37]/5 rounded-xl p-3 border border-[#D4AF37]/20"
            >
              <h3 className="text-[#D4AF37] font-bold mb-1 text-center text-sm">نصائح ذهبية</h3>
              <div className="text-xs text-gray-300 flex justify-between">
                <span>• اجمع قبل الانفجار</span>
                <span>• أعلى مضاعف = أعلى ربح</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* لا حاجة لتذييل الصفحة لتقليل الارتفاع */}
      </div>
    </div>
  );
};

export default EgyptRocketPage;