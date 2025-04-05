import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import '../lion-gazelle-animations.css';

export default function LionGazelleGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // رصيد الرهان واللاعب
  const [balance, setBalance] = useState(user?.chips || 10000);
  const [betAmount, setBetAmount] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [payout, setPayout] = useState(0);
  
  // مراجع للرسوم المتحركة
  const lionRef = useRef<HTMLDivElement>(null);
  const gazelleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // متغيرات لتتبع الموقع
  const [lionPosition, setLionPosition] = useState({ x: 50, y: 180 });
  const [gazellePosition, setGazellePosition] = useState({ x: 300, y: 180 });
  const [caughtGazelle, setCaughtGazelle] = useState(false);
  const [trackPosition, setTrackPosition] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  // وظيفة المراقبة التي تُبقي الأسد والغزالة في الرؤية دائمًا
  useEffect(() => {
    if (isRunning && trackRef.current && gameAreaRef.current) {
      // حساب موقع الغزالة المرئي
      const gazelleCenterX = gazellePosition.x - trackPosition;
      
      // تحريك المسار فقط إذا كانت الغزالة قريبة من الحدود
      const viewWidth = gameAreaRef.current.clientWidth;
      const bufferZone = viewWidth * 0.3; // منطقة 30% من الشاشة
      
      if (gazelleCenterX > viewWidth - bufferZone) {
        // إذا كانت الغزالة قريبة من الحافة اليمنى، نحرك المسار
        setTrackPosition(prev => prev + (gazelleCenterX - (viewWidth - bufferZone)) / 10);
      }
      
      // تطبيق التحويل على المسار
      trackRef.current.style.transform = `translateX(-${trackPosition}px)`;
    }
  }, [gazellePosition, isRunning, trackPosition]);
  
  // تحديث مضاعف الرهان والحركة
  useEffect(() => {
    if (isRunning && !gameEnded) {
      // تحديث المضاعف كل 100 مللي ثانية
      const multiplierInterval = setInterval(() => {
        setMultiplier(prev => {
          // زيادة المضاعف بمعدل متسارع مع مرور الوقت
          const newVal = prev + 0.01;
          return parseFloat(newVal.toFixed(2));
        });
      }, 100);

      // تحديث حركة الأسد والغزالة
      const moveInterval = setInterval(() => {
        // حركة الغزالة - تركض للأمام بسرعة
        setGazellePosition(prev => ({
          ...prev,
          x: prev.x + 5
        }));
        
        // حركة الأسد - يلاحق الغزالة ويقترب منها تدريجيًا
        setLionPosition(prev => {
          const distanceToGazelle = gazellePosition.x - prev.x;
          const speedFactor = Math.min(4.0, 1.0 + multiplier / 10); // يزداد أسرع مع تقدم اللعبة
          
          return {
            ...prev,
            x: prev.x + Math.min(distanceToGazelle * 0.03, 4) * speedFactor
          };
        });
        
        // فحص ما إذا تم اصطياد الغزالة (الأسد أقرب من مسافة معينة)
        if (gazellePosition.x - lionPosition.x < 30 && !caughtGazelle) {
          setCaughtGazelle(true);
          endGame(false);
        }
      }, 50);
      
      intervalRef.current = moveInterval as unknown as number;
      
      return () => {
        clearInterval(multiplierInterval);
        clearInterval(moveInterval);
      };
    }
  }, [isRunning, gameEnded, multiplier, gazellePosition.x, lionPosition.x, caughtGazelle]);
  
  // وظيفة بدء اللعبة
  const startGame = () => {
    if (betAmount <= 0) {
      toast({
        title: "خطأ في الرهان",
        description: "يرجى إدخال مبلغ رهان صالح",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount > balance) {
      toast({
        title: "رصيد غير كافي",
        description: "مبلغ الرهان يتجاوز رصيدك الحالي",
        variant: "destructive",
      });
      return;
    }
    
    // خصم مبلغ الرهان من الرصيد
    setBalance(prev => prev - betAmount);
    
    // إعادة تعيين اللعبة
    setMultiplier(1.0);
    setIsRunning(true);
    setGameEnded(false);
    setCaughtGazelle(false);
    setPayout(0);
    
    // إعادة تعيين المواقع
    setLionPosition({ x: 50, y: 180 });
    setGazellePosition({ x: 300, y: 180 });
    setTrackPosition(0);
    
    // تطبيق الرسوم المتحركة
    if (lionRef.current && gazelleRef.current) {
      lionRef.current.style.animation = 'lion-run 0.8s infinite';
      gazelleRef.current.style.animation = 'gazelle-run 0.5s infinite';
    }
  };
  
  // وظيفة إنهاء اللعبة
  const endGame = (userCashedOut = true) => {
    setIsRunning(false);
    setGameEnded(true);
    
    // إيقاف الرسوم المتحركة
    if (lionRef.current && gazelleRef.current) {
      if (caughtGazelle || !userCashedOut) {
        // الأسد أمسك بالغزالة
        lionRef.current.style.animation = 'none';
        gazelleRef.current.style.animation = 'none';
      } else {
        // الغزالة نجت
        lionRef.current.style.animation = 'none';
        gazelleRef.current.style.animation = 'none';
      }
    }
    
    if (userCashedOut) {
      // اللاعب نجح في الخروج قبل أن يمسك الأسد بالغزالة
      const winAmount = Math.floor(betAmount * multiplier);
      setPayout(winAmount);
      setBalance(prev => prev + winAmount);
      
      toast({
        title: "مبروك!",
        description: `ربحت ${winAmount} رقاقة بمضاعف ${multiplier}x`,
        variant: "default",
      });
    } else {
      // الأسد أمسك بالغزالة قبل أن يخرج اللاعب
      toast({
        title: "للأسف!",
        description: "لقد أمسك الأسد بالغزالة، جرب مرة أخرى!",
        variant: "destructive",
      });
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  // الخروج بأمان وتحصيل الأرباح
  const cashOut = () => {
    if (isRunning && !gameEnded) {
      endGame(true);
    }
  };
  
  // التنقل إلى اللوبي الرئيسي
  const goToLobby = () => {
    navigate('/');
  };
  
  return (
    <div className="h-screen bg-[#D2B48C] flex flex-col">
      {/* شريط الرأس */}
      <header className="bg-[#8B4513] p-4 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">الأسد والغزالة</h1>
          <Button 
            onClick={goToLobby}
            variant="default"
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
          >
            العودة للوبي
          </Button>
        </div>
      </header>
      
      {/* منطقة اللعب */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* منطقة اللعب */}
        <div className="flex-1 relative overflow-hidden" ref={gameAreaRef}>
          {/* المناظر الطبيعية - السماء والجبال والعشب */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA]"></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-[#8B4513]/20"></div>
          <div className="absolute left-0 bottom-0 w-full h-80 bg-[#8D6E63]/20"></div>
          <div className="absolute left-0 bottom-0 w-full h-40 bg-[#90A959]"></div>
          
          {/* شمس */}
          <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-[#FFD700] opacity-80 blur-sm"></div>
          
          {/* الجبال في الخلفية */}
          <div className="absolute bottom-40 left-0 w-full h-60">
            <div className="absolute left-10 bottom-0 w-60 h-40 bg-[#8D6E63] rounded-tr-[100px] rounded-tl-[30px] opacity-70"></div>
            <div className="absolute left-60 bottom-0 w-80 h-60 bg-[#795548] rounded-tr-[50px] rounded-tl-[100px] opacity-70"></div>
            <div className="absolute left-130 bottom-0 w-70 h-30 bg-[#8D6E63] rounded-tr-[70px] rounded-tl-[40px] opacity-70"></div>
          </div>
          
          {/* المسار مع الأسد والغزالة */}
          <div className="absolute bottom-0 left-0 w-[10000px] h-40" ref={trackRef}>
            {/* الأسد */}
            <div 
              ref={lionRef}
              className="absolute"
              style={{
                left: `${lionPosition.x}px`,
                top: `${lionPosition.y}px`,
                width: '80px',
                height: '60px',
                backgroundColor: '#C19A6B',
                borderRadius: '40% 30% 30% 40%',
                transform: 'scaleX(-1)', // لجعله يواجه اليمين
                zIndex: 10
              }}
            >
              {/* رأس الأسد */}
              <div style={{
                position: 'absolute',
                right: '-15px',
                top: '-15px',
                width: '40px',
                height: '35px',
                backgroundColor: '#C19A6B',
                borderRadius: '50% 50% 50% 50%'
              }}>
                {/* العين */}
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'black',
                  borderRadius: '50%'
                }}></div>
              </div>
              
              {/* الليفة */}
              <div style={{
                position: 'absolute',
                right: '-10px',
                top: '-20px',
                width: '50px',
                height: '20px',
                backgroundColor: '#D2B48C',
                borderRadius: '50% 50% 0 0'
              }}></div>
              
              {/* الأرجل */}
              <div style={{
                position: 'absolute',
                left: '10px',
                bottom: '-15px',
                width: '15px',
                height: '20px',
                backgroundColor: '#C19A6B',
                borderRadius: '0 0 5px 5px'
              }}></div>
              <div style={{
                position: 'absolute',
                right: '10px',
                bottom: '-15px',
                width: '15px',
                height: '20px',
                backgroundColor: '#C19A6B',
                borderRadius: '0 0 5px 5px'
              }}></div>
              
              {/* الذيل */}
              <div style={{
                position: 'absolute',
                left: '-15px',
                top: '0px',
                width: '30px',
                height: '10px',
                backgroundColor: '#C19A6B',
                borderRadius: '5px 0 0 5px',
                transform: 'rotate(-20deg)'
              }}></div>
            </div>
            
            {/* غبار الأسد */}
            <div className="absolute" style={{
              left: `${lionPosition.x - 20}px`,
              top: `${lionPosition.y + 40}px`,
              width: '40px',
              height: '20px',
              opacity: isRunning ? 0.6 : 0,
              transition: 'opacity 0.3s'
            }}>
              <div className="dust-particle" style={{ left: '5px', top: '5px', animationDelay: '0s' }}></div>
              <div className="dust-particle" style={{ left: '15px', top: '10px', animationDelay: '0.2s' }}></div>
              <div className="dust-particle" style={{ left: '25px', top: '5px', animationDelay: '0.4s' }}></div>
            </div>
            
            {/* الغزالة */}
            <div 
              ref={gazelleRef}
              className="absolute"
              style={{
                left: `${gazellePosition.x}px`,
                top: `${gazellePosition.y}px`,
                width: '70px',
                height: '50px',
                backgroundColor: '#D2B48C',
                borderRadius: '30% 40% 40% 30%',
                transform: 'scaleX(-1)', // لجعله يواجه اليمين
                zIndex: 10
              }}
            >
              {/* رأس الغزالة */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                top: '-15px',
                width: '35px',
                height: '30px',
                backgroundColor: '#D2B48C',
                borderRadius: '50% 50% 50% 50%'
              }}>
                {/* العين */}
                <div style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'black',
                  borderRadius: '50%'
                }}></div>
                
                {/* القرون */}
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '-15px',
                  width: '5px',
                  height: '20px',
                  backgroundColor: '#8B4513',
                  transform: 'rotate(-10deg)',
                  borderRadius: '5px'
                }}></div>
                <div style={{
                  position: 'absolute',
                  right: '25px',
                  top: '-18px',
                  width: '5px',
                  height: '25px',
                  backgroundColor: '#8B4513',
                  borderRadius: '5px'
                }}></div>
              </div>
              
              {/* الأرجل */}
              <div style={{
                position: 'absolute',
                left: '10px',
                bottom: '-15px',
                width: '10px',
                height: '20px',
                backgroundColor: '#D2B48C',
                borderRadius: '0 0 5px 5px'
              }}></div>
              <div style={{
                position: 'absolute',
                right: '10px',
                bottom: '-15px',
                width: '10px',
                height: '20px',
                backgroundColor: '#D2B48C',
                borderRadius: '0 0 5px 5px'
              }}></div>
              
              {/* الذيل */}
              <div style={{
                position: 'absolute',
                left: '-10px',
                top: '10px',
                width: '20px',
                height: '8px',
                backgroundColor: '#D2B48C',
                borderRadius: '5px 0 0 5px',
                transform: 'rotate(20deg)'
              }}></div>
            </div>
            
            {/* غبار الغزالة */}
            <div className="absolute" style={{
              left: `${gazellePosition.x - 20}px`,
              top: `${gazellePosition.y + 40}px`,
              width: '40px',
              height: '20px',
              opacity: isRunning ? 0.6 : 0,
              transition: 'opacity 0.3s'
            }}>
              <div className="dust-particle" style={{ left: '5px', top: '5px', animationDelay: '0s' }}></div>
              <div className="dust-particle" style={{ left: '15px', top: '8px', animationDelay: '0.1s' }}></div>
              <div className="dust-particle" style={{ left: '25px', top: '5px', animationDelay: '0.2s' }}></div>
              <div className="dust-particle" style={{ left: '10px', top: '10px', animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>
        
        {/* لوحة التحكم */}
        <div className="w-full md:w-72 bg-[#795548] text-white p-4 shadow-inner flex flex-col gap-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold mb-2">لوحة التحكم</h2>
            <div className="text-4xl font-bold mb-2">{multiplier.toFixed(2)}×</div>
            <div className="text-lg">الرصيد: {balance}</div>
          </div>
          
          {!isRunning && !gameEnded && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block mb-2 text-sm">مبلغ الرهان</label>
                <input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded text-black"
                />
              </div>
              
              <Button
                onClick={startGame}
                className="bg-[#D4AF37] hover:bg-[#B8860B] text-black"
              >
                بدء المطاردة!
              </Button>
            </div>
          )}
          
          {isRunning && !gameEnded && (
            <Button
              onClick={cashOut}
              className="bg-green-600 hover:bg-green-700 text-white mt-4 text-lg py-6"
            >
              اسحب الآن! ({Math.floor(betAmount * multiplier)})
            </Button>
          )}
          
          {gameEnded && (
            <div className="text-center">
              {payout > 0 ? (
                <div className="bg-green-800 p-4 rounded-lg mb-4">
                  <p className="text-xl font-bold">مبروك!</p>
                  <p className="text-3xl font-bold text-[#D4AF37]">+{payout}</p>
                </div>
              ) : (
                <div className="bg-red-800 p-4 rounded-lg mb-4">
                  <p className="text-xl font-bold">للأسف</p>
                  <p className="text-3xl font-bold">لقد خسرت</p>
                </div>
              )}
              
              <Button
                onClick={() => {setGameEnded(false); setBetAmount(0);}}
                className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black"
              >
                لعبة جديدة
              </Button>
            </div>
          )}
          
          <div className="mt-auto">
            <h3 className="font-bold mb-2">قواعد اللعبة:</h3>
            <ul className="text-sm list-disc list-inside">
              <li>قم بوضع رهانك قبل بدء المطاردة</li>
              <li>يزداد المضاعف تدريجياً مع الوقت</li>
              <li>اسحب قبل أن يمسك الأسد بالغزالة</li>
              <li>إذا أمسك الأسد بالغزالة قبل أن تسحب، تخسر رهانك</li>
              <li>كلما انتظرت أكثر، زادت أرباحك المحتملة ولكن أيضاً زادت المخاطرة!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}