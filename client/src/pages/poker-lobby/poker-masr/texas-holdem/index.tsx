import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Loader2 } from 'lucide-react';
import PokerTable from '../components/PokerTable';
import PokerActions from '../components/PokerActions';
import PokerPlayer from '../components/PokerPlayer';
import { GamePhase, Card as GameCard, PlayerAction } from '../logic/poker-engine';
import { usePokerStore } from '../store/poker-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getMockGameState, simulatePlayerAction } from '../logic/mock-data';

// استيراد أنماط CSS الخاصة ببوكر مصر
import '../styles/poker-styles.css';

// تعريف نوع بطاقة اللاعب (مختلف عن بطاقة اللعبة)
interface PlayerCard {
  suit: string;
  rank: string;
  hidden: boolean;
}

// تعريف adapter function لتحويل بطاقات اللعبة إلى بطاقات اللاعب
const adaptPlayerCards = (cards: GameCard[]): PlayerCard[] => {
  return cards.map(card => ({
    suit: card.suit,
    rank: card.rank,
    hidden: card.hidden === undefined ? true : card.hidden
  }));
};

/**
 * صفحة بوكر تكساس هولديم
 */
export default function TexasHoldemPoker() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // استخدام متجر البوكر
  const {
    gameState,
    localPlayerId,
    errorMessage,
    winners,
    resetGame,
    setErrorMessage,
    clearWinners,
    performAction
  } = usePokerStore();
  
  // حالة تحكم الاتصال
  const [connecting, setConnecting] = useState(false);
  const [joiningTable, setJoiningTable] = useState(false);
  
  // إعداد اتصال WebSocket عند تحميل الصفحة
  useEffect(() => {
    setConnecting(true);
    console.log('جاري الاتصال بخادم البوكر...');
    
    const connectToServer = async () => {
      try {
        // التحقق من وجود بيانات المستخدم
        if (!user?.id || !user?.username) {
          setErrorMessage('لا يمكن تحميل بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
          setConnecting(false);
          return;
        }
        
        // محاولة الاتصال بخادم WebSocket
        const { initializeSocket } = usePokerStore.getState();
        const connected = await initializeSocket(user.id, user.username);
        
        if (connected) {
          // تعيين معرف اللاعب المحلي بعد الاتصال
          usePokerStore.setState({
            localPlayerId: user.id
          });
          
          setConnecting(false);
          toast({
            title: 'تم الاتصال بنجاح',
            description: 'أنت الآن متصل بخادم بوكر تكساس هولديم!'
          });
        } else {
          setErrorMessage('فشل الاتصال بخادم البوكر. يرجى المحاولة مرة أخرى.');
          setConnecting(false);
        }
      } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        setErrorMessage('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
        setConnecting(false);
      }
    };
    
    connectToServer();
    
    // تنظيف عند مغادرة الصفحة
    return () => {
      resetGame();
      const { closeSocket } = usePokerStore.getState();
      closeSocket();
    };
  }, [user?.id, user?.username, resetGame, setErrorMessage]);
  
  // تنفيذ إجراء اللعب
  const handlePlayerAction = (action: PlayerAction, amount?: number): void => {
    if (!gameState || !user?.id) return;
    
    // في الإصدار الحقيقي، نرسل الإجراء عبر WebSocket ونتلقى التحديثات من الخادم
    console.log(`إرسال إجراء ${action} ${amount ? `بمبلغ ${amount}` : ''} للخادم`);
    
    // إظهار رسالة نجاح
    toast({
      title: 'تم إرسال الإجراء',
      description: `قمت بـ ${getActionText(action)} ${amount ? `بمبلغ ${amount}` : ''}`,
    });
  };
  
  // الحصول على نص الإجراء بالعربية
  const getActionText = (action: PlayerAction): string => {
    switch (action) {
      case 'fold': return 'طي الأوراق';
      case 'check': return 'التمرير';
      case 'call': return 'المجاراة';
      case 'raise': return 'رفع الرهان';
      case 'all_in': return 'المراهنة بكل الرقائق';
      default: return action;
    }
  };
  
  // ربط معالج الإجراء بمكون أزرار البوكر
  useEffect(() => {
    // إنشاء وظيفة وسيطة متوافقة مع توقيع الدالة الأصلية
    const wrappedHandleAction = async (action: PlayerAction, amount?: number): Promise<boolean> => {
      handlePlayerAction(action, amount);
      // نفترض أن الإجراء سينجح دائماً
      return Promise.resolve(true);
    };
    
    // تجاوز أزرار الإجراء للاستخدام المباشر
    const originalPerformAction = performAction;
    usePokerStore.setState({
      performAction: wrappedHandleAction
    });
    
    return () => {
      // إعادة الإجراء الأصلي عند التنظيف
      usePokerStore.setState({
        performAction: originalPerformAction
      });
    };
  }, [performAction]);
  
  // الحصول على بيانات اللاعب الحالي
  const localPlayer = gameState?.players.find(p => p.id === localPlayerId);
  
  // إظهار شاشة التحميل أثناء الاتصال أو الانضمام
  if (connecting || joiningTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
        <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-4" />
        <h2 className="text-2xl text-white mb-2">
          {connecting ? 'جاري تحميل بيانات اللعبة...' : 'جاري الانضمام للطاولة...'}
        </h2>
        <p className="text-white/70">يرجى الانتظار قليلاً</p>
      </div>
    );
  }
  
  // عرض رسالة الخطأ إذا كان هناك خطأ
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-2xl text-white mb-4">حدث خطأ</h2>
          <p className="text-white/80 mb-6">{errorMessage}</p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="destructive" 
              onClick={() => {
                setErrorMessage(null);
                navigate('/poker-lobby/poker-masr');
              }}
            >
              العودة للقائمة
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setErrorMessage(null);
                window.location.reload(); // إعادة تحميل الصفحة
              }}
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // عرض محتوى اللعبة الرئيسي
  return (
    <div className="poker-game-container min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
      {/* الهيدر */}
      <div className="poker-header bg-black/80 p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
        <button 
          onClick={() => navigate('/poker-lobby/poker-masr')}
          className="bg-black/60 hover:bg-black/80 p-2 rounded-full text-white/80 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        
        <h1 className="text-2xl text-white font-bold">بوكر تكساس هولديم</h1>
        
        <div className="chip-count flex items-center">
          <div className="chip-icon w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center mr-2 text-black font-bold">$</div>
          <span className="text-white font-bold">{localPlayer?.chips.toLocaleString() || '0'}</span>
        </div>
      </div>
      
      {/* عرض الفائزين */}
      {winners && winners.length > 0 && (
        <div className="winners-notification fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-gradient-to-r from-amber-700/90 via-yellow-600/90 to-amber-700/90 p-3 rounded-lg shadow-xl animate-bounce-once">
            <div className="text-white text-center">
              <h3 className="text-xl font-bold mb-1">انتهت الجولة!</h3>
              <p>{winners.map((winner, idx) => {
                const player = gameState?.players.find(p => p.id === winner.playerId);
                return player ? 
                  `${player.username} فاز بـ ${winner.winningAmount.toLocaleString()} (${winner.handDescription})` 
                  : '';
              }).join(' | ')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => clearWinners()} 
                className="mt-2 text-xs bg-black/20 hover:bg-black/40 border-white/30"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* طاولة اللعب */}
      <div className="poker-game-area relative min-h-[calc(100vh-180px)] flex items-center justify-center p-4">
        <PokerTable />
        
        {/* اللاعبين - استخدام بيانات من المتجر */}
        {gameState && gameState.players.map(player => (
          <PokerPlayer 
            key={player.id} 
            id={player.id}
            username={player.username}
            chips={player.chips}
            isActive={player.isActive}
            isCurrentTurn={player.isCurrentTurn}
            isFolded={player.folded}
            isAllIn={player.isAllIn}
            currentBet={player.betAmount}
            position={player.position}
            cards={adaptPlayerCards(player.cards)}
            showCards={player.id === localPlayerId || (gameState.currentRound.gamePhase === GamePhase.SHOWDOWN && !player.folded)}
          />
        ))}
      </div>
      
      {/* أزرار الإجراءات - تظهر فقط عندما يكون دور اللاعب المحلي */}
      {localPlayer && (
        <div className="poker-actions fixed bottom-0 left-0 right-0 bg-black/80 border-t border-[#D4AF37]/30">
          <PokerActions
            isCurrentTurn={localPlayer.isCurrentTurn}
            currentBet={gameState?.currentRound.currentBet || 0}
            chipCount={localPlayer.chips}
            lastBet={gameState?.currentRound.currentBet || 0}
            minRaise={gameState?.currentRound.minRaise || 10}
          />
        </div>
      )}
    </div>
  );
}