/**
 * أنواع البيانات للعبة صياد السمك
 */

// أنواع الرموز المتاحة في اللعبة
export enum SymbolType {
  FISHERMAN = 'FISHERMAN',  // صياد (رمز Joker)
  BAIT_BOX = 'BAIT_BOX',   // صندوق الطعم (Scatter)
  FISH_3 = 'FISH_3',       // سمكة ذهبية كبيرة
  FISH_2 = 'FISH_2',       // سمكة فضية متوسطة
  FISH_1 = 'FISH_1',       // سمكة ملونة صغيرة
  STARFISH = 'STARFISH',   // نجم البحر
  SHELL = 'SHELL',         // صدفة
  ANCHOR = 'ANCHOR',       // مرساة
  CRAB = 'CRAB',           // سلطعون
  FISH_MONEY = 'FISH_MONEY' // الأسماك ذات القيمة النقدية
}

// رمز في اللعبة
export interface Symbol {
  id: string;
  type: SymbolType;
  isWild: boolean;
  isScatter: boolean;
  value?: number;  // قيمة خاصة للأسماك النقدية
}

// بكرة في اللعبة
export interface Reel {
  id: number;
  symbols: Symbol[];
  position: number;  // الموضع الحالي للبكرة
  spinning: boolean; // حالة الدوران
}

// خط دفع في اللعبة
export interface Payline {
  id: number;
  positions: number[];  // مواقع الرموز في كل عمود
}

// أنواع مكافآت الفوز
export enum WinType {
  SMALL = 'SMALL',     // صغير (1-4x)
  MEDIUM = 'MEDIUM',   // متوسط (5-19x)
  LARGE = 'LARGE',     // كبير (20-49x)
  MEGA = 'MEGA'        // ضخم (50x+)
}

// فوز في اللعبة
export interface Win {
  type: WinType;
  amount: number;
  payoutMultiplier: number;
  payline?: Payline;  // خط الدفع المرتبط بالفوز إن وجد
  symbols: Symbol[];  // الرموز التي شكلت الفوز
}

// نتيجة دوران البكرات
export interface SpinResult {
  totalWin: number;
  wins: Win[];
  reels: Reel[];
  visibleSymbols: Symbol[][];
  triggeredFreeSpins: number;
  collectedFisherman: boolean;
  collectedFishSymbols: { position: [number, number]; value: number }[];
}

// حالة اللفات المجانية
export interface FreeSpinsState {
  active: boolean;
  count: number;
  totalWin: number;
  fishermen: number;  // عدد الصيادين المجمعين
  multiplier: number; // مضاعف الفوز الحالي
}

// حالة اللعبة
export enum GameStatus {
  IDLE = 'IDLE',           // في وضع الانتظار
  SPINNING = 'SPINNING',   // البكرات تدور
  SHOWING_WIN = 'SHOWING_WIN', // عرض الفوز
  FREE_SPINS = 'FREE_SPINS',   // في وضع اللفات المجانية
  ERROR = 'ERROR'              // حدث خطأ
}

// إعدادات اللعبة
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  fastSpin: boolean;
  showIntro: boolean;
}

// الحالة الكاملة للعبة
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

// إعدادات الصوت
export interface SoundControl {
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playSpinSound: () => void;
  playWinSound: (winType: WinType) => void;
  playFreeSpinsSound: () => void;
  playButtonSound: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  isSoundEnabled: boolean;
  isMusicEnabled: boolean;
}

// إعدادات الرسوم المتحركة
export interface AnimationSettings {
  spinDuration: number;
  winAnimationDuration: number;
  fastMode: boolean;
  toggleFastMode: () => void;
}