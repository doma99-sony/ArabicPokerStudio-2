import React from 'react';
import GameIconSet from '../assets/egyptian-icons';

interface EgyptianIconsGalleryProps {
  onSelectIcon?: (iconName: string) => void;
  showLabels?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  highlightedIcon?: string;
}

/**
 * مكون معرض الأيقونات المصرية
 * يعرض مجموعة من الأيقونات المصرية بتصميم SVG
 * يمكن اختيار أيقونة والتفاعل معها
 */
const EgyptianIconsGallery: React.FC<EgyptianIconsGalleryProps> = ({
  onSelectIcon,
  showLabels = true,
  className = '',
  size = 'medium',
  color = '#D4AF37',
  highlightedIcon
}) => {
  // تحديد حجم الأيقونة بناءً على الخيار المحدد
  const getIconSize = () => {
    switch (size) {
      case 'small': return { width: 24, height: 24 };
      case 'large': return { width: 48, height: 48 };
      default: return { width: 32, height: 32 };
    }
  };
  
  const iconSize = getIconSize();
  
  // قائمة الأيقونات المصرية مع أسمائها
  const icons = [
    { name: 'EyeOfHorus', label: 'عين حورس', component: GameIconSet.EyeOfHorus },
    { name: 'Ankh', label: 'عنخ', component: GameIconSet.Ankh },
    { name: 'Pyramid', label: 'هرم', component: GameIconSet.Pyramid },
    { name: 'HorusFalcon', label: 'صقر حورس', component: GameIconSet.HorusFalcon },
    { name: 'PharaohCrown', label: 'تاج فرعوني', component: GameIconSet.PharaohCrown },
    { name: 'ScarabBeetle', label: 'جعران', component: GameIconSet.ScarabBeetle },
    { name: 'GoldCoin', label: 'عملة ذهبية', component: GameIconSet.GoldCoin },
    { name: 'Mummy', label: 'مومياء', component: GameIconSet.Mummy },
    { name: 'Jackpot', label: 'جاكبوت', component: GameIconSet.Jackpot },
    { name: 'SpellBook', label: 'كتاب سحر', component: GameIconSet.SpellBook },
    { name: 'Pharaoh', label: 'فرعون', component: GameIconSet.Pharaoh }
  ];

  // معالجة اختيار أيقونة
  const handleIconClick = (iconName: string) => {
    if (onSelectIcon) {
      onSelectIcon(iconName);
    }
  };

  return (
    <div className={`egyptian-icons-gallery grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 ${className}`}>
      {icons.map((icon) => {
        const isHighlighted = highlightedIcon === icon.name;
        const IconComponent = icon.component;
        
        return (
          <div 
            key={icon.name}
            className={`icon-item flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-110 ${
              isHighlighted 
                ? 'bg-yellow-100/20 ring-2 ring-yellow-500 scale-105' 
                : 'hover:bg-black/10'
            }`}
            onClick={() => handleIconClick(icon.name)}
          >
            <div className={`icon-wrapper p-2 rounded-full ${isHighlighted ? 'animate-pulse-glow' : ''}`}>
              <IconComponent 
                width={iconSize.width} 
                height={iconSize.height} 
                color={color}
                className={isHighlighted ? 'filter drop-shadow(0 0 4px gold)' : ''}
              />
            </div>
            
            {showLabels && (
              <span className="mt-2 text-xs text-center font-medium text-yellow-100">
                {icon.label}
              </span>
            )}
          </div>
        );
      })}
      
      {/* أنماط CSS المضمنة */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2px ${color}); }
          50% { filter: drop-shadow(0 0 8px ${color}); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EgyptianIconsGallery;