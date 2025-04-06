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

export default function LobbyPage() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
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
                    onClick={() => navigate("/profile")}
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
          <ChatBox />
        </div>

        {/* Chat Toggle Button */}
        <button 
          onClick={toggleChat}
          className="fixed top-1/2 left-0 transform -translate-y-1/2 z-30 bg-gradient-to-r from-[#0A3A2A] to-[#0F1F1A] text-[#D4AF37] p-1.5 rounded-r-lg shadow-md border-[1px] border-l-0 border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all duration-300"
        >
          {isChatHidden ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Game Cards Container */}
        <div className="container mx-auto h-full px-4 py-6">
          <div className="flex h-full">
            {/* القسم الأيمن (القائمة الرئيسية) - بوكر تكساس */}
            <div className="w-full md:w-1/2 ml-0 md:ml-6 grid">
              <div className="w-full h-full">
                {/* بوكر تكساس كبطاقة رئيسية */}
                <div 
                  className={`relative flex h-full w-full rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 cursor-pointer group ${activeGameCategory === 'poker' ? 'scale-100' : 'scale-[0.98] opacity-95'}`}
                  style={{
                    boxShadow: activeGameCategory === 'poker' ? 
                      '0 0 20px 5px rgba(212, 175, 55, 0.5), 0 0 40px 10px rgba(212, 175, 55, 0.2)' : 
                      '0 10px 30px -5px rgba(0, 0, 0, 0.3)'
                  }}
                  onClick={() => {
                    setActiveGameCategory('poker');
                    navigate("/poker-tables");
                  }}
                >
                  {/* خلفية متحركة للعبة */}
                  <div className="absolute inset-0 overflow-hidden">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="absolute w-full h-full object-cover scale-110"
                    >
                      <source src="/assets/backgrounds/poker-cards-gold.mp4" type="video/mp4" />
                    </video>
                    
                    {/* طبقات التأثير */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0A3A2A]/80 via-black/70 to-[#0A3A2A]/80"></div>
                    <div className="absolute inset-0 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover opacity-20 mix-blend-soft-light"></div>
                    <div className="absolute inset-0 bg-[url('/images/pattern-overlay.png')] bg-repeat opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent h-40"></div>
                    
                    {/* إضافة تأثيرات إضاءة للخلفية */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl animate-pulse-slow group-hover:opacity-75 opacity-30 mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl animate-pulse-slow opacity-50 mix-blend-screen"></div>
                  </div>
                  
                  {/* إطار متوهج */}
                  <div className={`absolute inset-0 rounded-2xl border-2 ${activeGameCategory === 'poker' ? 'border-[#D4AF37]' : 'border-[#D4AF37]/30'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                  {activeGameCategory === 'poker' && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#D4AF37]/20 animate-pulse-slow"></div>
                  )}
                  
                  {/* محتوى البطاقة */}
                  <div className="relative flex flex-col h-full w-full z-10 p-6 md:p-8 group-hover:p-7 md:group-hover:p-9 transition-all duration-500">
                    <div className="flex items-start justify-between">
                      {/* عنوان اللعبة */}
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFC107] bg-clip-text text-transparent">
                            بوكر تكساس عرباوي
                          </span>
                        </h2>
                        <p className="text-[#D4AF37]/90 text-sm md:text-base max-w-md">
                          استمتع بأفضل تجربة بوكر باللهجة العربية! شارك في الطاولات المختلفة وتنافس مع لاعبين من جميع أنحاء الوطن العربي
                        </p>
                      </div>
                      
                      {/* شعار اللعبة */}
                      <div className="hidden md:block relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#D4AF37]/80 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3A2A] to-black"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[#D4AF37] text-4xl">♠</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* معلومات اللعبة والإحصائيات */}
                    <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
                      <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg py-3 px-1 shadow-inner border border-[#D4AF37]/10">
                        <p className="text-sm text-gray-300">اللاعبون النشطون</p>
                        <p className="text-xl text-[#D4AF37] font-bold">23</p>
                      </div>
                      <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg py-3 px-1 shadow-inner border border-[#D4AF37]/10">
                        <p className="text-sm text-gray-300">الطاولات المتاحة</p>
                        <p className="text-xl text-[#D4AF37] font-bold">8</p>
                      </div>
                      <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg py-3 px-1 shadow-inner border border-[#D4AF37]/10 col-span-2 md:col-span-1">
                        <p className="text-sm text-gray-300">أعلى رهان حالي</p>
                        <p className="text-xl text-[#D4AF37] font-bold">250,000</p>
                      </div>
                    </div>
                    
                    {/* ميزات اللعبة */}
                    <div className="mt-6 md:mt-auto">
                      <p className="text-white/80 text-xs md:text-sm mb-3">مميزات اللعبة:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                          <span className="mr-1">♠</span>
                          تكساس هولدم
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                          <Crown size={12} className="mr-1" />
                          بطولات
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                          <span className="mr-1">👥</span>
                          متعدد اللاعبين
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]">
                          <Bell size={12} className="mr-1" />
                          تنبيهات مباشرة
                        </span>
                      </div>
                      
                      {/* زر الدخول */}
                      <div className="mt-auto">
                        <button 
                          className="w-full py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#FFC107] text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30 shadow-lg transform group-hover:translate-y-0 group-hover:scale-105 transition-all duration-300"
                        >
                          <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                            <span className="text-black">♦</span>
                          </div>
                          ابدأ اللعب الآن
                          <ChevronRight className="mr-1 h-4 w-4 animate-bounce-x" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              
            {/* القسم الأيسر - بطاقات الألعاب الأخرى */}
            <div className="md:w-1/2">
              <div className="grid grid-cols-1 gap-4 w-full">
              
                {/* الألعاب الأخرى تم حذفها لتبسيط الكود - سيتم إضافتها لاحقًا بناءً على طلب المستخدم */}
              
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        )}
      </button>

      {/* أيقونة تذييل للناس الجدد */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-[#0A3A2A]/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-[#D4AF37]/30">
          <button
            className="flex items-center justify-center p-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
            onClick={() => navigate("/how-to-play")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          <span className="text-[#D4AF37] text-sm">جديد؟ تعلم كيفية اللعب</span>
          <ChevronUp className="h-4 w-4 text-[#D4AF37] animate-bounce" />
        </div>
      </div>
      
      {/* شريط سفلي للإعلانات والعروض */}
      <div className="fixed bottom-0 left-0 w-full h-12 bg-gradient-to-r from-black/90 via-[#0A3A2A]/90 to-black/90 z-40 backdrop-blur-sm border-t border-[#D4AF37]/20 shadow-lg">
        <div className="h-full flex items-center justify-center px-4">
          <div className="flex items-center gap-1.5 text-[#D4AF37]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span className="text-sm font-medium">احصل على 1000 رقاقة مجانية عند الاشتراك لأول مرة!</span>
            <button className="ml-2 bg-[#D4AF37] text-black text-xs font-bold py-1 px-2 rounded-md hover:bg-[#FFC107] transition-all">
              الحصول على الرقاقات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}