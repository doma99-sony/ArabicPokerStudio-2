import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

// صاروخ مصر - صفحة اللعبة الرئيسية
export default function EgyptRocketPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // إعدادات اللعبة
  const [betAmount, setBetAmount] = useState(10);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(1.5);
  const [balance, setBalance] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rocketPosition, setRocketPosition] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameHistory, setGameHistory] = useState<{multiplier: number, win: boolean}[]>([]);
  
  // المراجع
  const gameLoopRef = useRef<number | null>(null);
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // تهيئة الصوت
  useEffect(() => {
    // إنشاء عنصر الصوت
    audioRef.current = new Audio('/public/sounds/rocket-thrust.mp3');
    audioRef.current.loop = true;
    
    return () => {
      // إيقاف الصوت عند مغادرة الصفحة
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // دالة بدء اللعبة
  const startGame = () => {
    if (betAmount <= 0 || betAmount > balance) {
      toast({
        title: "خطأ في الرهان",
        description: "يرجى إدخال قيمة رهان صالحة",
        variant: "destructive"
      });
      return;
    }
    
    // خصم قيمة الرهان من الرصيد
    setBalance(prev => prev - betAmount);
    
    // إعادة تعيين متغيرات اللعبة
    setRocketPosition(0);
    setCurrentMultiplier(1.0);
    setIsPlaying(true);
    
    // تشغيل صوت الصاروخ
    if (audioRef.current) {
      audioRef.current.play();
    }
    
    // بدء حلقة اللعبة
    let lastTimestamp = performance.now();
    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      
      // زيادة المضاعف تدريجياً
      setCurrentMultiplier(prev => {
        // معادلة نمو المضاعف - يمكن تعديلها حسب صعوبة اللعبة
        const newMultiplier = prev + (deltaTime * 0.5);
        return parseFloat(newMultiplier.toFixed(2));
      });
      
      // تحريك الصاروخ للأعلى
      setRocketPosition(prev => prev + (deltaTime * 50));
      
      // احتمالية انفجار الصاروخ - تزداد مع ارتفاع المضاعف
      const crashProbability = Math.min(0.9, (currentMultiplier - 1) / 10);
      if (Math.random() < crashProbability) {
        // انفجار الصاروخ - انتهاء اللعبة
        endGame(false);
        return;
      }
      
      // استمرار حلقة اللعبة
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    // بدء الحلقة
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  // دالة إنهاء اللعبة
  const endGame = (cashout: boolean = true) => {
    // إيقاف حلقة اللعبة
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // إيقاف صوت الصاروخ
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (cashout) {
      // سحب الرهان - اللاعب فاز
      const winnings = Math.floor(betAmount * currentMultiplier);
      setBalance(prev => prev + winnings);
      
      toast({
        title: "مبروك!",
        description: `ربحت ${winnings} عملة!`,
        variant: "default"
      });
      
      // إضافة إلى السجل
      setGameHistory(prev => [...prev, { multiplier: currentMultiplier, win: true }].slice(-10));
    } else {
      // انفجار الصاروخ - اللاعب خسر
      toast({
        title: "انفجر الصاروخ!",
        description: `خسرت رهانك البالغ ${betAmount} عملة`,
        variant: "destructive"
      });
      
      // إضافة إلى السجل
      setGameHistory(prev => [...prev, { multiplier: currentMultiplier, win: false }].slice(-10));
    }
    
    setIsPlaying(false);
  };
  
  // دالة السحب
  const cashout = () => {
    if (isPlaying) {
      endGame(true);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0D16] to-[#1A2035] text-white">
      {/* خلفية النجوم المتحركة */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/public/images/stars-bg.jpg')] bg-repeat opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] to-transparent"></div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-start">
          {/* شعار اللعبة */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
              صاروخ مصر 🚀
            </h1>
            <p className="text-center text-gray-400 mt-2">تحدّى الحظ وحلّق بصاروخك عالياً لمضاعفة أرباحك</p>
          </div>
          
          {/* منطقة اللعب */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {/* منطقة لوحة النتائج والتاريخ */}
            <div className="lg:col-span-1">
              <Card className="bg-[#1E293B]/80 border-[#3A506B] backdrop-blur-sm text-white shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="text-center text-[#FFD700]">السجل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {gameHistory.map((game, index) => (
                      <div 
                        key={index} 
                        className={`text-center p-2 rounded-md text-xs ${
                          game.win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {game.multiplier.toFixed(2)}x
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-[#FFD700] font-semibold mb-2">إحصائياتك</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#2A3A4F] p-2 rounded-md">
                        <div className="text-gray-400 text-xs">الرصيد</div>
                        <div className="font-bold">{balance} عملة</div>
                      </div>
                      <div className="bg-[#2A3A4F] p-2 rounded-md">
                        <div className="text-gray-400 text-xs">أكبر ربح</div>
                        <div className="font-bold">{Math.max(...gameHistory.filter(g => g.win).map(g => g.multiplier), 0).toFixed(2)}x</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-[#FFD700] font-semibold mb-2">اللاعبين</h3>
                    <div className="bg-[#2A3A4F] p-2 rounded-md">
                      <div className="flex justify-between items-center text-sm py-1">
                        <span>🎮 أحمد</span>
                        <span className="text-green-400">سحب عند 2.5x</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1">
                        <span>🎮 محمد</span>
                        <span className="text-red-400">انفجر عند 1.8x</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1">
                        <span>🎮 سارة</span>
                        <span className="text-green-400">سحب عند 3.2x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* منطقة عرض الصاروخ */}
            <div className="lg:col-span-2">
              <Card className="bg-[#1E293B]/80 border-[#3A506B] backdrop-blur-sm text-white shadow-lg h-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-[#FFD700]">الصاروخ</CardTitle>
                    <div className="bg-[#2A3A4F] py-1 px-3 rounded-full text-2xl font-bold text-[#FFD700]">
                      {currentMultiplier.toFixed(2)}x
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div 
                    className="bg-gradient-to-b from-[#1E293B]/0 to-[#1E293B] h-64 w-full relative rounded-md overflow-hidden border border-[#3A506B]"
                    style={{
                      backgroundImage: 'url("/public/images/space-bg.jpg")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* منطقة عرض الصاروخ */}
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-100"
                      style={{ bottom: `${rocketPosition}px` }}
                    >
                      <img 
                        src="/public/images/egyptian-rocket.png" 
                        alt="Egyptian Rocket" 
                        className="h-20 w-auto"
                      />
                      {/* شعلة الصاروخ */}
                      {isPlaying && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-b-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">قيمة الرهان</label>
                      <div className="flex">
                        <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(parseInt(e.target.value || "0"))}
                          className="bg-[#2A3A4F] border-[#3A506B] text-white"
                          disabled={isPlaying}
                        />
                        <Button
                          onClick={() => setBetAmount(prev => Math.max(10, prev * 2))}
                          className="ml-2 bg-[#2A3A4F] hover:bg-[#3A506B]"
                          disabled={isPlaying}
                        >
                          ×2
                        </Button>
                        <Button
                          onClick={() => setBetAmount(prev => Math.max(10, Math.floor(prev / 2)))}
                          className="ml-2 bg-[#2A3A4F] hover:bg-[#3A506B]"
                          disabled={isPlaying}
                        >
                          ÷2
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">سحب تلقائي عند</label>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={cashoutMultiplier}
                          onChange={(e) => setCashoutMultiplier(parseFloat(e.target.value || "1"))}
                          className="bg-[#2A3A4F] border-[#3A506B] text-white"
                          step="0.1"
                          min="1.1"
                          disabled={isPlaying}
                        />
                        <span className="ml-2 text-[#FFD700] font-bold">×</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {!isPlaying ? (
                      <Button
                        onClick={startGame}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                      >
                        ابدأ اللعب 🚀
                      </Button>
                    ) : (
                      <Button
                        onClick={cashout}
                        className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC000] hover:to-[#FF8C00] text-black font-bold py-2 px-4 rounded-lg shadow-md"
                      >
                        سحب {(betAmount * currentMultiplier).toFixed(0)} 💰
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="border-[#3A506B] text-gray-300 hover:bg-[#2A3A4F]"
                    >
                      العودة للوبي
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}