import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimeUpdatesContext } from '@/hooks/use-realtime-updates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Reels3DContainer } from '@/components/game/egypt-queen/3d-reel';
import { BigWinEffects } from '@/components/game/egypt-queen/big-win-effects';
import { TreasureHuntGame } from '@/components/game/egypt-queen/treasure-hunt-game';

// أنواع رموز الماكينة
type SymbolType = 
  | "cleopatra" 
  | "book" 
  | "eye" 
  | "anubis" 
  | "cat" 
  | "A" | "K" | "Q" | "J" | "10"
  | "wild";

// خط فوز - تمثيل صف وعمود
interface WinLine {
  row: number;
  col: number;
}

export default function EgyptQueenPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const realtime = useRealtimeUpdatesContext();
  
  // حالة اللعبة
  const [bet, setBet] = useState(1000);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<SymbolType[][]>([
    ["cleopatra", "book", "eye"],
    ["cat", "wild", "A"],
    ["K", "Q", "J"],
    ["10", "anubis", "cat"],
    ["eye", "cleopatra", "book"]
  ]);
  const [winningLines, setWinningLines] = useState<WinLine[][]>([]);
  const [winAmount, setWinAmount] = useState(0);
  const [showBigWin, setShowBigWin] = useState(false);
  const [freespins, setFreespins] = useState(0);
  const [showTreasureHunt, setShowTreasureHunt] = useState(false);
  const [gameVolume, setGameVolume] = useState(50);
  const [audio, setAudio] = useState<{
    spin?: HTMLAudioElement;
    win?: HTMLAudioElement;
    bigWin?: HTMLAudioElement;
    background?: HTMLAudioElement;
    treasureOpen?: HTMLAudioElement;
  }>({});
  
  // عداد لتتبع دورات اللعب المجانية
  const freespinsCounter = useRef(0);
  
  // تهيئة الأصوات
  useEffect(() => {
    const spinSound = new Audio('/sounds/spin.mp3');
    const winSound = new Audio('/sounds/win.mp3');
    const bigWinSound = new Audio('/sounds/big-win.mp3');
    const backgroundMusic = new Audio('/sounds/egypt-background.mp3');
    const treasureOpenSound = new Audio('/sounds/chest-open.mp3');
    
    // إعداد حلقة الصوت الخلفي
    backgroundMusic.loop = true;
    backgroundMusic.volume = gameVolume / 100;
    
    // إضافة الأصوات إلى الحالة
    setAudio({
      spin: spinSound,
      win: winSound,
      bigWin: bigWinSound,
      background: backgroundMusic,
      treasureOpen: treasureOpenSound
    });
    
    // تشغيل الموسيقى الخلفية عند تحميل الصفحة
    backgroundMusic.play().catch(e => console.error('لا يمكن تشغيل الصوت: ', e));
    
    // تنظيف الأصوات عند إلغاء تحميل المكون
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, []);
  
  // مزامنة مستوى الصوت مع تغييره
  useEffect(() => {
    if (audio.background) {
      audio.background.volume = gameVolume / 100;
    }
  }, [gameVolume, audio]);
  
  // طلب رصيد المستخدم الحالي
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user,
  });
  
  // طلب لتحديث رصيد اللاعب عند الفوز/الخسارة
  // تعريف دالة لإرسال طلبات API
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response.json();
};

const updateUserChips = useMutation({
    mutationFn: async (payload: { betAmount: number, winAmount: number, gameType: string }) => {
      return apiRequest('/api/games/egypt-queen/update-chips', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        refetchUser();
      } else {
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ أثناء تحديث الرصيد",
          variant: "destructive"
        });
      }
    }
  });
  
  // التفاعل مع الأحداث في الوقت الحقيقي
  useEffect(() => {
    if (!realtime) return;
    
    // الاستماع لتحديثات الرصيد
    const handleUserUpdate = (data: any) => {
      if (data.updateType === 'chips_update') {
        refetchUser();
      }
    };
    
    realtime.addMessageListener('user_update', handleUserUpdate);
    
    return () => {
      realtime.removeMessageListener('user_update', handleUserUpdate);
    };
  }, [realtime, refetchUser]);
  
  // فحص ما إذا كان الرهان صالحاً
  const isBetValid = () => {
    if (!userData) return false;
    return bet > 0 && bet <= userData.chips;
  };
  
  // زيادة/نقصان الرهان
  const changeBet = (amount: number) => {
    const newBet = Math.max(100, Math.min(bet + amount, userData?.chips || 10000));
    setBet(newBet);
  };
  
  // ضبط الرهان إلى قيم محددة مسبقاً
  const setQuickBet = (percentage: number) => {
    if (!userData) return;
    const maxBet = Math.min(userData.chips, 1000000);
    const newBet = Math.floor(maxBet * (percentage / 100));
    setBet(Math.max(100, newBet));
  };
  
  // معالجة حدث دوران البكرات
  const handleSpin = async () => {
    if (!isBetValid() && freespinsCounter.current <= 0) {
      toast({
        title: "رهان غير صالح",
        description: "يرجى التأكد من أن لديك رصيد كاف وأن الرهان أكبر من صفر",
        variant: "destructive"
      });
      return;
    }
    
    // تعيين حالة الدوران
    setSpinning(true);
    setWinningLines([]);
    setWinAmount(0);
    
    // تشغيل صوت الدوران
    if (audio.spin) {
      audio.spin.currentTime = 0;
      audio.spin.play().catch(e => console.error(e));
    }
    
    // إذا كان هذا دوران مجاني، قم بتقليل العداد
    if (freespinsCounter.current > 0) {
      freespinsCounter.current--;
      setFreespins(freespinsCounter.current);
    } else {
      // خصم الرهان من رصيد المستخدم عبر API
      try {
        await updateUserChips.mutateAsync({
          betAmount: bet,
          winAmount: 0,
          gameType: 'egypt_queen_bet'
        });
      } catch (error) {
        console.error("خطأ في تحديث الرصيد:", error);
        setSpinning(false);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء معالجة رهانك",
          variant: "destructive"
        });
        return;
      }
    }
  };
  
  // معالجة نتائج الدوران بعد اكتماله
  const handleSpinComplete = (finalReels: SymbolType[][]) => {
    // حساب المكافآت وخطوط الفوز
    const { winLines, totalWin, hasScatter, hasBonus } = calculateWinnings(finalReels);
    
    setReels(finalReels);
    setWinningLines(winLines);
    setWinAmount(totalWin);
    
    // تحقق من تنشيط المكافآت الخاصة
    if (hasScatter && freespinsCounter.current <= 0) {
      // تفعيل الدورات المجانية
      const newFreespins = 10; // 10 دورات مجانية قياسية
      freespinsCounter.current = newFreespins;
      setFreespins(newFreespins);
      
      toast({
        title: "دورات مجانية!",
        description: `حصلت على ${newFreespins} دورات مجانية!`,
        variant: "default",
      });
    }
    
    if (hasBonus) {
      // تفعيل لعبة صيد الكنز
      setShowTreasureHunt(true);
    }
    
    // تشغيل صوت الفوز المناسب
    if (totalWin > 0) {
      if (totalWin >= bet * 10) {
        // فوز كبير
        setShowBigWin(true);
        if (audio.bigWin) {
          audio.bigWin.currentTime = 0;
          audio.bigWin.play().catch(e => console.error(e));
        }
      } else {
        // فوز عادي
        if (audio.win) {
          audio.win.currentTime = 0;
          audio.win.play().catch(e => console.error(e));
        }
      }
      
      // تحديث رصيد اللاعب بالمبلغ المربوح
      updateUserChips.mutate({
        betAmount: freespinsCounter.current > 0 ? 0 : bet,
        winAmount: totalWin,
        gameType: 'egypt_queen_win'
      });
    }
    
    // إنهاء حالة الدوران
    setSpinning(false);
    
    // بدء دوران جديد تلقائياً إذا كان هناك دورات مجانية متبقية
    if (freespinsCounter.current > 0) {
      setTimeout(() => {
        handleSpin();
      }, 2000);
    }
  };
  
  // حساب المكافآت وخطوط الفوز
  const calculateWinnings = (finalReels: SymbolType[][]) => {
    const symbolValues: Record<SymbolType, number> = {
      'cleopatra': 500, // الأعلى قيمة
      'book': 300, // رمز ال SCATTER
      'eye': 200,
      'anubis': 150,
      'cat': 100,
      'A': 50,
      'K': 40,
      'Q': 30,
      'J': 20,
      '10': 10,
      'wild': 250 // يمكن أن يحل محل أي رمز
    };
    
    // خطوط الفوز المحتملة (أفقية، قطرية، إلخ)
    const paylines = [
      // الخطوط الأفقية
      [
        {row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}
      ],
      [
        {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}, {row: 1, col: 4}
      ],
      [
        {row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}, {row: 2, col: 3}, {row: 2, col: 4}
      ],
      // خطوط متعرجة
      [
        {row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}, {row: 1, col: 3}, {row: 0, col: 4}
      ],
      [
        {row: 2, col: 0}, {row: 1, col: 1}, {row: 0, col: 2}, {row: 1, col: 3}, {row: 2, col: 4}
      ],
      // خطوط إضافية على شكل V
      [
        {row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}, {row: 1, col: 3}, {row: 0, col: 4}
      ],
      [
        {row: 2, col: 0}, {row: 1, col: 1}, {row: 0, col: 2}, {row: 1, col: 3}, {row: 2, col: 4}
      ],
      // متعرجة أخرى
      [
        {row: 1, col: 0}, {row: 0, col: 1}, {row: 1, col: 2}, {row: 2, col: 3}, {row: 1, col: 4}
      ],
      [
        {row: 1, col: 0}, {row: 2, col: 1}, {row: 1, col: 2}, {row: 0, col: 3}, {row: 1, col: 4}
      ],
    ];
    
    const winLines: WinLine[][] = [];
    let totalWin = 0;
    let hasScatter = false;
    let hasBonus = false;
    
    // عدد رموز SCATTER على البكرات
    const scatterCount = finalReels.flat().filter(symbol => symbol === 'book').length;
    if (scatterCount >= 3) {
      hasScatter = true;
      totalWin += bet * (scatterCount * 2); // مكافأة SCATTER
    }
    
    // عدد رموز BONUS (عين حورس) على البكرات
    const bonusCount = finalReels.flat().filter(symbol => symbol === 'eye').length;
    if (bonusCount >= 3) {
      hasBonus = true;
    }
    
    // فحص كل خط فوز
    paylines.forEach(line => {
      const symbols: SymbolType[] = [];
      
      // استخراج الرموز من البكرات حسب خط الفوز
      line.forEach(pos => {
        if (finalReels[pos.col] && finalReels[pos.col][pos.row]) {
          symbols.push(finalReels[pos.col][pos.row]);
        }
      });
      
      // التحقق من الفوز بالخط
      if (symbols.length >= 3) {
        const firstSymbol = symbols[0];
        let matchCount = 1;
        let hasWild = firstSymbol === 'wild';
        
        for (let i = 1; i < symbols.length; i++) {
          const currentSymbol = symbols[i];
          
          if (currentSymbol === 'wild') {
            hasWild = true;
            matchCount++;
          } else if (currentSymbol === firstSymbol || firstSymbol === 'wild') {
            matchCount++;
          } else {
            break;
          }
        }
        
        // احتساب الفوز إذا كان هناك 3 أو أكثر متطابقة
        if (matchCount >= 3) {
          const symbolValue = symbolValues[firstSymbol === 'wild' && symbols[1] !== 'wild' ? symbols[1] : firstSymbol];
          const lineWin = symbolValue * matchCount * (hasWild ? 2 : 1) * (bet / 1000);
          
          totalWin += lineWin;
          winLines.push(line.slice(0, matchCount));
        }
      }
    });
    
    return { winLines, totalWin, hasScatter, hasBonus };
  };
  
  // معالجة اكتمال لعبة صيد الكنز
  const handleTreasureHuntComplete = (treasureValue: number) => {
    setShowTreasureHunt(false);
    
    // إضافة قيمة الكنز إلى الفوز الكلي
    const totalWinWithTreasure = winAmount + treasureValue;
    setWinAmount(totalWinWithTreasure);
    
    // تفعيل تأثير الفوز الكبير إذا كانت قيمة الكنز كبيرة
    if (treasureValue >= bet * 5) {
      setShowBigWin(true);
      if (audio.bigWin) {
        audio.bigWin.currentTime = 0;
        audio.bigWin.play().catch(e => console.error(e));
      }
    }
    
    // تحديث رصيد اللاعب بقيمة الكنوز
    updateUserChips.mutate({
      betAmount: 0, // لا يوجد رهان إضافي
      winAmount: treasureValue,
      gameType: 'egypt_queen_treasure'
    });
  };
  
  return (
    <div className="h-full w-full relative bg-amber-950/20 overflow-hidden">
      {/* خلفية اللعبة */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 z-0" 
        style={{ backgroundImage: 'url("/images/egypt-queen/backgrounds/pyramids-desert.svg")' }}
      />
      
      {/* الطبقة الرئيسية */}
      <div className="relative z-10 h-full flex flex-col">
        {/* شريط معلومات اللعبة */}
        <div className="bg-amber-950/80 text-amber-100 p-3 flex justify-between items-center border-b border-amber-700">
          <div className="flex items-center gap-2">
            <img 
              src="/images/egypt-queen/symbols/cleopatra.svg" 
              alt="Egypt Queen Logo" 
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold text-amber-100">ملكة مصر</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-amber-900/90 px-4 py-2 rounded-lg border border-amber-700">
              <span className="text-amber-300 font-bold">{freespins}</span>
              <span className="text-amber-100 ms-2">دورات مجانية</span>
            </div>
            
            <div className="bg-amber-900/90 px-4 py-2 rounded-lg border border-amber-700">
              <span className="text-amber-300 font-bold">
                {userData?.chips?.toLocaleString('ar-EG') || 0}
              </span>
              <span className="text-amber-100 ms-2">رقاقة</span>
            </div>
          </div>
        </div>
        
        {/* منطقة اللعب الرئيسية */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* منطقة البكرات - تحتل معظم المساحة */}
          <div className="flex-1 p-4 flex justify-center items-center min-h-[300px]">
            <div className="w-full max-w-3xl aspect-[5/3] relative">
              {/* حاوية البكرات ثلاثية الأبعاد */}
              <div className="absolute inset-0">
                <Reels3DContainer 
                  reels={reels}
                  spinning={spinning}
                  onSpinComplete={handleSpinComplete}
                  winningLines={winningLines}
                  bigWin={showBigWin}
                />
              </div>
              
              {/* تأثيرات الفوز الكبير */}
              <BigWinEffects 
                isActive={showBigWin} 
                winAmount={winAmount}
                onComplete={() => setShowBigWin(false)}
              />
              
              {/* لعبة صيد الكنز */}
              <TreasureHuntGame 
                isActive={showTreasureHunt}
                onComplete={handleTreasureHuntComplete}
                initialTreasures={12}
                gameTime={45}
              />
            </div>
          </div>
          
          {/* لوحة التحكم - الجانب */}
          <div className="bg-amber-950/80 border-t md:border-t-0 md:border-l border-amber-700 p-4 w-full md:w-80 flex flex-col">
            <Tabs defaultValue="bet" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="bet">الرهان</TabsTrigger>
                <TabsTrigger value="info">معلومات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bet" className="space-y-4">
                {/* قسم الرهان */}
                <Card className="bg-amber-900/50 border-amber-700">
                  <div className="p-4 space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-amber-100 mb-1">الرهان الحالي</h3>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-amber-600 text-amber-100"
                          onClick={() => changeBet(-100)}
                          disabled={bet <= 100}
                        >
                          -
                        </Button>
                        <Input 
                          type="number" 
                          value={bet} 
                          onChange={(e) => setBet(Number(e.target.value))}
                          className="mx-2 bg-amber-950/50 border-amber-600 text-amber-100 text-center"
                        />
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="border-amber-600 text-amber-100"
                          onClick={() => changeBet(100)}
                          disabled={bet >= (userData?.chips || 0)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(5)}
                      >
                        5%
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(10)}
                      >
                        10%
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(25)}
                      >
                        25%
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(50)}
                      >
                        50%
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(75)}
                      >
                        75%
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="bg-amber-800 hover:bg-amber-700 text-amber-100"
                        onClick={() => setQuickBet(100)}
                      >
                        الكل
                      </Button>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="default" 
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white py-6 text-lg font-bold"
                        onClick={handleSpin}
                        disabled={spinning || (!isBetValid() && freespinsCounter.current <= 0)}
                      >
                        {spinning ? "جاري الدوران..." : "دوران"}
                      </Button>
                    </div>
                    
                    {winAmount > 0 && (
                      <div className="mt-4 p-3 bg-amber-600/30 border border-amber-500 rounded-lg text-center">
                        <h3 className="text-amber-100 text-sm">الفوز</h3>
                        <p className="text-amber-300 text-2xl font-bold">
                          {winAmount.toLocaleString('ar-EG')}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
                
                {/* التحكم في الصوت */}
                <Card className="bg-amber-900/50 border-amber-700">
                  <div className="p-4">
                    <h3 className="text-amber-100 mb-2">مستوى الصوت</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-100">0</span>
                      <Slider 
                        value={[gameVolume]} 
                        onValueChange={(values) => setGameVolume(values[0])} 
                        max={100} 
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-amber-100">100</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="info">
                <Card className="bg-amber-900/50 border-amber-700">
                  <div className="p-4 space-y-4 text-amber-100">
                    <h3 className="font-bold text-lg border-b border-amber-700 pb-2">
                      قيم الرموز (على رهان 1000)
                    </h3>
                    
                    <div className="space-y-2">
                      {/* قيم الرموز */}
                      <div className="flex items-center gap-2">
                        <img src="/images/egypt-queen/symbols/cleopatra.svg" className="w-8 h-8" />
                        <span>كليوباترا: 500 × عدد الرموز المتطابقة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img src="/images/egypt-queen/symbols/book.svg" className="w-8 h-8" />
                        <span>كتاب الأسرار (SCATTER): 300 × عدد الرموز</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img src="/images/egypt-queen/symbols/eye.svg" className="w-8 h-8" />
                        <span>عين حورس (BONUS): 200 × عدد الرموز المتطابقة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img src="/images/egypt-queen/symbols/wild.png" className="w-8 h-8" />
                        <span>WILD: يضاعف أي فوز عند استخدامه</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg border-b border-amber-700 pb-2 pt-2">
                      المكافآت
                    </h3>
                    
                    <div className="space-y-2">
                      <p>3 أو أكثر من كتاب الأسرار = 10 دورات مجانية</p>
                      <p>3 أو أكثر من عين حورس = لعبة صيد الكنز</p>
                      <p>تتضاعف قيمة الفوز عند استخدام WILD</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* عناصر الصوت المخفية */}
      <audio id="egypt-chest-open-sound" src="/sounds/chest-open.mp3" preload="auto"></audio>
    </div>
  );
}