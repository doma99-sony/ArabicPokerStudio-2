import { motion } from "framer-motion";
import { PlayerPosition } from "@/types";
import { Image } from "@/components/ui/image";
import { CardComponent } from "./card-component";

interface PlayerComponentProps {
  player: PlayerPosition;
  isTurn: boolean;
}

export function PlayerComponent({ player, isTurn }: PlayerComponentProps) {
  // Position classes based on player position
  const positionClasses = {
    bottom: "absolute bottom-2 left-1/2 transform -translate-x-1/2",
    bottomRight: "absolute bottom-10 right-10",
    right: "absolute right-3 top-1/2 transform -translate-y-1/2",
    top: "absolute top-2 left-1/2 transform -translate-x-1/2",
    left: "absolute left-3 top-1/2 transform -translate-y-1/2"
  };

  // Determine card visibility based on if it's the current player or showdown
  const showCards = player.isCurrentPlayer || player.cards?.every(c => !c.hidden);
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };
  
  const pulseAnimation = isTurn ? {
    animate: {
      boxShadow: ["0 0 0 0 rgba(212, 175, 55, 0.7)", "0 0 0 10px rgba(212, 175, 55, 0)", "0 0 0 0 rgba(212, 175, 55, 0)"],
      transition: { duration: 2, repeat: Infinity }
    }
  } : {};

  return (
    <motion.div 
      className={`flex flex-col items-center ${positionClasses[player.position]}`}
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* Display player's cards if they have them */}
      {player.cards && (
        <div className="flex flex-col items-center mb-2">
          <div className="flex space-x-1 rtl:space-x-reverse mb-2">
            {player.cards.map((card, index) => (
              <motion.div
                key={`player-card-${index}`}
                className="card"
                animate={index === 0 ? { rotate: -5 } : { rotate: 5 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <CardComponent 
                  card={showCards ? card : { ...card, hidden: true }} 
                  size="sm" 
                />
              </motion.div>
            ))}
          </div>
          
          {/* Player's turn indicator */}
          {isTurn && (
            <motion.div 
              className="bg-slate/60 rounded-full px-3 py-0.5 text-white"
              animate="animate"
              variants={pulseAnimation}
            >
              <span className="text-sm font-cairo">
                {player.isCurrentPlayer ? "دورك للعب" : "دور اللاعب"}
              </span>
            </motion.div>
          )}
          
          {/* Player's bet amount if any */}
          {player.betAmount && player.betAmount > 0 && (
            <div className="bg-deepBlack/60 rounded-full px-2 py-0.5 text-gold text-xs font-roboto mt-1">
              {player.betAmount.toLocaleString()}
            </div>
          )}
        </div>
      )}
      
      {/* Player avatar and info */}
      <div className="flex items-center">
        <div className={`w-${player.isCurrentPlayer ? "10" : "8"} h-${player.isCurrentPlayer ? "10" : "8"} ${player.isCurrentPlayer ? "bg-gold" : "bg-slate"} rounded-full overflow-hidden border-2 ${player.isCurrentPlayer ? "border-white" : "border-white/50"}`}>
          <Image 
            src={player.avatar} 
            alt={player.username} 
            className="w-full h-full object-cover"
            fallback="https://via.placeholder.com/150?text=User"
          />
        </div>
        <div className="mr-2 text-center">
          <span className={`block text-white ${player.isCurrentPlayer ? "text-sm" : "text-xs"} font-tajawal`}>
            {player.isCurrentPlayer ? "أنت" : player.username}
          </span>
          <span className={`block text-gold ${player.isCurrentPlayer ? "" : "text-xs"} font-roboto`}>
            {player.chips.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Folded indicator */}
      {player.folded && (
        <div className="mt-1 bg-casinoRed/70 rounded-full px-2 py-0.5 text-white text-xs font-tajawal">
          طوى
        </div>
      )}
    </motion.div>
  );
}
