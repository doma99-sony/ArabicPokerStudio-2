import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayerAction } from '../logic/poker-engine';
import { usePokerStore } from '../store/poker-store';
import TurnTimer from './TurnTimer';

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
  // استخدام متجر البوكر لمعالجة انتهاء وقت اللاعب
  const { performAction } = usePokerStore();
  
  // حالة عرض البطاقات المرفوعة
  const [isCardRaised, setIsCardRaised] = useState<number | null>(null);
  
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
  
  // معالجة انتهاء وقت اللاعب الحالي - يتم استخدامها في مؤقت الدور
  const handleTimeout = useCallback(() => {
    if (isCurrentTurn && isActive && !isFolded && !isAllIn) {
      console.log(`انتهى وقت اللاعب ${username} (ID: ${id})، تنفيذ انسحاب تلقائي`);
      performAction(PlayerAction.FOLD);
    }
  }, [isCurrentTurn, isActive, isFolded, isAllIn, username, id, performAction]);
  
  // دالة معالجة مرور المؤشر على البطاقات
  const handleCardHover = (index: number | null) => {
    setIsCardRaised(index);
  };
  
  // تصنيف الحركة للبطاقات حسب موقع اللاعب
  const getCardTransform = (index: number) => {
    if (isCardRaised === index) {
      if (position === 0) {
        return 'translateY(-10px)';
      } else if (position === 4) {
        return 'translateY(10px)';
      } else if (position < 4) {
        return 'translateX(10px)';
      } else {
        return 'translateX(-10px)';
      }
    }
    return 'none';
  };
  
  return (
    <div 
      className={`player-container absolute ${playerStatusColor} rounded-lg p-2 shadow-lg transition-all duration-300 z-10 ${isCurrentTurn ? 'current-turn' : ''}`}
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
        <div className="relative">
          <Avatar className={`border-2 ${isCurrentTurn ? 'border-yellow-400 animate-pulse' : 'border-[#D4AF37]'}`}>
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="bg-[#D4AF37] text-black font-bold">
              {username.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          {/* مؤشر الدور (ديلر، الرهان الصغير، الرهان الكبير) */}
          {isActive && !isFolded && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold">
              {position === 0 ? 'D' : position === 1 ? 'S' : position === 2 ? 'B' : ''}
            </div>
          )}
        </div>
        
        {/* معلومات اللاعب */}
        <div>
          <div className="text-white font-bold text-sm">
            {username} 
            {isAllIn && <span className="text-purple-400 mr-1">(كل الرقائق)</span>}
            {isFolded && <span className="text-gray-400 mr-1">(طوى)</span>}
          </div>
          <div className="text-[#D4AF37] text-xs">
            ${chips.toLocaleString()}
          </div>
          
          {/* الرهان الحالي، إذا كان موجودًا */}
          {currentBet > 0 && (
            <div className="bg-black/60 text-white text-xs px-2 py-1 rounded mt-1">
              رهان: ${currentBet.toLocaleString()}
            </div>
          )}
          
          {/* مؤقت الدور - يظهر فقط للاعب الحالي */}
          <TurnTimer
            duration={10}
            isActive={isCurrentTurn && isActive && !isFolded && !isAllIn}
            onTimeout={handleTimeout}
          />
        </div>
      </div>
      
      {/* بطاقات اللاعب */}
      <div className={`flex ${cardsDirection} gap-1 mt-2 justify-center`}>
        {cards.map((card, index) => (
          <div 
            key={index}
            className={`${cardSize} flex items-center justify-center rounded relative 
              ${card.hidden && !showCards ? 'bg-blue-800 border border-white/20' : 'bg-white border border-gray-300'} 
              transition-all duration-200 ease-out card
              ${(position === 0 || showCards) ? 'hover:shadow-lg' : ''}`}
            style={{
              transform: getCardTransform(index),
              zIndex: isCardRaised === index ? 20 : 10
            }}
            onMouseEnter={() => (position === 0 || showCards) && handleCardHover(index)}
            onMouseLeave={() => handleCardHover(null)}
          >
            {(!card.hidden || showCards) ? (
              <div className={`card-content text-${card.suit === '♥' || card.suit === '♦' ? 'red-600' : 'black'} font-bold`}>
                <div className="text-center">
                  <div className={position === 0 ? 'text-lg' : 'text-base'}>{card.rank}</div>
                  <div className={position === 0 ? 'text-2xl' : 'text-xl'}>{card.suit}</div>
                </div>
              </div>
            ) : (
              <div className="card-back flex flex-col items-center justify-center text-xs text-white/70">
                <div className="rotate-90">بوكر</div>
                <div className="rotate-90 text-[#D4AF37]">مصر</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}