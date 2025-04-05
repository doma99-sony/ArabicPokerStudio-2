import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronRight, 
  Coins, 
  Trophy, 
  Users, 
  Clock, 
  History,
  AlertTriangle,
  TrendingUp,
  ArrowLeft,
  Rocket,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import '../rocket-game-animations.css';

// تعريف أنواع البيانات
interface GameState {
  gameId: string;
  status: 'waiting' | 'running' | 'ended';
  startTime?: number;
  endTime?: number;
  crashPoint: number;
  currentMultiplier: number;
  players: GamePlayer[];
  countdown: number;
}

interface GamePlayer {
  userId: number;
  username: string;
  avatar?: string;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number;
  status: 'betting' | 'playing' | 'cashed_out' | 'busted';
}

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  bestMultiplier: number;
  biggestWin: number;
  totalWagered: number;
  totalProfit: number;
  averageMultiplier: number;
  favoriteCharacter?: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

interface GameHistory {
  gameId: number;
  startTime: string;
  endTime: string;
  multiplier: number;
  playerCount: number;
  totalBet: number;
}

interface LeaderboardEntry {
  userId: number;
  username?: string;
  totalWins: number;
  gamesPlayed: number;
  highestMultiplier: number;
}

const LionGazelleGame = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginGuestMutation } = useAuth();
  const queryClient = useQueryClient();
  
  // حالة اللعبة
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashoutAt, setAutoCashoutAt] = useState<number>(2);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState<boolean>(false);
  const [isPlayerBetting, setIsPlayerBetting] = useState<boolean>(false);
  const [isPlayerCashedOut, setIsPlayerCashedOut] = useState<boolean>(false);
  const [lastCashedOut, setLastCashedOut] = useState<{multiplier: number, profit: number} | null>(null);
  
  // مراجع المكونات
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);
  const gazelleRef = useRef<HTMLDivElement>(null);
  
  // مؤقتات وحلقات التحديث
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  
  // استعلام الحصول على اللعبة الحالية
  const { data: gameData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/lion-gazelle/current-game'],
    refetchInterval: 1000, // تحديث كل ثانية
  });
  
  // استعلام الحصول على إحصائيات اللاعب
  const { data: statsData } = useQuery({
    queryKey: ['/api/lion-gazelle/stats'],
    enabled: !!user,
  });
  
  // استعلام الحصول على سجل الألعاب
  const { data: historyData } = useQuery({
    queryKey: ['/api/lion-gazelle/history'],
  });
  
  // استعلام الحصول على المتصدرين
  const { data: leaderboardData } = useQuery({
    queryKey: ['/api/lion-gazelle/leaderboard'],
  });
  
  // إجراء المراهنة
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/lion-gazelle/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(betData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تمت المراهنة بنجاح",
          description: `لقد راهنت بـ ${betAmount} رقائق`,
        });
        setIsPlayerBetting(true);
        queryClient.invalidateQueries({ queryKey: ['/api/lion-gazelle/current-game'] });
      } else {
        toast({
          title: "فشلت المراهنة",
          description: data.message || "حدث خطأ أثناء المراهنة",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "فشلت المراهنة",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  });
  
  // إجراء السحب
  const cashOutMutation = useMutation({
    mutationFn: async (gameId: string) => {
      return apiRequest('/api/lion-gazelle/cash-out', 'POST', { gameId });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "تم السحب بنجاح",
          description: `ربحت ${data.profit} رقائق عند مضاعف ${data.multiplier}x`,
        });
        setIsPlayerCashedOut(true);
        setLastCashedOut({
          multiplier: data.multiplier,
          profit: data.profit
        });
        queryClient.invalidateQueries({ queryKey: ['/api/lion-gazelle/current-game'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      } else {
        toast({
          title: "فشل السحب",
          description: data.message || "حدث خطأ أثناء السحب",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "فشل السحب",
        description: "حدث خطأ أثناء الاتصال بالخادم",
        variant: "destructive",
      });
    }
  });
  
  // تسجيل الدخول التلقائي كضيف إذا لم يكن المستخدم مسجل الدخول
  useEffect(() => {
    if (!user && !loginGuestMutation.isPending) {
      console.log("محاولة تسجيل دخول تلقائي كضيف...");
      loginGuestMutation.mutate();
    }
  }, [user, loginGuestMutation]);

  // تابع لتحديث بيانات اللعبة من الاستعلام
  useEffect(() => {
    if (gameData?.success && gameData.game) {
      setCurrentGame(gameData.game);
      
      // التحقق من حالة اللاعب الحالية
      if (user) {
        const currentPlayer = gameData.game.players.find((p: GamePlayer) => p.userId === user.id);
        setIsPlayerBetting(!!currentPlayer);
        setIsPlayerCashedOut(currentPlayer?.status === 'cashed_out');
      }
    }
  }, [gameData, user]);
  
  // تحديث موقع الحيوانات وحالة اللعبة
  useEffect(() => {
    if (currentGame?.status === 'running') {
      // بدء حلقة التحديث فقط إذا لم تكن جارية بالفعل
      if (!updateInterval.current) {
        updateInterval.current = setInterval(() => {
          // تحديث موقع الأسد والغزالة بناءً على المضاعف الحالي
          updateAnimationPositions();
        }, 50); // تحديث 20 مرة في الثانية للحصول على حركة سلسة
      }
      
      // التأكد من أن حالة اللاعب تم تحديثها إلى "يلعب"
      if (isPlayerBetting && !isPlayerCashedOut) {
        // الحالة "يلعب" تعني أن اللاعب قد وضع رهانًا ولكن لم يسحب بعد
      }
    } else if (currentGame?.status === 'ended') {
      // إيقاف حلقة التحديث عند انتهاء اللعبة
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
      
      // إضافة تأثير الانفجار عند انتهاء اللعبة
      if (gameAreaRef.current) {
        // إضافة تأثير الانفجار
        const crashAnimation = document.createElement('div');
        crashAnimation.className = 'crash-animation';
        gameAreaRef.current.appendChild(crashAnimation);
        
        // إزالة تأثير الانفجار بعد انتهاء الرسوم المتحركة
        setTimeout(() => {
          if (crashAnimation.parentNode === gameAreaRef.current) {
            gameAreaRef.current.removeChild(crashAnimation);
          }
        }, 800); // الرسوم المتحركة تستمر 0.8 ثانية
        
        // إضافة تأثير الاهتزاز للشاشة
        gameAreaRef.current.classList.add('crash-effect');
        
        // إزالة تأثير الاهتزاز
        setTimeout(() => {
          gameAreaRef.current.classList.remove('crash-effect');
        }, 500); // الاهتزاز يستمر 0.5 ثانية
      }
      
      // إعادة تعيين حالات اللاعب للجولة التالية
      setIsPlayerBetting(false);
      setIsPlayerCashedOut(false);
    }
    
    // تنظيف عند إلغاء تحميل المكون
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }
    };
  }, [currentGame, isPlayerBetting, isPlayerCashedOut]);
  
  // وظيفة لتحديث رسومات صاروخ الكراش
  const updateAnimationPositions = () => {
    if (!currentGame || !gameAreaRef.current) return;
    
    // هنا لا نحتاج لتحديث مواقع الحيوانات لأننا استبدلناها بصاروخ كراش
    // بدلاً من ذلك، يتم تحديث المسار في SVG بشكل ديناميكي من خلال خاصية d
    // في عنصر path في خلال العرض
    
    // أضف تأثيرات بصرية إضافية اعتماداً على المضاعف
    if (currentGame.currentMultiplier > 5) {
      // إضافة تأثير وهج للمضاعف العالي
      const flashEffect = document.createElement('div');
      flashEffect.className = 'absolute inset-0 bg-amber-500/10 z-1';
      flashEffect.style.animation = 'fadeOut 0.5s forwards';
      
      gameAreaRef.current.appendChild(flashEffect);
      
      // إزالة التأثير بعد انتهاء الرسوم المتحركة
      setTimeout(() => {
        if (flashEffect.parentNode === gameAreaRef.current) {
          gameAreaRef.current.removeChild(flashEffect);
        }
      }, 500);
    }
    
    // تحديث مقياس الشبكة ليتناسب مع المضاعف
    const gridLines = gameAreaRef.current.querySelector('.grid-lines');
    if (gridLines) {
      const scaleValue = Math.max(0.5, 1 - (currentGame.currentMultiplier - 1) * 0.05);
      gridLines.setAttribute('style', `background-size: ${20 * scaleValue}px ${20 * scaleValue}px`);
    }
  };
  
  // وظيفة لوضع رهان
  const handlePlaceBet = () => {
    if (!user) {
      // محاولة تسجيل الدخول تلقائياً كضيف
      console.log("محاولة تسجيل دخول تلقائي كضيف...");
      loginGuestMutation.mutate();
      
      // إظهار رسالة للمستخدم
      toast({
        title: "يتم تسجيل الدخول تلقائياً",
        description: "يتم الآن تسجيل دخولك كضيف، ثم حاول المراهنة مرة أخرى",
      });
      return;
    }
    
    // إذا كانت قيمة الرهان صفر، نضع قيمة افتراضية
    if (betAmount <= 0) {
      setBetAmount(10); // قيمة افتراضية للرهان
      
      toast({
        title: "تم ضبط مبلغ المراهنة",
        description: "تم ضبط مبلغ المراهنة تلقائياً على 10 رقائق",
      });
      
      // نقوم بإرسال الرهان بالقيمة الافتراضية بعد ثانية واحدة
      setTimeout(() => {
        const defaultBetData = {
          amount: 10
        };
        
        if (isAutoCashoutEnabled && autoCashoutAt > 1) {
          // @ts-ignore
          defaultBetData.autoCashoutAt = autoCashoutAt;
        }
        
        // @ts-ignore
        placeBetMutation.mutate(defaultBetData);
      }, 1000);
      
      return;
    }
    
    if (user.chips < betAmount) {
      // إذا كانت الرقائق غير كافية، نضع رهان بقيمة نصف ما يملك المستخدم
      const newBet = Math.max(10, Math.floor(user.chips / 2));
      setBetAmount(newBet);
      
      toast({
        title: "تم تعديل المبلغ",
        description: `تم تعديل مبلغ المراهنة إلى ${newBet} رقاقة لتناسب رصيدك`,
      });
      
      // نقوم بإرسال الرهان بالقيمة المعدلة بعد ثانية واحدة
      setTimeout(() => {
        const adjustedBetData = {
          amount: newBet
        };
        
        if (isAutoCashoutEnabled && autoCashoutAt > 1) {
          // @ts-ignore
          adjustedBetData.autoCashoutAt = autoCashoutAt;
        }
        
        // @ts-ignore
        placeBetMutation.mutate(adjustedBetData);
      }, 1000);
      
      return;
    }
    
    // إنشاء كائن البيانات للمراهنة
    const betData = {
      amount: betAmount
    };
    
    // إضافة قيمة السحب التلقائي إذا كان مفعلًا
    if (isAutoCashoutEnabled && autoCashoutAt > 1) {
      // @ts-ignore
      betData.autoCashoutAt = autoCashoutAt;
      
      toast({
        title: "تم تفعيل السحب التلقائي",
        description: `سيتم سحب الرهان تلقائيًا عند مضاعف ${formatMultiplier(autoCashoutAt)}`,
      });
    }
    
    console.log("إرسال رهان:", betData);
    
    // @ts-ignore
    placeBetMutation.mutate(betData);
  };
  
  // وظيفة للسحب
  const handleCashOut = () => {
    if (!currentGame || !user) return;
    
    cashOutMutation.mutate(currentGame.gameId);
  };
  
  // تنسيق المضاعف
  const formatMultiplier = (multiplier: number) => {
    return `${multiplier.toFixed(2)}x`;
  };
  
  // الحصول على رهان اللاعب الحالي
  const getCurrentPlayerBet = () => {
    if (!currentGame || !user) return null;
    
    return currentGame.players.find(p => p.userId === user.id);
  };
  
  // تصنيف اللاعبين (الفائزين، الخاسرين، المشاركين حاليًا)
  const getPlayersByStatus = (status: 'cashed_out' | 'busted' | 'playing' | 'betting') => {
    if (!currentGame) return [];
    
    return currentGame.players.filter(p => p.status === status);
  };
  
  // الفائزون (سحبوا قبل الاصطدام)
  const cashedOutPlayers = getPlayersByStatus('cashed_out').sort((a, b) => 
    (b.cashoutMultiplier || 0) - (a.cashoutMultiplier || 0)
  );
  
  // الخاسرون (لم يسحبوا قبل الاصطدام)
  const bustedPlayers = getPlayersByStatus('busted').sort((a, b) => b.betAmount - a.betAmount);
  
  // المشاركون الحاليون
  const activePlayers = [...getPlayersByStatus('playing'), ...getPlayersByStatus('betting')];
  
  // تأثير لون المضاعف بناءً على القيمة
  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 5) return 'text-red-500';
    if (multiplier >= 3) return 'text-amber-500';
    if (multiplier >= 2) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // تأثير وزن خط المضاعف بناءً على القيمة
  const getMultiplierClass = (multiplier: number) => {
    const colorClass = getMultiplierColor(multiplier);
    
    let extraClass = '';
    if (multiplier >= 5) {
      extraClass = 'font-extrabold high-multiplier';
    } else if (multiplier >= 2) {
      extraClass = 'font-bold multiplier-glow';
    }
    
    return `${colorClass} ${extraClass}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* الشريط العلوي */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex justify-between items-center">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5 ml-2" />
          <span>العودة</span>
        </Button>
        
        <h1 className="text-2xl font-bold text-amber-500">صاروخ عرباوي 🚀</h1>
        
        <div className="flex items-center gap-1">
          <span className="text-amber-500 font-bold">{user?.chips || 0}</span>
          <Coins className="h-5 w-5 text-amber-500" />
        </div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الجانب الأيسر - منطقة اللعب */}
          <div className="lg:col-span-2">
            {/* شريط الجولات السابقة */}
            <div className="bg-gray-800/70 rounded-md p-2 mb-4 overflow-x-auto">
              <div className="flex gap-2">
                {historyData?.success && historyData.history.slice(0, 10).map((game: GameHistory) => (
                  <div 
                    key={game.gameId} 
                    className={`w-12 h-12 flex items-center justify-center rounded-md ${
                      game.multiplier >= 5 ? 'bg-red-900/70 text-red-300' :
                      game.multiplier >= 3 ? 'bg-amber-900/70 text-amber-300' :
                      game.multiplier >= 2 ? 'bg-yellow-900/70 text-yellow-300' :
                      'bg-green-900/70 text-green-300'
                    }`}
                  >
                    <span className="font-bold text-sm">{formatMultiplier(game.multiplier)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* منطقة اللعب الرئيسية */}
            <Card className="border-amber-900/50 bg-gradient-to-b from-amber-950/50 to-gray-900/50 mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-amber-500">
                    منطقة الإطلاق
                  </CardTitle>
                  {currentGame?.status === 'waiting' && (
                    <div className="flex items-center bg-yellow-900/50 rounded-full px-3 py-1 pulse-animation">
                      <Clock className="h-4 w-4 text-yellow-400 ml-1.5 animate-spin-slow" />
                      <span className="text-yellow-400 font-bold countdown-timer text-lg">{currentGame?.countdown || 0}s</span>
                      <span className="text-yellow-200 text-xs mr-2">استعداد للإطلاق...</span>
                    </div>
                  )}
                </div>
                <CardDescription className="text-gray-400">
                  {currentGame?.status === 'waiting' 
                    ? 'صاروخ عرباوي سينطلق قريبًا، استعد للمراهنة!' 
                    : currentGame?.status === 'running'
                    ? 'الصاروخ في تصاعد! اسحب قبل أن يتحطم!'
                    : 'تحطم الصاروخ! هل كنت محظوظًا؟'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* منطقة اللعب - صاروخ عرباوي */}
                <div 
                  ref={gameAreaRef}
                  className="relative h-64 md:h-96 overflow-hidden rounded-xl border border-amber-900/30 bg-gradient-to-b from-gray-900 to-gray-800"
                >
                  {/* شكل الصاروخ (خط متصاعد) */}
                  <div className={`absolute inset-0 z-0 ${currentGame?.status === 'running' ? 'rocket-line' : ''}`}>
                    <svg className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
                      {currentGame?.status === 'running' && (
                        <path 
                          d={`M 0,300 L ${Math.min(500, (currentGame.currentMultiplier - 1) * 100)},${Math.max(50, 300 - (currentGame.currentMultiplier - 1) * 60)}`} 
                          stroke="#F59E0B" 
                          strokeWidth="3" 
                          fill="none" 
                          className="rocket-path"
                        />
                      )}
                    </svg>
                  </div>
                  
                  {/* صورة الصاروخ */}
                  {currentGame?.status === 'running' && (
                    <div className="absolute z-20 rocket-animation rocket-flying rocket-glow" 
                      style={{
                        left: `${Math.min(90, (currentGame.currentMultiplier - 1) * 15)}%`,
                        bottom: `${Math.min(80, (currentGame.currentMultiplier - 1) * 20)}%`,
                      }}
                    >
                      {/* جسم الصاروخ */}
                      <div className="relative">
                        {/* رأس الصاروخ */}
                        <div 
                          className="w-16 h-16"
                          style={{
                            transform: 'translate(-50%, 50%) rotate(45deg)',
                            background: 'linear-gradient(135deg, #FF3A33 0%, #FF3A33 50%, transparent 50%, transparent 100%)',
                            borderRadius: '50% 0 50% 50%',
                            boxShadow: '0 0 20px rgba(255, 58, 51, 0.9), 0 0 40px rgba(255, 120, 30, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          {/* نافذة الصاروخ */}
                          <div className="absolute w-4 h-4 rounded-full bg-blue-400 top-1/4 left-1/4 border-2 border-white/50"></div>
                        </div>
                        
                        {/* ذيل الصاروخ */}
                        <div className="absolute -bottom-2 left-0 w-full flex justify-center">
                          <div className="h-8 w-4 bg-yellow-500 flame-animation thrust-effect" style={{ boxShadow: '0 0 10px 2px rgba(255, 200, 0, 0.8)' }}></div>
                          <div className="h-6 w-3 bg-orange-500 flame-animation thrust-effect mx-1" style={{ boxShadow: '0 0 10px 2px rgba(255, 150, 0, 0.8)' }}></div>
                          <div className="h-7 w-3 bg-red-500 flame-animation thrust-effect" style={{ boxShadow: '0 0 10px 2px rgba(255, 50, 0, 0.8)' }}></div>
                        </div>
                        
                        {/* دخان الصاروخ */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <div 
                              key={idx} 
                              className="absolute smoke-effect"
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                                bottom: `${idx * 3}px`,
                                left: `${Math.sin(idx) * 8}px`,
                                animationDelay: `${idx * 0.1}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* تأثير الانفجار */}
                  {currentGame?.status === 'ended' && (
                    <>
                      <div 
                        className="absolute z-20 explosion-effect" 
                        style={{
                          left: `${Math.min(90, (currentGame.crashPoint - 1) * 15)}%`,
                          bottom: `${Math.min(80, (currentGame.crashPoint - 1) * 20)}%`,
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,59,0,1) 0%, rgba(255,165,0,0.8) 50%, rgba(255,215,0,0) 100%)',
                          boxShadow: '0 0 30px 10px rgba(255,59,0,0.8)',
                          transform: 'translate(-50%, 50%)',
                          animation: 'explosionEffect 1s forwards',
                        }}
                      ></div>
                      
                      {/* تناثر الشظايا */}
                      <div className="absolute z-10" style={{
                        left: `${Math.min(90, (currentGame.crashPoint - 1) * 15)}%`,
                        bottom: `${Math.min(80, (currentGame.crashPoint - 1) * 20)}%`,
                      }}>
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div 
                            key={index}
                            className="absolute bg-orange-500"
                            style={{
                              width: '4px',
                              height: '6px',
                              borderRadius: '50%',
                              transform: `rotate(${index * 30}deg) translate(${20 + Math.random() * 15}px, 0)`,
                              boxShadow: '0 0 8px 3px rgba(255, 165, 0, 0.7)',
                              opacity: 0,
                              animation: `fadeIn 0.2s ${index * 0.03}s forwards, slideInRight 0.7s ${index * 0.03}s forwards`
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* موجة الصدمة */}
                      <div 
                        className="absolute z-5"
                        style={{
                          left: `${Math.min(90, (currentGame.crashPoint - 1) * 15)}%`,
                          bottom: `${Math.min(80, (currentGame.crashPoint - 1) * 20)}%`,
                          width: '200px',
                          height: '200px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255, 100, 0, 0.7)',
                          transform: 'translate(-50%, 50%) scale(0)',
                          animation: 'explosionEffect 1.5s forwards',
                        }}
                      ></div>
                    </>
                  )}
                  
                  {/* المضاعف الكبير في منتصف الشاشة */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className={`text-4xl md:text-6xl font-bold ${
                      currentGame?.status === 'running' 
                        ? getMultiplierClass(currentGame.currentMultiplier)
                        : currentGame?.status === 'ended'
                        ? 'text-red-500 font-extrabold crash-animation'
                        : 'text-white'
                    }`}>
                      {currentGame?.status === 'running' 
                        ? formatMultiplier(currentGame.currentMultiplier)
                        : currentGame?.status === 'ended'
                        ? formatMultiplier(currentGame.crashPoint)
                        : formatMultiplier(1.00)}
                    </div>
                  </div>
                  
                  {/* خطوط الشبكة */}
                  <div className="absolute inset-0 grid-lines"></div>
                  
                  {/* المسار (سطح الأرض) */}
                  <div 
                    className="absolute bottom-0 left-0 w-full h-12 z-10"
                    style={{
                      background: 'url("/assets/lion-gazelle/track.svg") repeat-x',
                      backgroundSize: 'auto 100%'
                    }}
                  ></div>
                  
                  {/* تأثير نهاية اللعبة */}
                  {currentGame?.status === 'ended' && (
                    <div className="absolute inset-0 bg-red-500/20 z-5"></div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="flex flex-col w-full gap-4">
                  {/* منطقة المراهنة أو السحب */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    
                    {/* رسالة تسجيل الدخول إذا لم يكن المستخدم قد سجل الدخول */}
                    {!user && (
                      <div className="w-full bg-gray-800/70 rounded-md p-4 text-center">
                        <h3 className="text-lg font-bold text-amber-500 mb-2">تسجيل الدخول مطلوب</h3>
                        <p className="text-white mb-3">يرجى تسجيل الدخول للمشاركة في اللعبة ووضع الرهانات</p>
                        <Button 
                          onClick={() => navigate('/')}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          size="lg"
                        >
                          <Rocket className="w-5 h-5 ml-1.5" />
                          العودة للصفحة الرئيسية
                        </Button>
                      </div>
                    )}
                    
                    {/* حالة الانتظار - يمكن المراهنة */}
                    {user && (currentGame?.status === 'waiting' || true) && !isPlayerBetting && (
                      <div className="w-full flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                            className="w-full sm:w-1/3 bg-gray-800 border-gray-700 text-white text-left"
                            placeholder="مبلغ الرهان"
                            min={1}
                          />
                          <Button 
                            onClick={handlePlaceBet} 
                            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={placeBetMutation.isPending}
                            size="lg"
                          >
                            {placeBetMutation.isPending ? 
                              <>
                                <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
                                جارٍ المراهنة...
                              </> : 
                              <>
                                <Rocket className="w-4 h-4 ml-1.5" />
                                المراهنة الآن!
                              </>
                            }
                          </Button>
                        </div>
                        
                        {/* منطقة السحب التلقائي */}
                        <div className="flex items-center gap-2 bg-gray-800/70 rounded-md p-2">
                          <div className="flex items-center">
                            <Switch
                              checked={isAutoCashoutEnabled}
                              onCheckedChange={setIsAutoCashoutEnabled}
                              className="data-[state=checked]:bg-green-600"
                            />
                            <Label className="mr-2 text-sm">سحب تلقائي</Label>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-grow">
                            <Label className="text-sm">عند مضاعف:</Label>
                            <Input
                              type="number"
                              value={autoCashoutAt}
                              onChange={(e) => setAutoCashoutAt(parseFloat(e.target.value) || 2)}
                              step={0.1}
                              min={1.1}
                              disabled={!isAutoCashoutEnabled}
                              className="w-20 bg-gray-800 border-gray-700 text-white text-left"
                            />
                            <span className="text-amber-500 text-sm">x</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* في حالة اللعب - لاعب يشارك - يمكن السحب */}
                    {currentGame?.status === 'running' && isPlayerBetting && !isPlayerCashedOut && (
                      <Button
                        onClick={handleCashOut}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                        disabled={cashOutMutation.isPending}
                        size="lg"
                      >
                        {cashOutMutation.isPending ? 
                          <>
                            <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
                            جاري السحب...
                          </> : 
                          <>
                            <TrendingUp className="w-4 h-4 ml-1.5" />
                            السحب عند {formatMultiplier(currentGame.currentMultiplier)}
                          </>
                        }
                      </Button>
                    )}
                    
                    {/* لاعب قام بالسحب بالفعل - إظهار النتيجة */}
                    {isPlayerCashedOut && lastCashedOut && (
                      <div className="text-center w-full">
                        <p className="text-green-500 font-bold text-lg">
                          تم السحب بنجاح عند {formatMultiplier(lastCashedOut.multiplier)}
                        </p>
                        <p className="text-white">
                          ربحت <span className="text-green-500 font-bold">{lastCashedOut.profit}</span> رقائق
                        </p>
                      </div>
                    )}
                    
                    {/* لاعب غير مشارك وتم انتهاء اللعبة - إظهار الكراش */}
                    {currentGame?.status === 'ended' && !isPlayerBetting && (
                      <div className="text-center w-full">
                        <p className="text-red-500 font-bold text-lg">
                          تحطمت عند {formatMultiplier(currentGame.crashPoint)}
                        </p>
                        <p className="text-gray-300">
                          انتظر الجولة القادمة للمشاركة
                        </p>
                      </div>
                    )}
                    
                    {/* لاعب تم القبض عليه (لم يسحب قبل الكراش) */}
                    {currentGame?.status === 'ended' && isPlayerBetting && !isPlayerCashedOut && (
                      <div className="text-center w-full">
                        <p className="text-red-500 font-bold text-lg">
                          تحطم الصاروخ!
                        </p>
                        <p className="text-white">
                          خسرت <span className="text-red-500 font-bold">{getCurrentPlayerBet()?.betAmount || 0}</span> رقائق
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* معلومات إضافية - عدد المشاركين وإجمالي الرهانات */}
                  <div className="flex justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{currentGame?.players.length || 0} لاعب</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      <span>
                        {currentGame?.players.reduce((sum, p) => sum + p.betAmount, 0) || 0} رقاقة
                      </span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
            
            {/* علامات تبويب اللاعبين - المتصدرين والإحصائيات */}
            <Tabs defaultValue="players">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="players" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
                  اللاعبون
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
                  السجل
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-500">
                  الإحصائيات
                </TabsTrigger>
              </TabsList>
              
              {/* علامة تبويب اللاعبين */}
              <TabsContent value="players">
                <Card className="border-amber-900/50 bg-gradient-to-b from-gray-900/70 to-gray-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-500">اللاعبون النشطون</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* اللاعبون المشاركون */}
                    {activePlayers.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {activePlayers.map((player) => (
                          <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center">
                                {player.avatar ? (
                                  <img src={player.avatar} alt={player.username} className="w-full h-full rounded-full" />
                                ) : (
                                  <span>{player.username.charAt(0)}</span>
                                )}
                              </div>
                              <span>{player.username}</span>
                            </div>
                            <div className="text-amber-500 font-bold">{player.betAmount}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا يوجد لاعبون نشطون حاليًا</p>
                    )}
                    
                    {/* الفائزون (سحبوا قبل الكراش) */}
                    {cashedOutPlayers.length > 0 && (
                      <>
                        <h3 className="text-lg font-bold text-green-500 mb-2">اللاعبون الفائزون</h3>
                        <div className="space-y-2 mb-4">
                          {cashedOutPlayers.map((player) => (
                            <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md winner-row">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
                                  {player.avatar ? (
                                    <img src={player.avatar} alt={player.username} className="w-full h-full rounded-full" />
                                  ) : (
                                    <span>{player.username.charAt(0)}</span>
                                  )}
                                </div>
                                <span>{player.username}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-white font-bold">{player.profit} رقاقة</span>
                                <span className={getMultiplierColor(player.cashoutMultiplier || 1)}>
                                  {formatMultiplier(player.cashoutMultiplier || 1)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* الخاسرون (لم يسحبوا قبل الكراش) */}
                    {bustedPlayers.length > 0 && (
                      <>
                        <h3 className="text-lg font-bold text-red-500 mb-2">اللاعبون الخاسرون</h3>
                        <div className="space-y-2">
                          {bustedPlayers.map((player) => (
                            <div key={player.userId} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center">
                                  {player.avatar ? (
                                    <img src={player.avatar} alt={player.username} className="w-full h-full rounded-full" />
                                  ) : (
                                    <span>{player.username.charAt(0)}</span>
                                  )}
                                </div>
                                <span>{player.username}</span>
                              </div>
                              <div className="text-red-500 font-bold">-{player.betAmount}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* علامة تبويب السجل */}
              <TabsContent value="history">
                <Card className="border-amber-900/50 bg-gradient-to-b from-gray-900/70 to-gray-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-500">السجل السابق</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyData?.success && historyData.history.length > 0 ? (
                      <div className="space-y-2">
                        {historyData.history.map((game: GameHistory) => (
                          <div key={game.gameId} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <History className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-300">
                                {new Date(game.endTime).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-300">
                                {game.playerCount} لاعب
                              </span>
                              <span className={`font-bold ${getMultiplierColor(game.multiplier)}`}>
                                {formatMultiplier(game.multiplier)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا توجد سجلات سابقة</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* علامة تبويب الإحصائيات */}
              <TabsContent value="stats">
                <Card className="border-amber-900/50 bg-gradient-to-b from-gray-900/70 to-gray-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-500">إحصائياتك</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!user ? (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-gray-300">يجب تسجيل الدخول لعرض إحصائياتك</p>
                      </div>
                    ) : statsData?.success && statsData.stats ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">عدد الألعاب</span>
                          <span className="text-xl font-bold text-white">
                            {statsData.stats.totalGames}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">عدد الفوز</span>
                          <span className="text-xl font-bold text-green-500">
                            {statsData.stats.wins}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">أعلى مضاعف</span>
                          <span className={`text-xl font-bold ${getMultiplierColor(statsData.stats.bestMultiplier)}`}>
                            {formatMultiplier(statsData.stats.bestMultiplier)}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">أكبر فوز</span>
                          <span className="text-xl font-bold text-amber-500">
                            {statsData.stats.biggestWin}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">إجمالي الربح</span>
                          <span className={`text-xl font-bold ${statsData.stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {statsData.stats.totalProfit}
                          </span>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-md flex flex-col items-center">
                          <span className="text-sm text-gray-400">معدل الفوز</span>
                          <span className="text-xl font-bold text-white">
                            {statsData.stats.totalGames > 0 
                              ? `${Math.round((statsData.stats.wins / statsData.stats.totalGames) * 100)}%` 
                              : '0%'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا توجد إحصائيات متاحة</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* الجانب الأيمن - الإحصائيات واللاعبين */}
          <div className="space-y-6">
            {/* أحدث الألعاب والمتصدرين */}
            <Card className="border-amber-900/50 bg-gradient-to-b from-amber-950/50 to-gray-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-amber-500">المتصدرون</CardTitle>
                <CardDescription className="text-gray-400">
                  أفضل اللاعبين في اللعبة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboardData?.success && leaderboardData.leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboardData.leaderboard.slice(0, 5).map((entry: LeaderboardEntry, index: number) => (
                      <div key={entry.userId} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-300 text-black' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-gray-700 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <span>{entry.username || `لاعب_${entry.userId}`}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-400">{entry.gamesPlayed} لعبة</span>
                            <span className="text-amber-500 font-bold">{entry.totalWins}</span>
                          </div>
                          <div className={getMultiplierColor(entry.highestMultiplier)}>
                            {formatMultiplier(entry.highestMultiplier)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا يوجد متصدرون حتى الآن</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-amber-900/50 text-amber-500 hover:bg-amber-950">
                  عرض المزيد من المتصدرين
                </Button>
              </CardFooter>
            </Card>
            
            {/* نصائح اللعبة */}
            <Card className="border-amber-900/50 bg-gradient-to-b from-amber-950/50 to-gray-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-amber-500">نصائح اللعبة</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5" />
                    <span>كلما ارتفع المضاعف، زادت المخاطرة والعائد المحتمل.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <span>لا تنتظر كثيرًا! الغزالة قد تُمسك في أي لحظة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="h-5 w-5 text-amber-500 mt-0.5" />
                    <span>ضع استراتيجية للسحب المبكر للحصول على مكاسب قليلة ولكن مستمرة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Coins className="h-5 w-5 text-amber-500 mt-0.5" />
                    <span>أدر رصيدك بحكمة، ولا تراهن بأكثر مما يمكنك تحمل خسارته.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LionGazelleGame;