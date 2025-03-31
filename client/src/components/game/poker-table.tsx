import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameState } from "@/types";
import { PlayerComponent } from "./player-component";
import { CardComponent } from "./card-component";
import { Chips } from "./chips";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import pokerTableBg from "@assets/gradient-poker-table-background_23-2151085419 (1).jpg";

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  
  // Positions for players based on their slot - updated for oval table layout
  const playerPositions = [
    "bottom", // current user (0)
    "bottomRight", // position 1
    "topRight", // position 2
    "topLeft", // position 3
    "bottomLeft", // position 4
  ];
  
  // Define empty seat positions for a 5-player table - updated for oval table layout
  const seatPositions = [
    { position: "bottom", className: "absolute bottom-4 left-1/2 transform -translate-x-1/2" },
    { position: "bottomRight", className: "absolute bottom-12 right-16" },
    { position: "topRight", className: "absolute top-12 right-20" },
    { position: "topLeft", className: "absolute top-12 left-20" },
    { position: "bottomLeft", className: "absolute bottom-12 left-16" }
  ];

  // Map game state players to positions
  const positionedPlayers = gameState.players.map((player) => ({
    ...player,
    position: playerPositions[gameState.players.findIndex(p => p.id === player.id) % 5] as any
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
      const res = await fetch(`/api/game/${gameState.id}/join`, {
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

  return (
    <div className="flex-grow relative my-6">
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
            BOYA POKER
          </div>
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1 rtl:space-x-reverse z-20">
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
              <CardComponent card={card} size="lg" />
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
        
        {/* Players */}
        {positionedPlayers.map(player => (
          <PlayerComponent 
            key={player.id} 
            player={player} 
            isTurn={gameState.currentTurn === player.id}
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

        {/* Table action buttons - shown based on game state */}
        {gameState.gameStatus !== "waiting" && isUserPlaying && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse z-40 mb-2">
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">
              تخلي
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700">
              كشف 1K
            </button>
            <button className="bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700">
              زيادة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
