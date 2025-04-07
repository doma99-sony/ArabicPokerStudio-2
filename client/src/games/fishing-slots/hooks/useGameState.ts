/**
 * Hook لإدارة حالة لعبة صياد السمك
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  REELS_COUNT, 
  ROWS_COUNT, 
  createEmptyReels, 
  checkWins, 
  generateFishValues, 
  collectFishValues 
} from '../utils/game-logic';

import { SymbolType, GameState, WinType, FishingGameState, SpinResult, FreeSpinsState, Win } from '../types';

/**
 * التهيئة الأولية لحالة اللفات المجانية
 */
const initFreeSpinsState = (): FreeSpinsState => ({
  active: false,
  remaining: 0,
  multiplier: 1,
  fishermanCount: 0,
  collectedFishValues: 0
});

/**
 * التهيئة الأولية لحالة اللعبة
 */
const initGameState = (): FishingGameState => ({
  balance: 5000, // رصيد افتراضي للاختبار
  betAmount: 50, // قيمة الرهان الافتراضية
  reels: [
    [SymbolType.FISH_1, SymbolType.SHELL, SymbolType.ANCHOR],
    [SymbolType.FISH_2, SymbolType.CRAB, SymbolType.STARFISH],
    [SymbolType.FISH_3, SymbolType.FISH_2, SymbolType.FISH_1],
    [SymbolType.SHELL, SymbolType.ANCHOR, SymbolType.WILD],
    [SymbolType.STARFISH, SymbolType.FISH_1, SymbolType.CRAB]
  ],
  gameState: GameState.IDLE,
  lastWin: 0,
  wins: [],
  winPositions: [],
  freeSpins: initFreeSpinsState(),
  autoPlayActive: false,
  totalBet: 50, // إجمالي الرهان (الرهان × خطوط الدفع)
  paylineCount: 10, // عدد خطوط الدفع النشطة
  fishValues: {} // قيم الأسماك النقدية
});

/**
 * محاكاة نتيجة دوران البكرات
 * في التطبيق الحقيقي، يجب استدعاء الخادم للحصول على النتيجة
 */
const simulateSpinResult = (
  betAmount: number, 
  inFreeSpins: boolean = false, 
  multiplier: number = 1
): SpinResult => {
  // إنشاء وتعبئة البكرات بشكل عشوائي
  const reels: SymbolType[][] = createEmptyReels();
  
  // ملء البكرات بالرموز بشكل عشوائي
  for (let col = 0; col < REELS_COUNT; col++) {
    for (let row = 0; row < ROWS_COUNT; row++) {
      // احتمالية أكبر للرموز ذات القيمة المنخفضة
      const randValue = Math.random();
      let symbol: SymbolType;
      
      if (randValue < 0.01) {
        symbol = SymbolType.WILD; // احتمالية منخفضة للصياد (Wild)
      } else if (randValue < 0.05) {
        symbol = SymbolType.BAIT_BOX; // احتمالية منخفضة لصندوق الطعم (Scatter)
      } else if (randValue < 0.10) {
        // احتمالية السمكة النقدية أكبر في اللفات المجانية
        symbol = inFreeSpins && Math.random() < 0.4 ? SymbolType.FISH_MONEY : SymbolType.FISH_1;
      } else if (randValue < 0.20) {
        symbol = SymbolType.FISH_2;
      } else if (randValue < 0.30) {
        symbol = SymbolType.FISH_3;
      } else if (randValue < 0.45) {
        symbol = SymbolType.STARFISH;
      } else if (randValue < 0.60) {
        symbol = SymbolType.SHELL;
      } else if (randValue < 0.75) {
        symbol = SymbolType.ANCHOR;
      } else {
        symbol = SymbolType.CRAB;
      }
      
      reels[col][row] = symbol;
    }
  }
  
  // التحقق من حالات الفوز على خطوط الدفع
  const winResult = checkWins(reels, betAmount, multiplier);
  
  // إنشاء قيم للأسماك النقدية (إذا كانت موجودة)
  const fishValues = generateFishValues(reels, betAmount);
  
  // حساب إجمالي الفوز
  const totalWin = winResult.totalWin;
  
  // تحديد ما إذا كانت قد تم تفعيل اللفات المجانية (عند ظهور 3 أو أكثر من صناديق الطعم)
  const scatterCount = winResult.wins.filter(win => win.type === WinType.SCATTER).length;
  const triggeredFreeSpins = scatterCount >= 3 ? 10 : 0;
  
  return {
    reels,
    wins: winResult.wins,
    totalWin,
    triggeredFreeSpins,
    fishValues
  };
};

/**
 * Hook إدارة حالة اللعبة
 */
export const useGameState = () => {
  const [gameState, setGameState] = useState<FishingGameState>(initGameState);
  
  // تغيير قيمة الرهان
  const changeBet = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      betAmount: amount,
      totalBet: amount * prev.paylineCount
    }));
  }, []);
  
  // تعيين الرهان الأقصى
  const setMaxBet = useCallback(() => {
    setGameState(prev => {
      const maxBet = 1000; // أقصى قيمة للرهان
      return {
        ...prev,
        betAmount: maxBet,
        totalBet: maxBet * prev.paylineCount
      };
    });
  }, []);
  
  // تغيير عدد خطوط الدفع النشطة
  const changePaylines = useCallback((count: number) => {
    setGameState(prev => ({
      ...prev,
      paylineCount: count,
      totalBet: prev.betAmount * count
    }));
  }, []);
  
  // تبديل وضع اللعب التلقائي
  const toggleAutoPlay = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      autoPlayActive: !prev.autoPlayActive
    }));
  }, []);
  
  // معالجة نتيجة اللفة الحرة
  const handleFreeSpinResult = useCallback((result: SpinResult) => {
    setGameState(prev => {
      // جمع قيم الأسماك النقدية إذا كان هناك صياد (WILD) موجود
      const fishCollectResult = collectFishValues(result.reels, result.fishValues || {});
      
      // تحديث عدد الصيادين وتطبيق المضاعف المناسب
      let { fishermanCount, multiplier } = prev.freeSpins;
      let newFishermanCount = fishermanCount;
      
      // إضافة عدد الصيادين الجدد
      const wildsCount = result.reels.flat().filter(symbol => symbol === SymbolType.WILD).length;
      newFishermanCount += wildsCount;
      
      // تحديث المضاعف بناءً على عدد الصيادين
      let newMultiplier = multiplier;
      if (newFishermanCount >= 12) {
        newMultiplier = 10;
      } else if (newFishermanCount >= 8) {
        newMultiplier = 3;
      } else if (newFishermanCount >= 4) {
        newMultiplier = 2;
      }
      
      // إضافة قيمة الفوز من الأسماك النقدية
      const collectedFishValues = prev.freeSpins.collectedFishValues + (fishCollectResult.totalValue * newMultiplier);
      
      // تحديث حالة اللفات المجانية
      const remaining = prev.freeSpins.remaining - 1;
      const active = remaining > 0;
      
      return {
        ...prev,
        reels: result.reels,
        lastWin: result.totalWin + fishCollectResult.totalValue * newMultiplier,
        wins: result.wins,
        winPositions: result.wins.flatMap(win => win.positions),
        fishValues: result.fishValues || {},
        gameState: active ? GameState.WIN_ANIMATION : GameState.IDLE,
        freeSpins: {
          active,
          remaining,
          multiplier: newMultiplier,
          fishermanCount: newFishermanCount,
          collectedFishValues
        }
      };
    });
  }, []);
  
  // قم بالدوران
  const spin = useCallback(() => {
    setGameState(prev => {
      // لا يمكن الدوران إذا لم تكن اللعبة في حالة انتظار أو إذا كان الرصيد غير كافٍ
      if (prev.gameState !== GameState.IDLE || prev.balance < prev.totalBet) {
        return prev;
      }
      
      // خصم قيمة الرهان من الرصيد في اللعبة العادية (ليس في اللفات المجانية)
      const newBalance = prev.freeSpins.active ? prev.balance : prev.balance - prev.totalBet;
      
      return {
        ...prev,
        balance: newBalance,
        gameState: GameState.SPINNING
      };
    });
    
    // محاكاة تأخير دوران البكرات (1.5 ثانية)
    setTimeout(() => {
      setGameState(prev => {
        // الحصول على نتيجة الدوران
        const inFreeSpins = prev.freeSpins.active;
        const multiplier = prev.freeSpins.multiplier;
        const result = simulateSpinResult(prev.betAmount, inFreeSpins, multiplier);
        
        // إذا كانت اللفات المجانية نشطة، معالجة نتيجة اللفة الحرة
        if (inFreeSpins) {
          handleFreeSpinResult(result);
          return prev; // تم التعامل مع التحديث في handleFreeSpinResult
        }
        
        // حساب الفوز الإجمالي
        let totalWin = 0;
        result.wins.forEach(win => {
          totalWin += win.amount;
        });
        
        // إذا تم تفعيل اللفات المجانية
        if (result.triggeredFreeSpins > 0) {
          return {
            ...prev,
            reels: result.reels,
            lastWin: totalWin,
            wins: result.wins,
            winPositions: result.wins.flatMap(win => win.positions),
            fishValues: result.fishValues || {},
            balance: prev.balance + totalWin,
            gameState: GameState.WIN_ANIMATION,
            freeSpins: {
              ...initFreeSpinsState(),
              active: true,
              remaining: result.triggeredFreeSpins
            }
          };
        }
        
        // نتيجة اللعبة العادية
        return {
          ...prev,
          reels: result.reels,
          lastWin: totalWin,
          wins: result.wins,
          winPositions: result.wins.flatMap(win => win.positions),
          fishValues: result.fishValues || {},
          balance: prev.balance + totalWin,
          gameState: totalWin > 0 ? GameState.WIN_ANIMATION : GameState.IDLE
        };
      });
    }, 1500);
  }, [handleFreeSpinResult]);
  
  // انتقال من حالة عرض الفوز إلى حالة الانتظار
  const completeWinAnimation = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: GameState.IDLE
    }));
  }, []);
  
  // إعادة ضبط اللعبة
  const resetGame = useCallback(() => {
    setGameState(initGameState);
  }, []);
  
  // تحديث الرصيد (للاستخدام الخارجي، مثل عند شحن الرصيد)
  const updateBalance = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      balance: amount
    }));
  }, []);
  
  // اللعب التلقائي
  useEffect(() => {
    let autoPlayTimer: NodeJS.Timeout | null = null;
    
    if (gameState.autoPlayActive && gameState.gameState === GameState.IDLE && gameState.balance >= gameState.totalBet) {
      autoPlayTimer = setTimeout(() => {
        spin();
      }, 1000);
    }
    
    return () => {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
      }
    };
  }, [gameState.autoPlayActive, gameState.gameState, gameState.balance, gameState.totalBet, spin]);
  
  return {
    ...gameState,
    spin,
    changeBet,
    setMaxBet,
    changePaylines,
    toggleAutoPlay,
    completeWinAnimation,
    resetGame,
    updateBalance
  };
};