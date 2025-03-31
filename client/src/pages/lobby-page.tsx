import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameType } from "@/types";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { LogOut, User, ChevronRight, Loader2, ChevronLeft, ChevronUp, Bell, ShoppingBag, ShoppingCart, Download, Smartphone } from "lucide-react";

// Placeholder component -  Replace with actual implementation
const EgyptianPyramid = () => (
  <div className="w-64 h-64 bg-brown-500 ml-8 rounded-lg shadow-2xl relative">
    <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center font-bold text-lg">بوكر بويا المصريين</p>
    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center text-sm">انضم الان</p>
  </div>
);

export default function LobbyPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // التحكم في كتم/تشغيل الصوت
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVideoMuted(!videoMuted);
    }
  };

  useEffect(() => {
    // Inicializar el chat como visible al cargar la página
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

  // وظيفة للانتقال إلى صفحة الطاولات بناءً على نوع اللعبة
  const navigateToGameTables = (gameType: GameType) => {
    if (gameType === "poker") {
      navigate("/poker-tables");
    } else if (gameType === "naruto") {
      navigate("/naruto");
    } else if (gameType === "domino") {
      navigate("/domino");
    }
    // ستتم إضافة المزيد من الألعاب لاحقًا
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>

      {/* خلفية الفيديو */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={videoMuted}
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="/assets/WhatsApp Video 2025-03-30 at 11.41.26 PM.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      </div>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-2 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/assets/poker-logo.jpeg" 
                alt="بوكر عرباوي" 
                className="w-10 h-10 rounded-full border-2 border-[#D4AF37] object-cover shadow-md shadow-[#D4AF37]/30" 
              />
              <h1 className="text-xl font-bold text-[#D4AF37]">بوكر تكساس عرباوي</h1>
            </div>
            {/* عداد المستخدمين المتصلين */}
            <OnlineUsersCounter />
          </div>

          {/* إضافة الهرم المصري */}
          <EgyptianPyramid onClick={() => navigate('/game-tables')} />

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[#D4AF37] text-sm">مرحباً، {user?.username}</p>
              <p className="text-white/80 text-xs">الرصيد: <span className="text-[#D4AF37] font-bold">{user?.chips?.toLocaleString()}</span></p>
            </div>

            <Button 
              variant="outline" 
              className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 py-0 px-2 text-xs"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={14} className="ml-1" />
              الإشعارات
            </Button>

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
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 h-8 py-0 px-2 text-xs"
              onClick={() => {
                // رابط تحميل التطبيق للأندرويد (ستقوم بتغييره لاحقا بالرابط الفعلي)
                alert("سيتم تحميل تطبيق الأندرويد");
              }}
            >
              <Smartphone size={14} className="ml-1" />
              تحميل التطبيق
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
      <main className="relative z-10 flex-1 overflow-hidden">
        {/* Chat Section - Fixed to left */}
        <div 
          className="fixed top-16 left-0 h-[calc(100%-8rem)] z-20 transition-all duration-300" 
          id="chat-container"
          style={{ transform: isChatHidden ? "translateX(-100%)" : "translateX(0)" }}
        >
          <div className="relative h-full">
            <div className="h-full">
              <div className="rounded-r-xl overflow-hidden border-2 border-l-0 border-[#D4AF37] h-full shadow-lg">
                {/* رأس الدردشة */}
                <div className="bg-[#0A3A2A] p-3 border-b border-[#D4AF37] flex justify-between items-center">
                  <h2 className="text-base font-bold text-[#D4AF37]">الدردشة العامة</h2>
                </div>

                {/* منطقة الدردشة */}
                <div className="h-[calc(80%-50px)] bg-gradient-to-b from-[#1B4D3E]/80 to-black/60 w-80">
                  <div className="h-full w-full">
                    <ChatBox />
                  </div>
                </div>
              </div>
            </div>

            {/* زر التبديل */}
            <button 
              id="chat-toggle"
              className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-16 w-8 bg-[#0A3A2A] border-2 border-l-0 border-[#D4AF37] rounded-r-lg flex items-center justify-center"
              onClick={toggleChat}
            >
              {isChatHidden ? (
                <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-[#D4AF37]" />
              )}
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="container mx-auto p-4">
          <div className="flex flex-col gap-3">
            {/* Game Categories */}
            <div className="w-full">
              <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-3 backdrop-blur-sm mb-4">
                <div className="text-center mb-6 flex flex-col items-center">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src="/assets/poker-logo-alt.jpeg" 
                      alt="بوكر عرباوي" 
                      className="w-12 h-12 rounded-full border-2 border-[#D4AF37] object-cover shadow-md shadow-[#D4AF37]/30"
                    />
                    <h2 className="text-2xl font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
                  </div>
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
                    onClick={() => {
                      setActiveGameCategory('domino');
                      navigateToGameTables('domino');
                    }}
                  >
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] flex-1 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">🎲</span>
                    </div>
                    <div className="p-1 bg-blue-500/10 border-t border-blue-500/30">
                      <h3 className="text-blue-400 font-bold text-sm">دومينو</h3>
                    </div>
                    <button 
                      className="py-1 px-2 bg-blue-500 text-white font-bold text-xs hover:bg-blue-400 transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToGameTables('domino');
                      }}
                    >
                      العب الدومينو الآن
                      <ChevronRight className="mr-1 h-3 w-3" />
                    </button>
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
      </main>

      {/* زر كتم/تشغيل الصوت */}
      <button 
        className="fixed bottom-20 right-4 z-50 bg-black/60 p-2 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-black/80 transition-all"
        onClick={toggleMute}
      >
        {videoMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 w-full mx-auto">
        <div className="bg-gradient-to-t from-black via-[#0A3A2A] to-[#0A3A2A]/90 border-t-2 border-[#D4AF37] px-1 py-1 shadow-xl backdrop-blur-md flex items-center justify-between">
          {/* الرانك */}
          <div className="relative group">
            <button 
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              onClick={() => {
                navigate("/rankings");
              }}
            >
              <div className="bg-gradient-to-br from-[#FFD700]/80 to-[#ffa500]/80 rounded-full w-14 h-14 border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0 animate-pulse-slow"></div>
                <div className="relative w-11 h-11 overflow-hidden">
                  <img 
                    src="/assets/rankings/rank-trophy.png" 
                    alt="Rank" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white shadow-md animate-pulse"></span>
              </div>
              <span className="text-[11px] text-white mt-1 font-bold text-[#D4AF37]">الرانك</span>
            </button>
          </div>

          {/* المتجر */}
          <div className="relative group">
            <button 
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              onClick={() => navigate("/shop")}
            >
              <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300">
                <ShoppingCart className="h-6 w-6 text-[#D4AF37]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white animate-pulse"></span>
              </div>
              <span className="text-[11px] text-white mt-1">المتجر</span>
            </button>
          </div>

          {/* الحقيبة */}
          <div className="relative group">
            <button 
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              onClick={() => navigate("/inventory")}
            >
              <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300">
                <ShoppingBag className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <span className="text-[11px] text-white mt-1">الحقيبة</span>
            </button>
          </div>

          {/* الأحداث */}
          <div className="relative group">
            <button 
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              onClick={() => {
                // إظهار صفحة الأحداث
                alert("سيتم فتح صفحة الأحداث");
              }}
            >
              <div className="bg-gradient-to-br from-white to-[#f0f0f0] rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center relative shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300">
                <span className="text-sm font-bold text-[#0A3A2A]">الأحداث</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white animate-pulse"></span>
              </div>
              <span className="text-[11px] text-white mt-1">الأحداث</span>
            </button>
          </div>

          {/* الإعدادات */}
          <div className="relative">
            <button 
              onClick={() => navigate("/settings")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </div>
              <span className="text-[11px] text-white mt-1">الإعدادات</span>
            </button>
          </div>

          {/* الرسائل */}
          <div className="relative">
            <button 
              onClick={() => alert("سيتم فتح الرسائل")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-yellow-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <span className="text-[11px] text-white mt-1">الرسائل</span>
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border border-black">2</span>
          </div>

          {/* المهمات */}
          <div className="relative">
            <button 
              onClick={() => navigate("/missions")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <span className="text-[11px] text-white mt-1">المهمات</span>
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full text-[10px] text-white flex items-center justify-center border border-black">3</span>
          </div>

          {/* الأصدقاء */}
          <div className="relative">
            <button 
              onClick={() => alert("سيتم فتح قائمة الأصدقاء")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span className="text-[11px] text-white mt-1">الأصدقاء</span>
            </button>
          </div>

          {/* الملابس */}
          <div className="relative">
            <button 
              onClick={() => alert("سيتم فتح الملابس")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>
              </div>
              <span className="text-[11px] text-white mt-1">الملابس</span>
            </button>
          </div>

          {/* الترتيب */}
          <div className="relative">
            <button 
              onClick={() => alert("سيتم فتح ترتيب اللاعبين")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <span className="text-[11px] text-white mt-1">الترتيب</span>
            </button>
          </div>

          {/* VIP */}
          <div className="relative">
            <button 
              onClick={() => navigate("/vip")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <span className="text-[11px] text-white mt-1">VIP</span>
            </button>
          </div>

          {/* المكافآت */}
          <div className="relative">
            <button 
              onClick={() => alert("سيتم فتح المكافآت")}
              className="flex flex-col items-center justify-center p-2 min-w-[48px]"
            >
              <div className="bg-black/60 rounded-full w-11 h-11 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
              <span className="text-[11px] text-white mt-1">المكافآت</span>
            </button>
          </div>

          {/* العبها الآن */}
          <div className="relative group">
            <button 
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              onClick={() => {
                // الانتقال إلى صفحة اللعب
                navigateToGameTables('poker');
              }}
            >
              <div className="bg-white rounded-full w-12 h-12 border-2 border-[#D4AF37] flex items-center justify-center relative overflow-hidden">
                <span className="text-sm font-bold text-[#0A3A2A]">العبها</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-shine"></div>
              </div>
              <span className="text-[11px] text-white mt-1">العبها الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-2 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p className="text-xs">&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shine {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shine 2s infinite;
          }
          .animate-pulse {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .animate-pulse-slow {
            animation: pulse 3s infinite;
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px #D4AF37, 0 0 10px #D4AF37; }
            50% { box-shadow: 0 0 15px #D4AF37, 0 0 20px #D4AF37; }
          }
          .animate-glow {
            animation: glow 2s infinite;
          }
        `
      }} />
    </div>
  );
}