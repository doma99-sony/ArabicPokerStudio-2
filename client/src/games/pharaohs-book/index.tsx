import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import Reels from './components/Reels';
import ControlPanel from './components/ControlPanel';
import PayTable from './components/PayTable';
import './assets/pharaohs-book.css';

/**
 * لعبة كتاب الفرعون (Pharaoh's Book)
 * سلوتس مستوحاة من لعبة Book of Dead، تحمل طابع مصري فرعوني
 */
export default function PharaohsBook() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(user?.chips || 1000);
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState<string[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [win, setWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [specialSymbol, setSpecialSymbol] = useState<string | null>(null);
  const [winningLines, setWinningLines] = useState<number[][]>([]);

  // رموز اللعبة
  const symbols = [
    'pharaoh', // الفرعون (أعلى قيمة)
    'book',    // الكتاب (سكاتر والرمز الخاص)
    'anubis',  // أنوبيس
    'eye',     // عين حورس
    'scarab',  // الجعران
    'a',       // A
    'k',       // K
    'q',       // Q
    'j',       // J
    '10'       // 10
  ];

  // قيم المكافآت لكل رمز (عدد الرموز => المضاعف)
  const payouts = {
    'pharaoh': { 2: 5, 3: 20, 4: 100, 5: 500 },
    'book': { 3: 18, 4: 80, 5: 200 },
    'anubis': { 3: 15, 4: 70, 5: 150 },
    'eye': { 3: 15, 4: 60, 5: 125 },
    'scarab': { 3: 10, 4: 40, 5: 100 },
    'a': { 3: 5, 4: 20, 5: 50 },
    'k': { 3: 5, 4: 15, 5: 40 },
    'q': { 3: 3, 4: 10, 5: 30 },
    'j': { 3: 3, 4: 10, 5: 30 },
    '10': { 3: 2, 4: 5, 5: 25 }
  };

  // تهيئة اللعبة
  useEffect(() => {
    if (user) {
      setCredits(user.chips || 1000);
    }

    // إنشاء البكرات الافتراضية للعبة
    initializeReels();

    // تحميل الصور فقط للرموز التي لها صور SVG
    const svgSymbols = ['pharaoh', 'book', 'anubis'];
    const imagesToLoad = svgSymbols.length;
    let imagesLoaded = 0;

    // تحميل الصور المتوفرة فقط
    svgSymbols.forEach(symbol => {
      const img = new Image();
      img.src = `/images/pharaohs-book/${symbol}.svg`;
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === imagesToLoad) {
          setLoading(false);
        }
      };
      img.onerror = () => {
        console.log(`خطأ في تحميل صورة ${symbol}.svg`);
        imagesLoaded++;
        if (imagesLoaded === imagesToLoad) {
          setLoading(false);
        }
      };
    });

    // استخدام زمن قصير للتحميل في حالة عدم توفر الصور
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      if (autoPlay) {
        setAutoPlay(false);
      }
    };
  }, [user]);

  // تهيئة البكرات
  const initializeReels = () => {
    // 5 بكرات × 3 صفوف
    const newReels = [];
    for (let i = 0; i < 5; i++) {
      const reel = [];
      for (let j = 0; j < 3; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      newReels.push(reel);
    }
    setReels(newReels);
  };

  // تغيير قيمة الرهان
  const changeBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };

  // تشغيل الأصوات
  const playSound = (soundName: string) => {
    try {
      // استخدام القيمة الافتراضية في حالة عدم وجود الملف الصوتي
      // هذا يعمل على تجنب الأخطاء في حالة عدم وجود ملفات صوتية
      const sound = new Audio();
      
      // محاولة تحميل الصوت، إذا فشل سيتم تجاهله بصمت
      sound.src = `/sounds/pharaohs-book/${soundName}.mp3`;
      
      // تعيين مستوى الصوت
      sound.volume = 0.5;
      
      const playPromise = sound.play();
      
      // التعامل مع الوعد المرتجع من play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // تم تشغيل الصوت بنجاح
            console.log(`تم تشغيل صوت ${soundName} بنجاح`);
          })
          .catch(error => {
            // تم رفض الوعد، تجاهل الخطأ
            // هذا طبيعي في بعض المتصفحات التي تتطلب تفاعل المستخدم قبل تشغيل الصوت
            console.log(`تم تجاهل خطأ تشغيل الصوت ${soundName}:`, error.name);
          });
      }
    } catch (e) {
      // تجاهل أي أخطاء أخرى
      console.log('تم تجاهل خطأ في إنشاء الصوت:', e);
    }
  };

  // دالة للدوران
  const spin = async () => {
    if (spinning) return;
    
    // التحقق من الرصيد
    if (credits < bet && freeSpins === 0) {
      setMessage('رصيد غير كافٍ');
      return;
    }

    setSpinning(true);
    setMessage('');
    setWin(0);
    setWinningLines([]);

    // خصم الرهان إلا في حالة وجود دورات مجانية
    if (freeSpins === 0) {
      setCredits(prev => prev - bet);
    } else {
      setFreeSpins(prev => prev - 1);
    }

    // صوت الدوران
    playSound('spin');

    // محاكاة دوران البكرات
    const newReels: string[][] = [];

    // إنشاء نتيجة عشوائية
    for (let i = 0; i < 5; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 3; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      newReels.push(reel);
    }

    // تأخير لإظهار تأثير الدوران
    setTimeout(() => {
      setReels(newReels);
      
      // حساب النتيجة
      const result = calculateResult(newReels);
      
      if (result.win > 0) {
        playSound('win');
        setWin(result.win);
        setCredits(prev => prev + result.win);
        setMessage(`ربحت ${result.win} رقاقة!`);
        
        // عرض تأثيرات الربح
        showWinAnimation(result.winningLines);
      } else {
        setMessage('حظ أوفر في المرة القادمة');
      }

      // التحقق من رموز الكتاب (سكاتر)
      const bookSymbols = countSymbol(newReels, 'book');
      if (bookSymbols >= 3) {
        // تفعيل الدورات المجانية
        const freespinsCount = 10;
        setFreeSpins(prev => prev + freespinsCount);
        setMessage(`حصلت على ${freespinsCount} دورات مجانية!`);
        playSound('freespin');
        
        // اختيار رمز خاص عشوائي للدورات المجانية
        const randomSymbol = symbols[Math.floor(Math.random() * (symbols.length - 2)) + 1];
        setSpecialSymbol(randomSymbol);
      }
      
      setSpinning(false);
      
      // استمرار اللعب التلقائي إذا كان مفعلاً
      if (autoPlay && credits >= bet) {
        setTimeout(() => {
          spin();
        }, 2000);
      }
    }, 1000);
  };

  // حساب النتيجة
  const calculateResult = (currentReels: string[][]) => {
    let totalWin = 0;
    const winningLines: number[][] = [];
    
    // التحقق من الخطوط الأفقية (3 صفوف)
    for (let row = 0; row < 3; row++) {
      const symbolsInRow: string[] = [];
      for (let reel = 0; reel < 5; reel++) {
        symbolsInRow.push(currentReels[reel][row]);
      }
      
      const result = checkLineWin(symbolsInRow);
      totalWin += result.win;
      
      if (result.win > 0) {
        // تسجيل الخط الفائز
        const line: number[] = [];
        for (let i = 0; i < result.count; i++) {
          line.push(row * 5 + i);
        }
        winningLines.push(line);
      }
    }
    
    // التحقق من رمز خاص في الدورات المجانية
    if (freeSpins > 0 && specialSymbol) {
      const specialCount = countSymbol(currentReels, specialSymbol);
      if (specialCount >= 3 && payouts[specialSymbol as keyof typeof payouts]) {
        const symbolPayouts = payouts[specialSymbol as keyof typeof payouts];
        const specialWin = symbolPayouts[specialCount as keyof typeof symbolPayouts] * bet;
        totalWin += specialWin;
      }
    }
    
    return { win: totalWin, winningLines };
  };

  // التحقق من ربح على خط معين
  const checkLineWin = (symbols: string[]) => {
    const firstSymbol = symbols[0];
    let count = 1;
    
    // عد عدد الرموز المتطابقة بدءًا من اليسار
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol || symbols[i] === 'book') {
        count++;
      } else {
        break;
      }
    }
    
    // حساب الربح إذا كان هناك 3 رموز متطابقة على الأقل
    let win = 0;
    if (count >= 3 && payouts[firstSymbol as keyof typeof payouts]) {
      const symbolPayouts = payouts[firstSymbol as keyof typeof payouts];
      win = symbolPayouts[count as keyof typeof symbolPayouts] * bet;
    }
    
    return { win, count };
  };

  // عد عدد ظهور رمز معين على البكرات
  const countSymbol = (currentReels: string[][], symbol: string) => {
    let count = 0;
    for (let reel = 0; reel < currentReels.length; reel++) {
      for (let row = 0; row < currentReels[reel].length; row++) {
        if (currentReels[reel][row] === symbol) {
          count++;
        }
      }
    }
    return count;
  };

  // عرض تأثيرات الربح
  const showWinAnimation = (winningLines: number[][]) => {
    // تحديث state للخطوط الفائزة لعرضها في مكون البكرات
    setWinningLines(winningLines);
    
    // إضافة تأثيرات صوتية/مرئية أخرى حسب الحاجة
    console.log('خطوط الربح:', winningLines);
  };

  // تبديل وضع اللعب التلقائي
  const toggleAutoPlay = () => {
    const newState = !autoPlay;
    setAutoPlay(newState);
    
    if (newState && !spinning && credits >= bet) {
      spin();
    }
  };

  // الرجوع إلى الصفحة الرئيسية
  const goBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="animate-spin mb-4">
          <Loader2 className="w-12 h-12 text-[#D4AF37]" />
        </div>
        <p className="text-[#D4AF37] text-xl">جاري تحميل لعبة كتاب الفرعون...</p>
      </div>
    );
  }

  return (
    <div className="pharaohs-book-container bg-black min-h-screen flex flex-col overflow-hidden">
      {/* شريط العنوان */}
      <header className="bg-[#0A1A1A] border-b-2 border-[#D4AF37] p-3 flex justify-between items-center shadow-lg">
        <button 
          onClick={goBack}
          className="text-[#D4AF37] hover:text-white transition-colors duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-xl font-bold text-center text-[#D4AF37]">كتاب الفرعون</h1>
        <div className="flex items-center">
          <span className="text-[#D4AF37] mr-2">{credits}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]">
            <circle cx="12" cy="12" r="8"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
      </header>

      {/* منطقة اللعب الرئيسية */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* رسالة الربح والرسائل الأخرى */}
        {message && (
          <div className="message-container absolute top-4 left-0 right-0 mx-auto text-center z-10">
            <div className={`message inline-block py-2 px-4 rounded-full ${win > 0 || freeSpins > 0 ? 'bg-[#D4AF37] text-black' : 'bg-red-600 text-white'}`}>
              {message}
            </div>
          </div>
        )}

        {/* شاشة عرض البكرات */}
        <Reels 
          reels={reels} 
          spinning={spinning} 
          specialSymbol={specialSymbol}
          winningLines={winningLines}
        />

        {/* الدورات المجانية */}
        {freeSpins > 0 && (
          <div className="free-spins-counter bg-[#D4AF37] text-black py-1 px-3 rounded-full mb-4">
            <span>دورات مجانية متبقية: {freeSpins}</span>
          </div>
        )}

        {/* لوحة التحكم */}
        <ControlPanel 
          bet={bet}
          credits={credits}
          changeBet={changeBet}
          spin={spin}
          spinning={spinning}
          freeSpins={freeSpins}
          autoPlay={autoPlay}
          toggleAutoPlay={toggleAutoPlay}
        />

        {/* جدول المكافآت */}
        <PayTable bet={bet} />
      </main>
    </div>
  );
}