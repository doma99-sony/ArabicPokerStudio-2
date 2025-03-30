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
        {/* Game Categories */}
        <div className="rounded-xl bg-black/60 border border-[#D4AF37]/20 p-6 backdrop-blur-sm mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#D4AF37]">اختر نوع اللعبة</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* بوكر عرباوي */}
            <div className="flex flex-col h-48 rounded-lg overflow-hidden border-2 border-[#D4AF37]/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
            <div className="flex flex-col h-48 rounded-lg overflow-hidden border-2 border-orange-500/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
            <div className="flex flex-col h-48 rounded-lg overflow-hidden border-2 border-red-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-[#9A1212] to-[#5F0000] flex-1 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">鉄</span>
              </div>
              <button 
                className="py-3 px-4 bg-red-700 text-white font-bold text-lg hover:bg-red-600 transition-colors"
              >
                تيكن
              </button>
            </div>
            
            {/* دومينو */}
            <div className="flex flex-col h-48 rounded-lg overflow-hidden border-2 border-blue-600/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-[#0047AB] to-[#00008B] flex-1 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">🎲</span>
              </div>
              <button 
                className="py-3 px-4 bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-colors"
              >
                دومينو
              </button>
            </div>
          </div>
        </div>
        
        {/* Poker Tables */}
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