/**
 * ملف الصور والموارد المستخدمة في لعبة صياد السمك
 */

import { SymbolType } from '../types';

/**
 * روابط الأصوات للعبة
 */
export const SOUNDS = {
  // أصوات اللعبة الرئيسية
  BACKGROUND_MUSIC: '/sounds/fishing-slots/background-music.mp3',
  REEL_SPIN: '/sounds/fishing-slots/reel-spin.mp3',
  REEL_STOP: '/sounds/fishing-slots/reel-stop.mp3',
  WIN_SMALL: '/sounds/fishing-slots/win-small.mp3',
  WIN_MEDIUM: '/sounds/fishing-slots/win-medium.mp3',
  WIN_BIG: '/sounds/fishing-slots/win-big.mp3',
  CLICK: '/sounds/fishing-slots/click.mp3',
  
  // أصوات خاصة باللفات المجانية
  FREE_SPINS_TRIGGER: '/sounds/fishing-slots/free-spins-trigger.mp3',
  FREE_SPINS_COUNT: '/sounds/fishing-slots/free-spins-count.mp3',
  FISHERMAN_COLLECT: '/sounds/fishing-slots/fisherman-collect.mp3',
  MULTIPLIER_UP: '/sounds/fishing-slots/multiplier-up.mp3',
  
  // أصوات التنبيهات والأزرار
  ALERT: '/sounds/fishing-slots/alert.mp3',
  ERROR: '/sounds/fishing-slots/error.mp3',
  BUTTON_HOVER: '/sounds/fishing-slots/button-hover.mp3',
  BUTTON_CLICK: '/sounds/fishing-slots/button-click.mp3',
};

/**
 * ألوان خطوط الدفع
 */
export const PAYLINE_COLORS = [
  "#FF5252", "#FFEB3B", "#4CAF50", "#2196F3", "#9C27B0",
  "#FF9800", "#795548", "#607D8B", "#F44336", "#3F51B5",
  "#009688", "#FFC107", "#E91E63", "#00BCD4", "#8BC34A",
  "#673AB7", "#CDDC39", "#FF4081", "#03A9F4", "#FFAB40"
];

/**
 * صور رموز اللعبة
 */
export const SYMBOL_IMAGES: Record<SymbolType, string> = {
  [SymbolType.WILD]: '/images/fishing-slots/symbols/fisherman.png',
  [SymbolType.FISH_1]: '/images/fishing-slots/symbols/fish-1.png',
  [SymbolType.FISH_2]: '/images/fishing-slots/symbols/fish-2.png',
  [SymbolType.FISH_3]: '/images/fishing-slots/symbols/fish-3.png',
  [SymbolType.STARFISH]: '/images/fishing-slots/symbols/starfish.png',
  [SymbolType.SHELL]: '/images/fishing-slots/symbols/shell.png',
  [SymbolType.ANCHOR]: '/images/fishing-slots/symbols/anchor.png',
  [SymbolType.CRAB]: '/images/fishing-slots/symbols/crab.png',
  [SymbolType.BAIT_BOX]: '/images/fishing-slots/symbols/bait-box.png',
  [SymbolType.FISH_MONEY]: '/images/fishing-slots/symbols/fish-money.png',
};

/**
 * صور خلفيات اللعبة
 */
export const BACKGROUND_IMAGES = {
  MAIN: '/images/fishing-slots/backgrounds/main-background.jpg',
  FREE_SPINS: '/images/fishing-slots/backgrounds/free-spins-background.jpg',
  PAYTABLE: '/images/fishing-slots/backgrounds/paytable-background.jpg',
};

/**
 * صور عناصر واجهة اللعبة
 */
export const UI_IMAGES = {
  LOGO: '/images/fishing-slots/ui/logo.png',
  FRAME: '/images/fishing-slots/ui/frame.png',
  BUTTON_SPIN: '/images/fishing-slots/ui/button-spin.png',
  BUTTON_AUTO: '/images/fishing-slots/ui/button-auto.png',
  BUTTON_MAX_BET: '/images/fishing-slots/ui/button-max-bet.png',
  BUTTON_INFO: '/images/fishing-slots/ui/button-info.png',
  BUTTON_SOUND_ON: '/images/fishing-slots/ui/button-sound-on.png',
  BUTTON_SOUND_OFF: '/images/fishing-slots/ui/button-sound-off.png',
  BUTTON_MENU: '/images/fishing-slots/ui/button-menu.png',
  BUTTON_PLUS: '/images/fishing-slots/ui/button-plus.png',
  BUTTON_MINUS: '/images/fishing-slots/ui/button-minus.png',
  COIN: '/images/fishing-slots/ui/coin.png',
  WIN_FRAME: '/images/fishing-slots/ui/win-frame.png',
  FREE_SPINS_OVERLAY: '/images/fishing-slots/ui/free-spins-overlay.png',
  MULTIPLIER_FRAME: '/images/fishing-slots/ui/multiplier-frame.png',
};

/**
 * صور الرسوم المتحركة
 */
export const ANIMATION_IMAGES = {
  SPLASH: '/images/fishing-slots/animations/splash.png',
  WAVE: '/images/fishing-slots/animations/wave.png',
  BUBBLE: '/images/fishing-slots/animations/bubble.png',
  COIN_SHINE: '/images/fishing-slots/animations/coin-shine.png',
  WIN_LIGHT: '/images/fishing-slots/animations/win-light.png',
  FREE_SPINS_INTRO: '/images/fishing-slots/animations/free-spins-intro.png',
  FISHERMAN_CATCHING: '/images/fishing-slots/animations/fisherman-catching.gif',
};

/**
 * مسارات ملفات الرموز المتحركة (Sprite Sheets)
 */
export const SPRITE_SHEETS = {
  SYMBOLS: '/images/fishing-slots/sprite-sheets/symbols-sheet.png',
  WILD_ANIMATION: '/images/fishing-slots/sprite-sheets/wild-animation.png',
  SCATTER_ANIMATION: '/images/fishing-slots/sprite-sheets/scatter-animation.png',
  WIN_EFFECTS: '/images/fishing-slots/sprite-sheets/win-effects.png',
};

/**
 * روابط أيقونات العملة وقيم المراهنة
 */
export const CURRENCY_ICONS = {
  COIN: '/images/fishing-slots/currency/coin.png',
  CHIP: '/images/fishing-slots/currency/chip.png',
  DOLLAR: '/images/fishing-slots/currency/dollar.png',
};