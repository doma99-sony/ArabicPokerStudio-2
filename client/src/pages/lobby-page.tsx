import { useCallback, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Coins, 
  Loader2, 
  LogOut, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  Menu,
  X
} from "lucide-react";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { ChatBox } from "@/components/lobby/chat-box";
import { ResetChipsButton } from "@/components/reset-chips-button";
import { RemoveVirtualPlayersButton } from "@/components/remove-virtual-players-button";
import { apiRequest } from "@/lib/queryClient";
import { formatChips } from "@/lib/utils";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";

export default function LobbyPage() {
  const webSocket = useGlobalWebSocket();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/lobby/:category?");
  const activeCategory = params?.category || "featured";
  const [activeGameCategory, setActiveGameCategory] = useState<"poker" | "naruto" | "domino" | "tekken">("poker");
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // نستعلم عن معلومات المستخدم
  const { data: user } = useQuery({
    queryKey: ["/api/profile"],
    refetchOnWindowFocus: false,
  });

  // تغيير حالة إظهار/إخفاء الدردشة
  const toggleChat = useCallback(() => {
    setIsChatHidden(!isChatHidden);
  }, [isChatHidden]);

  // التنقل إلى صفحة الملف الشخصي
  const navigateToProfile = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  // التنقل إلى طاولات اللعب بناءً على نوع اللعبة
  const navigateToGameTables = useCallback((gameType: "poker" | "naruto" | "domino" | "tekken") => {
    navigate(`/tables/${gameType}`);
  }, [navigate]);

  // تسجيل الخروج
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/logout", "POST");
    },
    onSuccess: () => {
      toast({
        description: "تم تسجيل الخروج بنجاح",
      });
      // إعلام خادم WebSocket بتسجيل الخروج
      webSocket.disconnect();
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate("/login");
      // مسح بيانات المستخدم من ذاكرة التخزين المؤقت
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "حدث خطأ أثناء تسجيل الخروج، يرجى المحاولة مرة أخرى",
      });
    },
  });

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return (
    <div className="min-h-screen bg-[url('/assets/poker-bg-dark.jpg')] bg-cover bg-center text-white relative overflow-hidden flex flex-col rtl">
      
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* تحسين الشريط العلوي */}
      <header className="relative z-10 bg-gradient-to-r from-black/90 to-[#0A3A2A]/90 text-white p-2 shadow-xl border-b border-[#D4AF37]/50">
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

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          )}

          <div className={`flex items-center gap-3 ${isMobile ? isMobileMenuOpen ? 'flex absolute top-14 right-0 bg-black/90 p-3 rounded-bl-xl border-b border-l border-[#D4AF37]/30 flex-col z-50' : 'hidden' : 'flex'}`}>
            {/* صورة المستخدم مع إمكانية تحديثها */}
            <div className="relative group cursor-pointer" onClick={navigateToProfile}>
              <img 
                src={user?.avatar || "/assets/default-avatar.png"} 
                alt="صورة الملف الشخصي" 
                className="w-10 h-10 rounded-full border-2 border-[#D4AF37] object-cover shadow-md transition-all duration-300 group-hover:border-white" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Camera size={14} className="text-white" />
              </div>
            </div>

            <div className="text-right">
              <p className="text-[#D4AF37] text-sm">مرحباً، {user?.username}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-xs flex items-center">الرصيد: <span className="text-[#D4AF37] font-bold flex items-center mr-1"><Coins className="ml-1 h-3.5 w-3.5" /> {formatChips(user?.chips || 0)}</span></p>
                {/* زر إعادة تعيين الرصيد وإزالة اللاعبين الوهميين - بأيقونات فقط */}
                <div className="flex gap-1 scale-90 origin-right">
                  <ResetChipsButton />
                  <RemoveVirtualPlayersButton />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 w-8 rounded-full"
                onClick={() => navigate("/notifications")}
                title="الإشعارات"
              >
                <Bell size={14} />
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-8 w-8 rounded-full"
                onClick={navigateToProfile}
                title="الملف الشخصي"
              >
                <User size={14} />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-full"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                title="تسجيل الخروج"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* تنظيم المحتوى الرئيسي */}
      <main className="relative z-10 flex-1 overflow-hidden">
        {/* قسم الدردشة - ثابت على اليسار */}
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
                <ChevronLeft className="h-5 w-5 text-[#D4AF37]" />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#D4AF37]" />
              )}
            </button>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* القسم الرئيسي مع مربعات الألعاب المعروضة عمودياً */}
            <div className="w-full md:w-1/4 order-2 md:order-1">
              {/* عنوان القسم */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-[#D4AF37]">ألعابنا المميزة</h2>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37] to-[#D4AF37]/10 rounded-full mt-2"></div>
              </div>

              {/* مربعات الألعاب الأربعة الرئيسية - مرتبة عمودياً */}
              <div className="grid grid-cols-1 gap-4">
                {/* بوكر عرباوي */}
                <div 
                  className={`group relative flex flex-col h-36 rounded-xl overflow-hidden shadow-xl hover:shadow-[#D4AF37]/30 transition-all duration-300 hover:scale-102 cursor-pointer ${activeGameCategory === 'poker' ? 'ring-2 ring-[#D4AF37]' : ''}`}
                  onClick={() => {
                    setActiveGameCategory('poker');
                    navigateToGameTables('poker');
                  }}
                >
                  {/* خلفية اللعبة */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1B4D3E] to-[#0A3A2A]">
                    <img 
                      src="/assets/poker-table-bg.jpg" 
                      alt="بوكر عرباوي" 
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  
                  {/* تراكب شفاف */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#0A3A2A]/50 to-[#0A3A2A]/30"></div>
                  
                  {/* محتوى البطاقة */}
                  <div className="relative flex flex-col h-full z-10 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <div className="bg-[#D4AF37] text-black font-bold text-xs p-1 px-2 rounded">VIP</div>
                        <div className="bg-[#22c55e] text-black font-bold text-xs p-1 px-2 rounded">HOT</div>
                      </div>
                      <div className="w-8 h-8 bg-[#0A3A2A] rounded-full border-2 border-[#D4AF37] flex items-center justify-center">
                        <span className="text-[#D4AF37] text-sm">♠️</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <h3 className="text-[#D4AF37] font-bold text-lg">بوكر عرباوي</h3>
                      <div className="mt-0.5 w-full h-0.5 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0"></div>
                    </div>
                    
                    <div className="my-1 text-xs text-gray-300 flex gap-2">
                      <div className="bg-black/30 rounded px-2 py-0.5 border border-[#D4AF37]/20">
                        <span className="text-[#D4AF37]">٤٢٠</span> لاعب
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs hover:from-[#E5C04B] hover:to-[#C09526] rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:scale-105 transform transition-transform duration-200"
                      >
                        <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center">
                          <span className="text-black text-[10px]">♣</span>
                        </div>
                        ابدأ اللعب
                        <ChevronRight className="mr-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ناروتو */}
                <div 
                  className={`group relative flex flex-col h-36 rounded-xl overflow-hidden shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-102 cursor-pointer ${activeGameCategory === 'naruto' ? 'ring-2 ring-orange-500' : ''}`}
                  onClick={() => {
                    setActiveGameCategory('naruto');
                    navigateToGameTables('naruto');
                  }}
                >
                  {/* خلفية اللعبة */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FF8C00] to-[#FF4500]">
                    <img 
                      src="/assets/naruto-video.mp4" 
                      alt="نارتو" 
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  
                  {/* تراكب شفاف */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#FF4500]/40 to-[#FF8C00]/30"></div>
                  
                  {/* محتوى البطاقة */}
                  <div className="relative flex flex-col h-full z-10 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <div className="bg-orange-500 text-white font-bold text-xs p-1 px-2 rounded">جديد</div>
                      </div>
                      <div className="w-8 h-8 bg-orange-800 rounded-full border-2 border-orange-400 flex items-center justify-center">
                        <span className="text-white text-[10px]">忍</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <h3 className="text-orange-400 font-bold text-lg">ناروتو</h3>
                      <div className="mt-0.5 w-full h-0.5 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></div>
                    </div>
                    
                    <div className="my-1 text-xs text-gray-300 flex gap-2">
                      <div className="bg-black/30 rounded px-2 py-0.5 border border-orange-500/20">
                        <span className="text-orange-400">١٨٥</span> لاعب
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xs hover:from-orange-400 hover:to-orange-500 rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:scale-105 transform transition-transform duration-200"
                      >
                        <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center">
                          <span className="text-white text-[10px]">⚔️</span>
                        </div>
                        ابدأ اللعب
                        <ChevronRight className="mr-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* دومينو */}
                <div 
                  className={`group relative flex flex-col h-36 rounded-xl overflow-hidden shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-102 cursor-pointer ${activeGameCategory === 'domino' ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => {
                    setActiveGameCategory('domino');
                    navigateToGameTables('domino');
                  }}
                >
                  {/* خلفية اللعبة */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A] to-[#0F172A]">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 rotate-12 text-white/20 text-5xl font-bold">
                        🎲
                      </div>
                      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 -rotate-12 text-white/20 text-5xl font-bold">
                        🎲
                      </div>
                    </div>
                  </div>
                  
                  {/* تراكب شفاف */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#0F172A]/50 to-[#1E3A8A]/30"></div>
                  
                  {/* محتوى البطاقة */}
                  <div className="relative flex flex-col h-full z-10 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <div className="bg-blue-500 text-white font-bold text-xs p-1 px-2 rounded">شائع</div>
                      </div>
                      <div className="w-8 h-8 bg-blue-900 rounded-full border-2 border-blue-400 flex items-center justify-center">
                        <span className="text-white text-[10px]">🎲</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <h3 className="text-blue-400 font-bold text-lg">دومينو</h3>
                      <div className="mt-0.5 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0"></div>
                    </div>
                    
                    <div className="my-1 text-xs text-gray-300 flex gap-2">
                      <div className="bg-black/30 rounded px-2 py-0.5 border border-blue-500/20">
                        <span className="text-blue-400">٢٥٠</span> لاعب
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs hover:from-blue-400 hover:to-blue-500 rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:scale-105 transform transition-transform duration-200"
                      >
                        <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center">
                          <span className="text-white text-[10px]">١•٢</span>
                        </div>
                        ابدأ اللعب
                        <ChevronRight className="mr-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* تيكن */}
                <div 
                  className={`group relative flex flex-col h-36 rounded-xl overflow-hidden shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-102 cursor-pointer ${activeGameCategory === 'tekken' ? 'ring-2 ring-red-600' : ''}`}
                  onClick={() => setActiveGameCategory('tekken')}
                >
                  {/* خلفية اللعبة */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#9A1212] to-[#5F0000]">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="absolute opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-6xl font-bold">
                        鉄
                      </div>
                    </div>
                  </div>
                  
                  {/* تراكب شفاف */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#5F0000]/50 to-[#9A1212]/30"></div>
                  
                  {/* محتوى البطاقة */}
                  <div className="relative flex flex-col h-full z-10 p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <div className="bg-yellow-500 text-black font-bold text-xs p-1 px-2 rounded">قريباً</div>
                      </div>
                      <div className="w-8 h-8 bg-red-900 rounded-full border-2 border-red-400 flex items-center justify-center">
                        <span className="text-white text-[10px]">鉄</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <h3 className="text-red-400 font-bold text-lg">تيكن</h3>
                      <div className="mt-0.5 w-full h-0.5 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0"></div>
                    </div>
                    
                    <div className="my-1 text-xs text-gray-300 flex gap-2">
                      <div className="bg-black/30 rounded px-2 py-0.5 border border-red-500/20">
                        <span className="text-red-400">٠</span> لاعب
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <button 
                        className="w-full py-1.5 px-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs hover:from-red-400 hover:to-red-500 rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:scale-105 transform transition-transform duration-200"
                      >
                        <span className="text-white text-[10px]">قريباً</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* القسم الثاني - الألعاب الإضافية (4 صفوف، كل صف 4 مربعات) */}
            <div className="w-full md:w-3/4 order-1 md:order-2">
              <div className="grid grid-cols-1 gap-6">
                {/* الصف الأول - ألعاب الطاولات */}
                <div className="rounded-xl bg-gradient-to-b from-[#1d4ed8]/90 to-[#172554]/70 border-2 border-[#93c5fd]/40 p-4 backdrop-blur-sm shadow-2xl">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-[#93c5fd]">ألعاب الطاولات</h2>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#93c5fd]/10 via-[#93c5fd] to-[#93c5fd]/10 rounded-full mt-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* لعبة طاولة 1 - الطاولة العربية */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#1e40af] to-[#1e3a8a]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الطاولة العربية</h3>
                          <div className="w-6 h-6 bg-blue-900 rounded-full border border-blue-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">🎲</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-blue-300">قريباً</span>
                          <span className="text-[10px] bg-blue-800/60 text-white px-2 py-0.5 rounded border border-blue-400/30">٢-٤ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة طاولة 2 - الطاولة الأوروبية */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2563eb] to-[#1d4ed8]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الطاولة الأوروبية</h3>
                          <div className="w-6 h-6 bg-blue-700 rounded-full border border-blue-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">🎯</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-blue-300">قريباً</span>
                          <span className="text-[10px] bg-blue-800/60 text-white px-2 py-0.5 rounded border border-blue-400/30">٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة طاولة 3 - النرد */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6] to-[#2563eb]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">النرد</h3>
                          <div className="w-6 h-6 bg-blue-600 rounded-full border border-blue-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">🎲</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-blue-300">قريباً</span>
                          <span className="text-[10px] bg-blue-800/60 text-white px-2 py-0.5 rounded border border-blue-400/30">٢-٦ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة طاولة 4 - الشطرنج */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#60a5fa] to-[#3b82f6]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الشطرنج</h3>
                          <div className="w-6 h-6 bg-blue-500 rounded-full border border-blue-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">♟️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-blue-300">قريباً</span>
                          <span className="text-[10px] bg-blue-800/60 text-white px-2 py-0.5 rounded border border-blue-400/30">٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* الصف الثاني - ألعاب الورق */}
                <div className="rounded-xl bg-gradient-to-b from-[#b91c1c]/90 to-[#7f1d1d]/70 border-2 border-[#fca5a5]/40 p-4 backdrop-blur-sm shadow-2xl">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-[#fca5a5]">ألعاب الورق</h2>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#fca5a5]/10 via-[#fca5a5] to-[#fca5a5]/10 rounded-full mt-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* لعبة ورق 1 - بلاك جاك */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626] to-[#b91c1c]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">بلاك جاك</h3>
                          <div className="w-6 h-6 bg-red-800 rounded-full border border-red-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">♠️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-red-300">قريباً</span>
                          <span className="text-[10px] bg-red-800/60 text-white px-2 py-0.5 rounded border border-red-400/30">٢-٦ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة ورق 2 - هاند */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#ef4444] to-[#dc2626]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">هاند</h3>
                          <div className="w-6 h-6 bg-red-700 rounded-full border border-red-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">♥️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-red-300">قريباً</span>
                          <span className="text-[10px] bg-red-800/60 text-white px-2 py-0.5 rounded border border-red-400/30">٤ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة ورق 3 - كونكان */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#f87171] to-[#ef4444]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">كونكان</h3>
                          <div className="w-6 h-6 bg-red-600 rounded-full border border-red-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">♦️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-red-300">قريباً</span>
                          <span className="text-[10px] bg-red-800/60 text-white px-2 py-0.5 rounded border border-red-400/30">٢-٤ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة ورق 4 - سوليتير */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#fca5a5] to-[#f87171]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">سوليتير</h3>
                          <div className="w-6 h-6 bg-red-500 rounded-full border border-red-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">♣️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-red-300">قريباً</span>
                          <span className="text-[10px] bg-red-800/60 text-white px-2 py-0.5 rounded border border-red-400/30">لاعب واحد</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* الصف الثالث - ألعاب استراتيجية */}
                <div className="rounded-xl bg-gradient-to-b from-[#065f46]/90 to-[#064e3b]/70 border-2 border-[#6ee7b7]/40 p-4 backdrop-blur-sm shadow-2xl">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-[#6ee7b7]">ألعاب استراتيجية</h2>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#6ee7b7]/10 via-[#6ee7b7] to-[#6ee7b7]/10 rounded-full mt-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* لعبة استراتيجية 1 - الضامة */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#059669] to-[#047857]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الضامة</h3>
                          <div className="w-6 h-6 bg-emerald-800 rounded-full border border-emerald-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">⚫</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-emerald-300">قريباً</span>
                          <span className="text-[10px] bg-emerald-800/60 text-white px-2 py-0.5 rounded border border-emerald-400/30">٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة استراتيجية 2 - الداما */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#10b981] to-[#059669]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الداما</h3>
                          <div className="w-6 h-6 bg-emerald-700 rounded-full border border-emerald-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">⬜</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-emerald-300">قريباً</span>
                          <span className="text-[10px] bg-emerald-800/60 text-white px-2 py-0.5 rounded border border-emerald-400/30">٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة استراتيجية 3 - الجو */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#34d399] to-[#10b981]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">الجو</h3>
                          <div className="w-6 h-6 bg-emerald-600 rounded-full border border-emerald-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">⚪</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-emerald-300">قريباً</span>
                          <span className="text-[10px] bg-emerald-800/60 text-white px-2 py-0.5 rounded border border-emerald-400/30">٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة استراتيجية 4 - كلمات متقاطعة */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#6ee7b7] to-[#34d399]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">كلمات متقاطعة</h3>
                          <div className="w-6 h-6 bg-emerald-500 rounded-full border border-emerald-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">أ</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-emerald-300">قريباً</span>
                          <span className="text-[10px] bg-emerald-800/60 text-white px-2 py-0.5 rounded border border-emerald-400/30">١-٤ لاعبين</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* الصف الرابع - ألعاب الأكشن */}
                <div className="rounded-xl bg-gradient-to-b from-[#7e22ce]/90 to-[#581c87]/70 border-2 border-[#d8b4fe]/40 p-4 backdrop-blur-sm shadow-2xl">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-[#d8b4fe]">ألعاب الأكشن</h2>
                    <div className="h-1 w-24 mx-auto bg-gradient-to-r from-[#d8b4fe]/10 via-[#d8b4fe] to-[#d8b4fe]/10 rounded-full mt-2"></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* لعبة أكشن 1 - تيكن تاج تيم */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#9333ea] to-[#7e22ce]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">تيكن تاج تيم</h3>
                          <div className="w-6 h-6 bg-purple-800 rounded-full border border-purple-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">👊</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-purple-300">قريباً</span>
                          <span className="text-[10px] bg-purple-800/60 text-white px-2 py-0.5 rounded border border-purple-400/30">٢-٤ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة أكشن 2 - نارتو للمبتدئين */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#a855f7] to-[#9333ea]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">نارتو للمبتدئين</h3>
                          <div className="w-6 h-6 bg-purple-700 rounded-full border border-purple-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">🍃</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-purple-300">قريباً</span>
                          <span className="text-[10px] bg-purple-800/60 text-white px-2 py-0.5 rounded border border-purple-400/30">٢-٦ لاعبين</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة أكشن 3 - تيكن ستريت كومبات */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#c084fc] to-[#a855f7]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">ستريت كومبات</h3>
                          <div className="w-6 h-6 bg-purple-600 rounded-full border border-purple-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">🥋</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-purple-300">قريباً</span>
                          <span className="text-[10px] bg-purple-800/60 text-white px-2 py-0.5 rounded border border-purple-400/30">١-٢ لاعب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* لعبة أكشن 4 - معركة النينجا */}
                    <div className="relative rounded-lg overflow-hidden h-28 shadow-lg group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-b from-[#d8b4fe] to-[#c084fc]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="relative z-10 p-3 flex flex-col h-full">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">معركة النينجا</h3>
                          <div className="w-6 h-6 bg-purple-500 rounded-full border border-purple-300 flex items-center justify-center">
                            <span className="text-[10px] text-white">⚔️</span>
                          </div>
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-purple-300">قريباً</span>
                          <span className="text-[10px] bg-purple-800/60 text-white px-2 py-0.5 rounded border border-purple-400/30">٢-٨ لاعبين</span>
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

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white p-2 shadow-xl border-t border-[#D4AF37]/30 text-xs">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="text-[#D4AF37]">© 2025 بوكر عرباوي - جميع الحقوق محفوظة</div>
          <div className="flex gap-2">
            <Button 
              variant="link" 
              className="text-white/60 hover:text-[#D4AF37] p-0 h-auto text-xs"
              onClick={() => navigate("/help")}
            >
              المساعدة
            </Button>
            <span className="text-white/60">|</span>
            <Button 
              variant="link" 
              className="text-white/60 hover:text-[#D4AF37] p-0 h-auto text-xs"
              onClick={() => navigate("/privacy")}
            >
              سياسة الخصوصية
            </Button>
            <span className="text-white/60">|</span>
            <Button 
              variant="link" 
              className="text-white/60 hover:text-[#D4AF37] p-0 h-auto text-xs"
              onClick={() => navigate("/terms")}
            >
              شروط الاستخدام
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}