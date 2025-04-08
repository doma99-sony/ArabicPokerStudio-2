import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

export interface PlayerProps {
  id: number;
  username: string;
  avatar?: string;
  chips: number;
  isActive: boolean;
  isCurrentTurn: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  position: number; // 0-5 (6 لاعبين)
  cards?: {
    suit: string;
    rank: string;
    hidden: boolean;
  }[];
  showCards: boolean;
}

/**
 * مكون اللاعب - يمثل لاعباً على طاولة البوكر
 */
export default function PokerPlayer({
  id,
  username,
  avatar,
  chips,
  isActive,
  isCurrentTurn,
  isFolded,
  isAllIn,
  currentBet,
  position,
  cards = [],
  showCards
}: PlayerProps) {
  // تحديد موضع اللاعب على الطاولة
  const getPositionStyle = () => {
    // المواضع الستة على الطاولة (البيضاوية الشكل)
    const positions = [
      { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },  // الموضع السفلي (اللاعب نفسه)
      { bottom: '20%', left: '15%', transform: 'translateX(-50%)' },  // الموضع السفلي الأيسر
      { top: '30%', left: '5%', transform: 'translateX(-50%)' },      // الموضع الأيسر
      { top: '10%', left: '50%', transform: 'translateX(-50%)' },     // الموضع العلوي
      { top: '30%', right: '5%', transform: 'translateX(50%)' },      // الموضع الأيمن
      { bottom: '20%', right: '15%', transform: 'translateX(50%)' },  // الموضع السفلي الأيمن
    ];
    
    return positions[position];
  };
  
  // حالة اللاعب (نشط، دوره، طوى الأوراق، أول إن)
  const getPlayerStateIndicator = () => {
    if (isFolded) {
      return <div className="state-indicator bg-red-500 text-white text-xs px-2 py-0.5 rounded absolute -top-1 right-0">طوى</div>;
    }
    if (isAllIn) {
      return <div className="state-indicator bg-purple-500 text-white text-xs px-2 py-0.5 rounded absolute -top-1 right-0">أول إن</div>;
    }
    if (isCurrentTurn) {
      return <div className="state-indicator bg-yellow-500 text-white text-xs px-2 py-0.5 rounded absolute -top-1 right-0">دوره</div>;
    }
    return null;
  };
  
  return (
    <div 
      className={`poker-player absolute w-32 ${
        isActive ? 'opacity-100' : 'opacity-50'
      } ${isCurrentTurn ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
      style={getPositionStyle()}
    >
      <Card className="relative bg-black/80 border border-[#D4AF37]/50 p-2">
        {getPlayerStateIndicator()}
        
        <div className="flex items-center mb-1">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={avatar} />
            <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <div className="text-xs text-white font-semibold truncate">{username}</div>
            <div className="text-xs text-[#D4AF37]">{chips.toLocaleString()} رقاقة</div>
          </div>
        </div>
        
        {/* كروت اللاعب */}
        {cards.length > 0 && (
          <div className="player-cards flex justify-center gap-1 mt-1">
            {cards.map((card, index) => (
              <div 
                key={`card-${index}`} 
                className="w-6 h-8 bg-white rounded-sm border border-gray-400 flex items-center justify-center text-[8px] overflow-hidden"
                style={{ 
                  backgroundColor: card.hidden && !showCards ? '#222' : 'white',
                  color: (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black'
                }}
              >
                {card.hidden && !showCards ? (
                  <div className="card-back bg-blue-800 w-full h-full"></div>
                ) : (
                  <div className="card-face">
                    <div>{card.rank}</div>
                    <div>{card.suit}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* رهان اللاعب الحالي (إن وجد) */}
        {currentBet > 0 && (
          <div className="current-bet absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {currentBet.toLocaleString()}
          </div>
        )}
      </Card>
    </div>
  );
}