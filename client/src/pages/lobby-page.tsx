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
  }, [user, globalWs, ws]);

  useEffect(() => {
    // تغيير العنوان عند تغيير فئة اللعبة
    document.title = activeGameCategory === "poker" 
      ? "قاعة البوكر العربية | البوكر بدون تحميل" 
      : activeGameCategory === "slots" 
        ? "ماكينات القمار العربية | العب مجاناً بدون تحميل"
        : activeGameCategory === "crash"
          ? "لعبة كراش الصاروخ | العب مجاناً بدون تحميل"
          : "منصة الالعاب العربية | العب مجاناً وبدون تحميل";
  }, [activeGameCategory]);

  // كتم الصوت أو تشغيله
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setVideoMuted(videoRef.current.muted);
    
    // حفظ حالة الصوت في التخزين المحلي
    localStorage.setItem('videoMuted', videoRef.current.muted ? 'true' : 'false');
  };

  // استرجاع حالة الصوت عند التحميل
  useEffect(() => {
    const savedMuteState = localStorage.getItem('videoMuted');
    if (savedMuteState !== null && videoRef.current) {
      const shouldMute = savedMuteState === 'true';
      videoRef.current.muted = shouldMute;
      setVideoMuted(shouldMute);
    }
  }, []);

  const handleGameClick = (type: GameType, gameId: string) => {
    if (user) {
      navigate(`/${gameId}`);
    } else {
      navigate("/login");
    }
  };

  // ضبط عرض الشاشة
  const toggleChat = () => {
    setIsChatHidden(!isChatHidden);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate(undefined);
  };

  return (
    <div className="h-screen overflow-hidden bg-cover bg-center flex flex-col"
      style={{
        backgroundImage: "url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')",
      }}
    >
      {/* طبقات الخلفية الإضافية (متعددة) */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* فيديو في الخلفية - رائع ومذهل */}
        <video
          ref={videoRef}
          className="absolute inset-0 object-cover w-full h-full"
          autoPlay
          loop
          muted
          playsInline
          style={{ opacity: 0.15 }}
        >
          <source src="/assets/backgrounds/Neon_Lights_3840x2160.mp4" type="video/mp4" />
        </video>
        
        {/* تراكبات مختلفة */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A3A2A]/50 via-black/60 to-[#0A3A2A]/70 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('/assets/backgrounds/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover opacity-30 mix-blend-soft-light"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 to-transparent h-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent h-32 pointer-events-none"></div>
        
        {/* إضافة طبقات ضباب للعمق والأبعاد */}
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
            <div className="hidden sm:flex items-center gap-2 text-white/80">
              <OnlineUsersCounter />
            </div>
           
            {user && (
              <div className="flex gap-2">
                <ResetChipsButton />
                <RemoveVirtualPlayersButton />
              </div>
            )}
          </div>
          
          {/* القسم الأوسط - العلامة التجارية للموقع */}
          <div className="text-center flex items-center">
            <div className="relative group cursor-pointer" onClick={() => navigate("/")}>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9]">
                  عرباوي
                </span>
              </h1>
              
              {/* تأثير الوهج تحت الشعار */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-1 rounded-full bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/70 to-[#D4AF37]/0"></div>
              
              {/* تأثير التوهج عند التحويم */}
              <div className="absolute inset-0 rounded-lg bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 transition-all duration-300 blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* القسم الأيمن - الرصيد ومعلومات المستخدم */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* قسم معلومات اللاعب برصيد مميز */}
                <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-[#D4AF37]/30">
                  <div className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] rounded-full p-0.5">
                    <div className="bg-black/90 rounded-full p-1 relative">
                      <User size={16} className="text-[#D4AF37]" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    </div>
                  </div>
                  
                  <span className="text-white font-semibold text-sm max-w-28 truncate">{user.username}</span>
                  
                  <div className="relative group">
                    <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#F1E2B9]/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-[#D4AF37]/20">
                      <Coins size={14} className="text-[#D4AF37]" />
                      <span className="text-[#D4AF37] font-bold text-xs">{formatChips(user.chips)}</span>
                    </div>
                    
                    {/* التأثير عند التحويم */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[#D4AF37]/0 to-[#F1E2B9]/0 group-hover:from-[#D4AF37]/20 group-hover:to-[#F1E2B9]/20 rounded-full transition-all duration-300"></div>
                  </div>
                </div>
                
                {/* زر تسجيل الخروج بتصميم مميز */}
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="bg-black/30 hover:bg-black/50 backdrop-blur-md text-[#D4AF37] p-2 rounded-full transition-all duration-300 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 group"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => navigate("/login")}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37]"
                  onClick={() => navigate("/register")}
                >
                  التسجيل
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* أزرار الفئات الرئيسية */}
      <div className="relative z-10 border-b border-[#D4AF37]/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto flex justify-center px-4 relative">
          <div className="flex space-x-1 rtl:space-x-reverse overflow-x-auto scrollbar-hide">
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative ${
                activeGameCategory === "poker"
                  ? "text-[#D4AF37]"
                  : "text-gray-400 hover:text-[#D4AF37]/80"
              }`}
              onClick={() => setActiveGameCategory("poker")}
            >
              البوكر
              {activeGameCategory === "poker" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20"></div>
              )}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative ${
                activeGameCategory === "slots"
                  ? "text-[#D4AF37]"
                  : "text-gray-400 hover:text-[#D4AF37]/80"
              }`}
              onClick={() => setActiveGameCategory("slots")}
            >
              سلوتس
              {activeGameCategory === "slots" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20"></div>
              )}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative ${
                activeGameCategory === "crash"
                  ? "text-[#D4AF37]"
                  : "text-gray-400 hover:text-[#D4AF37]/80"
              }`}
              onClick={() => setActiveGameCategory("crash")}
            >
              كراش
              {activeGameCategory === "crash" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20"></div>
              )}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 relative ${
                activeGameCategory === "special"
                  ? "text-[#D4AF37]"
                  : "text-gray-400 hover:text-[#D4AF37]/80"
              }`}
              onClick={() => setActiveGameCategory("special")}
            >
              ألعاب خاصة
              {activeGameCategory === "special" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* محتوى الصفحة الرئيسية */}
      <main className="flex-grow relative z-10 overflow-auto">
        <div className="flex h-full">
          {/* قسم المحتوى الرئيسي - ألعاب متاحة */}
          <div className={`flex-grow overflow-y-auto transition-all duration-300`}>
            {/* عرض الألعاب بحسب الفئة المحددة */}
            <div className="p-6">
              {activeGameCategory === "poker" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9]">
                        ألعاب البوكر المباشرة
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {/* بوكر تكساس عرباوي */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("poker", "arab-poker")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src="/images/poker-room-bg.jpg" 
                            alt="بوكر تكساس عرباوي" 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-all duration-500 transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              متاح الآن
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                              طاولات نشطة: 12
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <img src="/images/arab-poker-logo.png" alt="بوكر تكساس عرباوي" className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">بوكر تكساس عرباوي</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">العب البوكر التقليدي ضد لاعبين عرب حقيقيين أو ضد لاعبين وهميين</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-1.png" alt="" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-2.png" alt="" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-3.png" alt="" />
                                <span className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-black bg-black text-[#D4AF37] text-xs">+38</span>
                              </div>
                              
                              <button className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37] text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                ابدأ اللعب
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ملكة مصر */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("poker", "egypt-queen")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src="/images/egyptian-pattern.svg" 
                            alt="ملكة مصر" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#614023]/60 via-[#614023]/40 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              متاح الآن
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                              طاولات نشطة: 5
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <img src="/images/egypt-queen-icon.svg" alt="ملكة مصر" className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">ملكة مصر</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">بوكر بطابع مصري فرعوني مميز، مع رموز وقواعد مستوحاة من الحضارة المصرية القديمة</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-4.png" alt="" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-5.png" alt="" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-6.png" alt="" />
                                <span className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-black bg-black text-[#D4AF37] text-xs">+14</span>
                              </div>
                              
                              <button className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37] text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                ابدأ اللعب
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ملك زيوس */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("poker", "zeus-king")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src="/images/greek-pattern.svg" 
                            alt="ملك زيوس" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#16456e]/60 via-[#16456e]/40 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <img src="/images/zeus-king-icon.svg" alt="ملك زيوس" className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">ملك زيوس</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">بوكر بطابع إغريقي مميز، مع رموز وقواعد مستوحاة من أساطير الإغريق القديمة</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-7.png" alt="" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-8.png" alt="" />
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ناروتو بوكر */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("poker", "naruto-poker")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#FF8000]/30 via-[#FF8000]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#FF8000]/30 via-[#FF8000]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#FF8000]/20 rounded-full p-6 border-2 border-[#FF8000]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <path d="M20 15C20 18.866 16.418 22 12 22C7.582 22 4 18.866 4 15C4 11.134 7.582 8 12 8C16.418 8 20 11.134 20 15Z" fill="#FF8000" opacity="0.4"/>
                                  <path d="M12 19C10.3431 19 9 17.6569 9 16C9 14.3431 10.3431 13 12 13C13.6569 13 15 14.3431 15 16C15 17.6569 13.6569 19 12 19Z" fill="#FF8000"/>
                                  <path d="M16.5 5.5C16.5 3.567 14.933 2 13 2C11.067 2 9.5 3.567 9.5 5.5L9.5 11.0004C10.168 10.6885 10.9 10.4473 11.684 10.3064C11.783 8.46861 13.306 7 15.166 7L16.5 7L16.5 5.5Z" fill="#FF8000"/>
                                  <path d="M7.5 5.5C7.5 3.567 9.067 2 11 2C12.933 2 14.5 3.567 14.5 5.5L14.5 7L13.166 7C11.306 7 9.783 8.46861 9.684 10.3064C8.9 10.4473 8.168 10.6885 7.5 11.0004L7.5 5.5Z" fill="#FF8000"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">ناروتو بوكر</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">بوكر بطابع أنمي مميز، مستوحى من سلسلة ناروتو الشهيرة مع رموز وشخصيات فريدة</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-black" src="/images/avatars/avatar-9.png" alt="" />
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* نصائح ومعلومات */}
                  <div className="bg-black/30 border border-[#D4AF37]/20 rounded-xl p-5 backdrop-blur-sm mt-8">
                    <h3 className="text-xl font-bold text-[#D4AF37] mb-3">نصائح للاعبين الجدد 🃏</h3>
                    <p className="text-gray-300 text-sm mb-2">• ابدأ بطاولات الحد الأدنى حتى تتقن أساسيات اللعب</p>
                    <p className="text-gray-300 text-sm mb-2">• فهم ترتيب الأيدي الرابحة أمر ضروري</p>
                    <p className="text-gray-300 text-sm mb-2">• راقب أنماط لعب خصومك وطريقة رهاناتهم</p>
                    <p className="text-gray-300 text-sm">• استخدم الشات للتفاعل مع اللاعبين وجعل التجربة أكثر متعة</p>
                  </div>
                </div>
              )}

              {activeGameCategory === "slots" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9]">
                        ألعاب السلوتس
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {/* ملكة مصر سلوتس */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("slots", "egypt-queen-slots")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src="/images/egyptian-pattern.svg" 
                            alt="ملكة مصر سلوتس" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#614023]/60 via-[#614023]/40 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              متاح الآن
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                              لاعبين: 28
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <img src="/images/egypt-queen-icon.svg" alt="ملكة مصر سلوتس" className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">ملكة مصر سلوتس</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">ماكينة سلوتس بطابع مصري فرعوني مميز، مع رموز فرعونية متنوعة وجوائز مجزية</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">الحد الأدنى: 5</span>
                              </div>
                              
                              <button className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37] text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                العب الآن
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ملك زيوس سلوتس */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("slots", "zeus-slots")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src="/images/greek-pattern.svg" 
                            alt="زيوس سلوتس" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#16456e]/60 via-[#16456e]/40 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              متاح الآن
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                              لاعبين: 16
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <img src="/images/zeus-king-icon.svg" alt="زيوس سلوتس" className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">زيوس سلوتس</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">ماكينة سلوتس بطابع إغريقي مميز، مع رموز آلهة الإغريق وصواعق زيوس القوية</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">الحد الأدنى: 10</span>
                              </div>
                              
                              <button className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37] text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                العب الآن
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* سلوتس الفاكهة */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("slots", "fruit-slots")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#4CAF50]/30 via-[#4CAF50]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#4CAF50]/30 via-[#4CAF50]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#4CAF50]/20 rounded-full p-6 border-2 border-[#4CAF50]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" fill="#4CAF50" fillOpacity="0.4"/>
                                  <path d="M15.87 7.85C14.8 7.3 13.72 7 12.55 7C11.38 7 10.31 7.3 9.23 7.85C8.16 8.4 7.36 9.3 6.83 10.5C6.29 11.7 6.28 12.9 6.8 14.1C7.31 15.3 8.11 16.2 9.2 16.8C10.29 17.4 11.38 17.7 12.55 17.7C13.72 17.7 14.8 17.4 15.87 16.8C16.95 16.2 17.75 15.3 18.28 14.1C18.8 12.9 18.8 11.7 18.28 10.5C17.76 9.3 16.95 8.4 15.87 7.85Z" fill="#4CAF50"/>
                                  <path d="M9.5 13C10.3284 13 11 12.3284 11 11.5C11 10.6716 10.3284 10 9.5 10C8.67157 10 8 10.6716 8 11.5C8 12.3284 8.67157 13 9.5 13Z" fill="#E8F5E9"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">سلوتس الفاكهة</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">ماكينة سلوتس كلاسيكية برموز الفواكه المتنوعة، مع مكافآت منعشة وجوائز عصيرية</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">الحد الأدنى: 5</span>
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGameCategory === "crash" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9]">
                        ألعاب كراش
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {/* كراش الصاروخ */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("crash", "rocket-crash")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#F44336]/30 via-[#F44336]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#F44336]/30 via-[#F44336]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              متاح الآن
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                              لاعبين: 42
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#F44336]/20 rounded-full p-6 border-2 border-[#F44336]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 2L19 14H5L12 2Z" fill="#F44336" fillOpacity="0.5"/>
                                  <path d="M6.5 14.5H17.5L16 19C15.5 21 14 22 12 22C10 22 8.5 21 8 19L6.5 14.5Z" fill="#F44336" fillOpacity="0.5"/>
                                  <path d="M13.5 8L12 5L10.5 8C9.8 9.3333 9.5 10.6667 9.5 12C9.5 12.5 9.5 13 9.6 13.5H14.3C14.5 13 14.5 12.5 14.5 12C14.5 10.6667 14.2 9.3333 13.5 8Z" fill="#F44336"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">كراش الصاروخ</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">شاهد الصاروخ وهو يرتفع واختر الوقت المناسب للخروج قبل الانفجار لمضاعفة أرباحك</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">الحد الأدنى: 10</span>
                              </div>
                              
                              <button className="bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9] text-black hover:from-[#F1E2B9] hover:to-[#D4AF37] text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                العب الآن
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* كراش الأسد */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("crash", "lion-crash")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#FF9800]/30 via-[#FF9800]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#FF9800]/30 via-[#FF9800]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#FF9800]/20 rounded-full p-6 border-2 border-[#FF9800]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <path d="M15.84 5.66001C14.89 5.00444 13.7519 4.64436 12.58 4.63001C11.41 4.63001 10.27 5.00001 9.33 5.66001C8.39 6.32001 7.7 7.23001 7.29 8.39001C6.9 9.55001 6.89 10.71 7.28 11.87C7.67 13.03 8.36 13.96 9.31 14.64C10.26 15.32 11.41 15.66 12.58 15.66C13.75 15.66 14.89 15.31 15.82 14.64C16.75 13.97 17.44 13.05 17.85 11.88C18.26 10.71 18.28 9.55001 17.88 8.38001C17.5 7.21001 16.8 6.31001 15.84 5.66001Z" fill="#FF9800" fillOpacity="0.5"/>
                                  <path d="M19.54 14.29C19.33 14.29 19.13 14.34 18.95 14.45C17.52 15.24 15.88 15.68 14.14 15.68C12.4 15.68 10.75 15.21 9.32 14.46C9.13 14.35 8.93 14.3 8.73 14.3C8.36 14.3 8.01 14.45 7.75 14.7C7.49 14.95 7.34 15.29 7.32 15.67C7.32 15.77 7.33 15.88 7.36 15.99C7.44 16.31 7.62 16.58 7.86 16.77C9.17 17.9 10.93 18.54 12.91 18.61C12.99 18.61 13.07 18.61 13.15 18.61C14.13 18.61 15.09 18.46 16.02 18.15C16.96 17.82 17.81 17.33 18.56 16.68C18.66 16.59 18.76 16.49 18.84 16.37C19.01 16.17 19.14 15.94 19.22 15.67C19.2509 15.6031 19.2709 15.5337 19.28 15.4631C19.3 15.3331 19.31 15.1956 19.3 15.06C19.24 14.59 18.89 14.28 19.54 14.29Z" fill="#FF9800" fillOpacity="0.5"/>
                                  <path d="M7.0008 14.7C6.9908 14.96 6.6708 15.3 6.6208 15.56C6.5708 15.82 6.3908 16.01 6.1708 16.09C5.9508 16.17 5.7108 16.14 5.5008 16C5.0308 15.68 4.6008 15.29 4.2608 14.87C4.0408 14.59 3.8708 14.27 3.7808 13.94C3.6908 13.61 3.6608 13.26 3.7108 12.92C3.7608 12.58 3.8808 12.27 4.0908 12.01C4.0508 12.47 4.0908 12.93 4.2108 13.36C4.3308 13.79 4.5308 14.2 4.8108 14.54C5.0908 14.88 5.4308 15.18 5.8308 15.4C6.2308 15.62 6.6708 15.76 7.1208 15.78L7.0008 14.7Z" fill="#FF9800"/>
                                  <path d="M7.02 14.1C7.31 14.1 7.59 14.01 7.82 13.85C8.05 13.69 8.23 13.47 8.33 13.21C8.44 12.95 8.47 12.67 8.42 12.4C8.37 12.13 8.24 11.88 8.05 11.69C7.86 11.5 7.61 11.37 7.34 11.32C7.07 11.27 6.79 11.3 6.53 11.4C6.27 11.5 6.05 11.68 5.89 11.91C5.73 12.14 5.64 12.42 5.64 12.71C5.64 13.09 5.79 13.45 6.06 13.72C6.33 13.99 6.7 14.15 7.09 14.14" fill="#FF9800"/>
                                  <path d="M18.15 14.69C18.12 14.93 17.83 15.25 17.78 15.49C17.73 15.73 17.56 15.95 17.34 16.05C17.12 16.15 16.88 16.12 16.67 16C16.21 15.71 15.8 15.34 15.47 14.91C15.25 14.64 15.09 14.33 15 14.01C14.91 13.69 14.89 13.36 14.93 13.03C14.97 12.7 15.09 12.39 15.3 12.14C15.26 12.59 15.3 13.04 15.42 13.46C15.54 13.88 15.73 14.27 16 14.6C16.27 14.93 16.6 15.22 16.98 15.43C17.36 15.64 17.79 15.77 18.24 15.8" fill="#FF9800"/>
                                  <path d="M18.16 14.06C18.45 14.06 18.72 13.98 18.96 13.82C19.19 13.66 19.36 13.44 19.47 13.19C19.58 12.93 19.6 12.65 19.55 12.38C19.5 12.11 19.38 11.87 19.19 11.68C19 11.49 18.76 11.36 18.49 11.31C18.22 11.26 17.94 11.29 17.68 11.39C17.42 11.49 17.2 11.66 17.04 11.89C16.88 12.12 16.8 12.38 16.8 12.67C16.81 13.05 16.96 13.4 17.24 13.67C17.52 13.94 17.87 14.09 18.24 14.09" fill="#FF9800"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">كراش الأسد</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">شاهد الأسد وهو يجري بسرعة متزايدة واختر الوقت المناسب للخروج قبل أن يتعب</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">الحد الأدنى: 15</span>
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeGameCategory === "special" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-white text-2xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#F1E2B9]">
                        ألعاب خاصة
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {/* لعبة بلوت */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("special", "baloot")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#795548]/30 via-[#795548]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#795548]/30 via-[#795548]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#795548]/20 rounded-full p-6 border-2 border-[#795548]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <rect x="4" y="4" width="16" height="16" rx="2" fill="#795548" fillOpacity="0.5"/>
                                  <path d="M9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9C8.55228 9 9 8.55228 9 8Z" fill="#F5F5F5"/>
                                  <path d="M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16Z" fill="#F5F5F5"/>
                                  <path d="M9 16C9 16.5523 8.55228 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15C8.55228 15 9 15.4477 9 16Z" fill="#F5F5F5"/>
                                  <path d="M17 8C17 7.44772 16.5523 7 16 7C15.4477 7 15 7.44772 15 8C15 8.55228 15.4477 9 16 9C16.5523 9 17 8.55228 17 8Z" fill="#F5F5F5"/>
                                  <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#F5F5F5"/>
                                  <path d="M10.5 10.5L13.5 13.5" stroke="#F5F5F5" strokeLinecap="round"/>
                                  <path d="M13.5 10.5L10.5 13.5" stroke="#F5F5F5" strokeLinecap="round"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">بلوت عرباوي</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">لعبة البلوت الشعبية المحبوبة بقواعدها الخليجية الأصلية بين أربعة لاعبين</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">4 لاعبين</span>
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* لعبة الصياد */}
                    <div 
                      className="relative group cursor-pointer overflow-hidden"
                      onClick={() => handleGameClick("special", "hunter")}
                    >
                      <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-b from-black/50 to-black/90 border-2 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all duration-300">
                        {/* صورة اللعبة الخلفية */}
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-gradient-to-b from-[#009688]/30 via-[#009688]/20 to-black/90"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-[#009688]/30 via-[#009688]/20 to-black/90"></div>
                        </div>
                        
                        {/* تأثير وميض عند التحويم */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                        
                        {/* شعار اللعبة والمعلومات */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                          <div className="flex justify-between">
                            <span className="bg-black/40 backdrop-blur-md text-[#D4AF37] text-xs py-1 px-2 rounded-full border border-[#D4AF37]/20">
                              قادم قريبًا
                            </span>
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs py-1 px-2 rounded-full border border-white/20">
                              <span className="inline-block h-2 w-2 rounded-full bg-gray-500 mr-1"></span>
                              في التطوير
                            </span>
                          </div>
                          
                          <div className="text-center">
                            <div className="h-24 mx-auto mb-4 drop-shadow-glow transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                              <div className="bg-[#009688]/20 rounded-full p-6 border-2 border-[#009688]/30">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                  <path d="M17 4L19.5 7L22 4H17Z" fill="#009688" fillOpacity="0.5"/>
                                  <path d="M2 8L4.5 11L7 8H2Z" fill="#009688" fillOpacity="0.5"/>
                                  <path d="M8 3H16V8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8V3Z" fill="#009688" fillOpacity="0.5"/>
                                  <path d="M12 14C15.5 14 18.5 16 18.5 19.5V21H5.5V19.5C5.5 16 8.5 14 12 14Z" fill="#009688" fillOpacity="0.5"/>
                                  <circle cx="12" cy="8" r="2" fill="#009688"/>
                                  <path d="M15 14L16.5 15.5L18 14H15Z" fill="#009688"/>
                                  <path d="M6 14L7.5 15.5L9 14H6Z" fill="#009688"/>
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center mb-2">الصياد</h3>
                            <p className="text-gray-300 text-sm text-center mb-3">لعبة ورق شعبية خليجية ممتعة يتنافس فيها اللاعبون لجمع أكبر عدد من النقاط</p>
                            
                            <div className="flex justify-between items-center">
                              <div className="bg-black/30 px-2 py-1 rounded-lg border border-[#D4AF37]/20">
                                <span className="text-[#D4AF37] text-xs">4 لاعبين</span>
                              </div>
                              
                              <button className="bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm font-bold py-1.5 px-4 rounded-lg transform group-hover:scale-105 transition-transform">
                                قريبًا
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* شريط معلومات أسفل الألعاب */}
              <div className="mt-10 bg-black/30 border border-[#D4AF37]/20 rounded-lg p-5 mb-16">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold text-white">ما يميز منصة <span className="text-[#D4AF37]">عرباوي</span> للألعاب</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="flex gap-3 items-start">
                      <div className="bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
                        <Trophy size={20} className="text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">تجربة لعب عربية أصيلة</h4>
                        <p className="text-gray-400 text-xs">جميع الألعاب مصممة خصيصًا للاعبين العرب مع واجهة سهلة الاستخدام باللغة العربية</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
                        <Crown size={20} className="text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">جوائز ومكافآت يومية</h4>
                        <p className="text-gray-400 text-xs">احصل على مكافآت يومية وشارك في البطولات للفوز بجوائز قيمة وتصنيفات متقدمة</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
                        <Coins size={20} className="text-[#D4AF37]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">رقائق مجانية يوميًا</h4>
                        <p className="text-gray-400 text-xs">احصل على رقائق مجانية كل يوم واستمتع بجميع الألعاب دون الحاجة للدفع</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* قسم الدردشة العامة - مخفي/ظاهر بحسب حالة isChatHidden */}
          <div className={`transition-all duration-300 flex flex-col ${
            isChatHidden ? 'w-0 opacity-0' : 'w-80 opacity-100'
          }`}>
            {!isChatHidden && <ChatBox />}
          </div>
          
          {/* زر إظهار/إخفاء الدردشة */}
          <button
            onClick={toggleChat}
            className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-gradient-to-r from-[#D4AF37]/60 to-[#D4AF37]/80 hover:from-[#D4AF37]/80 hover:to-[#D4AF37] text-black p-1.5 rounded-l-md shadow-lg transition-all z-20"
          >
            {isChatHidden ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
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

      {/* شريط أزرار التنقل للموبايل */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-md border-t border-[#D4AF37]/30 p-2 flex justify-around items-center md:hidden z-50">
        <button className="flex flex-col items-center justify-center space-y-1">
          <User size={20} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37]/80 text-xs">حسابي</span>
        </button>
        <button className="flex flex-col items-center justify-center space-y-1">
          <ShoppingCart size={20} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37]/80 text-xs">المتجر</span>
        </button>
        <button className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-b from-[#D4AF37] to-[#F1E2B9] p-3 rounded-full shadow-lg shadow-[#D4AF37]/20 border-4 border-black/90">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        </button>
        <button className="flex flex-col items-center justify-center space-y-1">
          <Bell size={20} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37]/80 text-xs">إشعارات</span>
        </button>
        <button className="flex flex-col items-center justify-center space-y-1">
          <Smartphone size={20} className="text-[#D4AF37]" />
          <span className="text-[#D4AF37]/80 text-xs">التطبيق</span>
        </button>
      </div>

      {/* زر محاكاة تأثير البطاقات المتساقطة للتزيين فقط */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2">
        <button 
          className="bg-black/60 p-2 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-black/80 transition-all group relative"
          onClick={() => document.dispatchEvent(new CustomEvent('toggle-snow-effect'))}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h10M12 2v10M12 12l8 8M12 12l8-8M12 12L4 4M12 12v10"/></svg>
          <span className="absolute left-full ml-2 whitespace-nowrap bg-black/80 text-[#D4AF37] text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">تأثيرات مرئية</span>
        </button>
        
        <NotificationsButton />
        
        <GameInstructionsButton />
      </div>
      
      {/* إضافة مؤثرات الثلج والبطاقات */}
      {/* <HeavySnowEffect /> */}
      {/* <HeavyPokerCardsEffect /> */}
      {/* <SuitSymbolsEffect /> */}
      {/* <GoldDustEffect /> */}
    </div>
  );
}