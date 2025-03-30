import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GameTable } from "../types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const { data: tables, isLoading: isLoadingTables } = useQuery<GameTable[]>({
    queryKey: ["/api/tables"],
    retry: false,
  });
  
  useEffect(() => {
    if (!user && !isLoadingTables) {
      navigate("/auth");
    }
  }, [user, navigate, isLoadingTables]);
  
  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const handleTableClick = (tableId: number) => {
    navigate(`/game/${tableId}`);
  };
  
  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen text-white"
         style={{
           backgroundImage: "url('/images/egyptian-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center"
         }}
    >
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-4">
          <header className="flex justify-between items-center mb-8 pt-4">
            <h1 className="text-3xl font-bold text-[#D4AF37]">قاعة البوكر المصرية</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">أهلاً،</p>
                <p className="font-semibold">{user.username}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <p className="flex items-center gap-1 text-[#D4AF37]">
                  <span className="font-roboto">{user.chips.toLocaleString()}</span>
                  <span className="w-4 h-4 bg-[#D4AF37] rounded-full"></span>
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
                    onClick={handleProfileClick}
                  >
                    الملف الشخصي
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent border-red-600/50 text-red-600 hover:bg-red-600/10 hover:text-red-600"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "تسجيل الخروج"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </header>
          
          <main className="relative z-10 py-8">
            <div className="bg-black/60 p-6 rounded-xl border border-[#D4AF37]/20 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#D4AF37]">اختر طاولة للعب</h2>
              
              {isLoadingTables ? (
                <div className="flex items-center justify-center h-60">
                  <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tables?.map(table => (
                    <div 
                      key={table.id}
                      onClick={() => handleTableClick(table.id)}
                      className="bg-black/70 border border-[#D4AF37]/40 rounded-lg overflow-hidden hover:border-[#D4AF37] transition-all cursor-pointer p-4 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-[#D4AF37]">{table.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          table.status === 'available' ? 'bg-green-900/60 text-green-300' :
                          table.status === 'busy' ? 'bg-yellow-900/60 text-yellow-300' :
                          'bg-red-900/60 text-red-300'
                        }`}>
                          {table.status === 'available' ? 'متاحة' :
                           table.status === 'busy' ? 'مشغولة' : 'ممتلئة'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">الرهان الأصغر/الأكبر:</span>
                          <span className="font-roboto">{table.smallBlind}/{table.bigBlind}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">الحد الأدنى للدخول:</span>
                          <span className="font-roboto">{table.minBuyIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">اللاعبون:</span>
                          <span className="font-roboto">{table.currentPlayers}/{table.maxPlayers}</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default" 
                        className="w-full mt-4 bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-black"
                      >
                        انضم الآن
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}