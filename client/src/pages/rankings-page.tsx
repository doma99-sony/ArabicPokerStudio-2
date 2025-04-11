import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Medal, Clock, Search, X, Coins, Users, Lock, Unlock, Home, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatChips } from "@/lib/format-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

interface Player {
  id: number;
  username: string;
  chips: number;
  avatar: string | null;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    // جلب حالة القفل من التخزين المحلي
    const savedLockState = localStorage.getItem('rankingsLocked');
    return savedLockState === 'true';
  });
  
  // جلب بيانات أفضل 100 لاعب
  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/rankings/top100');
        
        if (!response.ok) {
          throw new Error('فشل في جلب قائمة أفضل اللاعبين');
        }
        
        const data = await response.json();
        setPlayers(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('خطأ في جلب قائمة اللاعبين:', error);
        toast({
          title: "خطأ في التحميل",
          description: "تعذر تحميل قائمة اللاعبين. يرجى المحاولة مرة أخرى لاحقاً.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopPlayers();
    
    // تحديث القائمة كل 5 دقائق
    const interval = setInterval(fetchTopPlayers, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // فلترة اللاعبين حسب البحث
  const filteredPlayers = players.filter(player => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // التحقق من وجود اللاعب الحالي في القائمة
  const currentUserRank = user ? players.findIndex(player => player.id === user.id) + 1 : -1;
  
  // دالة لتغيير حالة قفل صفحة الترتيب
  const toggleLockRankings = () => {
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);
    localStorage.setItem('rankingsLocked', newLockedState ? 'true' : 'false');
    
    toast({
      title: newLockedState ? "تم قفل صفحة الترتيب" : "تم فتح قفل صفحة الترتيب",
      description: newLockedState 
        ? "لن يتم تحديث الترتيب إلا عند فتح القفل" 
        : "سيتم تحديث الترتيب تلقائياً كل 5 دقائق",
      variant: "default",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0A3A2A] text-white">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-md border-b border-[#D4AF37]/30 p-4 fixed top-0 left-0 w-full z-30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all mr-3
                bg-gradient-to-r from-[#D4AF37] to-[#8B6914] text-white border border-[#D4AF37] hover:opacity-90"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للوبي</span>
            </button>
            
            <h1 className="text-[#D4AF37] text-2xl font-bold flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-[#D4AF37]" />
              ترتيب اللاعبين
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
              onClick={toggleLockRankings}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${isLocked 
                  ? 'bg-gradient-to-r from-[#D4AF37]/80 to-[#8B6914]/80 text-white border border-[#D4AF37]/50' 
                  : 'bg-gradient-to-r from-[#0A3A2A] to-[#062922] text-[#D4AF37] border border-[#D4AF37]/50'
                }
              `}
            >
              {isLocked ? (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>فتح القفل</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>قفل الترتيب</span>
                </>
              )}
            </button>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-400 ml-2">آخر تحديث:</span>
              <span className="text-sm text-gray-300" dir="ltr">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto pt-24 pb-20 px-4">
        {/* User's current rank */}
        {user && currentUserRank > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-[#0A3A2A]/80 via-black/80 to-[#0A3A2A]/80 rounded-xl border border-[#D4AF37] p-4 shadow-lg">
              <h2 className="text-lg font-bold mb-2 text-[#D4AF37]">ترتيبك الحالي</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]">
                      <img 
                        src={user.avatar || "/assets/poker-icon-gold.png"} 
                        alt={user.username} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black bg-[#D4AF37]">
                      {currentUserRank}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{user.username}</p>
                    <div className="flex items-center mt-1">
                      <Coins className="h-4 w-4 text-[#D4AF37] ml-1" />
                      <span className="text-[#D4AF37] font-bold">{formatChips(user.chips)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 px-4 py-2 rounded-lg">
                  <p className="text-[#D4AF37] font-bold">المركز #{currentUserRank} من أصل {players.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Box */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="البحث عن لاعب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/50 border-[#D4AF37]/30 placeholder-gray-500 py-6 pr-10 text-white"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 left-0 flex items-center pl-3"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          )}
        </div>
        
        {/* Players List */}
        <div className="bg-gradient-to-r from-[#0A3A2A]/80 via-black/80 to-[#0A3A2A]/80 rounded-xl border border-[#D4AF37]/30 overflow-hidden shadow-lg">
          <div className="p-4 bg-black/30 border-b border-[#D4AF37]/20 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Users className="h-5 w-5 ml-2 text-[#D4AF37]" />
              أفضل اللاعبين
            </h2>
            <div className="text-sm text-gray-400">
              {filteredPlayers.length} لاعب
            </div>
          </div>
          
          {isLoading ? (
            // Skeleton loading state
            <div className="divide-y divide-[#D4AF37]/10">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="p-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filteredPlayers.length > 0 ? (
            <div className="divide-y divide-[#D4AF37]/10">
              {filteredPlayers.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`p-4 hover:bg-black/40 transition-colors ${
                    player.id === user?.id ? 'bg-[#D4AF37]/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                        index === 0 ? 'border-yellow-500' : 
                        index === 1 ? 'border-gray-300' : 
                        index === 2 ? 'border-yellow-700' : 
                        'border-[#D4AF37]/30'
                      }`}>
                        <img 
                          src={player.avatar || "/assets/poker-icon-gold.png"} 
                          alt={player.username} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-300' : 
                        index === 2 ? 'bg-yellow-700' : 
                        'bg-[#D4AF37]/70'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-bold ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-yellow-700' : 
                        'text-white'
                      }`}>
                        {player.username}
                        {player.id === user?.id && (
                          <span className="text-[#D4AF37] text-xs mr-2">(أنت)</span>
                        )}
                      </p>
                      <div className="flex items-center">
                        <Coins className="h-3.5 w-3.5 text-[#D4AF37] ml-1" />
                        <span className="text-[#D4AF37] text-sm font-medium">
                          {formatChips(player.chips)}
                        </span>
                      </div>
                    </div>
                    
                    {index < 3 && (
                      <div className={`flex items-center px-3 py-1 rounded-full ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        index === 1 ? 'bg-gray-300/20 text-gray-300' : 
                        'bg-yellow-700/20 text-yellow-700'
                      }`}>
                        {index === 0 ? (
                          <>
                            <Trophy className="h-4 w-4 ml-1" />
                            <span className="text-sm font-medium">المركز الأول</span>
                          </>
                        ) : index === 1 ? (
                          <>
                            <Medal className="h-4 w-4 ml-1" />
                            <span className="text-sm font-medium">المركز الثاني</span>
                          </>
                        ) : (
                          <>
                            <Medal className="h-4 w-4 ml-1" />
                            <span className="text-sm font-medium">المركز الثالث</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">لا توجد نتائج للبحث عن "{searchQuery}"</p>
            </div>
          )}
          
          {!isLoading && filteredPlayers.length > 0 && (
            <div className="p-3 bg-black/30 border-t border-[#D4AF37]/20 text-center text-gray-400 text-sm">
              يتم تحديث القائمة تلقائياً كل 5 دقائق
            </div>
          )}
        </div>
      </main>
    </div>
  );
}