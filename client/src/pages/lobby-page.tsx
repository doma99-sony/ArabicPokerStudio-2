
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
import { LogOut, User, ChevronRight, Loader2, ChevronLeft, ChevronUp, Bell, ShoppingBag, ShoppingCart, Download, Smartphone, ExternalLink, Coins, Trophy, Crown } from "lucide-react";
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
    } else if (gameType === "arabic_rocket") {
      navigate("/arabic-rocket");
    } else if (gameType === "zeus_king") {
      navigate("/zeus-king");
    } else if (gameType === "egypt_queen") {
      navigate("/egypt-queen");
    }
    // ستتم إضافة المزيد من الألعاب لاحقًا
  };

  return (
    <div className="h-screen overflow-hidden bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      
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
                className="border-red-500 text-red-400 hover:bg-red-500/10 h-9 py-0 px-2.5 text-xs bg-black/50 backdrop-blur-sm transition-all duration-300 shadow-md"
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
        {/* Chat Section - Fixed to left - تصميم محسن بتأثيرات زجاجية وذهبية */}
        <div 
          className="fixed top-16 left-0 h-[calc(100%-8rem)] z-20 transition-all duration-500 shadow-2xl shadow-black/50" 
          id="chat-container"
          style={{ transform: isChatHidden ? "translateX(-100%)" : "translateX(0)" }}
        >
          <div className="relative h-full">
            <div className="h-full">
              <div className="rounded-r-2xl overflow-hidden backdrop-blur-sm border-2 border-l-0 border-[#D4AF37] h-full shadow-xl">
                {/* رأس الدردشة مع تأثيرات العمق */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A3A2A]/90 to-[#0A3A2A]/80"></div>
                  <div className="absolute inset-0 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover opacity-10 mix-blend-overlay"></div>
                  <div className="relative p-3 border-b border-[#D4AF37] flex justify-between items-center">
                    <h2 className="text-base font-bold bg-gradient-to-r from-[#D4AF37] to-[#FFC107] bg-clip-text text-transparent">الدردشة العامة</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-[#D4AF37]/80">متصل</span>
                    </div>
                  </div>
                </div>
                
                {/* منطقة الدردشة - تحسينات بصرية وتأثيرات زجاجية */}
                <div className="relative h-[calc(100%-50px)] w-80">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0A3A2A]/60 via-black/50 to-[#0A3A2A]/40"></div>
                  <div className="absolute inset-0 bg-[url('/assets/backgrounds/futuristic-casino-architecture.jpg')] bg-cover opacity-5 mix-blend-overlay"></div>
                  
                  {/* تأثيرات إضاءة متحركة */}
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-3xl animate-pulse-slow opacity-40 mix-blend-screen"></div>
                  
                  <div className="relative h-full w-full backdrop-blur-sm">
                    <ChatBox />
                  </div>
                </div>
              </div>
            </div>
            
            {/* زر التبديل - محسن مع تأثيرات توهج */}
            <button 
              id="chat-toggle"
              className="absolute -right-10 top-1/2 transform -translate-y-1/2 h-20 w-10 bg-gradient-to-l from-[#0A3A2A] to-[#0F1F1A] border-2 border-l-0 border-[#D4AF37] rounded-r-xl flex items-center justify-center shadow-lg shadow-black/50 hover:shadow-[#D4AF37]/20 transition-all duration-300"
              onClick={toggleChat}
            >
              <div className="absolute inset-0 rounded-r-xl overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover mix-blend-overlay"></div>
              </div>
              {isChatHidden ? (
                <ChevronRight className="relative z-10 h-5 w-5 text-[#D4AF37] drop-shadow-gold" />
              ) : (
                <ChevronLeft className="relative z-10 h-5 w-5 text-[#D4AF37] drop-shadow-gold" />
              )}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#D4AF37]/20 rounded-full"></div>
            </button>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto p-4">
          <div className="flex flex-col">
            {/* العناصر الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden">
              {/* تم حذف قسم معلومات اللاعب بناءً على طلب المستخدم */}

              {/* واجهة اختيار الألعاب - قسم عرضي كامل */}
              <div className="w-full">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* بوكر عرباوي - تصميم واضح */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 mt-2 ${activeGameCategory === 'poker' ? 'ring-2 ring-[#D4AF37]' : 'ring-1 ring-[#D4AF37]'} hover:scale-[1.02] transition-all duration-300 cursor-pointer order-first md:order-first`}
                      onClick={() => {
                        setActiveGameCategory('poker');
                        navigateToGameTables('poker');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#1B4D3E]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">VIP</div>
                            <div className="bg-[#22c55e] text-white font-bold text-xs p-1 px-2 rounded-md">HOT</div>
                          </div>
                          <div className="w-10 h-10 bg-[#0A3A2A] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                            <span className="text-[#D4AF37] text-lg">♠️</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-[#D4AF37] font-bold text-lg">بوكر عرباوي</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-[#D4AF37]"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                            <span className="text-[#D4AF37] font-bold">٤٢٠</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-[#D4AF37]">
                            <span className="text-[#D4AF37] font-bold">٢٣</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-1.5 px-3 bg-[#D4AF37] text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
                          >
                            <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-black">♣</span>
                            </div>
                            ابدأ اللعب الآن
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>



                    {/* نارتو - تصميم واضح */}
                    <div 
                      className={`relative flex flex-col h-[145px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : 'ring-1 ring-orange-500'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => {
                        setActiveGameCategory('naruto');
                        navigateToGameTables('naruto');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#FF8C00]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-orange-500 text-white font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                          </div>
                          <div className="w-10 h-10 bg-orange-800 rounded-full border-2 border-orange-400 flex items-center justify-center">
                            <span className="text-white text-lg">忍</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-white font-bold text-lg">ناروتو</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-orange-500"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-orange-400">
                            <span className="text-orange-200 font-bold">١٨٥</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-orange-400">
                            <span className="text-orange-200 font-bold">١٢</span> غرفة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-1.5 px-3 bg-orange-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
                          >
                            <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white">⚔️</span>
                            </div>
                            استكشف عالم ناروتو
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* دومينو - تصميم واضح */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-500' : 'ring-1 ring-blue-500'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => {
                        setActiveGameCategory('domino');
                        navigateToGameTables('domino');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#1E3A8A]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-blue-500 text-white font-bold text-xs p-1 px-2 rounded-md">شائع</div>
                            <div className="bg-red-500 text-white font-bold text-xs p-1 px-2 rounded-md">٪٥٠+</div>
                          </div>
                          <div className="w-10 h-10 bg-blue-900 rounded-full border-2 border-blue-400 flex items-center justify-center">
                            <span className="text-white text-lg">🎲</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-white font-bold text-lg">دومينو</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-blue-500"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-blue-400">
                            <span className="text-blue-200 font-bold">٢٥٠</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-blue-400">
                            <span className="text-blue-200 font-bold">٤٥</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-1.5 px-3 bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
                          >
                            <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white text-xs">١•٢</span>
                            </div>
                            العب الدومينو الآن
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* تيكن - قريباً - تصميم واضح */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : 'ring-1 ring-red-600'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => setActiveGameCategory('tekken')}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#9A1212]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-yellow-500 text-black font-bold text-xs p-1 px-2 rounded-md">قريباً</div>
                          </div>
                          <div className="w-10 h-10 bg-red-900 rounded-full border-2 border-red-400 flex items-center justify-center">
                            <span className="text-white text-lg">鉄</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-white font-bold text-lg">تيكن</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-red-500"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-red-400">
                            <span className="text-red-200 font-bold">٠</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-red-400">
                            <span className="text-red-200 font-bold">٠</span> غرفة
                          </div>
                        </div>
                        
                        {/* زر الدخول - مع طبقة بلر */}
                        <div className="mt-auto relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-lg">
                            <div className="bg-yellow-500 text-black font-bold px-4 py-1 rounded-lg animate-pulse">
                              قريباً
                            </div>
                          </div>
                          <button 
                            disabled
                            className="w-full py-1.5 px-3 bg-red-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 opacity-50 border border-black/30"
                          >
                            <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center">
                              <span className="text-white">👊</span>
                            </div>
                            استعد للقتال
                            <ChevronRight className="mr-1 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* صاروخ عرباوي - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'arabic_rocket' ? 'ring-2 ring-green-600' : 'ring-1 ring-green-600'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => {
                        setActiveGameCategory('arabic_rocket');
                        navigateToGameTables('arabic_rocket');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#1E5B3C]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-green-500 text-white font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                            <div className="bg-red-500 text-white font-bold text-xs p-1 px-2 rounded-md">HOT</div>
                          </div>
                          <div className="w-10 h-10 bg-green-800 rounded-full border-2 border-green-400 flex items-center justify-center">
                            <span className="text-white text-lg">🚀</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-green-400 font-bold text-lg">صاروخ عرباوي</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-green-400"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-green-400">
                            <span className="text-green-400 font-bold">١٨٠</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-green-400">
                            <span className="text-green-400 font-bold">١٥</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-1.5 px-3 bg-green-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
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

                    {/* الملك زايوس - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'zeus_king' ? 'ring-2 ring-yellow-500' : 'ring-1 ring-yellow-500'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => {
                        setActiveGameCategory('zeus_king');
                        navigateToGameTables('zeus_king');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#3A2B1D]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-yellow-500 text-black font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                            <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded-md">VIP</div>
                          </div>
                          <div className="w-10 h-10 bg-yellow-800 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                            <span className="text-white text-lg">⚡</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-yellow-400 font-bold text-lg">الملك زايوس</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-yellow-400"></div>
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
                            className="w-full py-1.5 px-3 bg-yellow-500 text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
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

                    {/* ملكه مصر - تصميم جديد */}
                    <div 
                      className={`relative flex flex-col h-[160px] w-full rounded-xl overflow-hidden shadow-lg mb-4 ${activeGameCategory === 'egypt_queen' ? 'ring-2 ring-purple-600' : 'ring-1 ring-purple-600'} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                      onClick={() => {
                        setActiveGameCategory('egypt_queen');
                        navigateToGameTables('egypt_queen');
                      }}
                    >
                      {/* خلفية اللعبة - لون ثابت */}
                      <div className="absolute inset-0 bg-[#2D1B43]"></div>
                      
                      {/* محتوى البطاقة */}
                      <div className="relative flex flex-col h-full z-10 p-3">
                        {/* رأس البطاقة */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1.5">
                            <div className="bg-purple-500 text-white font-bold text-xs p-1 px-2 rounded-md">جديد</div>
                            <div className="bg-pink-500 text-white font-bold text-xs p-1 px-2 rounded-md">HOT</div>
                          </div>
                          <div className="w-10 h-10 bg-purple-800 rounded-full border-2 border-purple-400 flex items-center justify-center">
                            <span className="text-white text-lg">👑</span>
                          </div>
                        </div>
                        
                        {/* عنوان اللعبة */}
                        <div className="mt-1 mb-1">
                          <h3 className="text-purple-400 font-bold text-lg">ملكه مصر</h3>
                          <div className="mt-0.5 w-full h-0.5 bg-purple-400"></div>
                        </div>
                        
                        {/* تفاصيل إضافية */}
                        <div className="my-1 text-xs text-white flex gap-2">
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-purple-400">
                            <span className="text-purple-400 font-bold">١٥٥</span> لاعب
                          </div>
                          <div className="bg-black/40 rounded-md px-2 py-0.5 border border-purple-400">
                            <span className="text-purple-400 font-bold">٩</span> طاولة
                          </div>
                        </div>
                        
                        {/* زر الدخول */}
                        <div className="mt-auto">
                          <button 
                            className="w-full py-1.5 px-3 bg-purple-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 border border-black/30"
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