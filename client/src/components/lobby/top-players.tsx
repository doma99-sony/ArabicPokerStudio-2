import { useState, useEffect } from "react";
import { formatChips } from "@/lib/utils";
import { Trophy, Medal, Crown } from "lucide-react";

// نوع بيانات اللاعب
interface Player {
  id: number;
  username: string;
  chips: number;
  avatar?: string;
}

// بيانات اللاعبين الافتراضية للعرض
const defaultTopPlayers: Player[] = [
  { id: 1, username: "فرعون مصر", chips: 9850000, avatar: "/assets/users/gold-player.png" },
  { id: 2, username: "ملك البوكر", chips: 7650000, avatar: "/assets/users/silver-player.png" },
  { id: 3, username: "صقر العرب", chips: 6430000, avatar: "/assets/users/bronze-player.png" }
];

export function TopPlayers() {
  const [topPlayers, setTopPlayers] = useState<Player[]>(defaultTopPlayers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // جلب أفضل اللاعبين عند تحميل المكون
  useEffect(() => {
    const fetchTopPlayers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/players/top");
        if (response.ok) {
          const data = await response.json();
          setTopPlayers(data.slice(0, 3)); // أخذ أفضل 3 لاعبين فقط
        } else {
          console.error("فشل في الحصول على قائمة أفضل اللاعبين");
          setError(new Error("فشل في الحصول على قائمة أفضل اللاعبين"));
          // استخدام البيانات الافتراضية في حالة الفشل
          setTopPlayers(defaultTopPlayers);
        }
      } catch (err) {
        console.error("خطأ أثناء جلب قائمة أفضل اللاعبين", err);
        setError(err instanceof Error ? err : new Error("خطأ غير معروف"));
        // استخدام البيانات الافتراضية في حالة حدوث خطأ
        setTopPlayers(defaultTopPlayers);
      } finally {
        setIsLoading(false);
      }
    };

    // جلب البيانات عند تحميل المكون
    fetchTopPlayers();

    // إعادة تحميل البيانات كل 5 دقائق
    const intervalId = setInterval(fetchTopPlayers, 5 * 60 * 1000);
    
    // تنظيف المؤقت عند تفكيك المكون
    return () => clearInterval(intervalId);
  }, []);

  // تصميم أيقونات المراكز
  const renderRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-[#FFD700] ml-1" />; // المركز الأول - ذهبي
      case 1:
        return <Medal className="h-5 w-5 text-[#C0C0C0] ml-1" />; // المركز الثاني - فضي
      case 2:
        return <Medal className="h-5 w-5 text-[#CD7F32] ml-1" />; // المركز الثالث - برونزي
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#0A3A2A]/90 to-black/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center mb-4 border-b border-[#D4AF37]/20 pb-2">
        <Crown className="h-5 w-5 text-[#D4AF37] ml-2" />
        <h3 className="text-[#D4AF37] font-bold text-lg">أفضل اللاعبين</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">حدث خطأ أثناء تحميل البيانات</div>
      ) : (
        <div className="space-y-3">
          {topPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center p-2 bg-black/20 rounded-lg border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37]/50">
                  <img 
                    src={player.avatar || "/assets/poker-icon-gold.png"} 
                    alt={player.username} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#0A3A2A] to-black rounded-full flex items-center justify-center border border-[#D4AF37]/30">
                  <span className="text-[#D4AF37] text-[10px] font-bold">{index + 1}</span>
                </div>
              </div>
              <div className="mr-3 flex-1">
                <div className="flex items-center">
                  {renderRankIcon(index)}
                  <span className="text-white font-semibold text-sm truncate">{player.username}</span>
                </div>
                <div className="flex items-center mt-1 bg-[#0A3A2A]/50 px-2 py-0.5 rounded-full w-fit">
                  <span className="text-[#D4AF37] text-xs font-bold">{formatChips(player.chips)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}