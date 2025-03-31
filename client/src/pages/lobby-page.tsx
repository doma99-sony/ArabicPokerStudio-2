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
      <header className="relative z-10 bg-black/80 text-white p-4 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#D4AF37]">بوكر تكساس عرباوي</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#D4AF37]">مرحباً، {user?.username}</p>
              <p className="text-white/80">الرصيد: <span className="text-[#D4AF37] font-bold">{user?.chips?.toLocaleString()}</span> رقاقة</p>
            </div>

            <Button 
              variant="outline" 
              className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={navigateToProfile}
            >
              <User size={18} className="ml-2" />
              الملف الشخصي
            </Button>

            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <LogOut size={18} className="ml-2" />
              )}
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-6">
        {/* Game Categories */}
        <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* بوكر عرباوي */}
            <div 
              className={`flex flex-col h-64 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'poker' ? 'ring-4 ring-[#D4AF37]' : ''} border-[#D4AF37]/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => {
                setActiveGameCategory('poker');
                navigateToGameTables('poker');
              }}
            >
              <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] flex-1 flex items-center justify-center">
                <span className="text-[#D4AF37] text-6xl font-bold">♠️ ♥️</span>
              </div>
              <div className="p-4 bg-[#D4AF37]/10 border-t border-[#D4AF37]/30">
                <h3 className="text-[#D4AF37] font-bold text-xl mb-1">بوكر عرباوي</h3>
                <p className="text-white/70 text-sm">العب بوكر تكساس هولدم بطريقة عرباوي مع لاعبين آخرين</p>
              </div>
              <button 
                className="py-3 px-4 bg-[#D4AF37] text-[#0A0A0A] font-bold text-lg hover:bg-[#E5C04B] transition-colors flex items-center justify-center"
                onClick={() => navigateToGameTables('poker')}
              >
                دخول طاولات البوكر
                <ChevronRight className="mr-2 h-5 w-5" />
              </button>
            </div>

            {/* نارتو */}
            <div 
              className={`flex flex-col h-64 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'naruto' ? 'ring-4 ring-orange-500' : ''} border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => {
                setActiveGameCategory('naruto');
                navigateToGameTables('naruto');
              }}
            >
              <div className="bg-gradient-to-br from-[#FF8C00] to-[#FF4500] flex-1 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">忍</span>
              </div>
              <div className="p-4 bg-orange-500/10 border-t border-orange-500/30">
                <h3 className="text-orange-400 font-bold text-xl mb-1">نارتو</h3>
                <p className="text-white/70 text-sm">عش مغامرات عالم نارتو مع شخصياتك المفضلة</p>
              </div>
              <button 
                className="py-3 px-4 bg-orange-500 text-white font-bold text-lg hover:bg-orange-400 transition-colors flex items-center justify-center"
                onClick={() => navigateToGameTables('naruto')}
              >
                دخول عالم نارتو
                <ChevronRight className="mr-2 h-5 w-5" />
              </button>
            </div>

            {/* تيكن */}
            <div 
              className={`flex flex-col h-64 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'tekken' ? 'ring-4 ring-red-600' : ''} border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => setActiveGameCategory('tekken')}
            >
              <div className="bg-gradient-to-br from-[#9A1212] to-[#5F0000] flex-1 flex items-center justify-center">
                <span className="text-white text-6xl font-bold">鉄</span>
              </div>
              <div className="p-4 bg-red-500/10 border-t border-red-500/30">
                <h3 className="text-red-400 font-bold text-xl mb-1">تيكن</h3>
                <p className="text-white/70 text-sm">قاتل وانتصر في أقوى ألعاب القتال العالمية</p>
              </div>
              <div className="py-3 px-4 bg-gray-700/50 text-white/50 font-bold text-lg flex items-center justify-center">
                قريباً...
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">الدردشة العامة</h2>
          <ChatBox />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-4 mt-8 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}