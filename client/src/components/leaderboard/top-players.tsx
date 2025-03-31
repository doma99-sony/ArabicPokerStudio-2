
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface TopPlayer {
  username: string;
  points: number;
  rank: number;
}

export function TopPlayers() {
  const { data: topPlayers } = useQuery<TopPlayer[]>({
    queryKey: ["topPlayers"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard/top");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-64 bg-gradient-to-br from-[#2C1810] to-[#1A0F09] rounded-2xl border-2 border-[#D4AF37] shadow-xl backdrop-blur-sm">
      <div className="p-4">
        <h3 className="text-[#D4AF37] text-xl font-bold text-center mb-4 font-cairo">أفضل اللاعبين</h3>
        <div className="space-y-3">
          {topPlayers?.slice(0, 3).map((player, index) => (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-[#D4AF37]/20"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37] font-bold w-6">{index + 1}</span>
                <span className="text-white font-cairo">{player.username}</span>
              </div>
              <span className="text-[#D4AF37] font-bold">{player.points.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
