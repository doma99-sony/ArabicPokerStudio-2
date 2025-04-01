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
    <div className="fixed bottom-0 left-0 right-0 bg-black/70 border-t border-gold/30 py-1.5 px-3 z-50 h-14">
      {/* تنسيق أفقي يضع جميع الأزرار في صف واحد مع وضع التعليمات بجانب الإعدادات */}
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-6xl flex items-center gap-2">
          {/* أزرار الجانب الأيسر */}
          <div className="flex items-center gap-2">
            {/* زر الخروج */}
            <Button
              variant="destructive"
              className="bg-casinoRed hover:bg-red-700 text-white font-cairo transition-colors rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0"
              onClick={handleLeaveTable}
              disabled={leaveMutation.isPending}
              title="خروج"
            >
              {leaveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* الأزرار الرئيسية في الوسط */}
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="px-3 h-9 rounded-full bg-deepBlack/80 text-gold border border-gold/20 flex items-center flex-shrink-0">
              <span className="font-tajawal">{gameState.tableName}</span>
            </div>
          
            <button className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-all flex-shrink-0">
              <Star className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all flex-shrink-0">
              <Heart className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-all relative flex-shrink-0">
              <Mail className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
            </button>

            <button className="w-9 h-9 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-all flex-shrink-0">
              <Gift className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-500/30 transition-all relative flex-shrink-0">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">1</span>
            </button>

            <button className="w-9 h-9 bg-slate-500/20 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-500/30 transition-all flex-shrink-0">
              <User className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all flex-shrink-0">
              <Home className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 hover:bg-teal-500/30 transition-all flex-shrink-0">
              <UserPlus className="h-4 w-4" />
            </button>

            <button className="w-9 h-9 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-500/30 transition-all flex-shrink-0">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
          
          {/* أزرار الجانب الأيمن */}
          <div className="flex items-center gap-2">
            {/* زر الإعدادات */}
            <button className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center text-gold hover:bg-gold/30 transition-all flex-shrink-0">
              <Settings className="h-4 w-4" />
            </button>
            
            {/* زر التعليمات (تم وضعه بجانب الإعدادات) */}
            <Button
              variant="ghost"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-cairo transition-colors rounded-full w-9 h-9 p-0 flex items-center justify-center flex-shrink-0"
              onClick={onShowInstructions}
              title="تعليمات"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            {/* معلومات اللاعب */}
            <div className="bg-deepBlack/80 rounded-full px-3 py-1 flex items-center border border-gold/20 flex-shrink-0 h-9">
              <Coins className="text-gold w-4 h-4 ml-1" />
              <span className="text-gold font-roboto text-sm">{formatChips(user?.chips || 0)}</span>
            </div>
            
            <div className="bg-deepBlack/80 rounded-full px-3 py-1 flex items-center border border-gold/20 flex-shrink-0 h-9">
              <span className="text-white/80 font-tajawal text-xs">الجولة: <span className="font-roboto">{gameState.round || 1}/{gameState.maxRound || 10}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
