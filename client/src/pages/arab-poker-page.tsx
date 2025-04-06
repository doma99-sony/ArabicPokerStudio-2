import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { GameTable } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { Button } from "@/components/ui/button";
import { OnlineUsersCounter } from "@/components/ui/online-users-badge";
import { Loader2, ArrowRight, Coins, Plus, Table2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChips } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { CreateTableDialog } from "@/components/dialogs/create-table-dialog";

export default function ArabPokerPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [activePokerLevel, setActivePokerLevel] = useState("نوب");
  const [showRankPopup, setShowRankPopup] = useState(false);
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  
  // استخدام WebSocket لاتصال مستمر مع الخادم
  const ws = useWebSocket();
  
  // تأكد من إنشاء اتصال WebSocket جديد عند تحميل الصفحة
  useEffect(() => {
    if (user && ws.status !== 'open') {
      console.log('إنشاء اتصال WebSocket في صفحة بوكر العرب');
      ws.reconnect();
    }
    
    // تنظيف عند مغادرة الصفحة، نحتفظ بالاتصال مفتوحاً
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة صفحة بوكر العرب');
    };
  }, [user, ws]);

  const { data: tables, isLoading: tablesLoading, refetch } = useQuery<GameTable[]>({
    queryKey: ["/api/tables", "arab_poker"],
    queryFn: async () => {
      try {
        if (!user) {
          return [];
        }

        const res = await fetch(`/api/tables/arab_poker`, {
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
      const tableCategory = table.category || (table.tableSettings?.category || '');
      return tableCategory.includes(category);
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="mr-2 h-10 w-10 animate-spin text-[#D4AF37]" />
        <span className="text-xl font-bold">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-[#0a0a21]">
      {/* Header with fancier design */}
      <header className="relative z-10 bg-black/60 border-b border-[#D4AF37]/30">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/attached_assets/image_1743420805761.png" 
              alt="Arab Poker Logo" 
              className="h-10 w-auto mr-2"
            />
            <div>
              <h1 className="text-xl font-bold text-[#D4AF37]">بوكر العرب</h1>
              <p className="text-xs text-[#D4AF37]/70">اللعبة المفضلة للاعبين العرب</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <OnlineUsersCounter />
            
            <div className="flex items-center bg-black/40 px-3 py-1 rounded-lg border border-[#D4AF37]/30">
              <Coins className="h-5 w-5 text-[#D4AF37] ml-1" />
              <span className="text-[#D4AF37] font-bold">{formatChips(user?.chips || 0)}</span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto flex-1 p-4 mt-2">
        <div className="space-y-4">
          {/* Tabs for different levels */}
          <Tabs defaultValue="نوب" className="w-full" onValueChange={setActivePokerLevel}>
            <div className="bg-black/40 p-2 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-[#D4AF37] mr-2">مستويات بوكر العرب</h2>
                <Button 
                  className="bg-[#D4AF37] text-black hover:bg-[#E5C04B] flex items-center"
                  onClick={() => setShowCreateTableDialog(true)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء طاولة جديدة
                </Button>
              </div>
              <TabsList className="grid grid-cols-4 bg-black/40 p-1 rounded-lg">
                <TabsTrigger 
                  value="نوب" 
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  نوب
                </TabsTrigger>
                <TabsTrigger 
                  value="متوسط" 
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  متوسط
                </TabsTrigger>
                <TabsTrigger 
                  value="محترف" 
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  محترف
                </TabsTrigger>
                <TabsTrigger 
                  value="الفاجر" 
                  className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                >
                  الفاجر
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="نوب" className="mt-0">
              {tablesLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : getTablesByCategory('نوب').length === 0 ? (
                <div className="text-center p-10 bg-black/20 rounded-lg">
                  <p className="text-[#D4AF37]">لا توجد طاولات متاحة حالياً، تحقق لاحقاً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getTablesByCategory('نوب').map((table) => (
                    <TableCard 
                      key={table.id} 
                      table={table}
                      gameType="arab_poker"
                      onJoin={() => navigate(`/arab-poker/${table.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="متوسط" className="mt-0">
              {tablesLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : getTablesByCategory('متوسط').length === 0 ? (
                <div className="text-center p-10 bg-black/20 rounded-lg">
                  <p className="text-[#D4AF37]">لا توجد طاولات متاحة حالياً، تحقق لاحقاً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getTablesByCategory('متوسط').map((table) => (
                    <TableCard 
                      key={table.id} 
                      table={table}
                      gameType="arab_poker"
                      onJoin={() => navigate(`/arab-poker/${table.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="محترف" className="mt-0">
              {tablesLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : getTablesByCategory('محترف').length === 0 ? (
                <div className="text-center p-10 bg-black/20 rounded-lg">
                  <p className="text-[#D4AF37]">لا توجد طاولات متاحة حالياً، تحقق لاحقاً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getTablesByCategory('محترف').map((table) => (
                    <TableCard 
                      key={table.id} 
                      table={table}
                      gameType="arab_poker"
                      onJoin={() => navigate(`/arab-poker/${table.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="الفاجر" className="mt-0">
              {tablesLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : getTablesByCategory('الفاجر').length === 0 ? (
                <div className="text-center p-10 bg-black/20 rounded-lg">
                  <p className="text-[#D4AF37]">لا توجد طاولات متاحة حالياً، تحقق لاحقاً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getTablesByCategory('الفاجر').map((table) => (
                    <TableCard 
                      key={table.id} 
                      table={table}
                      gameType="arab_poker"
                      onJoin={() => navigate(`/arab-poker/${table.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-black/40 rounded-lg border border-[#D4AF37]/20">
            <h3 className="text-lg font-bold text-[#D4AF37] mb-2">قواعد بوكر العرب</h3>
            <p className="text-white/80">
              بوكر العرب هو نسخة مميزة من لعبة البوكر تتبع قواعد تكساس هولدم مع بعض اللمسات العربية الخاصة. 
              يتنافس اللاعبون للحصول على أفضل تشكيلة من 5 بطاقات باستخدام بطاقتين خاصتين و5 بطاقات مشتركة.
            </p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-3 rounded-lg">
                <h4 className="text-[#D4AF37] font-bold mb-1">تصنيف الأيدي</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc mr-5">
                  <li>رويال فلاش (Royal Flush)</li>
                  <li>ستريت فلاش (Straight Flush)</li>
                  <li>فور أوف آ كايند (Four of a Kind)</li>
                  <li>فول هاوس (Full House)</li>
                  <li>فلاش (Flush)</li>
                  <li>ستريت (Straight)</li>
                  <li>ثري أوف آ كايند (Three of a Kind)</li>
                  <li>توو بير (Two Pair)</li>
                  <li>بير (Pair)</li>
                  <li>هاي كارد (High Card)</li>
                </ul>
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <h4 className="text-[#D4AF37] font-bold mb-1">مراحل اللعب</h4>
                <ul className="text-white/80 text-sm space-y-1 list-disc mr-5">
                  <li>البلايند (Blinds): الرهانات الإجبارية الأولية</li>
                  <li>بري فلوب (Pre-flop): توزيع بطاقتين لكل لاعب</li>
                  <li>فلوب (Flop): كشف 3 بطاقات مشتركة</li>
                  <li>تيرن (Turn): كشف البطاقة المشتركة الرابعة</li>
                  <li>ريفر (River): كشف البطاقة المشتركة الخامسة</li>
                  <li>شوداون (Showdown): مقارنة الأيدي وتحديد الفائز</li>
                </ul>
              </div>
            </div>

            <div className="mt-3">
              <Button 
                className="bg-[#D4AF37] text-black hover:bg-[#E5C04B]"
                onClick={() => navigate("/how-to-play")}
              >
                شرح مفصل لقواعد اللعب
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-[#D4AF37]/30 py-2">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#D4AF37]/70 text-sm">
            بوكر العرب - لعبة البوكر العربية الأصلية
          </p>
        </div>
      </footer>
      
      {/* نافذة إنشاء طاولة جديدة */}
      <CreateTableDialog 
        isOpen={showCreateTableDialog} 
        onClose={() => setShowCreateTableDialog(false)}
        gameType="arab_poker"
      />
    </div>
  );
}