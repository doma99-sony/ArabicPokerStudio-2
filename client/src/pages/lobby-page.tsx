import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { GameType } from "@shared/types";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { ResetChipsButton } from "@/components/reset-chips-button";
import { RemoveVirtualPlayersButton } from "@/components/remove-virtual-players-button";
import { NotificationsButton, GameInstructionsButton } from "@/components/ui/notifications-system";
import { LogOut, User, ChevronRight, Loader2, ChevronLeft, ChevronUp, Bell, ShoppingBag, ShoppingCart, Download, Smartphone, ExternalLink, Coins, Trophy, Crown } from "lucide-react";
import { formatChips } from "@/lib/utils";
import { HeavySnowEffect, GoldDustEffect } from "@/components/effects/snow-effect";
import { HeavyPokerCardsEffect, SuitSymbolsEffect } from "@/components/effects/poker-cards-effect";
import ProfilePopup from "@/components/profile/ProfilePopup";

export default function LobbyPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // استخدام WebSocket لاتصال مستمر مع الخادم
  const ws = useWebSocket();
  const globalWs = useGlobalWebSocket();
  
  // تأكد من إنشاء اتصال WebSocket جديد عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      // استخدام اتصال عمومي مستمر مع نظام WebSocket المركزي
      if (!globalWs.isConnected && user.id) {
        console.log('إنشاء اتصال WebSocket عمومي في الصفحة الرئيسية');
        globalWs.connect(user.id);
      }
      
      // استخدام الاتصال المحلي المبسط للشات وأدوات الصفحة الرئيسية
      if (ws.status !== 'open') {
        console.log('إنشاء اتصال WebSocket مبسط إضافي في الصفحة الرئيسية');
        ws.reconnect(); // استخدام reconnect من النسخة المبسطة
      }
    }
    
    // تنظيف عند مغادرة الصفحة، نحتفظ بالاتصال مفتوحاً
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة الصفحة الرئيسية');
      // لا نقوم بإغلاق الاتصال عند مغادرة الصفحة
    };
  }, [user, ws, globalWs]);

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
    setProfilePopupOpen(true);
  };

  // وظيفة للانتقال إلى صفحة الطاولات بناءً على نوع اللعبة
  const navigateToGameTables = (gameType: GameType) => {
    if (gameType === "poker") {
      navigate("/poker-tables");
    } else if (gameType === "naruto") {
      navigate("/naruto");
    } else if (gameType === "domino") {
      navigate("/domino");
    } else if (gameType === "arabic_rocket") {
      navigate("/arabic-rocket");
    } else if (gameType === "zeus_king") {
      navigate("/zeus-king");
    } else if (gameType === "egypt_queen") {
      navigate("/egypt-queen");
    } else if (gameType === "arab_poker") {
      navigate("/arab-poker");
    }
    // ستتم إضافة المزيد من الألعاب لاحقًا
  };

  return (
    <div className="h-screen overflow-hidden bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      
      {/* تم حذف تأثير تساقط بطاقات البوكر بناءً على طلب المستخدم */}
      
      {/* خلفية الفيديو محسنة - بتأثيرات ضبابية وإضاءة */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={videoMuted}
          playsInline
          className="absolute w-full h-full object-cover scale-110 transform-gpu"
        >
          <source src="/assets/backgrounds/poker-background.mp4" type="video/mp4" />
        </video>
        
        {/* طبقات تأثير متعددة للحصول على مظهر محترف */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A3A2A]/50 via-black/60 to-[#0A3A2A]/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover opacity-30 mix-blend-soft-light"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 to-transparent h-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent h-32 pointer-events-none"></div>
        
        {/* إضافة سحب متحركة */}
        <div className="absolute inset-0 bg-[url('/images/fog-overlay.png')] bg-cover opacity-10 mix-blend-overlay animate-float-slow pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/images/fog-overlay2.png')] bg-cover opacity-5 mix-blend-overlay animate-float-slow-reverse pointer-events-none" style={{ animationDelay: '5s' }}></div>
        
        {/* إضافة تلميعات ضوئية متحركة */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl animate-pulse-slow opacity-60 mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl animate-pulse-slow opacity-50 mix-blend-screen" style={{ animationDelay: "2s" }}></div>
      </div>
      

      {/* Header Bar - تصميم احترافي بجودة عالية مع تأثيرات مذهلة */}
      <header className="relative z-10 py-3 sticky top-0 backdrop-blur-sm">
        {/* طبقات الخلفية والتأثيرات */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A2A]/90 via-[#0F1F1A]/90 to-black/90"></div>
        <div className="absolute inset-0 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-36 left-1/2 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl animate-pulse-slow mix-blend-screen"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20 shadow-lg shadow-[#D4AF37]/30"></div>
        
        <div className="container mx-auto flex justify-between items-center px-4 relative">
          {/* القسم الأيسر - معلومات المستخدم والرصيد (تم تبديل المكان) */}
          <div className="flex items-center gap-4">
            {/* معلومات المستخدم والرصيد */}
            <div className="bg-gradient-to-r from-[#0A3A2A]/90 to-black/80 rounded-lg border-2 border-[#D4AF37] py-2 px-3 mr-2 shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300">
              <div className="flex items-center gap-2">
                {/* صورة المستخدم مع زر التعديل */}
                <div className="relative group">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-inner">
                    <img 
                      src={user?.avatar || "/assets/poker-icon-gold.png"} 
                      alt="صورة المستخدم" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {/* زر تعديل الصورة */}
                  <button 
                    className="absolute inset-0 w-full h-full bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300"
                    onClick={() => setProfilePopupOpen(true)}
                  >
                    <span className="text-white text-xs">تغيير</span>
                  </button>
                  {/* مؤشر الحالة */}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border border-black animate-pulse"></div>
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] text-base font-bold leading-tight mb-1">{user?.username}</p>
                  <div className="flex items-center bg-[#0A3A2A]/80 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                    <Coins className="h-3.5 w-3.5 text-[#D4AF37] ml-1" />
                    <span className="text-[#D4AF37] text-sm font-bold">{formatChips(user?.chips || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* أزرار التنقل - بتصميم محسن وأيقونات عالية الجودة */}
            <div className="hidden lg:flex items-center gap-3 mr-4">
              <Button 
                variant="outline" 
                className="h-9 px-4 text-sm bg-black/30 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#FFD700] transition-all duration-300 flex items-center shadow-md hover:shadow-[#D4AF37]/20"
                onClick={() => navigate("/send-chips")}
              >
                <Coins size={18} className="ml-2 drop-shadow-gold" />
                <span className="font-semibold">العطاء</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-9 px-4 text-sm bg-black/30 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#FFD700] transition-all duration-300 flex items-center shadow-md hover:shadow-[#D4AF37]/20 relative"
                onClick={() => window.open("https://wa.me/201008508826", "_blank")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 drop-shadow-gold">
                    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="font-semibold">الدعم</span>
                </span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-9 px-4 text-sm bg-black/30 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#FFD700] transition-all duration-300 flex items-center shadow-md hover:shadow-[#D4AF37]/20 relative"
                onClick={() => navigate("/offers")}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 drop-shadow-gold">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <span className="font-semibold">عروض الشحن</span>
                </span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
              </Button>
            </div>
          </div>

          {/* زر الهامبرغر للتنقل في الموبايل - إضافة جديدة */}
          <div className="lg:hidden ml-auto mr-2">
            <Button 
              variant="ghost" 
              className="h-9 w-9 p-0 bg-black/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#FFD700] rounded-lg"
              onClick={() => navigate("/menu")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>

          {/* القسم الأيمن (الجديد) - الشعار ومعلومات اللعبة بجودة عالية */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]/0 rounded-full blur-md animate-pulse-slow opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
                <div className="relative w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#0A3A2A] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 group-hover:shadow-[#D4AF37]/50 transition-all duration-300">
                  <span className="text-[#D4AF37] text-2xl font-bold">♠</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border border-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFC107] bg-clip-text text-transparent drop-shadow-md">بوكر تكساس عرباوي</h1>
                <div className="flex items-center mt-0.5">
                  <OnlineUsersCounter />
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
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-2.5 text-xs bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-[#D4AF37]/20"
                onClick={() => navigate("/notifications")}
              >
                <Bell size={16} className="ml-1" />
                <span className="hidden md:inline">الإشعارات</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center shadow-md">٢</span>
              </Button>

              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-2.5 text-xs bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-[#D4AF37]/20"
                onClick={navigateToProfile}
              >
                <User size={16} className="ml-1" />
                <span className="hidden md:inline">الملف</span>
              </Button>

              <Button 
                variant="outline" 
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-2.5 text-xs bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-[#D4AF37]/20"
                onClick={handleLogout}
              >
                <LogOut size={16} className="ml-1" />
                <span className="hidden md:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {/* Chat Section - Fixed to left - تصميم محسن بتأثيرات زجاجية وذهبية */}
        <div 
          className="fixed top-16 left-0 h-[calc(100%-8rem)] z-20 transition-all duration-500 shadow-2xl shadow-black/50" 
          id="chat-container"
          style={{ transform: isChatHidden ? "translateX(-100%)" : "translateX(0)" }}
        >
          <div className="h-full w-72 sm:w-80 bg-gradient-to-b from-[#0A3A2A]/90 to-black/90 backdrop-blur-md border-r border-t border-[#D4AF37]/30 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-[#D4AF37]/30 bg-black/30">
              <h2 className="text-[#D4AF37] font-bold text-lg">الدردشة المباشرة</h2>
              <button 
                className="text-[#D4AF37] hover:text-[#FFD700] bg-black/20 hover:bg-black/40 p-1.5 rounded-full transition-all"
                onClick={toggleChat}
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            <ChatBox />
          </div>
        </div>
        
        {/* Main game content area */}
        <div className="h-full overflow-auto">
          {/* Toggle Chat Button - Outside the chat container, visible when chat is hidden */}
          {isChatHidden && (
            <button 
              className="fixed top-[50%] left-0 transform -translate-y-1/2 z-20 bg-black/60 border-r border-t border-b border-[#D4AF37]/30 py-10 px-1.5 text-[#D4AF37] hover:text-[#FFD700] hover:bg-black/80 transition-all rounded-r-lg"
              onClick={toggleChat}
            >
              <ChevronRight size={18} />
            </button>
          )}
          
          <div className="container mx-auto px-4 py-5">
            {/* Category menu - تصميم ذهبي مع تأثيرات محسنة */}
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A2A]/30 via-[#D4AF37]/10 to-[#0A3A2A]/30 rounded-xl blur-md"></div>
              <div className="relative bg-gradient-to-r from-[#0A3A2A]/80 via-black/80 to-[#0A3A2A]/80 rounded-xl border border-[#D4AF37]/30 shadow-lg p-3 backdrop-blur-sm">
                <div className="flex justify-center space-x-2 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
                  <GameCategoryButton
                    active={activeGameCategory === "poker"}
                    onClick={() => setActiveGameCategory("poker")}
                    icon="♠"
                    label="بوكر"
                  />
                  <GameCategoryButton
                    active={activeGameCategory === "slots"}
                    onClick={() => setActiveGameCategory("slots")}
                    icon="🎰"
                    label="سلوتس"
                  />
                  <GameCategoryButton
                    active={activeGameCategory === "crash"}
                    onClick={() => setActiveGameCategory("crash")}
                    icon="🚀"
                    label="كراش"
                  />
                  <GameCategoryButton
                    active={activeGameCategory === "domino"}
                    onClick={() => setActiveGameCategory("domino")}
                    icon="🁑"
                    label="دومينو"
                  />
                  <GameCategoryButton
                    active={activeGameCategory === "naruto"}
                    onClick={() => setActiveGameCategory("naruto")}
                    icon="👑"
                    label="ناروتو"
                  />
                </div>
              </div>
            </div>
            
            {/* Game cards section */}
            <div className="space-y-8">
              {activeGameCategory === "poker" && (
                <GameSection 
                  title="ألعاب البوكر" 
                  icon="♠️"
                  games={[
                    {
                      id: "arab-poker",
                      title: "بوكر تكساس عرباوي",
                      image: "/images/arabian-poker-game-bg.jpg",
                      playerCount: 1234,
                      tableCount: 62,
                      minBet: 50,
                      maxBet: 100000,
                      isNew: true,
                      onClick: () => navigate("/arab-poker")
                    },
                    {
                      id: "egypt-queen",
                      title: "ملكة مصر",
                      image: "/images/egypt-queen-bg.jpg",
                      playerCount: 845,
                      tableCount: 37,
                      minBet: 100,
                      maxBet: 250000,
                      isHot: true,
                      onClick: () => navigate("/egypt-queen")
                    },
                    {
                      id: "zeus-king",
                      title: "زيوس كينغ",
                      image: "/images/zeus-king-bg.jpg",
                      playerCount: 621,
                      tableCount: 29,
                      minBet: 200,
                      maxBet: 500000,
                      isVIP: true,
                      onClick: () => navigate("/zeus-king")
                    }
                  ]}
                />
              )}
              
              {activeGameCategory === "slots" && (
                <GameSection 
                  title="ألعاب السلوتس" 
                  icon="🎰"
                  games={[
                    {
                      id: "slots-1",
                      title: "كنوز الفراعنة",
                      image: "/images/slots-1-bg.jpg",
                      playerCount: 723,
                      tableCount: 0,
                      minBet: 10,
                      maxBet: 50000,
                      isNew: true,
                      onClick: () => navigate("/slots/pharaohs-treasure")
                    },
                    {
                      id: "slots-2",
                      title: "أساطير العرب",
                      image: "/images/slots-2-bg.jpg",
                      playerCount: 456,
                      tableCount: 0,
                      minBet: 5,
                      maxBet: 25000,
                      isHot: true,
                      onClick: () => navigate("/slots/arabian-legends")
                    }
                  ]}
                />
              )}
              
              {activeGameCategory === "crash" && (
                <GameSection 
                  title="ألعاب الكراش" 
                  icon="🚀"
                  games={[
                    {
                      id: "arabic-rocket",
                      title: "الصاروخ العربي",
                      image: "/images/rocket-crash-bg.jpg",
                      playerCount: 982,
                      tableCount: 0,
                      minBet: 10,
                      maxBet: 100000,
                      isHot: true,
                      onClick: () => navigate("/arabic-rocket")
                    }
                  ]}
                />
              )}
              
              {activeGameCategory === "domino" && (
                <GameSection 
                  title="ألعاب الدومينو" 
                  icon="🁑"
                  games={[
                    {
                      id: "domino",
                      title: "دومينو عربي",
                      image: "/images/domino-bg.jpg",
                      playerCount: 542,
                      tableCount: 31,
                      minBet: 20,
                      maxBet: 50000,
                      isNew: true,
                      onClick: () => navigate("/domino")
                    }
                  ]}
                />
              )}
              
              {activeGameCategory === "naruto" && (
                <GameSection 
                  title="ألعاب ناروتو" 
                  icon="👑"
                  games={[
                    {
                      id: "naruto",
                      title: "ناروتو كارد",
                      image: "/images/naruto-bg.jpg",
                      playerCount: 328,
                      tableCount: 18,
                      minBet: 50,
                      maxBet: 75000,
                      isVIP: true,
                      onClick: () => navigate("/naruto")
                    }
                  ]}
                />
              )}
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
              className="flex flex-col items-center justify-center px-3 py-1 transition-all duration-300"
              onClick={() => navigate("/rankings")}  
            >
              <div className="text-white/90 group-hover:text-[#D4AF37] w-6 h-6 flex items-center justify-center mb-1">
                <Trophy size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] text-white/80 group-hover:text-[#D4AF37]">الرانك</span>
            </button>
          </div>
          
          {/* الهدايا */}
          <div className="relative group">
            <button 
              className="flex flex-col items-center justify-center px-3 py-1 transition-all duration-300"
              onClick={() => navigate("/send-chips")}  
            >
              <div className="text-white/90 group-hover:text-[#D4AF37] w-6 h-6 flex items-center justify-center mb-1">
                <Coins size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] text-white/80 group-hover:text-[#D4AF37]">الهدايا</span>
            </button>
          </div>
          
          {/* لعبها الآن */}
          <div className="relative group -mt-3 z-10">
            <button 
              className="flex flex-col items-center justify-center px-1 py-1 transition-all duration-300"
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

// Game Category Button Component
function GameCategoryButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
  return (
    <button
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 min-w-[70px] relative ${
        active 
          ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]" 
          : "text-white/70 hover:text-[#D4AF37]/80 hover:bg-black/40"
      }`}
      onClick={onClick}
    >
      <div className={`text-2xl mb-1 ${active ? "text-[#D4AF37]" : "text-white/70"}`}>{icon}</div>
      <span className="text-xs">{label}</span>
      {active && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-[#D4AF37]/80"></div>
      )}
    </button>
  );
}

// Game Card Component
function GameSection({ title, icon, games }: { 
  title: string, 
  icon: string,
  games: {
    id: string;
    title: string;
    image: string;
    playerCount: number;
    tableCount: number;
    minBet: number;
    maxBet: number;
    isNew?: boolean;
    isHot?: boolean;
    isVIP?: boolean;
    onClick: () => void;
  }[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h2 className="text-white text-xl font-bold">{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        {games.map(game => (
          <div 
            key={game.id}
            className="relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300 h-64"
            onClick={game.onClick}
          >
            {/* تأثير التوهج الذهبي عند التحويم */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[#D4AF37]/5 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
            
            {/* صورة اللعبة */}
            <img 
              src={game.image} 
              alt={game.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 z-0" 
            />
            
            {/* شارات الحالة */}
            <div className="absolute top-3 right-3 z-20 flex gap-2">
              {game.isNew && (
                <div className="bg-green-500 text-white text-xs rounded px-1.5 py-0.5 uppercase font-bold tracking-wide shadow-lg">جديد</div>
              )}
              {game.isHot && (
                <div className="bg-red-500 text-white text-xs rounded px-1.5 py-0.5 uppercase font-bold tracking-wide shadow-lg">الأكثر شعبية</div>
              )}
              {game.isVIP && (
                <div className="bg-[#D4AF37] text-black text-xs rounded px-1.5 py-0.5 uppercase font-bold tracking-wide shadow-lg">VIP</div>
              )}
            </div>
            
            {/* معلومات اللعبة */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">{game.title}</h3>
              
              <div className="flex items-center gap-3 text-xs text-white/70 mb-3">
                <div className="flex items-center">
                  <User size={12} className="mr-1" />
                  <span>{game.playerCount.toLocaleString()} لاعب</span>
                </div>
                {game.tableCount > 0 && (
                  <div className="flex items-center">
                    <span>•</span>
                    <span className="mx-1">{game.tableCount} طاولة</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-white/70">
                  <span className="text-[#D4AF37]">{game.minBet.toLocaleString()}</span>
                  <span className="mx-1">-</span>
                  <span className="text-[#D4AF37]">{game.maxBet.toLocaleString()}</span>
                  <span className="mr-1">رقاقة</span>
                </div>
                
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 group-hover:shadow-md group-hover:shadow-[#D4AF37]/20 transition-all">
                  <span>العب الآن</span>
                  <ChevronLeft size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* مكون ProfilePopup */}
      <ProfilePopup 
        isOpen={profilePopupOpen} 
        onClose={() => setProfilePopupOpen(false)} 
      />
    </div>
  );
}
