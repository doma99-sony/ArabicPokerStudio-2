import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { GameTable } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { Loader2, ArrowRight, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChips } from "@/lib/utils";

export default function PokerTablesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activePokerLevel, setActivePokerLevel] = useState("نوب");
  const [showRankPopup, setShowRankPopup] = useState(false); // Added state for popup
  
  // استخدام WebSocket لاتصال مستمر مع الخادم
  const ws = useWebSocket();
  
  // تأكد من إنشاء اتصال WebSocket جديد عند تحميل الصفحة
  useEffect(() => {
    if (user && ws.status !== 'open') {
      console.log('إنشاء اتصال WebSocket في صفحة طاولات البوكر');
      ws.reconnect();
    }
    
    // تنظيف عند مغادرة الصفحة، نحتفظ بالاتصال مفتوحاً
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة صفحة طاولات البوكر');
    };
  }, [user, ws]);

  const { data: tables, isLoading: tablesLoading, refetch } = useQuery<GameTable[]>({
    queryKey: ["/api/tables", "poker"],
    queryFn: async () => {
      try {
        if (!user) {
          return [];
        }

        const res = await fetch(`/api/tables/poker`, {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (res.status === 401) {
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
    enabled: !!user,
    retry: false,
    staleTime: 5000,
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [refetch, user]);

  // تصفية الطاولات حسب الفئة
  const getTablesByCategory = (category: string) => {
    if (!tables) return [];
    // استخدام tableSettings?.category لدعم الواجهة التي قمنا بتحديثها
    return tables.filter(table => {
      const tableCategory = table.category || (table.tableSettings as any)?.category;
      return tableCategory === category;
    });
  };

  // التحقق مما إذا كان لدى اللاعب ما يكفي من الرقائق للعب في مستوى معين
  const canPlayLevel = (minBuyIn: number) => {
    return (user?.chips || 0) >= minBuyIn;
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Header Bar - تم تصغير الهيدر */}
      <header className="relative z-10 bg-black/80 text-white p-4 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#D4AF37]">طاولات بوكر تكساس</h1>
            {/* عداد المستخدمين المتصلين */}
            <div className="absolute top-2 left-2">
              <OnlineUsersCounter />
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={16} className="ml-1" />
            العودة للوبي
          </Button>
        </div>
      </header>

      {/* Main Content - تم تقليل الهوامش */}
      <main className="relative z-10 container mx-auto flex-1 p-2 mt-1">
        <div className="space-y-3">
          {/* Ranking Section - تقليص حجم قسم التصنيف */}
          <div className="relative mb-2 flex items-center justify-between bg-black/40 p-2 rounded-lg">
            <div className="flex items-center">
              <img 
                src="/attached_assets/image_1743420817096.png" 
                alt="Games Ranking" 
                className="h-12 w-auto ml-2"
              />
              <h3 className="text-lg font-bold text-[#D4AF37]">تصنيف اللاعبين</h3>
            </div>
            
            {/* زر عرض التفاصيل */}
            <button
              onClick={() => setShowRankPopup(true)}
              className="bg-[#D4AF37] text-black px-3 py-1 text-sm rounded-lg font-bold hover:bg-[#E5C04B] transition-colors"
            >
              عرض التفاصيل
            </button>
            
            {/* Popup Dialog */}
            {showRankPopup && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30">
                <div className="bg-black border-2 border-[#D4AF37] rounded-xl p-4 max-w-xl w-full mx-4">
                  <h2 className="text-xl font-bold text-[#D4AF37] mb-3">تفاصيل التصنيف</h2>
                  <div className="text-white space-y-2">
                    <p>سيتم إضافة تفاصيل التصنيف هنا...</p>
                  </div>
                  <button
                    onClick={() => setShowRankPopup(false)}
                    className="mt-3 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* مستويات البوكر */}
          <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-3 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2 text-sm">
              <h2 className="text-xl font-bold text-[#D4AF37]">اختر مستوى اللعب</h2>
              <div className="text-white/80">
                رصيدك: <span className="text-[#D4AF37] font-bold">{formatChips(user?.chips || 0)}</span>
              </div>
            </div>

            <Tabs 
              defaultValue="نوب" 
              value={activePokerLevel}
              onValueChange={setActivePokerLevel}
              className="w-full tabs-container"
            >
              <TabsList className="grid w-full grid-cols-4 h-auto mb-2">
                <TabsTrigger 
                  value="نوب" 
                  className={`py-2 text-sm ${canPlayLevel(20000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(20000)}
                >
                  نوب <Coins className="ml-1 h-3 w-3" /> 20K
                </TabsTrigger>
                <TabsTrigger 
                  value="لسه بتعلم" 
                  className={`py-2 text-sm ${canPlayLevel(100000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(100000)}
                >
                  بتعلم <Coins className="ml-1 h-3 w-3" /> 100K
                </TabsTrigger>
                <TabsTrigger 
                  value="محترف" 
                  className={`py-2 text-sm ${canPlayLevel(500000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(500000)}
                >
                  محترف <Coins className="ml-1 h-3 w-3" /> 500K
                </TabsTrigger>
                <TabsTrigger 
                  value="الفاجر" 
                  className={`py-2 text-sm ${canPlayLevel(1000000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(1000000)}
                >
                  الفاجر <Coins className="ml-1 h-3 w-3" /> 1M
                </TabsTrigger>
              </TabsList>

              {/* لوحة النوب */}
              <TabsContent value="نوب">
                {tablesLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-2">
                    <h3 className="text-[#D4AF37] text-base mb-2">طاولات النوب <span className="text-white/70 text-xs mr-2">الحد الأدنى: 20K</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-[calc(100vh-320px)] p-1">
                      {getTablesByCategory("نوب").length > 0 ? 
                        getTablesByCategory("نوب").map((table) => (
                          <TableCard key={table.id} table={table} />
                        )) : 
                        <div className="col-span-full text-center py-4 text-white/70">
                          لا توجد طاولات متاحة حالياً
                        </div>
                      }
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
                  <div className="bg-black/30 rounded-lg p-2">
                    <h3 className="text-[#D4AF37] text-base mb-2">طاولات بتعلم <span className="text-white/70 text-xs mr-2">الحد الأدنى: 100K</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-[calc(100vh-320px)] p-1">
                      {getTablesByCategory("لسه بتعلم").length > 0 ? 
                        getTablesByCategory("لسه بتعلم").map((table) => (
                          <TableCard key={table.id} table={table} />
                        )) : 
                        <div className="col-span-full text-center py-4 text-white/70">
                          لا توجد طاولات متاحة حالياً
                        </div>
                      }
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
                  <div className="bg-black/30 rounded-lg p-2">
                    <h3 className="text-[#D4AF37] text-base mb-2">طاولات المحترف <span className="text-white/70 text-xs mr-2">الحد الأدنى: 500K</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-[calc(100vh-320px)] p-1">
                      {getTablesByCategory("محترف").length > 0 ? 
                        getTablesByCategory("محترف").map((table) => (
                          <TableCard key={table.id} table={table} />
                        )) : 
                        <div className="col-span-full text-center py-4 text-white/70">
                          لا توجد طاولات متاحة حالياً
                        </div>
                      }
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
                  <div className="bg-black/30 rounded-lg p-2">
                    <h3 className="text-[#D4AF37] text-base mb-2">طاولات الفاجر <span className="text-white/70 text-xs mr-2">الحد الأدنى: 1M</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto max-h-[calc(100vh-320px)] p-1">
                      {getTablesByCategory("الفاجر").length > 0 ? 
                        getTablesByCategory("الفاجر").map((table) => (
                          <TableCard key={table.id} table={table} />
                        )) : 
                        <div className="col-span-full text-center py-4 text-white/70">
                          لا توجد طاولات متاحة حالياً
                        </div>
                      }
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-2 mt-2 border-t border-[#D4AF37]/20 text-xs">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} بوكر تكساس عرباوي - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}