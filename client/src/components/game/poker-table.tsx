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
  
  // تتبع آخر إجراء قام به اللاعبون
  const [lastAction, setLastAction] = useState<{
    playerId: number;
    action: string;
    amount?: number;
  } | undefined>();
  
  // متغير لعرض/إخفاء شارة الإجراء
  const [showActionBadge, setShowActionBadge] = useState(true);
  
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
      
      {/* Main table container with higher quality design */}
      <div 
        className="poker-table absolute inset-0 overflow-hidden flex items-center justify-center"
        style={{
          // Apply the oval/stadium shape
          borderRadius: "45%/55%",
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Outer border layer with golden accent */}
        <div className="absolute inset-0" 
          style={{ 
            borderRadius: "45%/55%", 
            border: "12px solid #2C2C2C",
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
            background: 'linear-gradient(135deg, rgba(44, 44, 44, 1) 0%, rgba(28, 28, 28, 1) 100%)',
          }}>
          {/* Golden accent rim */}
          <div className="absolute inset-0"
            style={{
              borderRadius: "45%/55%",
              border: "2px solid rgba(212, 175, 55, 0.3)",
              boxShadow: 'inset 0 0 15px rgba(212, 175, 55, 0.1)'
            }}></div>
        </div>
        
        {/* Table padding layer */}
        <div className="absolute inset-[12px]" 
          style={{ 
            borderRadius: "45%/55%",
            background: 'linear-gradient(135deg, #1A1A1A 0%, #0D0D0D 100%)',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6)'
          }}>
        </div>
        
        {/* Table felt surface with texture */}
        <div className="absolute inset-[18px]" 
          style={{ 
            borderRadius: "45%/55%",
            background: 'linear-gradient(to bottom, #0f653a, #0a4528)',
            boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.5)'
          }}>
          {/* Felt texture overlay */}
          <div className="absolute inset-0"
            style={{
              borderRadius: "45%/55%",
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
              opacity: 0.15,
              mixBlendMode: 'multiply'
            }}></div>
          
          {/* Felt glow effect */}
          <div className="absolute inset-0"
            style={{
              borderRadius: "45%/55%",
              background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%)'
            }}></div>
            
          {/* Center table logo - enhanced watermark */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ 
              textShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
              userSelect: 'none'
            }}>
            <div className="flex flex-col items-center justify-center">
              <div className="text-gold/20 text-7xl mb-3 filter blur-[1px]">♠</div>
              <div className="text-white/15 text-2xl font-bold tracking-wider filter blur-[0.5px]">VIP POKER</div>
              <div className="mt-2 w-40 h-0.5 bg-gradient-to-r from-transparent via-gold/15 to-transparent"></div>
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

        {/* Dealer button - enhanced with animation */}
        {gameState.gameStatus !== "waiting" && (
          <motion.div 
            className="absolute z-10 w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gold shadow-lg overflow-hidden" 
            style={{ 
              bottom: '45%', 
              right: '40%' 
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.3
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-transparent opacity-70 animate-shine"></div>
            
            {/* Subtle pulse */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-gold/30"
              animate={{ 
                boxShadow: ['0 0 0px rgba(212, 175, 55, 0.3)', '0 0 8px rgba(212, 175, 55, 0.7)', '0 0 0px rgba(212, 175, 55, 0.3)'],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            ></motion.div>
            
            {/* Dealer text with gold gradient */}
            <div className="text-transparent bg-clip-text bg-gradient-to-br from-amber-800 to-amber-600 font-bold text-lg">D</div>
          </motion.div>
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
        
        {/* Winner Announcement - Enhanced with animations and visual effects */}
        {gameState.gameStatus === "showdown" && gameState.winners && gameState.winners.length > 0 && (
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 mt-[-60px] w-96 max-w-[90vw]"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            {/* Confetti animation container - absolute positioned outside card */}
            <div className="absolute -top-20 left-0 right-0 flex justify-center pointer-events-none">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.3, 1, 0.5],
                    y: [-20, -100 - i * 30],
                    x: [0, (i-1) * 40]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <div 
                    className={`w-6 h-6 ${i % 3 === 0 ? 'bg-gold' : i % 3 === 1 ? 'bg-red-500' : 'bg-blue-500'} rotate-45 rounded-sm`}
                    style={{ opacity: 0.7 }}
                  ></div>
                </motion.div>
              ))}
            </div>
            
            {/* Main winner card with luxurious design */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0F0F1A] to-[#1F1F2F] p-[3px]">
              {/* Gold border animated gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFEA83] to-[#D4AF37] opacity-50 animate-border-flow"></div>
              
              {/* Content container */}
              <div className="relative bg-black/95 backdrop-blur-xl px-6 py-5 rounded-lg border border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.3)] overflow-hidden">
                {/* Background design elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-gold/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-radial from-gold/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                {/* Trophy icon */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-gold/10 text-7xl">🏆</div>
                
                <div className="relative text-center">
                  {/* Winner badge/ribbon */}
                  <div className="mb-2">
                    <div className="inline-flex items-center bg-gradient-to-r from-amber-700 to-amber-500 px-4 py-1 rounded-full shadow-lg">
                      <motion.div
                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xl mr-2"
                      >
                        🏆
                      </motion.div>
                      <span className="text-white text-sm font-bold uppercase tracking-wider">Winner</span>
                    </div>
                  </div>
                  
                  {/* Winner name with glow effect */}
                  <motion.h2 
                    className="text-gold text-3xl font-bold mb-2"
                    animate={{ 
                      textShadow: [
                        '0 0 5px rgba(212,175,55,0.3)', 
                        '0 0 15px rgba(212,175,55,0.7)', 
                        '0 0 5px rgba(212,175,55,0.3)'
                      ] 
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {positionedPlayers.find(p => p.id === gameState.winners![0].playerId)?.isCurrentPlayer 
                      ? "لقد فزت! 🎉" 
                      : `${positionedPlayers.find(p => p.id === gameState.winners![0].playerId)?.username}`}
                  </motion.h2>
                  
                  {/* Hand name with elegant styling */}
                  <div className="text-white mb-4">
                    بواسطة <span className="text-gold font-bold px-2 py-0.5 bg-gold/10 rounded-md">{gameState.winners[0].handName}</span>
                  </div>
                  
                  {/* Winner's hand with animation */}
                  <motion.div 
                    className="flex justify-center items-center gap-1 mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {gameState.winners[0].handDetails?.bestHand?.map((card: CardType, idx: number) => (
                      <motion.div 
                        key={`winner-card-${idx}`}
                        className="transform transition-all duration-300 hover:scale-110"
                        style={{ margin: '0 -4px' }}
                        whileHover={{ y: -10, zIndex: 10 }}
                        custom={idx}
                        initial={{ y: 40, opacity: 0, rotateY: 180 }}
                        animate={{ y: 0, opacity: 1, rotateY: 0 }}
                        transition={{ 
                          delay: 0.3 + (idx * 0.1),
                          duration: 0.5,
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                      >
                        <CardComponent card={card} size="md" variant="gold" isWinning={true} />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  {/* Chips amount with animation */}
                  <motion.div 
                    className="mt-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <div className="flex items-center justify-center">
                      <span className="text-xl mr-1">+</span>
                      <span className="text-3xl">{gameState.winners[0].amount.toLocaleString()}</span>
                    </div>
                    <div className="text-white/70 text-sm font-normal mt-1">رقاقة</div>
                  </motion.div>
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
            lastAction={lastAction} // إضافة معلومات آخر إجراء
            showActionBadge={showActionBadge} // متغير لإظهار/إخفاء شارة الإجراء
          />
        ))}
        
        {/* Empty seats with enhanced join buttons */}
        {!isUserPlaying && emptySeats.map((seat, index) => (
          <div key={`empty-seat-${index}`} className={`${seat.className} z-10`}>
            <motion.div
              className="relative"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
            >
              <motion.button
                onClick={() => handleJoinSeat(seat.position)}
                disabled={isJoining}
                className="relative w-16 h-16 bg-gradient-to-br from-black/80 to-slate-900/80 hover:from-gold/30 hover:to-amber-800/50 rounded-full border-2 border-gold/30 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] overflow-hidden group"
                whileHover={{ scale: 1.15, borderColor: "rgba(212, 175, 55, 0.6)" }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Pulse effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full border-2 border-gold/30"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "loop" 
                  }}
                ></motion.div>
                
                {/* Icon */}
                <Plus className="w-8 h-8 text-gold group-hover:text-white transition-colors" />
                <span className="sr-only">الانضمام إلى المقعد</span>
              </motion.button>
              
              {/* Label with enhanced styling */}
              <div className="mt-3 text-center bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-gold/20">
                <span className="text-gold/80 text-xs font-medium">انضم للعب</span>
              </div>
            </motion.div>
          </div>
        ))}

        {/* Table action buttons - shown based on game state - positioned on bottom right */}
        {gameState.gameStatus !== "waiting" && isUserPlaying && (
          <div className="absolute bottom-4 right-4 z-40">
            {/* Add debug info */}
            <div className="mb-2 text-xs bg-black/70 text-white p-1 rounded">
              دور اللاعب: {gameState.currentTurn === positionedPlayers.find(p => p.isCurrentPlayer)?.id ? "نعم" : "لا"} | 
              معرف اللاعب: {positionedPlayers.find(p => p.isCurrentPlayer)?.id} | 
              الدور الحالي: {gameState.currentTurn}
            </div>
            
            {/* أزرار اختبار مباشرة للإجراءات */}
            <div className="mb-2 p-2 bg-black/40 rounded flex gap-2 flex-wrap">
              <button 
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                onClick={() => {
                  // إرسال طلب مباشر للتخلي
                  fetch(`/api/game/${gameState.id}/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: "fold" })
                  })
                  .then(response => response.json())
                  .then(data => console.log("نتيجة التخلي:", data))
                  .catch(err => console.error("خطأ في التخلي:", err));
                }}
              >
                اختبار التخلي
              </button>
              
              <button 
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                onClick={() => {
                  // إرسال طلب مباشر للمتابعة/المجاراة
                  fetch(`/api/game/${gameState.id}/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: gameState.currentBet === 0 ? "check" : "call" })
                  })
                  .then(response => response.json())
                  .then(data => console.log("نتيجة المتابعة/المجاراة:", data))
                  .catch(err => console.error("خطأ في المتابعة/المجاراة:", err));
                }}
              >
                اختبار {gameState.currentBet === 0 ? "متابعة" : "مجاراة"}
              </button>
              
              <button 
                className="px-2 py-1 bg-amber-500 text-white rounded text-xs"
                onClick={() => {
                  // إرسال طلب مباشر للزيادة
                  const amount = gameState.currentBet === 0 ? 20 : gameState.currentBet * 2;
                  fetch(`/api/game/${gameState.id}/action`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: "raise", amount })
                  })
                  .then(response => response.json())
                  .then(data => console.log("نتيجة الزيادة:", data))
                  .catch(err => console.error("خطأ في الزيادة:", err));
                }}
              >
                اختبار الزيادة
              </button>
            </div>
            <GameActions 
              currentBet={gameState.currentBet}
              minRaise={gameState.currentBet * 2}
              maxBet={100000} /* يجب استبدالها بالحد الأقصى المحدد */
              playerChips={positionedPlayers.find(p => p.isCurrentPlayer)?.chips || 0}
              isCurrentTurn={true} // تجاوز للاختبار - سنسمح بالتفاعل مع الأزرار دائمًا
              onAction={(action, amount) => {
                console.log("Current Turn:", gameState.currentTurn);
                console.log("Current Player ID:", positionedPlayers.find(p => p.isCurrentPlayer)?.id);
                console.log("Is Current Turn?", gameState.currentTurn === positionedPlayers.find(p => p.isCurrentPlayer)?.id);
                // إرسال طلب إجراء اللعب إلى الخادم
                console.log(`Sending action ${action} with amount ${amount}`);
                
                // تعيين معلومات آخر إجراء قام به اللاعب الحالي
                const currentPlayer = positionedPlayers.find(p => p.isCurrentPlayer);
                if (currentPlayer) {
                  setLastAction({
                    playerId: currentPlayer.id,
                    action,
                    amount
                  });
                  
                  // تشغيل مؤقت لإخفاء شارة الإجراء بعد 4 ثواني
                  setTimeout(() => {
                    setShowActionBadge(false);
                    // إعادة تفعيل عرض الشارة بعد 500 مللي ثانية للإجراء التالي
                    setTimeout(() => setShowActionBadge(true), 500);
                  }, 4000);
                }
                
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
              tableId={gameState.id}
              gameStatus={gameState.gameStatus}
            />
          </div>
        )}
        
        {/* زر بدء جولة جديدة - يظهر في الأعلى */}
        {(gameState.gameStatus === "showdown" || gameState.gameStatus === "waiting" || 
          positionedPlayers.some(p => p.isCurrentPlayer && p.folded)) && (
          <motion.div 
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button
              onClick={() => {
                console.log("محاولة بدء جولة جديدة...");
                // إجراء اللعب - استخدام performGameAction
                fetch(`/api/game/${gameState.id || gameState.tableId}/action`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ action: "restart_round" })
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('فشل في بدء جولة جديدة');
                  }
                  return response.json();
                })
                .then(data => {
                  toast({
                    title: "تم بدء جولة جديدة",
                    description: "استعد للعب!",
                    variant: "default",
                  });
                })
                .catch(error => {
                  console.error("خطأ في بدء الجولة:", error);
                  toast({
                    title: "خطأ في بدء جولة جديدة",
                    description: error.message,
                    variant: "destructive",
                  });
                  
                  // محاولة استخدام نقطة النهاية الاحتياطية
                  fetch(`/api/game/${gameState.id || gameState.tableId}/start-round`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('فشل في بدء جولة جديدة (طريقة احتياطية)');
                    }
                    return response.json();
                  })
                  .then(data => {
                    toast({
                      title: "تم بدء جولة جديدة",
                      description: "استعد للعب! (تم استخدام طريقة احتياطية)",
                      variant: "default",
                    });
                  })
                  .catch(backupError => {
                    console.error("فشل أيضًا في الطريقة الاحتياطية:", backupError);
                    toast({
                      title: "تعذر بدء جولة جديدة",
                      description: "حاول مرة أخرى لاحقًا",
                      variant: "destructive",
                    });
                  });
                });
              }}
              size="lg"
              className="bg-gradient-to-r from-gold to-amber-600 hover:from-gold/90 hover:to-amber-500 text-black font-bold px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:shadow-[0_0_20px_rgba(212,175,55,0.7)] transform hover:scale-105 transition-all duration-200 border-2 border-gold/50"
            >
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M12 5V19M12 5L18 11M12 5L6 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>بدء جولة جديدة</span>
              </div>
            </Button>
          </motion.div>
        )}
        
        {/* رسالة تنبيه في حالة الانسحاب من الجولة */}
        {positionedPlayers.find(p => p.isCurrentPlayer)?.folded && gameState.gameStatus !== "showdown" && (
          <motion.div 
            className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-red-500/30 text-sm">
              لقد انسحبت من هذه الجولة. انتظر الجولة القادمة للانضمام للعب مرة أخرى.
            </div>
          </motion.div>
        )}
      </div>
      
      {/* نافذة تعليمات اللعبة */}
      <GameInstructions showInstructions={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
