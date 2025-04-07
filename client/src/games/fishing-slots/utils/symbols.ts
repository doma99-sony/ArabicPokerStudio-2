/**
 * وحدة الرموز - تحتوي على إعدادات وتوزيع الرموز في لعبة صياد السمك
 */

import { Symbol, SymbolType } from '../types';
import { SYMBOL_IMAGES } from '../assets/images';

/**
 * توزيع وتصميم البكرات الأساسية خلال اللعبة العادية
 * كل بكرة هي مصفوفة من الرموز المحتمل ظهورها
 */
export const MAIN_REELS_DISTRIBUTION = [
  // البكرة 1
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY
  ],
  // البكرة 2
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 3
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 4
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 5
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ]
];

/**
 * توزيع وتصميم البكرات خلال اللفات المجانية - احتمالية أكبر للأسماك ذات القيمة النقدية والصياد
 */
export const FREE_SPINS_REELS_DISTRIBUTION = [
  // البكرة 1
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 2
  [
    SymbolType.FISH_1, SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 3
  [
    SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.BAIT_BOX,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 4
  [
    SymbolType.FISH_1, SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ],
  // البكرة 5
  [
    SymbolType.FISH_1,
    SymbolType.FISH_2, SymbolType.FISH_2,
    SymbolType.FISH_3, SymbolType.FISH_3, SymbolType.FISH_3,
    SymbolType.SHELL, SymbolType.SHELL,
    SymbolType.ANCHOR, SymbolType.ANCHOR,
    SymbolType.CRAB, SymbolType.CRAB,
    SymbolType.STARFISH, SymbolType.STARFISH,
    SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN, SymbolType.FISHERMAN,
    SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY, SymbolType.FISH_MONEY
  ]
];

/**
 * مدفوعات الرموز المختلفة
 * القيمة هي مضاعف الرهان الأساسي
 */
export const SYMBOL_PAYOUTS = {
  [SymbolType.FISH_3]: {
    3: 5,   // 3 رموز = 5x الرهان
    4: 15,  // 4 رموز = 15x الرهان
    5: 50   // 5 رموز = 50x الرهان
  },
  [SymbolType.FISH_2]: {
    3: 4,
    4: 10,
    5: 40
  },
  [SymbolType.FISH_1]: {
    3: 3,
    4: 8,
    5: 30
  },
  [SymbolType.STARFISH]: {
    3: 2.5,
    4: 6,
    5: 25
  },
  [SymbolType.SHELL]: {
    3: 2,
    4: 5,
    5: 20
  },
  [SymbolType.ANCHOR]: {
    3: 1.5,
    4: 4,
    5: 15
  },
  [SymbolType.CRAB]: {
    3: 1,
    4: 3,
    5: 10
  },
  [SymbolType.FISHERMAN]: {
    3: 10,
    4: 25,
    5: 100
  },
  [SymbolType.BAIT_BOX]: {
    3: 10,  // 3 رموز = 10x الرهان + 10 لفات مجانية
    4: 20,  // 4 رموز = 20x الرهان + 15 لفة مجانية
    5: 50   // 5 رموز = 50x الرهان + 20 لفة مجانية
  }
  // ملاحظة: FISH_MONEY ليس لديه قيمة ثابتة، إذ تعتمد قيمته على الرقم المعروض على الرمز نفسه
};

/**
 * نطاق القيم المحتملة لرمز السمكة ذات القيمة النقدية
 */
export const FISH_MONEY_VALUE_RANGE = {
  MIN: 0.5,  // الحد الأدنى هو 0.5x الرهان
  MAX: 25    // الحد الأقصى هو 25x الرهان
};

/**
 * توليد رمز جديد عشوائي من البكرة المحددة
 */
export const generateRandomSymbol = (reelIndex: number, isFreeSpin: boolean): Symbol => {
  const reelSymbols = isFreeSpin 
    ? FREE_SPINS_REELS_DISTRIBUTION[reelIndex]
    : MAIN_REELS_DISTRIBUTION[reelIndex];
  
  const randomIndex = Math.floor(Math.random() * reelSymbols.length);
  const symbolType = reelSymbols[randomIndex];
  
  const symbol: Symbol = { type: symbolType };
  
  // إذا كان رمز السمكة ذات القيمة النقدية، قم بتعيين قيمة عشوائية له
  if (symbolType === SymbolType.FISH_MONEY) {
    const min = FISH_MONEY_VALUE_RANGE.MIN;
    const max = FISH_MONEY_VALUE_RANGE.MAX;
    const randomValue = parseFloat((Math.random() * (max - min) + min).toFixed(1));
    symbol.value = randomValue;
  }
  
  return symbol;
};

/**
 * توليد مصفوفة رموز عشوائية للشبكة كاملة
 */
export const generateRandomGrid = (isFreeSpin: boolean): Symbol[][] => {
  const grid: Symbol[][] = [];
  
  // عدد الأعمدة (البكرات) = 5
  for (let col = 0; col < 5; col++) {
    const column: Symbol[] = [];
    
    // عدد الصفوف = 3
    for (let row = 0; row < 3; row++) {
      const symbol = generateRandomSymbol(col, isFreeSpin);
      symbol.position = [row, col];
      column.push(symbol);
    }
    
    grid.push(column);
  }
  
  return grid;
};

/**
 * الحصول على مسار صورة الرمز
 */
export const getSymbolImage = (symbolType: SymbolType): string => {
  return SYMBOL_IMAGES[symbolType];
};

/**
 * الحصول على قيمة رمز سمكة المال
 */
export const getFishMoneyValue = (symbol: Symbol): number => {
  if (symbol.type === SymbolType.FISH_MONEY && symbol.value !== undefined) {
    return symbol.value;
  }
  return 0;
};