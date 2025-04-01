import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameState, Card as CardType } from "@/types";
import { PlayerComponent } from "./player-component";
import { CardComponent } from "./card-component";
import { Chips } from "./chips";
import { Plus, HelpCircle, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { GameActions } from "./game-actions";
import { GameControls } from "./game-controls";
import { GameInstructions } from "./game-instructions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import pokerTableBg from "@assets/gradient-poker-table-background_23-2151085419 (1).jpg";

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Positions for players based on their slot - updated for 9-seat oval table layout
  const playerPositions = [
    "bottom", // current user (0) - دائما في الوسط أسفل
    "bottomRight", // position 1
    "right", // position 2
    "topRight", // position 3
    "top", // position 4
    "topLeft", // position 5
    "left", // position 6
    "bottomLeft", // position 7
    "dealer", // position 8 - dealer in the middle
  ];
  
  // Define empty seat positions for a 9-player table - updated for oval table layout
  const seatPositions = [
    { position: "bottom", className: "absolute bottom-4 left-1/2 transform -translate-x-1/2" },
    { position: "bottomRight", className: "absolute bottom-10 right-16" },
    { position: "right", className: "absolute right-10 top-1/2 transform -translate-y-1/2" },
    { position: "topRight", className: "absolute top-10 right-16" },
    { position: "top", className: "absolute top-4 left-1/2 transform -translate-x-1/2" },
    { position: "topLeft", className: "absolute top-10 left-16" },
    { position: "left", className: "absolute left-10 top-1/2 transform -translate-y-1/2" },
    { position: "bottomLeft", className: "absolute bottom-10 left-16" },
    { position: "dealer", className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" }
  ];

  // Map game state players to positions
  const positionedPlayers = gameState.players.map((player) => ({
    ...player,
    position: playerPositions[gameState.players.findIndex(p => p.id === player.id) % 9] as any
  }));
  
  // Find all occupied positions
  const occupiedPositions = positionedPlayers.map(player => player.position);
  
  // Find available (empty) positions
  const emptySeats = seatPositions.filter(seat => !occupiedPositions.includes(seat.position));
  
  // Handle join seat
  const handleJoinSeat = async (position: string) => {
    if (isJoining) return;
    
    setIsJoining(true);
    
    try {
      // Find an available position index
      const positionIndex = playerPositions.indexOf(position as any);
      
      // Send request to join the table at this position
      const res = await fetch(`/api/game/${gameState.id || gameState.gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ position: positionIndex })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل الانضمام إلى الطاولة");
      }
      
      // Success
      toast({
        title: "تم الانضمام",
        description: "تم الانضمام إلى الطاولة بنجاح!",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل الانضمام إلى الطاولة",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Animation for cards entering table
  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateY: 180 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    })
  };
  
  // Check if current user is already at the table
  const isUserPlaying = positionedPlayers.some(player => player.isCurrentPlayer);
  
  // Check if the table is full to determine spectator status
  const isTableFull = gameState.players.length >= 9;
  
  // Effect to update spectator status
  useEffect(() => {
    // User is a spectator if they're not playing and the table is full
    setIsSpectator(!isUserPlaying && isTableFull);
  }, [isUserPlaying, isTableFull]);

  return (
    <div className="flex-grow relative my-6">
      {/* Spectator banner - Show only if user is spectating */}
      {isSpectator && (
        <div className="absolute top-0 left-0 right-0 bg-amber-600/80 py-2 px-4 text-white text-center z-50 rounded-md mx-4">
          <p className="font-bold">أنت الآن في وضع المشاهدة - ستتمكن من الانضمام عندما يصبح مقعد متاحًا</p>
          <button 
            onClick={() => {
              // Poll for available seats
              const checkInterval = setInterval(() => {
                if (emptySeats.length > 0 && !isUserPlaying) {
                  // When seat becomes available, try to join
                  handleJoinSeat(emptySeats[0].position);
                  clearInterval(checkInterval);
                  toast({
                    title: "مقعد متاح",
                    description: "تم العثور على مقعد فارغ، جاري محاولة الانضمام...",
                  });
                }
              }, 5000); // Check every 5 seconds
              
              toast({
                title: "انتظار مقعد",
                description: "سيتم إعلامك عندما يصبح هناك مقعد متاح",
              });
            }}
            className="mt-1 bg-white text-amber-700 px-4 py-1 rounded-full font-bold hover:bg-white/90 transition-colors"
          >
            انتظار مقعد متاح
          </button>
        </div>
      )}
      
      {/* Main table container */}
      <div 
        className="poker-table absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
        style={{
          // Apply the oval/stadium shape
          borderRadius: "45%/55%",
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Border layer */}
        <div className="absolute inset-0 rounded-full" 
          style={{ 
            borderRadius: "45%/55%", 
            border: "10px solid #333333",
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
          }}>
        </div>
        
        {/* Table surface */}
        <div className="absolute inset-[10px] bg-[#0f653a]" 
          style={{ 
            borderRadius: "45%/55%",
            background: 'linear-gradient(to bottom, #0f653a, #0a4528)',
            boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.5)'
          }}>
          
          {/* Center table logo - faded watermark */}
          <div className="absolute inset-0 flex items-center justify-center text-white/10 text-4xl font-bold"
            style={{ 
              textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
              userSelect: 'none'
            }}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-gold/30 text-6xl mb-2">♠</div>
              <div className="text-white/20 text-2xl font-bold">BOYA</div>
            </div>
          </div>
        </div>

        {/* Dealer (Card distributor) in center of table - موزعة الورق */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25">
          {/* Only show dealer/distributor if game has started */}
          {gameState.gameStatus !== "waiting" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* الموزعة - صورة امرأة بزي كازينو كما في الصورة */}
              <div className="dealer-avatar absolute w-20 h-32 -top-16 -left-10 z-10">
                <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gold/30 shadow-lg">
                  <div className="w-full h-full bg-gradient-to-b from-pink-500/70 to-purple-800/70 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                      <div className="text-red-500 font-bold text-xs transform rotate-45">
                        DEALER
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card stack - deck of cards in front of the dealer */}
              <div className="deck-cards relative w-14 h-20 bg-white rounded-md shadow-xl border border-gray-300">
                {/* Card layers to show stack */}
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={`card-layer-${i}`} 
                    className="absolute w-14 h-20 bg-white rounded-md border border-gray-300 shadow-md" 
                    style={{ 
                      top: `${-2 - i * 1}px`, 
                      left: `${-2 - i * 1}px` 
                    }}
                  />
                ))}
                
                {/* Card back design */}
                <div className="absolute inset-1 bg-slate-800 rounded-sm flex items-center justify-center">
                  <div className="text-gold text-2xl">♦</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dealer button */}
        {gameState.gameStatus !== "waiting" && (
          <div className="absolute z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-gold shadow-lg" 
               style={{ 
                 bottom: '45%', 
                 right: '40%' 
               }}>
            D
          </div>
        )}
      
        {/* Center pot indicator */}
        {gameState.pot > 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-14 z-30">
            <div className="flex flex-col items-center">
              {/* Current bet amount */}
              <div className="bg-black/60 rounded-full px-3 py-1 mb-2 text-center">
                <span className="text-white text-lg font-bold">
                  {gameState.currentBet > 0 ? `${gameState.currentBet}+${gameState.pot - gameState.currentBet}` : gameState.pot}
                </span>
              </div>
              
              {/* Chip visualization */}
              <div className="relative h-12 w-16">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-600 rounded-full border-4 border-white z-20 flex items-center justify-center text-white font-bold">
                  {Math.floor(gameState.pot / 1000)}K
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Cards */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 flex space-x-1 rtl:space-x-reverse z-20">
          {gameState.communityCards.map((card, index) => (
            <motion.div
              key={`community-card-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="card transform"
              style={{ 
                margin: '0 -5px', 
                transform: `rotate(${-10 + index * 5}deg)`
              }}
            >
              <CardComponent 
                card={card} 
                size="lg" 
                // إذا كانت هذه الورقة جزءًا من يد الفائز، أضف تأثير توهج
                isWinning={gameState.winners?.some(winner => 
                  winner.handDetails?.bestHand?.some((winCard: CardType) => 
                    winCard.suit === card.suit && winCard.value === card.value
                  )
                )}
              />
            </motion.div>
          ))}
          
          {/* Empty card placeholders - hidden until cards are dealt */}
          {gameState.gameStatus !== "waiting" && gameState.gameStatus !== "preflop" && Array.from({ length: 5 - gameState.communityCards.length }).map((_, index) => (
            <div 
              key={`empty-card-${index}`} 
              className="w-14 h-20 bg-white/10 rounded-md shadow-lg"
              style={{ 
                margin: '0 -5px', 
                transform: `rotate(${-10 + (index + gameState.communityCards.length) * 5}deg)`
              }}
            ></div>
          ))}
        </div>
        
        {/* Winner Announcement - Show only during showdown */}
        {gameState.gameStatus === "showdown" && gameState.winners && gameState.winners.length > 0 && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mt-[-60px]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="bg-black/80 backdrop-blur-xl px-6 py-4 rounded-xl border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.6)]">
              <div className="text-center">
                <h2 className="text-[#D4AF37] text-2xl font-bold mb-2">
                  {positionedPlayers.find(p => p.id === gameState.winners![0].playerId)?.isCurrentPlayer 
                    ? "لقد فزت! 🎉" 
                    : `الفائز: ${positionedPlayers.find(p => p.id === gameState.winners![0].playerId)?.username}`}
                </h2>
                <div className="text-white mb-3">
                  بواسطة <span className="text-[#D4AF37] font-bold">{gameState.winners[0].handName}</span>
                </div>
                <div className="flex justify-center items-center gap-1">
                  {gameState.winners[0].handDetails?.bestHand?.map((card: CardType, idx: number) => (
                    <div 
                      key={`winner-card-${idx}`}
                      className="transform transition-all duration-300 hover:scale-110"
                      style={{ margin: '0 -4px' }}
                    >
                      <CardComponent card={card} size="sm" variant="gold" isWinning={true} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xl font-bold text-green-500">
                  +{gameState.winners[0].amount.toLocaleString()} رقاقة
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Players */}
        {positionedPlayers.map(player => (
          <PlayerComponent 
            key={player.id} 
            player={player} 
            isTurn={gameState.currentTurn === player.id}
            gameStatus={gameState.gameStatus} // إضافة حالة اللعبة لعرض الأوراق بشكل صحيح
          />
        ))}
        
        {/* Empty seats with join buttons */}
        {!isUserPlaying && emptySeats.map((seat, index) => (
          <div key={`empty-seat-${index}`} className={`${seat.className} z-10`}>
            <motion.button
              onClick={() => handleJoinSeat(seat.position)}
              disabled={isJoining}
              className="w-14 h-14 bg-black/60 hover:bg-gold/40 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-8 h-8 text-white" />
              <span className="sr-only">الانضمام إلى المقعد</span>
            </motion.button>
            <div className="mt-2 text-center text-white/70 text-xs">اضغط للجلوس</div>
          </div>
        ))}

        {/* Table action buttons - shown based on game state - positioned on bottom right */}
        {gameState.gameStatus !== "waiting" && isUserPlaying && (
          <div className="absolute bottom-4 right-4 z-40">
            <GameActions 
              currentBet={gameState.currentBet}
              minRaise={gameState.currentBet * 2}
              maxBet={100000} /* يجب استبدالها بالحد الأقصى المحدد */
              playerChips={positionedPlayers.find(p => p.isCurrentPlayer)?.chips || 0}
              isCurrentTurn={positionedPlayers.find(p => p.isCurrentPlayer)?.id === gameState.currentTurn}
              onAction={(action, amount) => {
                // إرسال طلب إجراء اللعب إلى الخادم
                console.log(`Sending action ${action} with amount ${amount}`);
                
                // يمكن إضافة الكود هنا لإرسال طلب إلى نقطة نهاية API
                fetch(`/api/game/${gameState.id || gameState.gameId}/action`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ action, amount })
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Failed to execute action');
                  }
                  return response.json();
                })
                .catch(error => {
                  toast({
                    title: "خطأ في تنفيذ الإجراء",
                    description: error.message,
                    variant: "destructive",
                  });
                });
              }}
            />
          </div>
        )}
      </div>
      
      {/* نافذة تعليمات اللعبة */}
      <GameInstructions showInstructions={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
