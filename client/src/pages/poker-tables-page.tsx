import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameTable } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Coins } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PokerTablesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activePokerLevel, setActivePokerLevel] = useState("نوب");

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
    return tables.filter(table => table.category === category);
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
      <header className="relative z-10 bg-black/80 text-white p-6 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#D4AF37]">طاولات بوكر تكساس</h1>
          
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
      <main className="relative z-10 container mx-auto flex-1 p-6">
        <div className="space-y-6">
          {/* مستويات البوكر */}
          <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#D4AF37]">اختر مستوى اللعب</h2>
              <div className="text-white/80">
                رصيدك: <span className="text-[#D4AF37] font-bold">{user?.chips?.toLocaleString()}</span> رقاقة
              </div>
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