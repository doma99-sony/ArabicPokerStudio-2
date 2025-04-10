import React from 'react';
import { GameIconSet } from '../assets/egyptian-icons';

interface EgyptianButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'gold' | 'royal' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof GameIconSet;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  glowing?: boolean;
  hoverScale?: boolean;
}

/**
 * مكون زر بتصميم مصري قديم
 * يحتوي على زخارف وتأثيرات مستوحاة من الحضارة المصرية القديمة
 */
const EgyptianButton: React.FC<EgyptianButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  glowing = false,
  hoverScale = true
}) => {
  // تحديد ألوان الزر بناءً على النوع المختار
  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: 'from-gray-700 to-gray-900',
          border: 'border-gray-500',
          text: 'text-gray-100',
          hover: 'hover:from-gray-600 hover:to-gray-800',
          disabled: 'from-gray-500 to-gray-600 border-gray-400 text-gray-300',
          glow: 'rgba(255, 255, 255, 0.3)'
        };
      case 'gold':
        return {
          bg: 'from-yellow-700 to-yellow-900',
          border: 'border-yellow-500',
          text: 'text-yellow-100',
          hover: 'hover:from-yellow-600 hover:to-yellow-800',
          disabled: 'from-yellow-400 to-yellow-500 border-yellow-300 text-yellow-200',
          glow: 'rgba(255, 215, 0, 0.4)'
        };
      case 'royal':
        return {
          bg: 'from-purple-700 to-purple-900',
          border: 'border-purple-500',
          text: 'text-purple-100',
          hover: 'hover:from-purple-600 hover:to-purple-800',
          disabled: 'from-purple-400 to-purple-500 border-purple-300 text-purple-200',
          glow: 'rgba(128, 0, 128, 0.4)'
        };
      case 'danger':
        return {
          bg: 'from-red-700 to-red-900',
          border: 'border-red-500',
          text: 'text-red-100',
          hover: 'hover:from-red-600 hover:to-red-800',
          disabled: 'from-red-400 to-red-500 border-red-300 text-red-200',
          glow: 'rgba(220, 38, 38, 0.4)'
        };
      default: // primary
        return {
          bg: 'from-amber-700 to-amber-900',
          border: 'border-amber-500',
          text: 'text-amber-100',
          hover: 'hover:from-amber-600 hover:to-amber-800',
          disabled: 'from-amber-400 to-amber-500 border-amber-300 text-amber-200',
          glow: 'rgba(217, 119, 6, 0.4)'
        };
    }
  };
  
  // تحديد حجم الزر بناءً على الحجم المختار
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          padding: 'px-3 py-1',
          text: 'text-xs',
          borderRadius: 'rounded-md',
          iconSize: { width: 16, height: 16 }
        };
      case 'large':
        return {
          padding: 'px-6 py-3',
          text: 'text-lg',
          borderRadius: 'rounded-lg',
          iconSize: { width: 28, height: 28 }
        };
      default: // medium
        return {
          padding: 'px-4 py-2',
          text: 'text-base',
          borderRadius: 'rounded-md',
          iconSize: { width: 20, height: 20 }
        };
    }
  };
  
  const colors = getButtonColors();
  const sizeProps = getButtonSize();
  
  // إنشاء الأيقونة إذا كانت موجودة
  const renderIcon = () => {
    if (!icon) return null;
    
    const IconComponent = GameIconSet[icon];
    if (!IconComponent) return null;
    
    return (
      <span className={`inline-flex items-center ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}>
        <IconComponent
          width={sizeProps.iconSize.width}
          height={sizeProps.iconSize.height}
          color="currentColor"
        />
      </span>
    );
  };
  
  // تحديد كلاسات CSS النهائية
  const buttonClasses = [
    'egyptian-button',
    'relative',
    'overflow-hidden',
    'inline-flex',
    'items-center',
    'justify-center',
    'border-2',
    sizeProps.padding,
    sizeProps.text,
    sizeProps.borderRadius,
    'font-medium',
    'transition-all',
    'duration-300',
    'bg-gradient-to-b',
    fullWidth ? 'w-full' : '',
    !disabled ? [
      colors.bg,
      colors.border,
      colors.text,
      colors.hover,
      hoverScale ? 'hover:scale-105 active:scale-95' : '',
      'active:shadow-inner'
    ].join(' ') : [
      colors.disabled,
      'cursor-not-allowed'
    ].join(' '),
    glowing ? 'glowing-effect' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={buttonClasses}
      disabled={disabled}
      type="button"
    >
      {/* زخارف الزوايا */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-60" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current opacity-60" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current opacity-60" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-60" />
      
      {/* المحتوى */}
      <span className="flex items-center justify-center">
        {iconPosition === 'left' && renderIcon()}
        <span>{children}</span>
        {iconPosition === 'right' && renderIcon()}
      </span>
      
      {/* تأثير الضوء */}
      <span className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-10" />
      
      {/* تأثير التوهج */}
      {glowing && (
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px ${colors.glow}; }
            50% { box-shadow: 0 0 15px ${colors.glow}; }
          }
          
          .glowing-effect {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>
      )}
    </button>
  );
};

export default EgyptianButton;