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

      {/* واجهة اللعبة الرئيسية */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* الشات - مخفي بشكل افتراضي في الجوال */}
        <div 
          id="chat-container" 
          className="w-full sm:w-80 md:w-96 h-full absolute left-0 top-0 z-30 sm:relative transform transition-transform duration-300 ease-in-out"
          style={{ transform: isChatHidden ? 'translateX(-100%)' : 'translateX(0)' }}
        >
          {/* طبقات الخلفية للشات */}
          <div className="relative h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A3A2A]/90 via-[#0A3A2A]/80 to-[#0A3A2A]/95"></div>
            <div className="absolute inset-0 bg-[url('/images/arab-pattern.png')] bg-repeat opacity-5"></div>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl"></div>
            </div>
            
            {/* مؤثرات الحدود */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/30 to-[#D4AF37]/10"></div>
            <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-[#D4AF37]/10 via-[#D4AF37]/30 to-[#D4AF37]/10"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/30 to-[#D4AF37]/10"></div>
            
            {/* محتوى الشات */}
            <div className="relative z-10 h-full flex flex-col">
              <ChatBox />
            </div>
          </div>
        </div>
        
        {/* زر تبديل الشات */}
        <button 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-40 bg-[#0A3A2A] text-[#D4AF37] rounded-r-md p-1 shadow-md border-y border-r border-[#D4AF37]/50 hover:bg-[#0A3A2A]/80 transition-all duration-300"
          onClick={toggleChat}
        >
          {isChatHidden ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* المحتوى الرئيسي - منطقة الألعاب */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* تأثيرات إضافية للخلفية */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-black/40 to-transparent"></div>
            <div className="absolute top-0 right-0 h-full w-1/5 bg-gradient-to-l from-black/40 to-transparent"></div>
          </div>
          
          {/* محتوى الألعاب */}
          <div className="container mx-auto p-4">
            <div className="flex flex-col">
              {/* العناصر الرئيسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
                {/* تم حذف قسم معلومات اللاعب بناءً على طلب المستخدم */}

                {/* واجهة اختيار الألعاب - قسم عرضي كامل */}
                <div className="w-full">
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                      {/* القسم الأيمن - بوكر عرباوي */}
                      <div className="md:w-1/2">
                        <div className="grid grid-cols-1 gap-4 w-full">
                          {/* بوكر عرباوي - تصميم محسّن مع تأثيرات حركية */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 mt-2 transform transition-all duration-500 cursor-pointer order-first md:order-first group`}
                            style={{
                              boxShadow: activeGameCategory === 'poker' ? 
                                '0 0 15px 5px rgba(212, 175, 55, 0.5), 0 0 30px 10px rgba(212, 175, 55, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('poker');
                              navigateToGameTables('poker');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0A3A2A] to-[#051A15] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/poker-pattern.jpg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إطار ذهبي متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'poker' ? 'border-[#D4AF37]' : 'border-[#D4AF37]/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'poker' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-[#D4AF37]/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">شعبية</div>
                                  <div className="bg-green-500 text-white font-bold text-xs p-1 px-2 rounded-md">نشطة</div>
                                </div>
                                <div className="w-10 h-10 bg-[#0A3A2A] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                                  <span className="text-[#D4AF37] text-xl font-bold">♠</span>
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-[#D4AF37] font-bold text-lg">بوكر عرباوي اونلاين</h3>
                                <div className="mt-1 w-full h-0.5 bg-[#D4AF37]"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                                  <span className="text-[#D4AF37] font-bold">٢٣٤</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                                  <span className="text-[#D4AF37] font-bold">١٥</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-[#D4AF37] text-black font-bold text-sm rounded-lg border border-black/30 flex items-center justify-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">♠</span>
                                  </div>
                                  العب الآن
                                  <ChevronRight className="mr-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* نقل بطاقة ملكة مصر إلى هنا (إضافة) */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 transform transition-all duration-500 cursor-pointer group`}
                            style={{
                              boxShadow: activeGameCategory === 'egypt_queen' ? 
                                '0 0 15px 5px rgba(147, 51, 234, 0.5), 0 0 30px 10px rgba(147, 51, 234, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('egypt_queen');
                              navigateToGameTables('egypt_queen');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B43] to-[#1A0F26] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/egyptian-pattern.svg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إطار متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'egypt_queen' ? 'border-purple-600' : 'border-purple-600/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'egypt_queen' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-purple-400/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-purple-600 text-white font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">VIP</div>
                                </div>
                                <div className="w-10 h-10 bg-purple-900 rounded-full border-2 border-purple-400 flex items-center justify-center">
                                  <img src="/images/egypt-queen-icon.svg" alt="ملكة مصر" className="w-6 h-6" />
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-purple-400 font-bold text-lg">ملكة مصر</h3>
                                <div className="mt-1 w-full h-0.5 bg-purple-400"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-purple-400">
                                  <span className="text-purple-400 font-bold">١٤٥</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-purple-400">
                                  <span className="text-purple-400 font-bold">١٠</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-purple-600 text-white font-bold text-sm rounded-lg border border-black/30 flex items-center justify-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">👑</span>
                                  </div>
                                  العب الآن
                                  <ChevronRight className="mr-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* نقل بطاقة الملك زايوس إلى هنا (إضافة) */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 transform transition-all duration-500 cursor-pointer group`}
                            style={{
                              boxShadow: activeGameCategory === 'zeus_king' ? 
                                '0 0 15px 5px rgba(250, 204, 21, 0.5), 0 0 30px 10px rgba(250, 204, 21, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('zeus_king');
                              navigateToGameTables('zeus_king');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#3A2B1D] to-[#1A1814] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/greek-pattern.svg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-yellow-500/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إطار متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'zeus_king' ? 'border-yellow-500' : 'border-yellow-500/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'zeus_king' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-yellow-400/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-yellow-500 text-black font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">VIP</div>
                                </div>
                                <div className="w-10 h-10 bg-yellow-800 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                                  <img src="/images/zeus-king-icon.svg" alt="الملك زايوس" className="w-6 h-6" />
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-yellow-400 font-bold text-lg">الملك زايوس</h3>
                                <div className="mt-1 w-full h-0.5 bg-yellow-400"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-yellow-400">
                                  <span className="text-yellow-400 font-bold">١٣٥</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-yellow-400">
                                  <span className="text-yellow-400 font-bold">١٢</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-yellow-500 text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">⚡</span>
                                  </div>
                                  العب الآن
                                  <ChevronRight className="mr-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* القسم الأيسر - الألعاب الأخرى */}
                      <div className="md:w-1/2">
                        <div className="grid grid-cols-1 gap-4 w-full">
                          {/* بوكر العرب - تصميم محسّن مع تأثيرات حركية */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 mt-2 transform transition-all duration-500 cursor-pointer group game-card-glow hover:scale-105`}
                            style={{
                              boxShadow: activeGameCategory === 'arab_poker' ? 
                                '0 0 15px 5px rgba(212, 175, 55, 0.5), 0 0 30px 10px rgba(212, 175, 55, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('arab_poker');
                              navigateToGameTables('arab_poker');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50] to-[#1A2530] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/arabic-pattern.jpg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#D4AF37]/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إضافة تأثيرات خاصة لبوكر العرب: خطوط متحركة ولمعان */}
                            <div className="absolute inset-0 overflow-hidden opacity-10 mix-blend-screen">
                              <div className="absolute inset-0 top-1/4 left-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent h-[2px] w-full animate-float-slow"></div>
                              <div className="absolute inset-0 top-1/2 left-0 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent h-[1px] w-full animate-float-slow-reverse"></div>
                              <div className="absolute inset-0 top-3/4 left-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent h-[2px] w-full animate-float-slow"></div>
                            </div>
                            
                            {/* إضافة نقاط لمعان متحركة */}
                            <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-[#D4AF37] opacity-70 animate-pulse-slow"></div>
                            <div className="absolute top-3/4 right-1/3 w-1 h-1 rounded-full bg-[#D4AF37] opacity-70 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/2 left-2/3 w-1 h-1 rounded-full bg-[#D4AF37] opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                            
                            {/* إطار ذهبي متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'arab_poker' ? 'border-[#D4AF37]' : 'border-[#D4AF37]/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'arab_poker' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-[#D4AF37]/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-red-500 text-white font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">عربي</div>
                                </div>
                                <div className="w-10 h-10 bg-[#2C3E50] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                                  <span className="text-[#D4AF37] text-xl font-bold">♥</span>
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-[#D4AF37] font-bold text-lg">بوكر العرب الجديد</h3>
                                <div className="mt-1 w-full h-0.5 bg-[#D4AF37]"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                                  <span className="text-[#D4AF37] font-bold">١٨٧</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                                  <span className="text-[#D4AF37] font-bold">٨</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-[#D4AF37] text-black font-bold text-sm rounded-lg border border-black/30 flex items-center justify-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">♥</span>
                                  </div>
                                  العب الآن
                                  <ChevronRight className="mr-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* صاروخ العرب - تصميم محسّن مع تأثيرات حركية */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 transform transition-all duration-500 cursor-pointer group`}
                            style={{
                              boxShadow: activeGameCategory === 'arabic_rocket' ? 
                                '0 0 15px 5px rgba(239, 68, 68, 0.5), 0 0 30px 10px rgba(239, 68, 68, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('arabic_rocket');
                              navigateToGameTables('arabic_rocket');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#7F1D1D] to-[#450A0A] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/rocket-pattern.jpg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-500/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-red-500/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إطار متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'arabic_rocket' ? 'border-red-500' : 'border-red-500/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'arabic_rocket' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-red-400/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-red-600 text-white font-bold text-xs p-1 px-2 rounded-md">شعبية</div>
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                                </div>
                                <div className="w-10 h-10 bg-red-900 rounded-full border-2 border-red-400 flex items-center justify-center">
                                  <span className="text-white text-xl">🚀</span>
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-red-400 font-bold text-lg">صاروخ العرب</h3>
                                <div className="mt-1 w-full h-0.5 bg-red-400"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-red-400">
                                  <span className="text-red-400 font-bold">٢٥٦</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-red-400">
                                  <span className="text-red-400 font-bold">٢٥</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-red-600 text-white font-bold text-sm rounded-lg border border-black/30 flex items-center justify-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">🚀</span>
                                  </div>
                                  العب الآن
                                  <ChevronRight className="mr-1 h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* دومينو - تصميم محسّن مع تأثيرات حركية */}
                          <div 
                            className={`relative flex flex-col h-[180px] w-full rounded-xl overflow-hidden shadow-2xl mb-4 transform transition-all duration-500 cursor-pointer group`}
                            style={{
                              boxShadow: activeGameCategory === 'domino' ? 
                                '0 0 15px 5px rgba(34, 211, 238, 0.5), 0 0 30px 10px rgba(34, 211, 238, 0.2)' : 
                                '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={() => {
                              setActiveGameCategory('domino');
                              navigateToGameTables('domino');
                            }}
                          >
                            {/* خلفية اللعبة - تأثيرات متعددة */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#164E63] to-[#083344] transition-all duration-500 group-hover:scale-110"></div>
                            <div className="absolute inset-0 bg-[url('/images/domino-pattern.jpg')] bg-cover opacity-15 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* إضافة تأثيرات إضاءة متحركة */}
                            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl group-hover:translate-x-5 group-hover:translate-y-5 transition-all duration-700 animate-pulse-slow"></div>
                            <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl group-hover:translate-x-10 group-hover:translate-y-5 transition-all duration-700"></div>
                            
                            {/* إطار متوهج */}
                            <div className={`absolute inset-0 rounded-xl border-2 ${activeGameCategory === 'domino' ? 'border-cyan-500' : 'border-cyan-500/50'} opacity-60 group-hover:opacity-100 transition-all duration-500 z-[1]`}></div>
                            {activeGameCategory === 'domino' && (
                              <div className="absolute inset-0 rounded-xl border-2 border-cyan-400/30 animate-pulse-slow"></div>
                            )}
                            
                            {/* محتوى البطاقة */}
                            <div className="relative flex flex-col h-full z-10 p-3 group-hover:p-4 transition-all duration-500">
                              {/* رأس البطاقة */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1.5">
                                  <div className="bg-cyan-600 text-white font-bold text-xs p-1 px-2 rounded-md">كلاسيكية</div>
                                  <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">عربي</div>
                                </div>
                                <div className="w-10 h-10 bg-cyan-900 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                                  <span className="text-white text-xl">🎲</span>
                                </div>
                              </div>
                              
                              {/* عنوان اللعبة */}
                              <div className="mt-2 mb-2">
                                <h3 className="text-cyan-400 font-bold text-lg">دومينو العرب</h3>
                                <div className="mt-1 w-full h-0.5 bg-cyan-400"></div>
                              </div>
                              
                              {/* تفاصيل إضافية */}
                              <div className="my-1 text-xs text-white flex gap-2">
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-cyan-400">
                                  <span className="text-cyan-400 font-bold">١٧٢</span> لاعب
                                </div>
                                <div className="bg-black/40 rounded-md px-2 py-0.5 border border-cyan-400">
                                  <span className="text-cyan-400 font-bold">١٨</span> طاولة
                                </div>
                              </div>
                              
                              {/* زر الدخول */}
                              <div className="mt-auto">
                                <button 
                                  className="w-full py-2 px-3 bg-cyan-600 text-white font-bold text-sm rounded-lg border border-black/30 flex items-center justify-center gap-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                                    <span className="text-white">🎲</span>
                                  </div>
                                  العب الآن
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        )}
      </button>

      {/* زر سريع للعودة لأعلى الصفحة */}
      <button 
        className="fixed bottom-4 right-4 z-50 bg-[#D4AF37] p-2 rounded-full text-black hover:bg-[#FFD700] transition-all shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </div>
  );
}