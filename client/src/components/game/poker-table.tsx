import { useEffect } from "react";
import { motion } from "framer-motion";
import { GameState } from "@/types";
import { PlayerComponent } from "./player-component";
import { CardComponent } from "./card-component";
import { Chips } from "./chips";

interface PokerTableProps {
  gameState: GameState;
}

export function PokerTable({ gameState }: PokerTableProps) {
  // Positions for players based on their slot
  const playerPositions = [
    "bottom", // current user (0)
    "bottomRight", // position 1
    "right", // position 2
    "top", // position 3
    "left", // position 4
  ];

  // Map game state players to positions
  const positionedPlayers = gameState.players.map((player) => ({
    ...player,
    position: playerPositions[gameState.players.findIndex(p => p.id === player.id) % 5] as any
  }));

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

  return (
    <div className="flex-grow relative">
      <div 
        className="poker-table absolute inset-0 rounded-full lg:rounded-[40%] border-8 border-slate overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(ellipse at center, #1B4D3E 0%, #0e2920 100%)" }}
      >
        {/* Community Cards */}
        <div className="absolute flex space-x-2 rtl:space-x-reverse">
          {gameState.communityCards.map((card, index) => (
            <motion.div
              key={`community-card-${index}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="card"
            >
              <CardComponent card={card} size="lg" />
            </motion.div>
          ))}
          
          {/* Empty card placeholders */}
          {Array.from({ length: 5 - gameState.communityCards.length }).map((_, index) => (
            <div key={`empty-card-${index}`} className="w-14 h-20 bg-white/10 rounded-md shadow-lg"></div>
          ))}
        </div>
        
        {/* Pot */}
        <div className="absolute top-1/3 mt-24 bg-slate/40 rounded-full px-4 py-1 text-center">
          <span className="text-gold text-sm font-tajawal">المراهنة الكلية</span>
          <Chips amount={gameState.pot} />
          <span className="block text-white text-lg font-roboto">{gameState.pot.toLocaleString()}</span>
        </div>
        
        {/* Players */}
        {positionedPlayers.map(player => (
          <PlayerComponent 
            key={player.id} 
            player={player} 
            isTurn={gameState.currentTurn === player.id}
          />
        ))}
      </div>
    </div>
  );
}
