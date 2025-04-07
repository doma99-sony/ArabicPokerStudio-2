// أنواع البيانات المستخدمة في لعبة صياد السمك

// نوع الرمز
export enum SymbolType {
  FISHERMAN = 'fisherman', // الصياد (Wild)
  BAIT_BOX = 'bait_box',   // صندوق الطعم (Scatter)
  FISH_1 = 'fish_1',       // سمكة بقيمة منخفضة 
  FISH_2 = 'fish_2',       // سمكة بقيمة متوسطة
  FISH_3 = 'fish_3',       // سمكة بقيمة عالية
  STARFISH = 'starfish',   // نجم البحر
  SHELL = 'shell',         // صدفة
  ANCHOR = 'anchor',       // مرساة
  CRAB = 'crab',           // سلطعون
  FISH_MONEY = 'fish_money' // سمكة ذات قيمة نقدية
}

// الرمز في اللعبة
export interface Symbol {
  id: number;
  type: SymbolType;
  position: [number, number];
  value?: number; // قيمة نقدية للسمكة (إذا كانت من نوع FISH_MONEY)
  isWild?: boolean; // هل هو رمز Joker؟
  isScatter?: boolean; // هل هو رمز Scatter؟
}

// البكرة
export interface Reel {
  id: number;
  symbols: Symbol[];
  position: number;
  spinning: boolean;
}

// خط الدفع
export interface Payline {
  id: number;
  positions: number[]; // مواقع الرموز على البكرات (0-2 لكل عمود)
  name?: string; // اسم خط الدفع، على سبيل المثال "أفقي علوي"
}

// نوع الفوز
export enum WinType {
  SMALL = 'small',   // فوز صغير (أقل من 5x)
  MEDIUM = 'medium', // فوز متوسط (5x - 20x)
  LARGE = 'large',   // فوز كبير (20x - 50x)
  MEGA = 'mega'      // فوز ضخم (أكثر من 50x)
}

// معلومات الفوز
export interface Win {
  type: WinType;
  amount: number;
  payoutMultiplier: number;
  payline?: Payline;
  symbols?: Symbol[];
}

// حالة اللفات المجانية
export interface FreeSpinsState {
  active: boolean;
  count: number;
  totalWin: number;
  fishermen: number; // عدد الصيادين الذين تم جمعهم
  multiplier: number; // مضاعف الفوز الحالي
}

// حالة اللعبة
export enum GameStatus {
  IDLE = 'idle',
  SPINNING = 'spinning',
  STOPPING = 'stopping',
  SHOWING_WIN = 'showing_win',
  FREE_SPINS = 'free_spins'
}

// إعدادات اللعبة
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  fastSpin: boolean;
  showIntro: boolean;
}

// نتيجة اللفة
export interface SpinResult {
  totalWin: number;
  wins: Win[];
  reels: Reel[];
  visibleSymbols: Symbol[][];
  triggeredFreeSpins: number; // عدد اللفات المجانية التي تم تفعيلها (0 إذا لم يتم تفعيل لفات مجانية)
  collectedFisherman: boolean; // هل تم جمع صياد جديد؟
  collectedFishSymbols: { position: [number, number]; value: number }[]; // رموز الأسماك النقدية التي تم جمعها
}

// حالة لعبة صياد السمك
export interface FishingGameState {
  balance: number;
  betAmount: number;
  minBet: number;
  maxBet: number;
  activePaylines: number;
  gameStatus: GameStatus;
  lastWin: Win | null;
  totalWin: number;
  isAutoSpin: boolean;
  autoSpinCount: number;
  visibleSymbols: Symbol[][];
  reels: Reel[];
  freeSpins: FreeSpinsState;
  settings: GameSettings;
}

// واجهة التحكم في الصوت
export interface SoundControl {
  play: (sound: string) => void;
  stop: (sound: string) => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
}

// إعدادات الرسوم المتحركة
export interface AnimationSettings {
  duration: number;
  reelSpinDuration: number;
  reelStopInterval: number;
  winDisplayDuration: number;
  winEffectDuration: number;
}