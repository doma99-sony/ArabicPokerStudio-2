import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface PlayerProps {
  id: number;
  username: string;
  chips: number;
  isActive: boolean;
  isCurrentTurn: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  position: number; // 0-8 لتحديد موقع اللاعب حول الطاولة
  cards: { suit: string; rank: string; hidden: boolean }[];
  showCards: boolean;
  avatar?: string;
}

/**
 * مكون اللاعب - يعرض معلومات اللاعب وبطاقاته
 */
export default function PokerPlayer({
  id,
  username,
  chips,
  isActive,
  isCurrentTurn,
  isFolded,
  isAllIn,
  currentBet,
  position,
  cards,
  showCards,
  avatar
}: PlayerProps) {
  // مصفوفة المواقع للاعبين حول الطاولة (تحدد الإحداثيات x,y)
  const positionCoordinates = [
    { top: 'auto', bottom: '5%', left: '45%', right: 'auto' }, // 0: اللاعب الرئيسي (في الأسفل)
    { top: 'auto', bottom: '15%', left: '15%', right: 'auto' }, // 1: يسار اللاعب الرئيسي
    { top: '25%', bottom: 'auto', left: '5%', right: 'auto' }, // 2: يسار الطاولة
    { top: '5%', bottom: 'auto', left: '20%', right: 'auto' }, // 3: أعلى يسار الطاولة
    { top: '5%', bottom: 'auto', left: '45%', right: 'auto' }, // 4: أعلى الطاولة
    { top: '5%', bottom: 'auto', left: 'auto', right: '20%' }, // 5: أعلى يمين الطاولة
    { top: '25%', bottom: 'auto', left: 'auto', right: '5%' }, // 6: يمين الطاولة
    { top: 'auto', bottom: '15%', left: 'auto', right: '15%' }, // 7: يمين اللاعب الرئيسي
    { top: '50%', bottom: 'auto', left: '50%', right: 'auto' } // 8: وسط الطاولة (للاعب مستقبلي)
  ];
  
  // التحقق من صحة الموقع
  const validPosition = position >= 0 && position < positionCoordinates.length 
    ? position 
    : 0;
  
  // الحصول على إحداثيات الموقع
  const coordinates = positionCoordinates[validPosition];
  
  // تحديد الألوان بناءً على حالة اللاعب
  const playerStatusColor = isFolded
    ? 'bg-gray-700/70' // طوى
    : isCurrentTurn
      ? 'bg-green-700/80' // دوره الحالي
      : isAllIn
        ? 'bg-purple-700/80' // كل الرقائق
        : isActive
          ? 'bg-black/70' // نشط
          : 'bg-gray-800/50'; // غير نشط
  
  // تحديد تنسيق البطاقات
  const cardsDirection = position === 0 || position === 4 || position === 8
    ? 'flex-row' // أفقي
    : 'flex-col'; // عمودي
    
  // تحديد حجم البطاقات بناءً على الموقع
  const cardSize = position === 0 
    ? 'w-14 h-20' // اللاعب الرئيسي (أكبر)
    : 'w-10 h-14'; // اللاعبين الآخرين
  
  return (
    <div 
      className={`player-container absolute ${playerStatusColor} rounded-lg p-2 shadow-lg transition-all duration-300 z-10`}
      style={{
        top: coordinates.top,
        bottom: coordinates.bottom,
        left: coordinates.left,
        right: coordinates.right,
        opacity: isActive ? 1 : 0.6,
        transform: isCurrentTurn ? 'scale(1.05)' : 'scale(1)',
        borderLeft: isCurrentTurn ? '4px solid yellow' : 'none'
      }}
    >
      <div className="flex items-center gap-2">
        {/* صورة اللاعب */}
        <Avatar className="border-2 border-[#D4AF37]">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback className="bg-[#D4AF37] text-black font-bold">
            {username.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        {/* معلومات اللاعب */}
        <div>
          <div className="text-white font-bold text-sm">
            {username} {isAllIn && <span className="text-purple-400">(كل الرقائق)</span>}
            {isFolded && <span className="text-gray-400">(طوى)</span>}
          </div>
          <div className="text-[#D4AF37] text-xs">
            ${chips.toLocaleString()}
          </div>
          
          {/* الرهان الحالي، إذا كان موجودًا */}
          {currentBet > 0 && (
            <div className="bg-black/60 text-white text-xs px-2 py-1 rounded mt-1">
              رهان: ${currentBet}
            </div>
          )}
        </div>
      </div>
      
      {/* بطاقات اللاعب */}
      <div className={`flex ${cardsDirection} gap-1 mt-2 justify-center`}>
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`${cardSize} flex items-center justify-center rounded ${card.hidden && !showCards ? 'bg-blue-800 border border-white/20' : 'bg-white'}`}
          >
            {(!card.hidden || showCards) ? (
              <div className={`card-content text-${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'} font-bold`}>
                <div className="text-center">
                  <div>{card.rank}</div>
                  <div>{card.suit}</div>
                </div>
              </div>
            ) : (
              <div className="card-back text-xs text-white/50 rotate-90">
                بوكر مصر
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}