import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameTable } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";

export default function LobbyPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const { data: tables, isLoading: tablesLoading } = useQuery<GameTable[]>({
    queryKey: ["/api/tables"],
    retry: false,
  });
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      }
    });
  };
  
  const navigateToProfile = () => {
    navigate("/profile");
  };
  
  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
         style={{ backgroundImage: "url('/images/egyptian-background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Header Bar */}
      <header className="relative z-10 bg-black/80 text-white p-4 shadow-xl border-b border-[#D4AF37]/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#D4AF37]">بوكر تكساس هولدم</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[#D4AF37]">مرحباً، {user?.username}</p>
              <p className="text-white/80">الرصيد: <span className="text-[#D4AF37] font-bold">{user?.chips}</span> رقاقة</p>
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
        <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">طاولات اللعب المتاحة</h2>
            <div className="text-white text-sm">
              اختر طاولة للانضمام إلى اللعبة
            </div>
          </div>
          
          {tablesLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : tables && tables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/70">
              لا توجد طاولات متاحة حالياً
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 bg-black/80 text-white/60 text-center p-4 mt-8 border-t border-[#D4AF37]/20">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} بوكر تكساس هولدم - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}