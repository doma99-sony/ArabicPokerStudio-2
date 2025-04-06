import { useState, useEffect, useRef } from "react";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coins, ArrowLeft, Volume2, VolumeX, Trophy, Settings, Info, RotateCw } from "lucide-react";
import { formatChips } from "@/lib/utils";
import { GoldDustEffect } from "@/components/effects/snow-effect";
import { useLocation } from "wouter";

export default function EgyptQueenPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const globalWs = useGlobalWebSocket();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spinAudioRef = useRef<HTMLAudioElement>(null);
  const winAudioRef = useRef<HTMLAudioElement>(null);
  
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
    setIsGameStarted(true);
    
    // تشغيل الموسيقى إذا لم تكن مكتومة
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(error => {
        console.error('فشل في تشغيل الموسيقى:', error);
      });
    }
  };
  
  // دالة لتدوير عجلات السلوت
  const spin = () => {
    if (isSpinning) return;
    
    // التحقق من أن لدى اللاعب رصيد كاف
    if ((user?.chips || 0) < betAmount) {
      toast({
        title: "رصيد غير كاف",
        description: "لا يوجد لديك رصيد كاف للمراهنة",
        variant: "destructive"
      });
      return;
    }
    
    setIsSpinning(true);
    
    // تشغيل صوت الدوران
    if (spinAudioRef.current && !isMuted) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(e => console.error(e));
    }
    
    // محاكاة الدوران (هنا سنضيف لاحقاً منطق لعبة السلوت الحقيقي)
    setTimeout(() => {
      setIsSpinning(false);
      
      // محاكاة الفوز (50% احتمالية)
      const isWin = Math.random() > 0.5;
      
      if (isWin) {
        const winAmount = betAmount * (Math.floor(Math.random() * 5) + 1);
        
        // تشغيل صوت الفوز
        if (winAudioRef.current && !isMuted) {
          winAudioRef.current.currentTime = 0;
          winAudioRef.current.play().catch(e => console.error(e));
        }
        
        toast({
          title: "مبروك! 🎉",
          description: `لقد ربحت ${winAmount} رقاقة`,
          variant: "default"
        });
        
        // هنا يجب إرسال معلومات الفوز إلى الخادم وتحديث رصيد اللاعب
        // سنقوم بإضافة هذا المنطق لاحقاً
      }
    }, 3000);
  };
  
  // زيادة مبلغ الرهان
  const increaseBet = () => {
    if (isSpinning) return;
    setBetAmount(prev => Math.min(prev + 10, 200));
  };
  
  // تقليل مبلغ الرهان
  const decreaseBet = () => {
    if (isSpinning) return;
    setBetAmount(prev => Math.max(prev - 10, 10));
  };
  
  // دالة للعودة إلى القائمة الرئيسية
  const goToHome = () => {
    navigate('/');
  };
  
  // تبديل كتم الصوت
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // إذا لم تبدأ اللعبة بعد، اعرض شاشة البداية
  if (!isGameStarted) {
    return (
      <div 
        className="h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/egypt-queen/lobby-bg.jpg')" }}
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
      style={{ backgroundImage: "url('/images/egypt-queen/game-bg.jpg')" }}
    >
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
        <div className="bg-[#361F10]/90 border-4 border-[#D4AF37] rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm w-full max-w-3xl h-[400px] flex flex-col">
          {/* منطقة عرض البكرات (reels) - سنضيف المنطق اللازم لاحقاً */}
          <div className="flex-1 bg-[url('/images/egypt-queen/reels-bg.jpg')] bg-cover bg-center relative grid grid-cols-5 gap-1 p-2">
            {/* سيتم إضافة البكرات هنا بمنطق حقيقي لاحقاً */}
            <div className="bg-[#222]/80 rounded-md flex items-center justify-center">
              <span className="text-6xl">🐱</span>
            </div>
            <div className="bg-[#222]/80 rounded-md flex items-center justify-center">
              <span className="text-6xl">🪲</span>
            </div>
            <div className="bg-[#222]/80 rounded-md flex items-center justify-center">
              <span className="text-6xl">👑</span>
            </div>
            <div className="bg-[#222]/80 rounded-md flex items-center justify-center">
              <span className="text-6xl">🧿</span>
            </div>
            <div className="bg-[#222]/80 rounded-md flex items-center justify-center">
              <span className="text-6xl">📜</span>
            </div>
          </div>
          
          {/* لوحة التحكم */}
          <div className="bg-[#0C0907] p-4 border-t-2 border-[#D4AF37] flex items-center justify-between">
            {/* ضبط المراهنة */}
            <div className="flex items-center gap-2">
              <Button 
                className="h-12 w-12 rounded-full bg-[#D4AF37] text-black font-bold text-xl"
                onClick={decreaseBet}
                disabled={isSpinning || betAmount <= 10}
              >
                -
              </Button>
              
              <div className="bg-black/80 border border-[#D4AF37] px-4 py-2 rounded-md min-w-[100px] text-center">
                <span className="text-[#D4AF37] font-bold">{betAmount}</span>
              </div>
              
              <Button 
                className="h-12 w-12 rounded-full bg-[#D4AF37] text-black font-bold text-xl"
                onClick={increaseBet}
                disabled={isSpinning || betAmount >= 200}
              >
                +
              </Button>
            </div>
            
            {/* زر البدء */}
            <Button 
              className={`h-16 w-32 rounded-full ${isSpinning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#D4AF37] to-[#8B6914] hover:from-[#FFD700] hover:to-[#B8860B]'
              } text-white text-xl font-bold shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
              onClick={spin}
              disabled={isSpinning}
            >
              {isSpinning ? (
                <RotateCw className="h-6 w-6 animate-spin" />
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
      <audio ref={spinAudioRef} src="/audio/slot-spin.mp3"></audio>
      <audio ref={winAudioRef} src="/audio/win-sound.mp3"></audio>
    </div>
  );
}