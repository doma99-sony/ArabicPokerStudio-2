import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useSoundSystem } from "@/hooks/use-sound-system";
import { Coins, User, Clock, Loader2, MoreHorizontal, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatChips } from "@/lib/utils";
import { Card } from "@/types";
import { PlayingCard } from "@/components/game/playing-card";
import { cn } from "@/lib/utils";

// تعريف نوع اللاعب
interface Player {
  id: number;
  username: string;
  chips: number;
  position: number;
  avatar?: string;
  cards?: Card[];
  folded: boolean;
  betAmount: number;
  isAllIn: boolean;
  isActive: boolean;
  isWinner?: boolean;
  winAmount?: number;
  handName?: string;
  profitLoss?: number; // إضافة حقل لتتبع الربح/الخسارة
  totalBetAmount?: number; // إجمالي الرهانات في الجولة
}

// تعريف واجهة خصائص طاولة بوكر العرب
interface ArabPokerTableProps {
  gameState: {
    id: number;
    tableName: string;
    players: Player[];
    communityCards: Card[];
    pot: number;
    dealer: number;
    currentTurn: number;
    smallBlind: number;
    bigBlind: number;
    round: number;
    currentBet: number;
    userChips: number;
    gameStatus: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
    minRaise?: number;
    turnTimeLeft?: number;
    gameHistory?: any[];
  };
  onAction: (action: string, amount?: number) => void;
  isSpectator?: boolean;
}

// مكون طاولة بوكر العرب
export function ArabPokerTable({ gameState, onAction, isSpectator = false }: ArabPokerTableProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { playSound, toggleMute, isMuted } = useSoundSystem();
  const [betAmount, setBetAmount] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ username: string; message: string; timestamp: number }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const previousGameStateRef = useRef<any>(null);
  
  // الحد الأدنى والأقصى للرهان
  const minRaise = gameState.minRaise || gameState.currentBet + gameState.bigBlind;
  const maxBet = gameState.userChips || 0;
  
  // الوقت المتبقي للدور الحالي
  const [timeLeft, setTimeLeft] = useState(gameState.turnTimeLeft || 30);
  
  // حساب الربح والخسارة للاعبين
  useEffect(() => {
    // نتجاهل إذا لم تكن هناك بيانات سابقة للمقارنة
    if (!previousGameStateRef.current) {
      previousGameStateRef.current = JSON.parse(JSON.stringify(gameState));
      return;
    }
    
    // حساب المكاسب والخسائر عند انتهاء الجولة (showdown)
    const isShowdown = gameState.gameStatus === "showdown";
    const wasNotShowdown = previousGameStateRef.current.gameStatus !== "showdown";
    
    // فقط عند الانتقال إلى مرحلة كشف الأوراق
    if (isShowdown && wasNotShowdown) {
      // حساب الأرباح/الخسائر لكل لاعب
      const playersWithProfitLoss = gameState.players.map(player => {
        // إيجاد اللاعب في الحالة السابقة للمقارنة
        const previousPlayer = previousGameStateRef.current.players.find((p: any) => p.id === player.id);
        
        // إذا كان اللاعب جديد، نستخدم قيمة الرهان الحالية
        const previousChips = previousPlayer ? previousPlayer.chips + previousPlayer.betAmount : player.chips;
        const currentChips = player.chips;
        
        // حساب الفرق (الربح أو الخسارة)
        const profitLoss = currentChips - previousChips;
        
        return {
          ...player,
          profitLoss,
          totalBetAmount: player.betAmount // حفظ إجمالي الرهان
        };
      });
      
      // تحديث اللاعبين مع معلومات الربح/الخسارة
      gameState.players = playersWithProfitLoss;
    }
    
    // تحديث المرجع بالحالة الحالية للمقارنة في المرة التالية
    previousGameStateRef.current = JSON.parse(JSON.stringify(gameState));
  }, [gameState, gameState.gameStatus]);
  
  // تحديث الوقت المتبقي عند تغير gameState.turnTimeLeft
  useEffect(() => {
    setTimeLeft(gameState.turnTimeLeft || 30);
  }, [gameState.turnTimeLeft]);
  
  // تقليل الوقت بمقدار 1 كل ثانية
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prevTime => Math.max(0, prevTime - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  
  // تحديث تلقائي لمبلغ الرهان عند تغير الحد الأدنى أو الأقصى
  useEffect(() => {
    setBetAmount(minRaise);
  }, [minRaise, gameState.currentBet, gameState.id]);
  
  // تمرير للأسفل تلقائيًا في الدردشة
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);
  
  // إيجاد اللاعب الخاص بالمستخدم
  const currentPlayer = gameState.players.find(player => player.id === user?.id);
  const isCurrentTurn = currentPlayer && gameState.currentTurn === currentPlayer.position && !isSpectator;
  
  // تحديد إذا كان بإمكان اللاعب القيام بإجراء معين
  const canCheck = isCurrentTurn && gameState.currentBet === (currentPlayer?.betAmount || 0);
  const canCall = isCurrentTurn && gameState.currentBet > (currentPlayer?.betAmount || 0);
  const canRaise = isCurrentTurn && gameState.currentBet >= 0 && maxBet > gameState.currentBet;
  
  // تحديد المبلغ المطلوب للمجاراة
  const callAmount = gameState.currentBet - (currentPlayer?.betAmount || 0);
  
  // معالجة الرهان عند تحريك المنزلق
  const handleBetSliderChange = (value: number[]) => {
    setBetAmount(value[0]);
  };
  
  // استخراج البطاقات المشتركة لعرضها على الطاولة
  const communityCards = gameState.communityCards || [];
  
  // حالة اللاعب (نشط، طوى، الخ)
  const getPlayerStateColor = (player: Player) => {
    if (player.isAllIn) return "text-yellow-400";
    if (player.folded) return "text-gray-500";
    if (gameState.currentTurn === player.position) return "text-green-400";
    return "text-white";
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* خلفية الطاولة */}
      <div className="absolute inset-0 bg-[#0a4f2e] rounded-full border-8 border-[#723f1f] shadow-inner mx-auto my-auto max-w-4xl max-h-full aspect-square z-0">
        <div className="absolute inset-10 rounded-full border-2 border-[#ffffff20]"></div>
        <div className="absolute inset-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D4AF37]">
              {formatChips(gameState.pot)}
            </div>
            <div className="text-sm text-[#D4AF37]/60">الرهان المركزي</div>
          </div>
        </div>
      </div>
      
      {/* البطاقات المشتركة */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center space-x-2 z-10">
        {Array.from({ length: 5 }).map((_, i) => {
          const card = communityCards[i];
          return (
            <div key={i} className={`transition-all duration-300 ${card ? "scale-100" : "scale-90 opacity-30"}`}>
              {card ? (
                <PlayingCard card={card} />
              ) : (
                <div className="w-16 h-24 bg-[#000000]/20 rounded-md border border-[#ffffff10]"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* مؤشر المراحل */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 px-4 py-1 rounded-full text-sm font-medium text-[#D4AF37] border border-[#D4AF37]/30 z-20">
        {(() => {
          switch (gameState.gameStatus) {
            case "waiting":
              return "في انتظار اللاعبين";
            case "preflop":
              return "مرحلة البري فلوب";
            case "flop":
              return "مرحلة الفلوب";
            case "turn":
              return "مرحلة التيرن";
            case "river":
              return "مرحلة الريفر";
            case "showdown":
              return "كشف الأوراق";
            default:
              return "طاولة بوكر العرب";
          }
        })()}
      </div>
      
      {/* معلومات الطاولة */}
      <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-lg border border-[#D4AF37]/30 z-20">
        <div className="text-xs text-[#D4AF37]/80">الرهانات: {gameState.smallBlind}/{gameState.bigBlind}</div>
        <div className="text-xs text-[#D4AF37]/80">الجولة: #{gameState.round}</div>
      </div>
      
      {/* مواقع اللاعبين */}
      <div className="absolute inset-0 z-10">
        {/* 9 مواقع ممكنة للاعبين */}
        {Array.from({ length: 9 }).map((_, position) => {
          const player = gameState.players.find(p => p.position === position);
          const isDealer = position === gameState.dealer;
          const isCurrentPlayerTurn = position === gameState.currentTurn;
          
          if (!player) {
            return (
              <EmptySeat key={position} position={position} />
            );
          }
          
          return (
            <div key={position} className={`absolute transform ${getPositionClasses(position)}`}>
              <PlayerPositionCard
                player={player}
                isDealer={isDealer}
                isCurrentTurn={isCurrentPlayerTurn}
                stateColor={getPlayerStateColor(player)}
                showCards={gameState.gameStatus === "showdown" || player.id === user?.id || isSpectator}
              />
            </div>
          );
        })}
      </div>
      
      {/* لوحة إجراءات اللاعب */}
      {isCurrentTurn && !isSpectator && currentPlayer && !currentPlayer.folded && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg border border-[#D4AF37]/30 w-full max-w-md z-30">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[#D4AF37] font-bold">دورك للعب</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-[#D4AF37] ml-1" />
              <div className={`text-sm font-medium ${timeLeft <= 5 ? 'text-red-500' : 'text-[#D4AF37]'}`}>
                {timeLeft}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                playSound('fold');
                onAction('fold');
              }}
            >
              طي
            </Button>
            
            {canCheck && (
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  playSound('check');
                  onAction('check');
                }}
              >
                تمرير
              </Button>
            )}
            
            {canCall && (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  playSound('call');
                  onAction('call');
                }}
              >
                مجاراة {formatChips(callAmount)}
              </Button>
            )}
            
            {canRaise && (
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => {
                  playSound('raise');
                  onAction('raise', betAmount);
                }}
              >
                زيادة {formatChips(betAmount)}
              </Button>
            )}
            
            <Button
              className="bg-purple-500 hover:bg-purple-600 text-white"
              onClick={() => {
                playSound('all_in');
                onAction('all_in');
              }}
            >
              كل الرقائق
            </Button>
          </div>
          
          {/* منزلق الرهان */}
          {canRaise && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-[#D4AF37]/80 mb-1">
                <span>{formatChips(minRaise)}</span>
                <span>{formatChips(maxBet)}</span>
              </div>
              <Slider
                className="mt-0"
                value={[betAmount]}
                min={minRaise}
                max={maxBet}
                step={gameState.bigBlind}
                onValueChange={handleBetSliderChange}
              />
            </div>
          )}
        </div>
      )}
      
      {/* رسالة للمشاهدين */}
      {isSpectator && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-3 rounded-lg border border-[#D4AF37]/30 z-30">
          <p className="text-[#D4AF37] text-center">أنت في وضع المشاهدة</p>
        </div>
      )}
      
      {/* زر الدردشة */}
      <button
        className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full border border-[#D4AF37]/30 z-20 hover:bg-black/80"
        onClick={() => setShowChatModal(!showChatModal)}
      >
        <MessageCircle className="h-6 w-6 text-[#D4AF37]" />
      </button>
      
      {/* نافذة الدردشة */}
      {showChatModal && (
        <div className="absolute right-4 bottom-16 bg-black/80 rounded-lg border border-[#D4AF37]/30 w-72 h-96 z-30 flex flex-col">
          <div className="p-2 border-b border-[#D4AF37]/30 flex justify-between items-center">
            <h3 className="text-[#D4AF37] font-bold">الدردشة</h3>
            <button onClick={() => setShowChatModal(false)}>
              <MoreHorizontal className="h-5 w-5 text-[#D4AF37]" />
            </button>
          </div>
          
          <div className="flex-1 p-2 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <p className="text-center text-white/50 text-sm mt-4">لا توجد رسائل</p>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className="mb-2">
                  <div className="flex">
                    <span className="text-[#D4AF37] text-sm font-medium">{msg.username}:</span>
                    <span className="text-white text-sm ml-1">{msg.message}</span>
                  </div>
                  <div className="text-white/40 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-2 border-t border-[#D4AF37]/30">
            <div className="flex">
              <input
                type="text"
                className="flex-1 bg-black/60 border border-[#D4AF37]/30 rounded-l-md px-2 py-1 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="اكتب رسالتك..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    const newMsg = {
                      username: user?.username || 'زائر',
                      message: chatMessage.trim(),
                      timestamp: Date.now()
                    };
                    setChatMessages([...chatMessages, newMsg]);
                    setChatMessage('');
                  }
                }}
              />
              <button
                className="bg-[#D4AF37] text-black px-3 py-1 rounded-r-md"
                onClick={() => {
                  if (chatMessage.trim()) {
                    const newMsg = {
                      username: user?.username || 'زائر',
                      message: chatMessage.trim(),
                      timestamp: Date.now()
                    };
                    setChatMessages([...chatMessages, newMsg]);
                    setChatMessage('');
                  }
                }}
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// مكون للمقعد الفارغ
function EmptySeat({ position }: { position: number }) {
  return (
    <div className={`absolute transform ${getPositionClasses(position)}`}>
      <div className="bg-black/30 p-2 rounded-lg border border-[#ffffff10] w-36 h-20 flex items-center justify-center">
        <div className="text-white/50 text-sm">مقعد شاغر</div>
      </div>
    </div>
  );
}

// مكون لبطاقة موقع اللاعب
interface PlayerPositionCardProps {
  player: Player;
  isDealer: boolean;
  isCurrentTurn: boolean;
  stateColor: string;
  showCards: boolean;
}

// مكون بطاقة موقع اللاعب
function PlayerPositionCard({ player, isDealer, isCurrentTurn, stateColor, showCards }: PlayerPositionCardProps) {
  return (
    <div className={`bg-black/60 p-2 rounded-lg border ${isCurrentTurn ? 'border-green-400' : player.isWinner ? 'border-[#FFD700]' : 'border-[#D4AF37]/30'} w-36`}>
      {/* حالة الاتصال واسم اللاعب */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${stateColor} ml-1`}></div>
          <div className="text-white text-sm truncate max-w-[90px]">
            {player.username}
            {player.isWinner && <span className="text-yellow-400 mr-1"> 👑</span>}
          </div>
        </div>
        {isDealer && (
          <div className="bg-[#D4AF37] text-black text-xs px-1 rounded">D</div>
        )}
      </div>
      
      {/* بطاقات اللاعب والرقائق */}
      <div className="flex justify-between">
        <div className="flex">
          {player.cards?.length ? (
            showCards ? (
              <div className="flex -space-x-3">
                {player.cards.map((card, i) => (
                  <div key={i} className="transform scale-[0.6] origin-bottom-left">
                    <PlayingCard card={card} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex -space-x-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="transform scale-[0.6] origin-bottom-left">
                    <div className="h-24 w-16 bg-gradient-to-br from-[#D4AF37] to-[#E5C04B] rounded-md border border-[#ffffff30] flex items-center justify-center">
                      <div className="h-20 w-12 bg-gradient-to-br from-blue-900 to-blue-800 rounded-md border border-[#ffffff10]"></div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <Coins className="h-3 w-3 text-[#D4AF37] ml-1" />
            <span className="text-[#D4AF37] text-xs">{formatChips(player.chips)}</span>
          </div>
          
          {player.betAmount > 0 && (
            <div className="text-white/80 text-xs mt-1">
              {player.isAllIn ? "كل الرقائق" : formatChips(player.betAmount)}
            </div>
          )}
          
          {player.folded && (
            <div className="text-red-400 text-xs mt-1">طوى</div>
          )}
          
          {/* عرض المكاسب والخسائر */}
          {player.profitLoss !== undefined && (
            <div className={`text-xs mt-1 ${player.profitLoss > 0 ? 'text-green-400' : player.profitLoss < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {player.profitLoss > 0 ? '+' : ''}{formatChips(player.profitLoss)}
            </div>
          )}
          
          {/* عرض اسم اليد الفائزة */}
          {player.handName && showCards && (
            <div className="bg-black/60 text-[#D4AF37] text-xs mt-1 px-1 rounded">
              {player.handName}
            </div>
          )}
        </div>
      </div>
      
      {/* عرض مبلغ الفوز */}
      {player.winAmount && player.isWinner && (
        <div className="mt-1 bg-[#FFD700]/20 rounded p-1 text-center">
          <div className="text-[#FFD700] text-xs font-bold">
            +{formatChips(player.winAmount)}
          </div>
        </div>
      )}
    </div>
  );
}

// دالة مساعدة لتحديد فئات موقع اللاعب على الطاولة
function getPositionClasses(position: number): string {
  switch (position) {
    case 0: // أسفل الوسط (اللاعب الحالي)
      return "bottom-4 left-1/2 -translate-x-1/2";
    case 1: // أسفل اليسار
      return "bottom-4 left-4";
    case 2: // يسار منتصف
      return "left-4 top-1/2 -translate-y-1/2";
    case 3: // أعلى اليسار
      return "top-4 left-4";
    case 4: // أعلى منتصف
      return "top-4 left-1/2 -translate-x-1/2";
    case 5: // أعلى اليمين
      return "top-4 right-4";
    case 6: // يمين منتصف
      return "right-4 top-1/2 -translate-y-1/2";
    case 7: // أسفل اليمين
      return "bottom-4 right-4";
    case 8: // وسط منتصف (نادراً ما يستخدم)
      return "top-1/3 left-1/2 -translate-x-1/2";
    default:
      return "bottom-4 left-1/2 -translate-x-1/2";
  }
}