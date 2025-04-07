/**
 * تعريف الأنواع المستخدمة في لعبة صياد السمك
 */

// أنواع الرموز في اللعبة
export enum SymbolType {
  WILD = 'WILD',               // الصياد (Wild)
  FISH_1 = 'FISH_1',           // سمكة 1
  FISH_2 = 'FISH_2',           // سمكة 2
  FISH_3 = 'FISH_3',           // سمكة 3
  STARFISH = 'STARFISH',       // نجم البحر
  SHELL = 'SHELL',             // صدفة
  ANCHOR = 'ANCHOR',           // مرساة
  CRAB = 'CRAB',               // سلطعون
  BAIT_BOX = 'BAIT_BOX',       // صندوق الطعم (Scatter)
  FISH_MONEY = 'FISH_MONEY'    // سمكة نقدية
}

// واجهة خط الدفع
export interface Payline {
  id: number;                  // رقم خط الدفع
  positions: number[];         // مواضع الرموز في كل عمود (الصفوف)
  color: string;               // لون خط الدفع
}

// أنواع الفوز
export enum WinType {
  LINE = 'LINE',               // فوز على خط دفع
  SCATTER = 'SCATTER',         // فوز بالتشتت (Scatter)
  FISH_MONEY = 'FISH_MONEY'    // فوز بجمع الأسماك النقدية
}

// واجهة حالة الفوز
export interface Win {
  type: WinType;               // نوع الفوز
  amount: number;              // مبلغ الفوز
  positions?: [number, number][]; // مواضع الرموز الفائزة [صف، عمود]
  payline?: number;            // رقم خط الدفع (إذا كان الفوز على خط)
  symbolType?: SymbolType;     // نوع الرمز الفائز
}

// حالات اللعبة
export enum GameState {
  IDLE = 'IDLE',                 // وضع الانتظار
  SPINNING = 'SPINNING',         // وضع الدوران
  WIN_ANIMATION = 'WIN_ANIMATION', // عرض الفوز
  FREE_SPINS = 'FREE_SPINS',      // وضع اللفات المجانية
  COLLECTING = 'COLLECTING'       // وضع جمع الأسماك النقدية
}

// واجهة حالة اللفات المجانية
export interface FreeSpinsState {
  active: boolean;              // هل اللفات المجانية نشطة
  spinsRemaining: number;       // عدد اللفات المتبقية
  totalSpins: number;           // إجمالي عدد اللفات
  multiplier: number;           // مضاعف الفوز
  collectedWild: number;        // عدد الصيادين المجموعين
  totalWin: number;             // إجمالي الفوز في اللفات المجانية
}

// واجهة حالة لعبة صياد السمك
export interface FishingGameState {
  balance: number;              // رصيد اللاعب
  betAmount: number;            // قيمة الرهان
  totalBet: number;             // إجمالي الرهان (الرهان × خطوط الدفع)
  reels: SymbolType[][];        // مصفوفة البكرات والرموز
  gameState: GameState;         // حالة اللعبة الحالية
  lastWin: number;              // آخر فوز
  activePaylines: number;       // عدد خطوط الدفع النشطة
  paylineWins: Win[];           // حالات الفوز على خطوط الدفع
  scatterWins: Win[];           // حالات الفوز بالتشتت
  fishMoneyWins: Win[];         // حالات الفوز بالأسماك النقدية
  fishValues: { [position: string]: number }; // قيم الأسماك النقدية
  freeSpins: FreeSpinsState;    // حالة اللفات المجانية
  autoPlayActive: boolean;      // هل اللعب التلقائي نشط
  canSpin: boolean;             // هل يمكن الدوران الآن
}

// واجهة نتيجة الدوران
export interface SpinResult {
  reels: SymbolType[][];        // مصفوفة البكرات بعد الدوران
  wins: Win[];                  // حالات الفوز
  totalWin: number;             // إجمالي الفوز
  triggeredFreeSpins: number;   // عدد اللفات المجانية المُفعلة (0 إذا لم يتم التفعيل)
  fishValues: { [position: string]: number }; // قيم الأسماك النقدية
}

// واجهة التحكم بالأصوات
export interface SoundControl {
  muted: boolean;               // هل الصوت مكتوم
  volume: number;               // مستوى الصوت (0-1)
  playSound: (soundName: string) => void; // تشغيل صوت معين
  toggleMute: () => void;       // تبديل كتم الصوت
  setVolume: (volume: number) => void; // تعيين مستوى الصوت
}

// واجهة إعدادات الرسوم المتحركة
export interface AnimationSettings {
  speed: number;                // سرعة الرسوم المتحركة
  effects: boolean;             // هل المؤثرات مفعلة
  quality: 'low' | 'medium' | 'high'; // جودة الرسوم المتحركة
}