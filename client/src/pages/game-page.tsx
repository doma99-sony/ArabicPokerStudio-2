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
import { GameActions } from "@/components/game/game-actions";
import { CommunityCards } from "@/components/game/community-cards";
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
  
  // تحويل معرّف الطاولة إلى رقم
  const tableId = params && params.tableId ? parseInt(params.tableId) : null;
  
  // في حالة لم يتم العثور على معرّف صالح، حاول استعادته من التخزين المحلي
  useEffect(() => {
    if (!tableId) {
      const savedTableId = localStorage.getItem('lastTableId');
      if (savedTableId) {
        console.log("تم استعادة معرّف الطاولة من التخزين المحلي:", savedTableId);
        // استخدم إعادة توجيه مباشرة بدلاً من navigate لتجنب مشاكل التوجيه
        window.location.href = `/game/${savedTableId}`;
      }
    } else {
      // تأكد من أن المعرف مخزن في التخزين المحلي حتى في حالة التحميل المباشر للصفحة
      localStorage.setItem('lastTableId', tableId.toString());
      console.log("تم تحديث/تخزين معرف الطاولة:", tableId);
    }
  }, [tableId, navigate]);
  
  // Fetch game state
  const { data: gameState, isLoading, error } = useQuery<GameState>({
    queryKey: [`/api/game/${tableId}`],
    refetchInterval: 2000, // Poll every 2 seconds for updates
    enabled: !!user && !!tableId && tableId > 0, // تمكين الاستعلام فقط عند وجود مستخدم مسجل الدخول ومعرف طاولة صالح
    retry: false,
    queryFn: async () => {
      try {
        if (!tableId) {
          // في حالة عدم وجود معرّف طاولة، ارجع خطأ
          throw new Error("لم يتم تحديد معرّف الطاولة");
        }
        
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
      console.error("خطأ في جلب بيانات اللعبة:", error);
      
      // في حالة فشل جلب البيانات، حاول إعادة الانضمام إلى الطاولة أولاً
      if (tableId) {
        console.log("محاولة إعادة الانضمام إلى الطاولة:", tableId);
        
        // محاولة الانضمام إلى الطاولة مرة أخرى
        fetch(`/api/game/${tableId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
          console.log("نتيجة محاولة إعادة الانضمام:", data);
          
          if (data.success) {
            // إعادة تحميل الصفحة بعد الانضمام
            window.location.reload();
          } else {
            // فشل في إعادة الانضمام، توجيه المستخدم إلى الصفحة الرئيسية
            toast({
              title: "خطأ",
              description: "تعذر الانضمام إلى الطاولة. يرجى المحاولة مرة أخرى.",
              variant: "destructive",
            });
            navigate("/");
          }
        })
        .catch(err => {
          console.error("خطأ في إعادة الانضمام:", err);
          toast({
            title: "خطأ",
            description: "تعذر الانضمام إلى الطاولة. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
          navigate("/");
        });
      } else {
        toast({
          title: "خطأ",
          description: "تعذر الانضمام إلى الطاولة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [error, toast, navigate, tableId]);
  
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

  // تعريف المستخدم الحالي في اللعبة
  const currentPlayer = gameState?.players?.find(player => player.id === user?.id);
  
  // حالة لتتبع تحميل الإجراء
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // التحقق مما إذا كان دور اللاعب الحالي للعب
  const isCurrentTurn = currentPlayer?.isTurn || false;
  
  // وظيفة لتنفيذ إجراء في اللعبة (مثل fold, call, raise, etc)
  const performGameAction = async (action: 'fold' | 'check' | 'call' | 'raise' | 'allIn', amount?: number) => {
    if (!tableId) {
      toast({
        title: "خطأ",
        description: "معرف الطاولة غير متوفر",
        variant: "destructive"
      });
      return;
    }
    
    setIsActionLoading(true);
    
    try {
      const response = await fetch(`/api/game/${tableId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          amount: amount || 0
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        toast({
          title: "خطأ في تنفيذ الإجراء",
          description: data.message || "حدث خطأ غير معروف",
          variant: "destructive"
        });
        setIsActionLoading(false);
        return;
      }
      
      // تحديث واجهة المستخدم بناءً على الإجراء
      let actionMessage = "";
      if (action === 'fold') actionMessage = "تم الانسحاب من الجولة";
      else if (action === 'check') actionMessage = "تم المتابعة بدون مراهنة";
      else if (action === 'call') actionMessage = `تم المتابعة بمبلغ ${gameState.currentBet}`;
      else if (action === 'raise') actionMessage = `تم رفع المراهنة إلى ${amount}`;
      else if (action === 'allIn') actionMessage = `تم المراهنة بكل الرقاقات (${amount})`;
      
      toast({
        title: "تم تنفيذ الإجراء",
        description: actionMessage,
        variant: "default"
      });
      
    } catch (error) {
      console.error("خطأ في تنفيذ الإجراء:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة تنفيذ الإجراء",
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deepBlack text-white py-2 flex flex-col">
      <div className="container mx-auto px-4 h-full flex flex-col">
        {/* Game controls (header) */}
        <GameControls gameState={gameState} />
        
        {/* عرض الأوراق المجتمعية في الوسط */}
        {!isSpectator && gameState.gameStatus !== "waiting" && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
            <CommunityCards cards={gameState.communityCards || []} size="md" />
          </div>
        )}
        
        {/* Poker table (middle) */}
        <PokerTable gameState={gameState} />
        
        {/* أزرار إجراءات اللعب - تظهر فقط في وضع اللعب النشط */}
        {!isSpectator && (
          <GameActions 
            gameState={gameState}
            onAction={performGameAction}
            isLoading={isActionLoading}
            isCurrentTurn={isCurrentTurn}
          />
        )}
        
        {/* شريط المشاهدة - يظهر فقط في وضع المشاهدة */}
        {isSpectator && tableId && (
          <SpectatorBar 
            tableId={tableId as number}
            currentPlayers={gameState.players.length}
            maxPlayers={maxPlayers}
            onJoinSuccess={handleJoinFromSpectator}
          />
        )}
      </div>
    </div>
  );
}
