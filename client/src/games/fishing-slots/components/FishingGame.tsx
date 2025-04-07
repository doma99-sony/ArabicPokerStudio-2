import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { WinType, GameStatus } from '../types';
import useGameState from '../hooks/useGameState';
import useSound from '../hooks/useSound';
import useAnimation from '../hooks/useAnimation';
import FreeSpin from './FreeSpin';
import PaylineOverlay, { WinPaylines } from './PaylineOverlay';
import { symbolImages } from '../assets/images';

import '../assets/fishing-slots.css';

/**
 * المكون الرئيسي للعبة صياد السمك
 */
const FishingGame: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // استخدام مختلف Hooks للعبة
  const {
    gameState,
    setGameState,
    increaseBet,
    decreaseBet,
    increasePaylines,
    decreasePaylines,
    spinReels,
    placeBet,
    collectWin,
    setMaxBet,
    toggleAutoSpin
  } = useGameState();
  
  const {
    playBackgroundMusic,
    stopBackgroundMusic,
    playSpinSound,
    playWinSound,
    playFreeSpinsSound,
    playButtonSound,
    toggleSound,
    toggleMusic,
    isSoundEnabled,
    isMusicEnabled
  } = useSound();
  
  const {
    spinDuration,
    winAnimationDuration,
    fastMode,
    toggleFastMode
  } = useAnimation();
  
  // التحكم في حالة اللعبة
  const [isLoading, setIsLoading] = useState(true);
  
  // تهيئة اللعبة عند التحميل
  useEffect(() => {
    // بدء تشغيل الموسيقى الخلفية
    if (isMusicEnabled) {
      playBackgroundMusic();
    }
    
    // تأخير قليل لإظهار شاشة التحميل
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    // إيقاف الموسيقى عند مغادرة اللعبة
    return () => {
      clearTimeout(timer);
      stopBackgroundMusic();
    };
  }, []);
  
  // العودة إلى القائمة الرئيسية
  const handleExit = () => {
    playButtonSound();
    setLocation('/slots');
  };
  
  // معالجة نقرة زر الدوران
  const handleSpin = () => {
    if (gameState.gameStatus === GameStatus.IDLE) {
      // وضع رهان وبدء الدوران
      if (placeBet()) {
        playSpinSound();
        spinReels();
      } else {
        // عرض رسالة خطأ إذا لم يكن هناك رصيد كافٍ
        toast({
          title: "رصيد غير كافٍ",
          description: "الرجاء إضافة رصيد أو تقليل قيمة الرهان",
          variant: "destructive"
        });
      }
    } else if (gameState.gameStatus === GameStatus.SHOWING_WIN) {
      // جمع الفوز والانتقال إلى الحالة الخاملة
      collectWin();
    }
  };
  
  // عرض حالة الفوز
  const renderWinState = () => {
    if (gameState.gameStatus !== GameStatus.SHOWING_WIN || !gameState.lastWin) {
      return null;
    }
    
    const { lastWin } = gameState;
    
    return (
      <div className="win-display">
        <div className={`win-effect ${lastWin.type.toLowerCase()}-win-effect`}></div>
        <div className="win-content">
          <div className="win-text">
            {lastWin.type === WinType.SMALL && 'فوز!'}
            {lastWin.type === WinType.MEDIUM && 'فوز كبير!'}
            {lastWin.type === WinType.LARGE && 'فوز رائع!'}
            {lastWin.type === WinType.MEGA && 'فوز ضخم!'}
          </div>
          <div className="win-multiplier">x{lastWin.payoutMultiplier}</div>
          <div className="win-amount">{lastWin.amount.toFixed(2)} رقاقة</div>
        </div>
      </div>
    );
  };
  
  // عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="fishing-game-container">
        <div className="loading-screen">
          <div className="loading-animation"></div>
          <p>جاري تحميل لعبة صياد السمك...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fishing-game-container">
      {/* خلفية اللعبة */}
      <div className="fishing-game-background">
        <div className="water-animation"></div>
        <div className="bubbles-animation"></div>
        <div className="water-grid"></div>
      </div>
      
      {/* رأس اللعبة */}
      <div className="game-header">
        <div className="game-title">صياد السمك 🎣</div>
        <Button className="exit-button" onClick={handleExit}>
          خروج
        </Button>
      </div>
      
      {/* معلومات اللاعب */}
      <div className="player-info">
        <div className="balance-card">
          <div className="balance-label">الرصيد</div>
          <div className="balance-amount">{gameState.balance.toFixed(2)}</div>
        </div>
        <div className="bet-card">
          <div className="bet-label">الرهان</div>
          <div className="bet-amount">{gameState.betAmount.toFixed(2)}</div>
        </div>
        <div className="win-card">
          <div className="win-label">الفوز</div>
          <div className="win-amount">{gameState.totalWin.toFixed(2)}</div>
        </div>
      </div>
      
      {/* منطقة البكرات */}
      <div className="reels-area">
        <div className="reels-container">
          <div className="reels-grid">
            {gameState.visibleSymbols.map((column, colIndex) => (
              column.map((symbol, rowIndex) => (
                <div 
                  key={`${colIndex}-${rowIndex}`} 
                  className={`symbol ${symbol.isWild ? 'wild' : ''} ${symbol.isScatter ? 'scatter' : ''} ${symbol.type === 'FISH_MONEY' ? 'fish-money' : ''}`}
                  data-value={symbol.value}
                >
                  <img 
                    src={symbolImages[symbol.type]} 
                    alt={symbol.type} 
                    className={gameState.gameStatus === GameStatus.SPINNING ? 'spinning-animation' : ''}
                  />
                </div>
              ))
            ))}
          </div>
          
          {/* خطوط الدفع للفوز */}
          {gameState.lastWin && gameState.lastWin.payline && (
            <WinPaylines 
              wins={gameState.lastWin ? [gameState.lastWin] : []} 
              gridSize={{ cols: 5, rows: 3 }}
              activePaylines={gameState.activePaylines}
            />
          )}
        </div>
        
        {/* عرض اللفات المجانية */}
        <FreeSpin freeSpins={gameState.freeSpins} />
      </div>
      
      {/* أزرار التحكم */}
      <div className="game-controls">
        <div className="bet-controls">
          <div className="control-label">الرهان:</div>
          <div className="bet-amount-controls">
            <Button 
              onClick={() => { playButtonSound(); decreaseBet(); }} 
              disabled={gameState.gameStatus !== GameStatus.IDLE}
              variant="outline"
            >
              -
            </Button>
            <div className="bet-amount">{gameState.betAmount.toFixed(2)}</div>
            <Button 
              onClick={() => { playButtonSound(); increaseBet(); }} 
              disabled={gameState.gameStatus !== GameStatus.IDLE}
              variant="outline"
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="paylines-controls">
          <div className="control-label">خطوط الدفع:</div>
          <div className="paylines-count-controls">
            <Button 
              onClick={() => { playButtonSound(); decreasePaylines(); }} 
              disabled={gameState.gameStatus !== GameStatus.IDLE}
              variant="outline"
            >
              -
            </Button>
            <div className="paylines-count">{gameState.activePaylines}</div>
            <Button 
              onClick={() => { playButtonSound(); increasePaylines(); }} 
              disabled={gameState.gameStatus !== GameStatus.IDLE}
              variant="outline"
            >
              +
            </Button>
          </div>
        </div>
        
        <div className="main-controls">
          <Button 
            className="max-bet-button"
            onClick={() => { playButtonSound(); setMaxBet(); }} 
            disabled={gameState.gameStatus !== GameStatus.IDLE}
          >
            الرهان الأقصى
          </Button>
          
          <div className="play-controls">
            <Button 
              className="spin-button"
              onClick={handleSpin} 
              disabled={gameState.gameStatus === GameStatus.SPINNING}
            >
              {gameState.gameStatus === GameStatus.IDLE && 'دوران'}
              {gameState.gameStatus === GameStatus.SPINNING && 'جاري الدوران...'}
              {gameState.gameStatus === GameStatus.SHOWING_WIN && 'تحصيل'}
              {gameState.gameStatus === GameStatus.FREE_SPINS && `لفات مجانية (${gameState.freeSpins.count})`}
            </Button>
            
            <Button 
              onClick={() => { playButtonSound(); toggleAutoSpin(); }}
              disabled={gameState.gameStatus !== GameStatus.IDLE}
              variant="outline"
            >
              {gameState.isAutoSpin ? 'إيقاف الدوران التلقائي' : 'دوران تلقائي'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* عرض الفوز */}
      {renderWinState()}
    </div>
  );
};

export default FishingGame;