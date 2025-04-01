import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GameControlsProps {
  gameState: GameState;
}

export function GameControls({ gameState }: GameControlsProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // استخراج معرف الطاولة من المسار
  const tableId = location.split('/').pop();
  
  // استخدام mutation لمغادرة الطاولة
  const leaveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/game/${tableId}/leave`);
    },
    onSuccess: () => {
      toast({
        title: "تم مغادرة الطاولة بنجاح",
        description: "تم استعادة الرقاقات المتبقية إلى رصيدك.",
        variant: "default",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ أثناء مغادرة الطاولة",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Function to leave the table
  const handleLeaveTable = () => {
    leaveMutation.mutate();
  };
  
  return (
    <div className="mb-3 bg-slate/30 rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center">
        <Button
          variant="destructive"
          className="bg-casinoRed hover:bg-red-700 text-white font-cairo transition-colors ml-3"
          onClick={handleLeaveTable}
          disabled={leaveMutation.isPending}
        >
          {leaveMutation.isPending ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="ml-2 h-4 w-4" />
          )}
          خروج
        </Button>
        <span className="text-gold font-tajawal">{gameState.tableName}</span>
      </div>
      
      <div className="flex items-center">
        <div className="mr-4 bg-deepBlack rounded-full px-3 py-1 flex items-center border border-gold/20">
          <i className="fas fa-coins text-gold ml-2"></i>
          <span className="text-gold font-roboto">{user?.chips?.toLocaleString() || 0}</span>
        </div>
        <span className="text-white/60 font-tajawal text-sm">الجولة: <span className="font-roboto">{gameState.round || 1}/{gameState.maxRound || 10}</span></span>
      </div>
    </div>
  );
}
