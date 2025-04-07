// رموز لعبة صياد السمك
import { Symbol, SymbolType } from '../types';

/**
 * تعريفات الرموز المستخدمة في اللعبة
 * مع احتمالات ظهورها النسبية
 */
export const symbols = {
  // الصياد (Wild)
  [SymbolType.FISHERMAN]: {
    weight: 1, // احتمالية ظهور منخفضة
    payouts: [0, 0, 5, 25, 100], // مضاعفات الدفع (0, 1, 2, 3, 4, 5 مطابقة)
    isWild: true
  },
  
  // صندوق الطعم (Scatter)
  [SymbolType.BAIT_BOX]: {
    weight: 1, // احتمالية ظهور منخفضة
    payouts: [0, 0, 2, 5, 20], // مضاعفات الدفع
    isScatter: true
  },
  
  // سمكة بقيمة عالية
  [SymbolType.FISH_3]: {
    weight: 3,
    payouts: [0, 0, 3, 10, 50]
  },
  
  // سمكة بقيمة متوسطة
  [SymbolType.FISH_2]: {
    weight: 5,
    payouts: [0, 0, 2, 6, 25]
  },
  
  // سمكة بقيمة منخفضة
  [SymbolType.FISH_1]: {
    weight: 8,
    payouts: [0, 0, 1, 4, 15]
  },
  
  // نجم البحر
  [SymbolType.STARFISH]: {
    weight: 10,
    payouts: [0, 0, 0.5, 2, 10]
  },
  
  // صدفة
  [SymbolType.SHELL]: {
    weight: 12,
    payouts: [0, 0, 0.5, 1.5, 8]
  },
  
  // مرساة
  [SymbolType.ANCHOR]: {
    weight: 12,
    payouts: [0, 0, 0.5, 1.5, 8]
  },
  
  // سلطعون
  [SymbolType.CRAB]: {
    weight: 10,
    payouts: [0, 0, 0.5, 2, 10]
  },
  
  // سمكة ذات قيمة نقدية (تظهر فقط في اللفات المجانية)
  [SymbolType.FISH_MONEY]: {
    weight: 0, // لا تظهر في اللعبة العادية
    payouts: [0, 0, 0, 0, 0] // لا تعطي أي مكافأة مباشرة
  }
};

/**
 * إنشاء مجموعة رموز عشوائية للشريط
 * @param includeMoneyFish هل يجب تضمين رموز الأسماك النقدية؟ (تظهر فقط في اللفات المجانية)
 * @returns مصفوفة من الرموز
 */
export function createRandomSymbols(count: number, includeMoneyFish = false): Symbol[] {
  const result: Symbol[] = [];
  const symbolTypes = Object.keys(symbols) as SymbolType[];
  
  // إنشاء مصفوفة وزن تراكمية للاختيار العشوائي
  const weightSum = symbolTypes.reduce((sum, type) => {
    // تجاهل رموز الأسماك النقدية إذا كانت غير مضمنة
    if (type === SymbolType.FISH_MONEY && !includeMoneyFish) {
      return sum;
    }
    return sum + symbols[type].weight;
  }, 0);
  
  // إنشاء الرموز
  for (let i = 0; i < count; i++) {
    let random = Math.random() * weightSum;
    let selectedType: SymbolType | null = null;
    
    // اختيار الرمز بناءً على وزنه النسبي
    for (const type of symbolTypes) {
      // تجاهل رموز الأسماك النقدية إذا كانت غير مضمنة
      if (type === SymbolType.FISH_MONEY && !includeMoneyFish) {
        continue;
      }
      
      const weight = symbols[type].weight;
      if (random <= weight) {
        selectedType = type;
        break;
      }
      random -= weight;
    }
    
    // استخدام نوع افتراضي إذا لم يتم اختيار أي نوع (لا ينبغي أن يحدث)
    if (!selectedType) {
      selectedType = SymbolType.SHELL;
    }
    
    // إنشاء رمز جديد
    const symbol: Symbol = {
      id: i,
      type: selectedType,
      position: [0, 0], // سيتم تحديث الموقع لاحقًا
      isWild: symbols[selectedType].isWild,
      isScatter: symbols[selectedType].isScatter
    };
    
    // إضافة قيمة نقدية عشوائية إذا كان من نوع سمكة نقدية
    if (selectedType === SymbolType.FISH_MONEY) {
      // قيم نقدية ممكنة: 1x, 2x, 5x, 10x, 15x, 25x من قيمة الرهان
      const possibleValues = [1, 2, 5, 10, 15, 25];
      const randomIndex = Math.floor(Math.random() * possibleValues.length);
      symbol.value = possibleValues[randomIndex];
    }
    
    result.push(symbol);
  }
  
  return result;
}

/**
 * إنشاء بكرات عشوائية للعبة
 * @param reelsCount عدد البكرات
 * @param symbolsPerReel عدد الرموز لكل بكرة
 * @param includeMoneyFish هل يجب تضمين رموز الأسماك النقدية؟
 * @returns مصفوفة من البكرات
 */
export function createRandomReels(
  reelsCount = 5,
  symbolsPerReel = 20,
  includeMoneyFish = false
) {
  const reels = [];
  
  for (let i = 0; i < reelsCount; i++) {
    const reelSymbols = createRandomSymbols(symbolsPerReel, includeMoneyFish);
    
    // تحديث مواقع الرموز
    reelSymbols.forEach((symbol, index) => {
      symbol.position = [i, index];
    });
    
    reels.push({
      id: i,
      symbols: reelSymbols,
      currentPosition: 0,
    });
  }
  
  return reels;
}

/**
 * الحصول على الرموز المرئية من البكرات
 * @param reels البكرات
 * @param visibleRows عدد الصفوف المرئية
 * @returns مصفوفة ثنائية الأبعاد من الرموز المرئية
 */
export function getVisibleSymbols(reels: any[], visibleRows = 3) {
  const visibleSymbols: Symbol[][] = [];
  
  for (const reel of reels) {
    const reelVisibleSymbols: Symbol[] = [];
    const { symbols, currentPosition } = reel;
    
    for (let row = 0; row < visibleRows; row++) {
      // حساب موقع الرمز على البكرة، مع مراعاة الالتفاف
      const symbolIndex = (currentPosition + row) % symbols.length;
      const symbol = { ...symbols[symbolIndex] };
      
      // تحديث موقع الرمز المرئي
      symbol.position = [visibleSymbols.length, row];
      
      reelVisibleSymbols.push(symbol);
    }
    
    visibleSymbols.push(reelVisibleSymbols);
  }
  
  return visibleSymbols;
}