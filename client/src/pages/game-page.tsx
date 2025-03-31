import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GameState } from "@/types";
import { Loader2 } from "lucide-react";
import { PokerTable } from "@/components/game/poker-table";
import { GameControls } from "@/components/game/game-controls";
import { BetControls } from "@/components/game/bet-controls";
import { SpectatorBar } from "@/components/game/spectator-bar";
import { useToast } from "@/hooks/use-toast";

export default function GamePage({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSpectator, setIsSpectator] = useState(false);
  const [tableName, setTableName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(9);
  
  // التأكد من وجود معرف الطاولة - استخدام localStorage كاحتياطي
  useEffect(() => {
    // محاولة استعادة معرف الطاولة من localStorage إذا لم يكن متوفراً في params
    if (!params || !params.tableId) {
      const lastTableId = localStorage.getItem('lastTableId');
      
      if (lastTableId) {
        console.log("تم استعادة معرف الطاولة من التخزين المحلي:", lastTableId);
        // الانتقال مباشرة إلى الطاولة المخزنة
        navigate(`/game/${lastTableId}`);
        return;
      }
      
      console.error("معرّف الطاولة غير موجود:", params);
      toast({
        title: "خطأ",
        description: "معرف الطاولة غير موجود",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    // التحقق من أن معرف الطاولة قيمة رقمية صالحة
    const tableIdValue = parseInt(params.tableId);
    if (isNaN(tableIdValue) || tableIdValue <= 0) {
      console.error("معرّف الطاولة غير صالح:", params.tableId);
      toast({
        title: "خطأ",
        description: "معرف الطاولة غير صالح",
        variant: "destructive",
      });
      navigate("/");
    } else {
      // تخزين معرف الطاولة الصالح في localStorage
      localStorage.setItem('lastTableId', tableIdValue.toString());
    }
  }, [params, toast, navigate]);
  
  // فحص إذا كان هناك معرف طاولة
  const hasTableId = params?.tableId && !isNaN(parseInt(params.tableId));
  
  if (!hasTableId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-deepBlack">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gold font-cairo text-lg">جاري التحقق من معرف الطاولة...</p>
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
  
  // تحقق مما إذا كان اللاعب في وضع المشاهدة عند تحميل بيانات اللعبة
  useEffect(() => {
    if (gameState && user) {
      console.log("تحقق من حالة اللاعب في الطاولة:", gameState.players);
      
      // تحديث معلومات الطاولة
      setMaxPlayers(gameState.players.length);
      
      // نتحقق إذا كان اللاعب موجود في قائمة اللاعبين على الطاولة
      const playerOnTable = gameState.players.some(player => player.id === user.id);
      
      // تحديث حالة المشاهدة
      const shouldBeSpectator = !playerOnTable;
      console.log(`اللاعب ${user.id}:`, playerOnTable ? "موجود في الطاولة" : "في وضع المشاهدة");
      
      // تحديث حالة المشاهدة فقط إذا تغيرت
      if (isSpectator !== shouldBeSpectator) {
        console.log(`تحديث حالة المشاهدة: ${shouldBeSpectator}`);
        setIsSpectator(shouldBeSpectator);
        
        if (shouldBeSpectator) {
          // رسالة توضيحية عند دخول وضع المشاهدة
          toast({
            title: "وضع المشاهدة",
            description: "أنت الآن تشاهد هذه اللعبة. يمكنك الانتظار حتى يصبح هناك مقعد متاح للانضمام.",
          });
        } else {
          // رسالة توضيحية عند التحول من مشاهد إلى لاعب
          toast({
            title: "وضع اللعب النشط",
            description: "أنت الآن لاعب نشط في هذه الطاولة.",
          });
          console.log("أنت لاعب نشط في هذه الطاولة");
        }
      }
    }
  }, [gameState, user, toast, tableId, isSpectator]);
  
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

  // وظيفة للتعامل مع الانضمام من وضع المشاهدة
  const handleJoinFromSpectator = async () => {
    try {
      console.log("محاولة الانضمام كلاعب من وضع المشاهدة");
      
      // إرسال طلب انضمام مع تعيين asSpectator إلى false
      const response = await fetch(`/api/game/${tableId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ asSpectator: false })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("خطأ في الانضمام:", errorText);
        throw new Error(errorText || "حدث خطأ أثناء الانضمام كلاعب نشط");
      }
      
      const data = await response.json();
      console.log("استجابة الانضمام:", data);
      
      if (data.success) {
        // فحص ما إذا كان اللاعب لا يزال في وضع المشاهدة
        if (data.isSpectator) {
          toast({
            title: "لا يزال في وضع المشاهدة",
            description: data.message || "لا تزال الطاولة ممتلئة. يرجى الانتظار حتى يتوفر مقعد.",
            variant: "default",
          });
        } else {
          toast({
            title: "تم الانضمام بنجاح",
            description: data.message || "انضممت إلى الطاولة كلاعب نشط",
          });
          
          // تحديث حالة المشاهدة في الواجهة مباشرة
          setIsSpectator(false);
        }
        
        // تحديث واجهة المستخدم لتعكس حالة اللاعب الجديدة
      } else {
        toast({
          title: "تعذر الانضمام",
          description: data.message || "حدث خطأ أثناء محاولة الانضمام",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في الانضمام من وضع المشاهدة:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة الانضمام إلى الطاولة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-deepBlack text-white py-2 flex flex-col">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Game controls (header) */}
        <GameControls gameState={gameState} />
        
        {/* Poker table (middle) */}
        <PokerTable gameState={gameState} />
        
        {/* Betting controls (footer) - تظهر فقط إذا كان اللاعب نشطًا وليس في وضع المشاهدة */}
        {!isSpectator && <BetControls gameState={gameState} />}
        
        {/* شريط المشاهدة - يظهر فقط في وضع المشاهدة */}
        {isSpectator && (
          <SpectatorBar 
            tableId={tableId}
            currentPlayers={gameState.players.length}
            maxPlayers={maxPlayers}
            onJoinSuccess={handleJoinFromSpectator}
          />
        )}
      </div>
    </div>
  );
}
