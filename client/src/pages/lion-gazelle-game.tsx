import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Crown, Trophy, Users, Coins, RefreshCw, ArrowRight, DollarSign, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import '../lion-gazelle-animations.css';

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
  const [cameraPosition, setCameraPosition] = useState(0); // Camera position to follow characters
  const [gameViewportWidth, setGameViewportWidth] = useState(100); // Visible portion size (percentage)
  
  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTrackRef = useRef<HTMLDivElement>(null);
  const lionRef = useRef<HTMLDivElement>(null);
  const gazelleRef = useRef<HTMLDivElement>(null);
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
      const newLionPosition = Math.min(800, (elapsed / gameSpeed) * 120); // Extended range for longer track
      setLionPosition(newLionPosition);
      
      // Gazelle stays ahead but gap closes
      const newGazellePosition = Math.min(800, newLionPosition + 100 - (newLionPosition / 10));
      setGazellePosition(newGazellePosition);
      
      // Camera position follows the action - keeps both characters in frame when possible
      // Calculate center point between lion and gazelle
      const centerPoint = (newLionPosition + newGazellePosition) / 2;
      
      // Set viewport to follow characters with some margin to see ahead
      // View size is 100 units wide, so we need to adjust camera to keep both in frame
      const newCameraPosition = Math.max(0, centerPoint - 50);
      setCameraPosition(newCameraPosition);
      
      // If game is in extended mode (track is longer than initial view), adjust viewport
      if (newLionPosition > 80 || newGazellePosition > 80) {
        // Expand the virtual track length
        setGameViewportWidth(Math.max(100, newGazellePosition + 150));
      }
      
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
  
  // Effect for when game ends with a crash (lion catches gazelle)
  useEffect(() => {
    if (gameState === 'ended' && bustedAt) {
      // Add crash effect (shake the game area)
      if (gameAreaRef.current) {
        // Add crash effect class for screen shake
        gameAreaRef.current.classList.add('crash-effect');
        
        // Play collision sound if we were to add sound effects
        // playSound('crash.mp3');
        
        // Add red flash overlay
        const flashOverlay = document.createElement('div');
        flashOverlay.className = 'absolute inset-0 bg-red-600/40 z-10';
        flashOverlay.style.animation = 'blink 0.2s 3';
        gameAreaRef.current.appendChild(flashOverlay);
        
        // Remove effects after animation completes
        setTimeout(() => {
          if (gameAreaRef.current) {
            gameAreaRef.current.classList.remove('crash-effect');
            if (flashOverlay.parentNode === gameAreaRef.current) {
              gameAreaRef.current.removeChild(flashOverlay);
            }
          }
        }, 1000);
      }
    }
  }, [gameState, bustedAt]);
  
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
              {/* Game world container - this will move with camera position */}
              <div 
                ref={gameTrackRef}
                className="absolute inset-0 overflow-hidden"
                style={{ 
                  width: `${gameViewportWidth}%`, 
                  transform: `translateX(-${cameraPosition}%)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {/* Extended Savanna background */}
                <div className="absolute inset-0 bg-repeat-x bg-cover h-full" style={{ 
                  backgroundImage: "url('assets/lion-gazelle/savanna.svg')",
                  width: `${gameViewportWidth}%`,
                }}></div>
                
                {/* Extended racing track */}
                <div className="absolute bottom-0 bg-repeat-x bg-cover h-24" style={{ 
                  backgroundImage: "url('assets/lion-gazelle/track.svg')",
                  width: `${gameViewportWidth}%`,
                }}></div>
                
                {/* Gazelle character with more realistic animation */}
                {(gameState === 'running' || gameState === 'waiting') && (
                  <div 
                    ref={gazelleRef}
                    style={{ left: `${gazellePosition * 100 / gameViewportWidth}%` }} 
                    className="absolute bottom-6 w-16 md:w-20 h-16 md:h-20 transform -translate-x-1/2 transition-all duration-75"
                    key="gazelle-character"
                  >
                    <div className="w-full h-full relative">
                      <img 
                        src="assets/lion-gazelle/gazelle.svg" 
                        alt="Gazelle" 
                        className={`w-full h-full object-contain ${gameState === 'running' ? 'gazelle-run' : ''}`}
                        style={{ 
                          filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.3))'
                        }}
                      />
                      {/* Dust effect behind gazelle - only during running state */}
                      {gameState === 'running' && (
                        <img 
                          src="assets/lion-gazelle/dust.svg" 
                          alt="Dust" 
                          className="absolute -left-8 bottom-0 w-12 h-8 opacity-70 dust-animation"
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Lion character with more realistic animation */}
                {(gameState === 'running' || gameState === 'waiting') && (
                  <div 
                    ref={lionRef}
                    style={{ left: `${lionPosition * 100 / gameViewportWidth}%` }} 
                    className="absolute bottom-6 w-20 md:w-24 h-20 md:h-24 transform -translate-x-1/2 transition-all duration-75"
                    key="lion-character"
                  >
                    <div className="w-full h-full relative">
                      <img 
                        src="assets/lion-gazelle/lion.svg" 
                        alt="Lion" 
                        className={`w-full h-full object-contain ${gameState === 'running' ? 'lion-run' : ''}`}
                        style={{ 
                          filter: 'drop-shadow(3px 4px 3px rgba(0,0,0,0.4))'
                        }}
                      />
                      {/* Dust effect behind lion - only during running state */}
                      {gameState === 'running' && (
                        <img 
                          src="assets/lion-gazelle/dust.svg" 
                          alt="Dust" 
                          className="absolute -left-10 bottom-0 w-16 h-10 opacity-80 dust-animation"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Gradient overlay masks for edges to create infinite scroll effect */}
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#3E2723] to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#3E2723] to-transparent pointer-events-none z-10"></div>
              
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
              
              {/* Display lion catching gazelle when game is ended */}
              {gameState === 'ended' && (
                <div 
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-24 md:h-32"
                  key="crash-scene"
                >
                  <div className="relative h-full w-full">
                    {/* Lion in catching position */}
                    <img 
                      src="assets/lion-gazelle/lion.svg" 
                      alt="Lion" 
                      className="absolute -right-3 bottom-0 w-20 md:w-24 h-20 md:h-24 object-contain transform rotate-6 scale-110"
                      style={{ filter: 'drop-shadow(3px 4px 3px rgba(0,0,0,0.4))' }}
                    />
                    
                    {/* Gazelle in caught position */}
                    <img 
                      src="assets/lion-gazelle/gazelle.svg" 
                      alt="Gazelle" 
                      className="absolute -left-3 bottom-2 w-16 md:w-20 h-16 md:h-20 object-contain transform -rotate-12"
                      style={{ filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.3))' }}
                    />
                    
                    {/* Dust cloud from the impact */}
                    <img 
                      src="assets/lion-gazelle/dust.svg" 
                      alt="Dust" 
                      className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-20 opacity-80 dust-animation"
                    />
                  </div>
                </div>
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