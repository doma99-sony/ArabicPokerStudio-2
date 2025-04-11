import React from 'react';
import { Button } from "@/components/ui/button";

// واجهة بيانات اللاعب الموسعة
interface PlayerStats {
  domino: {
    gamesPlayed: number;
    wins: number;
    winRate: number;
  };
  poker: {
    gamesPlayed: number;
    wins: number;
    winRate: number;
  };
  americanPoker: {
    gamesPlayed: number;
    wins: number;
    winRate: number;
  };
}

interface PlayerData {
  id: number;
  username: string;
  avatar?: string;
  level: number;
  rank: string;
  vip: boolean;
  vipLevel?: number;
  chips: number;
  diamonds: number;
  tickets: number;
  status?: string;
  stats: PlayerStats;
}

interface PlayerInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerData;
}

// مكون النافذة المنبثقة لبيانات اللاعب
const PlayerInfoPopup: React.FC<PlayerInfoPopupProps> = ({ isOpen, onClose, player }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" dir="rtl">
      <div className="relative w-full max-w-2xl">
        {/* الإطار الخارجي */}
        <div 
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #d0a85c, #f1dbb3, #f8e9c9)"
          }}
        >
          {/* الرأس */}
          <div 
            className="relative py-3 px-6 text-center"
            style={{
              background: "linear-gradient(to right, #9a602b, #d0a85c, #9a602b)",
              borderBottom: "2px solid #8a5020"
            }}
          >
            <h2 className="text-2xl font-bold text-yellow-300 drop-shadow-md">بيانات اللاعب</h2>
            
            {/* زر الإغلاق */}
            <button 
              onClick={onClose} 
              className="absolute right-3 top-3 text-yellow-200 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="p-4 flex">
            {/* القسم الأيمن - الشارات والإحصائيات */}
            <div className="w-3/4 px-3">
              {/* شارات الرتبة والمستوى */}
              <div className="flex justify-center gap-8 mb-6 mt-2">
                <div className="text-center">
                  <div className="w-20 h-20 bg-contain bg-center bg-no-repeat mx-auto"
                    style={{
                      backgroundImage: `url('/images/rank-badge.png')`,
                      backgroundSize: '100% 100%'
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-amber-600 font-bold">RANK</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-contain bg-center bg-no-repeat mx-auto"
                    style={{
                      backgroundImage: `url('/images/vip-badge.png')`,
                      backgroundSize: '100% 100%'
                    }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-amber-600 font-bold">VIP</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* إحصائيات اللعب */}
              <div className="space-y-3">
                {/* دومينو */}
                <div 
                  className="rounded-lg p-3"
                  style={{
                    background: "linear-gradient(to right, #f8e9c9, #f1dbb3, #f8e9c9)",
                    border: "1px solid #d0a85c"
                  }}
                >
                  <div className="text-center text-amber-800 font-bold mb-1">دومينو شامية 1 مقابل 1</div>
                  <div className="flex justify-between px-4">
                    <div className="text-center">
                      <div className="text-sm text-amber-700">مجموع نقاط الفوز</div>
                      <div className="font-bold text-amber-900">{player.stats.domino.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">عدد المنافسات</div>
                      <div className="font-bold text-amber-900">{player.stats.domino.gamesPlayed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">معدل الانتصارات</div>
                      <div className="font-bold text-amber-900">{player.stats.domino.winRate}%</div>
                    </div>
                  </div>
                </div>
                
                {/* بوكر تكساس */}
                <div 
                  className="rounded-lg p-3"
                  style={{
                    background: "linear-gradient(to right, #f8e9c9, #f1dbb3, #f8e9c9)",
                    border: "1px solid #d0a85c"
                  }}
                >
                  <div className="text-center text-amber-800 font-bold mb-1">تكساس هولدم 9 لاعبين</div>
                  <div className="flex justify-between px-4">
                    <div className="text-center">
                      <div className="text-sm text-amber-700">مجموع نقاط الفوز</div>
                      <div className="font-bold text-amber-900">{player.stats.poker.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">عدد المنافسات</div>
                      <div className="font-bold text-amber-900">{player.stats.poker.gamesPlayed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">معدل الانتصارات</div>
                      <div className="font-bold text-amber-900">{player.stats.poker.winRate}%</div>
                    </div>
                  </div>
                </div>
                
                {/* امريكان بوكر */}
                <div 
                  className="rounded-lg p-3"
                  style={{
                    background: "linear-gradient(to right, #f8e9c9, #f1dbb3, #f8e9c9)",
                    border: "1px solid #d0a85c"
                  }}
                >
                  <div className="text-center text-amber-800 font-bold mb-1">دومينو امريكان 1 مقابل 1</div>
                  <div className="flex justify-between px-4">
                    <div className="text-center">
                      <div className="text-sm text-amber-700">مجموع نقاط الفوز</div>
                      <div className="font-bold text-amber-900">{player.stats.americanPoker.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">عدد المنافسات</div>
                      <div className="font-bold text-amber-900">{player.stats.americanPoker.gamesPlayed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-amber-700">معدل الانتصارات</div>
                      <div className="font-bold text-amber-900">{player.stats.americanPoker.winRate}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* القسم الأيسر - معلومات اللاعب */}
            <div className="w-1/4 px-3">
              <div 
                className="rounded-lg p-4"
                style={{
                  background: "linear-gradient(to bottom, #e9a165, #d18b56)",
                  border: "1px solid #b87747"
                }}
              >
                {/* صورة اللاعب مع المستوى */}
                <div className="relative mb-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-200">
                    {player.avatar ? (
                      <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-amber-800 flex items-center justify-center">
                        <span className="text-2xl font-bold text-amber-200">{player.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-800 border-2 border-amber-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-200">{player.level}</span>
                  </div>
                </div>
                
                {/* معرف وبيانات اللاعب */}
                <div className="space-y-2 text-center">
                  <div>
                    <div className="text-sm text-amber-200">ID:</div>
                    <div className="font-bold text-white">{player.id}</div>
                  </div>
                  
                  {/* أزرار التواصل */}
                  <div className="flex justify-center gap-2 my-2">
                    <button className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs">📞</span>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">🔍</span>
                    </button>
                  </div>
                  
                  {/* اسم اللاعب */}
                  <div className="font-bold text-amber-100">{player.username}</div>
                  
                  {/* العملات */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-100 font-bold">{player.chips.toLocaleString()}</span>
                    <span className="text-yellow-400">🪙</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-100 font-bold">{player.diamonds.toLocaleString()}</span>
                    <span className="text-blue-400">💎</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-amber-100 font-bold">{player.tickets.toLocaleString()}</span>
                    <span className="text-green-400">🎫</span>
                  </div>
                  
                  {/* الحالة الخاصة */}
                  <div>
                    <div className="text-sm text-amber-200 mt-3">الحالة الخاصة</div>
                    <div className="font-bold text-white">{player.status || "فلسطين حرة"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoPopup;