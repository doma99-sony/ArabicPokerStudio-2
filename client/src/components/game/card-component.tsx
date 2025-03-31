import { motion } from "framer-motion";
import { Card } from "@/types";
import { getSuitColor, getCardDisplayValue } from "@/lib/card-utils";

interface CardComponentProps {
  card: Card;
  size?: "sm" | "md" | "lg";
}

export function CardComponent({ card, size = "md" }: CardComponentProps) {
  // Size classes
  const sizeClasses = {
    sm: "w-10 h-14",
    md: "w-12 h-16",
    lg: "w-14 h-20",
  };
  
  // Font size classes
  const fontSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  // If card is hidden, show the back of the card
  if (card.hidden) {
    return (
      <div className={`${sizeClasses[size]} bg-white rounded-md shadow-lg overflow-hidden`}>
        <div className="w-full h-full bg-blue-800 flex flex-col items-center justify-center">
          {/* Card back pattern */}
          <div className="w-full h-full absolute flex items-center justify-center opacity-80">
            <div className="w-[80%] h-[80%] rounded-lg border-2 border-white/30"></div>
          </div>
          
          {/* Diamond pattern */}
          <div className="relative w-3/4 h-3/4 flex items-center justify-center">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
              {[...Array(9)].map((_, i) => (
                <div key={`diamond-${i}`} className="flex items-center justify-center">
                  <div className="text-gold text-xs transform rotate-45">♦</div>
                </div>
              ))}
            </div>
            
            {/* Center logo */}
            <div className="bg-gold/20 rounded-full w-8 h-8 flex items-center justify-center">
              <div className="text-gold text-lg">♠</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get card display values
  const { value, suit } = getCardDisplayValue(card);
  const suitColor = getSuitColor(card.suit);
  
  return (
    <motion.div
      className={`${sizeClasses[size]} bg-white rounded-md shadow-lg overflow-hidden flex flex-col`}
      whileHover={{ y: -5, rotate: 5, transition: { duration: 0.2 } }}
    >
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Card background with a subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        
        {/* Top left value and suit */}
        <div className={`absolute top-1 left-1 ${fontSizeClasses[size]} font-bold ${suitColor}`}>
          {value}
        </div>
        <div className={`absolute top-4 left-1 ${fontSizeClasses[size]} ${suitColor}`}>
          {suit}
        </div>
        
        {/* Center suit (larger) with decorative elements */}
        <div className="relative z-10">
          <div className={`text-3xl ${suitColor}`} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}>
            {suit}
          </div>
          
          {/* Decorative accent around the center suit */}
          <div className="absolute inset-0 -z-10 opacity-10 transform scale-150">
            <div className={`text-4xl ${suitColor}`}>
              {suit}
            </div>
          </div>
        </div>
        
        {/* Bottom right value and suit (inverted) */}
        <div className={`absolute bottom-1 right-1 ${fontSizeClasses[size]} font-bold ${suitColor} transform rotate-180`}>
          {value}
        </div>
        <div className={`absolute bottom-4 right-1 ${fontSizeClasses[size]} ${suitColor} transform rotate-180`}>
          {suit}
        </div>
      </div>
    </motion.div>
  );
}
