/**
 * أنواع البيانات الأساسية للعبة صياد السمك
 */

/**
 * أنواع الرموز في اللعبة
 */
export enum SymbolType {
  WILD = 'wild', // الصياد (وايلد)
  FISH_1 = 'fish_1', // سمكة زرقاء
  FISH_2 = 'fish_2', // سمكة برتقالية
  FISH_3 = 'fish_3', // سمكة حمراء
  SHELL = 'shell', // صدفة
  ANCHOR = 'anchor', // مرساة
  CRAB = 'crab', // سلطعون
  STARFISH = 'starfish', // نجم البحر
  BAIT_BOX = 'bait_box', // صندوق الطعم (سكاتر)
  FISH_MONEY = 'fish_money' // سمكة ذات قيمة نقدية
}

/**
 * واجهة خط الدفع - تحديد مسار الفوز في شبكة الرموز
 */
export interface Payline {
  id: number; // معرف خط الدفع
  positions: number[]; // مواضع الصفوف لكل عمود (5 أعمدة)
  color: string; // لون خط الدفع للعرض
}

/**
 * واجهة رمز اللعبة
 */
export interface Symbol {
  id: number; // معرف فريد للرمز
  type: SymbolType; // نوع الرمز
  image: string; // مسار صورة الرمز
  payout: {
    3: number; // قيمة الدفع لـ 3 رموز متطابقة
    4: number; // قيمة الدفع لـ 4 رموز متطابقة
    5: number; // قيمة الدفع لـ 5 رموز متطابقة
  };
  isWild?: boolean; // هل هذا رمز وايلد (يمكن أن يحل محل أي رمز آخر)
  isScatter?: boolean; // هل هذا رمز سكاتر (يمكن أن يظهر في أي مكان وليس فقط على خط دفع)
  moneyValue?: number; // القيمة النقدية للسمكة (للأسماك ذات القيمة النقدية)
}

/**
 * واجهة نتيجة الفوز
 */
export interface Win {
  paylineId: number; // معرف خط الدفع الفائز
  symbolType: SymbolType; // نوع الرمز الفائز
  count: number; // عدد الرموز المتطابقة
  amount: number; // قيمة الفوز
  positions: [number, number][]; // المواضع الفائزة (الصف، العمود)
}

/**
 * أنواع الفوز المختلفة
 */
export enum WinType {
  NORMAL = 'normal', // فوز عادي
  BIG_WIN = 'big_win', // فوز كبير (25x-50x الرهان)
  MEGA_WIN = 'mega_win', // فوز ضخم (50x-100x الرهان)
  SUPER_WIN = 'super_win' // فوز هائل (>100x الرهان)
}

/**
 * واجهة حالة اللفات المجانية
 */
export interface FreeSpinsState {
  active: boolean; // هل اللفات المجانية نشطة؟
  spinsRemaining: number; // عدد اللفات المجانية المتبقية
  collectedFishermen: number; // عدد الصيادين الذين تم جمعهم
  multiplier: number; // مضاعف الفوز الحالي
  fishCollection: { // جمع السمك أثناء اللفات المجانية
    positions: [number, number][]; // مواضع السمك التي تم جمعها (الصف، العمود)
    values: number[]; // قيم السمك التي تم جمعها
    total: number; // إجمالي قيمة السمك المجموعة
  };
}

/**
 * حالات اللعبة المختلفة
 */
export enum GameState {
  IDLE = 'idle', // اللعبة في حالة انتظار (قبل الدوران)
  SPINNING = 'spinning', // البكرات تدور
  SHOWING_WIN = 'showing_win', // عرض الفوز
  FREE_SPINS = 'free_spins', // في وضع اللفات المجانية
  COLLECTING = 'collecting', // جمع الأسماك ذات القيمة النقدية
  ERROR = 'error' // حدث خطأ
}

/**
 * واجهة حالة لعبة صياد السمك
 */
export interface FishingGameState {
  balance: number; // رصيد اللاعب
  betAmount: number; // مبلغ الرهان
  totalWin: number; // إجمالي الفوز في الجولة الحالية
  reels: SymbolType[][][]; // البكرات الحالية (3 صفوف، 5 أعمدة)
  prevReels: SymbolType[][][]; // البكرات السابقة
  wins: Win[]; // قائمة بالفوز في الجولة الحالية
  winType: WinType | null; // نوع الفوز في الجولة الحالية
  status: GameState; // حالة اللعبة الحالية
  isAutoPlay: boolean; // هل اللعبة في وضع اللعب التلقائي
  autoPlayCount: number; // عدد الدورات المتبقية في اللعب التلقائي
  freeSpins: FreeSpinsState; // حالة اللفات المجانية
}

/**
 * واجهة نتيجة الدوران
 */
export interface SpinResult {
  reels: SymbolType[][][]; // البكرات بعد الدوران
  symbols: SymbolType[][]; // مصفوفة الرموز المسطحة (3×5)
  wins: Win[]; // قائمة الفوز
  totalWin: number; // إجمالي الفوز
  winType: WinType | null; // نوع الفوز
  freeSpinsTriggered: boolean; // هل تم تفعيل اللفات المجانية
  freeSpinsCount: number; // عدد اللفات المجانية
}

/**
 * إعدادات الرسوم المتحركة
 */
export interface AnimationSettings {
  speed: number; // سرعة الرسوم المتحركة (0.5-2.0)
  quality: 'low' | 'medium' | 'high'; // جودة الرسوم المتحركة
  setSpeed: (speed: number) => void; // دالة لتعيين السرعة
  setQuality: (quality: 'low' | 'medium' | 'high') => void; // دالة لتعيين الجودة
}

/**
 * واجهة التحكم بالصوت
 */
export interface SoundControl {
  muted: boolean; // هل الصوت مكتوم
  volume: number; // مستوى الصوت (0.0-1.0)
  toggleMute: () => void; // تبديل كتم الصوت
  setVolume: (volume: number) => void; // تعيين مستوى الصوت
  playSpinSound: () => void; // تشغيل صوت الدوران
  playWinSound: (big?: boolean) => void; // تشغيل صوت الفوز
  playFreeSpinsSound: () => void; // تشغيل صوت اللفات المجانية
  playButtonClickSound: () => void; // تشغيل صوت النقر على الزر
  playFishermanSound: () => void; // تشغيل صوت الصياد
  playFishCollectSound: () => void; // تشغيل صوت جمع السمك
  playBackgroundMusic: () => void; // تشغيل موسيقى الخلفية
  stopBackgroundMusic: () => void; // إيقاف موسيقى الخلفية
}