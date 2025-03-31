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
      <div className={`${sizeClasses[size]} bg-slate-400/20 rounded-md shadow-lg overflow-hidden`}>
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 text-gold/80">
            <path
              fill="currentColor"
              d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z"
            />
          </svg>
        </div>
      </div>
    );
  }
  
  // Get card display values
  const { value, suit } = getCardDisplayValue(card);
  const suitColor = getSuitColor(card.suit);
  
  return (
    <div className={`${sizeClasses[size]} bg-white rounded-md shadow-lg overflow-hidden flex flex-col hover:translate-y-[-5px] hover:rotate-[5deg] transition-transform duration-200`}>
      <div className="flex flex-col items-center justify-center h-full relative">
        {/* Top left value and suit */}
        <div className={`absolute top-1 left-1 ${fontSizeClasses[size]} font-bold ${suitColor}`}>
          {value}
        </div>
        <div className={`absolute top-4 left-1 ${fontSizeClasses[size]} ${suitColor}`}>
          {suit}
        </div>
        
        {/* Center suit (larger) */}
        <div className={`text-2xl ${suitColor}`}>
          {suit}
        </div>
        
        {/* Bottom right value and suit (inverted) */}
        <div className={`absolute bottom-1 right-1 ${fontSizeClasses[size]} font-bold ${suitColor} transform rotate-180`}>
          {value}
        </div>
        <div className={`absolute bottom-4 right-1 ${fontSizeClasses[size]} ${suitColor} transform rotate-180`}>
          {suit}
        </div>
      </div>
    </div>
  );
}
