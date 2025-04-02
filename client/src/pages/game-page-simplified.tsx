import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Users, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PlayerCards, CommunityCards } from "@/components/game/playing-card";

export default function GamePageSimplified({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState<number>(0);
  
  // استخراج معرف الطاولة من الباراميترات
  const tableId = params && params.tableId ? parseInt(params.tableId) : null;

  // دالة لجلب بيانات اللعبة
  const fetchGameState = async (id: number) => {
    try {
      console.log("محاولة جلب بيانات اللعبة للطاولة:", id);
      
      // محاولة الانضمام إلى الطاولة أولاً
      const joinResponse = await fetch(`/api/game/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });
      
      if (!joinResponse.ok) {
        const errorText = await joinResponse.text();
        throw new Error(errorText || "فشل في الانضمام إلى الطاولة");
      }
      
      const joinData = await joinResponse.json();
      console.log("نتيجة الانضمام:", joinData);
      
      if (!joinData.success) {
        throw new Error(joinData.message || "فشل في الانضمام إلى الطاولة");
      }
      
      // استخدام بيانات اللعبة المُرجعة من طلب الانضمام
      if (joinData.gameState) {
        setGameState(joinData.gameState);
        setIsLoading(false);
        return;
      }
      
      // إذا لم تكن بيانات اللعبة متوفرة في طلب الانضمام، قم بجلبها
      const stateResponse = await fetch(`/api/game/${id}`, {
        credentials: 'include'
      });
      
      if (!stateResponse.ok) {
        throw new Error("فشل في جلب بيانات اللعبة");
      }
      
      const gameData = await stateResponse.json();
      console.log("بيانات اللعبة:", gameData);
      
      setGameState(gameData);
      setIsLoading(false);
    } catch (err: any) {
      console.error("خطأ في جلب بيانات اللعبة:", err);
      setError(err.message || "حدث خطأ أثناء محاولة الانضمام إلى الطاولة");
      setIsLoading(false);
    }
  };

  // التحقق من وجود معرف الطاولة وبدء اللعبة
  useEffect(() => {
    // دالة لجلب بيانات اللعبة داخل الـ useEffect لتجنب مشاكل التبعيات
    const initializeGame = async () => {
      try {
        // إذا كان لدينا معرّف طاولة صالح، نستخدمه مباشرة
        if (tableId) {
          console.log("تم العثور على معرّف طاولة في عنوان URL:", tableId);
          await fetchGameState(tableId);
        } else {
          // إذا لم يكن هناك معرّف طاولة في عنوان URL، نحاول استعادته من التخزين المحلي
          const savedTableId = localStorage.getItem('lastTableId');
          if (savedTableId) {
            console.log("تم استعادة معرف الطاولة من التخزين المحلي:", savedTableId);
            const tableIdAsNumber = parseInt(savedTableId);
            await fetchGameState(tableIdAsNumber);
          } else {
            setError("معرف الطاولة غير موجود. يرجى العودة واختيار طاولة.");
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("خطأ في تهيئة اللعبة:", error);
        setError("حدث خطأ أثناء محاولة جلب بيانات اللعبة. يرجى المحاولة مرة أخرى.");
        setIsLoading(false);
      }
    };
    
    // بدء تهيئة اللعبة
    initializeGame();
    
    // لا حاجة لإضافة fetchGameState إلى مصفوفة التبعيات لأننا ننشئ دالة جديدة في كل مرة
  }, [tableId]);
  
  // دالة للعودة إلى قائمة الطاولات
  const handleBackToLobby = () => {
    navigate("/");
  };
  
  // دالة لتنفيذ فعل في اللعبة (انسحاب، متابعة، رفع)
  const performGameAction = async (action: string, amount?: number) => {
    if (!tableId) return;
    
    try {
      setIsActionLoading(true);
      
      const response = await fetch(`/api/game/${tableId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, amount }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('فشل في تنفيذ الإجراء');
      }
      
      const data = await response.json();
      console.log("نتيجة الإجراء:", data);
      
      if (!data.success) {
        toast({
          title: "خطأ",
          description: data.message || "فشل في تنفيذ الإجراء",
          variant: "destructive"
        });
        setIsActionLoading(false);
        return;
      }
      
      // تحديث بيانات اللعبة إذا تم إرجاعها
      if (data.gameState) {
        setGameState(data.gameState);
      }
      
      toast({
        title: "تم تنفيذ الإجراء بنجاح",
        description: action === 'fold' ? 'تم الانسحاب' : 
                      action === 'check' || action === 'call' ? 'تم المتابعة' : 
                      'تم الرفع',
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
  
  // دوال لأزرار التحكم
  const handleFold = () => performGameAction('fold');
  const handleCheck = () => performGameAction('check');
  const handleCall = () => performGameAction('call');
  const handleRaise = () => {
    const defaultRaiseAmount = gameState.bigBlind * 2;
    performGameAction('raise', defaultRaiseAmount);
  };
  
  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-4" />
          <h2 className="text-[#D4AF37] text-xl">جاري الانضمام إلى الطاولة...</h2>
          <p className="text-[#D4AF37] mt-2">رقم الطاولة: {tableId}</p>
        </div>
      </div>
    );
  }
  
  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center bg-black/80 p-8 rounded-xl shadow-2xl max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-4">حدث خطأ</h2>
          <p className="text-lg mb-6 text-white/80">{error}</p>
          <Button 
            onClick={handleBackToLobby}
            className="bg-[#D4AF37] hover:bg-[#C09B26] text-black font-bold"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            العودة إلى قائمة الطاولات
          </Button>
        </div>
      </div>
    );
  }
  
  // عرض بيانات اللعبة
  if (gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A2A1E] to-black text-white py-4">
        <div className="container mx-auto px-4 h-full">
          {/* شريط العنوان */}
          <div className="flex justify-between items-center mb-2 bg-black/50 p-4 rounded-lg">
            <Button 
              onClick={handleBackToLobby}
              variant="outline" 
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              العودة
            </Button>
            <h1 className="text-xl font-bold text-[#D4AF37]">
              {gameState.tableName || "طاولة البوكر"}
            </h1>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-[#D4AF37] ml-2" />
              <span className="text-white">
                {gameState.players?.length || 0} / {gameState.maxPlayers || 9}
              </span>
            </div>
          </div>
          
          {/* طاولة البوكر */}
          <div className="relative mb-4">
            <div className="bg-[#0A3A2A] rounded-full w-full h-[450px] border-8 border-[#8B4513] shadow-2xl flex items-center justify-center overflow-hidden">
              {/* لوحة الطاولة */}
              <div className="absolute inset-0 m-10 rounded-full bg-[#1B4D3E] border-4 border-[#346F58] flex items-center justify-center">
                {/* طقم الكروت المشتركة (الفلوب والتيرن والريفر) باستخدام مكون CommunityCards */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {gameState?.communityCards && (
                    <CommunityCards 
                      cards={gameState.communityCards}
                      size="md"
                      className="gap-1"
                    />
                  )}
                </div>
                
                {/* المبلغ في القدر */}
                <div className="absolute top-[30%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 px-4 py-1 rounded-full border border-[#D4AF37]">
                  <p className="text-[#D4AF37] font-bold">القدر: {gameState?.pot?.toLocaleString() || 0} رقاقة</p>
                </div>
                
                {/* الديلر */}
                <div className="absolute top-[27%] right-[30%] transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-black font-bold border-2 border-black">
                  D
                </div>
              </div>
              
              {/* مواضع اللاعبين */}
              {gameState?.players && gameState.players.map((player: any, index: number) => {
                // تحديد موضع اللاعب على الطاولة
                const positions: Record<string, { top: string; left: string }> = {
                  bottom: { top: '85%', left: '50%' },
                  bottomRight: { top: '75%', left: '75%' },
                  topRight: { top: '30%', left: '80%' },
                  top: { top: '15%', left: '50%' },
                  topLeft: { top: '30%', left: '20%' },
                  bottomLeft: { top: '75%', left: '25%' },
                  right: { top: '50%', left: '85%' },
                  left: { top: '50%', left: '15%' }
                };
                
                const position = positions[player.position] || positions.bottom;
                
                return (
                  <div
                    key={index}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center`}
                    style={{
                      top: position.top,
                      left: position.left,
                      zIndex: player.isCurrentPlayer ? 20 : 10
                    }}
                  >
                    {/* كروت اللاعب باستخدام مكون PlayerCards */}
                    {player.id === user?.id && player.cards && player.cards.length > 0 && (
                      <div className="mb-2">
                        <PlayerCards 
                          cards={player.cards}
                          size="sm"
                          variant="gold"
                          isHidden={false} // دائما عرض البطاقات للاعب الحالي
                          position={player.position}
                          rotations={[-5, 5]} // زوايا دوران البطاقات
                        />
                      </div>
                    )}
                    
                    {/* كروت اللاعبين الآخرين (مخفية) باستخدام مكون PlayerCards */}
                    {player.id !== user?.id && player.cards && player.cards.length > 0 && !player.folded && (
                      <div className="mb-2">
                        <PlayerCards 
                          cards={player.cards}
                          size="sm"
                          variant="gold"
                          isHidden={true} // دائما إخفاء البطاقات للاعبين الآخرين
                          position={player.position}
                          rotations={[-5, 5]} // زوايا دوران البطاقات
                        />
                      </div>
                    )}
                    
                    {/* معلومات اللاعب */}
                    <div 
                      className={`
                        relative flex items-center gap-2 px-3 py-2 rounded-full shadow-lg
                        ${player.isCurrentPlayer ? 'bg-[#D4AF37] text-black' : 'bg-black/70 text-white'}
                        ${player.isActive ? 'ring-2 ring-[#D4AF37]' : ''}
                        ${player.id === user?.id ? 'border-2 border-white' : ''}
                      `}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">
                          {player.username}
                          {player.id === user?.id && <span className="mr-1"> (أنت)</span>}
                        </p>
                        <p>{player.chips?.toLocaleString()} رقاقة</p>
                      </div>
                      
                      {/* رهان اللاعب الحالي */}
                      {player.betAmount > 0 && (
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded-lg text-xs font-bold">
                          {player.betAmount?.toLocaleString()}
                        </div>
                      )}
                      
                      {/* حالة اللاعب */}
                      {player.folded && (
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          انسحب
                        </div>
                      )}
                      
                      {player.isAllIn && (
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          كل الرقاقات
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* معلومات حالة اللعبة */}
          <div className="bg-[#0A3A2A]/80 rounded-xl p-4 mb-4 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="bg-black/60 px-3 py-1 rounded-lg">
                <p className="text-[#D4AF37] font-bold text-sm">المراهنات الإجبارية: <span className="text-white">{gameState?.smallBlind || 0} / {gameState?.bigBlind || 0}</span></p>
              </div>
              
              <div className="bg-black/60 px-3 py-1 rounded-lg">
                <p className="text-[#D4AF37] font-bold text-sm">حالة اللعبة: 
                  <span className="text-white mr-1">
                    {gameState?.gameStatus === "waiting" ? "في انتظار اللاعبين" : 
                     gameState?.gameStatus === "preflop" ? "ما قبل الفلوب" : 
                     gameState?.gameStatus === "flop" ? "الفلوب" : 
                     gameState?.gameStatus === "turn" ? "التيرن" : 
                     gameState?.gameStatus === "river" ? "الريفر" : 
                     gameState?.gameStatus === "showdown" ? "كشف الأوراق" : 
                     "غير معروفة"}
                  </span>
                </p>
              </div>
              
              <div className="bg-black/60 px-3 py-1 rounded-lg">
                <p className="text-[#D4AF37] font-bold text-sm">رقاقاتك: <span className="text-white">{gameState?.userChips?.toLocaleString() || 0}</span></p>
              </div>
            </div>
          </div>
          
          {/* أزرار التحكم باللعبة */}
          <div className="bg-black/60 rounded-xl p-4 shadow-lg flex justify-center gap-4">
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleFold}
              disabled={isActionLoading || gameState?.gameStatus === 'waiting' || gameState?.gameStatus === 'showdown'}
            >
              {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
              انسحاب
            </Button>
            
            <Button 
              variant="default" 
              className="bg-[#D4AF37] hover:bg-[#C09B26] text-black"
              onClick={gameState?.currentBet > 0 ? handleCall : handleCheck}
              disabled={isActionLoading || gameState?.gameStatus === 'waiting' || gameState?.gameStatus === 'showdown'}
            >
              {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {gameState?.currentBet > 0 ? `متابعة (${gameState?.currentBet?.toLocaleString() || 0})` : 'تحقق'}
            </Button>
            
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRaise}
              disabled={isActionLoading || gameState?.gameStatus === 'waiting' || gameState?.gameStatus === 'showdown'}
            >
              {isActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              رفع (+{(gameState?.bigBlind || 0) * 2 || 200000})
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // إذا وصلنا إلى هنا، فهناك مشكلة في عرض البيانات
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h2 className="text-[#D4AF37] text-xl mb-4">حدث خطأ غير متوقع</h2>
        <Button 
          onClick={handleBackToLobby}
          className="bg-[#D4AF37] hover:bg-[#C09B26] text-black font-bold"
        >
          العودة إلى قائمة الطاولات
        </Button>
      </div>
    </div>
  );
}