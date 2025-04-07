// منطق لعبة صياد السمك
import { 
  Symbol, 
  SymbolType, 
  Reel, 
  Payline,
  Win,
  WinType,
  SpinResult,
  FreeSpinsState,
  GameStatus,
  FishingGameState,
  GameSettings
} from '../types';

import { createRandomReels, getVisibleSymbols, symbols } from './symbols';
import { getActivePaylines, paylines } from './paylines';

/**
 * إنشاء حالة أولية للعبة
 * @param betAmount رهان البداية
 * @param balance رصيد اللاعب
 * @returns حالة اللعبة الأولية
 */
export function initializeGameState(betAmount: number, balance: number): FishingGameState {
  // إنشاء بكرات عشوائية
  const reels = createRandomReels(5, 20, false);
  
  // تحويل البكرات إلى النوع المطلوب
  const typedReels: Reel[] = reels.map(reel => ({
    id: reel.id,
    symbols: reel.symbols,
    position: reel.currentPosition || 0,
    spinning: false
  }));
  
  // الحصول على الرموز المرئية
  const visibleSymbols = getVisibleSymbols(reels);
  
  // إنشاء حالة اللعبة
  return {
    balance,
    betAmount,
    minBet: 0.5,
    maxBet: 50,
    activePaylines: 10,
    gameStatus: GameStatus.IDLE,
    lastWin: null,
    totalWin: 0,
    isAutoSpin: false,
    autoSpinCount: 0,
    visibleSymbols,
    reels: typedReels,
    freeSpins: {
      active: false,
      count: 0,
      totalWin: 0,
      fishermen: 0,
      multiplier: 1
    },
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      fastSpin: false,
      showIntro: true
    }
  };
}

/**
 * إنشاء نتيجة دوران البكرات
 * @param activePaylineCount عدد خطوط الدفع النشطة
 * @param betAmount مبلغ الرهان
 * @param freeSpins حالة اللفات المجانية
 * @returns نتيجة اللفة
 */
export function createSpinResult(
  activePaylineCount: number,
  betAmount: number,
  freeSpins?: FreeSpinsState
): SpinResult {
  // إنشاء بكرات جديدة
  const isFreeSpinActive = freeSpins?.active || false;
  const reels = createRandomReels(5, 20, isFreeSpinActive);
  
  // الحصول على الرموز المرئية
  const visibleSymbols = getVisibleSymbols(reels);
  
  // حساب الفوز على خطوط الدفع
  const { wins, totalWin, triggeredFreeSpins, collectedFisherman, collectedFishSymbols } = calculateWins(
    visibleSymbols,
    activePaylineCount,
    betAmount,
    freeSpins
  );
  
  return {
    totalWin,
    wins,
    reels: reels.map(reel => ({
      id: reel.id,
      symbols: reel.symbols,
      position: reel.currentPosition || 0,
      spinning: false
    })),
    visibleSymbols,
    triggeredFreeSpins,
    collectedFisherman,
    collectedFishSymbols
  };
}

/**
 * حساب الفوز على خطوط الدفع
 */
function calculateWins(
  visibleSymbols: Symbol[][],
  activePaylineCount: number,
  betAmount: number,
  freeSpins?: FreeSpinsState
) {
  const wins: Win[] = [];
  let totalWin = 0;
  let triggeredFreeSpins = 0;
  let collectedFisherman = false;
  const collectedFishSymbols: { position: [number, number]; value: number }[] = [];
  
  // الحصول على خطوط الدفع النشطة
  const activePaylines = getActivePaylines(activePaylineCount);
  
  // التحقق من كل خط دفع
  for (const payline of activePaylines) {
    // الحصول على الرموز على طول خط الدفع
    const lineSymbols: Symbol[] = [];
    
    for (let i = 0; i < visibleSymbols.length; i++) {
      const rowIndex = payline.positions[i];
      const symbol = visibleSymbols[i][rowIndex];
      lineSymbols.push(symbol);
    }
    
    // العثور على أطول تسلسل من الرموز المتشابهة
    const sequence = findLongestSequence(lineSymbols);
    
    // حساب الفوز إذا كان هناك تطابق
    if (sequence.count >= 3) {
      const symbolType = sequence.type;
      const payout = symbols[symbolType].payouts[sequence.count];
      
      // الفوز هو المضاعف × قيمة الرهان
      const winAmount = payout * betAmount;
      
      if (winAmount > 0) {
        // تحديد نوع الفوز
        let winType = WinType.SMALL;
        const multiplier = payout;
        
        if (multiplier >= 5 && multiplier < 20) winType = WinType.MEDIUM;
        else if (multiplier >= 20 && multiplier < 50) winType = WinType.LARGE;
        else if (multiplier >= 50) winType = WinType.MEGA;
        
        wins.push({
          type: winType,
          amount: winAmount,
          payoutMultiplier: payout,
          payline,
          symbols: lineSymbols.slice(0, sequence.count)
        });
        
        totalWin += winAmount;
      }
    }
  }
  
  // التحقق من رموز Scatter
  const scatterCount = countScatterSymbols(visibleSymbols);
  
  if (scatterCount >= 3) {
    // تفعيل اللفات المجانية
    if (scatterCount === 3) triggeredFreeSpins = 10;
    else if (scatterCount === 4) triggeredFreeSpins = 15;
    else if (scatterCount >= 5) triggeredFreeSpins = 20;
    
    // إضافة الفوز من رموز Scatter
    const payout = symbols[SymbolType.BAIT_BOX].payouts[scatterCount];
    const winAmount = payout * betAmount;
    
    if (winAmount > 0) {
      // تحديد نوع الفوز
      let winType = WinType.SMALL;
      const multiplier = payout;
      
      if (multiplier >= 5 && multiplier < 20) winType = WinType.MEDIUM;
      else if (multiplier >= 20 && multiplier < 50) winType = WinType.LARGE;
      else if (multiplier >= 50) winType = WinType.MEGA;
      
      wins.push({
        type: winType,
        amount: winAmount,
        payoutMultiplier: payout,
        symbols: visibleSymbols.flatMap(col => 
          col.filter(s => s.type === SymbolType.BAIT_BOX)
        )
      });
      
      totalWin += winAmount;
    }
  }
  
  // التحقق مما إذا كان هناك صياد جديد في اللفات المجانية
  if (freeSpins?.active) {
    // التحقق من وجود رمز صياد جديد
    for (let i = 0; i < visibleSymbols.length; i++) {
      for (let j = 0; j < visibleSymbols[i].length; j++) {
        const symbol = visibleSymbols[i][j];
        
        if (symbol.type === SymbolType.FISHERMAN) {
          collectedFisherman = true;
          break;
        }
      }
      
      if (collectedFisherman) break;
    }
    
    // جمع رموز الأسماك ذات القيمة النقدية
    for (let i = 0; i < visibleSymbols.length; i++) {
      for (let j = 0; j < visibleSymbols[i].length; j++) {
        const symbol = visibleSymbols[i][j];
        
        if (symbol.type === SymbolType.FISH_MONEY && symbol.value) {
          collectedFishSymbols.push({
            position: [i, j],
            value: symbol.value
          });
        }
      }
    }
  }
  
  return {
    wins,
    totalWin,
    triggeredFreeSpins,
    collectedFisherman,
    collectedFishSymbols
  };
}

/**
 * إيجاد أطول تسلسل من الرموز المتشابهة
 */
function findLongestSequence(lineSymbols: Symbol[]): { type: SymbolType, count: number } {
  let currentType: SymbolType | null = null;
  let currentCount = 0;
  
  for (const symbol of lineSymbols) {
    // التحقق مما إذا كان الرمز الحالي يتطابق مع النوع الحالي أو إذا كان رمز Joker
    const isWild = symbol.isWild;
    const matchesCurrentType = currentType && (symbol.type === currentType || isWild);
    
    if (matchesCurrentType) {
      // زيادة العداد إذا كان الرمز من النوع الحالي
      currentCount++;
    } else {
      // بدء تسلسل جديد
      currentType = isWild ? null : symbol.type;
      currentCount = 1;
    }
  }
  
  return {
    type: currentType || SymbolType.SHELL,
    count: currentCount
  };
}

/**
 * عد رموز Scatter على الشاشة
 */
function countScatterSymbols(visibleSymbols: Symbol[][]): number {
  let count = 0;
  
  for (const column of visibleSymbols) {
    for (const symbol of column) {
      if (symbol.isScatter) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * التحقق من وجود رموز Wild
 */
function hasWildSymbols(visibleSymbols: Symbol[][]): boolean {
  for (const column of visibleSymbols) {
    for (const symbol of column) {
      if (symbol.isWild) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * جمع قيم رموز الأسماك
 */
function collectFishValues(visibleSymbols: Symbol[][]): { position: [number, number]; value: number }[] {
  const result: { position: [number, number]; value: number }[] = [];
  
  for (let i = 0; i < visibleSymbols.length; i++) {
    for (let j = 0; j < visibleSymbols[i].length; j++) {
      const symbol = visibleSymbols[i][j];
      
      if (symbol.type === SymbolType.FISH_MONEY && symbol.value) {
        result.push({
          position: [i, j],
          value: symbol.value
        });
      }
    }
  }
  
  return result;
}

/**
 * تحديث حالة اللفات المجانية
 */
export function updateFreeSpinsState(
  freeSpins: FreeSpinsState,
  triggeredFreeSpins: number,
  collectedFisherman: boolean
): FreeSpinsState {
  // نسخة جديدة من حالة اللفات المجانية
  const updatedFreeSpins = { ...freeSpins };
  
  // تحقق مما إذا كانت اللفات المجانية قد تم تفعيلها
  if (triggeredFreeSpins > 0 && !freeSpins.active) {
    updatedFreeSpins.active = true;
    updatedFreeSpins.count = triggeredFreeSpins;
    updatedFreeSpins.fishermen = 0;
    updatedFreeSpins.multiplier = 1;
    updatedFreeSpins.totalWin = 0;
    
    return updatedFreeSpins;
  }
  
  // تحديث اللفات المجانية النشطة
  if (freeSpins.active) {
    // إذا تم جمع صياد جديد
    if (collectedFisherman) {
      updatedFreeSpins.fishermen += 1;
      
      // تحديث المضاعف بناءً على عدد الصيادين
      if (updatedFreeSpins.fishermen === 4) {
        updatedFreeSpins.multiplier = 2;
      } else if (updatedFreeSpins.fishermen === 8) {
        updatedFreeSpins.multiplier = 3;
      } else if (updatedFreeSpins.fishermen === 12) {
        updatedFreeSpins.multiplier = 10;
      }
    }
    
    // تقليل عدد اللفات المجانية المتبقية
    updatedFreeSpins.count -= 1;
    
    // التحقق مما إذا كانت اللفات المجانية قد انتهت
    if (updatedFreeSpins.count <= 0) {
      updatedFreeSpins.active = false;
    }
  }
  
  return updatedFreeSpins;
}

/**
 * حساب قيمة الفوز من رموز الأسماك المجمعة
 */
export function calculateFishCollectionWin(
  fishSymbols: { position: [number, number]; value: number }[],
  multiplier = 1
): number {
  // حساب إجمالي قيمة الفوز من رموز الأسماك
  return fishSymbols.reduce((total, fish) => {
    return total + fish.value * multiplier;
  }, 0);
}