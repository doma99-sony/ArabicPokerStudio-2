import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameType } from "@/types";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronRight, Loader2 } from "lucide-react";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/auth';
      }
    });
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  // وظيفة للانتقال إلى صفحة الطاولات بناءً على نوع اللعبة
  const navigateToGameTables = (gameType: GameType) => {
    if (gameType === "poker") {
      navigate("/poker-tables");
    } else if (gameType === "naruto") {
      navigate("/naruto");
    }
    // ستتم إضافة المزيد من الألعاب لاحقًا
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-2 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#D4AF37]">بوكر تكساس عرباوي</h1>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[#D4AF37] text-sm">مرحباً، {user?.username}</p>
              <p className="text-white/80 text-xs">الرصيد: <span className="text-[#D4AF37] font-bold">{user?.chips?.toLocaleString()}</span></p>
            </div>

            <Button 
              variant="outline" 
              className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 py-0 px-2 text-xs"
              onClick={navigateToProfile}
            >
              <User size={14} className="ml-1" />
              الملف
            </Button>

            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8 py-0 px-2 text-xs"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin ml-1" />
              ) : (
                <LogOut size={14} className="ml-1" />
              )}
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 order-2 md:order-1">
            {/* Game Categories */}
            <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-3 backdrop-blur-sm mb-4">
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
                {/* بوكر عرباوي */}
                <div 
                  className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'poker' ? 'ring-2 ring-[#D4AF37]' : ''} border-[#D4AF37]/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                  onClick={() => {
                    setActiveGameCategory('poker');
                    navigateToGameTables('poker');
                  }}
                >
                  <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] flex-1 flex items-center justify-center">
                    <span className="text-[#D4AF37] text-4xl font-bold">♠️ ♥️</span>
                  </div>
                  <div className="p-2 bg-[#D4AF37]/10 border-t border-[#D4AF37]/30">
                    <h3 className="text-[#D4AF37] font-bold text-base">بوكر عرباوي</h3>
                  </div>
                  <button 
                    className="py-1.5 px-2 bg-[#D4AF37] text-[#0A0A0A] font-bold text-sm hover:bg-[#E5C04B] transition-colors flex items-center justify-center"
                    onClick={() => navigateToGameTables('poker')}
                  >
                    دخول طاولات البوكر
                    <ChevronRight className="mr-1 h-3 w-3" />
                  </button>
                </div>

                {/* نارتو */}
                <div 
                  className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : ''} border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                  onClick={() => {
                    setActiveGameCategory('naruto');
                    navigateToGameTables('naruto');
                  }}
                >
                  <div className="bg-gradient-to-br from-[#FF8C00] to-[#FF4500] flex-1 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">忍</span>
                  </div>
                  <div className="p-2 bg-orange-500/10 border-t border-orange-500/30">
                    <h3 className="text-orange-400 font-bold text-base">نارتو</h3>
                  </div>
                  <button 
                    className="py-1.5 px-2 bg-orange-500 text-white font-bold text-sm hover:bg-orange-400 transition-colors flex items-center justify-center"
                    onClick={() => navigateToGameTables('naruto')}
                  >
                    دخول عالم نارتو
                    <ChevronRight className="mr-1 h-3 w-3" />
                  </button>
                </div>

                {/* تيكن */}
                <div 
                  className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : ''} border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                  onClick={() => setActiveGameCategory('tekken')}
                >
                  <div className="bg-gradient-to-br from-[#9A1212] to-[#5F0000] flex-1 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">鉄</span>
                  </div>
                  <div className="p-2 bg-red-500/10 border-t border-red-500/30">
                    <h3 className="text-red-400 font-bold text-base">تيكن</h3>
                  </div>
                  <div className="py-1.5 px-2 bg-gray-700/50 text-white/50 font-bold text-sm flex items-center justify-center">
                    قريباً...
                  </div>
                </div>
                
                {/* دومينو */}
                <div 
                  className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-600' : ''} border-blue-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                  onClick={() => setActiveGameCategory('domino')}
                >
                  <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex-1 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">🎲</span>
                  </div>
                  <div className="p-2 bg-blue-500/10 border-t border-blue-500/30">
                    <h3 className="text-blue-400 font-bold text-base">دومينو</h3>
                  </div>
                  <div className="py-1.5 px-2 bg-gray-700/50 text-white/50 font-bold text-sm flex items-center justify-center">
                    قريباً...
                  </div>
                </div>
              </div>
            </div>
            
            {/* مساحة للأيقونات */}
            <div className="flex justify-center gap-4 my-2">
              <div className="p-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white cursor-pointer transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div className="p-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white cursor-pointer transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"/><line x1="3" y1="22" x2="21" y2="22"/></svg>
              </div>
              <div className="p-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white cursor-pointer transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21 12a9 9 0 0 0-9-9v9h9z"/></svg>
              </div>
              <div className="p-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-white/70 hover:bg-black/60 hover:text-white cursor-pointer transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
            </div>
          </div>
          
          {/* Chat Section */}
          <div className="w-full md:w-80 order-1 md:order-2">
            <div className="relative bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] p-3 h-[500px] overflow-hidden" 
                style={{
                  borderRadius: '70% 30% 70% 30% / 30% 30% 70% 70%',
                  border: '3px solid #D4AF37',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)'
                }}>
              <div className="bg-black/40 p-2 absolute top-3 left-1/2 transform -translate-x-1/2 rounded-full backdrop-blur-sm">
                <h2 className="text-sm font-bold text-[#D4AF37] text-center px-3">الدردشة العامة</h2>
              </div>
              <div className="h-full mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-2" 
                   style={{ 
                     borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                     border: '1px dashed #D4AF37'
                   }}>
                <ChatBox />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-2 mt-4 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p className="text-xs">&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}