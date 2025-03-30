import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface GameControlsProps {
  gameState: GameState;
}

export function GameControls({ gameState }: GameControlsProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Function to leave the table
  const handleLeaveTable = () => {
    navigate("/");
  };
  
  return (
    <div className="mb-3 bg-slate/30 rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center">
        <Button
          variant="destructive"
          className="bg-casinoRed hover:bg-red-700 text-white font-cairo transition-colors ml-3"
          onClick={handleLeaveTable}
        >
          <LogOut className="ml-2 h-4 w-4" /> خروج
        </Button>
        <span className="text-gold font-tajawal">{gameState.tableName}</span>
      </div>
      
      <div className="flex items-center">
        <div className="mr-4 bg-deepBlack rounded-full px-3 py-1 flex items-center border border-gold/20">
          <i className="fas fa-coins text-gold ml-2"></i>
          <span className="text-gold font-roboto">{user?.chips?.toLocaleString() || 0}</span>
        </div>
        <span className="text-white/60 font-tajawal text-sm">الجولة: <span className="font-roboto">{gameState.round}/10</span></span>
      </div>
    </div>
  );
}
