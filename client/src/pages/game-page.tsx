import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GameState } from "@/types";
import { Loader2 } from "lucide-react";
import { PokerTable } from "@/components/game/poker-table";
import { GameControls } from "@/components/game/game-controls";
import { BetControls } from "@/components/game/bet-controls";
import { useToast } from "@/hooks/use-toast";

export default function GamePage({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // التأكد من وجود معرف الطاولة
  if (!params || !params.tableId) {
    useEffect(() => {
      toast({
        title: "خطأ",
        description: "معرف الطاولة غير صالح",
        variant: "destructive",
      });
      navigate("/");
    }, [toast, navigate]);
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gold font-cairo text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  const tableId = parseInt(params.tableId);
  
  // Fetch game state
  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: [`/api/game/${tableId}`],
    refetchInterval: 2000, // Poll every 2 seconds for updates
    enabled: !!user && !!tableId, // تمكين الاستعلام فقط عند وجود مستخدم مسجل الدخول ومعرف طاولة صالح
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/game/${tableId}`, {
          credentials: 'include'
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("غير مصرح لك الوصول");
          }
          throw new Error("فشل في جلب بيانات اللعبة");
        }
        
        return await res.json();
      } catch (error) {
        console.error("خطأ في جلب حالة اللعبة:", error);
        throw error;
      }
    }
  });
  
  // Handle errors and redirect if needed
  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ",
        description: "تعذر الانضمام إلى الطاولة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [error, toast, navigate]);
  
  // If still loading, show loading indicator
  if (isLoading || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gold font-cairo text-lg">جاري الانضمام إلى الطاولة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deepBlack text-white py-2 flex flex-col">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Game controls (header) */}
        <GameControls gameState={gameState} />
        
        {/* Poker table (middle) */}
        <PokerTable gameState={gameState} />
        
        {/* Betting controls (footer) */}
        <BetControls gameState={gameState} />
      </div>
    </div>
  );
}
