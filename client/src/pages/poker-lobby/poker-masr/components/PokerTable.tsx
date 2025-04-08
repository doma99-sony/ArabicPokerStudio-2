import React from 'react';
import { usePokerStore } from '../store/poker-store';
import { GamePhase, Card as GameCard } from '../logic/poker-engine';

// تعريف نوع بطاقة اللاعب (مختلف عن بطاقة اللعبة)
interface PlayerCard {
  suit: string;
  rank: string;
  hidden: boolean;
}

// تعريف adapter function لتحويل بطاقات اللعبة إلى بطاقات اللاعب
const adaptPlayerCards = (cards: GameCard[]): PlayerCard[] => {
  return cards.map(card => ({
    suit: card.suit,
    rank: card.rank,
    hidden: card.hidden === undefined ? true : card.hidden
  }));
};

/**
 * مكون طاولة البوكر - يستخدم لعرض طاولة البوكر التفاعلية
 */
export default function PokerTable() {
  // استخدام متجر البوكر
  const { gameState, getCommunityCards } = usePokerStore();
  
  // الحصول على بطاقات المجتمع
  const communityCards = getCommunityCards();
  const phase = gameState?.currentRound.gamePhase || GamePhase.PREFLOP;
  
  // حساب عدد البطاقات المكشوفة بناءً على المرحلة
  let visibleCardCount = 0;
  if (phase === GamePhase.FLOP) visibleCardCount = 3;
  else if (phase === GamePhase.TURN) visibleCardCount = 4;
  else if (phase === GamePhase.RIVER || phase === GamePhase.SHOWDOWN) visibleCardCount = 5;
  
  // تحديد حالة البوت
  const pot = gameState?.currentRound.pot || 0;
  
  return (
    <div className="poker-table relative w-[800px] h-[400px] max-w-full mx-auto rounded-[50%] bg-gradient-to-b from-[#076324] to-[#0A3A2A] border-8 border-[#4A2511] shadow-2xl flex items-center justify-center">
      {/* حافة الطاولة */}
      <div className="table-rim absolute inset-0 rounded-[50%] border-8 border-[#B8860B] pointer-events-none"></div>
      
      {/* المنطقة الوسطى في الطاولة */}
      <div className="table-center absolute w-[85%] h-[85%] rounded-[50%] bg-[#076324] flex flex-col items-center justify-center">
        <div className="pot-area mb-2 text-center">
          <div className="pot-label text-white/70 text-sm">المراهنة الحالية</div>
          <div className="pot-amount text-white font-bold text-2xl">${pot.toLocaleString()}</div>
        </div>
        
        {/* بطاقات المجتمع (مخفية أو مكشوفة حسب المرحلة) */}
        <div className="community-cards flex gap-2 mt-2">
          {[0, 1, 2, 3, 4].map((index) => {
            const isCardVisible = index < visibleCardCount;
            const card = isCardVisible && communityCards.length > index ? communityCards[index] : null;
            
            return (
              <div 
                key={index}
                className={`card w-16 h-24 rounded-lg border transition-all duration-300 
                  ${isCardVisible && card 
                    ? 'bg-white border-gray-300 scale-105' 
                    : 'bg-slate-700/50 border-white/20'}`}
              >
                {isCardVisible && card && (
                  <div className={`h-full w-full flex items-center justify-center text-${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}-600 font-bold`}>
                    <div className="text-center">
                      <div className="text-xl">{card.rank}</div>
                      <div className="text-2xl mt-1">{card.suit}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* أماكن اللاعبين موزعة حول الطاولة */}
      <div className="player-positions absolute inset-0 pointer-events-none">
        {/* سيتم استبدال هذا بمكونات اللاعبين الديناميكية */}
      </div>
    </div>
  );
}