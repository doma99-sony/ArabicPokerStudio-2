import { useEffect, useState } from "react";
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
  
  // Positions for players based on their slot
  const playerPositions = [
    "bottom", // current user (0)
    "bottomRight", // position 1
    "right", // position 2
    "top", // position 3
    "left", // position 4
  ];
  
  // Define empty seat positions for a 5-player table
  const seatPositions = [
    { position: "bottom", className: "absolute bottom-2 left-1/2 transform -translate-x-1/2" },
    { position: "bottomRight", className: "absolute bottom-10 right-10" },
    { position: "right", className: "absolute right-3 top-1/2 transform -translate-y-1/2" },
    { position: "top", className: "absolute top-2 left-1/2 transform -translate-x-1/2" },
    { position: "left", className: "absolute left-3 top-1/2 transform -translate-y-1/2" }
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
  
  // Check if current user is already at the table
  const isUserPlaying = positionedPlayers.some(player => player.isCurrentPlayer);

  return (
    <div className="flex-grow relative my-6">
      <div 
        className="poker-table absolute inset-0 rounded-[40%] border-8 border-[#8B4513] overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: `url(${pokerTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Dealer button */}
        {gameState.gameStatus !== "waiting" && (
          <div className="absolute z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-gold shadow-lg" 
               style={{ 
                 bottom: '45%', 
                 right: '40%' 
               }}>
            D
          </div>
        )}
      
        {/* Community Cards */}
        <div className="absolute flex space-x-2 rtl:space-x-reverse z-20">
          {gameState.communityCards.map((card, index) => (
            <div
              key={`community-card-${index}`}
              className="card opacity-100 transition-opacity duration-500 ease-in-out"
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <CardComponent card={card} size="lg" />
            </div>
          ))}
          
          {/* Empty card placeholders */}
          {gameState.gameStatus !== "waiting" && Array.from({ length: 5 - gameState.communityCards.length }).map((_, index) => (
            <div key={`empty-card-${index}`} className="w-14 h-20 bg-white/10 rounded-md shadow-lg"></div>
          ))}
        </div>
        
        {/* Pot */}
        {gameState.pot > 0 && (
          <div className="absolute top-1/3 mt-24 bg-slate/60 rounded-full px-4 py-1 text-center z-10">
            <span className="text-gold text-sm font-tajawal">المراهنة الكلية</span>
            <Chips amount={gameState.pot} />
            <span className="block text-white text-lg font-roboto">{gameState.pot.toLocaleString()}</span>
          </div>
        )}
        
        {/* Players */}
        {positionedPlayers.map(player => (
          <PlayerComponent 
            key={player.id} 
            player={player} 
            isTurn={gameState.currentTurn === player.id}
          />
        ))}
        
        {/* Empty seats with + sign */}
        {!isUserPlaying && emptySeats.map((seat, index) => (
          <div key={`empty-seat-${index}`} className={`${seat.className} z-10`}>
            <button
              onClick={() => handleJoinSeat(seat.position)}
              disabled={isJoining}
              className="w-14 h-14 bg-black/40 hover:bg-gold/40 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110"
            >
              <Plus className="w-8 h-8 text-white" />
              <span className="sr-only">الانضمام إلى المقعد</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
