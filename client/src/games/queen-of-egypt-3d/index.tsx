import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { gsap } from 'gsap';
import logoSvg from './assets/logo.svg';

// استيراد المكونات الجديدة
import GameLoader from './components/GameLoader';
import SoundSystem from './components/SoundSystem';
import CinematicIntro from './components/CinematicIntro';
import AnimatedCoinCounter from './components/AnimatedCoinCounter';
import ScrollBackground from './components/ScrollBackground';
import { SmartBalanceSystem, WinType } from './utils/smart-balance-system';

// نوع اللاعب
interface GameProps {
  onExit?: () => void;
}

/**
 * لعبة سلوتس "ملكة مصر" ثلاثية الأبعاد
 * نسخة محسّنة تماماً مع تأثيرات ثلاثية الأبعاد وتجربة لعب غامرة
 */
export default function QueenOfEgypt3D({ onExit }: GameProps) {
  // متغيرات الحالة
  const [loading, setLoading] = useState<boolean>(true);
  const [gameInitialized, setGameInitialized] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introCompleted, setIntroCompleted] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [playerBalance, setPlayerBalance] = useState<number>(1000);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winType, setWinType] = useState<WinType | null>(null);
  const [showScrollEffect, setShowScrollEffect] = useState<boolean>(false);

  // مراجع للعناصر
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const slotMachineRef = useRef<HTMLDivElement>(null);
  const reelsRef = useRef<HTMLDivElement>(null);
  
  // نظام التوازن الذكي
  const smartBalanceRef = useRef<SmartBalanceSystem>(new SmartBalanceSystem({
    playerBalance: 1000,
    balanceRatio: 0.97, // قيمة تسمح بتوازن جيد بين الفوز والخسارة
  }));
  
  // وصول إلى بيانات المستخدم وأدوات النظام
  const { user } = useAuth();
  const { toast } = useToast();

  // تهيئة اللعبة
  useEffect(() => {
    if (loading) {
      // محاكاة تحميل اللعبة
      const timer = setTimeout(() => {
        setLoading(false);
        
        toast({
          title: "تم تحميل اللعبة",
          description: "استمتع بتجربة سلوتس ملكة مصر ثلاثية الأبعاد!",
          variant: "default",
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, toast]);

  // تهيئة اللعبة بعد المقدمة
  useEffect(() => {
    if (introCompleted && !gameInitialized) {
      initializeGame();
    }
  }, [introCompleted, gameInitialized]);

  // اكتمال المقدمة
  const handleIntroComplete = useCallback(() => {
    setIntroCompleted(true);
    setShowIntro(false);
    
    // إظهار تأثير البردية بعد انتهاء المقدمة
    setTimeout(() => {
      setShowScrollEffect(true);
    }, 500);
  }, []);

  // تهيئة اللعبة
  const initializeGame = useCallback(() => {
    try {
      // فحص دعم WebGL
      const webGLTest = document.createElement('canvas');
      const isWebGLSupported = !!(window.WebGLRenderingContext && 
        (webGLTest.getContext('webgl') || webGLTest.getContext('experimental-webgl')));

      if (!isWebGLSupported) {
        toast({
          title: "تنبيه متصفح",
          description: "متصفحك لا يدعم تقنية WebGL اللازمة لتشغيل الألعاب ثلاثية الأبعاد. يرجى تحديث المتصفح أو تمكين WebGL.",
          variant: "destructive",
        });
        return;
      }

      // تهيئة نظام التوازن الذكي
      if (user) {
        // استخدام رصيد المستخدم الحقيقي إذا كان متاحًا
        smartBalanceRef.current.updateConfig({
          playerBalance: user.chips || 1000
        });
        setPlayerBalance(user.chips || 1000);
      }

      // وضع علامة على أن اللعبة تمت تهيئتها
      setGameInitialized(true);
      
      // تأخير لعرض واجهة اللعبة بتأثير انتقالي سلس
      setTimeout(() => {
        setGameStarted(true);
      }, 1000);
      
    } catch (error) {
      console.error("خطأ في تهيئة اللعبة:", error);
      toast({
        title: "خطأ في تحميل اللعبة",
        description: "حدث خطأ أثناء تهيئة اللعبة. يرجى تحديث الصفحة والمحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // معالجة زيادة قيمة الرهان
  const handleIncreaseBet = () => {
    if (isSpinning) return;
    
    // زيادة قيمة الرهان بمقدار 10
    const newBet = Math.min(betAmount + 10, playerBalance);
    setBetAmount(newBet);
  };

  // معالجة تقليل قيمة الرهان
  const handleDecreaseBet = () => {
    if (isSpinning) return;
    
    // تقليل قيمة الرهان بمقدار 10 (مع حد أدنى 10)
    const newBet = Math.max(10, betAmount - 10);
    setBetAmount(newBet);
  };

  // معالجة رهان الحد الأقصى
  const handleMaxBet = () => {
    if (isSpinning) return;
    
    // ضبط الرهان على الحد الأقصى (إما الرصيد الكامل أو 100)
    const maxBet = Math.min(playerBalance, 100);
    setBetAmount(maxBet);
  };

  // معالجة الدوران
  const handleSpin = useCallback(() => {
    if (isSpinning || betAmount > playerBalance) return;
    
    setIsSpinning(true);
    
    // تحديث الرصيد
    setPlayerBalance(prevBalance => prevBalance - betAmount);
    
    // استخدام نظام التوازن الذكي لتحديد النتيجة
    const result = smartBalanceRef.current.spin(betAmount);
    
    // تطبيق تأثير دوران البكرات
    if (reelsRef.current) {
      // تحريك البكرات
      gsap.to(reelsRef.current, {
        y: '-300%',
        duration: 2,
        ease: "power1.inOut",
        onComplete: () => {
          // عرض النتيجة بعد انتهاء الدوران
          showSpinResult(result.isWin, result.winAmount, result.winType);
          
          // إعادة البكرات إلى الوضع الأصلي بدون تأثير مرئي
          gsap.set(reelsRef.current, { y: 0 });
        }
      });
    } else {
      // في حالة عدم وجود عنصر البكرات، عرض النتيجة مباشرة بعد تأخير محاكي
      setTimeout(() => {
        showSpinResult(result.isWin, result.winAmount, result.winType);
      }, 2000);
    }
  }, [isSpinning, betAmount, playerBalance]);

  // عرض نتيجة الدوران
  const showSpinResult = (isWin: boolean, amount: number, winTypeResult: WinType | null) => {
    // تقديم ملاحظات صوتية/مرئية مختلفة بناءً على نوع الفوز
    if (isWin) {
      // تعيين قيمة الفوز ونوعه
      setWinAmount(amount);
      setWinType(winTypeResult);
      
      // تحديث الرصيد
      setPlayerBalance(prevBalance => prevBalance + amount);
      
      // إظهار إشعار الفوز
      const winMessage = getWinMessage(winTypeResult);
      toast({
        title: winMessage.title,
        description: `لقد ربحت ${amount} عملة!`,
        variant: "default",
      });
      
      // لاحقاً يمكن تحريك الماكينة عند الفوز الكبير
      if (winTypeResult === WinType.JACKPOT || winTypeResult === WinType.SUPER_MEGA_WIN) {
        // تأثير اهتزاز كبير للماكينة
        if (slotMachineRef.current) {
          gsap.fromTo(slotMachineRef.current, 
            { x: -5 },
            { 
              x: 5, 
              duration: 0.1, 
              repeat: 10,
              yoyo: true,
              ease: "rough",
              onComplete: () => { gsap.to(slotMachineRef.current, { x: 0 }); }
            }
          );
        }
        
        // صوت وتأثيرات إضافية للفوز الكبير
        // سيتم إضافة المزيد من التأثيرات هنا مستقبلاً
      }
      
    } else {
      // تصفير قيمة الفوز في حالة الخسارة
      setWinAmount(0);
      setWinType(null);
      
      // إظهار إشعار الخسارة (اختياري)
      /* 
      toast({
        title: "حظ أوفر في المرة القادمة",
        description: "استمر في المحاولة للفوز بجوائز قيمة!",
        variant: "default",
      });
      */
    }
    
    // إعادة تعيين حالة الدوران بعد تأخير قصير
    setTimeout(() => {
      setIsSpinning(false);
    }, 500);
  };

  // الحصول على رسائل مختلفة حسب نوع الفوز
  const getWinMessage = (winTypeResult: WinType | null) => {
    switch (winTypeResult) {
      case WinType.JACKPOT:
        return { title: "🌟 جاكبوت! 🌟", description: "لقد فزت بالجائزة الكبرى!" };
      case WinType.SUPER_MEGA_WIN:
        return { title: "🔥 فوز ضخم للغاية! 🔥", description: "مبروك على هذا الفوز الهائل!" };
      case WinType.MEGA_WIN:
        return { title: "✨ فوز ضخم! ✨", description: "رائع! لقد حققت فوزاً كبيراً!" };
      case WinType.BIG_WIN:
        return { title: "💰 فوز كبير! 💰", description: "تهانينا على هذا الفوز الكبير!" };
      case WinType.MEDIUM_WIN:
        return { title: "🎯 فوز جيد! 🎯", description: "تهانينا على هذا الفوز!" };
      default:
        return { title: "🎲 فوز! 🎲", description: "تهانينا على هذا الفوز!" };
    }
  };

  // معالجة العودة للقائمة الرئيسية
  const handleBackToMenu = () => {
    if (onExit) {
      onExit();
    } else {
      // انتقال افتراضي إلى الصفحة الرئيسية إذا لم يتم توفير onExit
      window.location.href = '/';
    }
  };

  // عرض شاشة التحميل
  if (loading) {
    return <GameLoader />;
  }

  // عرض المقدمة السينمائية
  if (showIntro) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div className="queen-of-egypt-3d-game relative w-full h-full overflow-hidden">
      {/* حاوية اللعبة الرئيسية */}
      <div 
        ref={gameContainerRef}
        className="w-full h-full"
      >
        {/* خلفية البردية المتحركة */}
        <ScrollBackground isRevealed={showScrollEffect}>
          {/* محتوى اللعبة داخل البردية */}
          <div className={`game-content w-full max-w-4xl mx-auto transition-opacity duration-1000 ${gameStarted ? 'opacity-100' : 'opacity-0'}`}>
            {/* عنوان اللعبة */}
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">ملكة مصر 3D</h1>
              <p className="text-lg text-yellow-200">تجربة سلوتس غامرة بتقنية ثلاثية الأبعاد</p>
            </div>
            
            {/* بطاقة معلومات اللاعب والرصيد */}
            <div className="player-info bg-black/40 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4 mb-6 flex justify-between items-center">
              <div className="player-info flex items-center">
                {/* صورة اللاعب */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 mr-3">
                  <img src={user?.avatar || logoSvg} alt="اللاعب" className="w-full h-full object-cover" />
                </div>
                
                {/* اسم اللاعب */}
                <div>
                  <p className="text-yellow-400 font-bold">{user?.username || "لاعب جديد"}</p>
                  <p className="text-sm text-yellow-200">مستوى: مبتدئ</p>
                </div>
              </div>
              
              {/* رصيد اللاعب */}
              <div className="balance">
                <AnimatedCoinCounter 
                  initialValue={playerBalance - winAmount} 
                  targetValue={playerBalance}
                  size="medium"
                  duration={1.5}
                />
              </div>
            </div>
            
            {/* آلة السلوتس */}
            <div
              ref={slotMachineRef}
              className="slot-machine bg-gradient-to-b from-yellow-900 to-yellow-800 rounded-xl border-4 border-yellow-600 shadow-2xl p-6 mb-6 relative overflow-hidden"
            >
              {/* إطار الماكينة العلوي */}
              <div className="slot-machine-header bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-800 -mt-6 -mx-6 p-4 mb-4 text-center relative">
                <h2 className="text-2xl font-bold text-white">ملكة مصر</h2>
                
                {/* زخارف مصرية */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8">
                  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25,10 L40,25 L25,40 L10,25 Z" fill="#FFF" opacity="0.6" />
                  </svg>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8">
                  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25,10 L40,25 L25,40 L10,25 Z" fill="#FFF" opacity="0.6" />
                  </svg>
                </div>
              </div>
              
              {/* شاشة الدوران والرموز */}
              <div className="slot-screen bg-black/60 rounded-lg p-3 mb-4 h-60 overflow-hidden relative">
                {/* نافذة عرض الرموز */}
                <div className="reel-window w-full h-full bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm rounded-lg relative overflow-hidden">
                  {/* البكرات والرموز */}
                  <div
                    ref={reelsRef}
                    className="reels flex justify-around w-full h-full items-center"
                  >
                    {/* رمز 1: تاج الملكة */}
                    <div className="reel-symbol w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                      <div className="symbol-crown w-full h-full bg-yellow-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 100 100">
                          <path
                            d="M50,20 L70,40 L90,25 L80,65 L20,65 L10,25 L30,40 Z"
                            fill="#FFD700"
                            stroke="#FFF"
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* رمز 2: القطة المصرية */}
                    <div className="reel-symbol w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                      <div className="symbol-cat w-full h-full bg-indigo-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 100 100">
                          <path
                            d="M30,75 L30,40 L70,40 L70,75 C60,85 40,85 30,75 Z"
                            fill="#8B5CF6"
                            stroke="#FFF"
                            strokeWidth="1"
                          />
                          <circle cx="40" cy="55" r="5" fill="#FFF" />
                          <circle cx="60" cy="55" r="5" fill="#FFF" />
                          <path
                            d="M30,40 L20,20 L35,35 M70,40 L80,20 L65,35"
                            fill="none"
                            stroke="#8B5CF6"
                            strokeWidth="3"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* رمز 3: صقر حورس */}
                    <div className="reel-symbol w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                      <div className="symbol-falcon w-full h-full bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 100 100">
                          <path
                            d="M50,20 C65,20 75,35 75,55 L60,70 L40,70 L25,55 C25,35 35,20 50,20 Z"
                            fill="#F59E0B"
                            stroke="#FFF"
                            strokeWidth="1"
                          />
                          <circle cx="40" cy="45" r="5" fill="#FFF" />
                          <circle cx="60" cy="45" r="5" fill="#FFF" />
                          <path
                            d="M45,60 L55,60"
                            stroke="#FFF"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* رمز 4: الإناء الفخاري */}
                    <div className="reel-symbol w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                      <div className="symbol-pottery w-full h-full bg-red-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 100 100">
                          <path
                            d="M40,30 C40,25 60,25 60,30 L65,70 C65,75 35,75 35,70 Z"
                            fill="#F87171"
                            stroke="#FFF"
                            strokeWidth="1"
                          />
                          <path
                            d="M45,40 L55,40 M42,50 L58,50 M40,60 L60,60"
                            stroke="#FFF"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        </svg>
                      </div>
                    </div>
                    
                    {/* رمز 5: الكوبرا */}
                    <div className="reel-symbol w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                      <div className="symbol-cobra w-full h-full bg-green-400/20 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12" viewBox="0 0 100 100">
                          <path
                            d="M50,20 C30,20 30,40 30,60 Q30,70 50,70 Q70,70 70,60 C70,40 70,20 50,20"
                            fill="#4ADE80"
                            stroke="#FFF"
                            strokeWidth="1"
                          />
                          <circle cx="40" cy="40" r="3" fill="#FFF" />
                          <circle cx="60" cy="40" r="3" fill="#FFF" />
                          <path
                            d="M45,50 L55,50"
                            stroke="#FFF"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* خط الفوز */}
                  <div className="win-line absolute top-1/2 left-0 right-0 h-1 bg-yellow-400/50 transform -translate-y-1/2 pointer-events-none"></div>
                  
                  {/* تأثير الفوز الكبير */}
                  {winType && (winType === WinType.JACKPOT || winType === WinType.SUPER_MEGA_WIN || winType === WinType.MEGA_WIN) && (
                    <div className="big-win-effect absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <h3 className="text-3xl font-bold text-yellow-400 animate-bounce">
                          {winType === WinType.JACKPOT ? 'جاكبوت!' : 
                            winType === WinType.SUPER_MEGA_WIN ? 'فوز ضخم للغاية!' : 'فوز ضخم!'}
                        </h3>
                      </div>
                      
                      {/* إضافة المزيد من التأثيرات هنا */}
                    </div>
                  )}
                </div>
              </div>
              
              {/* أزرار التحكم */}
              <div className="controls grid grid-cols-3 gap-3">
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={handleDecreaseBet}
                    disabled={isSpinning || betAmount <= 10}
                    className={`px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-md transition ${isSpinning || betAmount <= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    -
                  </button>
                  <button 
                    onClick={handleIncreaseBet}
                    disabled={isSpinning || betAmount >= playerBalance}
                    className={`px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-md transition ${isSpinning || betAmount >= playerBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    +
                  </button>
                </div>
                
                <div className="flex flex-col justify-center items-center">
                  <div className="bet-amount bg-black/60 rounded-lg p-2 mb-2 text-center">
                    <p className="text-yellow-200 text-sm">الرهان</p>
                    <p className="text-yellow-400 text-xl font-bold">{betAmount}</p>
                  </div>
                  <button 
                    onClick={handleMaxBet}
                    disabled={isSpinning}
                    className={`px-4 py-2 bg-yellow-800 hover:bg-yellow-700 text-white rounded-md transition ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    الحد الأقصى
                  </button>
                </div>
                
                <button 
                  onClick={handleSpin}
                  disabled={isSpinning || betAmount > playerBalance}
                  className={`px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition text-center flex items-center justify-center ${isSpinning || betAmount > playerBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSpinning ? (
                    <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    'دوران'
                  )}
                </button>
              </div>
            </div>
            
            {/* قائمة الجوائز (مختصرة) */}
            <div className="prize-table bg-black/40 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-4 mb-6">
              <h3 className="text-yellow-400 text-center mb-2">قائمة الجوائز</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-yellow-400">👑</span>
                  </div>
                  <span className="text-yellow-200">300</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-400/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-indigo-400">🐱</span>
                  </div>
                  <span className="text-yellow-200">200</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-amber-500">🦅</span>
                  </div>
                  <span className="text-yellow-200">150</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-red-400">🏺</span>
                  </div>
                  <span className="text-yellow-200">100</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-green-400">🐍</span>
                  </div>
                  <span className="text-yellow-200">50</span>
                </div>
              </div>
            </div>
            
            {/* زر العودة للقائمة */}
            <div className="text-center mb-4">
              <button 
                onClick={handleBackToMenu}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition"
              >
                العودة للقائمة
              </button>
            </div>
          </div>
        </ScrollBackground>
      </div>
      
      {/* نظام الصوت */}
      <SoundSystem muted={false} />
    </div>
  );
}