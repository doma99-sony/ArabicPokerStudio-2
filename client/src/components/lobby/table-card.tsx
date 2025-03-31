import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { GameTable } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, DollarSign, PlayCircle, Plus, Eye as EyeIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: GameTable;
}

export function TableCard({ table }: TableCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);
  const [showSeats, setShowSeats] = useState(false);

  // دالة للتحقق مما إذا كانت الطاولة ممتلئة
  const isTableFull = table.status === "full";
  
  // الانضمام للعبة - إما كلاعب نشط أو كمشاهد
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (table.gameType === "naruto") {
        return { success: true };
      }
      
      // إرسال طلب الانضمام مع تحديد ما إذا كان الانضمام كمشاهد
      const payload = isTableFull ? { asSpectator: true } : {};
      const res = await apiRequest("POST", `/api/game/${table.id}/join`, payload);
      return await res.json();
    },
    onSuccess: (data) => {
      if (table.gameType === "naruto") {
        window.location.href = `/naruto/${table.id}`;
        return;
      }
      
      if (data.isSpectator) {
        toast({
          title: "وضع المشاهدة",
          description: "أنت الآن تشاهد اللعبة. ستتمكن من الانضمام عندما يصبح هناك مقعد متاح.",
        });
      } else {
        toast({
          title: "تم الانضمام بنجاح",
          description: "انضممت إلى الطاولة كلاعب نشط",
        });
      }
      
      // الانتقال إلى صفحة اللعبة (سواء كمشاهد أو لاعب)
      window.location.href = `/game/${table.id}`;
    },
    onError: (error: Error) => {
      // عرض رسالة الخطأ
      toast({
        title: "فشل الانضمام إلى الطاولة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusColor = () => {
    switch (table.status) {
      case "available":
        return "bg-green-500/70 hover:bg-green-500/60";
      case "busy":
        return "bg-amber-500/70 hover:bg-amber-500/60";
      case "full":
        return "bg-red-500/70 hover:bg-red-500/60";
      default:
        return "bg-gray-500/70 hover:bg-gray-500/60";
    }
  };

  const getStatusText = () => {
    switch (table.status) {
      case "available":
        return "متاحة";
      case "busy":
        return "مشغولة";
      case "full":
        return "ممتلئة";
      default:
        return "غير معروف";
    }
  };

  const handleSeatJoin = () => {
    joinMutation.mutate();
  };

  const generateSeats = () => {
    const seats = [];
    const occupied = table.currentPlayers;
    const maxPlayers = table.maxPlayers;

    const occupiedSeats = new Set();
    while (occupiedSeats.size < occupied) {
      occupiedSeats.add(Math.floor(Math.random() * maxPlayers));
    }
    for (let i = 0; i < maxPlayers; i++) {
      seats.push({ id: i, occupied: occupiedSeats.has(i) });
    }
    return seats;
  };

  const seats = generateSeats();

  return (
    <Card className="bg-black/70 border border-[#D4AF37]/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-[#D4AF37]/50" 
          onMouseEnter={() => setShowSeats(true)} 
          onMouseLeave={() => setShowSeats(false)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#D4AF37] text-xl">{table.name}</CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-white/80 space-y-4">
        <div className="relative">
          <div className="w-full h-24 bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] rounded-full flex items-center justify-center border-2 border-[#D4AF37]/70">
            <span className="text-[#D4AF37] text-lg font-bold">♠️ ♥️</span>
          </div>
          <div className="absolute inset-0 -top-4">
            <div className="flex justify-around">
              {seats.slice(0, 5).map((seat, index) => (
                <div key={index} className="relative" 
                     onMouseEnter={() => setHoverSeat(seat.id)} 
                     onMouseLeave={() => setHoverSeat(null)}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center", 
                    seat.occupied ? "bg-[#D4AF37] text-black" : "bg-gray-700/50 text-white border border-dashed border-[#D4AF37]/40", 
                    hoverSeat === seat.id && !seat.occupied && "bg-[#D4AF37]/30")}>
                    {seat.occupied ? (
                      <span className="text-xs">🧑</span>
                    ) : (
                      <span className="text-white"><Plus size={14} /></span>
                    )}
                  </div>
                  {hoverSeat === seat.id && !seat.occupied && showSeats && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                      <button onClick={handleSeatJoin} 
                              disabled={table.status === "full" || joinMutation.isPending} 
                              className="bg-[#D4AF37] text-black text-xs py-1 px-2 rounded-md shadow-lg whitespace-nowrap flex items-center">
                        {joinMutation.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        ) : (
                          <>انضم</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users size={16} className="text-[#D4AF37] ml-2" />
            <span>اللاعبين: {table.currentPlayers}/{table.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <DollarSign size={16} className="text-[#D4AF37] ml-2" />
            <span>العمى: {table.smallBlind} / {table.bigBlind}</span>
          </div>
        </div>
        <div className="border-t border-[#D4AF37]/20 pt-3 text-sm">
          <div className="flex justify-between mb-1">
            <span>الحد الأدنى للدخول:</span>
            <span className="font-bold text-[#D4AF37]">{table.minBuyIn.toLocaleString()} رقاقة</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className={`w-full font-bold ${
          table.status === "full" 
            ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black" 
            : "bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A]"
        }`}
                disabled={joinMutation.isPending} 
                onClick={() => joinMutation.mutate()}>
          {joinMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            table.status === "full" ? (
              <> <EyeIcon size={18} className="ml-2" /> مشاهدة </>
            ) : (
              <> <PlayCircle size={18} className="ml-2" /> انضم للعب </>
            )
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}