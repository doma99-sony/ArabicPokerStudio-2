import React from 'react';

interface EgyptianFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'primary' | 'secondary' | 'gold' | 'royal' | 'stone';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  onClick?: () => void;
}

/**
 * مكون إطار مصري مزخرف
 * يستخدم في إحاطة المحتوى في اللعبة بإطار ذو طابع مصري قديم
 */
const EgyptianFrame: React.FC<EgyptianFrameProps> = ({
  children,
  className = '',
  style = {},
  variant = 'primary',
  size = 'medium',
  animated = false,
  onClick
}) => {
  // تحديد ألوان الإطار بناءً على النوع المختار
  const getFrameColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          main: '#8B5A2B',
          accent: '#FFC107',
          border: '#A97C50',
          glow: 'rgba(255, 193, 7, 0.3)'
        };
      case 'gold':
        return {
          main: '#D4AF37',
          accent: '#FFEB3B',
          border: '#FFD700',
          glow: 'rgba(255, 215, 0, 0.4)'
        };
      case 'royal':
        return {
          main: '#4A148C',
          accent: '#7B1FA2',
          border: '#9C27B0',
          glow: 'rgba(156, 39, 176, 0.3)'
        };
      case 'stone':
        return {
          main: '#607D8B',
          accent: '#78909C',
          border: '#90A4AE',
          glow: 'rgba(96, 125, 139, 0.3)'
        };
      default: // primary
        return {
          main: '#795548',
          accent: '#D4AF37',
          border: '#8D6E63',
          glow: 'rgba(212, 175, 55, 0.3)'
        };
    }
  };
  
  // تحديد حجم الإطار وحشواته بناءً على الحجم المختار
  const getFrameSize = () => {
    switch (size) {
      case 'small':
        return {
          padding: 'p-1 sm:p-2',
          border: 'border-2',
          borderRadius: 'rounded-md',
          cornerSize: 'w-3 h-3'
        };
      case 'large':
        return {
          padding: 'p-4 sm:p-6',
          border: 'border-4',
          borderRadius: 'rounded-xl',
          cornerSize: 'w-6 h-6'
        };
      default: // medium
        return {
          padding: 'p-2 sm:p-4',
          border: 'border-3',
          borderRadius: 'rounded-lg',
          cornerSize: 'w-4 h-4'
        };
    }
  };
  
  const colors = getFrameColors();
  const sizeProps = getFrameSize();
  
  // تحديد كلاسات CSS النهائية
  const frameClasses = [
    'egyptian-frame relative',
    sizeProps.padding,
    sizeProps.border,
    sizeProps.borderRadius,
    'overflow-hidden',
    animated ? 'frame-animated' : '',
    onClick ? 'cursor-pointer transform hover:scale-[1.02] transition-transform' : '',
    className
  ].filter(Boolean).join(' ');
  
  // أسلوب الإطار
  const frameStyle: React.CSSProperties = {
    backgroundColor: colors.main,
    borderColor: colors.border,
    boxShadow: `0 0 10px ${colors.glow}`,
    ...style
  };
  
  // إنشاء زخارف الزوايا
  const renderCorners = () => {
    const positions = [
      'top-0 left-0', // top-left
      'top-0 right-0', // top-right
      'bottom-0 left-0', // bottom-left
      'bottom-0 right-0' // bottom-right
    ];
    
    return positions.map((position, index) => (
      <div 
        key={`corner-${index}`}
        className={`absolute ${position} ${sizeProps.cornerSize} pointer-events-none`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {index === 0 && ( // top-left
            <path 
              d="M0,0 L24,0 L24,8 C24,8 16,8 12,12 C8,16 8,24 8,24 L0,24 Z" 
              fill={colors.accent} 
              opacity="0.6"
            />
          )}
          {index === 1 && ( // top-right
            <path 
              d="M0,0 L24,0 L24,24 L16,24 C16,24 16,16 12,12 C8,8 0,8 0,8 Z" 
              fill={colors.accent} 
              opacity="0.6"
            />
          )}
          {index === 2 && ( // bottom-left
            <path 
              d="M0,0 L8,0 C8,0 8,8 12,12 C16,16 24,16 24,16 L24,24 L0,24 Z" 
              fill={colors.accent} 
              opacity="0.6"
            />
          )}
          {index === 3 && ( // bottom-right
            <path 
              d="M24,0 L24,24 L0,24 L0,16 C0,16 8,16 12,12 C16,8 16,0 16,0 Z" 
              fill={colors.accent} 
              opacity="0.6"
            />
          )}
        </svg>
      </div>
    ));
  };
  
  // إنشاء الزخارف المصرية على حواف الإطار
  const renderEgyptianDecorations = () => {
    return (
      <>
        {/* الزخارف العلوية */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-1/2 flex justify-around items-center pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={`top-${i}`} className="w-1 h-1 bg-current rounded-full" style={{ color: colors.accent }}></div>
          ))}
        </div>
        
        {/* الزخارف السفلية */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-1/2 flex justify-around items-center pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={`bottom-${i}`} className="w-1 h-1 bg-current rounded-full" style={{ color: colors.accent }}></div>
          ))}
        </div>
        
        {/* الزخارف اليمنى */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-1/2 flex flex-col justify-around items-center pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={`right-${i}`} className="w-1 h-1 bg-current rounded-full" style={{ color: colors.accent }}></div>
          ))}
        </div>
        
        {/* الزخارف اليسرى */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-1/2 flex flex-col justify-around items-center pointer-events-none">
          {[...Array(7)].map((_, i) => (
            <div key={`left-${i}`} className="w-1 h-1 bg-current rounded-full" style={{ color: colors.accent }}></div>
          ))}
        </div>
        
        {/* الرموز المصرية في الزوايا */}
        <span className="absolute top-1 left-1 text-xs opacity-60" style={{ color: colors.accent }}>🔆</span>
        <span className="absolute top-1 right-1 text-xs opacity-60" style={{ color: colors.accent }}>🔆</span>
        <span className="absolute bottom-1 left-1 text-xs opacity-60" style={{ color: colors.accent }}>🔆</span>
        <span className="absolute bottom-1 right-1 text-xs opacity-60" style={{ color: colors.accent }}>🔆</span>
      </>
    );
  };
  
  return (
    <div
      className={frameClasses}
      style={frameStyle}
      onClick={onClick}
    >
      {/* زخارف الزوايا */}
      {renderCorners()}
      
      {/* الزخارف المصرية */}
      {renderEgyptianDecorations()}
      
      {/* توهج داخلي */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          boxShadow: `inset 0 0 10px ${colors.glow}`,
          borderRadius: 'inherit'
        }}
      ></div>
      
      {/* المحتوى */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* أنماط CSS للحركة */}
      {animated && (
        <style jsx>{`
          @keyframes border-glow {
            0%, 100% { border-color: ${colors.border}; box-shadow: 0 0 5px ${colors.glow}; }
            50% { border-color: ${colors.accent}; box-shadow: 0 0 15px ${colors.glow}; }
          }
          
          .frame-animated {
            animation: border-glow 3s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
};

export default EgyptianFrame;