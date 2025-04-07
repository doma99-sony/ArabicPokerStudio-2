/**
 * تعريف مسارات الصور المستخدمة في لعبة صياد السمك
 */

import { SymbolType } from '../types';

// الصور الأساسية للعبة
export const LOGO_IMAGE = '/assets/fishing-slots/logo.png';
export const BACKGROUND_IMAGE = '/assets/fishing-slots/underwater-background.jpg';
export const BUBBLE_IMAGE = '/assets/fishing-slots/bubble.png';

// ألوان خطوط الدفع (لكل خط لون مختلف)
export const PAYLINE_COLORS = [
  '#FF0000', // أحمر
  '#00FF00', // أخضر
  '#0000FF', // أزرق
  '#FFFF00', // أصفر
  '#FF00FF', // وردي
  '#00FFFF', // سماوي
  '#FFA500', // برتقالي
  '#800080', // بنفسجي
  '#008000', // أخضر داكن
  '#FF4500', // أحمر برتقالي
  '#4B0082', // نيلي
  '#FF1493', // وردي عميق
  '#FFD700', // ذهبي
  '#40E0D0', // تركواز
  '#CD853F', // بني فاتح
  '#8A2BE2', // أزرق بنفسجي
  '#32CD32', // أخضر ليموني
  '#FF6347', // طماطم
  '#6A5ACD', // أزرق أرجواني
  '#7FFF00'  // أخضر شارت
];

// صور رموز اللعبة
export const SYMBOL_IMAGES: Record<SymbolType, string> = {
  [SymbolType.WILD]: '/assets/fishing-slots/symbols/fisherman.png', // الصياد (Wild)
  [SymbolType.FISH_1]: '/assets/fishing-slots/symbols/fish1.png', // سمكة 1
  [SymbolType.FISH_2]: '/assets/fishing-slots/symbols/fish2.png', // سمكة 2
  [SymbolType.FISH_3]: '/assets/fishing-slots/symbols/fish3.png', // سمكة 3
  [SymbolType.STARFISH]: '/assets/fishing-slots/symbols/starfish.png', // نجم البحر
  [SymbolType.SHELL]: '/assets/fishing-slots/symbols/shell.png', // صدفة
  [SymbolType.ANCHOR]: '/assets/fishing-slots/symbols/anchor.png', // مرساة
  [SymbolType.CRAB]: '/assets/fishing-slots/symbols/crab.png', // سلطعون
  [SymbolType.BAIT_BOX]: '/assets/fishing-slots/symbols/bait-box.png', // صندوق الطعم (Scatter)
  [SymbolType.FISH_MONEY]: '/assets/fishing-slots/symbols/money-fish.png' // سمكة نقدية
};

// مسارات عناصر واجهة اللعبة
export const REEL_FRAME_IMAGE = '/assets/fishing-slots/reel-frame.png';
export const PAYLINES_FRAME_IMAGE = '/assets/fishing-slots/paylines-frame.png';
export const CONTROL_PANEL_BACKGROUND = '/assets/fishing-slots/control-panel-bg.png';

// أزرار التحكم
export const SPIN_BUTTON = '/assets/fishing-slots/buttons/spin-button.png';
export const AUTO_PLAY_BUTTON = '/assets/fishing-slots/buttons/auto-play-button.png';
export const MAX_BET_BUTTON = '/assets/fishing-slots/buttons/max-bet-button.png';
export const BET_UP_BUTTON = '/assets/fishing-slots/buttons/bet-up-button.png';
export const BET_DOWN_BUTTON = '/assets/fishing-slots/buttons/bet-down-button.png';
export const SETTINGS_BUTTON = '/assets/fishing-slots/buttons/settings-button.png';
export const PAYTABLE_BUTTON = '/assets/fishing-slots/buttons/paytable-button.png';
export const SOUND_ON_BUTTON = '/assets/fishing-slots/buttons/sound-on-button.png';
export const SOUND_OFF_BUTTON = '/assets/fishing-slots/buttons/sound-off-button.png';

// مسارات عناصر اللفات المجانية
export const FREE_SPINS_BACKGROUND = '/assets/fishing-slots/free-spins-bg.png';
export const FREE_SPINS_INTRO = '/assets/fishing-slots/free-spins-intro.png';
export const FREE_SPINS_OUTRO = '/assets/fishing-slots/free-spins-outro.png';

// عناصر الفوز والمؤثرات
export const WIN_FRAME = '/assets/fishing-slots/win-frame.png';
export const BIG_WIN_ANIMATION = '/assets/fishing-slots/big-win.png';
export const MEGA_WIN_ANIMATION = '/assets/fishing-slots/mega-win.png';
export const SUPER_WIN_ANIMATION = '/assets/fishing-slots/super-win.png';
export const WATER_SPLASH = '/assets/fishing-slots/water-splash.png';
export const COIN_ANIMATION = '/assets/fishing-slots/coin.png';

// مسارات الأصوات
export const SOUNDS = {
  SPIN: '/assets/fishing-slots/sounds/spin.mp3',
  REEL_STOP: '/assets/fishing-slots/sounds/reel-stop.mp3',
  WIN: '/assets/fishing-slots/sounds/win.mp3',
  BIG_WIN: '/assets/fishing-slots/sounds/big-win.mp3',
  COLLECT_MONEY: '/assets/fishing-slots/sounds/collect-money.mp3',
  WILD_APPEAR: '/assets/fishing-slots/sounds/wild-appear.mp3',
  FREE_SPINS_TRIGGER: '/assets/fishing-slots/sounds/free-spins-trigger.mp3',
  FREE_SPINS_END: '/assets/fishing-slots/sounds/free-spins-end.mp3',
  BUTTON_CLICK: '/assets/fishing-slots/sounds/button-click.mp3',
  BUBBLE_POP: '/assets/fishing-slots/sounds/bubble-pop.mp3',
  BACKGROUND_MUSIC: '/assets/fishing-slots/sounds/background-music.mp3',
  FREE_SPINS_MUSIC: '/assets/fishing-slots/sounds/free-spins-music.mp3'
};