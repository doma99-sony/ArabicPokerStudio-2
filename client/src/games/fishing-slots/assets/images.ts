/**
 * صور لعبة صياد السمك (Big Bass Bonanza)
 */

import { SymbolType } from '../types';

// صور الخلفية
export const BACKGROUND_IMAGE = '/assets/fishing-slots/background.jpg';
export const WATER_TEXTURE = '/assets/fishing-slots/water-texture.jpg';

// صور اللوجو والشعارات
export const GAME_LOGO = '/assets/fishing-slots/logo.png';
export const GAME_TITLE = '/assets/fishing-slots/title.png';

// صور الرموز
export const WILD_IMAGE = '/assets/fishing-slots/symbols/fisherman.png'; // الصياد
export const FISH_1_IMAGE = '/assets/fishing-slots/symbols/fish1.png'; // سمكة 1
export const FISH_2_IMAGE = '/assets/fishing-slots/symbols/fish2.png'; // سمكة 2
export const FISH_3_IMAGE = '/assets/fishing-slots/symbols/fish3.png'; // سمكة 3
export const STARFISH_IMAGE = '/assets/fishing-slots/symbols/starfish.png'; // نجم البحر
export const SHELL_IMAGE = '/assets/fishing-slots/symbols/shell.png'; // صدفة
export const ANCHOR_IMAGE = '/assets/fishing-slots/symbols/anchor.png'; // مرساة
export const CRAB_IMAGE = '/assets/fishing-slots/symbols/crab.png'; // سلطعون
export const BAIT_BOX_IMAGE = '/assets/fishing-slots/symbols/bait-box.png'; // صندوق الطعم
export const FISH_MONEY_IMAGE = '/assets/fishing-slots/symbols/money-fish.png'; // سمكة بقيمة مالية

// صور أزرار التحكم
export const SPIN_BUTTON_IMAGE = '/assets/fishing-slots/buttons/spin-button.png';
export const AUTOPLAY_BUTTON_IMAGE = '/assets/fishing-slots/buttons/autoplay-button.png';
export const MAX_BET_BUTTON_IMAGE = '/assets/fishing-slots/buttons/max-bet-button.png';
export const PLUS_BUTTON_IMAGE = '/assets/fishing-slots/buttons/plus-button.png';
export const MINUS_BUTTON_IMAGE = '/assets/fishing-slots/buttons/minus-button.png';

// صور التأثيرات البصرية
export const WIN_FRAME_IMAGE = '/assets/fishing-slots/effects/win-frame.png';
export const SPLASH_EFFECT = '/assets/fishing-slots/effects/splash.png';
export const BUBBLE_IMAGE = '/assets/fishing-slots/effects/bubble.png';
export const WATER_RIPPLE = '/assets/fishing-slots/effects/water-ripple.png';
export const COIN_IMAGE = '/assets/fishing-slots/effects/coin.png';

// خرائط الرموز
export const SYMBOL_IMAGES: Record<SymbolType, string> = {
  [SymbolType.WILD]: WILD_IMAGE,
  [SymbolType.FISH_1]: FISH_1_IMAGE,
  [SymbolType.FISH_2]: FISH_2_IMAGE,
  [SymbolType.FISH_3]: FISH_3_IMAGE,
  [SymbolType.STARFISH]: STARFISH_IMAGE,
  [SymbolType.SHELL]: SHELL_IMAGE,
  [SymbolType.ANCHOR]: ANCHOR_IMAGE,
  [SymbolType.CRAB]: CRAB_IMAGE,
  [SymbolType.BAIT_BOX]: BAIT_BOX_IMAGE,
  [SymbolType.FISH_MONEY]: FISH_MONEY_IMAGE,
};

/**
 * مسارات ملفات الصوت
 */

// أصوات أساسية
export const BACKGROUND_MUSIC = '/assets/fishing-slots/sounds/background-music.mp3';
export const REELS_SPIN_SOUND = '/assets/fishing-slots/sounds/reels-spin.mp3';
export const REELS_STOP_SOUND = '/assets/fishing-slots/sounds/reels-stop.mp3';
export const BUTTON_CLICK_SOUND = '/assets/fishing-slots/sounds/button-click.mp3';

// أصوات الفوز
export const SMALL_WIN_SOUND = '/assets/fishing-slots/sounds/small-win.mp3';
export const BIG_WIN_SOUND = '/assets/fishing-slots/sounds/big-win.mp3';
export const MEGA_WIN_SOUND = '/assets/fishing-slots/sounds/mega-win.mp3';
export const COIN_SOUND = '/assets/fishing-slots/sounds/coin.mp3';

// أصوات خاصة
export const FISHERMAN_APPEAR_SOUND = '/assets/fishing-slots/sounds/fisherman-appear.mp3';
export const FISH_CAUGHT_SOUND = '/assets/fishing-slots/sounds/fish-caught.mp3';
export const WATER_SPLASH_SOUND = '/assets/fishing-slots/sounds/water-splash.mp3';
export const FREE_SPINS_TRIGGER_SOUND = '/assets/fishing-slots/sounds/free-spins-trigger.mp3';
export const BONUS_SOUND = '/assets/fishing-slots/sounds/bonus.mp3';

/**
 * استخدم رموز وصور بديلة مؤقتة لحين توفر الصور النهائية
 * سيتم استبدال هذه الرموز بالصور النهائية عند توفرها
 */

// صور بديلة مؤقتة للرموز (استخدم صور من مكتبة Emoji أو أي مصدر آخر مفتوح المصدر)
export const TEMP_SYMBOL_IMAGES: Record<SymbolType, string> = {
  [SymbolType.WILD]: '🧔', // رمز الصياد
  [SymbolType.FISH_1]: '🐟', // سمكة 1
  [SymbolType.FISH_2]: '🐠', // سمكة 2
  [SymbolType.FISH_3]: '🐡', // سمكة 3
  [SymbolType.STARFISH]: '⭐', // نجم البحر
  [SymbolType.SHELL]: '🐚', // صدفة
  [SymbolType.ANCHOR]: '⚓', // مرساة
  [SymbolType.CRAB]: '🦀', // سلطعون
  [SymbolType.BAIT_BOX]: '📦', // صندوق الطعم
  [SymbolType.FISH_MONEY]: '💰', // سمكة بقيمة مالية
};