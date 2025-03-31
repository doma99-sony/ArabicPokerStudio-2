import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameType } from "@/types";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { LogOut, User, ChevronRight, Loader2, ChevronLeft, ChevronUp } from "lucide-react";

export default function LobbyPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer && isChatHidden) {
      chatContainer.style.transform = "translateX(-100%)";
    }
  }, [isChatHidden]);

  const toggleChat = () => {
    setIsChatHidden(!isChatHidden);
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      if (!isChatHidden) {
        chatContainer.style.transform = "translateX(-100%)";
      } else {
        chatContainer.style.transform = "translateX(0)";
      }
    }
  };

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

  const navigateToGameTables = (gameType: GameType) => {
    if (gameType === 'poker') {
      navigate('/poker-tables');
    }
  };

  if (logoutMutation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Chat Section */}
      <div
        id="chat-container"
        className="fixed left-0 top-0 h-full w-80 bg-black/90 border-r border-[#D4AF37]/20 transform transition-transform duration-300 z-50"
      >
        <ChatBox />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Top Bar */}
        <div className="bg-black/80 p-4 border-b border-[#D4AF37]/20 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-[#D4AF37] hover:text-[#D4AF37]/80"
              onClick={navigateToProfile}
            >
              <User className="h-5 w-5" />
            </Button>
            <span className="text-white/60">مرحباً، {user?.username}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-deepBlack rounded-full px-3 py-1 flex items-center border border-[#D4AF37]/20">
              <i className="fas fa-coins text-[#D4AF37] ml-2"></i>
              <span className="text-[#D4AF37] font-roboto">
                {user?.chips?.toLocaleString() || 0}
              </span>
            </div>

            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Game Content */}
        <div className="container mx-auto p-8">
          <div className="flex flex-col gap-3">
            {/* Game Categories */}
            <div className="w-full">
              <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-3 backdrop-blur-sm mb-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto">
                  {/* بوكر عرباوي */}
                  <div 
                    className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'poker' ? 'ring-2 ring-[#D4AF37]' : ''} border-[#D4AF37]/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                    onClick={() => {
                      setActiveGameCategory('poker');
                      navigateToGameTables('poker');
                    }}
                  >
                    <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] flex-1 flex items-center justify-center">
                      <span className="text-[#D4AF37] text-3xl font-bold">♠️ ♥️</span>
                    </div>
                    <div className="p-1 bg-[#D4AF37]/10 border-t border-[#D4AF37]/30">
                      <h3 className="text-[#D4AF37] font-bold text-sm">بوكر عرباوي</h3>
                    </div>
                    <button 
                      className="py-1 px-2 bg-[#D4AF37] text-[#0A0A0A] font-bold text-xs hover:bg-[#E5C04B] transition-colors flex items-center justify-center"
                      onClick={() => navigateToGameTables('poker')}
                    >
                      دخول طاولات البوكر
                      <ChevronRight className="mr-1 h-3 w-3" />
                    </button>
                  </div>

                  {/* نارتو */}
                  <div 
                    className={`flex flex-col h-32 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : ''} border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                    onClick={() => {
                      setActiveGameCategory('naruto');
                      navigateToGameTables('naruto');
                    }}
                  >
                    <div className="bg-gradient-to-br from-[#FF8C00] to-[#FF4500] flex-1 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">忍</span>
                    </div>
                    <div className="p-1 bg-orange-500/10 border-t border-orange-500/30">
                      <h3 className="text-orange-400 font-bold text-sm">نارتو</h3>
                    </div>
                    <button 
                      className="py-1 px-2 bg-orange-500 text-white font-bold text-xs hover:bg-orange-400 transition-colors flex items-center justify-center"
                      onClick={() => navigateToGameTables('naruto')}
                    >
                      دخول عالم نارتو
                      <ChevronRight className="mr-1 h-3 w-3" />
                    </button>
                  </div>

                  {/* تيكن */}
                  <div 
                    className={`flex flex-col h-32 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : ''} border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                    onClick={() => setActiveGameCategory('tekken')}
                  >
                    <div className="bg-gradient-to-br from-[#9A1212] to-[#5F0000] flex-1 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">鉄</span>
                    </div>
                    <div className="p-1 bg-red-500/10 border-t border-red-500/30">
                      <h3 className="text-red-400 font-bold text-sm">تيكن</h3>
                    </div>
                    <div className="py-1 px-2 bg-gray-700/50 text-white/50 font-bold text-xs flex items-center justify-center">
                      قريباً...
                    </div>
                  </div>

                  {/* دومينو */}
                  <div 
                    className={`flex flex-col h-32 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-600' : ''} border-blue-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                    onClick={() => setActiveGameCategory('domino')}
                  >
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex-1 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">🎲</span>
                    </div>
                    <div className="p-1 bg-blue-500/10 border-t border-blue-500/30">
                      <h3 className="text-blue-400 font-bold text-sm">دومينو</h3>
                    </div>
                    <div className="py-1 px-2 bg-gray-700/50 text-white/50 font-bold text-xs flex items-center justify-center">
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
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-[#D4AF37]/20">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <button onClick={toggleChat}>
              <div className="rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center">
                {isChatHidden ? <ChevronRight className="h-6 w-6 text-[#D4AF37]" /> : <ChevronLeft className="h-6 w-6 text-[#D4AF37]" />}
              </div>
              <span className="text-[11px] text-white mt-1">الدردشة</span>
            </button>

            <button>
              <div className="rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <span className="text-[11px] text-white mt-1">المتجر</span>
            </button>

            <button onClick={() => navigateToGameTables('poker')}>
              <div className="bg-white rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center relative overflow-hidden">
                <span className="text-sm font-bold text-[#0A3A2A]">العبها</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shine"></div>
              </div>
              <span className="text-[11px] text-white mt-1">العبها الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}