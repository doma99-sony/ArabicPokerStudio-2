import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Loader2 } from 'lucide-react';
import PokerTable from '../components/PokerTable';
import PokerActions from '../components/PokerActions';
import PokerPlayer from '../components/PokerPlayer';
import { GamePhase, Card as GameCard } from '../logic/poker-engine';
import { usePokerStore } from '../store/poker-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

// استيراد أنماط CSS الخاصة ببوكر مصر
import '../styles/poker-styles.css';

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
    socketManager,
    isConnected,
    isJoining,
    errorMessage,
    winners,
    initializeSocket,
    joinTable,
    getLocalPlayer,
    getActivePlayers,
    resetGame,
    setErrorMessage,
    clearWinners
  } = usePokerStore();
  
  // حالة تحكم الاتصال
  const [connecting, setConnecting] = useState(false);
  const [joiningTable, setJoiningTable] = useState(false);
  
  // تهيئة اتصال WebSocket عند تحميل الصفحة
  useEffect(() => {
    // إذا لم يكن هناك اتصال بالفعل، قم بالاتصال
    if (!isConnected && !connecting && user) {
      const connectToSocket = async () => {
        try {
          setConnecting(true);
          const connected = await initializeSocket(user.id, user.username);
          
          if (connected) {
            console.log('تم الاتصال بالخادم بنجاح');
            // محاولة الانضمام للطاولة بعد الاتصال
            setJoiningTable(true);
            const joined = await joinTable(1, 5000); // معرف الطاولة وعدد الرقائق
            
            if (joined) {
              console.log('تم الانضمام للطاولة بنجاح');
              toast({
                title: 'تم الانضمام للطاولة',
                description: 'أنت الآن جزء من لعبة تكساس هولديم!'
              });
            } else {
              console.error('فشل الانضمام للطاولة');
              toast({
                title: 'فشل الانضمام',
                description: 'لم نتمكن من ضمك للطاولة، يرجى المحاولة مرة أخرى',
                variant: 'destructive'
              });
            }
            setJoiningTable(false);
          } else {
            console.error('فشل الاتصال بالخادم');
            toast({
              title: 'فشل الاتصال',
              description: 'لم نتمكن من الاتصال بخادم اللعبة، يرجى المحاولة مرة أخرى',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('خطأ أثناء الاتصال:', error);
          toast({
            title: 'خطأ',
            description: 'حدث خطأ غير متوقع أثناء الاتصال',
            variant: 'destructive'
          });
        }
        setConnecting(false);
      };
      
      connectToSocket();
    }
    
    // تنظيف عند مغادرة الصفحة
    return () => {
      if (isConnected && socketManager) {
        resetGame();
      }
    };
  }, [user, isConnected, connecting]);
  
  // الحصول على بيانات اللاعب الحالي
  const localPlayer = getLocalPlayer();
  
  // إظهار شاشة التحميل أثناء الاتصال أو الانضمام
  if (connecting || joiningTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
        <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-4" />
        <h2 className="text-2xl text-white mb-2">
          {connecting ? 'جاري الاتصال بخادم اللعبة...' : 'جاري الانضمام للطاولة...'}
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
                resetGame();
                setConnecting(true);
                initializeSocket(user?.id || 0, user?.username || 'ضيف');
                setConnecting(false);
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
        
        {/* اللاعبين - استخدام بيانات حقيقية من المتجر */}
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
      
      {/* أزرار الإجراءات */}
      <div className="poker-actions fixed bottom-0 left-0 right-0 bg-black/80">
        <PokerActions className="p-2" />
      </div>
    </div>
  );
}