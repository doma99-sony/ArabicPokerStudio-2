/**
 * منطق لعبة صياد السمك
 * تنفيذ آليات اللعبة الأساسية
 */

import { PAYLINES, getPaylinePositions } from './paylines';
import { getSymbolPayouts } from './symbols';
import { 
  SymbolType, 
  SpinResult, 
  Win, 
  WinType, 
  GameState,
  FreeSpinsState,
  FishingGameState 
} from '../types';

// ثوابت اللعبة
export const REELS_COUNT = 5; // عدد البكرات
export const ROWS_COUNT = 3; // عدد الصفوف في كل بكرة
export const DEFAULT_PAYLINES_COUNT = 10; // عدد خطوط الدفع الافتراضي
export const DEFAULT_BET_AMOUNT = 50; // قيمة الرهان الافتراضية

/**
 * إنشاء مصفوفة بكرات فارغة
 */
export const createEmptyReels = (): SymbolType[][] => {
  const reels: SymbolType[][] = [];
  
  for (let col = 0; col < REELS_COUNT; col++) {
    reels[col] = Array(ROWS_COUNT).fill(SymbolType.FISH_1);
  }
  
  return reels;
};

/**
 * فحص حالات الفوز على خطوط الدفع
 * @param reels مصفوفة البكرات الحالية
 * @param betAmount قيمة الرهان
 * @param multiplier مضاعف الفوز (يستخدم في اللفات المجانية)
 * @param activePaylines عدد خطوط الدفع النشطة (الافتراضي: 10)
 * @returns نتيجة الفوز الإجمالية
 */
export const checkWins = (
  reels: SymbolType[][], 
  betAmount: number, 
  multiplier: number = 1,
  activePaylines: number = DEFAULT_PAYLINES_COUNT
): { wins: Win[], totalWin: number } => {
  const wins: Win[] = [];
  let totalWin = 0;
  
  // فحص خطوط الدفع النشطة
  for (let i = 0; i < activePaylines && i < PAYLINES.length; i++) {
    const paylineId = PAYLINES[i].id;
    const positions = getPaylinePositions(paylineId);
    
    // الحصول على رموز خط الدفع
    const symbols: SymbolType[] = positions.map(([row, col]) => reels[col][row]);
    
    // الرمز الأول في الخط
    const firstSymbol = symbols[0];
    
    // عدد الرموز المتطابقة من اليسار إلى اليمين
    let matchCount = 1;
    
    // حساب عدد الرموز المتطابقة
    for (let j = 1; j < symbols.length; j++) {
      const currentSymbol = symbols[j];
      
      // إذا كان الرمز الحالي يطابق الرمز الأول أو كان Wild (صياد)
      if (currentSymbol === firstSymbol || currentSymbol === SymbolType.WILD || 
          (firstSymbol === SymbolType.WILD && currentSymbol !== SymbolType.BAIT_BOX)) {
        matchCount++;
      } else {
        break;
      }
    }
    
    // الحصول على قيمة الفوز بناءً على عدد الرموز المتطابقة
    if (matchCount >= 3) {
      const symbolType = firstSymbol === SymbolType.WILD ? symbols.find(s => s !== SymbolType.WILD) || SymbolType.WILD : firstSymbol;
      const payouts = getSymbolPayouts(symbolType);
      
      // حساب قيمة الفوز
      if (payouts[matchCount]) {
        const baseWin = payouts[matchCount] * betAmount;
        const winAmount = baseWin * multiplier;
        
        // إضافة الفوز إلى قائمة حالات الفوز
        wins.push({
          type: WinType.LINE,
          amount: winAmount,
          payline: paylineId,
          positions: positions.slice(0, matchCount),
          symbolType
        });
        
        // إضافة قيمة الفوز إلى الإجمالي
        totalWin += winAmount;
      }
    }
  }
  
  // فحص حالات الفوز بالتشتت (Scatter - صندوق الطعم)
  const scatterPositions: [number, number][] = [];
  
  // البحث عن مواضع رموز التشتت في جميع البكرات
  for (let col = 0; col < REELS_COUNT; col++) {
    for (let row = 0; row < ROWS_COUNT; row++) {
      if (reels[col][row] === SymbolType.BAIT_BOX) {
        scatterPositions.push([row, col]);
      }
    }
  }
  
  // حساب قيمة الفوز للتشتت (Scatter)
  const scatterCount = scatterPositions.length;
  
  if (scatterCount >= 3) {
    const scatterPayouts: Record<number, number> = {
      3: 5, // 3 رموز تشتت = 5x قيمة الرهان
      4: 20, // 4 رموز تشتت = 20x قيمة الرهان
      5: 50 // 5 رموز تشتت = 50x قيمة الرهان
    };
    
    const baseWin = scatterPayouts[scatterCount] * betAmount;
    const winAmount = baseWin * multiplier;
    
    wins.push({
      type: WinType.SCATTER,
      amount: winAmount,
      positions: scatterPositions,
      symbolType: SymbolType.BAIT_BOX
    });
    
    totalWin += winAmount;
  }
  
  return { wins, totalWin };
};

/**
 * توليد قيم للأسماك النقدية
 * @param reels مصفوفة البكرات
 * @param betAmount قيمة الرهان
 * @returns قيم الأسماك النقدية
 */
export const generateFishValues = (
  reels: SymbolType[][], 
  betAmount: number
): { [position: string]: number } => {
  const fishValues: { [position: string]: number } = {};
  
  // البحث عن مواضع رموز الأسماك النقدية
  for (let col = 0; col < REELS_COUNT; col++) {
    for (let row = 0; row < ROWS_COUNT; row++) {
      if (reels[col][row] === SymbolType.FISH_MONEY) {
        // تحديد قيمة عشوائية للسمكة النقدية (1-10 أضعاف قيمة الرهان)
        const value = Math.floor(Math.random() * 10 + 1) * betAmount;
        fishValues[`${row},${col}`] = value;
      }
    }
  }
  
  return fishValues;
};

/**
 * جمع قيم الأسماك النقدية إذا كان هناك صياد (Wild) موجود
 * @param reels مصفوفة البكرات
 * @param fishValues قيم الأسماك النقدية
 * @returns نتيجة جمع قيم الأسماك
 */
export const collectFishValues = (
  reels: SymbolType[][], 
  fishValues: { [position: string]: number }
): { totalValue: number; collectedFish: { position: [number, number]; value: number }[] } => {
  const result = {
    totalValue: 0,
    collectedFish: [] as { position: [number, number]; value: number }[]
  };
  
  // التحقق من وجود صياد (Wild) على البكرات
  const hasWild = reels.some(reel => reel.some(symbol => symbol === SymbolType.WILD));
  
  // إذا كان هناك صياد، قم بجمع قيم الأسماك النقدية
  if (hasWild && Object.keys(fishValues).length > 0) {
    // جمع كل قيم الأسماك
    for (const positionStr in fishValues) {
      const [row, col] = positionStr.split(',').map(Number);
      const value = fishValues[positionStr];
      
      result.totalValue += value;
      result.collectedFish.push({
        position: [row, col],
        value
      });
    }
  }
  
  return result;
};

/**
 * التحقق من تفعيل اللفات المجانية
 * @param reels مصفوفة البكرات
 * @returns عدد اللفات المجانية (0 إذا لم يتم التفعيل)
 */
export const checkFreeSpinsTrigger = (reels: SymbolType[][]): number => {
  // عدد رموز التشتت (صندوق الطعم) في البكرات
  let scatterCount = 0;
  
  // حساب عدد رموز التشتت
  for (let col = 0; col < REELS_COUNT; col++) {
    for (let row = 0; row < ROWS_COUNT; row++) {
      if (reels[col][row] === SymbolType.BAIT_BOX) {
        scatterCount++;
      }
    }
  }
  
  // تحديد عدد اللفات المجانية بناءً على عدد رموز التشتت
  if (scatterCount >= 3) {
    return 10; // 10 لفات مجانية عند ظهور 3 أو أكثر من رموز التشتت
  }
  
  return 0;
};

/**
 * تحديث مضاعف اللفات المجانية بناءً على عدد الصيادين
 * @param fishermanCount عدد الصيادين
 * @returns المضاعف الجديد
 */
export const updateFreeSpinsMultiplier = (fishermanCount: number): number => {
  if (fishermanCount >= 12) {
    return 10; // مضاعف x10 عند جمع 12 صياد أو أكثر
  } else if (fishermanCount >= 8) {
    return 3; // مضاعف x3 عند جمع 8-11 صياد
  } else if (fishermanCount >= 4) {
    return 2; // مضاعف x2 عند جمع 4-7 صياد
  } else {
    return 1; // مضاعف x1 إذا كان عدد الصيادين أقل من 4
  }
};