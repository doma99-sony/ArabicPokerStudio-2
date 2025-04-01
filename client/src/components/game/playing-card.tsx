import React from 'react';
import { cn } from '@/lib/utils';

// تعريف الأنواع محلياً
type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

// تعريف نوع البطاقة محلياً
interface Card {
  suit: Suit;
  value: Value;
}

// أنواع مختلفة لمكون الورقة
type PlayingCardSize = 'sm' | 'md' | 'lg' | 'xl';
type PlayingCardVariant = 'default' | 'gold' | 'platinum' | 'hidden';

interface PlayingCardProps {
  card?: Card; // بيانات الورقة (الأساسية والشكل)
  suit?: Suit; // نوع الورقة (قلوب، كارو، إلخ)
  value?: Value; // قيمة الورقة
  size?: PlayingCardSize; // حجم الورقة
  variant?: PlayingCardVariant; // نوع الورقة
  isHidden?: boolean; // هل الورقة مخفية؟
  hidden?: boolean; // بديل لـ isHidden للتوافق مع الواجهة البرمجية
  isActive?: boolean; // هل الورقة نشطة؟
  rotationAngle?: number; // زاوية الدوران
  className?: string; // فئات CSS إضافية
  onClick?: () => void; // حدث النقر
  isWinning?: boolean; // هل هذه الورقة من الأوراق الرابحة؟
}

export function PlayingCard({
  card,
  suit,
  value,
  size = 'md',
  variant = 'default',
  isHidden = false,
  hidden,
  isActive = false,
  rotationAngle = 0,
  className,
  onClick,
  isWinning = false
}: PlayingCardProps) {
  // التعامل مع حالة hidden لتوافق مع الواجهة المستخدمة في المكونات الأخرى
  const effectiveIsHidden = isHidden || hidden;
  
  // استخدم الخصائص المستقلة إذا تم تمريرها، وإلا استخدم الخصائص من كائن card
  const effectiveSuit = suit || (card ? card.suit : undefined);
  const effectiveValue = value || (card ? card.value : undefined);
  
  // تحديد لون الورقة
  const cardColor = effectiveSuit ? 
    (effectiveSuit === 'hearts' || effectiveSuit === 'diamonds' ? 'text-red-600' : 'text-black') 
    : 'text-black';
  
  // الرموز المقابلة لكل شكل
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  
  // الاختصارات للقيم
  const valueLabels: Record<string, string> = {
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    'J': 'J',
    'Q': 'Q',
    'K': 'K',
    'A': 'A'
  };
  
  // تعريف الأحجام
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-22 text-sm',
    lg: 'w-20 h-28 text-base',
    xl: 'w-24 h-32 text-lg'
  };
  
  // تعريف الشكل حسب النوع
  const variantClasses = {
    default: 'bg-white border-gray-300',
    gold: 'bg-gradient-to-br from-[#FDE68A] via-[#D4AF37] to-[#FFC832] border-[#D4AF37]',
    platinum: 'bg-gradient-to-br from-[#E0E0E0] via-[#C0C0C0] to-[#A0A0A0] border-gray-400',
    hidden: 'bg-gradient-to-br from-[#1A202C] via-[#2D3748] to-[#4A5568] border-gray-700'
  };
  
  // إذا كانت الورقة مخفية، نستخدم نوع مخفي
  const actualVariant = effectiveIsHidden ? 'hidden' : variant;
  
  // حساب نمط الدوران
  const rotationStyle = {
    transform: `rotate(${rotationAngle}deg)`
  };
  
  return (
    <div
      className={cn(
        'relative rounded-lg border-2 shadow-md transition-all duration-200 flex items-center justify-center select-none',
        sizeClasses[size],
        variantClasses[actualVariant],
        isActive && 'ring-2 ring-blue-500 ring-opacity-70',
        isWinning && 'ring-2 ring-yellow-400 ring-opacity-90 animate-pulse',
        className
      )}
      style={rotationStyle}
      onClick={onClick}
    >
      {effectiveIsHidden ? (
        // الورقة المخفية
        <div className="w-full h-full flex items-center justify-center">
          <div className="absolute inset-2 rounded border border-gray-600 bg-gray-800 opacity-40 flex items-center justify-center">
            <div className="w-full h-full rounded border border-gray-700 m-1 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-[#D4AF37] font-bold text-xl opacity-50">♠♥</div>
            </div>
          </div>
        </div>
      ) : effectiveSuit && effectiveValue ? (
        // عرض الورقة المكشوفة
        <div className={cn("w-full h-full flex flex-col p-1", cardColor)}>
          {/* القيمة والشكل في الأعلى */}
          <div className="flex items-center justify-between pl-1 pr-1">
            <div className="font-bold">{valueLabels[effectiveValue] || effectiveValue}</div>
            <div className="text-lg">{suitSymbols[effectiveSuit]}</div>
          </div>
          
          {/* الشكل الرئيسي في الوسط */}
          <div className="flex-grow flex items-center justify-center text-4xl">
            {suitSymbols[effectiveSuit]}
          </div>
          
          {/* القيمة والشكل في الأسفل - مقلوبة */}
          <div className="flex items-center justify-between pl-1 pr-1 transform rotate-180">
            <div className="font-bold">{valueLabels[effectiveValue] || effectiveValue}</div>
            <div className="text-lg">{suitSymbols[effectiveSuit]}</div>
          </div>
        </div>
      ) : (
        // الورقة الفارغة إذا لم يتم تمرير بيانات ورقة
        <div className="w-full h-full rounded flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">?</span>
        </div>
      )}
      
      {/* تأثير الفوز */}
      {isWinning && (
        <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse" />
      )}
    </div>
  );
}

// مكون لعرض مجموعة من الأوراق
interface CardHandProps {
  cards: Card[];
  size?: PlayingCardSize;
  variant?: PlayingCardVariant;
  hidden?: boolean;
  className?: string;
  overlap?: 'slight' | 'medium' | 'large';
  winningCards?: Card[];
}

export function CardHand({
  cards,
  size = 'md',
  variant = 'default',
  hidden = false,
  className,
  overlap = 'medium',
  winningCards = []
}: CardHandProps) {
  // حساب التداخل بين الأوراق
  const getOverlapClass = () => {
    switch (overlap) {
      case 'slight': return '-ml-2';
      case 'large': return '-ml-8';
      case 'medium':
      default: return '-ml-4';
    }
  };
  
  // التحقق ما إذا كانت الورقة من ضمن الأوراق الرابحة
  const isCardWinning = (card: Card) => {
    return winningCards.some(winCard => 
      winCard.suit === card.suit && winCard.value === card.value
    );
  };
  
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {cards.map((card, index) => (
        <div 
          key={`${card.suit}-${card.value}-${index}`} 
          className={index > 0 ? getOverlapClass() : ''}
        >
          <PlayingCard
            card={card}
            size={size}
            variant={variant}
            isHidden={hidden}
            isWinning={isCardWinning(card)}
            rotationAngle={0}
          />
        </div>
      ))}
    </div>
  );
}

// مكون عرض الأوراق المجتمعية على الطاولة
export function CommunityCards({
  cards,
  size = 'md',
  className
}: {
  cards: Card[];
  size?: PlayingCardSize;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center space-x-1', className)}>
      {cards.map((card, index) => (
        <PlayingCard
          key={`community-${card.suit}-${card.value}-${index}`}
          card={card}
          size={size}
          variant="default"
        />
      ))}
      
      {/* إظهار أماكن فارغة للأوراق غير المكشوفة بعد */}
      {Array.from({ length: Math.max(0, 5 - cards.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className={cn(
            'rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-transparent',
            {
              'w-12 h-16': size === 'sm',
              'w-16 h-22': size === 'md',
              'w-20 h-28': size === 'lg',
              'w-24 h-32': size === 'xl'
            }
          )}
        >
          <span className="text-gray-400 opacity-40">?</span>
        </div>
      ))}
    </div>
  );
}

// مكون لعرض الأوراق للاعب
export function PlayerCards({
  cards,
  isHidden = false,
  size = 'md',
  variant = 'default',
  className,
  position,
  rotations = [0, 0]
}: {
  cards: Card[];
  isHidden?: boolean;
  size?: PlayingCardSize;
  variant?: PlayingCardVariant;
  className?: string;
  position?: string;
  rotations?: number[];
}) {
  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center space-x-1">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <PlayingCard
              key={`player-${index}`}
              card={card}
              size={size}
              variant={variant}
              isHidden={isHidden}
              rotationAngle={rotations && rotations.length > index ? rotations[index] : (index === 0 ? -5 : 5)}
            />
          ))
        ) : (
          // عندما لا تكون هناك أوراق
          <>
            <div className={cn(
              'rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-transparent',
              {
                'w-12 h-16': size === 'sm',
                'w-16 h-22': size === 'md',
                'w-20 h-28': size === 'lg',
                'w-24 h-32': size === 'xl'
              }
            )}>
              <span className="text-gray-400 opacity-40">?</span>
            </div>
            <div className={cn(
              'rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-transparent',
              {
                'w-12 h-16': size === 'sm',
                'w-16 h-22': size === 'md',
                'w-20 h-28': size === 'lg',
                'w-24 h-32': size === 'xl'
              }
            )}>
              <span className="text-gray-400 opacity-40">?</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}