/**
 * وحدة منطق اللعبة - تنفيذ آليات اللعب والفوز في لعبة صياد السمك
 */

import { 
  Symbol, 
  SymbolType, 
  Win, 
  WinType, 
  SpinResult, 
  FreeSpinsState, 
  GameStatus, 
  FishingGameState 
} from '../types';

import { PAYLINES } from './paylines';
import { 
  generateRandomGrid, 
  SYMBOL_PAYOUTS, 
  getFishMoneyValue 
} from './symbols';

/**
 * التحقق من الفوز بناءً على عدد معين من الرموز من نوع معين
 * @param symbolType نوع الرمز للتحقق منه
 * @param count عدد الرموز المتطابقة
 * @param bet قيمة الرهان
 * @returns القيمة المكافئة للفوز (مضاعف الرهان)
 */
const getSymbolPayout = (symbolType: SymbolType, count: number, bet: number): number => {
  if (count < 3) return 0; // يتطلب 3 رموز على الأقل

  const payoutsForSymbol = SYMBOL_PAYOUTS[symbolType];
  if (!payoutsForSymbol) return 0;

  const multiplier = payoutsForSymbol[count];
  if (!multiplier) return 0;

  return multiplier * bet;
};

/**
 * تنفيذ عملية الدوران وحساب النتائج
 * @param bet قيمة الرهان الحالي
 * @param isFreeSpin ما إذا كان هذا دوران مجاني أم لا
 * @param fishermanMultiplier مضاعف الصياد الحالي (للدورات المجانية)
 * @param existingFishmanPositions مواضع الصياد الحالية (للدورات المجانية)
 * @returns نتيجة الدوران
 */
export const spin = (
  bet: number, 
  isFreeSpin: boolean = false,
  fishermanMultiplier: number = 1,
  existingFishmanPositions: [number, number][] = []
): SpinResult => {
  // توليد شبكة الرموز بشكل عشوائي
  const grid = generateRandomGrid(isFreeSpin);
  
  // البحث عن خطوط الفوز
  const lineWins = checkLineWins(grid, bet);
  
  // البحث عن رموز التشتت (صندوق الطعم)
  const scatterWins = checkScatterWins(grid, bet);
  
  // جمع جميع أنواع الفوز
  const allWins = [...lineWins, ...scatterWins];
  
  // حساب إجمالي الفوز
  const totalWin = allWins.reduce((sum, win) => sum + win.amount, 0);
  
  // التحقق مما إذا تم تفعيل اللفات المجانية
  const scatterWin = scatterWins.find(win => win.symbolType === SymbolType.BAIT_BOX);
  const hasFreeSpin = !!scatterWin;
  const freeSpinsAwarded = hasFreeSpin ? (
    scatterWin.count === 3 ? 10 : 
    scatterWin.count === 4 ? 15 : 
    scatterWin.count === 5 ? 20 : 0
  ) : 0;
  
  let fishCollection = null;
  let updatedFishermanMultiplier = fishermanMultiplier;
  let collectedFishermans = 0;
  let collectedFishSymbols: { position: [number, number], value: number }[] = [];
  
  // إذا كان دوران مجاني، تحقق من جمع قيم الأسماك بواسطة الصياد
  if (isFreeSpin) {
    // البحث عن مواضع الصياد الجديدة
    const newFishermanPositions = findSymbolPositions(grid, SymbolType.FISHERMAN);
    
    // دمج مواضع الصياد الحالية مع الجديدة
    const allFishermanPositions = [...existingFishmanPositions, ...newFishermanPositions];
    
    // حساب عدد الصيادين الجدد المجمعين
    collectedFishermans = newFishermanPositions.length;
    
    // تحديث مضاعف الصياد بناءً على العدد الإجمالي للصيادين
    updatedFishermanMultiplier = updateFishermanMultiplier(allFishermanPositions.length);
    
    // جمع قيم الأسماك ذات القيمة النقدية بواسطة الصياد
    if (allFishermanPositions.length > 0) {
      fishCollection = collectFishMoneyValues(grid, allFishermanPositions, bet, updatedFishermanMultiplier);
      
      // إذا تم جمع أي أسماك، أضف قيمتها إلى إجمالي الفوز
      if (fishCollection) {
        collectedFishSymbols = fishCollection.collectedFish;
      }
    }
  }
  
  // تجميع نتيجة الدوران
  const result: SpinResult = {
    symbols: grid,
    wins: allWins,
    totalWin: totalWin + (fishCollection ? fishCollection.totalValue : 0),
    hasFreeSpin,
    freeSpinsAwarded,
    triggeredFreeSpins: hasFreeSpin,
    fishermanMultiplier: updatedFishermanMultiplier,
    fishmanPositions: isFreeSpin ? [...existingFishmanPositions, ...findSymbolPositions(grid, SymbolType.FISHERMAN)] : [],
    collectedFishermans,
    collectedFishSymbols
  };

  return result;
};

/**
 * التحقق من الفوز وفقًا لخطوط الدفع
 */
export const checkLineWins = (grid: Symbol[][], bet: number): Win[] => {
  const wins: Win[] = [];

  // التحقق من كل خط دفع
  PAYLINES.forEach((payline, lineIndex) => {
    // الحصول على رموز هذا الخط
    const lineSymbols: Symbol[] = [];
    
    for (let col = 0; col < 5; col++) {
      const row = payline.positions[col];
      if (grid[col] && grid[col][row]) {
        lineSymbols.push(grid[col][row]);
      }
    }

    if (lineSymbols.length !== 5) return; // يجب أن يكون هناك 5 رموز لخط كامل

    // تخطي الخط إذا كان الرمز الأول هو FISH_MONEY (هذه الرموز لها منطق معالجة خاص)
    if (lineSymbols[0].type === SymbolType.FISH_MONEY) return;

    // البحث عن أطول تطابق من الرموز المتماثلة بدءًا من العمود الأول
    let symbolType = lineSymbols[0].type;
    let count = 1;
    const positions: [number, number][] = [[payline.positions[0], 0]];

    for (let col = 1; col < 5; col++) {
      const currentSymbol = lineSymbols[col];
      
      // الصياد (FISHERMAN) يعمل كرمز Wild ويمكنه مطابقة أي رمز آخر
      if (currentSymbol.type === symbolType || currentSymbol.type === SymbolType.FISHERMAN || 
         (symbolType === SymbolType.FISHERMAN && currentSymbol.type !== SymbolType.BAIT_BOX && currentSymbol.type !== SymbolType.FISH_MONEY)) {
        count++;
        positions.push([payline.positions[col], col]);
      } else {
        break;
      }
    }

    // التحقق من عدد الرموز المتطابقة
    if (count >= 3) {
      // إذا كان الرمز الأول هو FISHERMAN، ونجحنا في مطابقة رموز أخرى، نستخدم النوع الثاني كنوع الرمز الفائز
      if (symbolType === SymbolType.FISHERMAN && count > 1) {
        for (let i = 1; i < lineSymbols.length && i < count; i++) {
          if (lineSymbols[i].type !== SymbolType.FISHERMAN && 
              lineSymbols[i].type !== SymbolType.BAIT_BOX && 
              lineSymbols[i].type !== SymbolType.FISH_MONEY) {
            symbolType = lineSymbols[i].type;
            break;
          }
        }
      }

      // تخطي الفوز إذا كان الرمز هو BAIT_BOX (يتم التعامل معه في فحص رموز التشتت)
      if (symbolType === SymbolType.BAIT_BOX) return;

      // حساب قيمة الفوز
      const amount = getSymbolPayout(symbolType, count, bet);
      
      if (amount > 0) {
        wins.push({
          type: WinType.LINE,
          symbolType,
          count,
          positions,
          multiplier: SYMBOL_PAYOUTS[symbolType][count],
          amount,
          lineIndex
        });
      }
    }
  });

  return wins;
};

/**
 * التحقق من فوز رموز التشتت (صندوق الطعم)
 */
export const checkScatterWins = (grid: Symbol[][], bet: number): Win[] => {
  const wins: Win[] = [];
  
  // البحث عن رموز BAIT_BOX (رموز التشتت)
  const scatterPositions = findSymbolPositions(grid, SymbolType.BAIT_BOX);
  const scatterCount = scatterPositions.length;
  
  // يجب أن يكون هناك 3 رموز تشتت على الأقل للفوز
  if (scatterCount >= 3) {
    const amount = getSymbolPayout(SymbolType.BAIT_BOX, scatterCount, bet);
    
    if (amount > 0) {
      wins.push({
        type: WinType.SCATTER,
        symbolType: SymbolType.BAIT_BOX,
        count: scatterCount,
        positions: scatterPositions,
        multiplier: SYMBOL_PAYOUTS[SymbolType.BAIT_BOX][scatterCount],
        amount
      });
    }
  }
  
  return wins;
};

/**
 * جمع قيم رموز السمك ذات القيمة النقدية بواسطة رموز الصياد
 */
export const collectFishMoneyValues = (
  grid: Symbol[][], 
  fishermanPositions: [number, number][],
  bet: number,
  multiplier: number = 1
): { totalValue: number, collectedFish: { position: [number, number], value: number }[] } => {
  let totalValue = 0;
  const collectedFish: { position: [number, number], value: number }[] = [];
  
  // البحث عن جميع رموز FISH_MONEY في الشبكة
  const fishMoneyPositions = findSymbolPositions(grid, SymbolType.FISH_MONEY);
  
  // لكل رمز سمكة ذات قيمة نقدية
  fishMoneyPositions.forEach(fishPos => {
    const fishSymbol = grid[fishPos[1]][fishPos[0]];
    
    if (fishSymbol && fishSymbol.type === SymbolType.FISH_MONEY && fishSymbol.value !== undefined) {
      // الحصول على قيمة السمكة وتطبيق المضاعف
      const fishValue = fishSymbol.value * bet * multiplier;
      
      // إضافة قيمة السمكة إلى القيمة الإجمالية
      totalValue += fishValue;
      
      // إضافة معلومات السمكة إلى قائمة الأسماك المجمعة
      collectedFish.push({
        position: fishPos,
        value: fishValue
      });
    }
  });
  
  // إنشاء كائن الفوز لجمع الأسماك
  const win: Win = {
    type: WinType.FISHERMAN,
    symbolType: SymbolType.FISHERMAN,
    count: fishermanPositions.length,
    positions: fishermanPositions,
    multiplier: multiplier,
    amount: totalValue
  };
  
  return {
    totalValue,
    collectedFish,
    win
  };
};

/**
 * حساب عدد الرموز من نوع معين في الشبكة
 */
export const countSymbolsOfType = (grid: Symbol[][], symbolType: SymbolType): number => {
  let count = 0;
  
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      if (grid[col][row].type === symbolType) {
        count++;
      }
    }
  }
  
  return count;
};

/**
 * البحث عن مواقع رمز معين في الشبكة
 */
export const findSymbolPositions = (grid: Symbol[][], symbolType: SymbolType): [number, number][] => {
  const positions: [number, number][] = [];
  
  for (let col = 0; col < grid.length; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      if (grid[col][row].type === symbolType) {
        positions.push([row, col]);
      }
    }
  }
  
  return positions;
};

/**
 * تحديث مضاعف الصياد بناءً على عدد الصيادين الذين تم جمعهم
 * تزداد قيمة المضاعف عند جمع 4 أو 8 أو 12 صياد
 */
export const updateFishermanMultiplier = (collectedFisherman: number): number => {
  if (collectedFisherman >= 12) {
    return 10;  // مضاعف 10x عند جمع 12 أو أكثر
  } else if (collectedFisherman >= 8) {
    return 3;   // مضاعف 3x عند جمع 8-11
  } else if (collectedFisherman >= 4) {
    return 2;   // مضاعف 2x عند جمع 4-7
  } else {
    return 1;   // مضاعف 1x افتراضي
  }
};

/**
 * تهيئة حالة اللفات المجانية
 */
export const initFreeSpinsState = (freeSpinsCount: number): FreeSpinsState => {
  return {
    active: true,
    remaining: freeSpinsCount,
    collectedFisherman: 0,
    fishermanMultiplier: 1,
    totalWin: 0,
    fishermanPositions: []
  };
};

/**
 * تهيئة حالة اللعبة الأولية
 */
export const initGameState = (initialBalance: number): FishingGameState => {
  const defaultBet = 1.0;
  
  return {
    balance: initialBalance,
    bet: defaultBet,
    status: GameStatus.IDLE,
    symbols: generateRandomGrid(false),
    lastWin: 0,
    totalWin: 0,
    isAutoPlay: false,
    paylines: 20, // عدد خطوط الدفع الثابت
    freeSpins: {
      active: false,
      remaining: 0,
      collectedFisherman: 0,
      fishermanMultiplier: 1,
      totalWin: 0,
      fishermanPositions: []
    },
    currentWins: [],
    fishermanPositions: [],
    collectedFishValues: [],
    bonusMultiplier: 1
  };
};