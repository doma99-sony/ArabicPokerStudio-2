import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Crown, Trophy, Users, Coins, RefreshCw, ArrowRight, DollarSign, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Player {
  id: number;
  username: string;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number;
  status: 'playing' | 'cashed_out' | 'busted';
}

export default function LionGazelleGame() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  
  // Game state
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'ended'>('waiting');
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlayerBetting, setIsPlayerBetting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [bustedAt, setBustedAt] = useState<number | null>(null);
  const [lionPosition, setLionPosition] = useState(0); // 0-100 percentage for animation
  const [gazellePosition, setGazellePosition] = useState(20); // Always a bit ahead of lion
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set a random crash point between 1.1x and 10x
  // In real implementation, this would come from the server for fairness
  const generateCrashPoint = () => {
    return (1 + Math.random() * 9).toFixed(2);
  };
  
  const [crashPoint, setCrashPoint] = useState<number>(parseFloat(generateCrashPoint()));
  
  // Player Join/Place Bet
  const placeBet = () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول للمشاركة في اللعبة",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "مبلغ غير صالح",
        description: "يرجى إدخال مبلغ أكبر من صفر",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough chips
    if (user.chips < betAmount) {
      toast({
        title: "رصيد غير كافي",
        description: "لا تملك رقائق كافية للمراهنة بهذا المبلغ",
        variant: "destructive",
      });
      return;
    }
    
    setIsPlayerBetting(true);
    
    // Add player to the game
    const newPlayer: Player = {
      id: user.id,
      username: user.username,
      betAmount: betAmount,
      cashoutMultiplier: null,
      profit: 0,
      status: 'playing'
    };
    
    // In a real implementation, this would be a server call
    setPlayers(prevPlayers => {
      const existingPlayerIndex = prevPlayers.findIndex(p => p.id === user.id);
      if (existingPlayerIndex >= 0) {
        // Update existing player
        const updatedPlayers = [...prevPlayers];
        updatedPlayers[existingPlayerIndex] = newPlayer;
        return updatedPlayers;
      } else {
        // Add new player
        return [...prevPlayers, newPlayer];
      }
    });
    
    toast({
      title: "تمت المراهنة بنجاح",
      description: `لقد راهنت بـ ${betAmount} رقائق`,
      variant: "default",
    });
  };
  
  // Player Cash Out
  const cashOut = () => {
    if (!isPlayerBetting || gameState !== 'running') return;
    
    const profit = Math.floor(betAmount * currentMultiplier);
    
    // Update player status
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.id === user?.id) {
          return {
            ...player,
            cashoutMultiplier: currentMultiplier,
            profit: profit - player.betAmount,
            status: 'cashed_out'
          };
        }
        return player;
      });
    });
    
    setIsPlayerBetting(false);
    
    toast({
      title: "تم السحب بنجاح!",
      description: `ربحت ${profit} رقائق بمضاعف ${currentMultiplier.toFixed(2)}x`,
      variant: "default",
    });
    
    // In a real app, you would update the user's chips on the server
  };
  
  // Start Game Logic
  const startGame = () => {
    // Reset game state
    setGameState('running');
    setCurrentMultiplier(1);
    setBustedAt(null);
    setLionPosition(0);
    setGazellePosition(20);
    
    // Set new random crash point
    setCrashPoint(parseFloat(generateCrashPoint()));
    
    // In a real implementation, this would be synced with the server
    let startTime = Date.now();
    let elapsed = 0;
    const gameSpeed = 800; // ms for one cycle - adjust for faster/slower game
    
    const updateGame = () => {
      elapsed = Date.now() - startTime;
      
      // Calculate current multiplier based on elapsed time
      // Using a curve function that starts slow and accelerates
      const newMultiplier = Math.pow(1.0015, elapsed / 10);
      setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));
      
      // Lion catches up to gazelle over time
      const newLionPosition = Math.min(100, (elapsed / gameSpeed) * 25);
      setLionPosition(newLionPosition);
      
      // Gazelle stays ahead but gap closes
      setGazellePosition(Math.min(100, newLionPosition + 20 - (newLionPosition / 10)));
      
      // Check if game should end (lion caught gazelle)
      if (newMultiplier >= crashPoint) {
        // Game Over - Lion caught the gazelle
        setGameState('ended');
        setBustedAt(newMultiplier);
        
        // Mark all active players as busted
        setPlayers(prevPlayers => {
          return prevPlayers.map(player => {
            if (player.status === 'playing') {
              return {
                ...player,
                status: 'busted',
                profit: -player.betAmount
              };
            }
            return player;
          });
        });
        
        // Reset player betting status
        setIsPlayerBetting(false);
        
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = null;
        }
        
        // Schedule countdown for next round
        startCountdown();
        
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateGame);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateGame);
  };
  
  // Countdown Timer Logic
  const startCountdown = () => {
    let remainingSeconds = 10;
    setCountdown(remainingSeconds);
    
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
    }
    
    gameIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setCountdown(remainingSeconds);
      
      if (remainingSeconds <= 0) {
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = null;
        }
        
        // Clear players who didn't cash out and reset for next round
        setPlayers([]);
        startGame();
      }
    }, 1000);
  };
  
  // Game Initialization
  useEffect(() => {
    // Start initial countdown
    startCountdown();
    
    // Generate some fake players for demonstration
    const fakePlayers: Player[] = [
      { id: 1001, username: "لاعب_شجاع", betAmount: 200, cashoutMultiplier: null, profit: 0, status: 'playing' },
      { id: 1002, username: "صياد_الارباح", betAmount: 500, cashoutMultiplier: null, profit: 0, status: 'playing' },
      { id: 1003, username: "مغامر_الحظ", betAmount: 100, cashoutMultiplier: null, profit: 0, status: 'playing' },
      { id: 1004, username: "الصقر_الذهبي", betAmount: 1000, cashoutMultiplier: null, profit: 0, status: 'playing' },
    ];
    
    setPlayers(fakePlayers);
    
    // Clean up on component unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, []);
  
  // Handle AI players cashing out at random points
  useEffect(() => {
    if (gameState === 'running' && players.length > 0) {
      const aiCashoutInterval = setInterval(() => {
        // Only process AI players (for demo purposes, all players except user are AI)
        setPlayers(prevPlayers => {
          return prevPlayers.map(player => {
            // Skip players who already cashed out or busted, and skip the user
            if (player.status !== 'playing' || player.id === user?.id) {
              return player;
            }
            
            // Randomly decide if this AI player will cash out on this tick
            // Higher chance of cashing out as multiplier increases
            const cashoutChance = 0.1 + (currentMultiplier - 1) * 0.05;
            if (Math.random() < cashoutChance) {
              return {
                ...player,
                cashoutMultiplier: currentMultiplier,
                profit: Math.floor(player.betAmount * currentMultiplier) - player.betAmount,
                status: 'cashed_out'
              };
            }
            
            return player;
          });
        });
      }, 300); // Check every 300ms
      
      return () => clearInterval(aiCashoutInterval);
    }
  }, [gameState, currentMultiplier, user]);
  
  // Calculate statistics
  const totalPlayers = players.length;
  const totalBets = players.reduce((sum, player) => sum + player.betAmount, 0);
  const cashedOutPlayers = players.filter(p => p.status === 'cashed_out').length;
  const bustedPlayers = players.filter(p => p.status === 'busted').length;
  
  // Get current player from players array
  const currentPlayer = players.find(p => p.id === user?.id);
  
  return (
    <div className="min-h-screen bg-[#8B4513] text-white">
      {/* Header area */}
      <div className="bg-[#5D4037] border-b border-[#DEB887] p-2 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-[#DEB887] hover:text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
          <span>العودة</span>
        </button>
        <h1 className="text-xl font-bold text-[#DEB887]">الأسد والغزالة</h1>
        <div className="flex items-center gap-2">
          <span className="text-[#DEB887] font-bold">{user?.chips || 0}</span>
          <Coins className="h-5 w-5 text-[#DEB887]" />
        </div>
      </div>
      
      {/* Main game area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Game visualization and controls - Left side on desktop */}
          <div className="lg:col-span-2 space-y-4">
            {/* Game visualization */}
            <div ref={gameAreaRef} className="relative h-64 md:h-80 bg-[#3E2723] rounded-xl overflow-hidden border-2 border-[#DEB887] shadow-lg">
              {/* Background scenery */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#8B4513]/20 to-[#5D4037]/20"></div>
              
              {/* Lion and Gazelle racing track */}
              <div className="absolute bottom-0 w-full h-24 bg-[#A1887F]/30 border-t border-[#DEB887]/50"></div>
              
              {/* Gazelle character */}
              <div 
                style={{ left: `${gazellePosition}%` }} 
                className="absolute bottom-6 w-16 h-16 transform -translate-x-1/2 transition-all duration-100"
              >
                <div className="w-full h-full rounded-full bg-[#DEB887]/80 flex items-center justify-center text-3xl">
                  🦌
                </div>
              </div>
              
              {/* Lion character */}
              <div 
                style={{ left: `${lionPosition}%` }} 
                className="absolute bottom-6 w-16 h-16 transform -translate-x-1/2 transition-all duration-100"
              >
                <div className="w-full h-full rounded-full bg-[#5D4037]/80 flex items-center justify-center text-3xl">
                  🦁
                </div>
              </div>
              
              {/* Game state display */}
              <div className="absolute top-4 left-0 right-0 flex flex-col items-center">
                {gameState === 'waiting' && (
                  <div className="bg-black/50 px-6 py-2 rounded-full text-center">
                    <h2 className="text-lg font-bold">الجولة التالية تبدأ في</h2>
                    <span className="text-3xl font-bold text-[#DEB887]">{countdown}s</span>
                  </div>
                )}
                
                {gameState === 'running' && (
                  <div className="bg-black/50 px-8 py-4 rounded-full text-center">
                    <span className="text-4xl font-bold text-[#DEB887]">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                )}
                
                {gameState === 'ended' && (
                  <div className="bg-black/70 px-8 py-4 rounded-full text-center animate-pulse">
                    <h2 className="text-lg font-bold text-red-500">انتهت الجولة!</h2>
                    <span className="text-3xl font-bold text-red-500">{bustedAt?.toFixed(2)}x</span>
                  </div>
                )}
              </div>
              
              {/* Overlay when game ended */}
              {gameState === 'ended' && (
                <div className="absolute inset-0 bg-red-900/30 animate-pulse"></div>
              )}
            </div>
            
            {/* Game controls */}
            <div className="bg-[#3E2723] p-4 rounded-xl border border-[#DEB887]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bet controls */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#DEB887]">المراهنة</h3>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm">مبلغ الرهان</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                        min={1}
                        disabled={isPlayerBetting || gameState === 'running'}
                        className="flex-1 bg-[#5D4037] border border-[#DEB887] rounded px-3 py-2 text-white"
                      />
                      <Button 
                        onClick={() => setBetAmount(Math.max(1, betAmount / 2))}
                        disabled={isPlayerBetting || gameState === 'running'}
                        variant="outline"
                        className="bg-[#5D4037] border-[#DEB887] text-[#DEB887] hover:bg-[#DEB887] hover:text-[#5D4037]"
                      >
                        1/2
                      </Button>
                      <Button 
                        onClick={() => setBetAmount(betAmount * 2)}
                        disabled={isPlayerBetting || gameState === 'running'}
                        variant="outline"
                        className="bg-[#5D4037] border-[#DEB887] text-[#DEB887] hover:bg-[#DEB887] hover:text-[#5D4037]"
                      >
                        2x
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick bet amounts */}
                  <div className="flex gap-2">
                    {[10, 50, 100, 500].map(amount => (
                      <Button 
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        disabled={isPlayerBetting || gameState === 'running'}
                        variant="outline"
                        className="flex-1 bg-[#5D4037] border-[#DEB887] text-[#DEB887] hover:bg-[#DEB887] hover:text-[#5D4037]"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Place bet / cashout button */}
                  {!isPlayerBetting ? (
                    <Button 
                      onClick={placeBet}
                      disabled={gameState === 'running' || betAmount <= 0}
                      className="w-full bg-[#8B4513] hover:bg-[#DEB887] hover:text-[#5D4037] text-white py-3 rounded-md font-bold text-lg"
                    >
                      انضمام للجولة
                    </Button>
                  ) : (
                    <Button 
                      onClick={cashOut}
                      disabled={gameState !== 'running'}
                      className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-md font-bold text-lg animate-pulse"
                    >
                      سحب الأرباح ({(betAmount * currentMultiplier).toFixed(0)})
                    </Button>
                  )}
                </div>
                
                {/* Game stats and info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#DEB887]">إحصائيات الجولة</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#5D4037] p-2 rounded border border-[#DEB887] flex justify-between">
                      <span>اللاعبون:</span>
                      <span className="font-bold">{totalPlayers}</span>
                    </div>
                    <div className="bg-[#5D4037] p-2 rounded border border-[#DEB887] flex justify-between">
                      <span>مجموع الرهانات:</span>
                      <span className="font-bold">{totalBets}</span>
                    </div>
                    <div className="bg-[#5D4037] p-2 rounded border border-[#DEB887] flex justify-between">
                      <span>سحبوا أرباحهم:</span>
                      <span className="font-bold text-green-400">{cashedOutPlayers}</span>
                    </div>
                    <div className="bg-[#5D4037] p-2 rounded border border-[#DEB887] flex justify-between">
                      <span>خسروا:</span>
                      <span className="font-bold text-red-400">{bustedPlayers}</span>
                    </div>
                  </div>
                  
                  {/* Player status */}
                  {currentPlayer && (
                    <div className="bg-[#5D4037] p-3 rounded border border-[#DEB887]">
                      <h4 className="font-bold mb-1">حالة اللاعب</h4>
                      <div className="flex justify-between">
                        <span>المراهنة:</span>
                        <span className="font-bold">{currentPlayer.betAmount}</span>
                      </div>
                      
                      {currentPlayer.status === 'cashed_out' && (
                        <>
                          <div className="flex justify-between">
                            <span>سحب عند:</span>
                            <span className="font-bold text-green-400">{currentPlayer.cashoutMultiplier?.toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الربح:</span>
                            <span className="font-bold text-green-400">+{currentPlayer.profit}</span>
                          </div>
                        </>
                      )}
                      
                      {currentPlayer.status === 'busted' && (
                        <div className="flex justify-between">
                          <span>الخسارة:</span>
                          <span className="font-bold text-red-400">-{currentPlayer.betAmount}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Player list - Right side on desktop */}
          <div className="bg-[#3E2723] p-4 rounded-xl border border-[#DEB887] max-h-[600px] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#DEB887] mb-4">اللاعبون</h3>
            
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-4 text-sm font-bold border-b border-[#DEB887] pb-2">
                <div>اللاعب</div>
                <div className="text-center">الرهان</div>
                <div className="text-center">المضاعف</div>
                <div className="text-left">الربح</div>
              </div>
              
              {/* Player rows */}
              {players.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  لا يوجد لاعبون في هذه الجولة بعد
                </div>
              ) : (
                players.map(player => (
                  <div key={player.id} className={`grid grid-cols-4 py-2 border-b border-[#DEB887]/20 ${
                    player.id === user?.id ? 'bg-[#DEB887]/10' : ''
                  }`}>
                    <div className="truncate font-medium">{player.username}</div>
                    <div className="text-center">{player.betAmount}</div>
                    <div className="text-center">
                      {player.status === 'playing' ? (
                        <span className="text-yellow-400 animate-pulse">يلعب</span>
                      ) : player.status === 'cashed_out' ? (
                        <span className="text-green-400">{player.cashoutMultiplier?.toFixed(2)}x</span>
                      ) : (
                        <span className="text-red-400">انتهى</span>
                      )}
                    </div>
                    <div className={`text-left ${
                      player.status === 'cashed_out' ? 'text-green-400' : 
                      player.status === 'busted' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {player.status === 'playing' ? (
                        '-'
                      ) : player.status === 'cashed_out' ? (
                        `+${player.profit}`
                      ) : (
                        `-${player.betAmount}`
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Game history section */}
        <div className="mt-6 bg-[#3E2723] p-4 rounded-xl border border-[#DEB887]">
          <h3 className="text-lg font-bold text-[#DEB887] mb-4">تاريخ الجولات الأخيرة</h3>
          
          <div className="flex flex-wrap gap-2">
            {/* Simulate some random historical crash points */}
            {Array.from({ length: 15 }, (_, i) => ({
              id: i,
              multiplier: (1 + Math.random() * 5).toFixed(2)
            })).map(history => (
              <div 
                key={history.id} 
                className={`w-16 h-10 rounded flex items-center justify-center font-bold ${
                  parseFloat(history.multiplier) < 1.5 ? 'bg-red-600' : 
                  parseFloat(history.multiplier) < 3 ? 'bg-yellow-600' : 
                  'bg-green-600'
                }`}
              >
                {history.multiplier}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}