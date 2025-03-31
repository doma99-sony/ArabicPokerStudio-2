import { useEffect, useState } from "react";
import { Bell, EyeIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SpectatorBarProps {
  tableId: number;
  currentPlayers: number;
  maxPlayers: number;
  onJoinSuccess?: () => void;
}

export function SpectatorBar({ tableId, currentPlayers, maxPlayers, onJoinSuccess }: SpectatorBarProps) {
  const { toast } = useToast();
  const [waitingForSeat, setWaitingForSeat] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // حساب الوقت المنقضي في وضع المشاهدة
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (waitingForSeat) {
      intervalId = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [waitingForSeat]);
  
  // تنسيق الوقت المنقضي (دقائق:ثواني)
  const formatElapsedTime = () => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // طلب الانضمام للطاولة عندما يصبح هناك مقعد متاح
  const joinMutation = useMutation({
    mutationFn: async () => {
      // إذا كانت الطاولة ممتلئة، انتظر حتى يصبح هناك مقعد متاح
      if (currentPlayers >= maxPlayers) {
        setWaitingForSeat(true);
        return { success: false, message: "الطاولة لا تزال ممتلئة، في انتظار مقعد..." };
      }
      
      try {
        // إذا أصبح هناك مقعد متاح، حاول الانضمام كلاعب نشط (ليس كمشاهد)
        console.log("محاولة الانضمام إلى الطاولة من وضع المشاهدة...");
        const res = await fetch(`/api/game/${tableId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ asSpectator: false }) // تأكيد أننا نريد الانضمام كلاعب نشط
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("خطأ في استجابة الانضمام:", errorText);
          throw new Error(errorText || "خطأ في الاستجابة من الخادم");
        }
        
        const data = await res.json();
        console.log("نتيجة محاولة الانضمام:", data);
        return data;
      } catch (error) {
        console.error("خطأ أثناء محاولة الانضمام من وضع المشاهدة:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && !data.isSpectator) {
        // نجح الانضمام كلاعب نشط
        toast({
          title: "تم الانضمام بنجاح",
          description: "أنت الآن لاعب نشط في الطاولة"
        });
        setWaitingForSeat(false);
        
        if (onJoinSuccess) {
          onJoinSuccess();
        }
      } else if (data.success && data.isSpectator) {
        // لا تزال في وضع المشاهدة (الطاولة ممتلئة)
        toast({
          title: "الطاولة ممتلئة",
          description: "لا تزال الطاولة ممتلئة. سنحاول الانضمام مرة أخرى عندما يتوفر مقعد.",
        });
        
        // جدولة محاولة أخرى بعد 5 ثوانٍ
        setTimeout(() => {
          if (waitingForSeat) {
            joinMutation.mutate();
          }
        }, 5000);
      } else {
        // خطأ آخر غير مرتبط بوضع المشاهدة
        toast({
          title: "تعذر الانضمام",
          description: data.message || "حدث خطأ أثناء محاولة الانضمام",
          variant: "destructive"
        });
        
        // إذا كان الخطأ يتعلق بالانتظار، نواصل الانتظار
        if (data.message && data.message.includes("الطاولة") && data.message.includes("ممتلئة")) {
          setTimeout(() => {
            if (waitingForSeat) {
              joinMutation.mutate();
            }
          }, 5000);
        } else {
          setWaitingForSeat(false);
        }
      }
    },
    onError: (error: Error) => {
      console.error("خطأ في الانضمام من المشاهدة:", error);
      toast({
        title: "فشل الانضمام",
        description: error.message,
        variant: "destructive"
      });
      
      // إذا كان الخطأ بسبب امتلاء الطاولة، جدولة محاولة أخرى
      if (error.message.includes("الطاولة ممتلئة")) {
        setTimeout(() => {
          if (waitingForSeat) {
            joinMutation.mutate();
          }
        }, 5000);
      } else {
        setWaitingForSeat(false);
      }
    }
  });

  const handleWaitForSeat = () => {
    joinMutation.mutate();
  };

  const cancelWaiting = () => {
    setWaitingForSeat(false);
    toast({
      title: "تم إلغاء الانتظار",
      description: "لن يتم الانضمام تلقائيًا عند توفر مقعد"
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white border-t border-[#D4AF37] py-2 px-4 z-50">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="bg-red-500/30 p-1 rounded-full">
            <EyeIcon size={18} className="text-red-500" />
          </div>
          <span className="font-medium rtl:mr-2">
            أنت الآن في وضع المشاهدة
          </span>
          <div className="bg-[#D4AF37]/20 px-2 py-0.5 rounded-md text-xs text-[#D4AF37]">
            {currentPlayers}/{maxPlayers} لاعب
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {waitingForSeat ? (
            <>
              <div className="text-amber-400 text-sm flex items-center gap-2 rtl:ml-2">
                <Bell className="animate-bounce h-4 w-4" />
                <span>في انتظار مقعد متاح... {formatElapsedTime()}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={cancelWaiting}
              >
                إلغاء الانتظار
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-black font-medium"
              disabled={joinMutation.isPending}
              onClick={handleWaitForSeat}
            >
              {joinMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <>انتظر مقعداً متاحاً</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}