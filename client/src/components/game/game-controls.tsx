import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { GameState } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Loader2, 
  Coins, 
  HelpCircle, 
  Settings, 
  Heart, 
  Mail, 
  Gift, 
  Bell, 
  User,
  Home,
  UserPlus,
  ShoppingCart,
  Star
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatChips } from "@/lib/utils";

interface GameControlsProps {
  gameState: GameState;
  onShowInstructions?: () => void;
}

export function GameControls({ gameState, onShowInstructions }: GameControlsProps) {
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
    <div className="fixed bottom-0 left-0 right-0 bg-black/70 border-t border-gold/30 py-2 px-4 z-50">
      <div className="flex justify-between items-center">
        {/* الجانب الأيسر: مغادرة الطاولة */}
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Button
            variant="destructive"
            className="bg-casinoRed hover:bg-red-700 text-white font-cairo transition-colors rounded-full w-10 h-10 p-0 flex items-center justify-center"
            onClick={handleLeaveTable}
            disabled={leaveMutation.isPending}
            title="خروج"
          >
            {leaveMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
          
          {/* اسم الطاولة */}
          <div className="h-10 px-3 py-1 rounded-full bg-deepBlack/80 text-gold border border-gold/20 flex items-center">
            <span className="font-tajawal">{gameState.tableName}</span>
          </div>
        </div>
        
        {/* الزرار الرئيسية في الوسط */}
        <div className="flex justify-center items-center space-x-3 rtl:space-x-reverse">
          <button className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-all">
            <Star className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all">
            <Heart className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-all relative">
            <Mail className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
          </button>

          <button className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-all">
            <Gift className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">1</span>
          </button>

          <button className="w-10 h-10 bg-slate-500/20 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-500/30 transition-all">
            <User className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all">
            <Home className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-500/30 transition-all">
            <UserPlus className="h-5 w-5" />
          </button>

          <button className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-500/30 transition-all">
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          {/* زر الإعدادات */}
          <button className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-gold/30 transition-all">
            <Settings className="h-5 w-5" />
          </button>
          
          {/* زر التعليمات */}
          <Button
            variant="ghost"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-cairo transition-colors rounded-full w-10 h-10 p-0 flex items-center justify-center"
            onClick={onShowInstructions}
            title="تعليمات"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
        
        {/* معلومات اللاعب على اليمين */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="bg-deepBlack/80 rounded-full px-3 py-1 flex items-center border border-gold/20">
            <Coins className="text-gold w-4 h-4 ml-2" />
            <span className="text-gold font-roboto">{formatChips(user?.chips || 0)}</span>
          </div>
          
          <div className="bg-deepBlack/80 rounded-full px-3 py-1 flex items-center border border-gold/20">
            <span className="text-white/80 font-tajawal text-sm">الجولة: <span className="font-roboto">{gameState.round || 1}/{gameState.maxRound || 10}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
