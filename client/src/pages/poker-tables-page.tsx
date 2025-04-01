import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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

      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-12 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-7xl font-bold text-[#D4AF37]">طاولات بوكر تكساس</h1>
            {/* عداد المستخدمين المتصلين */}
            <div className="absolute top-6 left-6">
              <OnlineUsersCounter />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={18} className="ml-2" />
            العودة إلى اللوبي
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-6 mt-8">
        <div className="space-y-8">
          {/* Ranking Section */}
          <div className="relative mb-16 mt-4">
            <div className="absolute -top-8 right-4 w-64">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">RANK</h3>
                <img 
                  src="/attached_assets/image_1743420817096.png" 
                  alt="Games Ranking" 
                  className="w-full h-auto"
                  style={{ maxWidth: "200px" }}
                />
              </div>
            </div>

            {/* Popup Button */}
            <button
              onClick={() => setShowRankPopup(true)}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#E5C04B] transition-colors z-20"
            >
              عرض التفاصيل
            </button>

            {/* Popup Dialog */}
            {showRankPopup && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30">
                <div className="bg-deepBlack border-2 border-[#D4AF37] rounded-xl p-8 max-w-2xl w-full mx-4">
                  <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">تفاصيل التصنيف</h2>
                  <div className="text-white space-y-4">
                    {/* Add your ranking details here */}
                    <p>سيتم إضافة تفاصيل التصنيف هنا...</p>
                  </div>
                  <button
                    onClick={() => setShowRankPopup(false)}
                    className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Ranking Section */}
          <div className="relative mb-8">
            <div className="absolute top-4 right-4 w-64">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">RANK</h3>
                <img 
                  src="/your-uploaded-games-image.png" 
                  alt="Ranking" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Popup Button */}
            <button
              onClick={() => setShowRankPopup(true)}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#E5C04B] transition-colors z-20"
            >
              عرض التفاصيل
            </button>

            {/* Popup Dialog */}
            {showRankPopup && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-30">
                <div className="bg-deepBlack border-2 border-[#D4AF37] rounded-xl p-8 max-w-2xl w-full mx-4">
                  <h2 className="text-2xl font-bold text-[#D4AF37] mb-4">تفاصيل التصنيف</h2>
                  <div className="text-white space-y-4">
                    {/* Add your ranking details here */}
                    <p>سيتم إضافة تفاصيل التصنيف هنا...</p>
                  </div>
                  <button
                    onClick={() => setShowRankPopup(false)}
                    className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* مستويات البوكر */}
          <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">اختر مستوى اللعب</h2>
              <div className="text-white/80">
                رصيدك: <span className="text-[#D4AF37] font-bold">{formatChips(user?.chips || 0)}</span> رقاقة
              </div>
            </div>

            <Tabs 
              defaultValue="نوب" 
              value={activePokerLevel}
              onValueChange={setActivePokerLevel}
              className="w-full tabs-container"
            >
              <TabsList className="grid w-full grid-cols-4 h-auto mb-6">
                <TabsTrigger 
                  value="نوب" 
                  className={`py-4 text-lg ${canPlayLevel(20000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(20000)}
                >
                  نوب <Coins className="ml-2 h-5 w-5" /> 20,000
                </TabsTrigger>
                <TabsTrigger 
                  value="لسه بتعلم" 
                  className={`py-3 ${canPlayLevel(100000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(100000)}
                >
                  لسه بتعلم <Coins className="ml-2 h-4 w-4" /> 100,000
                </TabsTrigger>
                <TabsTrigger 
                  value="محترف" 
                  className={`py-3 ${canPlayLevel(500000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(500000)}
                >
                  محترف <Coins className="ml-2 h-4 w-4" /> 500,000
                </TabsTrigger>
                <TabsTrigger 
                  value="الفاجر" 
                  className={`py-3 ${canPlayLevel(1000000) ? '' : 'opacity-70'} tab-button`}
                  disabled={!canPlayLevel(1000000)}
                >
                  الفاجر <Coins className="ml-2 h-4 w-4" /> 1,000,000
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
                    <h3 className="text-[#D4AF37] text-lg mb-4">طاولات الفاجر <span className="text-white/70 text-sm mr-2">الحد الأدنى: 1,000,000 رقاقة</span></h3>
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