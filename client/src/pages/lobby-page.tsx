
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { GameType } from "@shared/types";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { ResetChipsButton } from "@/components/reset-chips-button";
import { RemoveVirtualPlayersButton } from "@/components/remove-virtual-players-button";
import { NotificationsButton, GameInstructionsButton } from "@/components/ui/notifications-system";
import { LogOut, User, ChevronRight, Loader2, ChevronLeft, ChevronUp, Bell, ShoppingBag, ShoppingCart, Download, Smartphone, ExternalLink, Coins, Trophy } from "lucide-react";
import { formatChips } from "@/lib/utils";

export default function LobbyPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // استخدام WebSocket لاتصال مستمر مع الخادم
  const ws = useWebSocket();
  
  // تأكد من إنشاء اتصال WebSocket جديد عند تحميل الصفحة
  useEffect(() => {
    if (user && ws.status !== 'open') {
      console.log('إنشاء اتصال WebSocket في الصفحة الرئيسية');
      ws.reconnect(); // استخدام reconnect من النسخة المبسطة
    }
    
    // تنظيف عند مغادرة الصفحة، نحتفظ بالاتصال مفتوحاً
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة الصفحة الرئيسية');
    };
  }, [user, ws]);

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
    <div className="h-screen overflow-hidden bg-cover bg-center flex flex-col"
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

      {/* Header Bar - تصميم جديد احترافي */}
      <header className="relative z-10 bg-gradient-to-r from-[#0A3A2A] to-black py-3 shadow-xl border-b-2 border-[#D4AF37]/50">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* القسم الأيسر - الشعار ومعلومات اللعبة */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/assets/poker-logo.jpeg" 
                  alt="بوكر عرباوي" 
                  className="w-12 h-12 rounded-full border-2 border-[#D4AF37] object-cover shadow-md shadow-[#D4AF37]/30" 
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border border-black"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#D4AF37] drop-shadow-md">بوكر تكساس عرباوي</h1>
                <div className="flex items-center mt-0.5">
                  <OnlineUsersCounter />
                </div>
              </div>
            </div>
          </div>

          {/* القسم الأيمن - معلومات المستخدم والأزرار */}
          <div className="flex items-center gap-3">
            {/* معلومات المستخدم والرصيد */}
            <div className="bg-[#0A3A2A]/60 rounded-lg border border-[#D4AF37]/30 py-1 px-3 mr-2">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]/70">
                  <img 
                    src={user?.avatar || "/assets/poker-icon-gold.png"} 
                    alt="صورة المستخدم" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] text-sm font-bold leading-tight">{user?.username}</p>
                  <div className="flex items-center">
                    <Coins className="h-3.5 w-3.5 text-[#D4AF37] ml-1" />
                    <span className="text-[#D4AF37] text-xs font-bold">{formatChips(user?.chips || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار الوصول السريع */}
            <div className="flex items-center gap-2">
              {/* زر إعادة تعيين الرصيد - وضع للاختبار فقط */}
              <div className="hidden md:flex gap-1 scale-75 origin-right">
                <ResetChipsButton />
                <RemoveVirtualPlayersButton />
              </div>
              
              <Button 
                variant="outline" 
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-3 text-xs bg-black/30 backdrop-blur-sm"
                onClick={() => navigate("/notifications")}
              >
                <Bell size={16} className="ml-1" />
                <span className="hidden md:inline">الإشعارات</span>
              </Button>

              <Button 
                variant="outline" 
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-3 text-xs bg-black/30 backdrop-blur-sm"
                onClick={navigateToProfile}
              >
                <User size={16} className="ml-1" />
                <span className="hidden md:inline">الملف</span>
              </Button>

              <Button 
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-9 py-0 px-3 text-xs bg-black/30 backdrop-blur-sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-1" />
                ) : (
                  <LogOut size={16} className="ml-1" />
                )}
                <span className="hidden md:inline">خروج</span>
              </Button>
            </div>
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

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto p-4">
          <div className="flex flex-col">
            {/* العناصر الرئيسية */}
            <div className="grid grid-cols-1 overflow-hidden">
              {/* تم حذف قسم معلومات اللاعب بناءً على طلب المستخدم */}

              {/* واجهة اختيار الألعاب - قسم عرضي كامل */}
              <div className="w-full">
                <div className="rounded-xl bg-[#0A3A2A] border-2 border-[#D4AF37]/40 p-4 shadow-xl">
                  <div className="mb-3">
                  </div>

                  <div className="flex flex-col gap-3 w-full max-w-sm mr-0 ml-0">
                    {/* بوكر عرباوي - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-40 w-full rounded-xl overflow-hidden shadow-xl ${activeGameCategory === 'poker' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                      onClick={() => {
                        setActiveGameCategory('poker');
                        navigateToGameTables('poker');
                      }}
                    >
                      {/* خلفية اللعبة - صورة */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D3E] to-[#0A3A2A]">
                        <img 
                          src="/assets/poker-table-bg.jpg" 
                          alt="بوكر عرباوي" 
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                      
                      {/* تراكب شفاف */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#0A3A2A]/50 to-[#0A3A2A]/30 animate-subtle-gradient"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* أيقونة مميزة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded">VIP</div>
                            <div className="bg-[#22c55e] text-black font-bold text-xs p-1 px-2 rounded">HOT</div>
                          </div>
                          <div className="w-10 h-10 bg-[#0A3A2A] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                            <span className="text-[#D4AF37] text-xl">♠️</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-2 mb-1">
                          <h3 className="text-[#D4AF37] font-bold text-xl">بوكر عرباوي</h3>
                          <div className="mt-1 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-2 text-xs text-gray-300 flex gap-2">
                          <div className="bg-black/30 rounded px-2 py-1 border border-[#D4AF37]/20">
                            <span className="text-[#D4AF37]">٤٢٠</span> لاعب نشط
                          </div>
                          <div className="bg-black/30 rounded px-2 py-1 border border-[#D4AF37]/20">
                            <span className="text-[#D4AF37]">٢٣</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-2 px-3 bg-[#D4AF37] text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 animate-card-shadow"
                          >
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-black">♣</span>
                            </div>
                            ابدأ اللعب الآن
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* نارتو - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-40 w-full rounded-xl overflow-hidden shadow-xl ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => {
                        setActiveGameCategory('naruto');
                        navigateToGameTables('naruto');
                      }}
                    >
                      {/* خلفية اللعبة - صورة */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#FF8C00] to-[#FF4500]">
                        <img 
                          src="/assets/naruto-video.mp4" 
                          alt="نارتو" 
                          className="w-full h-full object-cover opacity-60"
                        />
                      </div>
                      
                      {/* تراكب شفاف */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#FF4500]/40 to-[#FF8C00]/30 animate-subtle-gradient"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* أيقونة مميزة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <div className="bg-orange-500 text-white font-bold text-xs p-1 px-2 rounded">جديد</div>
                          </div>
                          <div className="w-10 h-10 bg-orange-800 rounded-full border-2 border-orange-400 flex items-center justify-center">
                            <span className="text-white text-xl">忍</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-2 mb-1">
                          <h3 className="text-orange-400 font-bold text-xl">ناروتو</h3>
                          <div className="mt-1 w-full h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-2 text-xs text-gray-300 flex gap-2">
                          <div className="bg-black/30 rounded px-2 py-1 border border-orange-500/20">
                            <span className="text-orange-400">١٨٥</span> لاعب نشط
                          </div>
                          <div className="bg-black/30 rounded px-2 py-1 border border-orange-500/20">
                            <span className="text-orange-400">١٢</span> غرفة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-2 px-3 bg-orange-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 animate-card-shadow"
                          >
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white">⚔️</span>
                            </div>
                            استكشف عالم ناروتو
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* دومينو - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-40 w-full rounded-xl overflow-hidden shadow-xl ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => {
                        setActiveGameCategory('domino');
                        navigateToGameTables('domino');
                      }}
                    >
                      {/* خلفية اللعبة - صورة */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A] to-[#0F172A]">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 rotate-12 text-white/20 text-8xl font-bold">
                            🎲
                          </div>
                          <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 -rotate-12 text-white/20 text-8xl font-bold">
                            🎲
                          </div>
                        </div>
                      </div>
                      
                      {/* تراكب شفاف */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#0F172A]/50 to-[#1E3A8A]/30 animate-subtle-gradient"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* أيقونة مميزة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <div className="bg-blue-500 text-white font-bold text-xs p-1 px-2 rounded">شائع</div>
                            <div className="bg-red-500 text-white font-bold text-xs p-1 px-2 rounded">٪٥٠+</div>
                          </div>
                          <div className="w-10 h-10 bg-blue-900 rounded-full border-2 border-blue-400 flex items-center justify-center">
                            <span className="text-white text-base">🎲</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-2 mb-1">
                          <h3 className="text-blue-400 font-bold text-xl">دومينو</h3>
                          <div className="mt-1 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-2 text-xs text-gray-300 flex gap-2">
                          <div className="bg-black/30 rounded px-2 py-1 border border-blue-500/20">
                            <span className="text-blue-400">٢٥٠</span> لاعب نشط
                          </div>
                          <div className="bg-black/30 rounded px-2 py-1 border border-blue-500/20">
                            <span className="text-blue-400">٤٥</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-2 px-3 bg-blue-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 animate-card-shadow"
                          >
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs">١•٢</span>
                            </div>
                            العب الدومينو الآن
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* تيكن - قريباً */}
                    <div 
                      className={`relative flex flex-col h-40 w-full rounded-xl overflow-hidden shadow-xl ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : ''}`}
                      onClick={() => setActiveGameCategory('tekken')}
                    >
                      {/* خلفية اللعبة - صورة */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[#9A1212] to-[#5F0000]">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="absolute opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-9xl font-bold">
                            鉄
                          </div>
                        </div>
                      </div>
                      
                      {/* تراكب شفاف */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#5F0000]/50 to-[#9A1212]/30 animate-subtle-gradient"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* أيقونة مميزة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <div className="bg-yellow-500 text-black font-bold text-xs p-1 px-2 rounded">قريباً</div>
                          </div>
                          <div className="w-10 h-10 bg-red-900 rounded-full border-2 border-red-400 flex items-center justify-center">
                            <span className="text-white text-xl">鉄</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-2 mb-1">
                          <h3 className="text-red-400 font-bold text-xl">تيكن</h3>
                          <div className="mt-1 w-full h-0.5 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-2 text-xs text-gray-300 flex gap-2">
                          <div className="bg-black/30 rounded px-2 py-1 border border-red-500/20">
                            <span className="text-red-400">٠</span> لاعب نشط
                          </div>
                          <div className="bg-black/30 rounded px-2 py-1 border border-red-500/20">
                            <span className="text-red-400">٠</span> غرفة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-lg backdrop-blur-sm">
                            <div className="bg-yellow-500/80 text-black font-bold px-4 py-1 rounded-lg animate-pulse">
                              قريباً - متاح قريباً
                            </div>
                          </div>
                          <button 
                            disabled
                            className="w-full py-2 px-3 bg-red-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 opacity-50"
                          >
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white">👊</span>
                            </div>
                            استعد للقتال
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
        <div className="bg-gradient-to-t from-black via-[#0A3A2A] to-[#0A3A2A]/90 border-t-2 border-[#D4AF37] px-1 py-1 shadow-xl backdrop-blur-md flex items-center justify-between bottom-nav">
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
            {/* تم إزالة زر تعليمات اللعب من هنا ونقله إلى داخل طاولات البوكر */}
            
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
          
          {/* زر تعليمات اللعب في الشريط السفلي في صفحة اللوبي */}
          <GameInstructionsButton />
          
          
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