import { PlayerStats } from "@/types";

interface StatsPanelProps {
  stats: PlayerStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const statItems = [
    {
      label: "المباريات",
      value: stats.gamesPlayed.toString(),
      valueClass: "text-white"
    },
    {
      label: "الفوز",
      value: stats.wins.toString(),
      valueClass: "text-gold"
    },
    {
      label: "أعلى ربح",
      value: stats.highestWin.toLocaleString(),
      valueClass: "text-green-500"
    },
    {
      label: "نسبة الفوز",
      value: `${stats.winRate}%`,
      valueClass: "text-white"
    }
  ];

  return (
    <div className="bg-deepBlack p-4 rounded-lg border border-gold/20 mb-6">
      <h3 className="text-xl font-bold text-gold mb-4 font-cairo">إحصائيات اللاعب</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, index) => (
          <div key={`stat-${index}`} className="bg-slate/20 p-3 rounded-lg">
            <span className="block text-white/70 mb-1 text-sm font-tajawal">{item.label}</span>
            <span className={`block ${item.valueClass} text-2xl font-roboto`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
