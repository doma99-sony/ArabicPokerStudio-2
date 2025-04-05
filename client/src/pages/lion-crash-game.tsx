import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import '../lion-crash-animations.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronUp,
  ChevronDown,
  BarChart3,
  History,
  Trophy,
  Users,
  User,
  Clock,
  DollarSign,
  TrendingUp,
  Search,
  Shield,
} from 'lucide-react';

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

interface GameHistory {
  gameId: string;
  crashPoint: number;
  startTime: string;
  endTime: string;
  duration: number;
  totalBets: number;
  totalProfits: number;
}

interface LeaderboardEntry {
  userId: number;
  username?: string;
  avatar?: string;
  totalWins: number;
  gamesPlayed: number;
  totalProfit: number;
  highestMultiplier: number;
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
}

const LionCrashGame: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [autoCashoutAt, setAutoCashoutAt] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('game');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all_time');
  const [isBetting, setIsBetting] = useState<boolean>(false);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [isCashingOut, setIsCashingOut] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationGameId, setVerificationGameId] = useState<string>('');
  const [crashAnimationActive, setCrashAnimationActive] = useState<boolean>(false);
  const gameContainer = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);
  const multiplierRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  
  // الاستعلامات والطلبات
  const { data: currentGame, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/lion-crash/current'],
    refetchInterval: 1000,
  });
  
  const { data: gameHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/lion-crash/history/recent'],
    refetchInterval: 5000,
  });
  
  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/lion-crash/stats/user'],
    enabled: !!user,
  });
  
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['/api/lion-crash/leaderboard', selectedPeriod],
    refetchInterval: 15000,
  });
  
  // طلب وضع رهان
  const placeBetMutation = useMutation({
    mutationFn: async (data: { gameId: string; betAmount: number; autoCashoutAt?: number }) => {
      return apiRequest('/api/lion-crash/bet', {
        method: 'POST',
        data
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        setHasBet(true);
        playSound('bet');
        toast({
          title: 'تم وضع الرهان',
          description: 'تم وضع رهانك بنجاح',
        });
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'حدث خطأ أثناء وضع الرهان',
          variant: 'destructive',
        });
      }
      setIsBetting(false);
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء وضع الرهان',
        variant: 'destructive',
      });
      setIsBetting(false);
    },
  });
  
  // طلب سحب الرهان
  const cashoutMutation = useMutation({
    mutationFn: async (data: { gameId: string }) => {
      return apiRequest('/api/lion-crash/cashout', {
        method: 'POST',
        data
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        playSound('cashout');
        toast({
          title: 'تم السحب',
          description: `تم سحب رهانك بنجاح بمُضاعف ${response.multiplier?.toFixed(2)}x وربح ${response.profit}`,
        });
        setHasBet(false);
      } else {
        toast({
          title: 'خطأ',
          description: response.message || 'حدث خطأ أثناء سحب الرهان',
          variant: 'destructive',
        });
      }
      setIsCashingOut(false);
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء سحب الرهان',
        variant: 'destructive',
      });
      setIsCashingOut(false);
    },
  });
  
  // وضع رهان
  const handlePlaceBet = () => {
    if (!user) {
      toast({
        title: 'غير مسجل دخول',
        description: 'يجب تسجيل الدخول لوضع رهان',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentGame || !currentGame.game) return;
    
    if (betAmount <= 0) {
      toast({
        title: 'مبلغ غير صالح',
        description: 'يجب أن يكون مبلغ الرهان أكبر من صفر',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentGame.game.status !== 'waiting') {
      toast({
        title: 'اللعبة قيد التشغيل',
        description: 'انتظر حتى تبدأ اللعبة التالية',
        variant: 'destructive',
      });
      return;
    }
    
    setIsBetting(true);
    
    placeBetMutation.mutate({
      gameId: currentGame.game.gameId,
      betAmount,
      autoCashoutAt: autoCashoutAt || undefined,
    });
  };
  
  // سحب الرهان
  const handleCashout = () => {
    if (!currentGame || !currentGame.game) return;
    
    if (currentGame.game.status !== 'running') {
      toast({
        title: 'اللعبة ليست قيد التشغيل',
        description: 'لا يمكن السحب إلا عند تشغيل اللعبة',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCashingOut(true);
    
    cashoutMutation.mutate({
      gameId: currentGame.game.gameId,
    });
  };
  
  // التحقق من نزاهة لعبة
  const verifyGame = async (gameId: string) => {
    if (!gameId) return;
    
    setIsVerifying(true);
    
    try {
      const response = await apiRequest(`/api/lion-crash/verify/${gameId}`);
      setVerificationData(response);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء التحقق من اللعبة',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // تشغيل الأصوات
  const playSound = (type: 'bet' | 'cashout' | 'crash' | 'countdown') => {
    if (!audioRef.current) return;
    
    let soundUrl = '';
    
    switch (type) {
      case 'bet':
        soundUrl = '/assets/sounds/bet.mp3';
        break;
      case 'cashout':
        soundUrl = '/assets/sounds/cashout.mp3';
        break;
      case 'crash':
        soundUrl = '/assets/sounds/crash.mp3';
        break;
      case 'countdown':
        soundUrl = '/assets/sounds/countdown.mp3';
        break;
      default:
        return;
    }
    
    audioRef.current.src = soundUrl;
    audioRef.current.play().catch(() => {
      // تم رفض التشغيل التلقائي، عادة بسبب سياسات المتصفح
    });
  };
  
  // تحديث الرسوم المتحركة للمضاعف
  useEffect(() => {
    if (!currentGame?.game) return;
    
    const multiplierElement = multiplierRef.current;
    const lionElement = lionRef.current;
    if (!multiplierElement || !lionElement) return;
    
    // تحديث قيمة المضاعف
    multiplierElement.textContent = `${currentGame.game.currentMultiplier.toFixed(2)}x`;
    
    // تكبير حجم العرض كلما زاد المضاعف
    const baseSize = 2;
    const scaleFactor = Math.min(1 + (currentGame.game.currentMultiplier - 1) * 0.05, 2.5);
    multiplierElement.style.fontSize = `${baseSize * scaleFactor}rem`;
    
    // تغيير اللون حسب قيمة المضاعف
    if (currentGame.game.currentMultiplier < 1.5) {
      multiplierElement.style.color = '#ffffff';
    } else if (currentGame.game.currentMultiplier < 3) {
      multiplierElement.style.color = '#4ade80';
    } else if (currentGame.game.currentMultiplier < 10) {
      multiplierElement.style.color = '#3b82f6';
    } else {
      multiplierElement.style.color = '#f43f5e';
    }
    
    // تحريك الأسد أثناء اللعبة
    if (currentGame.game.status === 'running') {
      lionElement.classList.add('lion-running');
    } else {
      lionElement.classList.remove('lion-running');
    }
  }, [currentGame]);
  
  // تأثير الانهيار
  useEffect(() => {
    if (!currentGame || !currentGame.game) return;
    
    // فحص إذا كانت اللعبة قد انتهت
    if (currentGame.game.status === 'ended' && !crashAnimationActive) {
      setCrashAnimationActive(true);
      playSound('crash');
      
      setTimeout(() => {
        setCrashAnimationActive(false);
      }, 2000);
    }
  }, [currentGame, crashAnimationActive]);
  
  // الخروج من حالة الرهان عند إعادة تعيين اللعبة
  useEffect(() => {
    if (!currentGame || !currentGame.game) return;
    
    // إعادة تعيين حالة الرهان عندما تكون اللعبة في حالة انتظار
    if (currentGame.game.status === 'waiting') {
      if (hasBet) {
        // تحقق مما إذا كان المستخدم لا يزال لديه رهان نشط في اللعبة الجديدة
        const isPlayerActive = currentGame.game.players.some(
          (player) => player.userId === user?.id
        );
        
        if (!isPlayerActive) {
          setHasBet(false);
        }
      }
    }
  }, [currentGame, hasBet, user]);
  
  // عرض مؤقت العد التنازلي
  const renderCountdown = () => {
    if (!currentGame || !currentGame.game) return null;
    
    if (currentGame.game.status === 'waiting') {
      return (
        <div className="countdown text-2xl font-bold mb-4">
          تبدأ اللعبة في {currentGame.game.countdown} ثوانٍ
        </div>
      );
    }
    return null;
  };
  
  // تحقق من حالة اللاعب في اللعبة الحالية
  const getCurrentPlayerStatus = () => {
    if (!currentGame || !currentGame.game || !user) return null;
    
    return currentGame.game.players.find((player) => player.userId === user.id);
  };
  
  // تحقق مما إذا كان اللاعب قد وضع رهانًا بالفعل
  const hasActiveBet = () => {
    const playerStatus = getCurrentPlayerStatus();
    return !!playerStatus;
  };
  
  // عرض زر الرهان/السحب
  const renderActionButton = () => {
    if (!currentGame || !currentGame.game) return null;
    
    const playerStatus = getCurrentPlayerStatus();
    
    if (currentGame.game.status === 'waiting') {
      // في حالة الانتظار، عرض زر الرهان
      return (
        <Button
          className="w-full text-lg py-6"
          onClick={handlePlaceBet}
          disabled={isBetting || hasActiveBet()}
        >
          {isBetting ? 'جاري وضع الرهان...' : hasActiveBet() ? 'تم وضع الرهان' : 'وضع رهان'}
        </Button>
      );
    } else if (currentGame.game.status === 'running') {
      // في حالة التشغيل، عرض زر السحب إذا كان اللاعب لديه رهان
      if (playerStatus && playerStatus.status === 'playing') {
        return (
          <Button
            className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
            onClick={handleCashout}
            disabled={isCashingOut}
          >
            {isCashingOut ? 'جاري السحب...' : `سحب @ ${currentGame.game.currentMultiplier.toFixed(2)}x`}
          </Button>
        );
      } else if (playerStatus && playerStatus.status === 'cashed_out') {
        // إذا سحب اللاعب بالفعل
        return (
          <Button
            className="w-full text-lg py-6 bg-blue-600"
            disabled={true}
          >
            تم السحب @ {playerStatus.cashoutMultiplier?.toFixed(2)}x (+{playerStatus.profit})
          </Button>
        );
      }
    } else if (currentGame.game.status === 'ended') {
      // في حالة الانتهاء، عرض نتيجة اللاعب
      if (playerStatus) {
        if (playerStatus.status === 'cashed_out') {
          return (
            <Button
              className="w-full text-lg py-6 bg-blue-600"
              disabled={true}
            >
              تم السحب @ {playerStatus.cashoutMultiplier?.toFixed(2)}x (+{playerStatus.profit})
            </Button>
          );
        } else if (playerStatus.status === 'busted') {
          return (
            <Button
              className="w-full text-lg py-6 bg-red-600"
              disabled={true}
            >
              خسرت! (-{playerStatus.betAmount})
            </Button>
          );
        }
      }
    }
    
    return (
      <Button
        className="w-full text-lg py-6"
        disabled={true}
      >
        انتظر اللعبة التالية
      </Button>
    );
  };
  
  return (
    <div className="container mx-auto py-6 rtl">
      <h1 className="text-3xl font-bold mb-6 text-center">لعبة الأسد الذهبي</h1>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="game" className="text-lg py-3">
            <BarChart3 className="ml-2" />
            اللعبة
          </TabsTrigger>
          <TabsTrigger value="history" className="text-lg py-3">
            <History className="ml-2" />
            التاريخ
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-lg py-3">
            <Trophy className="ml-2" />
            المتصدرين
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-lg py-3">
            <User className="ml-2" />
            إحصائياتي
          </TabsTrigger>
        </TabsList>
        
        {/* علامة تبويب اللعبة */}
        <TabsContent value="game" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0 overflow-hidden relative">
                  {/* خلفية اللعبة */}
                  <div
                    ref={backgroundRef}
                    className="w-full h-96 relative bg-gradient-to-b from-purple-900 to-purple-700 overflow-hidden"
                  >
                    {/* مساحة اللعبة */}
                    <div
                      ref={gameContainer}
                      className="w-full h-full relative"
                    >
                      {/* المضاعف الحالي */}
                      <div
                        ref={multiplierRef}
                        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white z-20 transition-all duration-200 ${currentGame?.game?.status === 'running' ? 'multiplier-growing' : ''}`}
                      >
                        {currentGame?.game?.currentMultiplier.toFixed(2)}x
                      </div>
                      
                      {/* الأسد */}
                      <div
                        ref={lionRef}
                        className="absolute bottom-0 left-0 z-10 transition-all duration-100"
                        style={{ transform: 'scale(0.7)' }}
                      >
                        <img
                          src="/assets/lion-gazelle/lion.svg"
                          alt="الأسد"
                          className={`w-32 h-32 ${currentGame?.game?.status === 'running' ? 'lion-running' : currentGame?.game?.status === 'ended' ? 'lion-crashed' : ''}`}
                        />
                      </div>
                      
                      {/* تأثير الغبار */}
                      <div
                        ref={dustRef}
                        className="absolute bottom-0 left-0 z-0 opacity-0 transition-opacity duration-300"
                      >
                        <img
                          src="/assets/lion-gazelle/dust.svg"
                          alt="غبار"
                          className="w-24 h-24"
                        />
                      </div>
                      
                      {/* تأثير الانهيار */}
                      {crashAnimationActive && (
                        <div className="absolute inset-0 crash-background z-30">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-white crash-text">
                            انهيار @ {currentGame?.game?.crashPoint.toFixed(2)}x
                          </div>
                        </div>
                      )}
                      
                      {/* العد التنازلي */}
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-20">
                        {renderCountdown()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* لوحة التحكم */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>لوحة التحكم</CardTitle>
                  <CardDescription>ضع رهانك واسحبه قبل أن ينهار الأسد</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">مبلغ الرهان</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(Math.max(0, betAmount - 100))}
                          disabled={hasActiveBet()}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          className="text-center"
                          disabled={hasActiveBet()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(betAmount + 100)}
                          disabled={hasActiveBet()}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">سحب تلقائي عند</label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAutoCashoutAt(autoCashoutAt ? Math.max(1.1, autoCashoutAt - 0.5) : 2)}
                          disabled={hasActiveBet()}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={autoCashoutAt || ''}
                          onChange={(e) => setAutoCashoutAt(e.target.value ? Number(e.target.value) : null)}
                          className="text-center"
                          placeholder="تلقائي"
                          step="0.1"
                          min="1.1"
                          disabled={hasActiveBet()}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAutoCashoutAt(autoCashoutAt ? autoCashoutAt + 0.5 : 2)}
                          disabled={hasActiveBet()}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      {renderActionButton()}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">اللاعبون النشطون</h3>
                      <div className="max-h-48 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>اللاعب</TableHead>
                              <TableHead>الرهان</TableHead>
                              <TableHead>النتيجة</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentGame?.game?.players.map((player: GamePlayer) => (
                              <TableRow key={player.userId} className={player.userId === user?.id ? "bg-secondary/30" : ""}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 ml-2">
                                      <AvatarImage src={player.avatar || ''} alt={player.username} />
                                      <AvatarFallback>{player.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {player.username}
                                  </div>
                                </TableCell>
                                <TableCell>{player.betAmount}</TableCell>
                                <TableCell>
                                  {player.status === 'betting' && <Badge variant="outline">في الانتظار</Badge>}
                                  {player.status === 'playing' && <Badge variant="outline" className="bg-yellow-500/20">يلعب</Badge>}
                                  {player.status === 'cashed_out' && (
                                    <Badge variant="outline" className="bg-green-500/20">
                                      {player.cashoutMultiplier?.toFixed(2)}x (+{player.profit})
                                    </Badge>
                                  )}
                                  {player.status === 'busted' && <Badge variant="outline" className="bg-red-500/20">خسر</Badge>}
                                </TableCell>
                              </TableRow>
                            ))}
                            {(!currentGame?.game?.players || currentGame.game.players.length === 0) && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">لا يوجد لاعبون نشطون</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* علامة تبويب التاريخ */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="ml-2" /> تاريخ الألعاب الأخيرة
              </CardTitle>
              <CardDescription>عرض آخر 50 لعبة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-2">
                  {gameHistory?.games.slice(0, 20).map((game: GameHistory) => (
                    <TooltipProvider key={game.gameId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-14 h-8 flex items-center justify-center rounded cursor-pointer ${
                              game.crashPoint < 2 ? 'bg-red-500' :
                              game.crashPoint < 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            onClick={() => {
                              setVerificationGameId(game.gameId);
                              verifyGame(game.gameId);
                            }}
                          >
                            <span className="text-white font-medium">
                              {game.crashPoint.toFixed(2)}x
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-bold">{game.crashPoint.toFixed(2)}x</p>
                            <p>المدة: {game.duration} ثانية</p>
                            <p>انقر للتحقق من نزاهة اللعبة</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">الألعاب السابقة</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المضاعف</TableHead>
                        <TableHead>الوقت</TableHead>
                        <TableHead>المدة</TableHead>
                        <TableHead>التحقق</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gameHistory?.games.map((game: GameHistory) => (
                        <TableRow key={game.gameId}>
                          <TableCell className="font-medium">
                            <Badge
                              className={`${
                                game.crashPoint < 2 ? 'bg-red-500' :
                                game.crashPoint < 10 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            >
                              {game.crashPoint.toFixed(2)}x
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(game.endTime).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{game.duration.toFixed(1)} ثانية</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setVerificationGameId(game.gameId);
                                verifyGame(game.gameId);
                              }}
                            >
                              <Shield className="h-4 w-4 ml-1" />
                              تحقق
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* عرض تفاصيل التحقق */}
              {verificationData && (
                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">التحقق من نزاهة اللعبة: {verificationGameId}</h3>
                  
                  {verificationData.success ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">المضاعف</p>
                          <p className="font-medium">{verificationData.crashPoint?.toFixed(2)}x</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">بذرة الخادم</p>
                          <p className="font-medium text-xs break-all">{verificationData.serverSeed || "محجوب"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">بذرة العميل</p>
                          <p className="font-medium text-xs break-all">{verificationData.clientSeed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">هاش البذرة القادمة</p>
                          <p className="font-medium text-xs break-all">{verificationData.nextServerSeedHash}</p>
                        </div>
                      </div>
                      
                      {verificationData.message && (
                        <div className="mt-4 p-2 bg-yellow-500/20 rounded text-sm">
                          {verificationData.message}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-500">
                      {verificationData.message || "حدث خطأ أثناء التحقق"}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* علامة تبويب المتصدرين */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="ml-2" /> لوحة المتصدرين
              </CardTitle>
              <CardDescription>أفضل اللاعبين في أسد الحظ</CardDescription>
              
              <div className="flex gap-2 mt-4">
                <Button
                  variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('daily')}
                >
                  اليوم
                </Button>
                <Button
                  variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('weekly')}
                >
                  الأسبوع
                </Button>
                <Button
                  variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('monthly')}
                >
                  الشهر
                </Button>
                <Button
                  variant={selectedPeriod === 'all_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('all_time')}
                >
                  الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* أفضل 3 لاعبين */}
                <div className="flex justify-center gap-6 mb-8">
                  {leaderboardData?.leaderboard.slice(0, 3).map((entry: LeaderboardEntry, index: number) => (
                    <div
                      key={entry.userId}
                      className={`text-center ${index === 0 ? 'order-2 scale-110' : index === 1 ? 'order-1' : 'order-3'}`}
                    >
                      <div className="relative">
                        <Avatar className={`h-20 w-20 mx-auto border-4 ${
                          index === 0 ? 'border-yellow-500' : 
                          index === 1 ? 'border-gray-400' : 
                          'border-amber-700'
                        }`}>
                          <AvatarImage src={entry.avatar || ''} alt={entry.username} />
                          <AvatarFallback className="text-xl">{entry.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-700'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <h3 className="mt-2 font-bold">{entry.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        الربح: <span className="text-green-500">{entry.totalProfit > 0 ? '+' : ''}{entry.totalProfit}</span>
                      </p>
                      <p className="text-xs">
                        أعلى مضاعف: {entry.highestMultiplier?.toFixed(2)}x
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* قائمة اللاعبين */}
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المركز</TableHead>
                        <TableHead>اللاعب</TableHead>
                        <TableHead>الألعاب</TableHead>
                        <TableHead>مجموع الربح</TableHead>
                        <TableHead>أعلى مضاعف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData?.leaderboard.slice(0, 10).map((entry: LeaderboardEntry, index: number) => (
                        <TableRow key={entry.userId} className={entry.userId === user?.id ? "bg-secondary/30" : ""}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 ml-2">
                                <AvatarImage src={entry.avatar || ''} alt={entry.username} />
                                <AvatarFallback>{entry.username?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {entry.username}
                              {entry.userId === user?.id && (
                                <Badge variant="outline" className="ml-2">أنت</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{entry.gamesPlayed}</TableCell>
                          <TableCell className={entry.totalProfit > 0 ? "text-green-500" : "text-red-500"}>
                            {entry.totalProfit > 0 ? '+' : ''}{entry.totalProfit}
                          </TableCell>
                          <TableCell>{entry.highestMultiplier?.toFixed(2)}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* علامة تبويب إحصائياتي */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="ml-2" /> إحصائياتي
              </CardTitle>
              <CardDescription>إحصائيات أدائك في لعبة الأسد</CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-8">
                  <p className="mb-4">يجب تسجيل الدخول لعرض إحصائياتك</p>
                  <Button onClick={() => navigate("/login")}>تسجيل الدخول</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* إحصائيات عامة */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="text-2xl font-bold">{userStats?.stats?.totalProfit || 0}</h3>
                          <p className="text-sm text-muted-foreground">مجموع الربح</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="text-2xl font-bold">{userStats?.stats?.totalGames || 0}</h3>
                          <p className="text-sm text-muted-foreground">عدد الألعاب</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="text-2xl font-bold">{userStats?.stats?.bestMultiplier?.toFixed(2) || "0.00"}x</h3>
                          <p className="text-sm text-muted-foreground">أعلى مضاعف</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <h3 className="text-2xl font-bold">{userStats?.stats?.biggestWin || 0}</h3>
                          <p className="text-sm text-muted-foreground">أكبر ربح</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* إحصائيات تفصيلية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>نسبة الفوز</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span>نسبة الفوز</span>
                              <span>{userStats?.stats?.totalGames ? Math.round((userStats.stats.wins / userStats.stats.totalGames) * 100) : 0}%</span>
                            </div>
                            <Progress value={userStats?.stats?.totalGames ? (userStats.stats.wins / userStats.stats.totalGames) * 100 : 0} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center p-2 rounded bg-green-500/20">
                              <h4 className="text-sm text-muted-foreground">الفوز</h4>
                              <p className="text-xl font-semibold">{userStats?.stats?.wins || 0}</p>
                            </div>
                            <div className="text-center p-2 rounded bg-red-500/20">
                              <h4 className="text-sm text-muted-foreground">الخسارة</h4>
                              <p className="text-xl font-semibold">{userStats?.stats?.losses || 0}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>الرهانات والأرباح</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm text-muted-foreground">إجمالي الرهانات</h4>
                              <p className="text-xl font-semibold">{userStats?.stats?.totalWagered || 0}</p>
                            </div>
                            <div>
                              <h4 className="text-sm text-muted-foreground">متوسط المضاعف</h4>
                              <p className="text-xl font-semibold">{userStats?.stats?.averageMultiplier?.toFixed(2) || "0.00"}x</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm text-muted-foreground mb-1">نسبة الربح</h4>
                            <div className="flex items-center">
                              <Progress
                                value={50 + (userStats?.stats?.totalProfit ? (userStats.stats.totalProfit / userStats.stats.totalWagered) * 50 : 0)}
                                className="flex-1"
                              />
                              <span className="ml-2 font-medium">
                                {userStats?.stats?.totalWagered
                                  ? ((userStats.stats.totalProfit / userStats.stats.totalWagered) * 100).toFixed(1)
                                  : "0.0"}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* مشغل الصوت */}
      <audio ref={audioRef} />
    </div>
  );
};

export default LionCrashGame;