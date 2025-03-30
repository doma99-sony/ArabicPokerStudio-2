import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GameTable } from "@/types";
import { TableCard } from "@/components/lobby/table-card";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

export default function LobbyPage() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch available tables
  const { data: tables, isLoading } = useQuery<GameTable[]>({
    queryKey: ["/api/tables"],
  });
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Navigate to profile
  const navigateToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-deepBlack text-white">
      {/* Header */}
      <header className="bg-slate bg-opacity-90 border-b border-gold/20 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-gold text-2xl font-bold font-cairo">بوكر تكساس</h1>
          </div>
          
          {/* User info */}
          <div className="flex items-center">
            <div className="mr-4 bg-pokerGreen rounded-full px-3 py-1 flex items-center border border-gold/20">
              <i className="fas fa-coins text-gold ml-2"></i>
              <span className="text-gold font-roboto">{user?.chips?.toLocaleString() || 0}</span>
            </div>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={navigateToProfile}
                className="flex items-center text-white hover:text-gold"
              >
                <div className="w-10 h-10 bg-gold/20 rounded-full overflow-hidden border-2 border-gold/50 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-gold/70" />
                  )}
                </div>
                <span className="mx-2 font-tajawal">{user?.username}</span>
                <i className="fas fa-chevron-down text-gold/70"></i>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 bg-deepBlack">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gold font-cairo">اختر طاولة اللعب</h2>
            
            <Button
              variant="ghost"
              className="text-casinoRed hover:text-red-400"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <i className="fas fa-sign-out-alt ml-2"></i>
                  تسجيل الخروج
                </>
              )}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-gold" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables?.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
              
              {tables?.length === 0 && (
                <div className="col-span-3 text-center py-10 text-slate-400">
                  <i className="fas fa-table-cells text-4xl mb-3"></i>
                  <p className="text-xl font-tajawal">لا توجد طاولات متاحة حالياً</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
