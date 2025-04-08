import React from 'react';

export interface CardProps {
  suit: string;
  rank: string;
  hidden?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * مكون كارت بوكر - يمثل كارت واحد من كروت اللعب
 */
export function PokerCard({ suit, rank, hidden = false, size = 'medium' }: CardProps) {
  // تحديد حجم الكارت
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-14';
      case 'large':
        return 'w-20 h-28';
      case 'medium':
      default:
        return 'w-16 h-22';
    }
  };
  
  // تحديد لون الكارت (أحمر للقلوب والماس، أسود للبستوني والسباتي)
  const getColor = () => {
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-gray-900';
  };
  
  return (
    <div 
      className={`poker-card ${getSizeClass()} rounded-lg shadow-lg overflow-hidden select-none transition-transform duration-300 transform hover:scale-105`}
    >
      {hidden ? (
        // وجه الكارت المقلوب (الخلفية)
        <div className="card-back h-full w-full bg-blue-800 border-2 border-white rounded-lg flex items-center justify-center overflow-hidden">
          <div className="card-pattern w-[90%] h-[90%] border-2 border-blue-600 rounded-md flex items-center justify-center">
            <div className="card-logo text-white font-bold text-xl">بوكر مصر</div>
          </div>
        </div>
      ) : (
        // وجه الكارت المفتوح
        <div className="card-face bg-white h-full w-full rounded-lg border border-gray-300 p-1 flex flex-col">
          {/* الركن العلوي للكارت */}
          <div className={`card-corner-top text-sm font-bold ${getColor()} text-left`}>
            <div>{rank}</div>
            <div>{suit}</div>
          </div>
          
          {/* وسط الكارت */}
          <div className={`card-center flex-grow flex items-center justify-center text-4xl ${getColor()}`}>
            {suit}
          </div>
          
          {/* الركن السفلي للكارت */}
          <div className={`card-corner-bottom text-sm font-bold ${getColor()} text-right transform rotate-180`}>
            <div>{rank}</div>
            <div>{suit}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * مكون مجموعة كروت البوكر - يعرض مجموعة من كروت البوكر (مثل كروت اللاعب، أو الكروت المشتركة على الطاولة)
 */
export function PokerCardSet({ 
  cards,
  size = 'medium',
  showAll = true
}: { 
  cards: CardProps[],
  size?: 'small' | 'medium' | 'large',
  showAll?: boolean
}) {
  return (
    <div className="poker-card-set flex gap-2">
      {cards.map((card, index) => (
        <div key={`${card.suit}-${card.rank}-${index}`} className="card-wrapper">
          <PokerCard 
            suit={card.suit} 
            rank={card.rank} 
            hidden={!showAll && card.hidden} 
            size={size} 
          />
        </div>
      ))}
    </div>
  );
}