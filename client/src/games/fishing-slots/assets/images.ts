/**
 * أصول الصور لعبة صياد السمك (Big Bass Bonanza)
 * يحتوي على جميع الصور والأيقونات المستخدمة في اللعبة
 */

import { SymbolType } from '../types';

// تعريف ألوان خطوط الدفع (20 خط)
export const PAYLINE_COLORS = [
  '#FF5252', // أحمر
  '#FFEB3B', // أصفر
  '#4CAF50', // أخضر
  '#2196F3', // أزرق
  '#9C27B0', // بنفسجي
  '#FF9800', // برتقالي
  '#607D8B', // رمادي أزرق
  '#E91E63', // وردي
  '#00BCD4', // فيروزي
  '#8BC34A', // أخضر فاتح
  '#FFC107', // أصفر ذهبي
  '#795548', // بني
  '#3F51B5', // أزرق غامق
  '#CDDC39', // ليموني
  '#673AB7', // بنفسجي داكن
  '#FF5722', // برتقالي داكن
  '#03A9F4', // أزرق فاتح
  '#9E9E9E', // رمادي
  '#FFCDD2', // وردي فاتح
  '#81C784'  // أخضر متوسط
];

// رمز الصياد (Wild)
export const FISHERMAN_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#0277BD" />
  <circle cx="100" cy="70" r="30" fill="#FFD54F" />
  <path d="M70 80 L130 80 L120 140 L80 140 Z" fill="#795548" />
  <path d="M85 100 L115 100 L110 140 L90 140 Z" fill="#4E342E" />
  <path d="M90 50 L110 50 L110 70 L90 70 Z" fill="#FF5722" />
  <path d="M60 70 L85 70 L85 80 L60 80 Z" fill="#FFECB3" />
  <path d="M115 70 L140 70 L140 80 L115 80 Z" fill="#FFECB3" />
  <path d="M90 140 L110 140 L110 180 L90 180 Z" fill="#5D4037" />
  <path d="M70 120 L130 120 L130 135 L70 135 Z" fill="#1565C0" />
  <path d="M100 70 L130 110 L140 100" stroke="#000000" stroke-width="2" fill="none" />
  <path d="M80 140 L120 140" stroke="#000000" stroke-width="2" fill="none" />
  <circle cx="90" cy="60" r="5" fill="#000000" />
  <circle cx="110" cy="60" r="5" fill="#000000" />
  <path d="M90 75 L110 75" stroke="#000000" stroke-width="2" fill="none" />
  <text x="100" y="190" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="bold">WILD</text>
</svg>
`;

// رمز صندوق الطعم (Scatter)
export const BAIT_BOX_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#8D6E63" />
  <rect x="30" y="50" width="140" height="100" rx="5" fill="#5D4037" />
  <rect x="40" y="60" width="120" height="80" rx="3" fill="#8D6E63" />
  <path d="M30 80 L170 80" stroke="#3E2723" stroke-width="3" fill="none" />
  <path d="M100 50 L100 150" stroke="#3E2723" stroke-width="3" fill="none" />
  <circle cx="100" cy="100" r="30" fill="#FFEB3B" opacity="0.5" />
  <circle cx="100" cy="80" r="10" fill="#5D4037" />
  <path d="M90 90 L70 125" stroke="#FF5722" stroke-width="5" fill="none" />
  <path d="M110 90 L130 125" stroke="#FF5722" stroke-width="5" fill="none" />
  <path d="M70 125 L95 115" stroke="#FF5722" stroke-width="5" fill="none" />
  <path d="M130 125 L105 115" stroke="#FF5722" stroke-width="5" fill="none" />
  <text x="100" y="175" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="bold">SCATTER</text>
</svg>
`;

// رمز سمكة كبيرة
export const FISH_3_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#039BE5" />
  <path d="M140 100 Q160 130 140 160 L60 160 Q40 130 60 100 Q40 70 60 40 L140 40 Q160 70 140 100 Z" fill="#FF5722" />
  <path d="M160 100 L190 130 L160 120 Z" fill="#FF5722" />
  <path d="M160 100 L190 70 L160 80 Z" fill="#FF5722" />
  <circle cx="80" cy="90" r="10" fill="#FFFFFF" />
  <circle cx="80" cy="90" r="5" fill="#000000" />
  <path d="M100 100 Q130 120 100 140 Q70 120 100 100 Z" fill="#B71C1C" opacity="0.6" />
  <path d="M100 100 L140 100" stroke="#B71C1C" stroke-width="2" stroke-dasharray="5,5" fill="none" />
</svg>
`;

// رمز سمكة متوسطة
export const FISH_2_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#0288D1" />
  <path d="M140 100 Q155 125 140 150 L60 150 Q45 125 60 100 Q45 75 60 50 L140 50 Q155 75 140 100 Z" fill="#FBC02D" />
  <path d="M155 100 L180 120 L155 110 Z" fill="#FBC02D" />
  <path d="M155 100 L180 80 L155 90 Z" fill="#FBC02D" />
  <circle cx="80" cy="90" r="8" fill="#FFFFFF" />
  <circle cx="80" cy="90" r="4" fill="#000000" />
  <path d="M100 100 Q125 115 100 130 Q75 115 100 100 Z" fill="#FB8C00" opacity="0.6" />
  <path d="M100 100 L140 100" stroke="#FB8C00" stroke-width="2" stroke-dasharray="3,3" fill="none" />
</svg>
`;

// رمز سمكة صغيرة
export const FISH_1_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#0097A7" />
  <path d="M130 100 Q145 120 130 140 L70 140 Q55 120 70 100 Q55 80 70 60 L130 60 Q145 80 130 100 Z" fill="#4CAF50" />
  <path d="M145 100 L165 115 L145 105 Z" fill="#4CAF50" />
  <path d="M145 100 L165 85 L145 95 Z" fill="#4CAF50" />
  <circle cx="85" cy="90" r="6" fill="#FFFFFF" />
  <circle cx="85" cy="90" r="3" fill="#000000" />
  <path d="M100 100 Q115 110 100 120 Q85 110 100 100 Z" fill="#388E3C" opacity="0.6" />
  <path d="M100 100 L130 100" stroke="#388E3C" stroke-width="1" stroke-dasharray="2,2" fill="none" />
</svg>
`;

// رمز نجم البحر
export const STARFISH_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#01579B" />
  <path d="M100 40 L115 85 L165 85 L125 115 L140 165 L100 135 L60 165 L75 115 L35 85 L85 85 Z" fill="#FF7043" />
  <circle cx="100" cy="100" r="15" fill="#FF5722" />
  <path d="M100 40 Q105 60 115 85 Q100 80 85 85 Q95 60 100 40 Z" fill="#E64A19" opacity="0.7" />
  <path d="M165 85 Q140 90 125 115 Q130 100 140 165 Q140 135 165 85 Z" fill="#E64A19" opacity="0.7" />
  <path d="M140 165 Q120 150 100 135 Q105 150 60 165 Q95 150 140 165 Z" fill="#E64A19" opacity="0.7" />
  <path d="M60 165 Q65 135 75 115 Q70 100 35 85 Q60 100 60 165 Z" fill="#E64A19" opacity="0.7" />
  <path d="M35 85 Q60 85 85 85 Q80 70 100 40 Q70 60 35 85 Z" fill="#E64A19" opacity="0.7" />
</svg>
`;

// رمز صدفة
export const SHELL_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#006064" />
  <path d="M100 160 Q60 160 40 120 Q30 80 50 60 Q70 50 100 50 Q130 50 150 60 Q170 80 160 120 Q140 160 100 160 Z" fill="#FFCCBC" />
  <path d="M100 160 Q60 160 40 120 Q30 80 50 60 L100 50 L100 160 Z" fill="#FFAB91" />
  <path d="M100 140 Q70 140 55 115 Q45 85 60 70 Q75 65 100 65 Q125 65 140 70 Q155 85 145 115 Q130 140 100 140 Z" fill="#FF8A65" />
  <path d="M100 120 Q78 120 65 105 Q55 90 63 78 Q75 75 100 75 Q125 75 137 78 Q145 90 135 105 Q122 120 100 120 Z" fill="#FF5722" />
  <path d="M100 100 Q85 100 75 95 Q68 90 70 83 Q80 80 100 80 Q120 80 130 83 Q132 90 125 95 Q115 100 100 100 Z" fill="#BF360C" />
  <path d="M100 65 L100 140" stroke="#FFCCBC" stroke-width="2" stroke-dasharray="3,3" fill="none" />
  <path d="M60 70 L140 70" stroke="#FFCCBC" stroke-width="2" stroke-dasharray="3,3" fill="none" />
  <path d="M55 100 L145 100" stroke="#FFCCBC" stroke-width="2" stroke-dasharray="3,3" fill="none" />
</svg>
`;

// رمز مرساة
export const ANCHOR_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#00838F" />
  <path d="M100 50 L100 150" stroke="#455A64" stroke-width="15" fill="none" />
  <circle cx="100" cy="60" r="15" fill="#78909C" stroke="#455A64" stroke-width="5" />
  <path d="M100 150 Q65 150 50 130 L70 110" stroke="#455A64" stroke-width="8" fill="none" />
  <path d="M100 150 Q135 150 150 130 L130 110" stroke="#455A64" stroke-width="8" fill="none" />
  <path d="M80 80 L120 80" stroke="#455A64" stroke-width="8" fill="none" />
  <path d="M55 130 L145 130" stroke="#455A64" stroke-width="3" stroke-dasharray="5,5" fill="none" />
</svg>
`;

// رمز سلطعون
export const CRAB_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#01579B" />
  <circle cx="100" cy="100" r="35" fill="#E53935" />
  <path d="M100 75 L100 125" stroke="#B71C1C" stroke-width="5" fill="none" />
  <path d="M75 100 L125 100" stroke="#B71C1C" stroke-width="5" fill="none" />
  <circle cx="85" cy="85" r="8" fill="#FFFFFF" />
  <circle cx="85" cy="85" r="4" fill="#000000" />
  <circle cx="115" cy="85" r="8" fill="#FFFFFF" />
  <circle cx="115" cy="85" r="4" fill="#000000" />
  <path d="M90 110 Q100 120 110 110" stroke="#B71C1C" stroke-width="3" fill="none" />
  <path d="M65 65 Q50 50 35 50 Q25 55 30 65 Q40 75 55 70" fill="#E53935" />
  <path d="M135 65 Q150 50 165 50 Q175 55 170 65 Q160 75 145 70" fill="#E53935" />
  <path d="M60 120 Q40 130 35 150 Q40 155 50 150 Q65 135 70 125" fill="#E53935" />
  <path d="M140 120 Q160 130 165 150 Q160 155 150 150 Q135 135 130 125" fill="#E53935" />
  <path d="M75 135 Q60 155 65 165 Q75 170 85 150 Q90 140 90 135" fill="#E53935" />
  <path d="M125 135 Q140 155 135 165 Q125 170 115 150 Q110 140 110 135" fill="#E53935" />
</svg>
`;

// رمز سمكة ذات قيمة نقدية
export const FISH_MONEY_SYMBOL = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" rx="10" fill="#00BCD4" />
  <path d="M140 100 Q160 130 140 160 L60 160 Q40 130 60 100 Q40 70 60 40 L140 40 Q160 70 140 100 Z" fill="#64DD17" />
  <path d="M160 100 L190 130 L160 120 Z" fill="#64DD17" />
  <path d="M160 100 L190 70 L160 80 Z" fill="#64DD17" />
  <circle cx="80" cy="90" r="10" fill="#FFFFFF" />
  <circle cx="80" cy="90" r="5" fill="#000000" />
  <path d="M100 100 Q130 120 100 140 Q70 120 100 100 Z" fill="#33691E" opacity="0.6" />
  <path d="M100 100 L140 100" stroke="#33691E" stroke-width="2" stroke-dasharray="5,5" fill="none" />
  <circle cx="120" cy="100" r="30" fill="#FFD54F" opacity="0.8" stroke="#FFA000" stroke-width="5" />
  <text x="120" y="105" text-anchor="middle" fill="#795548" font-size="25" font-weight="bold">$</text>
</svg>
`;

// شعار لعبة صياد السمك
export const GAME_LOGO = `
<svg width="500" height="200" viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#01579B" />
      <stop offset="100%" stop-color="#0288D1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
    </filter>
  </defs>
  <rect width="500" height="200" rx="20" fill="url(#logoGradient)" />
  
  <!-- صندوق طعم -->
  <rect x="50" y="50" width="80" height="60" rx="5" fill="#5D4037" />
  <rect x="60" y="60" width="60" height="40" rx="3" fill="#8D6E63" />
  <path d="M50 70 L130 70" stroke="#3E2723" stroke-width="2" fill="none" />
  <path d="M90 50 L90 110" stroke="#3E2723" stroke-width="2" fill="none" />
  
  <!-- صياد -->
  <circle cx="180" cy="70" r="20" fill="#FFD54F" />
  <path d="M160 80 L200 80 L190 120 L170 120 Z" fill="#795548" />
  <path d="M170 120 L175 140 L185 140 L190 120" fill="#5D4037" />
  <path d="M170 60 L190 60 L190 70 L170 70 Z" fill="#FF5722" />
  <path d="M160 80 L200 80" stroke="#000000" stroke-width="1" fill="none" />
  <circle cx="175" cy="65" r="3" fill="#000000" />
  <circle cx="185" cy="65" r="3" fill="#000000" />
  
  <!-- سمكة -->
  <path d="M260 100 Q280 130 260 140 L230 140 Q210 110 230 100 Q210 90 230 60 L260 60 Q280 70 260 100 Z" fill="#64DD17" />
  <path d="M280 100 L300 120 L280 110 Z" fill="#64DD17" />
  <path d="M280 100 L300 80 L280 90 Z" fill="#64DD17" />
  <circle cx="240" cy="90" r="5" fill="#FFFFFF" />
  <circle cx="240" cy="90" r="2" fill="#000000" />
  
  <!-- صياد السمك - نص -->
  <text x="250" y="60" text-anchor="middle" fill="#FFFFFF" font-size="40" font-weight="bold" filter="url(#shadow)">صياد السمك</text>
  
  <!-- Big Bass Bonanza - نص -->
  <text x="350" y="100" text-anchor="middle" fill="#FFD54F" font-size="25" font-weight="bold" filter="url(#shadow)">Big Bass Bonanza</text>
  
  <!-- خط فوق النص -->
  <path d="M150 160 L350 160" stroke="#FFFFFF" stroke-width="3" fill="none" />
  
  <!-- زخرفة -->
  <circle cx="150" cy="160" r="5" fill="#FFD54F" />
  <circle cx="350" cy="160" r="5" fill="#FFD54F" />
  <circle cx="250" cy="160" r="5" fill="#FFD54F" />
</svg>
`;

// أيقونة العملة
export const COIN_ICON = `
<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FF8C00" stroke-width="2" />
  <circle cx="20" cy="20" r="15" fill="#FFC107" />
  <text x="20" y="25" text-anchor="middle" fill="#7B5600" font-size="16" font-weight="bold">$</text>
  <circle cx="20" cy="20" r="12" fill="none" stroke="#FF8C00" stroke-width="1" stroke-dasharray="2,2" />
</svg>
`;

// خلفية اللعبة
export const GAME_BACKGROUND = `
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#01579B" />
      <stop offset="50%" stop-color="#0288D1" />
      <stop offset="100%" stop-color="#039BE5" />
    </linearGradient>
    <radialGradient id="lightRay" cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <pattern id="bubblePattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="30" r="5" fill="#FFFFFF" opacity="0.1" />
      <circle cx="60" cy="80" r="8" fill="#FFFFFF" opacity="0.1" />
      <circle cx="120" cy="50" r="4" fill="#FFFFFF" opacity="0.1" />
      <circle cx="180" cy="120" r="6" fill="#FFFFFF" opacity="0.1" />
      <circle cx="40" cy="140" r="7" fill="#FFFFFF" opacity="0.1" />
      <circle cx="150" cy="180" r="5" fill="#FFFFFF" opacity="0.1" />
    </pattern>
  </defs>
  
  <!-- الخلفية المائية -->
  <rect width="1920" height="1080" fill="url(#oceanGradient)" />
  
  <!-- أشعة الشمس تحت الماء -->
  <path d="M0 0 L1920 0 L1920 1080 L0 1080 Z" fill="url(#lightRay)" />
  
  <!-- طبقة فقاعات -->
  <rect width="1920" height="1080" fill="url(#bubblePattern)" />
  
  <!-- شعاب مرجانية (بسيطة) -->
  <path d="M0 900 C200 850, 300 950, 500 900 C700 850, 900 950, 1100 900 C1300 850, 1500 950, 1700 900 C1800 880, 1900 900, 1920 900 L1920 1080 L0 1080 Z" fill="#E65100" opacity="0.3" />
  <path d="M0 950 C150 920, 250 980, 400 950 C550 920, 700 980, 850 950 C1000 920, 1150 980, 1300 950 C1450 920, 1600 980, 1750 950 C1850 930, 1900 950, 1920 950 L1920 1080 L0 1080 Z" fill="#EF6C00" opacity="0.4" />
  
  <!-- طحالب بحرية -->
  <path d="M200 950 C200 900, 220 880, 220 840 C220 800, 200 780, 200 740 C200 700, 220 680, 220 640" stroke="#2E7D32" stroke-width="8" fill="none" />
  <path d="M220 950 C220 910, 240 890, 240 860 C240 830, 220 810, 220 780" stroke="#2E7D32" stroke-width="5" fill="none" />
  <path d="M180 950 C180 920, 160 900, 160 870 C160 840, 180 820, 180 790" stroke="#2E7D32" stroke-width="6" fill="none" />
  
  <path d="M1700 950 C1700 900, 1720 880, 1720 840 C1720 800, 1700 780, 1700 740 C1700 700, 1720 680, 1720 640" stroke="#2E7D32" stroke-width="8" fill="none" />
  <path d="M1720 950 C1720 910, 1740 890, 1740 860 C1740 830, 1720 810, 1720 780" stroke="#2E7D32" stroke-width="5" fill="none" />
  <path d="M1680 950 C1680 920, 1660 900, 1660 870 C1660 840, 1680 820, 1680 790" stroke="#2E7D32" stroke-width="6" fill="none" />
  
  <path d="M800 950 C800 900, 780 880, 780 840 C780 800, 800 780, 800 740" stroke="#2E7D32" stroke-width="7" fill="none" />
  <path d="M830 950 C830 910, 850 890, 850 860 C850 830, 830 810, 830 780" stroke="#2E7D32" stroke-width="4" fill="none" />
  <path d="M770 950 C770 920, 750 900, 750 870 C750 840, 770 820, 770 790" stroke="#2E7D32" stroke-width="5" fill="none" />
  
  <!-- الرمل في القاع -->
  <path d="M0 980 C150 960, 250 1000, 400 980 C550 960, 700 1000, 850 980 C1000 960, 1150 1000, 1300 980 C1450 960, 1600 1000, 1750 980 C1850 970, 1900 980, 1920 980 L1920 1080 L0 1080 Z" fill="#FFA726" opacity="0.7" />
</svg>
`;

// تحويل من SVG إلى URL للصورة
export const svgToImageUrl = (svgString: string): string => {
  const encodedSvg = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encodedSvg}`;
};

// استيراد صور الرموز
export const SYMBOL_IMAGES = {
  [SymbolType.FISHERMAN]: svgToImageUrl(FISHERMAN_SYMBOL),
  [SymbolType.BAIT_BOX]: svgToImageUrl(BAIT_BOX_SYMBOL),
  [SymbolType.FISH_3]: svgToImageUrl(FISH_3_SYMBOL),
  [SymbolType.FISH_2]: svgToImageUrl(FISH_2_SYMBOL),
  [SymbolType.FISH_1]: svgToImageUrl(FISH_1_SYMBOL),
  [SymbolType.STARFISH]: svgToImageUrl(STARFISH_SYMBOL),
  [SymbolType.SHELL]: svgToImageUrl(SHELL_SYMBOL),
  [SymbolType.ANCHOR]: svgToImageUrl(ANCHOR_SYMBOL),
  [SymbolType.CRAB]: svgToImageUrl(CRAB_SYMBOL),
  [SymbolType.FISH_MONEY]: svgToImageUrl(FISH_MONEY_SYMBOL)
};

export const LOGO_IMAGE = svgToImageUrl(GAME_LOGO);
export const BACKGROUND_IMAGE = svgToImageUrl(GAME_BACKGROUND);
export const COIN_ICON_IMAGE = svgToImageUrl(COIN_ICON);