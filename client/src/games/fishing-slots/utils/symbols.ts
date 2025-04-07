/**
 * تعريف رموز لعبة صياد السمك ومدفوعاتها
 */

import { SymbolType } from '../types';

/**
 * قيم مدفوعات الرموز المختلفة
 * المفتاح: نوع الرمز
 * القيمة: قيم المدفوعات لعدد 3 و 4 و 5 من الرموز
 */
export const SYMBOL_PAYOUTS: Record<SymbolType, Record<number, number>> = {
  // الصياد (Wild) - أعلى قيمة مدفوعات
  [SymbolType.WILD]: {
    3: 20,  // 3 رموز = 20x قيمة الرهان
    4: 100, // 4 رموز = 100x قيمة الرهان
    5: 500  // 5 رموز = 500x قيمة الرهان
  },
  
  // سمكة 1 - قيمة متوسطة
  [SymbolType.FISH_1]: {
    3: 5,  // 3 رموز = 5x قيمة الرهان
    4: 20, // 4 رموز = 20x قيمة الرهان
    5: 100 // 5 رموز = 100x قيمة الرهان
  },
  
  // سمكة 2 - قيمة متوسطة
  [SymbolType.FISH_2]: {
    3: 4,  // 3 رموز = 4x قيمة الرهان
    4: 15, // 4 رموز = 15x قيمة الرهان
    5: 75  // 5 رموز = 75x قيمة الرهان
  },
  
  // سمكة 3 - قيمة متوسطة
  [SymbolType.FISH_3]: {
    3: 3,   // 3 رموز = 3x قيمة الرهان
    4: 10,  // 4 رموز = 10x قيمة الرهان
    5: 50   // 5 رموز = 50x قيمة الرهان
  },
  
  // نجم البحر - قيمة منخفضة
  [SymbolType.STARFISH]: {
    3: 2,  // 3 رموز = 2x قيمة الرهان
    4: 6,  // 4 رموز = 6x قيمة الرهان
    5: 30  // 5 رموز = 30x قيمة الرهان
  },
  
  // صدفة - قيمة منخفضة
  [SymbolType.SHELL]: {
    3: 1,  // 3 رموز = 1x قيمة الرهان
    4: 5,  // 4 رموز = 5x قيمة الرهان
    5: 25  // 5 رموز = 25x قيمة الرهان
  },
  
  // مرساة - قيمة منخفضة
  [SymbolType.ANCHOR]: {
    3: 1,  // 3 رموز = 1x قيمة الرهان
    4: 4,  // 4 رموز = 4x قيمة الرهان
    5: 20  // 5 رموز = 20x قيمة الرهان
  },
  
  // سلطعون - قيمة منخفضة
  [SymbolType.CRAB]: {
    3: 0.5,  // 3 رموز = 0.5x قيمة الرهان
    4: 3,    // 4 رموز = 3x قيمة الرهان
    5: 15    // 5 رموز = 15x قيمة الرهان
  },
  
  // صندوق الطعم (Scatter) - يعطي لفات مجانية
  [SymbolType.BAIT_BOX]: {
    3: 5,   // 3 رموز = 5x قيمة الرهان
    4: 20,  // 4 رموز = 20x قيمة الرهان
    5: 50   // 5 رموز = 50x قيمة الرهان
  },
  
  // سمكة نقدية - لها قيمة متغيرة وتُجمع بواسطة الصياد
  [SymbolType.FISH_MONEY]: {
    3: 0,
    4: 0,
    5: 0
  }
};

/**
 * احتمالية ظهور كل رمز على بكرات اللعبة
 * (1 = احتمالية عادية، أقل من 1 = احتمالية أقل، أكثر من 1 = احتمالية أكبر)
 */
export const SYMBOL_WEIGHTS: Record<SymbolType, number> = {
  [SymbolType.WILD]: 0.5,        // احتمالية أقل للصياد (Wild)
  [SymbolType.FISH_1]: 1.2,      // احتمالية أكبر قليلاً للسمكة 1
  [SymbolType.FISH_2]: 1.2,      // احتمالية أكبر قليلاً للسمكة 2
  [SymbolType.FISH_3]: 1.0,      // احتمالية عادية للسمكة 3
  [SymbolType.STARFISH]: 1.5,    // احتمالية أكبر لنجم البحر
  [SymbolType.SHELL]: 1.5,       // احتمالية أكبر للصدفة
  [SymbolType.ANCHOR]: 1.5,      // احتمالية أكبر للمرساة
  [SymbolType.CRAB]: 1.5,        // احتمالية أكبر للسلطعون
  [SymbolType.BAIT_BOX]: 0.3,    // احتمالية منخفضة لصندوق الطعم
  [SymbolType.FISH_MONEY]: 0.8   // احتمالية متوسطة للسمكة النقدية
};

/**
 * احتمالية ظهور كل رمز على بكرات اللعبة أثناء اللفات المجانية
 * (احتمالية أكبر للرموز ذات القيمة العالية والأسماك النقدية)
 */
export const FREE_SPINS_SYMBOL_WEIGHTS: Record<SymbolType, number> = {
  [SymbolType.WILD]: 0.8,        // احتمالية أكبر للصياد (Wild) في اللفات المجانية
  [SymbolType.FISH_1]: 1.2,      // احتمالية أكبر قليلاً للسمكة 1
  [SymbolType.FISH_2]: 1.2,      // احتمالية أكبر قليلاً للسمكة 2
  [SymbolType.FISH_3]: 1.0,      // احتمالية عادية للسمكة 3
  [SymbolType.STARFISH]: 1.0,    // احتمالية عادية لنجم البحر
  [SymbolType.SHELL]: 1.0,       // احتمالية عادية للصدفة
  [SymbolType.ANCHOR]: 1.0,      // احتمالية عادية للمرساة
  [SymbolType.CRAB]: 1.0,        // احتمالية عادية للسلطعون
  [SymbolType.BAIT_BOX]: 0.2,    // احتمالية منخفضة لصندوق الطعم
  [SymbolType.FISH_MONEY]: 1.5   // احتمالية أكبر للسمكة النقدية في اللفات المجانية
};

/**
 * الحصول على مدفوعات رمز معين
 * @param symbolType نوع الرمز
 * @returns مدفوعات الرمز لعدد 3 و 4 و 5 من الرموز
 */
export const getSymbolPayouts = (symbolType: SymbolType): Record<number, number> => {
  return SYMBOL_PAYOUTS[symbolType] || { 3: 0, 4: 0, 5: 0 };
};

/**
 * رموز ذات قيمة عالية (رموز الفوز الكبير)
 * تستخدم لعرض تأثيرات خاصة عند الفوز بقيمة كبيرة
 */
export const HIGH_VALUE_SYMBOLS = [
  SymbolType.WILD,
  SymbolType.FISH_1,
  SymbolType.FISH_2,
  SymbolType.FISH_3
];

/**
 * رموز ذات قيمة منخفضة
 */
export const LOW_VALUE_SYMBOLS = [
  SymbolType.STARFISH,
  SymbolType.SHELL,
  SymbolType.ANCHOR,
  SymbolType.CRAB
];

/**
 * توليد قيمة رمز السمكة النقدية
 * @param betAmount قيمة الرهان
 * @returns قيمة السمكة النقدية
 */
export const generateMoneyFishValue = (betAmount: number): number => {
  // توليد قيمة عشوائية للسمكة النقدية (1-10 أضعاف قيمة الرهان)
  const multiplier = Math.floor(Math.random() * 10) + 1;
  return multiplier * betAmount;
};