import React from 'react';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
}

/**
 * مجموعة من الأيقونات المصرية المرسومة بتقنية SVG
 * تستخدم في واجهة مستخدم اللعبة
 */

// أيقونة عين حورس
export const EyeOfHorusIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M2,12 C5,8 8,6 12,6 C16,6 19,8 22,12 C19,16 16,18 12,18 C8,18 5,16 2,12 Z" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="12" cy="12" r="3" fill={color} />
    <path d="M9,7 L5,3 M15,7 L19,3" stroke={color} strokeWidth="1.5" />
    <path d="M7,14 L3,18 M17,14 L21,18" stroke={color} strokeWidth="1.5" />
  </svg>
);

// أيقونة أنخ (مفتاح الحياة)
export const AnkhIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M12,2 L12,14 M7,8 L17,8 M12,14 Q8,14 7,17 Q6,20 12,22 Q18,20 17,17 Q16,14 12,14" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

// أيقونة هرم مصري
export const PyramidIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
  >
    <path 
      d="M12,2 L22,22 L2,22 Z" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M12,2 L12,22" 
      stroke={color} 
      strokeWidth="1" 
      strokeDasharray="2 1"
    />
    <path 
      d="M7,12 L17,12" 
      stroke={color} 
      strokeWidth="1" 
      strokeDasharray="2 1"
    />
  </svg>
);

// أيقونة صقر حورس
export const HorusFalconIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M12,2 Q7,4 5,8 Q3,12 3,18 L6,16 L9,17 L12,14 L15,17 L18,16 L21,18 Q21,12 19,8 Q17,4 12,2 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <circle cx="9" cy="8" r="1" fill={color} />
    <circle cx="15" cy="8" r="1" fill={color} />
    <path d="M12,9 L12,12" stroke={color} strokeWidth="1.5" />
    <path d="M9,12 L15,12" stroke={color} strokeWidth="1.5" />
  </svg>
);

// أيقونة تاج فرعوني
export const PharaohCrownIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M8,22 L8,10 Q8,6 12,4 Q16,6 16,10 L16,22 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M12,4 L12,2" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M8,14 L16,14" 
      stroke={color} 
      strokeWidth="1"
    />
    <path 
      d="M8,18 L16,18" 
      stroke={color} 
      strokeWidth="1"
    />
    <path 
      d="M5,10 L8,10 M19,10 L16,10" 
      stroke={color} 
      strokeWidth="1.5"
    />
  </svg>
);

// أيقونة خنفساء الجعران
export const ScarabBeetleIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <ellipse 
      cx="12" 
      cy="14" 
      rx="8" 
      ry="6" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M6,12 Q9,6 12,3 Q15,6 18,12" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M5,12 Q3,15 4,18 M19,12 Q21,15 20,18" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <circle cx="9" cy="12" r="1" fill={color} />
    <circle cx="15" cy="12" r="1" fill={color} />
    <path 
      d="M12,16 L12,21" 
      stroke={color} 
      strokeWidth="1.5"
    />
  </svg>
);

// أيقونة عملة ذهبية
export const GoldCoinIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke={color} 
      strokeWidth="1"
      strokeDasharray="2 1"
      fill="none"
    />
    <path 
      d="M12,6 L12,18 M8,10 L12,6 L16,10 M8,14 L12,18 L16,14" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

// أيقونة مومياء فرعونية
export const MummyIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M8,4 L10,3 L14,3 L16,4 L16,8 L15,9 L15,11 L16,12 L16,14 L15,15 L15,17 L16,18 L16,20 L14,21 L10,21 L8,20 L8,18 L9,17 L9,15 L8,14 L8,12 L9,11 L9,9 L8,8 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M10,7 L14,7 M10,10 L14,10 M10,13 L14,13 M10,16 L14,16 M10,19 L14,19" 
      stroke={color} 
      strokeWidth="1"
      strokeLinecap="round"
    />
    <circle cx="10" cy="5" r="0.5" fill={color} />
    <circle cx="14" cy="5" r="0.5" fill={color} />
  </svg>
);

// أيقونة جاكبوت (Jackpot)
export const JackpotIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M12,2 L15,5 L19,6 L20,10 L22,12 L20,14 L19,18 L15,19 L12,22 L9,19 L5,18 L4,14 L2,12 L4,10 L5,6 L9,5 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="4" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M12,6 L12,8 M18,12 L16,12 M12,18 L12,16 M6,12 L8,12" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M7.5,7.5 L9,9 M16.5,7.5 L15,9 M16.5,16.5 L15,15 M7.5,16.5 L9,15" 
      stroke={color} 
      strokeWidth="1.5"
    />
  </svg>
);

// أيقونة كتاب سحر مصري
export const SpellBookIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M4,4 L4,20 L20,20 L20,4 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M4,4 L12,8 L20,4" 
      stroke={color} 
      strokeWidth="1.5"
      fill="none"
    />
    <path 
      d="M12,8 L12,20" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M8,10 L10,10 M14,10 L16,10" 
      stroke={color} 
      strokeWidth="1"
    />
    <path 
      d="M6,14 L10,14 M14,14 L18,14" 
      stroke={color} 
      strokeWidth="1"
    />
    <path 
      d="M8,17 L10,17 M14,17 L16,17" 
      stroke={color} 
      strokeWidth="1"
    />
  </svg>
);

// أيقونة فرعون
export const PharaohIcon: React.FC<IconProps> = ({ 
  className = '', 
  width = 24, 
  height = 24,
  color = '#D4AF37'
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={width} 
    height={height} 
    className={className}
    fill="none"
  >
    <path 
      d="M8,22 L8,14 L5,12 L5,8 L8,7 L12,3 L16,7 L19,8 L19,12 L16,14 L16,22 Z" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M8,14 L16,14" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M10,9 L14,9" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <path 
      d="M5,10 L8,10 M19,10 L16,10" 
      stroke={color} 
      strokeWidth="1"
    />
    <path 
      d="M12,17 L12,20" 
      stroke={color} 
      strokeWidth="1.5"
    />
    <circle cx="10" cy="6" r="1" fill={color} />
    <circle cx="14" cy="6" r="1" fill={color} />
  </svg>
);

// مجموعة من الأيقونات المستخدمة في اللعبة
export const GameIconSet = {
  EyeOfHorus: EyeOfHorusIcon,
  Ankh: AnkhIcon,
  Pyramid: PyramidIcon,
  HorusFalcon: HorusFalconIcon,
  PharaohCrown: PharaohCrownIcon,
  ScarabBeetle: ScarabBeetleIcon,
  GoldCoin: GoldCoinIcon,
  Mummy: MummyIcon,
  Jackpot: JackpotIcon,
  SpellBook: SpellBookIcon,
  Pharaoh: PharaohIcon
};

export default GameIconSet;