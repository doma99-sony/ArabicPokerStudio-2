import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../store/poker-store';
import { GamePhase, Card as GameCard, PlayerAction } from '../logic/poker-engine';
import PokerPlayer from './PokerPlayer';
import { CircleDollarSign } from 'lucide-react';

// نوع محسّن لحالة اللعبة يتضمن آخر إجراء
interface ExtendedGameState {
  lastAction?: {
    playerId: number;
    action: string;
    amount?: number;
  };
}

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
  const { 
    gameState, 
    getCommunityCards,
    getLocalPlayer,
    performAction 
  } = usePokerStore();
  
  // الحصول على بطاقات المجتمع
  const communityCards = getCommunityCards();
  const phase = gameState?.currentRound.gamePhase || GamePhase.PREFLOP;
  const localPlayer = getLocalPlayer();
  
  // حالة حركة البطاقات
  const [cardAnimationActive, setCardAnimationActive] = useState(false);
  const [lastAction, setLastAction] = useState<{ playerId: number; action: string; amount?: number } | null>(null);
  
  // تأثيرات عند تغيير المرحلة أو اللاعب الحالي
  useEffect(() => {
    if (phase === GamePhase.FLOP || phase === GamePhase.TURN || phase === GamePhase.RIVER) {
      setCardAnimationActive(true);
      const timer = setTimeout(() => {
        setCardAnimationActive(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [phase]);
  
  // تتبع اللاعب الحالي وإجراءاته - محاكاة للإجراءات
  useEffect(() => {
    const currentPlayer = gameState?.players.find(p => p.isCurrentTurn);
    
    if (currentPlayer && currentPlayer.id !== lastAction?.playerId) {
      // في الواقع، سوف نستقبل هذه المعلومات من الخادم وليس هنا
      // هذا فقط لأغراض العرض
      
      // مثال على إجراء عشوائي
      const demoActions = [
        // مثال على إجراء انسحاب
        { playerId: currentPlayer.id, action: PlayerAction.FOLD },
        // مثال على إجراء تمرير
        { playerId: currentPlayer.id, action: PlayerAction.CHECK },
        // مثال على إجراء مجاراة
        { playerId: currentPlayer.id, action: PlayerAction.CALL, amount: gameState?.currentRound.currentBet || 10 },
        // مثال على إجراء زيادة
        { playerId: currentPlayer.id, action: PlayerAction.RAISE, amount: (gameState?.currentRound.currentBet || 10) * 2 },
        // مثال على إجراء كل الرقائق
        { playerId: currentPlayer.id, action: PlayerAction.ALL_IN, amount: currentPlayer.chips }
      ];
      
      // لن نستخدم هذا في الإنتاج، هذا فقط للعرض
      if (Math.random() < 0.2) { // نسبة 20% لعرض إجراء
        const randomActionIndex = Math.floor(Math.random() * demoActions.length);
        const randomAction = demoActions[randomActionIndex];
        
        // تحديث حالة آخر إجراء
        setLastAction(randomAction);
        
        // إزالة الإجراء بعد فترة
        const timer = setTimeout(() => {
          setLastAction(null);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameState?.players, lastAction]);
  
  // حساب عدد البطاقات المكشوفة بناءً على المرحلة
  let visibleCardCount = 0;
  if (phase === GamePhase.FLOP) visibleCardCount = 3;
  else if (phase === GamePhase.TURN) visibleCardCount = 4;
  else if (phase === GamePhase.RIVER || phase === GamePhase.SHOWDOWN) visibleCardCount = 5;
  
  // تحديد حالة البوت
  const pot = gameState?.currentRound.pot || 0;
  
  // مصفوفة لتوزيع اللاعبين حول الطاولة
  const positionToIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // خريطة الموقع الافتراضية
  
  // وظيفة لعرض تأثير الحركة للاعب معين
  const getPlayerActionAnimation = (playerId: number) => {
    if (lastAction && lastAction.playerId === playerId) {
      switch (lastAction.action) {
        case PlayerAction.FOLD:
          return 'fold-animation';
        case PlayerAction.CHECK:
          return 'check-animation';
        case PlayerAction.CALL:
          return 'call-animation';
        case PlayerAction.RAISE:
          return 'raise-animation';
        case PlayerAction.ALL_IN:
          return 'all-in-animation';
        default:
          return '';
      }
    }
    return '';
  };
  
  return (
    <div className="poker-table relative w-[800px] h-[400px] max-w-full mx-auto rounded-[50%] bg-gradient-to-b from-[#076324] to-[#0A3A2A] border-8 border-[#4A2511] shadow-2xl flex items-center justify-center">
      {/* حافة الطاولة */}
      <div className="table-rim absolute inset-0 rounded-[50%] border-8 border-[#B8860B] pointer-events-none"></div>
      
      {/* ملصقات مراكز اللاعبين (إشارات مرئية للمطورين) */}
      {Array.from({ length: 9 }).map((_, index) => (
        <div 
          key={`position-marker-${index}`} 
          className="absolute text-xs text-white/30 pointer-events-none"
          style={{
            top: index === 4 ? '5%' : index === 3 ? '5%' : index === 5 ? '5%' : index === 2 || index === 6 ? '25%' : 'auto',
            bottom: index === 0 ? '5%' : index === 1 || index === 7 ? '15%' : 'auto',
            left: index === 0 ? '45%' : index === 1 ? '15%' : index === 2 ? '5%' : index === 3 ? '20%' : index === 4 ? '45%' : index === 8 ? '50%' : 'auto',
            right: index === 5 ? '20%' : index === 6 ? '5%' : index === 7 ? '15%' : index === 8 ? 'auto' : 'auto',
          }}
        >
          {index}
        </div>
      ))}
      
      {/* المنطقة الوسطى في الطاولة */}
      <div className="table-center absolute w-[85%] h-[85%] rounded-[50%] bg-[#076324] flex flex-col items-center justify-center">
        {/* معلومات وحالة اللعبة */}
        <div className="game-info absolute top-2 left-0 right-0 text-center text-white/70 text-xs">
          {phase === GamePhase.PREFLOP ? 'الجولة الأولى' :
            phase === GamePhase.FLOP ? 'الفلوب' :
            phase === GamePhase.TURN ? 'الترن' :
            phase === GamePhase.RIVER ? 'الريفر' :
            phase === GamePhase.SHOWDOWN ? 'كشف الأوراق' : ''}
        </div>
        
        {/* بوت المراهنة */}
        <div className="pot-area mb-6 text-center">
          <div className="pot-label text-white/70 text-sm">المراهنة الحالية</div>
          <div className="pot-amount flex items-center justify-center text-white font-bold text-2xl">
            <CircleDollarSign className="w-6 h-6 text-[#D4AF37] mr-2" />
            <span>${pot.toLocaleString()}</span>
          </div>
        </div>
        
        {/* بطاقات المجتمع (مخفية أو مكشوفة حسب المرحلة) */}
        <div className="community-cards flex gap-2 mt-2">
          {[0, 1, 2, 3, 4].map((index) => {
            const isCardVisible = index < visibleCardCount;
            const card = isCardVisible && communityCards.length > index ? communityCards[index] : null;
            
            return (
              <div 
                key={index}
                className={`card w-16 h-24 rounded-lg border relative transition-all duration-300 
                  ${isCardVisible && card 
                    ? 'bg-white border-gray-300 scale-105' 
                    : 'bg-slate-700/50 border-white/20'}
                  ${cardAnimationActive && isCardVisible && (index === 3 || index === 4) ? 'animate-slide-in' : ''}
                  `}
                style={{
                  transform: cardAnimationActive && isCardVisible ? 
                    `scale(${1 + (0.05 * (5 - index))}) rotate(${(index - 2) * 2}deg)` : 
                    undefined,
                  transformOrigin: 'center center',
                  transitionDelay: cardAnimationActive ? `${index * 100}ms` : '0ms'
                }}
              >
                {isCardVisible && card && (
                  <div className={`h-full w-full flex items-center justify-center text-${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}-600 font-bold card-content`}>
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
      
      {/* عرض اللاعبين حول الطاولة */}
      {gameState && gameState.players.map(player => {
        // تعيين موقع افتراضي استنادًا إلى index اللاعب في المصفوفة
        // هذا يمكن تغييره لاحقًا وفقًا للمنطق الفعلي للعبة
        const positionIndex = player.position !== undefined ? player.position : 
                              player.id === localPlayer?.id ? 0 : // اللاعب المحلي في الوسط أسفل الشاشة
                              player.id % positionToIndex.length; // اللاعبين الآخرين حول الطاولة
        
        return (
          <PokerPlayer
            key={player.id}
            id={player.id}
            username={player.username}
            chips={player.chips}
            isActive={player.isActive}
            isCurrentTurn={player.isCurrentTurn}
            isFolded={player.folded}
            isAllIn={player.isAllIn}
            currentBet={player.betAmount}
            position={positionIndex}
            cards={adaptPlayerCards(player.cards)}
            showCards={player.id === localPlayer?.id || (phase === GamePhase.SHOWDOWN && !player.folded)}
            avatar={player.avatar || undefined}
          />
        );
      })}

      {/* تأثيرات وحركات إضافية */}
      {lastAction && (
        <div className={`action-effect absolute z-30 text-white font-bold px-4 py-2 rounded-full ${
          lastAction.action === PlayerAction.FOLD ? 'bg-red-600' : 
          lastAction.action === PlayerAction.CHECK ? 'bg-blue-600' : 
          lastAction.action === PlayerAction.CALL ? 'bg-green-600' : 
          lastAction.action === PlayerAction.RAISE ? 'bg-amber-600' : 
          lastAction.action === PlayerAction.ALL_IN ? 'bg-purple-600' : 'bg-black'
        } animate-bounce-once`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        >
          {lastAction.action === PlayerAction.FOLD ? 'انسحاب' : 
           lastAction.action === PlayerAction.CHECK ? 'تمرير' : 
           lastAction.action === PlayerAction.CALL ? `مجاراة ${lastAction.amount?.toLocaleString() || ''}` : 
           lastAction.action === PlayerAction.RAISE ? `زيادة إلى ${lastAction.amount?.toLocaleString() || ''}` : 
           lastAction.action === PlayerAction.ALL_IN ? 'كل الرقائق' : 
           'إجراء جديد'}
        </div>
      )}
    </div>
  );
}