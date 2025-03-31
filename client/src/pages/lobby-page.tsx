import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameTable, GameType } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { ChatBox } from "@/components/lobby/chat-box";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User, Plus, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [activeGameCategory, setActiveGameCategory] = useState<GameType>("poker");
  const [activePokerLevel, setActivePokerLevel] = useState("نوب");

  const { data: tables, isLoading: tablesLoading, refetch } = useQuery<GameTable[]>({
    queryKey: ["/api/tables", activeGameCategory],
    queryFn: async () => {
      try {
        // التحقق من المستخدم مباشرة بدلاً من الاعتماد على الكوكيز
        if (!user) {
          // إذا لم يكن هناك مستخدم، نعيد مصفوفة فارغة
          return [];
        }

        const res = await fetch(`/api/tables/${activeGameCategory}`, {
          credentials: "include", // إضافة بيانات الاعتماد لجلب الكوكيز
          headers: {
            'Cache-Control': 'no-cache', // منع التخزين المؤقت
            'Pragma': 'no-cache'
          }
        });

        if (res.status === 401) {
          console.log("انتهت صلاحية الجلسة، إعادة التوجيه إلى صفحة تسجيل الدخول");
          // إعادة التوجيه إلى صفحة تسجيل الدخول في حالة انتهاء الجلسة
          window.location.href = '/auth';
          return [];
        }

        if (!res.ok) throw new Error("فشل في جلب الطاولات");
        return res.json();
      } catch (error) {
        console.error("Error fetching tables:", error);
        return [];
      }
    },
    // تحسين إعدادات الاستعلام
    enabled: !!user, // تمكين الاستعلام فقط عند وجود مستخدم مسجل الدخول
    retry: false, // عدم إعادة المحاولة تلقائيًا عند الفشل
    staleTime: 5000, // تحديد وقت صلاحية البيانات إلى 5 ثوانٍ
  });

  // تحديث الطاولات عند تغيير نوع اللعبة
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [activeGameCategory, refetch, user]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // استخدام window.location بدلاً من navigate مباشرة لضمان تحديث الحالة
        window.location.href = '/auth';
      }
    });
  };

  const navigateToProfile = () => {
    navigate("/profile");
  };

  // تصفية الطاولات حسب الفئة
  const getTablesByCategory = (category: string) => {
    if (!tables) return [];
    return tables.filter(table => table.category === category);
  };

  // التحقق مما إذا كان لدى اللاعب ما يكفي من الرقائق للعب في مستوى معين
  const canPlayLevel = (minBuyIn: number) => {
    return (user?.chips || 0) >= minBuyIn;
  };

  // الحصول على الحد الأدنى للرقائق لكل مستوى
  const getLevelMinBuyIn = (level: string) => {
    switch (level) {
      case "نوب": return 20000;
      case "لسه بتعلم": return 100000;
      case "محترف": return 500000;
      case "الفاجر": return 10000000;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-4 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#D4AF37]">بوكر تكساس عرباوي</h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#D4AF37]">مرحباً، {user?.username}</p>
              <p className="text-white/80">الرصيد: <span className="text-[#D4AF37] font-bold">{user?.chips?.toLocaleString()}</span> رقاقة</p>
            </div>

            <Button 
              variant="outline" 
              className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={navigateToProfile}
            >
              <User size={18} className="ml-2" />
              الملف الشخصي
            </Button>

            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <LogOut size={18} className="ml-2" />
              )}
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-6">
        {/* Game Categories */}
        <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* بوكر عرباوي */}
            <div 
              className={`flex flex-col h-48 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'poker' ? 'ring-4 ring-[#D4AF37]' : ''} border-[#D4AF37]/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => setActiveGameCategory('poker')}
            >
              <div className="bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] flex-1 flex items-center justify-center">
                <span className="text-[#D4AF37] text-4xl font-bold">♠️ ♥️</span>
              </div>
              <button 
                className="py-3 px-4 bg-[#D4AF37] text-[#0A0A0A] font-bold text-lg hover:bg-[#E5C04B] transition-colors"
              >
                بوكر عرباوي
              </button>
            </div>

            {/* نارتو */}
            <div 
              className={`flex flex-col h-48 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'naruto' ? 'ring-4 ring-orange-500' : ''} border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => setActiveGameCategory('naruto')}
            >
              <div className="bg-gradient-to-br from-[#FF8C00] to-[#FF4500] flex-1 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">忍</span>
              </div>
              <button 
                className="py-3 px-4 bg-orange-500 text-white font-bold text-lg hover:bg-orange-400 transition-colors"
              >
                نارتو
              </button>
            </div>

            {/* تيكن */}
            <div 
              className={`flex flex-col h-48 rounded-lg overflow-hidden border-2 ${activeGameCategory === 'tekken' ? 'ring-4 ring-red-600' : ''} border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
              onClick={() => setActiveGameCategory('tekken')}
            >
              <div className="bg-gradient-to-br from-[#9A1212] to-[#5F0000] flex-1 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">鉄</span>
              </div>
              <button 
                className="py-3 px-4 bg-red-700 text-white font-bold text-lg hover:bg-red-600 transition-colors"
              >
                تيكن
              </button>
            </div>

            {/* الدردشة */}
            <div 
              className="flex flex-col h-48 rounded-lg overflow-hidden border-2 border-emerald-600/80 shadow-lg"
            >
              <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 flex-1 flex items-center justify-center p-4">
                <div className="w-full h-full bg-black/30 rounded-lg overflow-y-auto">
                  <ChatBox />
                </div>
              </div>
              <div 
                className="py-3 px-4 bg-emerald-600 text-white font-bold text-lg"
              >
                الدردشة العامة
              </div>
            </div>
          </div>
        </div>

        {activeGameCategory === 'poker' && (
          <div className="space-y-6">
            {/* مستويات البوكر */}
            <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#D4AF37]">اختر مستوى اللعب</h2>
              </div>

              <Tabs 
                defaultValue="نوب" 
                value={activePokerLevel}
                onValueChange={setActivePokerLevel}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 h-auto mb-6">
                  <TabsTrigger 
                    value="نوب" 
                    className={`py-3 ${canPlayLevel(20000) ? '' : 'opacity-70'}`}
                    disabled={!canPlayLevel(20000)}
                  >
                    نوب <Coins className="ml-2 h-4 w-4" /> 20,000
                  </TabsTrigger>
                  <TabsTrigger 
                    value="لسه بتعلم" 
                    className={`py-3 ${canPlayLevel(100000) ? '' : 'opacity-70'}`}
                    disabled={!canPlayLevel(100000)}
                  >
                    لسه بتعلم <Coins className="ml-2 h-4 w-4" /> 100,000
                  </TabsTrigger>
                  <TabsTrigger 
                    value="محترف" 
                    className={`py-3 ${canPlayLevel(500000) ? '' : 'opacity-70'}`}
                    disabled={!canPlayLevel(500000)}
                  >
                    محترف <Coins className="ml-2 h-4 w-4" /> 500,000
                  </TabsTrigger>
                  <TabsTrigger 
                    value="الفاجر" 
                    className={`py-3 ${canPlayLevel(10000000) ? '' : 'opacity-70'}`}
                    disabled={!canPlayLevel(10000000)}
                  >
                    الفاجر <Coins className="ml-2 h-4 w-4" /> 10,000,000
                  </TabsTrigger>
                </TabsList>

                {/* لوحة النوب */}
                <TabsContent value="نوب">
                  {tablesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-4">
                      <h3 className="text-[#D4AF37] text-lg mb-4">طاولات النوب <span className="text-white/70 text-sm mr-2">الحد الأدنى: 20,000 رقاقة</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {getTablesByCategory("نوب").map((table) => (
                          <TableCard key={table.id} table={table} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* لوحة لسه بتعلم */}
                <TabsContent value="لسه بتعلم">
                  {tablesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-4">
                      <h3 className="text-[#D4AF37] text-lg mb-4">طاولات لسه بتعلم <span className="text-white/70 text-sm mr-2">الحد الأدنى: 100,000 رقاقة</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {getTablesByCategory("لسه بتعلم").map((table) => (
                          <TableCard key={table.id} table={table} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* لوحة المحترف */}
                <TabsContent value="محترف">
                  {tablesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-4">
                      <h3 className="text-[#D4AF37] text-lg mb-4">طاولات المحترف <span className="text-white/70 text-sm mr-2">الحد الأدنى: 500,000 رقاقة</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {getTablesByCategory("محترف").map((table) => (
                          <TableCard key={table.id} table={table} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* لوحة الفاجر */}
                <TabsContent value="الفاجر">
                  {tablesLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                  ) : (
                    <div className="bg-black/30 rounded-lg p-4">
                      <h3 className="text-[#D4AF37] text-lg mb-4">طاولات الفاجر <span className="text-white/70 text-sm mr-2">الحد الأدنى: 10,000,000 رقاقة</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {getTablesByCategory("الفاجر").map((table) => (
                          <TableCard key={table.id} table={table} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {activeGameCategory === 'poker' && (
          <div className="mt-6">
            <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-[#D4AF37] mb-4">الدردشة العامة</h3>
              <div className="h-[400px]">
                <ChatBox />
              </div>
            </div>
          </div>
        )}
        
        {activeGameCategory && activeGameCategory !== 'poker' && (
          <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">قريباً...</h3>
              <p className="text-white/70 mb-6 text-center">
                سيتم إطلاق لعبة {activeGameCategory === 'naruto' ? 'نارتو' : activeGameCategory === 'tekken' ? 'تيكن' : 'دومينو'} قريباً
                <br />
                يرجى المحاولة لاحقاً
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setActiveGameCategory('poker')}
                  className="bg-[#D4AF37] text-black hover:bg-[#E5C04B]"
                >
                  العودة إلى بوكر عرباوي
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut size={18} className="ml-2" />
                  الخروج إلى اللوبي
                </Button>
              </div>
            </div>
          </div>
        )}

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <ChatBox />
          </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-4 mt-8 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}