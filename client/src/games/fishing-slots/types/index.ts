/**
 * وحدة الأنواع - تعريفات الواجهات والأنواع اللازمة للعبة صياد السمك
 */

/**
 * نوع الرمز - تعداد لجميع أنواع الرموز المستخدمة في اللعبة
 */
export enum SymbolType {
  FISHERMAN = 'fisherman', // الصياد (Wild)
  BAIT_BOX = 'bait_box',   // صندوق الطعم (Scatter)
  FISH_3 = 'fish_3',       // سمكة كبيرة
  FISH_2 = 'fish_2',       // سمكة متوسطة
  FISH_1 = 'fish_1',       // سمكة صغيرة
  STARFISH = 'starfish',   // نجمة البحر
  SHELL = 'shell',         // محارة
  ANCHOR = 'anchor',       // مرساة
  CRAB = 'crab',           // سلطعون
  FISH_MONEY = 'fish_money' // سمكة ذات قيمة نقدية
}

/**
 * واجهة الرمز - تمثيل الرمز وخصائصه
 */
export interface Symbol {
  type: SymbolType; // نوع الرمز
  value?: number;   // قيمة نقدية (للأسماك ذات القيمة النقدية)
  position?: [number, number]; // الموضع [صف، عمود]
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
 * نوع الفوز - تعداد لمختلف أنواع الفوز الممكنة
 */
export enum WinType {
  LINE = 'line',           // خط تطابق
  SCATTER = 'scatter',     // تشتت (صندوق الطعم)
  FISHERMAN = 'fisherman'  // جمع قيم الأسماك بواسطة الصياد
}

/**
 * واجهة الفوز - تمثيل للفوز وبياناته
 */
export interface Win {
  type: WinType; // نوع الفوز
  symbolType: SymbolType; // نوع الرمز الفائز
  count: number; // عدد الرموز المتطابقة
  positions: [number, number][]; // مواضع الرموز الفائزة [صف، عمود][]
  multiplier: number; // مضاعف الفوز
  amount: number; // المبلغ الفائز
  lineIndex?: number; // مؤشر خط الدفع (للفوز بالخط فقط)
}

/**
 * واجهة نتيجة الدوران - تمثيل لمخرجات عملية الدوران
 */
export interface SpinResult {
  symbols: Symbol[][]; // شبكة الرموز
  wins: Win[]; // قائمة الفوز
  totalWin: number; // إجمالي الفوز
  hasFreeSpin: boolean; // هل تم تفعيل اللفات المجانية؟
  freeSpinsAwarded: number; // عدد اللفات المجانية الممنوحة
  triggeredFreeSpins?: boolean; // هل تم تحفيز اللفات المجانية في هذا الدوران؟
  fishermanMultiplier?: number; // مضاعف الصياد الحالي
  fishmanPositions?: [number, number][]; // مواضع الصياد
  collectedFishermans?: number; // عدد الصيادين المجمعين
  collectedFishSymbols?: { position: [number, number], value: number }[]; // الأسماك ذات القيمة النقدية المجمعة
  visibleSymbols?: Symbol[][]; // الرموز المرئية (قد تختلف عن الشبكة الكاملة)
}

/**
 * واجهة حالة اللفات المجانية - تمثيل لحالة جلسة اللفات المجانية
 */
export interface FreeSpinsState {
  active: boolean; // هل اللفات المجانية نشطة؟
  remaining: number; // عدد اللفات المجانية المتبقية
  collectedFisherman: number; // عدد الصيادين المجمعين خلال اللفات المجانية
  fishermanMultiplier: number; // مضاعف الصياد الحالي
  totalWin: number; // إجمالي الفوز من اللفات المجانية
  fishermanPositions: [number, number][]; // مواضع الصياد المجمعة
}

/**
 * حالة اللعبة - تعداد للحالات المختلفة التي يمكن أن تكون عليها اللعبة
 */
export enum GameStatus {
  IDLE = 'idle',         // في انتظار بدء اللعب
  SPINNING = 'spinning', // البكرات تدور
  WINNING = 'winning',   // عرض الفوز
  COLLECTING = 'collecting', // الصياد يجمع الأسماك
  FREE_SPINS = 'free_spins' // في وضع اللفات المجانية
}

/**
 * واجهة حالة اللعبة - تمثيل للحالة الشاملة للعبة
 */
export interface FishingGameState {
  balance: number; // رصيد اللاعب
  bet: number; // قيمة الرهان الحالي
  status: GameStatus; // حالة اللعبة الحالية
  symbols: Symbol[][]; // شبكة الرموز الحالية
  lastWin: number; // قيمة الفوز الأخير
  totalWin: number; // إجمالي الفوز التراكمي
  isAutoPlay: boolean; // هل اللعب التلقائي مفعل؟
  paylines: number; // عدد خطوط الدفع النشطة
  freeSpins: FreeSpinsState; // حالة اللفات المجانية
  currentWins: Win[]; // الفوز الحالي
  fishermanPositions: [number, number][]; // مواضع الصياد
  collectedFishValues: any[]; // قيم الأسماك المجمعة
  bonusMultiplier: number; // مضاعف المكافأة
}

/**
 * واجهة التحكم في الصوت - إدارة أصوات اللعبة
 */
export interface SoundControl {
  isMuted: boolean; // هل الصوت مكتوم؟
  volume: number; // مستوى الصوت (0-1)
  playSound: (sound: string) => void; // تشغيل صوت معين
  toggleMute: () => void; // تبديل حالة كتم الصوت
  setVolume: (value: number) => void; // تعيين مستوى الصوت
}

/**
 * واجهة إعدادات الرسوم المتحركة - تخصيص الرسوم المتحركة
 */
export interface AnimationSettings {
  speed: number; // سرعة الرسوم المتحركة
  quality: 'low' | 'medium' | 'high'; // جودة الرسوم المتحركة
  setSpeed: (speed: number) => void; // تعيين سرعة الرسوم المتحركة
  setQuality: (quality: 'low' | 'medium' | 'high') => void; // تعيين جودة الرسوم المتحركة
}

/**
 * واجهة خصائص عرض خط الدفع - استخدام في مكونات العرض
 */
export interface PaylineOverlayProps {
  visible: boolean; // هل خط الدفع مرئي؟
  wins?: Win[]; // الفوز المرتبط بخط الدفع
  gridSize: { width: number; height: number }; // حجم الشبكة
  paylines: Payline[]; // خطوط الدفع المتاحة
}

/**
 * واجهة خصائص عرض الفوز - استخدام في مكونات العرض
 */
export interface WinDisplayProps {
  win: number; // قيمة الفوز
  isVisible: boolean; // هل النافذة مرئية؟
  onClose: () => void; // دالة الإغلاق
}

/**
 * واجهة خصائص اللفات المجانية - استخدام في مكونات العرض
 */
export interface FreeSpinProps {
  freeSpins: FreeSpinsState; // حالة اللفات المجانية
  onStartFreeSpins: () => void; // بدء اللفات المجانية
  onFreeSpinEnd: () => void; // انتهاء اللفات المجانية
}

/**
 * واجهة خصائص حاوية البكرات - استخدام في مكونات العرض
 */
export interface ReelsContainerProps {
  symbols: Symbol[][]; // شبكة الرموز
  isSpinning: boolean; // هل البكرات تدور؟
  wins: Win[]; // الفوز الحالي
  onSpinComplete: () => void; // اكتمال الدوران
}

/**
 * واجهة خصائص شريط التحكم - استخدام في مكونات العرض
 */
export interface ControlBarProps {
  balance: number; // الرصيد
  bet: number; // الرهان
  onBetChange: (bet: number) => void; // تغيير الرهان
  onSpin: () => void; // بدء الدوران
  onAutoPlay: () => void; // تبديل اللعب التلقائي
  isSpinning: boolean; // هل البكرات تدور؟
  isAutoPlay: boolean; // هل اللعب التلقائي مفعل؟
  maxBet: number; // أقصى رهان
  minBet: number; // أدنى رهان
}

/**
 * واجهة الاستجابة من الخادم - الشكل العام لاستجابات الخادم
 */
export interface ServerResponse {
  success: boolean; // هل الطلب ناجح؟
  data?: any; // البيانات المرجعة
  error?: string; // رسالة الخطأ
}

/**
 * واجهة طلب الدوران - بيانات طلب دوران جديد
 */
export interface SpinRequest {
  bet: number; // قيمة الرهان
  isFreeSpin: boolean; // هل هي لفة مجانية؟
}

/**
 * واجهة طلب تحديث الرصيد - بيانات طلب تحديث رصيد اللاعب
 */
export interface UpdateBalanceRequest {
  amount: number; // المبلغ المراد إضافته/خصمه
  type: 'win' | 'bet'; // نوع التحديث
}

/**
 * واجهة استجابة الرصيد - بيانات استجابة الرصيد
 */
export interface BalanceResponse {
  balance: number; // الرصيد الجديد
}

/**
 * واجهة استجابة تحميل اللعبة - بيانات تهيئة اللعبة
 */
export interface GameLoadResponse {
  balance: number; // رصيد اللاعب
  minBet: number; // أدنى رهان
  maxBet: number; // أقصى رهان
  defaultBet: number; // الرهان الافتراضي
}