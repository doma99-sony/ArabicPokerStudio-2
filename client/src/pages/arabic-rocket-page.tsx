import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Rocket, TrendingUp, Clock, Users, BarChart3, ChevronRight, DollarSign, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ChatBox from "../components/chat-box";

const ArabicRocketPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // حالة اللعبة
  const [isGameActive, setIsGameActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
  const [maxMultiplier, setMaxMultiplier] = useState(0); // نقطة الانفجار
  const [betAmount, setBetAmount] = useState(100);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [autoCashoutValue, setAutoCashoutValue] = useState(1.5);
  const [hasBet, setHasBet] = useState(false);
  const [hasWithdrawn, setHasWithdrawn] = useState(false);
  const [potentialWin, setPotentialWin] = useState(0);
  const [exploded, setExploded] = useState(false);
  
  // بيانات اللاعبين
  const [activePlayers, setActivePlayers] = useState<Array<{
    id: number;
    username: string;
    betAmount: number;
    cashoutMultiplier: number | null;
    profit: number | null;
  }>>([]);
  
  // تاريخ الجولات السابقة
  const [previousGames, setPreviousGames] = useState<Array<number>>([
    1.52, 3.87, 1.24, 7.65, 2.03, 1.18, 4.36, 2.89, 1.01, 3.44
  ]);
  
  // المراجع للرسومات المتحركة
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // هنا نقوم بتنفيذ الاتصال بالسيرفر وإدارة WebSocket في الحالة النهائية
  useEffect(() => {
    // محاكاة الاتصال بالسيرفر (سيتم استبداله بـ WebSocket حقيقي)
    const connectToGame = () => {
      console.log("الاتصال بلعبة الصاروخ العرباوي...");
      startGameCycle();
    };
    
    connectToGame();
    
    // إزالة الاتصال عند الخروج من الصفحة
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      console.log("قطع الاتصال باللعبة");
    };
  }, []);
  
  // وظيفة بدء دورة اللعبة
  const startGameCycle = () => {
    // إعادة تعيين الحالة
    setExploded(false);
    setIsGameActive(false);
    setCurrentMultiplier(1.00);
    setHasBet(false);
    setHasWithdrawn(false);
    
    // محاكاة قيمة الانفجار المستلمة من السيرفر
    setMaxMultiplier(generateRandomCrashPoint());
    
    // بدء العد التنازلي للجولة التالية (5 ثوانٍ)
    let count = 5;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        startGame();
      }
    }, 1000);
  };
  
  // توليد نقطة انفجار عشوائية (في الإنتاج، هذا سيأتي من السيرفر)
  const generateRandomCrashPoint = (): number => {
    // استخدام نظام محسّن متعدد الطبقات للتوزيع
    // نظام متقدم يشبه نظام ألعاب Crash الحقيقية
    
    let crashPoint: number;
    const randomValue = Math.random();
    
    // احتمالية الانفجار المبكر (أقل من 1.5x): 35%
    if (randomValue < 0.35) {
      // انفجار مبكر بين 1.01 و 1.5
      crashPoint = 1.01 + (Math.random() * 0.49);
    }
    // احتمالية قيم متوسطة (بين 1.5x و 3x): 40%
    else if (randomValue < 0.62) { // 0.35 + (0.65 * 0.4) ≈ 0.62
      // قيم متوسطة بين 1.5 و 3.0
      crashPoint = 1.5 + (Math.random() * 1.5);
    }
    // احتمالية قيم مرتفعة (بين 3x و 10x): 20%
    else if (randomValue < 0.85) { // 0.62 + (0.38 * 0.6) ≈ 0.85
      // قيم مرتفعة بين 3.0 و 10.0
      crashPoint = 3.0 + (Math.random() * 7.0);
    }
    // احتمالية قيم عالية جداً (> 10x): 5%
    else {
      // استخدام معادلة للتوزيع الأسي للقيم العالية جداً
      const highValue = 10.0 + (-Math.log(Math.random()) * 5.0);
      
      // تحديد حد أقصى منطقي (50x) مع احتمالية ضئيلة لتجاوزه
      crashPoint = Math.min(highValue, Math.random() < 0.01 ? 100 : 50);
    }
    
    // تقريب النتيجة إلى رقمين عشريين وإرجاعها كرقم
    return Math.round(crashPoint * 100) / 100;
  };
  
  // وظيفة بدء اللعبة
  const startGame = () => {
    setIsGameActive(true);
    
    // اضافة لاعبين افتراضيين
    setActivePlayers([
      { id: 1, username: "لاعب_عرباوي", betAmount: 250, cashoutMultiplier: null, profit: null },
      { id: 2, username: "صقر_الصحراء", betAmount: 500, cashoutMultiplier: null, profit: null },
      { id: 3, username: "نجم_الليل", betAmount: 1000, cashoutMultiplier: null, profit: null }
    ]);
    
    // بدء الرسم المتحرك
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // تنظيف الكانفاس
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        animate(1.00);
      }
    }
  };
  
  // وظيفة الرسم المتحرك للصاروخ
  const animate = (multiplier: number) => {
    if (multiplier >= maxMultiplier) {
      // الصاروخ انفجر
      setExploded(true);
      setIsGameActive(false);
      
      // تحديث اللاعبين الذين لم ينسحبوا (خسروا)
      setActivePlayers(prev => prev.map(player => {
        if (player.cashoutMultiplier === null) {
          return { ...player, profit: -player.betAmount };
        }
        return player;
      }));
      
      // إضافة النتيجة إلى تاريخ الجولات
      setPreviousGames(prev => [maxMultiplier, ...prev.slice(0, 9)]);
      
      // اضافة تأخير قبل بدء جولة جديدة
      setTimeout(() => {
        startGameCycle();
      }, 3000);
      
      return;
    }
    
    setCurrentMultiplier(parseFloat(multiplier.toFixed(2)));
    setPotentialWin(hasBet && !hasWithdrawn ? betAmount * multiplier : 0);
    
    // التحقق من الانسحاب التلقائي
    if (isAutoCashoutEnabled && hasBet && !hasWithdrawn && multiplier >= autoCashoutValue) {
      handleWithdraw();
    }
    
    // محاكاة انسحاب اللاعبين الافتراضيين
    // تعديل احتمالية انسحاب اللاعبين الافتراضيين بناءً على قيمة المضاعف الحالية
    // كلما زاد المضاعف، زادت احتمالية الانسحاب
    const withdrawalProbability = Math.min(0.03 + (multiplier - 1) * 0.015, 0.2);
    
    if (Math.random() < withdrawalProbability) {
      setActivePlayers(prev => {
        const updatedPlayers = [...prev];
        const notCashedOutPlayers = updatedPlayers.filter(p => p.cashoutMultiplier === null && p.id !== user?.id);
        
        if (notCashedOutPlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * notCashedOutPlayers.length);
          const playerIndex = updatedPlayers.findIndex(p => p.id === notCashedOutPlayers[randomIndex].id);
          
          if (playerIndex !== -1) {
            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              cashoutMultiplier: multiplier,
              profit: Math.floor(updatedPlayers[playerIndex].betAmount * multiplier) - updatedPlayers[playerIndex].betAmount
            };
          }
        }
        
        return updatedPlayers;
      });
    }
    
    // رسم الصاروخ والخلفية
    drawRocket(multiplier);
    
    // تعديل سرعة الزيادة للمضاعف للإطار التالي
    // في البداية تكون الزيادة أسرع، ثم تبطئ مع زيادة المضاعف
    // هذا يجعل اللعبة أكثر إثارة وتوقعاً
    let incrementFactor = 0.01;
    
    if (multiplier > 5) {
      // تقليل السرعة تدريجياً بعد المضاعف 5x
      incrementFactor = 0.008;
    }
    if (multiplier > 10) {
      // تقليل السرعة أكثر بعد المضاعف 10x
      incrementFactor = 0.006;
    }
    if (multiplier > 20) {
      // تقليل السرعة أكثر بعد المضاعف 20x
      incrementFactor = 0.004;
    }
    if (multiplier > 50) {
      // تقليل السرعة بشكل كبير بعد المضاعف 50x
      incrementFactor = 0.002;
    }
    
    const nextMultiplier = multiplier + (multiplier * incrementFactor);
    
    // استمرار حلقة الرسم
    animationRef.current = requestAnimationFrame(() => animate(nextMultiplier));
  };
  
  // وظيفة رسم الصاروخ والخلفية
  const drawRocket = (multiplier: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الخلفية (تم تغيير الألوان لتكون أكثر وضوحاً)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#0F2040"); // لون أزرق داكن جديد للجزء العلوي
    gradient.addColorStop(1, "#1E3050"); // لون أزرق متوسط جديد للجزء السفلي
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إضافة نجوم في الخلفية
    drawStars(ctx, canvas.width, canvas.height);
    
    if (exploded) {
      // رسم الانفجار
      drawExplosion(ctx, canvas.width / 2, canvas.height / 2, 50 + Math.random() * 30);
    } else {
      // حساب موقع الصاروخ (يتحرك من الأسفل إلى الأعلى)
      const progress = Math.min((multiplier - 1) / 4, 1); // نسبة التقدم (1x - 5x)
      const yPosition = canvas.height - (progress * (canvas.height - 100));
      
      // رسم دخان الصاروخ
      drawRocketSmoke(ctx, canvas.width / 2, yPosition + 40);
      
      // رسم الصاروخ
      drawRocketShape(ctx, canvas.width / 2, yPosition);
    }
    
    // عرض المضاعف الحالي
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    if (exploded) {
      ctx.fillStyle = 'red';
      ctx.fillText(`انفجر عند ${maxMultiplier.toFixed(2)}x!`, canvas.width / 2, 40);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillText(`${multiplier.toFixed(2)}x`, canvas.width / 2, 40);
    }
  };
  
  // رسم شكل الصاروخ
  const drawRocketShape = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // جسم الصاروخ
    ctx.fillStyle = '#E63946'; // أحمر
    ctx.beginPath();
    ctx.moveTo(x, y - 30); // رأس الصاروخ
    ctx.lineTo(x + 20, y + 20); // الجانب الأيمن
    ctx.lineTo(x - 20, y + 20); // الجانب الأيسر
    ctx.closePath();
    ctx.fill();
    
    // جسم الصاروخ (الأسطوانة)
    ctx.fillStyle = '#F1FAEE'; // أبيض مصفر
    ctx.beginPath();
    ctx.rect(x - 10, y + 20, 20, 40);
    ctx.fill();
    
    // النافذة
    ctx.fillStyle = '#A8DADC'; // أزرق فاتح
    ctx.beginPath();
    ctx.arc(x, y + 30, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // الزعانف
    ctx.fillStyle = '#1D3557'; // أزرق داكن
    // الزعنفة اليسرى
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 40);
    ctx.lineTo(x - 25, y + 60);
    ctx.lineTo(x - 10, y + 60);
    ctx.closePath();
    ctx.fill();
    
    // الزعنفة اليمنى
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 40);
    ctx.lineTo(x + 25, y + 60);
    ctx.lineTo(x + 10, y + 60);
    ctx.closePath();
    ctx.fill();
    
    // قاعدة الصاروخ
    ctx.fillStyle = '#457B9D'; // أزرق متوسط
    ctx.beginPath();
    ctx.rect(x - 15, y + 60, 30, 5);
    ctx.fill();
  };
  
  // رسم دخان الصاروخ
  const drawRocketSmoke = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const particles = 10;
    
    for (let i = 0; i < particles; i++) {
      const size = Math.random() * 15 + 5;
      const xOffset = (Math.random() - 0.5) * 20;
      const yOffset = Math.random() * 30 + 10;
      
      ctx.fillStyle = `rgba(255, 165, 0, ${Math.random() * 0.5 + 0.2})`; // برتقالي (النار)
      ctx.beginPath();
      ctx.arc(x + xOffset, y + yOffset, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    for (let i = 0; i < particles / 2; i++) {
      const size = Math.random() * 10 + 3;
      const xOffset = (Math.random() - 0.5) * 30;
      const yOffset = Math.random() * 40 + 30;
      
      ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.3 + 0.1})`; // رمادي (الدخان)
      ctx.beginPath();
      ctx.arc(x + xOffset, y + yOffset, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // رسم النجوم في الخلفية
  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.8 + 0.2;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // رسم الانفجار
  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    const particleCount = 30;
    const colors = ['#FF5733', '#FFC300', '#FF3333', '#FFBE33', '#FFEA00'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      const size = Math.random() * 15 + 5;
      
      const colorIndex = Math.floor(Math.random() * colors.length);
      ctx.fillStyle = colors[colorIndex];
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // وظيفة وضع الرهان
  const handlePlaceBet = () => {
    if (!isGameActive) {
      toast({
        title: "انتظر بدء الجولة التالية",
        description: "الجولة التالية ستبدأ قريباً",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "مبلغ الرهان غير صالح",
        description: "يجب أن يكون مبلغ الرهان أكبر من الصفر",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || user.chips < betAmount) {
      toast({
        title: "رصيد غير كافٍ",
        description: "لا يوجد لديك رصيد كافٍ لوضع هذا الرهان",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // تحديث الواجهة أولاً للاستجابة الفورية
      // إضافة اللاعب إلى القائمة
      setActivePlayers(prev => [
        ...prev,
        { id: user.id, username: user.username, betAmount: betAmount, cashoutMultiplier: null, profit: null }
      ]);
      
      setHasBet(true);
      
      // تشغيل صوت رهان
      const audio = new Audio();
      audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3";
      audio.volume = 0.5;
      audio.play().catch(error => console.log("خطأ في تشغيل صوت الرهان:", error));
      
      // في النسخة النهائية، سنرسل هذا إلى الخادم أيضاً
      // قم بوضع الكود هنا لإرسال المراهنة إلى الخادم
      
      toast({
        title: "تم وضع الرهان",
        description: `رهانك: ${betAmount} رقاقة`,
      });
    } catch (error) {
      console.error("خطأ في وضع الرهان:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من وضع الرهان، حاول مرة أخرى",
        variant: "destructive"
      });
      
      // استعادة الحالة في حالة الخطأ
      setHasBet(false);
      setActivePlayers(prev => prev.filter(player => player.id !== user?.id));
    }
  };
  
  // وظيفة سحب الأرباح
  const handleWithdraw = () => {
    if (!isGameActive || !hasBet || hasWithdrawn) {
      return;
    }
    
    try {
      // حساب المبلغ الذي سيربحه اللاعب
      const winAmount = Math.floor(betAmount * currentMultiplier);
      const profit = winAmount - betAmount;
      
      // تحديث حالة اللاعب في الواجهة أولاً للاستجابة الفورية
      setActivePlayers(prev => prev.map(player => {
        if (player.id === user?.id) {
          return { ...player, cashoutMultiplier: currentMultiplier, profit: profit };
        }
        return player;
      }));
      
      // تعيين حالة اللاعب بأنه قام بالسحب
      setHasWithdrawn(true);
      
      // تشغيل صوت النجاح
      const audio = new Audio();
      audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-fantasy-game-success-notification-270.mp3";
      audio.volume = 0.5;
      audio.play().catch(error => console.log("خطأ في تشغيل صوت السحب:", error));
      
      // في النسخة النهائية، سنرسل هذا إلى الخادم أيضاً
      // قم بوضع الكود هنا لإرسال السحب إلى الخادم
      
      toast({
        title: "تم السحب بنجاح!",
        description: `ربحت ${winAmount} رقاقة (بربح ${profit} رقاقة)`,
        variant: currentMultiplier > 2 ? "default" : "default" // يمكن استخدام أنواع مختلفة بناءً على المضاعف
      });
    } catch (error) {
      console.error("خطأ في سحب الأرباح:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من سحب أرباحك، حاول مرة أخرى",
        variant: "destructive"
      });
      
      // لا نقوم باستعادة الحالة هنا لأن اللاعب ربما قد سحب بالفعل قبل حدوث الخطأ
    }
  };
  
  return (
    <div className="h-screen w-full flex flex-col bg-[#0F172A] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1E293B] text-white p-4 flex justify-between items-center border-b border-[#334155] shadow-md">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center">
            <Rocket className="h-7 w-7 text-yellow-500 mr-2 animate-pulse" />
            <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">🚀 صاروخ عرباوي 🚀</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#334155] p-1 px-3 rounded-full">
            <div className="bg-yellow-500 p-1 rounded-full">
              <DollarSign size={14} className="text-[#1E293B]" />
            </div>
            <span className="font-bold">{user?.chips || 0}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" className="bg-[#334155] text-white hover:bg-[#475569]">
              <Award className="h-4 w-4 mr-2" />
              <span>المكافآت</span>
            </Button>
            
            <Button variant="ghost" className="bg-[#334155] text-white hover:bg-[#475569]">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>الإحصائيات</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Game Section */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          {/* Top Section - Game Canvas & Controls */}
          <Card className="bg-[#1E293B] border-[#334155] mb-4 overflow-hidden">
            <div className="relative">
              {/* الكانفاس */}
              <canvas 
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-[400px] bg-[#0A0A20]"
              ></canvas>
              
              {/* Overlay for countdown */}
              {!isGameActive && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">
                      {exploded ? (
                        <div className="text-red-500 animate-pulse">انفجر!</div>
                      ) : (
                        countdown
                      )}
                    </div>
                    <div className="text-lg text-gray-300">
                      {exploded ? "انتظر الجولة التالية..." : "الجولة التالية تبدأ قريباً"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls Section */}
            <div className="p-4 bg-[#1E293B] border-t border-[#334155]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bet Input Section */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">مبلغ الرهان:</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                      className="bg-[#0F172A] border-[#334155] text-white"
                      disabled={hasBet || !isGameActive}
                    />
                    <Button
                      variant="outline"
                      className="border-[#334155] text-white hover:bg-[#334155]"
                      onClick={() => setBetAmount(prevAmount => Math.max(1, prevAmount / 2))}
                      disabled={hasBet || !isGameActive}
                    >
                      1/2
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#334155] text-white hover:bg-[#334155]"
                      onClick={() => setBetAmount(prevAmount => prevAmount * 2)}
                      disabled={hasBet || !isGameActive}
                    >
                      2×
                    </Button>
                  </div>
                </div>
                
                {/* Auto Cashout Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-cashout" className="text-sm text-gray-300">سحب تلقائي:</Label>
                    <Switch
                      id="auto-cashout"
                      checked={isAutoCashoutEnabled}
                      onCheckedChange={setIsAutoCashoutEnabled}
                      disabled={hasBet || !isGameActive}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1.01}
                      step={0.01}
                      value={autoCashoutValue}
                      onChange={(e) => setAutoCashoutValue(parseFloat(e.target.value) || 1.01)}
                      className="bg-[#0F172A] border-[#334155] text-white"
                      disabled={!isAutoCashoutEnabled || hasBet || !isGameActive}
                    />
                    <span className="flex items-center text-white">×</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 justify-end">
                  {!hasBet ? (
                    <Button
                      className="bg-green-600 text-white hover:bg-green-700 h-full"
                      disabled={!isGameActive || hasBet}
                      onClick={handlePlaceBet}
                    >
                      راهن الآن
                    </Button>
                  ) : (
                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 h-full"
                      disabled={!isGameActive || hasWithdrawn || !hasBet}
                      onClick={handleWithdraw}
                    >
                      <div className="flex flex-col items-center">
                        <span>اسحب الآن</span>
                        <span className="text-lg font-bold">{potentialWin.toFixed(0)}</span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Bar */}
            <div className="p-4 pt-0">
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#0F172A] p-3 rounded-lg">
                  <div className="text-gray-400 flex items-center gap-1 mb-1">
                    <TrendingUp size={14} />
                    <span>أعلى مضاعف اليوم</span>
                  </div>
                  <div className="text-xl font-bold text-white">7.65×</div>
                </div>
                
                <div className="bg-[#0F172A] p-3 rounded-lg">
                  <div className="text-gray-400 flex items-center gap-1 mb-1">
                    <Clock size={14} />
                    <span>متوسط الانفجار</span>
                  </div>
                  <div className="text-xl font-bold text-white">2.87×</div>
                </div>
                
                <div className="bg-[#0F172A] p-3 rounded-lg">
                  <div className="text-gray-400 flex items-center gap-1 mb-1">
                    <Users size={14} />
                    <span>عدد اللاعبين</span>
                  </div>
                  <div className="text-xl font-bold text-white">{activePlayers.length}</div>
                </div>
                
                <div className="bg-[#0F172A] p-3 rounded-lg">
                  <div className="text-gray-400 flex items-center gap-1 mb-1">
                    <DollarSign size={14} />
                    <span>إجمالي الرهانات</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {activePlayers.reduce((sum, player) => sum + player.betAmount, 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Bottom Section - History & Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Last Results */}
            <Card className="bg-[#1E293B] border-[#334155] col-span-1">
              <div className="p-4 border-b border-[#334155]">
                <h3 className="text-lg font-bold text-white">آخر النتائج</h3>
              </div>
              <div className="p-4 grid grid-cols-5 gap-2">
                {previousGames.map((multiplier, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded-md text-center font-bold ${
                      multiplier < 1.2 ? 'bg-red-500/20 text-red-400' : 
                      multiplier < 2 ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {multiplier.toFixed(2)}×
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Players List */}
            <Card className="bg-[#1E293B] border-[#334155] col-span-1 md:col-span-2 overflow-hidden">
              <div className="p-4 border-b border-[#334155]">
                <h3 className="text-lg font-bold text-white">اللاعبون</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead className="bg-[#0F172A] text-gray-400 text-sm">
                    <tr>
                      <th className="p-3 text-right">اللاعب</th>
                      <th className="p-3 text-right">الرهان</th>
                      <th className="p-3 text-right">المضاعف</th>
                      <th className="p-3 text-right">الربح/الخسارة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlayers.map(player => (
                      <tr 
                        key={player.id} 
                        className={`border-t border-[#334155] ${
                          player.id === user?.id ? 'bg-[#0F172A]/30' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-sm">
                              {player.username.charAt(0)}
                            </div>
                            <span>{player.username}</span>
                            {player.id === user?.id && (
                              <span className="text-xs bg-[#334155] px-2 py-0.5 rounded-full">أنت</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{player.betAmount}</td>
                        <td className="p-3">
                          {player.cashoutMultiplier ? (
                            <span className="text-green-400">{player.cashoutMultiplier.toFixed(2)}×</span>
                          ) : (
                            player.profit !== null ? (
                              <span className="text-red-400">انفجر</span>
                            ) : (
                              <span className="animate-pulse">جاري...</span>
                            )
                          )}
                        </td>
                        <td className="p-3">
                          {player.profit !== null ? (
                            <span className={player.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {player.profit >= 0 ? '+' : ''}{player.profit}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Chat Section */}
        <div className="hidden md:block w-80 bg-[#1E293B] border-l border-[#334155] overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#334155]">
            <h3 className="text-lg font-bold text-white">الدردشة</h3>
          </div>
          <div className="h-full">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicRocketPage;