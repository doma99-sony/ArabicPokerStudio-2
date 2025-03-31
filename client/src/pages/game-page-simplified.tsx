import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function GamePageSimplified({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [gameState, setGameState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
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
          <div className="flex justify-between items-center mb-6 bg-black/50 p-4 rounded-lg">
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
          
          {/* بيانات الطاولة */}
          <div className="bg-[#0A3A2A]/80 rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">
              معلومات الطاولة
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-[#D4AF37] font-bold mb-1">المراهنات الإجبارية:</p>
                <p className="text-white">{gameState.smallBlind} / {gameState.bigBlind}</p>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-[#D4AF37] font-bold mb-1">المبلغ في القدر:</p>
                <p className="text-white">{gameState.pot?.toLocaleString() || 0} رقاقة</p>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-[#D4AF37] font-bold mb-1">حالة اللعبة:</p>
                <p className="text-white">
                  {gameState.gameStatus === "waiting" ? "في انتظار اللاعبين" : 
                   gameState.gameStatus === "preflop" ? "ما قبل الفلوب" : 
                   gameState.gameStatus === "flop" ? "الفلوب" : 
                   gameState.gameStatus === "turn" ? "التيرن" : 
                   gameState.gameStatus === "river" ? "الريفر" : 
                   gameState.gameStatus === "showdown" ? "كشف الأوراق" : 
                   "غير معروفة"}
                </p>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg">
                <p className="text-[#D4AF37] font-bold mb-1">رقاقاتك:</p>
                <p className="text-white">{gameState.userChips?.toLocaleString() || 0} رقاقة</p>
              </div>
            </div>
          </div>
          
          {/* قائمة اللاعبين */}
          <div className="bg-[#0A3A2A]/80 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">
              اللاعبون في الطاولة
            </h2>
            
            <div className="space-y-4">
              {gameState.players && gameState.players.length > 0 ? (
                gameState.players.map((player: any, index: number) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-3 rounded-lg 
                      ${player.isActive ? 'bg-[#D4AF37]/20' : 'bg-black/40'} 
                      ${player.id === user?.id ? 'border border-[#D4AF37]' : ''}
                      ${player.isCurrentPlayer ? 'ring-2 ring-[#D4AF37]' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white">👤</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {player.username}
                          {player.id === user?.id && <span className="text-[#D4AF37] ml-2">(أنت)</span>}
                        </p>
                        <p className="text-sm text-gray-300">الموضع: {player.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#D4AF37]">{player.chips?.toLocaleString()} رقاقة</p>
                      {player.betAmount > 0 && (
                        <p className="text-sm text-white">{player.betAmount?.toLocaleString()} رهان</p>
                      )}
                      {player.folded && <p className="text-sm text-red-400">انسحب</p>}
                      {player.isAllIn && <p className="text-sm text-green-400">كل الرقاقات</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">لا يوجد لاعبون في الطاولة حالياً</p>
              )}
            </div>
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