/**
 * ملف الصور للعبة صياد السمك
 * يحتوي على الروابط وتحميل الصور المستخدمة في اللعبة
 */

// نوع للصور
export type ImageAssets = {
  [key: string]: string;
};

// رموز اللعبة
export const symbolImages: ImageAssets = {
  // الرموز الرئيسية
  FISHERMAN: '/attached_assets/image_1743814147037.png', // الصياد - رمز Wild
  BAIT_BOX: '/attached_assets/image_1743813345743.png', // صندوق الطعم - رمز Scatter
  
  // أنواع الأسماك
  FISH_3: '/attached_assets/image_1743814799256.png', // سمكة كبيرة
  FISH_2: '/attached_assets/image_1743814788737.png', // سمكة متوسطة
  FISH_1: '/attached_assets/image_1743812233642.png', // سمكة صغيرة
  
  // رموز أخرى
  STARFISH: '/attached_assets/image_1743972599138.png', // نجم البحر
  SHELL: '/attached_assets/image_1743971608301.png', // صدفة
  ANCHOR: '/attached_assets/image_1743712247685.png', // مرساة
  CRAB: '/attached_assets/image_1743712233642.png', // سلطعون
  
  // رموز خاصة
  FISH_MONEY: '/attached_assets/image_1743712356459.png', // سمكة ذات قيمة نقدية
};

// خلفيات اللعبة
export const backgroundImages: ImageAssets = {
  MAIN_BG: '/attached_assets/image_1743811914084.png', // الخلفية الرئيسية
  FREE_SPINS_BG: '/attached_assets/image_1743519289308.png', // خلفية اللفات المجانية
  BONUS_BG: '/attached_assets/image_1743518883942.png', // خلفية مرحلة المكافأة
};

// واجهة المستخدم
export const uiImages: ImageAssets = {
  LOGO: '/attached_assets/image_1743814147037.png', // شعار اللعبة
  SPIN_BUTTON: '/attached_assets/image_1743515959988.png', // زر اللف
  PAYLINES: '/attached_assets/image_1743518228587.png', // خطوط الدفع
  COIN: '/attached_assets/image_1743514804390.png', // رمز العملة
};

// تأثيرات بصرية
export const effectImages: ImageAssets = {
  WIN_FRAME: '/attached_assets/image_1743514778788.png', // إطار الفوز
  SPLASH: '/attached_assets/image_1743514125047.png', // تأثير رشاش الماء
  BUBBLES: '/attached_assets/image_1743513903748.png', // فقاعات
  WAVE: '/attached_assets/image_1743513895448.png', // موجة
};

// رسومات الجوائز والمكافآت
export const bonusImages: ImageAssets = {
  CHEST: '/attached_assets/image_1743723261824.png', // صندوق الكنز
  GOLDEN_ROD: '/attached_assets/image_1743625343194.png', // صنارة ذهبية
  TREASURE_MAP: '/attached_assets/image_1743624179878.png', // خريطة الكنز
};

// تحميل مسبق للصور
export const preloadImages = (): void => {
  const allImages = {
    ...symbolImages,
    ...backgroundImages,
    ...uiImages,
    ...effectImages,
    ...bonusImages
  };

  // تحميل جميع الصور في الخلفية
  Object.values(allImages).forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// تصدير الكل في كائن واحد للسهولة
export const images = {
  symbols: symbolImages,
  backgrounds: backgroundImages,
  ui: uiImages,
  effects: effectImages,
  bonus: bonusImages,
  preload: preloadImages
};

export default images;