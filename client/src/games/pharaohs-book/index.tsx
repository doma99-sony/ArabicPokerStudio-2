import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import Reels from './components/Reels';
import ControlPanel from './components/ControlPanel';
import PayTable from './components/PayTable';
import audioGenerator from './components/audio-generator';
import './assets/pharaohs-book.css';
import './assets/free-spins-animations.css'; // إضافة ملف الأنيميشن الخاص باللفات المجانية

/**
 * لعبة كتاب الفرعون (Pharaoh's Book)
 * سلوتس مستوحاة من لعبة Book of Dead، تحمل طابع مصري فرعوني
 */
export default function PharaohsBook() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(user?.chips || 10000000); // زيادة الرصيد الافتراضي ليتناسب مع قيم الرهان الجديدة
  const [bet, setBet] = useState(10000); // تغيير قيمة الرهان الافتراضية للقيمة الأولى في مصفوفة الرهانات
  const [reels, setReels] = useState<string[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [win, setWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSipnsTotal, setFreeSpinsTotal] = useState(0); // إجمالي عدد اللفات المجانية في الجولة الحالية
  const [freeSpinsWinnings, setFreeSpinsWinnings] = useState(0); // إجمالي المكاسب من اللفات المجانية
  const [showFreeSpinsResult, setShowFreeSpinsResult] = useState(false); // عرض نتيجة اللفات المجانية
  const [freeSpinsWinType, setFreeSpinsWinType] = useState<'normal' | 'big' | 'super' | 'arabic'>('normal'); // نوع الفوز في اللفات المجانية
  const [autoPlay, setAutoPlay] = useState(false);
  const [specialSymbol, setSpecialSymbol] = useState<string | null>(null);
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // إضافة حالات جديدة للشاشة الانتقالية للفات المجانية
  const [freeSpinsTransitionVisible, setFreeSpinsTransitionVisible] = useState<boolean>(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState<number>(0);

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

    // تحميل الصور لجميع الرموز
    const svgSymbols = [
      'pharaoh', 'book', 'anubis', 'eye', 'scarab',
      'a', 'k', 'q', 'j', '10'
    ];
    
    const imagesToLoad = svgSymbols.length;
    let imagesLoaded = 0;

    // تحميل الصور مسبقاً
    // جميع صور SVG موجودة بالفعل، لكن قد تكون هناك مشكلة في تحميلها
    // لذلك سنتخطى عملية تحميلها ونفترض أنها متوفرة
    
    // استخدام نهج التحميل المبسط
    setTimeout(() => {
      setLoading(false);
      console.log('تم تخطي تحميل الصور والانتقال للعبة مباشرة');
    }, 1000);
    
    // إعداد صور احتياطية في حالة عدم وجود صور SVG
    const symbolPlaceholders = {
      'pharaoh': '👑',
      'book': '📕',
      'anubis': '🐺',
      'eye': '👁️',
      'scarab': '🪲',
      'a': 'A',
      'k': 'K',
      'q': 'Q',
      'j': 'J',
      '10': '10'
    };

    // تفعيل مولد الصوت
    audioGenerator.initialize();
    
    // نظراً لأن ملفات الصوت غير متوفرة، سنستخدم مولد الصوت فقط
    // ونسجل في متغير الحالة أن لدينا تحكم للصوت دون استخدام ملف صوتي فعلي
    
    // إعداد تسجيل الموسيقى كحالة لإدارة تفعيل/إيقاف الصوت
    setBackgroundMusic(null);
    
    console.log('تم تهيئة نظام الصوت باستخدام مولد الصوت WebAudio API');
    
    // استخدام زمن قصير للتحميل في حالة عدم توفر الصور
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      // إيقاف اللعب التلقائي عند مغادرة الصفحة
      if (autoPlay) {
        setAutoPlay(false);
      }
      
      // حتى مع عدم وجود خلفية صوتية، نقوم بتعيين حالة كتم الصوت 
      // لضمان عدم انتقال الإعدادات للصفحات الأخرى
      setIsMuted(true);
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

  // قيم الرهان الثابتة
  const BET_VALUES = [10000, 100000, 500000, 1000000, 5000000, 10000000];

  // تغيير قيمة الرهان
  const changeBet = (amount: number) => {
    // في حالة كان هناك لفات مجانية، لا يمكن تغيير الرهان
    if (freeSpins > 0) return;
    
    // تعديل الرهان مباشرة بقيمة محددة
    const newBet = bet + amount;
    
    // التحقق من أن القيمة الجديدة موجودة في مصفوفة قيم الرهان
    if (BET_VALUES.includes(newBet)) {
      setBet(newBet);
    } else {
      // في حالة إدخال قيمة غير موجودة في المصفوفة، نختار القيمة الأقرب
      const closestValue = BET_VALUES.reduce((prev, curr) => {
        return (Math.abs(curr - newBet) < Math.abs(prev - newBet) ? curr : prev);
      });
      setBet(closestValue);
    }
  };

  // تبديل حالة كتم الصوت
  const toggleMute = () => {
    setIsMuted(prevMuted => {
      const newMutedState = !prevMuted;
      
      // تطبيق حالة كتم الصوت على مولد الصوت
      if (newMutedState) {
        // كتم الصوت
        audioGenerator.setMasterVolume(0);
      } else {
        // إعادة تفعيل الصوت
        audioGenerator.setMasterVolume(0.4);
        
        // تفعيل سياق الصوت
        audioGenerator.activate();
      }
      
      return newMutedState;
    });
  };

  // تشغيل الأصوات باستخدام مولد الصوت
  const playSound = (soundName: string) => {
    // لا تشغل الأصوات إذا كان وضع كتم الصوت مفعلاً
    if (isMuted) return;
    
    try {
      // تفعيل سياق الصوت (يحتاج تفاعل المستخدم في بعض المتصفحات)
      audioGenerator.activate();
      
      // تشغيل الصوت المناسب حسب النوع
      switch (soundName) {
        case 'spin':
          audioGenerator.generateSpinSound();
          break;
        case 'win':
          audioGenerator.generateWinSound(false);
          break;
        case 'bigwin':
          audioGenerator.generateWinSound(true);
          break;
        case 'freespin':
          audioGenerator.generateFreespinSound();
          break;
        default:
          console.log(`نوع الصوت غير معروف: ${soundName}`);
      }
    } catch (e) {
      // تجاهل أي أخطاء
      console.log(`تم تجاهل خطأ تشغيل الصوت ${soundName}:`, e);
    }
  };

  // احتمالية ظهور كل رمز (الرموز الأعلى قيمة لها احتمالية أقل)
  const symbolProbabilities = {
    'pharaoh': 0.07, // الفرعون (أعلى قيمة، احتمالية منخفضة)
    'book': 0.06,    // الكتاب (سكاتر، احتمالية منخفضة)
    'anubis': 0.08,  // أنوبيس
    'eye': 0.1,      // عين حورس
    'scarab': 0.12,  // الجعران
    'a': 0.12,       // A
    'k': 0.13,       // K
    'q': 0.14,       // Q
    'j': 0.14,       // J
    '10': 0.15       // 10 (أقل قيمة، احتمالية عالية)
  };

  // دالة اختيار رمز عشوائي بناءً على الاحتمالات المحددة
  const getRandomSymbol = (): string => {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const symbol in symbolProbabilities) {
      cumulativeProbability += symbolProbabilities[symbol as keyof typeof symbolProbabilities];
      if (rand <= cumulativeProbability) {
        return symbol;
      }
    }
    
    // إرجاع الرمز الأقل قيمة كاحتياط في حالة حدوث أخطاء في الاحتمالات
    return '10';
  };

  // خوارزمية تقييم الفوز - تتحكم في احتمالية تحقيق الفوز
  const WIN_RATE = 0.35; // نسبة الفوز 35%

  // دالة للدوران
  // دالة بدء اللفات المجانية
  const startFreeSpins = () => {
    // إخفاء شاشة الانتقال
    setFreeSpinsTransitionVisible(false);
    
    // تفعيل اللفات المجانية
    setFreeSpins(pendingFreeSpins);
    setFreeSpinsTotal(pendingFreeSpins);
    
    // إعادة تعيين مكاسب اللفات المجانية
    setFreeSpinsWinnings(0);
    
    // تنظيف
    setPendingFreeSpins(0);
    
    // تشغيل صوت اللفات المجانية مرة أخرى
    playSound('freespin');
  };

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

    // محاكاة دوران البكرات مع خوارزمية موزونة للاحتمالات
    const newReels: string[][] = [];
    
    // تحديد ما إذا كانت هذه الدورة ستكون فائزة أم لا
    // نستخدم معدل الفوز الأساسي + زيادة أثناء اللفات المجانية
    const shouldWin = Math.random() <= WIN_RATE + (freeSpins > 0 ? 0.25 : 0);
    
    // في حالة الدورات المجانية، نزيد احتمالية الفوز بشكل كبير
    // هذا يجعل اللفات المجانية أكثر إثارة وتشويقًا
    const freeSpinBoost = freeSpins > 0 ? 0.35 : 0;
    
    // تحديد ما إذا كان سيظهر 3 كتب (سكاتر) في هذه الدورة
    // احتمالية منخفضة للحصول على دورات مجانية (5%)
    // لكن قمنا بزيادة احتمالية تجديد اللفات المجانية أثناء اللعب المجاني نفسه
    const freespinRenewalChance = freeSpins > 0 ? 0.12 : 0.05; // 12% خلال اللفات المجانية، 5% في اللعب العادي
    const shouldGiveFreeSpins = Math.random() <= freespinRenewalChance + freeSpinBoost*0.1;
    
    if (shouldGiveFreeSpins) {
      // إنشاء نتيجة تحتوي على 3 كتب على الأقل
      let bookPositions: [number, number][] = [];
      
      // اختيار 3 مواضع عشوائية للكتب
      while (bookPositions.length < 3) {
        const reel = Math.floor(Math.random() * 5);
        const row = Math.floor(Math.random() * 3);
        
        // التأكد من عدم تكرار نفس الموضع
        if (!bookPositions.some(pos => pos[0] === reel && pos[1] === row)) {
          bookPositions.push([reel, row]);
        }
      }
      
      // إنشاء البكرات مع وضع الكتب في المواضع المختارة
      for (let i = 0; i < 5; i++) {
        const reel: string[] = [];
        for (let j = 0; j < 3; j++) {
          const isBookPosition = bookPositions.some(pos => pos[0] === i && pos[1] === j);
          reel.push(isBookPosition ? 'book' : getRandomSymbol());
        }
        newReels.push(reel);
      }
    } else if (shouldWin) {
      // إنشاء نتيجة فائزة - نضع نفس الرمز في خط واحد على الأقل
      
      // اختيار رمز عشوائي للفوز
      const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      // اختيار صف عشوائي للفوز
      const winningRow = Math.floor(Math.random() * 3);
      
      // عدد البكرات المتطابقة في الصف - على الأقل 3 للفوز
      const matchingReels = 3 + Math.floor(Math.random() * 3); // 3 إلى 5 بكرات متطابقة
      
      // إنشاء البكرات مع وضع الرمز الفائز في المواضع المناسبة
      for (let i = 0; i < 5; i++) {
        const reel: string[] = [];
        for (let j = 0; j < 3; j++) {
          if (j === winningRow && i < matchingReels) {
            reel.push(winningSymbol);
          } else {
            reel.push(getRandomSymbol());
          }
        }
        newReels.push(reel);
      }
    } else {
      // إنشاء نتيجة غير فائزة - رموز عشوائية بدون نمط
      for (let i = 0; i < 5; i++) {
        const reel: string[] = [];
        for (let j = 0; j < 3; j++) {
          reel.push(getRandomSymbol());
        }
        newReels.push(reel);
      }
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
        setMessage(`ربحت ${result.win.toLocaleString()} رقاقة!`);
        
        // عرض تأثيرات الربح
        showWinAnimation(result.winningLines);
      } else {
        setMessage('حظ أوفر في المرة القادمة');
      }

      // التحقق من رموز الكتاب (سكاتر)
      const bookSymbols = countSymbol(newReels, 'book');
      if (bookSymbols >= 3 && freeSpins === 0) { // منع إضافة لفات مجانية داخل اللفات المجانية
        // تفعيل الدورات المجانية
        const freespinsCount = 10;
        
        // إظهار شاشة الانتقال للفات المجانية بدلاً من البدء مباشرة
        setFreeSpinsTransitionVisible(true);
        
        // تخزين عدد اللفات المجانية مؤقتاً
        setPendingFreeSpins(freespinsCount);
        
        // عرض رسالة للمستخدم
        setMessage(`حصلت على ${freespinsCount} دورات مجانية!`);
        
        // تشغيل صوت اللفات المجانية
        playSound('freespin');
        
        // اختيار رمز خاص عشوائي للدورات المجانية
        // نستثني الرموز ذات القيمة العالية جدًا لموازنة اللعبة
        const specialSymbolOptions = symbols.filter(s => s !== 'pharaoh' && s !== 'book');
        const randomSymbol = specialSymbolOptions[Math.floor(Math.random() * specialSymbolOptions.length)];
        setSpecialSymbol(randomSymbol);
      }
      
      // تحديث إجمالي مكاسب اللفات المجانية إذا كنا في وضع اللفات المجانية
      if (freeSpins > 0 && result.win > 0) {
        setFreeSpinsWinnings(prev => prev + result.win);
      }
      
      // إظهار النتيجة النهائية للفات المجانية إذا انتهت
      if (freeSpins === 1 && freeSipnsTotal > 0) {
        // سنظهر النتيجة النهائية للفات المجانية في اللفة الأخيرة
        setTimeout(() => {
          // تحديد نوع الفوز بناءً على إجمالي المكاسب
          const winMultiplier = freeSpinsWinnings / bet;
          
          if (winMultiplier > 50) {
            setFreeSpinsWinType('arabic'); // عرباوي وين!
          } else if (winMultiplier > 30) {
            setFreeSpinsWinType('super'); // Super Win!
          } else if (winMultiplier > 15) {
            setFreeSpinsWinType('big'); // Big Win!
          } else {
            setFreeSpinsWinType('normal'); // ربح عادي
          }
          
          // إظهار مربع النتيجة النهائية
          setShowFreeSpinsResult(true);
          
          // تشغيل صوت مناسب حسب مستوى الربح
          if (winMultiplier > 30) {
            playSound('bigwin');
          } else if (winMultiplier > 15) {
            playSound('win');
            setTimeout(() => playSound('win'), 300);
          }
          
          // إخفاء النتيجة النهائية بعد فترة
          setTimeout(() => {
            setShowFreeSpinsResult(false);
            setFreeSpinsTotal(0);
            setSpecialSymbol(null);
          }, 5000);
        }, 1500);
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
    
    // حساب قيمة الربح لاختيار تأثيرات مناسبة
    const winAmount = win || 0;
    
    // تشغيل صوت الفوز المناسب حسب قيمة الربح
    if (winAmount > bet * 20) {
      // ربح كبير - صوت خاص للفوز الكبير
      playSound('bigwin');
      
      // إضافة تأثير اهتزاز للشاشة للفوز الكبير
      const screenElement = document.querySelector('.pharaohs-book-container');
      if (screenElement) {
        screenElement.classList.add('big-win-effect');
        setTimeout(() => {
          screenElement.classList.remove('big-win-effect');
        }, 3000);
      }
    } else if (winAmount > bet * 5) {
      // ربح متوسط
      playSound('win');
      
      // تشغيل صوت الفوز مرتين للتأكيد
      setTimeout(() => {
        playSound('win');
      }, 300);
    } else {
      // ربح عادي
      playSound('win');
    }
    
    // عرض رسالة مختلفة حسب قيمة الربح
    if (winAmount > bet * 20) {
      setMessage(`ربح هائل! 🔥 ${winAmount.toLocaleString()} رقاقة!`);
    } else if (winAmount > bet * 5) {
      setMessage(`ربح جيد! ${winAmount.toLocaleString()} رقاقة!`);
    } else {
      setMessage(`ربحت ${winAmount.toLocaleString()} رقاقة!`);
    }
    
    // سجل التفاصيل في وحدة التحكم للتصحيح
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
    <div className="pharaohs-book-container min-h-screen flex flex-col overflow-hidden">
      {/* طبقات الخلفية المتحركة المحسنة */}
      <div className="animated-light-rays"></div>
      <div className="animated-sand"></div>
      <div className="gold-dust-particles"></div>
      <div className="soft-light-glow"></div>
      <div className="moving-light-effect"></div>
      <div className="animated-shimmer"></div>

      {/* الإطار الخارجي الفرعوني المحسن */}
      <div className="egyptian-frame-container">
        {/* زخارف الإطار العلوية */}
        <div className="frame-top">
          <div className="frame-top-center">
            <div className="winged-scarab"></div>
          </div>
        </div>
        
        {/* الأعمدة الجانبية */}
        <div className="frame-column left"></div>
        <div className="frame-column right"></div>
        
        {/* زخارف الإطار السفلية */}
        <div className="frame-bottom">
          <div className="frame-bottom-center">
            <div className="hieroglyphs-decoration"></div>
          </div>
        </div>
        
        {/* تأثير إضاءة المعبد */}
        <div className="temple-light-overlay"></div>
      </div>
      
      {/* الشخصيات الفرعونية على الجوانب */}
      <div className={`pharaoh-guardian pharaoh-left ${freeSpins > 0 ? 'active' : ''} ${win > bet * 10 ? 'celebrating' : ''}`}>
        <div className="pharaoh-glow"></div>
      </div>
      <div className={`pharaoh-guardian pharaoh-right ${freeSpins > 0 ? 'active' : ''} ${win > bet * 10 ? 'celebrating' : ''}`}>
        <div className="pharaoh-glow"></div>
      </div>
      
      {/* شريط الزخرفة العلوي والسفلي */}
      <div className="decorative-border-top"></div>
      <div className="decorative-border-bottom"></div>
      
      {/* شريط العنوان */}
      <header className="bg-[#0A1A1A] border-b-2 border-[#D4AF37] p-3 flex justify-between items-center shadow-lg relative z-10">
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
        <div className="flex items-center bg-gradient-to-r from-[#1A2530] to-[#0A1A1A] px-3 py-1 rounded-full border border-[#D4AF37]">
          <span className="text-[#D4AF37] mr-2 font-bold">{credits.toLocaleString()}</span>
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
            <div 
              className={`
                message inline-block py-2 px-6 rounded-full 
                ${win > bet * 20 ? 'bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black font-bold text-xl animate-bounce' : 
                  win > bet * 5 ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold' : 
                  win > 0 ? 'bg-[#D4AF37] text-black' : 
                  freeSpins > 0 ? 'bg-gradient-to-r from-[#8B4513] to-[#D4AF37] text-white font-bold' : 
                  'bg-red-600 text-white'}
                shadow-lg border ${win > 0 ? 'border-[#FFD700]' : 'border-transparent'}
              `}
            >
              {message}
              {win > bet * 20 && (
                <span className="win-sparkles absolute inset-0 overflow-hidden rounded-full"></span>
              )}
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

        {/* شاشة الانتقال للفات المجانية */}
        {freeSpinsTransitionVisible && (
          <div className="free-spins-transition-screen absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <div className="transition-container p-8 rounded-xl bg-gradient-to-br from-[#8B4513] to-[#B8860B] border-4 border-[#FFD700] shadow-2xl transform scale-110 animate-bounce-slow">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-[#FFD700] mb-6 drop-shadow-lg">لقد حصلت على</h2>
                <div className="text-6xl font-bold text-white mb-8 drop-shadow-md">
                  {pendingFreeSpins} 
                  <span className="text-5xl"> دورات مجانية! </span>
                </div>
                
                <div className="mb-8 flex justify-center">
                  <div className="book-animation w-32 h-32">
                    {/* كتاب متحرك هنا */}
                    <div className="glow-effect"></div>
                  </div>
                </div>
                
                <button 
                  onClick={startFreeSpins}
                  className="start-excitement-btn px-8 py-4 text-2xl font-bold text-black bg-gradient-to-r from-[#FFD700] to-[#D4AF37] rounded-full hover:from-[#D4AF37] hover:to-[#FFD700] transition-all duration-300 shadow-lg transform hover:scale-105 active:scale-95"
                >
                  ابدأ الحماس!
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* الدورات المجانية - معلومات ثابتة في واجهة اللعبة */}
        {freeSpins > 0 && (
          <div className="free-spins-banner absolute bottom-20 left-0 right-0 z-20 flex flex-col items-center">
            <div className="free-spins-counter bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black py-2 px-6 rounded-full mb-2 text-xl font-bold shadow-lg animate-pulse">
              <span>دورات مجانية متبقية: {freeSpins}</span>
            </div>
            {specialSymbol && (
              <div className="special-symbol-badge bg-black/70 py-1 px-4 rounded-full text-[#D4AF37] text-sm border border-[#D4AF37] mb-2">
                الرمز الخاص: 
                <span className="ml-2 font-bold">
                  {
                    specialSymbol === 'pharaoh' ? 'الفرعون' :
                    specialSymbol === 'anubis' ? 'أنوبيس' :
                    specialSymbol === 'eye' ? 'عين حورس' :
                    specialSymbol === 'scarab' ? 'الجعران' :
                    specialSymbol
                  }
                </span>
              </div>
            )}
            {/* عرض إجمالي المكاسب من اللفات المجانية */}
            {freeSpinsWinnings > 0 && (
              <div className="free-spins-winnings bg-gradient-to-r from-[#007A5E] to-[#00B386] text-white py-1 px-4 rounded-full text-lg font-bold shadow-lg">
                <span>إجمالي المكاسب: {freeSpinsWinnings.toLocaleString()} رقاقة</span>
              </div>
            )}
          </div>
        )}
        
        {/* نتيجة اللفات المجانية النهائية */}
        {showFreeSpinsResult && (
          <div className="freespins-result-container absolute inset-0 flex items-center justify-center z-30">
            <div className={`freespins-result-box p-6 rounded-xl text-center animate-bounce-once
              ${freeSpinsWinType === 'arabic' ? 'arabic-win bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#A67C00] border-4 border-[#8B4513]' : 
                freeSpinsWinType === 'super' ? 'super-win bg-gradient-to-br from-[#7B68EE] via-[#9370DB] to-[#4B0082] border-4 border-[#9400D3]' :
                freeSpinsWinType === 'big' ? 'big-win bg-gradient-to-br from-[#B22222] via-[#DC143C] to-[#8B0000] border-4 border-[#FF4500]' :
                'normal-win bg-gradient-to-br from-[#2E8B57] via-[#3CB371] to-[#006400] border-4 border-[#228B22]'}`}
            >
              <div className="text-4xl font-bold mb-4 text-white drop-shadow-lg shimmering-text">
                {freeSpinsWinType === 'arabic' ? 'عرباوي وين! 🇪🇬✨' : 
                  freeSpinsWinType === 'super' ? 'Super Win! 💥' :
                  freeSpinsWinType === 'big' ? 'Big Win! 🥳' :
                  'Free Spins Completed!'}
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                <span>الدورات المجانية: {freeSipnsTotal}</span>
              </div>
              <div className="text-3xl font-bold mb-4">
                <span className="text-white drop-shadow-md">إجمالي المكاسب:</span>
              </div>
              <div className="text-5xl font-bold text-white bg-black/30 py-3 px-6 rounded-xl">
                {freeSpinsWinnings.toLocaleString()} رقاقة
              </div>
            </div>
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
          isMuted={isMuted}
          toggleMute={toggleMute}
        />

        {/* جدول المكافآت */}
        <PayTable bet={bet} />
      </main>
    </div>
  );
}