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
  const [showProfile, setShowProfile] = useState(false);
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
    // تهيئة الدردشة كمرئية عند تحميل الصفحة
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
    } else if (gameType === "arabic_rocket") {
      navigate("/arabic-rocket");
    } else if (gameType === "zeus_king") {
      navigate("/zeus-king");
    } else if (gameType === "egypt_rocket") {
      navigate("/egypt-rocket");
    } else if (gameType === "arab_poker") {
      navigate("/arab-poker");
    }
    // ستتم إضافة المزيد من الألعاب لاحقًا
  };

  return (
    <>
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
                      onClick={navigateToProfile}
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
            </div>

            {/* القسم الأيمن (الشعار) */}
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
                <Button 
                  variant="outline" 
                  className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0 px-2.5 text-xs bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-md hover:shadow-[#D4AF37]/20"
                  onClick={() => setShowProfile(true)}
                >
                  <User size={16} className="ml-1" />
                  <span className="hidden md:inline">الملف</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* محتويات الصفحة الرئيسية */}
        <main className="flex-grow overflow-auto relative z-10 py-6">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">مرحباً في اللوبي الرئيسي</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* بطاقات الألعاب المتوفرة */}
              {["البوكر العادي", "صاروخ مصر", "لعبة الضومنة", "ملك زيوس"].map((game, index) => (
                <div key={index} className="bg-black/50 backdrop-blur-sm rounded-lg border border-[#D4AF37]/30 p-4 hover:border-[#D4AF37] transition-all duration-300">
                  <h3 className="text-[#D4AF37] text-lg font-bold mb-2">{game}</h3>
                  <p className="text-white/70 mb-4 text-sm">وصف اللعبة المتوفرة هنا...</p>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#C19B30] text-black" onClick={() => {
                    switch(index) {
                      case 0: navigateToGameTables("poker"); break;
                      case 1: navigateToGameTables("egypt_rocket"); break;
                      case 2: navigateToGameTables("domino"); break;
                      case 3: navigateToGameTables("zeus_king"); break;
                    }
                  }}>
                    العب الآن
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      
      {/* نافذة الملف الشخصي */}
      {showProfile && (
        <ProfilePopup onClose={() => setShowProfile(false)} isOpen={showProfile} />
      )}
    </>
  );
}