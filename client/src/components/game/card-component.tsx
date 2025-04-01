import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// تعريف أنواع البطاقات
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  suit: Suit;
  value: Value;
  hidden?: boolean;
}

type CardSize = 'sm' | 'md' | 'lg' | 'xl';
type CardVariant = 'default' | 'gold' | 'platinum';

interface CardComponentProps {
  card: Card;
  size?: CardSize;
  variant?: CardVariant;
  isWinning?: boolean;
  className?: string;
  onClick?: () => void;
}

// الألوان حسب نوع البطاقة
const suitColors: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-black',
  spades: 'text-black'
};

// رموز أنواع البطاقات
const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// حجم البطاقة حسب النوع
const cardSizes: Record<CardSize, { width: string, height: string, textSize: string }> = {
  sm: { width: 'w-10', height: 'h-14', textSize: 'text-xs' },
  md: { width: 'w-16', height: 'h-22', textSize: 'text-sm' },
  lg: { width: 'w-20', height: 'h-28', textSize: 'text-lg' },
  xl: { width: 'w-24', height: 'h-32', textSize: 'text-xl' }
};

// ألوان الحواف حسب نوع البطاقة
const cardVariants: Record<CardVariant, { border: string, glow: string, bg: string }> = {
  default: { 
    border: 'border-slate-300', 
    glow: 'shadow-md', 
    bg: 'bg-white' 
  },
  gold: { 
    border: 'border-amber-400', 
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]', 
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100' 
  },
  platinum: { 
    border: 'border-slate-400', 
    glow: 'shadow-[0_0_15px_rgba(226,232,240,0.5)]', 
    bg: 'bg-gradient-to-br from-slate-50 to-slate-200' 
  }
};

export function CardComponent({
  card,
  size = 'md',
  variant = 'default',
  isWinning = false,
  className,
  onClick
}: CardComponentProps) {
  const [showCard, setShowCard] = useState(!card.hidden);
  
  // عند تغيير حالة إخفاء البطاقة
  useEffect(() => {
    setShowCard(!card.hidden);
  }, [card.hidden]);

  const { width, height, textSize } = cardSizes[size];
  const { border, glow, bg } = cardVariants[variant];
  
  // تأثير التوهج للبطاقات الرابحة
  const winningGlow = isWinning ? 'animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.7)]' : '';
  
  return (
    <div 
      className={cn(
        width, 
        height, 
        border, 
        glow, 
        bg,
        'rounded-md relative overflow-hidden transition-all duration-300 cursor-pointer',
        winningGlow,
        className
      )}
      onClick={onClick}
    >
      {showCard ? (
        <>
          {/* الزاوية العلوية */}
          <div className={`absolute top-1 left-1 rtl:right-1 rtl:left-auto flex flex-col items-center ${suitColors[card.suit]}`}>
            <span className={`font-bold ${textSize}`}>{card.value}</span>
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>
              {suitSymbols[card.suit]}
            </span>
          </div>
          
          {/* الرمز الرئيسي في منتصف البطاقة */}
          <div className={`absolute inset-0 flex items-center justify-center ${suitColors[card.suit]}`}>
            <span className={`${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-6xl'}`}>
              {suitSymbols[card.suit]}
            </span>
          </div>
          
          {/* الزاوية السفلية (مقلوبة) */}
          <div className={`absolute bottom-1 right-1 rtl:left-1 rtl:right-auto flex flex-col items-center transform rotate-180 ${suitColors[card.suit]}`}>
            <span className={`font-bold ${textSize}`}>{card.value}</span>
            <span className={`${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'}`}>
              {suitSymbols[card.suit]}
            </span>
          </div>
        </>
      ) : (
        // ظهر البطاقة عندما تكون مخفية
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-opacity-30 bg-blue-900 pattern-dots pattern-size-2 pattern-white"></div>
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-2/3 h-2/3 border-2 border-blue-400 rounded-full flex items-center justify-center">
              <span className="font-bold text-white text-xs">الملك</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}