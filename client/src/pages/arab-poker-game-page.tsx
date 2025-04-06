import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Users, ArrowLeft, X, Volume2, VolumeX } from "lucide-react";
import { ArabPokerTable } from "@/components/game/arab-poker-table";
import { useSoundSystem } from "@/hooks/use-sound-system";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import type { GameState } from "@/types";

export default function ArabPokerGamePage({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { playSound, toggleMute, isMuted } = useSoundSystem();
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [waitingTimer, setWaitingTimer] = useState<number | null>(null);
  const [virtualPlayerRequested, setVirtualPlayerRequested] = useState(false);
  
  // استخراج معرف الطاولة من الباراميترات أو من التخزين المحلي إذا كان غير متوفر
  const [tableId, setTableId] = useState<number | null>(() => {
    // أولاً: محاولة استخدام معرف الطاولة من الباراميترات
    if (params && params.tableId && !isNaN(parseInt(params.tableId))) {
      return parseInt(params.tableId);
    }
    
    // ثانياً: محاولة استخدام معرف الطاولة المخزن في localStorage
    const storedId = localStorage.getItem('lastTableId');
    if (storedId && !isNaN(parseInt(storedId))) {
      return parseInt(storedId);
    }
    
    // إذا لم يتم العثور على أي معرف صالح
    return null;
  });
  
  // تسجيل معلومات debugging
  useEffect(() => {
    console.log("معلمات العنوان في صفحة ArabPokerGamePage:", params);
    console.log("معرف الطاولة المحلل:", tableId);
    console.log("معرف الطاولة المخزن في localStorage:", localStorage.getItem('lastTableId'));
    
    // تحديث الباراميترات في عنوان URL إذا كان معرف الطاولة موجوداً ولكن ليس في params
    if (tableId && (!params || !params.tableId)) {
      console.log("تحديث عنوان URL بمعرف الطاولة:", tableId);
      navigate(`/arab-poker/${tableId}`, { replace: true });
    }
  }, [params, tableId, navigate]);
  
  // استخدام WebSocket
  const ws = useWebSocket();
  
  // جلب حالة اللعبة من الخادم
  const fetchGameState = useCallback(async () => {
    if (!tableId || !user) return;
    
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/game/${tableId}/state`, {
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.status === 401) {
        navigate("/auth");
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "فشل في جلب حالة اللعبة");
      }
      
      const data = await res.json();
      
      // تحقق مما إذا كان المستخدم مشاهداً
      if (data.isSpectator) {
        setIsSpectator(true);
      }
      
      setGameState(data.gameState);
      setIsLoading(false);
    } catch (error) {
      console.error("خطأ في جلب حالة اللعبة:", error);
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء جلب حالة اللعبة");
      setIsLoading(false);
    }
  }, [tableId, user, navigate]);

  // طلب لاعب افتراضي من الخادم
  const requestVirtualPlayer = useCallback(async () => {
    if (!tableId || !user || virtualPlayerRequested) return;
    
    try {
      console.log("إرسال طلب لاعب افتراضي للخادم");
      setVirtualPlayerRequested(true);
      
      const res = await fetch(`/api/game/${tableId}/add-virtual-player`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          level: "pro", // مستوى اللاعب الافتراضي - محترف (بوت)
          chips: Math.min(5000, gameState?.userChips || 2000) // رقائق مناسبة لرقائق اللاعب
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "فشل في إضافة لاعب افتراضي");
      }
      
      // تشغيل صوت الانضمام
      playSound('player_join');
      
      toast({
        title: "تم إضافة لاعب افتراضي",
        description: "تم إضافة لاعب افتراضي محترف للعب معك",
        duration: 3000,
      });
      
      // تحديث حالة اللعبة
      await fetchGameState();
    } catch (error) {
      console.error("خطأ في طلب لاعب افتراضي:", error);
      setVirtualPlayerRequested(false); // إعادة تعيين الحالة للسماح بمحاولة أخرى
    }
  }, [tableId, user, virtualPlayerRequested, gameState, fetchGameState, playSound, toast]);

  // تنفيذ إجراء في اللعبة (طي، تمرير، مجاراة، زيادة، كل الرقائق)
  const performAction = useCallback(async (action: string, amount?: number) => {
    if (!tableId || !user || isActionLoading) return;
    
    setIsActionLoading(true);
    
    try {
      const payload: Record<string, any> = { action };
      if (amount !== undefined) {
        payload.amount = amount;
      }
      
      const res = await fetch(`/api/game/${tableId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "فشل في تنفيذ الإجراء");
      }
      
      // تحديث حالة اللعبة بعد تنفيذ الإجراء
      await fetchGameState();
    } catch (error) {
      console.error("خطأ في تنفيذ الإجراء:", error);
      toast({
        title: "خطأ في تنفيذ الإجراء",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء محاولة تنفيذ الإجراء",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  }, [tableId, user, isActionLoading, fetchGameState, toast]);
  
  // مغادرة الطاولة
  const leaveTable = useCallback(async () => {
    if (!tableId || !user) return;
    
    try {
      const res = await fetch(`/api/game/${tableId}/leave`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "فشل في مغادرة الطاولة");
      }
      
      // العودة إلى صفحة قائمة طاولات بوكر العرب
      navigate("/arab-poker");
    } catch (error) {
      console.error("خطأ في مغادرة الطاولة:", error);
      toast({
        title: "خطأ في مغادرة الطاولة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء محاولة مغادرة الطاولة",
        variant: "destructive",
      });
    }
  }, [tableId, user, navigate, toast]);

  // تأكد من وجود المستخدم ومعرف الطاولة
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // تحقق من صحة معرف الطاولة
    if (!tableId) {
      // إذا وصلنا هنا ولم يكن هناك معرف طاولة، فلنرجع إلى صفحة طاولات بوكر العرب
      console.error("معرف الطاولة مفقود بعد كل محاولات استخراجه - الرجوع إلى صفحة الطاولات");
      setError("معرف الطاولة مفقود. الرجاء اختيار طاولة من القائمة.");
      return;
    }
    
    // حفظ معرف الطاولة في التخزين المحلي للرجوع إليه لاحقاً
    localStorage.setItem('lastTableId', tableId.toString());
    console.log("تم حفظ معرف الطاولة في التخزين المحلي:", tableId);
    
    // إنشاء اتصال WebSocket جديد عند تحميل الصفحة إذا لم يكن موجوداً
    if (ws.status !== 'open') {
      console.log('إنشاء اتصال WebSocket في صفحة بوكر العرب');
      ws.reconnect();
    }
    
    // طلب حالة اللعبة الأولية
    fetchGameState();
    
    // تنظيف عند مغادرة الصفحة
    return () => {
      console.log('الاحتفاظ باتصال WebSocket عند مغادرة صفحة بوكر العرب');
    };
  }, [user, tableId, ws, fetchGameState, navigate]);
  
  // دالة لطلب لاعب افتراضي (مساعدة)
  const handleRequestVirtualPlayer = useCallback(() => {
    if (requestVirtualPlayer) {
      requestVirtualPlayer();
    }
  }, [requestVirtualPlayer]);

  // مراقبة عدد اللاعبين في الطاولة لجلب لاعب افتراضي عند الانتظار
  useEffect(() => {
    if (!gameState || !tableId || virtualPlayerRequested) return;
    
    const playerCount = gameState.players?.length || 0;
    
    // إذا كان هناك لاعب واحد فقط (أنا) ولم نطلب لاعبًا افتراضيًا بعد
    if (playerCount === 1 && !waitingTimer && !virtualPlayerRequested) {
      console.log("بدء مؤقت انتظار لاعب افتراضي");
      // بدء مؤقت لمدة دقيقة واحدة (60 ثانية)
      const timer = window.setTimeout(() => {
        console.log("انتهى وقت الانتظار - طلب لاعب افتراضي");
        // طلب لاعب افتراضي عندما ينتهي المؤقت
        handleRequestVirtualPlayer();
      }, 60000); // دقيقة واحدة
      setWaitingTimer(timer);
    } 
    // إذا انضم لاعبون آخرون، نلغي المؤقت
    else if (playerCount > 1 && waitingTimer) {
      console.log("انضم لاعبون آخرون - إلغاء طلب لاعب افتراضي");
      window.clearTimeout(waitingTimer);
      setWaitingTimer(null);
    }
    
    // تنظيف المؤقت عند إلغاء تحميل المكون
    return () => {
      if (waitingTimer) {
        window.clearTimeout(waitingTimer);
      }
    };
  }, [gameState, virtualPlayerRequested, waitingTimer, tableId, handleRequestVirtualPlayer]);
  
  // استماع لحدث تحديث حالة اللعبة من WebSocket
  useEffect(() => {
    if (ws.status === 'open') {
      ws.addMessageListener((message) => {
        try {
          const data = JSON.parse(message);
          
          // تحديث حالة اللعبة عند استلام حدث ذي صلة
          if (data.type === 'game_update' && data.tableId === tableId) {
            setGameState(data.gameState);
            
            // تشغيل أصوات مناسبة للأحداث
            if (data.event) {
              switch (data.event) {
                case 'new_round':
                  playSound('shuffle');
                  break;
                case 'player_fold':
                  playSound('fold');
                  break;
                case 'player_check':
                  playSound('check');
                  break;
                case 'player_call':
                  playSound('call');
                  break;
                case 'player_raise':
                  playSound('raise');
                  break;
                case 'player_all_in':
                  playSound('all_in');
                  break;
                case 'flop_dealt':
                case 'turn_dealt':
                case 'river_dealt':
                  playSound('card_flip');
                  break;
                case 'player_win':
                  playSound('win_hand');
                  break;
                case 'player_join':
                  playSound('player_join');
                  break;
              }
            }
          }
          
          // معالجة الأخطاء من الخادم
          if (data.type === 'error') {
            toast({
              title: "خطأ",
              description: data.message,
              variant: "destructive",
            });
          }
          
          // معالجة الانضمام كمشاهد
          if (data.type === 'spectator_joined' && data.userId === user?.id) {
            setIsSpectator(true);
          }
        } catch (err) {
          console.error("خطأ في معالجة رسالة WebSocket:", err);
        }
      });
    }
  }, [ws, tableId, playSound, user, toast]);
  
  // إذا كان هناك خطأ
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-[#0a0a21] p-4">
        <div className="bg-black/70 rounded-lg p-6 max-w-md text-center border border-[#D4AF37]/30">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#D4AF37] mb-2">حدث خطأ</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <Button onClick={() => navigate("/arab-poker")} className="bg-[#D4AF37] text-black hover:bg-[#E5C04B]">
            العودة إلى قائمة الطاولات
          </Button>
        </div>
      </div>
    );
  }
  
  // أثناء التحميل
  if (isLoading || !gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black to-[#0a0a21] p-4">
        <div className="bg-black/70 rounded-lg p-6 max-w-md text-center border border-[#D4AF37]/30">
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#D4AF37] mb-2">جاري تحميل بوكر العرب</h2>
          <p className="text-white/80">يرجى الانتظار بينما نقوم بتحضير طاولة اللعب لك...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0a21] p-4">
      {/* شريط العنوان */}
      <header className="bg-black/70 rounded-lg p-3 mb-6 border border-[#D4AF37]/30 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <Button
            variant="outline" 
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            العودة
          </Button>
          <h1 className="text-xl font-bold text-[#D4AF37] mr-4">
            {gameState.tableName || "بوكر العرب"}
          </h1>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center bg-black/40 px-3 py-1 rounded-full border border-[#D4AF37]/30 ml-4">
            <Users className="h-5 w-5 text-[#D4AF37] ml-2" />
            <span className="text-white font-arabic-numbers">
              {gameState.players?.length || 0} / {gameState.maxPlayers || 9}
            </span>
          </div>
          
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 border border-[#D4AF37]/30"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-[#D4AF37]" />
            ) : (
              <Volume2 className="h-5 w-5 text-[#D4AF37]" />
            )}
          </button>
        </div>
      </header>
      
      {/* طاولة اللعب */}
      <main className="max-w-5xl mx-auto">
        <ArabPokerTable 
          gameState={gameState as any}
          onAction={performAction}
          isSpectator={isSpectator}
        />
      </main>
      
      {/* نافذة تأكيد المغادرة */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-lg p-6 max-w-md w-full border border-[#D4AF37]/50 shadow-lg">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4 text-center">تأكيد المغادرة</h3>
            <p className="text-white/90 mb-6 text-center">
              هل أنت متأكد من أنك تريد مغادرة الطاولة؟ سيتم حفظ رقائقك الحالية.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={leaveTable} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                نعم، مغادرة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowExitConfirm(false)} 
                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              >
                لا، البقاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}