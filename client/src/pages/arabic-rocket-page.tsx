import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Rocket, TrendingUp, Clock, Users, BarChart3, ChevronRight, DollarSign, Award, Home, Plus, Minus, FastForward, RefreshCw, RotateCw, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ChatBox from "../components/chat-box";

const ArabicRocketPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // حالة اللعبة
  const [isGameActive, setIsGameActive] = useState(false);
  const [isBettingPhase, setIsBettingPhase] = useState(true); // متغير جديد لتتبع ما إذا كانت مرحلة الرهان نشطة
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
  const [currentStep, setCurrentStep] = useState(0); // متغير لتتبع خطوات الرسم للتأثيرات البصرية
  
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
  
  // وظيفة بدء دورة اللعبة - تم تحسينها للعمل بشكل أفضل
  const startGameCycle = () => {
    // التأكد من إلغاء أي إطارات رسم معلقة
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    
    // إعادة تعيين حالة اللعبة بالكامل
    setExploded(false);
    setIsGameActive(false);
    setIsBettingPhase(true); // تمكين مرحلة الرهان
    setCurrentMultiplier(1.00);
    setHasBet(false);
    setHasWithdrawn(false);
    setPotentialWin(0);
    setCurrentStep(0); // إعادة تعيين خطوة الرسم
    
    // توليد قيمة انفجار جديدة لهذه الجولة
    // استخدام الخوارزمية المحسنة التي تشبه 1xBet
    const crashValue = generateRandomCrashPoint();
    console.log("قيمة الانفجار المحددة للجولة:", crashValue);
    setMaxMultiplier(crashValue);
    
    // بدء العد التنازلي للجولة التالية (10 ثوانٍ)
    // استخدام متغير خارج الدالة للتأكد من التحديث المناسب
    let count = 10; // تعديل وقت العد التنازلي إلى 10 ثواني
    setCountdown(count);
    
    // إيقاف أي عدادات سابقة لمنع المشاكل
    // إنشاء مؤقت جديد للعد التنازلي
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      
      // عند انتهاء العد التنازلي، نبدأ اللعبة
      if (count <= 0) {
        clearInterval(countdownInterval);
        
        // تأخير صغير لضمان أن التحديثات الأخرى تمت معالجتها
        setTimeout(() => {
          startGame();
        }, 100);
      }
    }, 1000);
    
    return () => {
      // تنظيف المؤقتات عند إلغاء المكون
      clearInterval(countdownInterval);
    };
  };
  
  // توليد نقطة انفجار عشوائية (في الإنتاج، هذا سيأتي من السيرفر)
  // تطبيق خوارزمية 1xBet على أساس التوزيع والقيم
  const generateRandomCrashPoint = (): number => {
    // استخدام خوارزمية مناسبة لتوزيع القيم بشكل مشابه لـ 1xBet
    try {
      const houseEdge = 0.01; // هامش البيت (يضمن أن المتوسط لصالح الكازينو)
      const random = Math.random(); // تطبيق نظام احتمالات مناسب
      
      // معالجة الحالات الخاصة
      if (random <= houseEdge) {
        // التحكم في القيم المنخفضة جداً (1.00x - 1.10x)
        return 1.00 + (Math.random() * 0.10);
      }
      
      // تطبيق الصيغة الحسابية المستخدمة في ألعاب الانفجار
      // هذه الصيغة هي: 0.99 / (random - 0.01)
      // وهي محاكاة لخوارزميات Provably Fair المستخدمة في ألعاب مثل 1xBet Crash
      let crashPoint = 0.99 / (random - houseEdge);
      
      // التحقق من قيود القيم
      if (crashPoint < 1.00) {
        crashPoint = 1.00; // لا يمكن أن تكون قيمة الانفجار أقل من 1.00x
      } else if (crashPoint > 1000.00) {
        // تعديل القيم العالية جداً لتكون أكثر واقعية
        crashPoint = 100.00 + (Math.random() * 400);
      }
      
      // تعديل إضافي للتوزيع لجعله أكثر واقعية
      if (crashPoint < 1.2 && Math.random() < 0.3) {
        // زيادة احتمالية القيم المنخفضة قليلاً (1.20x - 2.00x)
        crashPoint = 1.20 + (Math.random() * 0.80);
      } else if (crashPoint > 5 && crashPoint < 10 && Math.random() < 0.5) {
        // تعديل توزيع القيم المتوسطة
        crashPoint = 5.0 + (Math.random() * 5.0);
      }
      
      // تقريب القيمة إلى رقمين عشريين كما في 1xBet للواقعية
      return Math.round(crashPoint * 100) / 100;
    } catch (error) {
      console.error("خطأ في توليد نقطة الانفجار:", error);
      // في حالة حدوث خطأ، نعيد قيمة افتراضية آمنة
      return 1.50;
    }
  };
  
  // وظيفة بدء اللعبة
  const startGame = () => {
    setIsGameActive(true);
    setIsBettingPhase(false); // إيقاف مرحلة الرهان عند بدء اللعبة الفعلية
    
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
  
  // وظيفة الرسم المتحرك للصاروخ - تم تحسينها لضمان عملها بشكل صحيح
  const animate = (multiplier: number) => {
    // التحقق من أن اللعبة نشطة
    if (!isGameActive || !canvasRef.current) {
      return;
    }
    
    // التحقق من الوصول إلى نقطة الانفجار
    if (multiplier >= maxMultiplier) {
      // إلغاء أي إطارات معلقة أولاً لتجنب التداخل
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      
      // الصاروخ انفجر
      setExploded(true);
      setIsGameActive(false);
      
      console.log("الصاروخ انفجر عند: " + maxMultiplier.toFixed(2) + "x");
      
      // تحديث اللاعبين الذين لم ينسحبوا (خسروا)
      setActivePlayers(prev => prev.map(player => {
        if (player.cashoutMultiplier === null) {
          return { ...player, profit: -player.betAmount };
        }
        return player;
      }));
      
      // إضافة النتيجة إلى تاريخ الجولات
      setPreviousGames(prev => [maxMultiplier, ...prev.slice(0, 9)]);
      
      // تشغيل صوت الانفجار
      try {
        const audio = new Audio();
        audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3";
        audio.volume = 0.5;
        audio.play().catch(error => console.log("خطأ في تشغيل صوت الانفجار:", error));
      } catch (err) {
        console.error("خطأ في تشغيل الصوت:", err);
      }
      
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
    
    // زيادة خطوة الرسم لتحريك التأثيرات البصرية
    setCurrentStep(prev => prev + 1);
    
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
    
    // حفظ حالة الكانفاس
    ctx.save();
    
    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم النجوم في الخلفية (هذه الوظيفة الآن تحتوي على رسم الخلفية)
    drawStars(ctx, canvas.width, canvas.height);
    
    // كود مسار الحركة في الخلفية
    if (!exploded && multiplier > 1.5) {
      // رسم مسار متوهج للصاروخ
      const pathProgress = Math.min((multiplier - 1) / 10, 1);
      const pathLength = Math.max(50, pathProgress * (canvas.height - 150));
      
      // تدرج لوني للمسار
      const pathGradient = ctx.createLinearGradient(
        canvas.width / 2, canvas.height,
        canvas.width / 2, canvas.height - pathLength
      );
      pathGradient.addColorStop(0, 'rgba(150, 100, 255, 0.05)');
      pathGradient.addColorStop(1, 'rgba(150, 100, 255, 0.01)');
      
      // رسم مسار عريض خفيف خلف الصاروخ
      ctx.fillStyle = pathGradient;
      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2, canvas.height - pathLength / 2,
        40 + (multiplier * 5), pathLength / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    if (exploded) {
      // رسم الانفجار مع تأثيرات متغيرة
      const baseSize = 80;
      const pulseFactor = 1 + Math.sin(currentStep / 7) * 0.1;
      const explosionSize = baseSize * pulseFactor + Math.min(100, currentStep / 2);
      
      // إضافة تأثير توهج حول الانفجار
      const explosionGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, explosionSize * 2
      );
      explosionGlow.addColorStop(0, 'rgba(255, 50, 0, 0.3)');
      explosionGlow.addColorStop(0.4, 'rgba(255, 0, 0, 0.1)');
      explosionGlow.addColorStop(1, 'rgba(100, 0, 0, 0)');
      
      ctx.fillStyle = explosionGlow;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, explosionSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // رسم موجات صدمة متحركة
      const shockwaveCount = 3;
      for (let i = 0; i < shockwaveCount; i++) {
        const waveDelay = i * 20;
        const waveProgress = Math.max(0, Math.min(1, (currentStep - waveDelay) / 60));
        const waveSize = waveProgress * explosionSize * 1.5;
        const waveOpacity = Math.max(0, 0.7 - waveProgress);
        
        ctx.strokeStyle = `rgba(255, 200, 50, ${waveOpacity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, waveSize, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // رسم الانفجار الرئيسي
      drawExplosion(ctx, canvas.width / 2, canvas.height / 2, explosionSize);
    } else {
      // حساب موقع الصاروخ مع مسار منحني وحركة تمايل للصاروخ 
      // تعديل الموضع ليكون أكثر تطابقاً مع الصورة المرجعية - موضع جانبي
      const heightProgress = Math.min((multiplier - 1) / 6, 0.85); // الارتفاع الأقصى قبل نهاية الشاشة
      const maxHeight = canvas.height - 120;
      const yPosition = canvas.height - (heightProgress * maxHeight) - 50;
      
      // حركة تمايل للصاروخ
      const wobbleAmount = Math.min(4, multiplier / 4); // زيادة التمايل مع زيادة المضاعف (أقل من السابق)
      const wobble = Math.sin(currentStep / 10) * wobbleAmount;
      
      // تغيير موضع الصاروخ ليكون بالثلث الأول من العرض (أكثر جانبية)
      // بناء على الصورة المرجعية التي تظهر الصاروخ يتحرك بشكل جانبي وليس وسط الشاشة
      const xPosition = (canvas.width / 3) + wobble;
      
      // تأثيرات إضافية للسرعات العالية
      if (multiplier > 5) {
        // إضافة تأثير انحناء الضوء حول الصاروخ
        const speedStreaks = 12;
        const streakLength = multiplier * 4;
        
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < speedStreaks; i++) {
          const angle = (i / speedStreaks) * Math.PI * 2;
          const streakX = xPosition + Math.cos(angle) * 40;
          const streakY = yPosition + Math.sin(angle) * 20;
          
          const gradient = ctx.createLinearGradient(
            streakX, streakY,
            streakX + Math.cos(angle) * streakLength,
            streakY + Math.sin(angle) * streakLength
          );
          gradient.addColorStop(0, 'rgba(200, 100, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(100, 50, 255, 0)');
          
          ctx.strokeStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(streakX, streakY);
          ctx.lineTo(
            streakX + Math.cos(angle) * streakLength,
            streakY + Math.sin(angle) * streakLength
          );
          ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
      }
      
      // تأثير تمايل أقوى لرسم دخان الصاروخ
      const smokeWobble = wobble * 1.2;
      const smokeXPosition = canvas.width / 2 + smokeWobble;
      
      // تعديل حجم الدخان بناءً على المضاعف
      const smokeScale = Math.min(1.5, 1 + (multiplier - 1) / 10);
      const smokeYOffset = 40 * smokeScale;
      
      // حفظ وتعديل حالة السياق لتكبير الدخان
      ctx.save();
      ctx.translate(smokeXPosition, yPosition + smokeYOffset);
      ctx.scale(smokeScale, smokeScale);
      ctx.translate(-smokeXPosition, -(yPosition + smokeYOffset));
      
      // رسم دخان الصاروخ
      drawRocketSmoke(ctx, smokeXPosition, yPosition + smokeYOffset);
      
      // استعادة حالة السياق
      ctx.restore();
      
      // تطبيق دوران طفيف للصاروخ للإحساس بالحركة
      const rotationAngle = (wobble / 30) * (Math.PI / 180 * 15); // تحويل التمايل إلى زاوية دوران
      
      ctx.save();
      ctx.translate(xPosition, yPosition);
      ctx.rotate(rotationAngle);
      ctx.translate(-xPosition, -yPosition);
      
      // رسم الصاروخ
      drawRocketShape(ctx, xPosition, yPosition);
      
      ctx.restore();
      
      // إضافة تأثير توهج حول الصاروخ للسرعات العالية
      if (multiplier > 3) {
        const glowRadius = 30 + (multiplier * 3);
        const glowOpacity = Math.min(0.4, (multiplier - 3) / 10);
        
        const glowGradient = ctx.createRadialGradient(
          xPosition, yPosition, 0,
          xPosition, yPosition, glowRadius
        );
        glowGradient.addColorStop(0, `rgba(255, 200, 0, ${glowOpacity})`);
        glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(xPosition, yPosition, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // استخدام وظيفة عرض المضاعف المحسنة
    if (exploded) {
      displayMultiplier(ctx, maxMultiplier, false);
    } else {
      displayMultiplier(ctx, multiplier, true);
    }
    
    // استعادة حالة الكانفاس
    ctx.restore();
  };
  
  // رسم شكل الصاروخ
  const drawRocketShape = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // حفظ السياق الحالي
    ctx.save();
    
    // تطبيق تأثير التوهج للصاروخ
    const gradient = ctx.createRadialGradient(x, y, 10, x, y, 80);
    gradient.addColorStop(0, 'rgba(255, 165, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // جسم الصاروخ - كابسولة فضائية
    ctx.fillStyle = '#FF9900'; // لون برتقالي ذهبي
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 25, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // نافذة الكابسولة
    ctx.fillStyle = '#66CCFF'; // لون أزرق فاتح
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // تفاصيل داخل النافذة
    ctx.fillStyle = '#FFFFFF'; // لون أبيض
    ctx.beginPath();
    ctx.ellipse(x, y - 15, 8, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // لهب الصاروخ
    const flameGradient = ctx.createLinearGradient(x, y + 40, x, y + 80);
    flameGradient.addColorStop(0, '#FF3300');
    flameGradient.addColorStop(0.5, '#FFCC00');
    flameGradient.addColorStop(1, 'rgba(255, 255, 0, 0.5)');
    
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.moveTo(x - 15, y + 30);
    ctx.quadraticCurveTo(x, y + 90, x + 15, y + 30);
    ctx.closePath();
    ctx.fill();
    
    // أضواء وتفاصيل الصاروخ
    // ضوء 1
    ctx.fillStyle = '#FFFF00'; // أصفر
    ctx.beginPath();
    ctx.arc(x - 18, y - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // ضوء 2
    ctx.fillStyle = '#33FF33'; // أخضر
    ctx.beginPath();
    ctx.arc(x + 18, y - 10, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // خطوط تفاصيل الكابسولة
    ctx.strokeStyle = '#CC6600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 25, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // إعادة الحالة المحفوظة
    ctx.restore();
  };
  
  // رسم دخان الصاروخ
  const drawRocketSmoke = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    
    // دخان وهالة متوهجة
    const particlesCount = 20;
    
    // طبقات اللهب المتدرجة
    const flameColors = [
      { color: 'rgba(255, 50, 0, 0.8)', size: 10 },   // طبقة داخلية: برتقالي داكن
      { color: 'rgba(255, 150, 0, 0.7)', size: 15 },  // وسط: برتقالي
      { color: 'rgba(255, 220, 0, 0.5)', size: 20 },  // خارجي: أصفر
    ];
    
    // رسم طبقات اللهب
    flameColors.forEach(layer => {
      for (let i = 0; i < particlesCount / 2; i++) {
        const size = (Math.random() * layer.size) + 5;
        const xOffset = (Math.random() - 0.5) * 25;
        const yOffset = Math.random() * 40 + 25;
        
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.arc(x + xOffset, y + yOffset, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // إضافة شرر متطاير
    for (let i = 0; i < 7; i++) {
      const size = Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI;
      const distance = Math.random() * 60 + 40;
      const sparkX = x + Math.cos(angle) * distance * (Math.random() > 0.5 ? 1 : -1);
      const sparkY = y + Math.sin(angle) * distance + Math.random() * 30;
      
      // شرارة بلون متوهج
      const sparkOpacity = Math.random() * 0.7 + 0.3;
      ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 200 + 55)}, 0, ${sparkOpacity})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // هالة متوهجة للصاروخ
    const glowGradient = ctx.createRadialGradient(x, y + 20, 5, x, y + 20, 40);
    glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y + 20, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // دخان
    const smokeParticlesCount = 8;
    const smokeColors = [
      'rgba(200, 200, 200, 0.2)',
      'rgba(180, 180, 180, 0.15)',
      'rgba(150, 150, 150, 0.1)'
    ];
    
    for (let i = 0; i < smokeParticlesCount; i++) {
      const size = Math.random() * 15 + 8;
      const xOffset = (Math.random() - 0.5) * 40;
      const yOffset = Math.random() * 50 + 50;
      
      const colorIndex = Math.floor(Math.random() * smokeColors.length);
      ctx.fillStyle = smokeColors[colorIndex];
      ctx.beginPath();
      ctx.arc(x + xOffset, y + yOffset, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // رسم النجوم في الخلفية
  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // رسم خلفية الكون العميق مع تأثير ضبابي
    const spaceGradient = ctx.createLinearGradient(0, 0, width, height);
    spaceGradient.addColorStop(0, '#050A30');  // لون أزرق داكن للفضاء البعيد
    spaceGradient.addColorStop(1, '#0A1940');  // لون أزرق داكن مائل للأرجواني
    
    ctx.fillStyle = spaceGradient;
    ctx.fillRect(0, 0, width, height);
    
    // رسم سديم نجمي بعيد
    const nebulaCount = 3;
    for (let i = 0; i < nebulaCount; i++) {
      const nebulaX = Math.random() * width;
      const nebulaY = Math.random() * height;
      const nebulaSize = Math.random() * 200 + 100;
      
      // إنشاء تدرج لوني للسديم
      const nebulaGradient = ctx.createRadialGradient(
        nebulaX, nebulaY, 0,
        nebulaX, nebulaY, nebulaSize
      );
      
      // ألوان متنوعة للسدم
      const nebulaColors = [
        ['rgba(128, 0, 255, 0.03)', 'rgba(128, 0, 255, 0)'],  // أرجواني
        ['rgba(0, 128, 255, 0.02)', 'rgba(0, 128, 255, 0)'],  // أزرق
        ['rgba(255, 0, 128, 0.02)', 'rgba(255, 0, 128, 0)']   // وردي
      ];
      
      const colorIndex = i % nebulaColors.length;
      nebulaGradient.addColorStop(0, nebulaColors[colorIndex][0]);
      nebulaGradient.addColorStop(1, nebulaColors[colorIndex][1]);
      
      ctx.fillStyle = nebulaGradient;
      ctx.beginPath();
      ctx.arc(nebulaX, nebulaY, nebulaSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // رسم النجوم المتلألئة
    const starTypes = [
      { count: 80, size: [0.5, 1.5], opacity: [0.5, 0.9], color: '#FFFFFF' },   // نجوم صغيرة بيضاء
      { count: 40, size: [1, 2], opacity: [0.6, 1], color: '#F0F8FF' },          // نجوم متوسطة زرقاء فاتحة
      { count: 20, size: [1.5, 3], opacity: [0.7, 1], color: '#FFFFD0' }         // نجوم كبيرة صفراء فاتحة
    ];
    
    // رسم جميع أنواع النجوم
    starTypes.forEach(type => {
      for (let i = 0; i < type.count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * (type.size[1] - type.size[0]) + type.size[0];
        const opacity = Math.random() * (type.opacity[1] - type.opacity[0]) + type.opacity[0];
        
        // رسم توهج حول النجوم الكبيرة
        if (size > 1.5) {
          const glowSize = size * 3;
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`);
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // نمط النجمة نفسها
        ctx.fillStyle = `${type.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // رسم النجوم المتلألئة
    const twinkleStars = 15;
    for (let i = 0; i < twinkleStars; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1.5;
      
      // رسم النجمة المتوهجة
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // رسم النجمة نفسها
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // عرض المضاعف مع تأثيرات بصرية
  const displayMultiplier = (ctx: CanvasRenderingContext2D, value: number, isActive: boolean, color: string = '#FFFFFF') => {
    ctx.save();
    
    const displayX = ctx.canvas.width / 2;
    const displayY = 50;
    
    if (isActive) {
      // تغيير حجم ولون النص حسب قيمة المضاعف
      let fontSize = 28;
      let textColor = color;
      let glowColor = 'rgba(100, 100, 255, 0.7)';
      let pulseFactor = 1;
      
      if (value >= 2) {
        fontSize = 32;
        textColor = '#FFFF88';
        glowColor = 'rgba(200, 200, 0, 0.7)';
      }
      
      if (value >= 5) {
        fontSize = 36;
        textColor = '#FFCC00';
        glowColor = 'rgba(255, 150, 0, 0.8)';
        // تأثير نبض للأرقام الكبيرة
        pulseFactor = 1 + Math.sin(currentStep / 5) * 0.1;
      }
      
      if (value >= 10) {
        fontSize = 40;
        textColor = '#FF5500';
        glowColor = 'rgba(255, 80, 0, 0.9)';
        pulseFactor = 1 + Math.sin(currentStep / 4) * 0.15;
      }
      
      // تطبيق تأثير النبض
      ctx.translate(displayX, displayY);
      ctx.scale(pulseFactor, pulseFactor);
      ctx.translate(-displayX, -displayY);
      
      // تأثير توهج للنص
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = textColor;
      ctx.fillText(`${value.toFixed(2)}x`, displayX, displayY);
      
      // إضافة حدود للنص للقراءة الأفضل
      if (value >= 5) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeText(`${value.toFixed(2)}x`, displayX, displayY);
      }
    } else if (exploded) {
      // عرض المضاعف في حالة الانفجار
      const shakeAmount = Math.max(0, 5 - (currentStep / 10));
      const shakeX = (Math.random() - 0.5) * shakeAmount;
      const shakeY = (Math.random() - 0.5) * shakeAmount;
      
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF3333';
      ctx.strokeStyle = '#990000';
      ctx.lineWidth = 2;
      
      // تأثير ظل للنص
      ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const text = `انفجر عند ${value.toFixed(2)}x!`;
      ctx.fillText(text, displayX + shakeX, displayY + shakeY);
      ctx.strokeText(text, displayX + shakeX, displayY + shakeY);
    } else {
      // عرض المضاعف في حالة الانتظار
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      
      // تأثير وميض خفيف أثناء العد التنازلي
      if (countdown < 3 && countdown > 0) {
        const blinkOpacity = Math.sin(currentStep / 4) * 0.3 + 0.7;
        ctx.globalAlpha = blinkOpacity;
      }
      
      ctx.fillText(`${value.toFixed(2)}x`, displayX, displayY);
    }
    
    ctx.restore();
  };

  // رسم الانفجار
  const drawExplosion = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save();
    
    // توهج مركزي
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.2);
    glowGradient.addColorStop(0, 'rgba(255, 80, 0, 0.8)');
    glowGradient.addColorStop(0.4, 'rgba(255, 50, 0, 0.6)');
    glowGradient.addColorStop(0.7, 'rgba(255, 30, 0, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // مركز الانفجار
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.4);
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
    coreGradient.addColorStop(0.4, 'rgba(255, 200, 50, 0.9)');
    coreGradient.addColorStop(1, 'rgba(255, 100, 0, 0.8)');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // جزيئات متطايرة
    const particlesCount = 50;
    const explosionColors = [
      '#FFFF00', // أصفر
      '#FF5500', // برتقالي
      '#FF0000', // أحمر
      '#FFAA00', // ذهبي
      '#FF2200'  // أحمر ناري
    ];
    
    // جزيئات متطايرة رئيسية
    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const particleSize = Math.random() * 20 + 8;
      
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      
      const colorIndex = Math.floor(Math.random() * explosionColors.length);
      
      // رسم هالة حول الجزيئات الكبيرة
      if (particleSize > 15) {
        const particleGlow = ctx.createRadialGradient(
          particleX, particleY, 0,
          particleX, particleY, particleSize * 1.5
        );
        particleGlow.addColorStop(0, `${explosionColors[colorIndex]}AA`);
        particleGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // رسم الجزيئة نفسها
      ctx.fillStyle = explosionColors[colorIndex];
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // شرر صغير متطاير
    const sparkCount = 80;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * (radius * 1.5);
      const sparkSize = Math.random() * 3 + 1;
      
      const sparkX = x + Math.cos(angle) * distance;
      const sparkY = y + Math.sin(angle) * distance;
      
      // لون الشرر يعتمد على المسافة
      const sparkBrightness = Math.max(0, 1 - (distance / (radius * 1.5)));
      const sparkColor = `rgba(255, ${Math.floor(255 * sparkBrightness)}, 0, ${sparkBrightness})`;
      
      ctx.fillStyle = sparkColor;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // موجات الصدمة
    const shockwaves = 3;
    for (let i = 0; i < shockwaves; i++) {
      const waveRadius = radius * (0.4 + (i * 0.25));
      const opacity = 0.8 - (i * 0.2);
      
      ctx.strokeStyle = `rgba(255, 200, 70, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  // وظيفة وضع الرهان - محسنة للتأكد من عملها بشكل صحيح
  const handlePlaceBet = () => {
    console.log("محاولة وضع رهان. حالة اللعبة:", isGameActive, "حالة الرهان:", isBettingPhase);
    
    // التحقق مما إذا كان وقت الرهان
    if (!isBettingPhase) {
      toast({
        title: "انتهى وقت المراهنة",
        description: "يمكنك وضع الرهان فقط خلال مرحلة العد التنازلي قبل بدء اللعبة",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من حالة اللعبة
    if (isGameActive) {
      toast({
        title: "اللعبة قيد التشغيل",
        description: "لا يمكن وضع رهان أثناء تشغيل اللعبة، انتظر الجولة التالية",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق مما إذا كانت الجولة على وشك البدء
    if (countdown <= 0) {
      toast({
        title: "انتظر بدء الجولة التالية",
        description: "الجولة التالية ستبدأ قريباً",
        variant: "destructive"
      });
      return;
    }
    
    // فحص الرهان إذا كان صحيحاً
    if (!betAmount || betAmount <= 0) {
      toast({
        title: "مبلغ الرهان غير صالح",
        description: "يجب أن يكون مبلغ الرهان أكبر من الصفر",
        variant: "destructive"
      });
      return;
    }
    
    // فحص إذا كان المستخدم يملك الرصيد الكافي
    const minimumBet = 10; // الحد الأدنى للرهان 10 رقاقات
    if (betAmount < minimumBet) {
      toast({
        title: "مبلغ الرهان أقل من الحد الأدنى",
        description: `الحد الأدنى للرهان هو ${minimumBet} رقاقة`,
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من الرصيد - مع معالجة حالة كون المستخدم ضيف
    if (!user) {
      toast({
        title: "غير مسجل دخول",
        description: "يجب تسجيل الدخول أولاً قبل وضع الرهان",
        variant: "destructive"
      });
      return;
    }
    
    // التأكد من وجود رصيد كافٍ
    if (user.chips < betAmount) {
      toast({
        title: "رصيد غير كافٍ",
        description: "لا يوجد لديك رصيد كافٍ لوضع هذا الرهان",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من عدم وجود رهان مسبق
    if (hasBet) {
      toast({
        title: "لديك رهان بالفعل!",
        description: "يمكنك وضع رهان واحد فقط في كل جولة",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("بدء إجراءات وضع الرهان");
      
      // إنشاء معرف فريد للرهان
      const betId = Date.now();
      
      // تحديث الواجهة أولاً للاستجابة الفورية
      // إضافة اللاعب إلى القائمة
      setActivePlayers(prev => {
        console.log("إضافة اللاعب إلى قائمة اللاعبين النشطين");
        // التحقق من عدم وجود اللاعب بالفعل
        const existingPlayerIndex = prev.findIndex(p => p.id === user.id);
        if (existingPlayerIndex >= 0) {
          console.log("اللاعب موجود بالفعل في القائمة");
          return prev; // اللاعب موجود بالفعل، لا نضيفه مرة أخرى
        }
        
        // إضافة اللاعب إلى القائمة
        return [
          ...prev,
          { 
            id: user.id, 
            username: user.username, 
            betAmount: betAmount,
            cashoutMultiplier: null, 
            profit: null 
          }
        ];
      });
      
      // تحديث حالة المراهنة
      setHasBet(true);
      setPotentialWin(betAmount); // نبدأ بقيمة الرهان كربح محتمل (1.00x)
      
      // تشغيل صوت رهان
      try {
        const audio = new Audio();
        audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3";
        audio.volume = 0.5;
        audio.play().catch(error => console.log("خطأ في تشغيل صوت الرهان:", error));
      } catch (soundError) {
        console.error("خطأ في تشغيل صوت الرهان:", soundError);
      }
      
      console.log("تم وضع الرهان بنجاح");
      
      // في النسخة النهائية، هنا سيتم إرسال طلب إلى السيرفر
      // placeBet({ userId: user.id, amount: betAmount, betId: betId });
      
      toast({
        title: "تم وضع الرهان بنجاح!",
        description: `رهان بقيمة ${betAmount} رقاقة`,
        variant: "default"
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
  
  // وظيفة سحب الأرباح - محسنة كما في 1xBet
  const handleWithdraw = () => {
    // التحقق من أن اللعبة نشطة وليست في مرحلة الرهان
    if (isBettingPhase) {
      toast({
        title: "اللعبة في مرحلة المراهنة",
        description: "لا يمكن سحب الأرباح خلال مرحلة المراهنة",
        variant: "destructive"
      });
      return;
    }
    
    // التحقق من شروط السحب
    if (!isGameActive || !hasBet || hasWithdrawn) {
      if (!isGameActive) {
        toast({
          title: "اللعبة غير نشطة حالياً",
          description: "انتظر بدء جولة جديدة",
          variant: "destructive"
        });
      } else if (!hasBet) {
        toast({
          title: "ليس لديك رهان",
          description: "يجب وضع رهان أولاً قبل السحب",
          variant: "destructive"
        });
      } else if (hasWithdrawn) {
        toast({
          title: "قمت بالسحب بالفعل",
          description: "لقد قمت بالفعل بسحب أرباحك من هذه الجولة",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      // التأخير هنا لمحاكاة الواقعية (0.2 ثانية)
      // هذا مهم لمنع الغش في ألعاب Crash الحقيقية
      const withdrawDelay = setTimeout(() => {
        // حساب المبلغ الذي سيربحه اللاعب بدقة
        const winAmount = Math.floor(betAmount * currentMultiplier);
        const profit = winAmount - betAmount;
        
        // تسجيل مضاعف السحب الدقيق (في الوقت الفعلي)
        const exactMultiplier = currentMultiplier;
        
        // تحديث حالة اللاعب في الواجهة للاستجابة الفورية
        setActivePlayers(prev => prev.map(player => {
          if (player.id === user?.id) {
            return { 
              ...player, 
              cashoutMultiplier: exactMultiplier, 
              profit: profit 
            };
          }
          return player;
        }));
        
        // تعيين حالة اللاعب بأنه قام بالسحب
        setHasWithdrawn(true);
        setPotentialWin(winAmount); // تثبيت قيمة الربح عند السحب
        
        // إنشاء بيانات السحب للإرسال إلى الخادم (في النسخة الحقيقية)
        const cashoutData = {
          userId: user?.id,
          betAmount: betAmount,
          cashoutMultiplier: exactMultiplier,
          winAmount: winAmount,
          profit: profit,
          timestamp: Date.now()
        };
        
        console.log("بيانات السحب:", cashoutData);
        
        // في النسخة النهائية، سنرسل هذا إلى الخادم
        // await cashoutBet(cashoutData);
        
        // تشغيل صوت النجاح المناسب حسب قيمة الربح
        const audio = new Audio();
        
        // اختيار الصوت حسب حجم الربح
        if (exactMultiplier >= 5) {
          // صوت ربح كبير
          audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3";
          audio.volume = 0.7;
        } else if (exactMultiplier >= 2) {
          // صوت ربح متوسط
          audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-fantasy-game-success-notification-270.mp3";
          audio.volume = 0.6;
        } else {
          // صوت ربح صغير
          audio.src = "https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3";
          audio.volume = 0.5;
        }
        
        // تشغيل الصوت المناسب
        audio.play().catch(error => console.log("خطأ في تشغيل صوت السحب:", error));
        
        // إظهار رسالة النجاح للمستخدم
        const message = profit > betAmount ? 
          `ربحت ${winAmount} رقاقة (بربح قدره ${profit} رقاقة)` : 
          `ربحت ${winAmount} رقاقة`;
          
        toast({
          title: profit > 1000 ? "ربح كبير! 🔥" : "تم السحب بنجاح!",
          description: message,
          variant: exactMultiplier >= 5 ? "default" : "default"
        });
      }, 200); // تأخير 200 مللي ثانية لمحاكاة الواقعية
      
      // تخزين مؤقت التأخير للتنظيف إذا لزم الأمر
      return () => clearTimeout(withdrawDelay);
      
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
    <div className="h-screen w-full flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <div className="bg-[#1E1E3F] text-white p-2 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={() => navigate("/")}
          >
            <Home size={18} />
          </Button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">CRASH</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#2D2D6A] p-1 px-3 rounded-full">
            <div className="bg-yellow-500 p-1 rounded-full">
              <DollarSign size={14} className="text-[#1E293B]" />
            </div>
            <span className="font-bold">{user?.chips || 0}</span>
          </div>
          
          <Button variant="ghost" size="icon" className="text-blue-400">
            <Info size={18} />
          </Button>
        </div>
      </div>
      
      {/* Top stats bar */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold">30.05M</span>
        </div>
        <div className="flex space-x-1 text-xs overflow-auto">
          {[2.78, 9.18, 4.58, 2.83, 3.00, 1.19, 1.46, 1.10, 2.71, 1.43, 1.30, 10.17, 1.87, 1.08, 1.28, 1.32, 4.56].map((val, idx) => (
            <div 
              key={idx}
              className={`px-2 py-1 rounded ${
                val < 1.5 ? 'bg-red-600 text-white' : 
                val > 5 ? 'bg-green-500 text-white' : 
                'bg-blue-600 text-white'
              }`}
            >
              {val.toFixed(2)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-xs">112ms</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 relative bg-gradient-to-b from-[#0A0F2D] to-[#202060] overflow-hidden">
        {/* الكانفاس */}
        <canvas 
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full absolute inset-0"
        ></canvas>
        

        
        {/* الهاشتاج الجانبي للاعبين */}
        <div className="absolute left-4 top-4 bottom-4 w-60 flex flex-col gap-2 overflow-y-auto">
          {/* Active player bets */}
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">9,680</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 2.6</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              1300
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">8.69M</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 2.8</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              ابن الوليد
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">89,000</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 1.9</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              عبد الرحمن
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">41,600</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 1.25</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              فرعون
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">30,000</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 3.1</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              ابو حمزة
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-800 to-[rgba(128,0,255,0.7)] rounded-lg p-2 shadow-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">25,000</span>
              <span className="text-xs bg-blue-700 rounded px-2 py-0.5 text-white">x 1.6</span>
            </div>
            <div className="text-center bg-purple-900/50 rounded py-1 text-white">
              صقر الصحراء
            </div>
          </div>
          
          {/* Display current multiplier in the center */}
          {isGameActive && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="text-8xl font-bold text-white bg-black/30 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-xl">
                <span className="text-yellow-400">{currentMultiplier.toFixed(2)}</span>
                <span className="text-blue-400">x</span>
              </div>
            </div>
          )}
          

          
          {/* Countdown overlay */}
          {!isGameActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl font-bold text-white mb-2">
                  {exploded ? (
                    <div className="text-red-500 animate-pulse">انفجر عند {maxMultiplier.toFixed(2)}x!</div>
                  ) : (
                    countdown
                  )}
                </div>
                <div className="text-xl text-gray-300">
                  {exploded ? "انتظر الجولة التالية..." : "الجولة التالية تبدأ قريباً"}
                </div>
                
                {isBettingPhase && !exploded && (
                  <div className="mt-4">
                    <div className="bg-green-600 text-white px-4 py-2 rounded-full animate-pulse font-bold">
                      وقت المراهنة! ضع رهانك الآن
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Controls */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Left Controls */}
          <div className="flex bg-blue-800 rounded-lg overflow-hidden">
            <div className="flex-1 p-2">
              <div className="text-xs text-center text-white mb-1">مبلغ الرهان</div>
              <div className="flex">
                <button className="bg-blue-700 text-white px-3 py-1 rounded-l">
                  <Minus size={16} />
                </button>
                <div className="flex-1 bg-blue-900 text-white text-center py-1 font-bold">
                  3,000,000
                </div>
                <button className="bg-blue-700 text-white px-3 py-1 rounded-r">
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-xs text-center text-white mt-1">90.00</div>
            </div>
            <div className="w-24 bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
              <button 
                className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-bold py-2 px-4 rounded-md shadow-md"
                onClick={handlePlaceBet}
                disabled={!isBettingPhase || isGameActive || hasBet}
              >
                الرهان
              </button>
            </div>
          </div>
          
          {/* Right Controls */}
          <div className="flex bg-blue-800 rounded-lg overflow-hidden">
            <div className="flex-1 p-2">
              <div className="text-xs text-center text-white mb-1">هدف المضاعف</div>
              <div className="flex">
                <button className="bg-blue-700 text-white px-3 py-1 rounded-l">
                  <Minus size={16} />
                </button>
                <div className="flex-1 bg-blue-900 text-white text-center py-1 font-bold">
                  1,000,000
                </div>
                <button className="bg-blue-700 text-white px-3 py-1 rounded-r">
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-xs text-center text-white mt-1">1.01 × سحب تلقائي</div>
            </div>
            <div className="w-24 bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
              <button 
                className="bg-gradient-to-b from-green-400 to-green-600 text-black font-bold py-2 px-4 rounded-md shadow-md"
                onClick={handleWithdraw}
                disabled={!isGameActive || hasWithdrawn}
              >
                سحب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicRocketPage;