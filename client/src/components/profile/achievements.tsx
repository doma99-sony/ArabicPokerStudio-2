import { useState } from "react";
import { motion } from "framer-motion";
import { Achievement } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementsProps {
  achievements: Achievement[];
}

export function Achievements({ achievements }: AchievementsProps) {
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);

  return (
    <div className="mt-6 bg-slate/20 rounded-lg p-3">
      <h4 className="text-gold font-bold mb-3 font-cairo">الإنجازات</h4>
      
      <div className="flex flex-wrap justify-between">
        {achievements.map((achievement) => (
          <TooltipProvider key={achievement.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div 
                  className="flex flex-col items-center mb-3 w-1/2"
                  whileHover={{ scale: 1.1 }}
                  onHoverStart={() => setHoveredAchievement(achievement.id)}
                  onHoverEnd={() => setHoveredAchievement(null)}
                >
                  <motion.div 
                    className={`w-10 h-10 ${achievement.unlocked ? "bg-gold/20" : "bg-slate/40"} rounded-full flex items-center justify-center mb-1`}
                    animate={
                      hoveredAchievement === achievement.id && achievement.unlocked
                        ? { 
                            boxShadow: ["0 0 0 0 rgba(212, 175, 55, 0.7)", "0 0 0 8px rgba(212, 175, 55, 0)", "0 0 0 0 rgba(212, 175, 55, 0)"],
                          }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <i className={`fas ${achievement.icon} ${achievement.unlocked ? "text-gold" : "text-gray-500"}`}></i>
                  </motion.div>
                  <span className={`${achievement.unlocked ? "text-white" : "text-gray-400"} text-xs text-center font-tajawal`}>
                    {achievement.name}
                  </span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{achievement.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
