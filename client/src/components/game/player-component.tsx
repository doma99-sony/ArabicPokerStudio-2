import { PlayerPosition } from "@/types";
import { Image } from "@/components/ui/image";
import { CardComponent } from "./card-component";
import { PlayerCards } from "./playing-card";
import { formatChips } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface PlayerComponentProps {
  player: PlayerPosition;
  isTurn: boolean;
}

export function PlayerComponent({ player, isTurn }: PlayerComponentProps) {
  // حالات لتتبع تأثيرات المرئية المختلفة
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(12);
  const [isNewPlayer, setIsNewPlayer] = useState<boolean>(false);
  const [isCardAnimating, setIsCardAnimating] = useState<boolean>(false);
  
  // تأثير عند انضمام لاعب جديد لإظهار تأثير الانضمام
  useEffect(() => {
    setIsNewPlayer(true);
    const timer = setTimeout(() => {
      setIsNewPlayer(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [player.id]);
  
  // تأثير عند توزيع البطاقات
  useEffect(() => {
    if (player.cards && player.cards.length > 0) {
      setIsCardAnimating(true);
      const timer = setTimeout(() => {
        setIsCardAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [player.cards?.length]);
  
  // مؤقت للعد التنازلي عندما يكون دور اللاعب
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTurn) {
      // ابدأ العد التنازلي من 12 ثانية
      setTurnTimeLeft(12);
      
      timer = setInterval(() => {
        setTurnTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTurn, player.id]);
  
  // حساب لون الخلفية لمؤقت الانتظار بناءً على الوقت المتبقي
  const getTimerColor = () => {
    if (turnTimeLeft <= 3) return "bg-red-600";
    if (turnTimeLeft <= 6) return "bg-amber-500";
    return "bg-blue-600";
  };
  
  // أصوات تنبيه مختلفة (يمكن تفعيلها في نسخة لاحقة)
  const playTurnSound = () => {
    // يمكن تفعيل الصوت هنا
    console.log("صوت دور اللاعب");
  };
  
  // Position classes based on player position - adjusted for the 9-seat table layout
  const positionClasses: Record<string, string> = {
    bottom: "absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center",
    bottomRight: "absolute bottom-10 right-16 flex-col items-end",
    right: "absolute right-10 top-1/2 transform -translate-y-1/2 flex-col items-end",
    topRight: "absolute top-10 right-16 flex-col items-end",
    top: "absolute top-4 left-1/2 transform -translate-x-1/2 flex-col items-center",
    topLeft: "absolute top-10 left-16 flex-col items-start",
    left: "absolute left-10 top-1/2 transform -translate-y-1/2 flex-col items-start",
    bottomLeft: "absolute bottom-10 left-16 flex-col items-start",
    dealer: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex-col items-center"
  };

  // Calculate rotation for cards based on position
  const cardRotations: Record<string, number[]> = {
    bottom: [10, -10],
    bottomRight: [5, -5],
    right: [5, -5],
    topRight: [5, -5],
    top: [-5, 5],
    topLeft: [-5, 5],
    left: [-5, 5],
    bottomLeft: [-5, 5],
    dealer: [0, 0]
  };

  // Determine card visibility based on if it's the current player or showdown
  // يجب أن نظهر البطاقات دائماً للمستخدم الحالي بغض النظر عن خاصية 'hidden'
  const showCards = player.isCurrentPlayer;

  return (
    <div 
      className={`flex ${positionClasses[player.position]} z-30 transition-all duration-500`}
      style={{
        // تأثير ظهور تدريجي للاعب جديد
        opacity: isNewPlayer ? 0.7 : 1,
        transform: isNewPlayer ? `scale(1.05) ${player.position === 'bottom' ? 'translateY(10px)' : ''}` : 'scale(1)',
        // إضافة حدود متوهجة للاعب الحالي
        boxShadow: player.isCurrentPlayer ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none',
      }}
    >
      {/* Player status indicators - top of player area */}
      <div className="flex flex-col items-center mb-1">
        {/* إشارة إلى اللاعب الجديد */}
        {isNewPlayer && (
          <div className="mb-1.5 bg-green-600 rounded-full px-3 py-1 text-white text-sm font-bold shadow-lg animate-pulse">
            لاعب جديد
          </div>
        )}
        
        {/* Player's turn indicator with countdown timer */}
        {isTurn && (
          <div 
            className={`${getTimerColor()}/80 rounded-full px-3 py-1 text-white mb-1.5 shadow-lg transition-all duration-300 flex items-center gap-1`}
            style={{
              // تأثير نبض عندما يكون الوقت أقل من 5 ثوان
              animation: turnTimeLeft <= 5 ? 'pulse 1s infinite' : 'none',
            }}
          >
            <Clock className={`w-4 h-4 ${turnTimeLeft <= 3 ? 'animate-spin' : ''}`} />
            <span className="text-sm font-bold">
              {player.isCurrentPlayer ? "دورك للعب" : "جاري اللعب..."} ({turnTimeLeft})
            </span>
          </div>
        )}
        
        {/* Folded indicator */}
        {player.folded && (
          <div className="mb-1.5 bg-red-600/80 rounded-full px-3 py-1 text-white text-sm font-bold shadow-lg animate-bounce">
            تخلى
          </div>
        )}
      </div>
      
      {/* Display player's cards if they have them */}
      {player.cards && player.cards.length > 0 && (
        <div className="flex flex-col items-center mb-2">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {player.cards.map((card, index) => (
              <div
                key={`player-card-${index}`}
                className={`card transform transition-all duration-500 ${
                  player.winner ? 'animate-pulse shadow-xl' : ''
                } ${
                  isCardAnimating ? `animate-card-deal-${index}` : ''
                }`}
                style={{ 
                  transform: `rotate(${cardRotations[player.position][index]}deg)`,
                  marginLeft: index === 0 ? '-5px' : '0',
                  marginRight: index === 1 ? '-5px' : '0',
                  position: 'relative',
                  zIndex: 20 + index,
                  // تأثير توزيع البطاقات
                  animationDelay: `${index * 0.15}s`,
                  // تأثير فائز اللعبة
                  boxShadow: player.winner 
                    ? '0 0 15px rgba(255, 215, 0, 0.7)' 
                    : player.isCurrentPlayer 
                      ? '0 0 5px rgba(255, 255, 255, 0.3)' 
                      : 'none',
                }}
              >
                <CardComponent 
                  // إظهار البطاقات للمستخدم الحالي دائمًا وإخفاؤها عن الآخرين
                  card={player.isCurrentPlayer ? {...card, hidden: false} : { ...card, hidden: true }} 
                  size="sm" 
                  // إذا كان هذا اللاعب هو الفائز، استخدم تصميم ذهبي للبطاقات
                  variant={player.winner ? "gold" : "default"}
                  // إذا كانت هذه البطاقة جزء من يد الفائز النهائية
                  isWinning={player.winner && player.handDetails?.bestHand?.some((winCard) => 
                    winCard.suit === card.suit && winCard.value === card.value
                  )}
                />
              </div>
            ))}
          </div>
          
          {/* Winner badge */}
          {player.winner && (
            <div className="mb-1 mt-1">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-300 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                {player.handName || "فائز!"}
              </div>
            </div>
          )}
          
          {/* Player's bet amount if any - shown below cards */}
          {player.betAmount && player.betAmount > 0 && (
            <div className="mt-2 relative">
              {/* Chip visualization - different color based on bet size */}
              <div 
                className={`
                  w-10 h-10 rounded-full border-4 border-white shadow-xl 
                  flex items-center justify-center text-white font-bold text-xs z-20
                  ${player.betAmount > 1000 ? 'bg-purple-600' : 
                    player.betAmount > 500 ? 'bg-red-600' : 
                    player.betAmount > 200 ? 'bg-amber-600' : 'bg-green-600'}
                `}
              >
                {formatChips(player.betAmount || 0)}
              </div>
              
              {/* Show exact bet amount with tooltip */}
              <div 
                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black/60 rounded-full px-2 py-0.5 text-white text-xs min-w-[40px] text-center"
                title={`${player.betAmount} رقاقة`}
              >
                {(player.betAmount || 0).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Player avatar and info - styled like the reference images */}
      <div className="flex items-center">
        {/* Avatar with VIP indicator if applicable */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${player.isCurrentPlayer ? "border-white shadow-[0_0_15px_rgba(255,215,0,0.7)]" : "border-white/70"}`}>
            <Image 
              src={player.avatar} 
              alt={player.username} 
              className="w-full h-full object-cover"
              fallback="https://via.placeholder.com/150?text=User"
            />
          </div>
          
          {/* VIP badge if player is VIP */}
          {player.isVIP && (
            <div className="absolute -top-1 -right-1 bg-gold rounded-full w-5 h-5 flex items-center justify-center text-deepBlack text-xs font-bold">
              VIP
            </div>
          )}
        </div>
        
        {/* Player info - stacked vertically beside avatar */}
        <div className={`${player.position.includes('Left') ? 'ml-2' : 'mr-2'} flex flex-col`}>
          {/* Username */}
          <span className={`block text-white ${player.isCurrentPlayer ? "text-sm font-bold" : "text-xs"}`}>
            {player.isCurrentPlayer ? "أنت" : player.username}
          </span>
          
          {/* Chips amount */}
          <span className="block text-gold text-xs font-medium flex items-center">
            <span className="bg-gold/20 rounded-full w-3 h-3 flex items-center justify-center mr-1">
              <span className="w-2 h-2 bg-gold rounded-full"></span>
            </span>
            {formatChips(player.chips)}
          </span>
        </div>
      </div>
      
      {/* All-in indicator */}
      {player.isAllIn && (
        <div className="mt-1.5 bg-amber-500/90 rounded-full px-2 py-0.5 text-white text-xs font-bold animate-pulse">
          كل الرقائق
        </div>
      )}
    </div>
  );
}
