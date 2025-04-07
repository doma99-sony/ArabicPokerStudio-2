/**
 * خطاف إدارة حالة لعبة صياد السمك
 * يتحكم في منطق اللعبة ودورة الحياة بالكامل
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  REELS_COUNT, ROWS_COUNT, DEFAULT_PAYLINES_COUNT, DEFAULT_BET_AMOUNT,
  createEmptyReels, checkWins, generateFishValues, collectFishValues,
  checkFreeSpinsTrigger, updateFreeSpinsMultiplier
} from '../utils/game-logic';
import { HIGH_VALUE_SYMBOLS, LOW_VALUE_SYMBOLS } from '../utils/symbols';
import { 
  SymbolType, GameState, FishingGameState, FreeSpinsState,
  Win, WinType, SpinResult
} from '../types';

// قيم افتراضية لحالة اللفات المجانية
const DEFAULT_FREE_SPINS_STATE: FreeSpinsState = {
  active: false,
  spinsRemaining: 0,
  totalSpins: 0,
  multiplier: 1,
  collectedWild: 0,
  totalWin: 0
};

/**
 * إنشاء مصفوفة من بكرات عشوائية للعبة
 * @param inFreeSpin هل نحن في وضع اللفات المجانية
 * @returns مصفوفة من الرموز العشوائية
 */
const generateRandomReels = (inFreeSpin: boolean = false): SymbolType[][] => {
  // توزيع الرموز بشكل عشوائي مع مراعاة احتمالية ظهور كل رمز
  const reels: SymbolType[][] = [];
  
  // تمثيل الرموز المختلفة
  const allSymbols = [
    SymbolType.FISH_1, SymbolType.SHELL, SymbolType.ANCHOR,
    SymbolType.FISH_2, SymbolType.CRAB, SymbolType.STARFISH,
    SymbolType.FISH_3, SymbolType.FISH_2, SymbolType.FISH_1,
    SymbolType.SHELL, SymbolType.ANCHOR, SymbolType.WILD,
    SymbolType.STARFISH, SymbolType.FISH_1, SymbolType.CRAB
  ];
  
  // إنشاء بكرات عشوائية
  for (let col = 0; col < REELS_COUNT; col++) {
    reels[col] = [];
    for (let row = 0; row < ROWS_COUNT; row++) {
      // اختيار رمز عشوائي
      const randomIndex = Math.floor(Math.random() * allSymbols.length);
      reels[col][row] = allSymbols[randomIndex];
      
      // إضافة احتمالية ظهور رموز خاصة
      if (Math.random() < 0.05 && !inFreeSpin) {
        // احتمالية 5% لظهور صندوق الطعم خارج اللفات المجانية
        reels[col][row] = SymbolType.BAIT_BOX;
      } else if (Math.random() < 0.05) {
        // احتمالية 5% لظهور سمكة نقدية
        reels[col][row] = SymbolType.FISH_MONEY;
      } else if (inFreeSpin && Math.random() < 0.08) {
        // احتمالية 8% لظهور صياد في اللفات المجانية
        reels[col][row] = SymbolType.WILD;
      } else if (Math.random() < 0.03) {
        // احتمالية 3% لظهور صياد في اللعب العادي
        reels[col][row] = SymbolType.WILD;
      }
    }
  }
  
  return reels;
};

/**
 * خطاف إدارة حالة لعبة صياد السمك
 * @param initialBalance الرصيد الابتدائي للاعب
 * @returns حالة اللعبة ودوال التحكم
 */
export const useGameState = (initialBalance: number = 10000) => {
  // حالة اللعبة الرئيسية
  const [gameState, setGameState] = useState<FishingGameState>({
    balance: initialBalance,
    betAmount: DEFAULT_BET_AMOUNT,
    totalBet: DEFAULT_BET_AMOUNT * DEFAULT_PAYLINES_COUNT,
    reels: createEmptyReels(),
    gameState: GameState.IDLE,
    lastWin: 0,
    activePaylines: DEFAULT_PAYLINES_COUNT,
    paylineWins: [],
    scatterWins: [],
    fishMoneyWins: [],
    fishValues: {},
    freeSpins: { ...DEFAULT_FREE_SPINS_STATE },
    autoPlayActive: false,
    canSpin: true
  });
  
  // معالجة نتيجة الدوران
  const handleSpinResult = useCallback((result: SpinResult) => {
    setGameState(prev => ({
      ...prev,
      reels: result.reels,
      lastWin: result.totalWin,
      fishValues: result.fishValues || {}
    }));
    
    // تأخير للحفاظ على تأثير الدوران
    setTimeout(() => {
      // إظهار الفوز إذا كان هناك فوز
      if (result.totalWin > 0) {
        // تصنيف حالات الفوز
        const paylineWins = result.wins.filter(win => win.type === WinType.LINE);
        const scatterWins = result.wins.filter(win => win.type === WinType.SCATTER);
        const fishMoneyWins = result.wins.filter(win => win.type === WinType.FISH_MONEY);
        
        setGameState(prev => ({
          ...prev,
          gameState: GameState.WIN_ANIMATION,
          paylineWins,
          scatterWins,
          fishMoneyWins,
          balance: prev.balance + result.totalWin
        }));
        
        // تأخير قبل عرض اللفات المجانية إذا تم تفعيلها
        setTimeout(() => {
          if (result.triggeredFreeSpins > 0) {
            startFreeSpins(result.triggeredFreeSpins);
          }
        }, 2000);
      } else {
        // لا فوز، العودة إلى وضع الانتظار
        setGameState(prev => ({
          ...prev,
          gameState: GameState.IDLE,
          canSpin: true
        }));
      }
    }, 1000);
  }, []);
  
  // معالجة نتيجة الدوران في وضع اللفات المجانية
  const handleFreeSpinResult = useCallback((result: SpinResult) => {
    // حساب عدد رموز الصياد (Wild) في النتيجة
    const wildCount = result.reels.flat().filter(symbol => symbol === SymbolType.WILD).length;
    
    setGameState(prev => {
      // تحديث حالة اللفات المجانية
      const collectedWild = prev.freeSpins.collectedWild + wildCount;
      
      // تحديث قيمة المضاعف بناءً على عدد الصيادين المجموعين
      const multiplier = updateFreeSpinsMultiplier(collectedWild);
      
      // تحديث باقي اللفات المجانية
      const spinsRemaining = prev.freeSpins.spinsRemaining - 1;
      
      return {
        ...prev,
        reels: result.reels,
        lastWin: result.totalWin,
        fishValues: result.fishValues || {},
        freeSpins: {
          ...prev.freeSpins,
          collectedWild,
          multiplier,
          spinsRemaining,
          totalWin: prev.freeSpins.totalWin + result.totalWin
        }
      };
    });
    
    // تأخير للحفاظ على تأثير الدوران
    setTimeout(() => {
      // عرض الفوز وتحديث الرصيد
      if (result.totalWin > 0) {
        // تصنيف حالات الفوز
        const paylineWins = result.wins.filter(win => win.type === WinType.LINE);
        const scatterWins = result.wins.filter(win => win.type === WinType.SCATTER);
        const fishMoneyWins = result.wins.filter(win => win.type === WinType.FISH_MONEY);
        
        setGameState(prev => ({
          ...prev,
          gameState: GameState.WIN_ANIMATION,
          paylineWins,
          scatterWins,
          fishMoneyWins,
          balance: prev.balance + result.totalWin
        }));
        
        // تحقق من تفعيل المزيد من اللفات المجانية
        if (result.triggeredFreeSpins > 0) {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              freeSpins: {
                ...prev.freeSpins,
                spinsRemaining: prev.freeSpins.spinsRemaining + result.triggeredFreeSpins,
                totalSpins: prev.freeSpins.totalSpins + result.triggeredFreeSpins
              }
            }));
            
            // الدوران التالي بعد عرض الفوز
            setTimeout(() => continueFreeSpins(), 2000);
          }, 2000);
        } else {
          // الدوران التالي بعد عرض الفوز
          setTimeout(() => continueFreeSpins(), 2000);
        }
      } else {
        // لا فوز، الانتقال مباشرة إلى الدوران التالي أو إنهاء اللفات المجانية
        continueFreeSpins();
      }
    }, 1000);
  }, []);
  
  // بدء دوران جديد
  const spin = useCallback(() => {
    // التحقق من إمكانية الدوران
    if (!gameState.canSpin || gameState.gameState !== GameState.IDLE) {
      return;
    }
    
    // خصم قيمة الرهان من الرصيد
    if (gameState.balance < gameState.totalBet) {
      // لا يوجد رصيد كافٍ
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      gameState: GameState.SPINNING,
      balance: prev.balance - prev.totalBet,
      canSpin: false
    }));
    
    // محاكاة الدوران وإنشاء بكرات عشوائية
    setTimeout(() => {
      const reels = generateRandomReels();
      const { wins, totalWin } = checkWins(reels, gameState.betAmount);
      const triggeredFreeSpins = checkFreeSpinsTrigger(reels);
      const fishValues = generateFishValues(reels, gameState.betAmount);
      
      // جمع قيم الأسماك النقدية إذا كان هناك صياد
      const fishMoneyResults = collectFishValues(reels, fishValues);
      
      // إضافة فوز الأسماك النقدية إذا وجد
      const totalFishWin = fishMoneyResults.totalValue;
      
      if (totalFishWin > 0) {
        wins.push({
          type: WinType.FISH_MONEY,
          amount: totalFishWin,
          positions: fishMoneyResults.collectedFish.map(fish => fish.position)
        });
      }
      
      // إعداد نتيجة الدوران
      const spinResult: SpinResult = {
        reels,
        wins,
        totalWin: totalWin + totalFishWin,
        triggeredFreeSpins,
        fishValues
      };
      
      handleSpinResult(spinResult);
    }, 1500);
  }, [gameState, handleSpinResult]);
  
  // بدء وضع اللفات المجانية
  const startFreeSpins = useCallback((spinsCount: number) => {
    setGameState(prev => ({
      ...prev,
      gameState: GameState.FREE_SPINS,
      freeSpins: {
        active: true,
        spinsRemaining: spinsCount,
        totalSpins: spinsCount,
        multiplier: 1,
        collectedWild: 0,
        totalWin: 0
      }
    }));
    
    // بدء أول لفة مجانية بعد التأخير
    setTimeout(() => {
      freeSpin();
    }, 2000);
  }, []);
  
  // مواصلة اللفات المجانية
  const continueFreeSpins = useCallback(() => {
    setGameState(prev => {
      // التحقق من بقاء لفات مجانية
      if (prev.freeSpins.spinsRemaining > 0) {
        // المزيد من اللفات المجانية
        setTimeout(() => {
          freeSpin();
        }, 1000);
        
        return {
          ...prev,
          gameState: GameState.FREE_SPINS
        };
      } else {
        // انتهت اللفات المجانية
        return {
          ...prev,
          gameState: GameState.IDLE,
          canSpin: true,
          freeSpins: { ...DEFAULT_FREE_SPINS_STATE }
        };
      }
    });
  }, []);
  
  // تنفيذ لفة مجانية واحدة
  const freeSpin = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: GameState.SPINNING
    }));
    
    // محاكاة الدوران وإنشاء بكرات عشوائية في وضع اللفات المجانية
    setTimeout(() => {
      const reels = generateRandomReels(true);
      const { wins, totalWin } = checkWins(
        reels, 
        gameState.betAmount, 
        gameState.freeSpins.multiplier, 
        gameState.activePaylines
      );
      const triggeredFreeSpins = checkFreeSpinsTrigger(reels);
      const fishValues = generateFishValues(reels, gameState.betAmount);
      
      // جمع قيم الأسماك النقدية إذا كان هناك صياد
      const fishMoneyResults = collectFishValues(reels, fishValues);
      
      // إضافة فوز الأسماك النقدية إذا وجد
      const totalFishWin = fishMoneyResults.totalValue;
      
      if (totalFishWin > 0) {
        wins.push({
          type: WinType.FISH_MONEY,
          amount: totalFishWin * gameState.freeSpins.multiplier,
          positions: fishMoneyResults.collectedFish.map(fish => fish.position)
        });
      }
      
      // إعداد نتيجة الدوران
      const spinResult: SpinResult = {
        reels,
        wins,
        totalWin: totalWin + (totalFishWin * gameState.freeSpins.multiplier),
        triggeredFreeSpins,
        fishValues
      };
      
      handleFreeSpinResult(spinResult);
    }, 1500);
  }, [gameState, handleFreeSpinResult]);
  
  // تغيير قيمة الرهان
  const changeBet = useCallback((amount: number) => {
    if (gameState.gameState !== GameState.IDLE) return;
    
    setGameState(prev => ({
      ...prev,
      betAmount: amount,
      totalBet: amount * prev.activePaylines
    }));
  }, [gameState.gameState]);
  
  // تعيين الرهان الأقصى
  const setMaxBet = useCallback(() => {
    if (gameState.gameState !== GameState.IDLE) return;
    
    // تعيين قيمة الرهان الأقصى (مثال: 500)
    const maxBet = 500;
    
    setGameState(prev => ({
      ...prev,
      betAmount: maxBet,
      totalBet: maxBet * prev.activePaylines
    }));
  }, [gameState.gameState]);
  
  // تبديل وضع اللعب التلقائي
  const toggleAutoPlay = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      autoPlayActive: !prev.autoPlayActive
    }));
  }, []);
  
  // تغيير عدد خطوط الدفع النشطة
  const changeActivePaylines = useCallback((count: number) => {
    if (gameState.gameState !== GameState.IDLE) return;
    
    setGameState(prev => ({
      ...prev,
      activePaylines: count,
      totalBet: prev.betAmount * count
    }));
  }, [gameState.gameState]);
  
  // تأثير للعب التلقائي
  useEffect(() => {
    let autoPlayInterval: NodeJS.Timeout | null = null;
    
    if (gameState.autoPlayActive && gameState.gameState === GameState.IDLE && gameState.canSpin) {
      autoPlayInterval = setInterval(() => {
        spin();
      }, 3000);
    }
    
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [gameState.autoPlayActive, gameState.gameState, gameState.canSpin, spin]);
  
  return {
    gameState,
    spin,
    changeBet,
    setMaxBet,
    toggleAutoPlay,
    changeActivePaylines
  };
};

export default useGameState;