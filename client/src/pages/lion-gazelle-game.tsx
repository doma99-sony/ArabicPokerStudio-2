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
      // Extended range for longer track with smoother movement
      const newLionPosition = Math.min(800, (elapsed / gameSpeed) * 120); 
      setLionPosition(newLionPosition);
      
      // Gazelle stays ahead but gap closes
      // Ensure there's always a minimum gap between lion and gazelle
      const minimumGap = 50; // Minimum distance between lion and gazelle
      const distanceReducer = newLionPosition / 15; // Smaller divisor means slower closing gap
      const gapSize = Math.max(minimumGap, 100 - distanceReducer);
      const newGazellePosition = Math.min(800, newLionPosition + gapSize);
      setGazellePosition(newGazellePosition);
      
      // Camera position follows the action - keeps both characters in frame when possible
      // Calculate center point between lion and gazelle
      const centerPoint = (newLionPosition + newGazellePosition) / 2;
      
      // Set viewport to follow characters with some margin to see ahead
      // View size is 100 units wide, so we need to adjust camera to keep both in frame
      // Ensure we have enough space on both sides to see the animals
      const newCameraPosition = Math.max(0, centerPoint - 50);
      setCameraPosition(newCameraPosition);
      
      // If game is in extended mode (track is longer than initial view), adjust viewport
      // Use larger value for gameViewportWidth to ensure character visibility
      // and add more space ahead of the gazelle
      const minViewportWidth = 100; // Minimum viewport width
      const gazelleLeadSpace = 200; // Extra space ahead of gazelle
      const newViewportWidth = Math.max(minViewportWidth, newGazellePosition + gazelleLeadSpace);
      setGameViewportWidth(newViewportWidth);
      
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
                {/* احترافية جديدة مع تفاصيل الحيوانات في المشهد */}
                <div className="absolute inset-0 bg-no-repeat bg-cover h-full" style={{ 
                  backgroundImage: "url('/assets/lion-gazelle/background.svg')",
                  width: `${gameViewportWidth}%`,
                }}></div>
                
                {/* Extended racing track */}
                <div className="absolute bottom-0 bg-repeat-x bg-cover h-24" style={{ 
                  backgroundImage: "url('/assets/lion-gazelle/track.svg')",
                  width: `${gameViewportWidth}%`,
                }}></div>
                
                {/* Gazelle character with more realistic animation - improved visibility with fixed positioning */}
                {(gameState === 'running' || gameState === 'waiting') && (
                  <div 
                    ref={gazelleRef}
                    style={{
                      left: `${gazellePosition * 100 / gameViewportWidth}%`,
                      zIndex: 20 // عنصر فوق الخلفية لضمان الرؤية
                    }} 
                    className="absolute bottom-6 w-16 md:w-20 h-16 md:h-20 transform -translate-x-1/2 transition-all duration-75"
                    key="gazelle-character"
                  >
                    <div className="w-full h-full relative">
                      <img 
                        src="/assets/lion-gazelle/gazelle.svg" 
                        alt="Gazelle" 
                        className={`w-full h-full object-contain ${gameState === 'running' ? 'gazelle-run' : ''}`}
                        style={{ 
                          filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.3))'
                        }}
                      />
                      {/* Dust effect behind gazelle - only during running state */}
                      {gameState === 'running' && (
                        <img 
                          src="/assets/lion-gazelle/dust.svg" 
                          alt="Dust" 
                          className="absolute -left-8 bottom-0 w-12 h-8 opacity-70 dust-animation"
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Lion character with more realistic animation - improved visibility with fixed positioning */}
                {(gameState === 'running' || gameState === 'waiting') && (
                  <div 
                    ref={lionRef}
                    style={{ 
                      left: `${lionPosition * 100 / gameViewportWidth}%`,
                      zIndex: 20 // عنصر فوق الخلفية لضمان الرؤية
                    }} 
                    className="absolute bottom-6 w-20 md:w-24 h-20 md:h-24 transform -translate-x-1/2 transition-all duration-75"
                    key="lion-character"
                  >
                    <div className="w-full h-full relative">
                      <img 
                        src="/assets/lion-gazelle/lion.svg" 
                        alt="Lion" 
                        className={`w-full h-full object-contain ${gameState === 'running' ? 'lion-run' : ''}`}
                        style={{ 
                          filter: 'drop-shadow(3px 4px 3px rgba(0,0,0,0.4))'
                        }}
                      />
                      {/* Dust effect behind lion - only during running state */}
                      {gameState === 'running' && (
                        <img 
                          src="/assets/lion-gazelle/dust.svg" 
                          alt="Dust" 
                          className="absolute -left-10 bottom-0 w-16 h-10 opacity-80 dust-animation"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Game info overlays */}
              {gameState === 'waiting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-30 text-center p-4">
                  <h2 className="text-2xl font-bold text-[#DEB887] mb-2">الجولة التالية</h2>
                  <div className="text-5xl font-bold text-white mb-4">{countdown}</div>
                  <p className="text-sm text-white/80">سيبدأ الأسد بمطاردة الغزالة قريباً - ضع رهانك!</p>
                </div>
              )}
              
              {gameState === 'ended' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 z-30 text-center p-4 crash-background">
                  <h2 className="text-3xl font-bold text-red-300 mb-1">تم إمساك الغزالة!</h2>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-3">{bustedAt?.toFixed(2)}x</div>
                  <p className="text-sm text-white/90">الجولة القادمة: <span className="font-bold">{countdown}</span></p>
                </div>
              )}
              
              {/* Current multiplier */}
              {gameState === 'running' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
                  <div className="bg-[#8B4513]/80 border-2 border-[#DEB887] rounded-full px-4 py-1 text-center min-w-24">
                    <span className="text-2xl font-bold text-[#DEB887]">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Game controls */}
            <div className="bg-[#5D4037] rounded-xl p-4 border-2 border-[#DEB887] shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                {/* Left side - Bet controls */}
                <div className="space-y-3">
                  <h3 className="text-[#DEB887] font-semibold">مبلغ الرهان</h3>
                  
                  {/* Bet amount slider */}
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[betAmount]}
                      min={1}
                      max={1000}
                      step={1}
                      onValueChange={(values) => setBetAmount(values[0])}
                      disabled={isPlayerBetting || gameState === 'running'}
                      className="flex-1"
                    />
                    <span className="min-w-12 text-center font-bold">{betAmount}</span>
                  </div>
                  
                  {/* Quick bet buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBetAmount(prev => Math.max(1, prev - 10))}
                      disabled={isPlayerBetting || gameState === 'running'}
                      className="bg-[#3E2723] text-[#DEB887] hover:bg-[#3E2723]/80 rounded px-2 py-1 text-xs flex-1 disabled:opacity-50"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setBetAmount(prev => Math.min(1000, prev + 10))}
                      disabled={isPlayerBetting || gameState === 'running'}
                      className="bg-[#3E2723] text-[#DEB887] hover:bg-[#3E2723]/80 rounded px-2 py-1 text-xs flex-1 disabled:opacity-50"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
                      disabled={isPlayerBetting || gameState === 'running'}
                      className="bg-[#3E2723] text-[#DEB887] hover:bg-[#3E2723]/80 rounded px-2 py-1 text-xs flex-1 disabled:opacity-50"
                    >
                      1/2
                    </button>
                    <button
                      onClick={() => setBetAmount(prev => Math.min(1000, prev * 2))}
                      disabled={isPlayerBetting || gameState === 'running'}
                      className="bg-[#3E2723] text-[#DEB887] hover:bg-[#3E2723]/80 rounded px-2 py-1 text-xs flex-1 disabled:opacity-50"
                    >
                      2x
                    </button>
                  </div>
                </div>
                
                {/* Right side - Action buttons */}
                <div className="flex flex-col justify-between gap-2">
                  {!isPlayerBetting ? (
                    <Button
                      onClick={placeBet}
                      disabled={gameState === 'running' || gameState === 'ended'}
                      className="bg-[#DEB887] hover:bg-[#D4AF37] text-black h-full text-lg font-bold"
                    >
                      <DollarSign className="mr-1 h-5 w-5" />
                      ضع رهانك
                    </Button>
                  ) : (
                    <Button
                      onClick={cashOut}
                      disabled={gameState !== 'running'}
                      className="bg-green-600 hover:bg-green-700 text-white h-full text-lg font-bold"
                    >
                      <ArrowRight className="mr-1 h-5 w-5" />
                      سحب {Math.floor(betAmount * currentMultiplier)}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Potential win */}
              {isPlayerBetting && gameState === 'running' && (
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-[#DEB887]">ربح محتمل:</span>
                  <span className="font-bold">× {currentMultiplier.toFixed(2)} = {Math.floor(betAmount * currentMultiplier)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Players and game stats - Right side on desktop */}
          <div className="space-y-4">
            {/* Game stats */}
            <div className="bg-[#5D4037] rounded-xl p-4 border-2 border-[#DEB887] shadow-lg">
              <h3 className="text-lg font-bold text-[#DEB887] mb-3">إحصائيات الجولة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#3E2723] rounded-lg p-2 flex items-center">
                  <Users className="h-5 w-5 text-[#DEB887] mr-2" />
                  <div>
                    <div className="text-xs text-[#DEB887]/70">اللاعبون</div>
                    <div className="font-bold">{totalPlayers}</div>
                  </div>
                </div>
                <div className="bg-[#3E2723] rounded-lg p-2 flex items-center">
                  <Coins className="h-5 w-5 text-[#DEB887] mr-2" />
                  <div>
                    <div className="text-xs text-[#DEB887]/70">إجمالي الرهانات</div>
                    <div className="font-bold">{totalBets}</div>
                  </div>
                </div>
                <div className="bg-[#3E2723] rounded-lg p-2 flex items-center">
                  <Star className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <div className="text-xs text-[#DEB887]/70">سحبوا بنجاح</div>
                    <div className="font-bold">{cashedOutPlayers}</div>
                  </div>
                </div>
                <div className="bg-[#3E2723] rounded-lg p-2 flex items-center">
                  <Clock className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <div className="text-xs text-[#DEB887]/70">خسروا</div>
                    <div className="font-bold">{bustedPlayers}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Players list */}
            <div className="bg-[#5D4037] rounded-xl overflow-hidden border-2 border-[#DEB887] shadow-lg">
              <div className="p-3 bg-[#3E2723] border-b border-[#DEB887]">
                <h3 className="text-lg font-bold text-[#DEB887]">اللاعبون</h3>
              </div>
              
              <div className="divide-y divide-[#DEB887]/30 max-h-96 overflow-y-auto">
                {players.map(player => (
                  <div key={player.id} className={`p-3 flex justify-between items-center ${player.id === user?.id ? 'bg-[#8B4513]/30' : ''}`}>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#3E2723] flex items-center justify-center mr-3 border border-[#DEB887]/50">
                        {player.id === user?.id ? (
                          <Crown className="h-4 w-4 text-[#DEB887]" />
                        ) : (
                          <Trophy className="h-4 w-4 text-[#DEB887]" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{player.username}</div>
                        <div className="text-xs text-[#DEB887]">{player.betAmount} رقاقة</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {player.status === 'playing' && (
                        <div className="text-white font-bold">
                          مشارك
                          <div className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-1 animate-pulse"></div>
                        </div>
                      )}
                      {player.status === 'cashed_out' && (
                        <div className="text-green-500 font-bold">
                          {player.cashoutMultiplier?.toFixed(2)}x
                          <span className="block text-xs">+{player.profit}</span>
                        </div>
                      )}
                      {player.status === 'busted' && (
                        <div className="text-red-500 font-bold">
                          خسر
                          <span className="block text-xs">{player.profit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {players.length === 0 && (
                  <div className="p-6 text-center text-[#DEB887]/70">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>انتظر الجولة القادمة للانضمام</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}