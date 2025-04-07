// أنواع البيانات المستخدمة في لعبة صياد السمك (Big Bass Slots)

/**
 * أنواع الرموز المتاحة في اللعبة
 */
export enum SymbolType {
  // الرموز الخاصة
  FISHERMAN = 'fisherman', // صياد (Wild)
  TACKLE_BOX = 'tackle_box', // صندوق الطُعم (Scatter)
  TREASURE = 'treasure', // صندوق كنز
  
  // رموز الأسماك
  GOLDEN_FISH = 'golden_fish', // سمكة ذهبية
  SHARK = 'shark', // سمكة قرش
  TUNA = 'tuna', // سمكة تونة
  SALMON = 'salmon', // سمك السلمون
  SQUID = 'squid', // حبار
  BLUE_WHALE = 'blue_whale', // حوت أزرق
  
  // الرموز التقليدية
  A = 'A',
  K = 'K',
  Q = 'Q',
  J = 'J',
  TEN = '10',
}

/**
 * واجهة لتعريف الرمز وخصائصه
 */
export interface Symbol {
  type: SymbolType;
  id: string;
  image: string;
  isWild?: boolean;
  isScatter?: boolean;
  payout: {
    three: number;
    four: number;
    five: number;
  };
  animation?: string; // مسار ملف الأنيميشن
  value?: number; // قيمة مالية للأسماك (تظهر فقط في Free Spins)
}

/**
 * أنواع المكافآت
 */
export enum BonusType {
  FREE_SPINS = 'free_spins',
  MULTIPLIER = 'multiplier',
  TREASURE_COLLECT = 'treasure_collect',
}

/**
 * واجهة المكافأة
 */
export interface Bonus {
  type: BonusType;
  spinsCount?: number; // عدد اللفات المجانية
  multiplier?: number; // قيمة المضاعف
  collectedFishermen?: number; // عدد الصيادين الذين تم جمعهم
}

/**
 * واجهة البكرة
 */
export interface Reel {
  id: number;
  symbols: Symbol[];
  position: number;
  spinning: boolean;
  stoppedAt?: number;
}

/**
 * واجهة خط الدفع
 */
export interface Payline {
  id: number;
  positions: number[][]; // مصفوفة للمواقع [reel, position]
  active: boolean;
  winAmount?: number;
}

/**
 * أوضاع اللعبة
 */
export enum GameState {
  IDLE = 'idle',
  SPINNING = 'spinning',
  STOPPING = 'stopping',
  EVALUATING = 'evaluating',
  BONUS = 'bonus',
  FREE_SPINS = 'free_spins',
  PAUSED = 'paused',
}

/**
 * واجهة رهان اللاعب
 */
export interface Bet {
  amount: number;
  linesCount: number;
  totalBet: number;
}

/**
 * واجهة نتيجة الدورة
 */
export interface SpinResult {
  symbols: Symbol[][];
  winningLines: Payline[];
  totalWin: number;
  bonusTriggered?: Bonus;
  collectedFishValues?: number[];
}

/**
 * واجهة الإعدادات
 */
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSpinCount?: number;
  language: 'ar' | 'en';
  fastSpin: boolean;
}

/**
 * واجهة حالة اللعبة الكاملة
 */
export interface GameStateInterface {
  state: GameState;
  reels: Reel[];
  currentBet: Bet;
  balance: number;
  lastWin: number;
  paylines: Payline[];
  activeBonus?: Bonus;
  settings: GameSettings;
  freeSpinsLeft: number;
  fishermanCollected: number;
  currentMultiplier: number;
  symbolsData: Symbol[];
}