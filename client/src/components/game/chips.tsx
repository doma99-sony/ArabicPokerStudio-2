import { motion } from "framer-motion";

interface ChipsProps {
  amount: number;
  size?: "sm" | "md" | "lg";
}

export function Chips({ amount, size = "md" }: ChipsProps) {
  // Define chip denominations and colors
  const chipTypes = [
    { value: 10000, color: "bg-slate-800" },
    { value: 5000, color: "bg-purple-700" },
    { value: 1000, color: "bg-blue-600" },
    { value: 500, color: "bg-green-600" },
    { value: 100, color: "bg-gold" },
    { value: 25, color: "bg-casinoRed" },
    { value: 5, color: "bg-slate-600" },
    { value: 1, color: "bg-slate-400" },
  ];
  
  // Calculate which chips to display based on amount
  let remaining = amount;
  const chipsToDisplay = chipTypes
    .map(chip => {
      const count = Math.floor(remaining / chip.value);
      remaining = remaining % chip.value;
      return { ...chip, count };
    })
    .filter(chip => chip.count > 0);

  // Limit to maximum 5 chips
  const limitedChips = chipsToDisplay.slice(0, 3);
  
  // Size classes
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  // If no chips, show a placeholder
  if (limitedChips.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center mt-1">
      {limitedChips.map((chip, index) => (
        <motion.div 
          key={`chip-${index}`}
          className={`chip ${sizeClasses[size]} rounded-full ${chip.color} border-2 border-white mx-0.5`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: { delay: index * 0.1, type: "spring", stiffness: 200 }
          }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          style={{ zIndex: limitedChips.length - index }}
        />
      ))}
      {/* Show "more" indicator if there are more chips */}
      {chipsToDisplay.length > 3 && (
        <div className={`${sizeClasses[size]} flex items-center justify-center text-white text-xs`}>+</div>
      )}
    </div>
  );
}
