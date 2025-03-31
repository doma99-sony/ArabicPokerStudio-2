import { PlayerPosition } from "@/types";
import { Image } from "@/components/ui/image";
import { CardComponent } from "./card-component";

interface PlayerComponentProps {
  player: PlayerPosition;
  isTurn: boolean;
}

export function PlayerComponent({ player, isTurn }: PlayerComponentProps) {
  // Position classes based on player position - adjusted for the new table layout
  const positionClasses: Record<string, string> = {
    bottom: "absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center",
    bottomRight: "absolute bottom-12 right-16 flex-col items-end",
    topRight: "absolute top-12 right-20 flex-col items-end",
    topLeft: "absolute top-12 left-20 flex-col items-start",
    bottomLeft: "absolute bottom-12 left-16 flex-col items-start"
  };

  // Calculate rotation for cards based on position
  const cardRotations: Record<string, number[]> = {
    bottom: [10, -10],
    bottomRight: [5, -5],
    topRight: [5, -5],
    topLeft: [-5, 5],
    bottomLeft: [-5, 5]
  };

  // Determine card visibility based on if it's the current player or showdown
  const showCards = player.isCurrentPlayer || player.cards?.every(c => !c.hidden);

  return (
    <div className={`flex ${positionClasses[player.position]} z-30`}>
      {/* Player status indicators - top of player area */}
      <div className="flex flex-col items-center mb-1">
        {/* Player's turn indicator */}
        {isTurn && (
          <div className="bg-blue-600/80 rounded-full px-3 py-1 text-white mb-1.5 shadow-lg">
            <span className="text-sm font-bold">
              {player.isCurrentPlayer ? "دورك للعب" : "جاري اللعب..."}
            </span>
          </div>
        )}
        
        {/* Folded indicator */}
        {player.folded && (
          <div className="mb-1.5 bg-red-600/80 rounded-full px-3 py-1 text-white text-sm font-bold shadow-lg">
            تخلى
          </div>
        )}
      </div>
      
      {/* Display player's cards if they have them */}
      {player.cards && (
        <div className="flex flex-col items-center mb-2">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {player.cards.map((card, index) => (
              <div
                key={`player-card-${index}`}
                className="card transform"
                style={{ 
                  transform: `rotate(${cardRotations[player.position][index]}deg)`,
                  marginLeft: index === 0 ? '-5px' : '0',
                  marginRight: index === 1 ? '-5px' : '0',
                  position: 'relative',
                  zIndex: 20 + index
                }}
              >
                <CardComponent 
                  card={showCards ? card : { ...card, hidden: true }} 
                  size="sm" 
                />
              </div>
            ))}
          </div>
          
          {/* Player's bet amount if any - shown below cards */}
          {player.betAmount && player.betAmount > 0 && (
            <div className="mt-2 relative">
              {/* Chip visualization */}
              <div className="w-10 h-10 bg-red-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs z-20">
                {Math.floor((player.betAmount || 0) / 1000)}K
              </div>
              
              {/* Exact bet amount */}
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black/60 rounded-full px-2 py-0.5 text-white text-xs min-w-[40px] text-center">
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
          <span className="block text-gold text-xs">
            {player.chips.toLocaleString()}
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
