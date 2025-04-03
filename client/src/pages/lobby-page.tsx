
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
  const [directTableId, setDirectTableId] = useState<string>("");
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

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[#D4AF37] text-sm">مرحباً، {user?.username}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-xs flex items-center">الرصيد: <span className="text-[#D4AF37] font-bold flex items-center mr-1"><Coins className="ml-1 h-3.5 w-3.5" /> {formatChips(user?.chips || 0)}</span></p>
                {/* زر إعادة تعيين الرصيد - وضع للاختبار فقط */}
                <div className="flex gap-1 scale-75 origin-right">
                  <ResetChipsButton />
                  <RemoveVirtualPlayersButton />
                </div>
              </div>
            </div>

            {/* زر الانتقال المباشر للطاولة */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="رقم الطاولة"
                value={directTableId}
                onChange={(e) => setDirectTableId(e.target.value)}
                className="bg-black/50 text-[#D4AF37] border border-[#D4AF37]/40 rounded-md h-8 w-24 text-xs px-2 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/40"
              />
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 py-0 px-2 text-xs border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                onClick={() => {
                  if (directTableId && !isNaN(parseInt(directTableId))) {
                    navigate(`/direct-table/${directTableId}`);
                  }
                }}
              >
                <ExternalLink size={14} className="ml-1" />
                انتقال مباشر
              </Button>
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

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto p-4">
          <div className="flex flex-col gap-6">
            {/* العناصر الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* شريط الترحيب - أول عنصر على اليسار */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-[#0A3A2A]/90 to-black/80 rounded-xl p-4 border-2 border-[#D4AF37]/30 shadow-lg backdrop-blur-md h-full">
                  <div className="flex flex-col gap-3">
                    {/* معلومات اللاعب */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={user?.avatar || "/assets/poker-icon-gold.png"}
                          alt="Avatar" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37]" 
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full w-5 h-5 flex items-center justify-center border border-black">
                          <span className="text-[8px] text-black font-bold">متصل</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-[#D4AF37] text-xl font-bold">أهلاً بك، {user?.username}!</h2>
                        <p className="text-gray-300 text-sm">آخر تواجد: اليوم {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    {/* إحصائيات اللاعب */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-[#0A3A2A]/70 p-2 rounded-lg border border-[#D4AF37]/30 shadow flex items-center">
                        <Coins className="h-5 w-5 text-[#D4AF37] mr-2" />
                        <div>
                          <p className="text-xs text-gray-300">رصيدك الحالي</p>
                          <p className="text-[#D4AF37] font-bold text-lg">{formatChips(user?.chips || 0)}</p>
                        </div>
                      </div>
                      <div className="bg-[#0A3A2A]/70 p-2 rounded-lg border border-[#D4AF37]/30 shadow-inner">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-xs text-gray-300">مستوى VIP</p>
                          <div className="h-3 w-16 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C04B] w-1/4"></div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-[#D4AF37] text-xs font-bold">25/100</span>
                          <Button
                            variant="link"
                            className="text-[#D4AF37] text-xs p-0 h-auto ml-2"
                            onClick={() => navigate("/vip")}
                          >
                            ترقية
                            <ChevronUp className="h-3 w-3 mr-1" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* أزرار الوصول السريع */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-9 py-0"
                        onClick={() => navigate("/profile")}
                      >
                        <User size={16} className="ml-2" />
                        الملف الشخصي
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 h-9 py-0"
                        onClick={() => navigate("/shop")}
                      >
                        <ShoppingBag size={16} className="ml-2" />
                        المتجر
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-9 py-0"
                        onClick={() => navigate("/rankings")}
                      >
                        <Trophy size={16} className="ml-2" />
                        التصنيفات
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIP Section - عنصر على اليمين */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20 p-2 relative">
                    <div className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#D4AF37] text-black font-bold text-xs shadow-lg">VIP</div>
                    <h3 className="text-[#D4AF37] font-bold text-lg">مميزات VIP</h3>
                  </div>
                  <div className="p-4 flex flex-col justify-between h-[calc(100%-46px)]">
                    <div>
                      <div className="mb-3 relative">
                        <div className="w-full h-20 bg-gradient-to-r from-[#0A3A2A] to-black rounded shadow-md flex items-center justify-center">
                          <span className="text-[#D4AF37] text-2xl font-bold">⭐ VIP ⭐</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 text-[#D4AF37] text-sm font-bold">احصل على مميزات حصرية</div>
                      </div>
                      <ul className="text-xs text-gray-300 list-disc list-inside mb-3 space-y-1">
                        <li>طاولات VIP خاصة</li>
                        <li>مكافآت يومية مضاعفة</li>
                        <li>دعم أولوية</li>
                      </ul>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-black hover:bg-[#E5C04B] font-bold"
                      onClick={() => navigate("/vip")}
                    >
                      ترقية إلى VIP
                    </Button>
                  </div>
                </div>
              </div>

              {/* اختيار نوع اللعبة - قسم عرضي كامل */}
              <div className="md:col-span-3">
                <div className="rounded-xl bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 p-4 backdrop-blur-sm shadow-xl">
                  <div className="text-center mb-4 flex items-center justify-center">
                    <div className="relative flex items-center gap-3">
                      <div className="absolute -left-10 -top-6 opacity-30 rotate-12">
                        <span className="text-[#D4AF37] text-6xl">♥️</span>
                      </div>
                      <div className="absolute -right-10 -bottom-6 opacity-30 -rotate-12">
                        <span className="text-[#D4AF37] text-6xl">♠️</span>
                      </div>
                      <img 
                        src="/assets/poker-logo-alt.jpeg" 
                        alt="بوكر عرباوي" 
                        className="w-16 h-16 rounded-full border-2 border-[#D4AF37] object-cover shadow-md shadow-[#D4AF37]/30"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-[#D4AF37]">ألعابنا المميزة</h2>
                        <p className="text-gray-300 text-sm">اختر نوع اللعبة التي ترغب باللعب فيها</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : ''} border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
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
                      className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : ''} border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
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
                      className={`flex flex-col h-40 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-600' : ''} border-blue-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
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
              </div>

              {/* البطولات - عنصر في الثلث الأول  */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20 p-2">
                    <h3 className="text-[#D4AF37] font-bold text-lg">بطولات</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-3">
                      <div className="bg-black/40 rounded-lg p-3 border border-[#D4AF37]/10">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[#D4AF37] font-bold text-sm">بطولة الجمعة</h4>
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">اليوم</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">100,000 رقاقة</span>
                          <span className="text-green-400">10:00م</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-3 border border-[#D4AF37]/10">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[#D4AF37] font-bold text-sm">بطولة VIP</h4>
                          <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded">غداً</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">250,000 رقاقة</span>
                          <span className="text-gray-400">8:00م</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      onClick={() => navigate("/tournaments")}
                    >
                      المزيد من البطولات
                    </Button>
                  </div>
                </div>
              </div>

              {/* أحدث اللاعبين - عنصر في الثلث الثاني */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20 p-2">
                    <h3 className="text-[#D4AF37] font-bold text-lg">أفضل اللاعبين</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {/* أعلى لاعب */}
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/20 flex items-center gap-2">
                        <div className="bg-[#D4AF37]/20 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-[#D4AF37] font-bold text-sm">1</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-white text-xs font-bold">PlayerOne</h4>
                            <span className="text-[#D4AF37] text-xs">5.2M</span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                            <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C04B] w-full rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* ثاني لاعب */}
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/20 flex items-center gap-2">
                        <div className="bg-gray-700/60 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-gray-300 font-bold text-sm">2</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-white text-xs font-bold">PlayerTwo</h4>
                            <span className="text-gray-300 text-xs">3.7M</span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                            <div className="h-full bg-gray-400 w-3/4 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* ثالث لاعب */}
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/20 flex items-center gap-2">
                        <div className="bg-[#CD7F32]/30 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-[#CD7F32] font-bold text-sm">3</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-white text-xs font-bold">PlayerThree</h4>
                            <span className="text-[#CD7F32] text-xs">2.9M</span>
                          </div>
                          <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                            <div className="h-full bg-[#CD7F32] w-[60%] rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                      onClick={() => navigate("/rankings")}
                    >
                      جميع التصنيفات
                    </Button>
                  </div>
                </div>
              </div>

              {/* أخبار وتحديثات - عنصر في الثلث الثالث */}
              <div className="md:col-span-1">
                <div className="bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg h-full">
                  <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-b border-[#D4AF37]/20 p-2">
                    <h3 className="text-[#D4AF37] font-bold text-lg">تحديثات</h3>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/10 flex items-center gap-2">
                        <div className="min-w-8 h-8 rounded-md bg-blue-600/50 flex items-center justify-center">
                          <Download className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[#D4AF37] text-xs font-bold">تطبيق الجوال متاح الآن</h4>
                          <p className="text-[11px] text-gray-300 truncate">تحميل تطبيق بوكر عرباوي!</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/10 flex items-center gap-2">
                        <div className="min-w-8 h-8 rounded-md bg-green-600/50 flex items-center justify-center">
                          <Coins className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[#D4AF37] text-xs font-bold">عرض شحن خاص</h4>
                          <p className="text-[11px] text-gray-300 truncate">+50% رقائق إضافية اليوم!</p>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 rounded-lg p-2 border border-[#D4AF37]/10 flex items-center gap-2">
                        <div className="min-w-8 h-8 rounded-md bg-orange-600/50 flex items-center justify-center">
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-[#D4AF37] text-xs font-bold">تحديث اللعبة</h4>
                          <p className="text-[11px] text-gray-300 truncate">ميزات جديدة وإصلاحات!</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() => navigate("/news")}
                    >
                      <Bell className="ml-2 h-4 w-4" />
                      جميع التحديثات
                    </Button>
                  </div>
                </div>
              </div>

              {/* المساحة المتاحة للإضافات المستقبلية */}
              <div className="md:col-span-3">
                <div className="bg-gradient-to-b from-black/80 to-[#0A3A2A]/60 border-2 border-[#D4AF37]/20 p-3 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[#D4AF37] font-bold text-lg">مساحة للإضافات المستقبلية</h3>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 py-0"
                    >
                      المزيد
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-black/40 rounded-lg border border-[#D4AF37]/10 p-2 flex flex-col items-center justify-center min-h-24">
                        <div className="w-10 h-10 rounded-full bg-[#0A3A2A]/70 border border-[#D4AF37]/30 flex items-center justify-center mb-2">
                          <span className="text-[#D4AF37] text-xl">+</span>
                        </div>
                        <p className="text-gray-400 text-xs">قريبًا...</p>
                      </div>
                    ))}
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