
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";

interface TopPlayer {
  username: string;
  points: number;
  rank: number;
}

export function TopPlayers() {
  const { data: topPlayers } = useQuery<TopPlayer[]>({
    queryKey: ["topPlayers"],
    queryFn: async () => {
      // Temporary mock data - replace with actual API call
      return [
        { username: "الملك", points: 1000000, rank: 1 },
        { username: "المحارب", points: 750000, rank: 2 },
        { username: "الفارس", points: 500000, rank: 3 },
      ];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-72">
      <div className="bg-gradient-to-br from-[#2C1810] to-[#1A0F09] rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] backdrop-blur-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-[#D4AF37]" />
            <h3 className="text-[#D4AF37] text-xl font-bold text-center font-cairo">أفضل اللاعبين</h3>
          </div>
          <div className="space-y-4">
            {topPlayers?.map((player, index) => (
              <motion.div
                key={player.username}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center justify-between ${
                  index === 0 ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5' : 'bg-black/30'
                } rounded-lg p-4 border border-[#D4AF37]/20`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${
                    index === 0 ? 'text-[#D4AF37]' : index === 1 ? 'text-gray-300' : 'text-[#CD7F32]'
                  } font-bold text-2xl font-roboto`}>
                    {index + 1}
                  </span>
                  <span className="text-white font-cairo">{player.username}</span>
                </div>
                <span className="text-[#D4AF37] font-bold font-roboto">{player.points.toLocaleString()}</span>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1">
                    <Trophy className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
