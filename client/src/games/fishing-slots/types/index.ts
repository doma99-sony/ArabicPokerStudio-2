/**
 * أنواع البيانات للعبة صياد السمك
 */

// أنواع الرموز في اللعبة
export enum SymbolType {
  WILD = 'WILD', // الصياد - الرمز الجوكر
  FISH_1 = 'FISH_1', // سمكة 1
  FISH_2 = 'FISH_2', // سمكة 2
  FISH_3 = 'FISH_3', // سمكة 3
  STARFISH = 'STARFISH', // نجم البحر
  SHELL = 'SHELL', // صدفة
  ANCHOR = 'ANCHOR', // مرساة
  CRAB = 'CRAB', // سلطعون
  BAIT_BOX = 'BAIT_BOX', // صندوق الطعم (سكاتر)
  FISH_MONEY = 'FISH_MONEY', // سمكة بقيمة مالية
}

// حالات اللعبة
export enum GameState {
  IDLE = 'IDLE', // انتظار
  SPINNING = 'SPINNING', // دوران
  WIN_ANIMATION = 'WIN_ANIMATION', // عرض الفوز
  FREE_SPINS = 'FREE_SPINS', // لفات مجانية
  COLLECTING = 'COLLECTING', // جمع القيم
}

// أنواع الفوز
export enum WinType {
  LINE = 'LINE', // فوز على خط
  SCATTER = 'SCATTER', // فوز بالسكاتر
  FISH_COLLECT = 'FISH_COLLECT', // جمع قيمة الأسماك
  BONUS = 'BONUS', // مكافأة
}

// واجهة الفوز
export interface Win {
  type: WinType;
  amount: number;
  payline?: number; // رقم خط الدفع في حالة الفوز على خط
  positions: [number, number][]; // مواضع الرموز الفائزة [صف، عمود]
  symbolType: SymbolType; // نوع الرمز الفائز
  multiplier?: number; // مضاعف الفوز إن وجد
}

// نتيجة الدوران
export interface SpinResult {
  reels: SymbolType[][]; // مصفوفة البكرات
  wins: Win[]; // مصفوفة الفوز
  totalWin: number; // إجمالي الفوز
  triggeredFreeSpins: number; // عدد اللفات المجانية المتحققة
  fishValues?: { [position: string]: number }; // قيم الأسماك النقدية
}

// حالة اللفات المجانية
export interface FreeSpinsState {
  active: boolean; // هل اللفات المجانية نشطة
  remaining: number; // عدد اللفات المجانية المتبقية
  multiplier: number; // مضاعف الفوز
  fishermanCount: number; // عدد رموز الصياد المجمعة
  collectedFishValues: number; // قيم الأسماك المجمعة
}

// ضبط الصوت
export interface SoundControl {
  isMuted: boolean;
  volume: number;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playSound: (soundName: string) => void;
  muteAll: () => void;
  unmuteAll: () => void;
  setVolume: (volume: number) => void;
}

// إعدادات الرسوم المتحركة
export interface AnimationSettings {
  speed: number; // سرعة الرسوم المتحركة (1.0 = طبيعي)
  quality: 'low' | 'medium' | 'high'; // جودة الرسوم المتحركة
}

// حالة اللعبة الكاملة
export interface FishingGameState {
  balance: number; // رصيد اللاعب
  betAmount: number; // قيمة الرهان
  reels: SymbolType[][]; // حالة البكرات الحالية
  gameState: GameState; // حالة اللعبة الحالية
  lastWin: number; // قيمة الفوز الأخير
  wins: Win[]; // قائمة الفوز الحالية
  winPositions: [number, number][]; // مواضع الفوز للتمييز
  freeSpins: FreeSpinsState; // حالة اللفات المجانية
  autoPlayActive: boolean; // هل اللعب التلقائي نشط
  totalBet: number; // إجمالي الرهان
  paylineCount: number; // عدد خطوط الدفع النشطة
  fishValues: { [position: string]: number }; // قيم الأسماك النقدية
}