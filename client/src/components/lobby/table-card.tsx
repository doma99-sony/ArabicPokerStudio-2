import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { GameTable } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, DollarSign, PlayCircle, Plus, Eye as EyeIcon, ExternalLink, Coins } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn, formatChips } from "@/lib/utils";

interface TableCardProps {
  table: GameTable;
  gameType?: string;
  onJoin?: () => void;
}

export function TableCard({ table, gameType, onJoin }: TableCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);
  const [showSeats, setShowSeats] = useState(false);

  // دالة للتحقق مما إذا كانت الطاولة ممتلئة
  const isTableFull = table.status === "full";
  
  // دالة للانتقال إلى صفحة اللعبة
  const navigateToGamePage = useCallback((tableId: number) => {
    // تخزين معرف الطاولة في التخزين المحلي
    localStorage.setItem('lastTableId', tableId.toString());
    
    // الحصول على نوع اللعبة من الجدول أو من props
    const currentGameType = gameType || table.gameType;
    console.log("نوع اللعبة:", currentGameType, "معرف الطاولة:", tableId);
    
    // اختيار المسار المناسب حسب نوع اللعبة
    let gamePath = `/game-simple/${tableId}`;
    
    // استخدام المسار المناسب بناءً على نوع اللعبة
    if (currentGameType === "arab_poker") {
      gamePath = `/arab-poker/${tableId}`;
      console.log("استخدام مسار بوكر العرب:", gamePath);
    } else if (currentGameType === "naruto") {
      gamePath = `/naruto/${tableId}`;
    } else if (currentGameType === "domino") {
      gamePath = `/domino/${tableId}`;
    } else if (currentGameType === "tekken") {
      gamePath = `/tekken/${tableId}`;
    } else if (currentGameType === "arabic_rocket") {
      gamePath = `/arabic-rocket/${tableId}`;
    }
    
    console.log("الانتقال إلى المسار:", gamePath);
    window.location.href = gamePath;
  }, [gameType, table.gameType]);

  // الانضمام للعبة - إما كلاعب نشط أو كمشاهد
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (table.gameType === "naruto") {
        return { success: true };
      }
      
      console.log("محاولة الانضمام إلى الطاولة...", { tableId: table.id, isFull: isTableFull });
      
      try {
        // إرسال طلب الانضمام مع تحديد ما إذا كان الانضمام كمشاهد
        const payload = isTableFull ? { asSpectator: true } : {};
        const res = await apiRequest("POST", `/api/game/${table.id}/join`, payload);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("خطأ في الاستجابة:", errorText);
          throw new Error(errorText || "حدث خطأ في الطلب");
        }
        
        const result = await res.json();
        console.log("نتيجة محاولة الانضمام:", result);
        
        // تخزين معرف الطاولة في الـ localStorage للتأكد من استمرارية الجلسة
        localStorage.setItem('lastTableId', table.id.toString());
        
        return { ...result, tableId: table.id };
      } catch (error) {
        console.error("خطأ أثناء محاولة الانضمام:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (table.gameType === "naruto") {
        navigate(`/naruto/${table.id}`);
        return;
      }
      
      if (data.success) {
        // تأكد من وجود خاصية isSpectator في البيانات
        const isUserSpectator = data.isSpectator === true;
        
        if (isUserSpectator) {
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
        
        // استخدام معرف الطاولة من البيانات أو من الجدول
        const tableId = data.tableId || table.id;
        
        if (tableId && typeof tableId === 'number' && tableId > 0) {
          console.log("تم الانضمام بنجاح، جارٍ الانتقال إلى صفحة اللعبة", tableId);
          
          // استخدام الطريقة الجديدة للانتقال
          navigateToGamePage(tableId);
        } else {
          console.error("معرّف الطاولة غير موجود أو غير صالح:", tableId);
          toast({
            title: "خطأ في الانتقال",
            description: "حدث خطأ أثناء محاولة الانتقال إلى صفحة اللعبة. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } else {
        // في حالة الإخفاق مع وجود رسالة
        toast({
          title: "تعذر الانضمام",
          description: data.message || "حدث خطأ أثناء الانضمام إلى الطاولة",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("خطأ في الانضمام:", error);
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
      case "in_progress":
        return "bg-amber-500/70 hover:bg-amber-500/60";
      case "full":
        return "bg-red-500/70 hover:bg-red-500/60";
      case "maintenance":
        return "bg-purple-500/70 hover:bg-purple-500/60";
      default:
        return "bg-gray-500/70 hover:bg-gray-500/60";
    }
  };

  const getStatusText = () => {
    switch (table.status) {
      case "available":
        return "متاحة";
      case "in_progress":
        return "جارية";
      case "full":
        return "ممتلئة";
      case "maintenance":
        return "صيانة";
      default:
        return "غير معروف";
    }
  };

  const handleSeatJoin = () => {
    console.log("تم النقر على مقعد للانضمام");
    if (onJoin) {
      console.log("استخدام onJoin callback من الوالد");
      onJoin();
    } else {
      console.log("استخدام joinMutation الداخلية");
      joinMutation.mutate();
    }
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
    <Card className="bg-black/70 border border-[#D4AF37]/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-[#D4AF37]/50 h-full" 
          onMouseEnter={() => setShowSeats(true)} 
          onMouseLeave={() => setShowSeats(false)}>
      <CardHeader className="pb-1 px-2 pt-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#D4AF37] text-sm">{table.name}</CardTitle>
          <Badge className={`${getStatusColor()} text-white text-xs px-1 py-0`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-white/80 space-y-2 px-2 py-1">
        <div className="relative">
          <div className="w-full h-16 bg-gradient-to-br from-[#1B4D3E] to-[#0A3A2A] rounded-lg flex items-center justify-center border border-[#D4AF37]/70">
            <span className="text-[#D4AF37] text-base font-bold">♠️ ♥️</span>
          </div>
          <div className="absolute inset-0 -top-2">
            <div className="flex justify-around">
              {seats.slice(0, 5).map((seat, index) => (
                <div key={index} className="relative" 
                     onMouseEnter={() => setHoverSeat(seat.id)} 
                     onMouseLeave={() => setHoverSeat(null)}>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center", 
                    seat.occupied ? "bg-[#D4AF37] text-black" : "bg-gray-700/50 text-white border border-dashed border-[#D4AF37]/40", 
                    hoverSeat === seat.id && !seat.occupied && "bg-[#D4AF37]/30")}>
                    {seat.occupied ? (
                      <span className="text-xs">🧑</span>
                    ) : (
                      <span className="text-white"><Plus size={10} /></span>
                    )}
                  </div>
                  {hoverSeat === seat.id && !seat.occupied && showSeats && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
                      <button onClick={handleSeatJoin} 
                              disabled={table.status === "full" || joinMutation.isPending} 
                              className="bg-[#D4AF37] text-black text-[10px] py-0.5 px-1 rounded-md shadow-lg whitespace-nowrap flex items-center">
                        {joinMutation.isPending ? (
                          <Loader2 className="h-2 w-2 animate-spin mx-auto" />
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
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <Users size={12} className="text-[#D4AF37] ml-1" />
            <span className="font-arabic-numbers">{table.currentPlayers}/{table.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <DollarSign size={12} className="text-[#D4AF37] ml-1" />
            <span className="font-arabic-numbers">{formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}</span>
          </div>
        </div>
        <div className="border-t border-[#D4AF37]/20 pt-1 text-xs">
          <div className="flex justify-between">
            <span>الحد الأدنى:</span>
            <span className="font-bold text-[#D4AF37] flex items-center">
              <Coins className="ml-1 h-3 w-3" />
              <span className="font-arabic-numbers">{formatChips(table.minBuyIn)}</span>
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-1 p-2 pt-0">
        <Button className={`w-full font-bold text-xs py-1 px-2 h-auto ${
          table.status === "full" 
            ? "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black" 
            : "bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A]"
        }`}
                disabled={joinMutation.isPending} 
                onClick={() => {
                  console.log("نقر على زر الانضمام الرئيسي");
                  if (onJoin) {
                    console.log("استخدام onJoin callback مع معرف الطاولة:", table.id);
                    onJoin();
                  } else {
                    console.log("استخدام joinMutation الداخلية مع معرف الطاولة:", table.id);
                    joinMutation.mutate();
                  }
                }}>
          {joinMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mx-auto" />
          ) : (
            table.status === "full" ? (
              <> <EyeIcon size={12} className="ml-1" /> مشاهدة </>
            ) : (
              <> <PlayCircle size={12} className="ml-1" /> انضم للعب </>
            )
          )}
        </Button>
        
        {/* زر الانتقال المباشر إلى الطاولة */}
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs py-1 px-2 h-auto border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          onClick={() => {
            // الحصول على نوع اللعبة
            const currentGameType = gameType || table.gameType;
            console.log("نوع اللعبة للانتقال المباشر:", currentGameType);
            
            // استخدام المسار المناسب حسب نوع اللعبة
            let directPath;
            if (currentGameType === "arab_poker") {
              directPath = `/arab-poker/${table.id}`;
            } else if (currentGameType === "naruto") {
              directPath = `/naruto/${table.id}`;
            } else {
              directPath = `/direct-table/${table.id}`;
            }
            
            console.log("الانتقال المباشر إلى:", directPath);
            window.location.href = directPath;
          }}
        >
          <ExternalLink size={10} className="ml-1" /> انتقال مباشر
        </Button>
      </CardFooter>
    </Card>
  );
}