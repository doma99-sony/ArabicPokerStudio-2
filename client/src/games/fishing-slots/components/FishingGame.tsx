// مكون لعبة صياد السمك الرئيسي
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';

import { WinType } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useSound } from '../hooks/useSound';
import { useAnimation } from '../hooks/useAnimation';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import '../assets/fishing-slots.css';

/**
 * مكون لعبة صياد السمك الرئيسي
 */
export default function FishingGame() {
  // استخدام hooks
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // استخدام حالة اللعبة
  const {
    gameState,
    spinning,
    updateBetAmount,
    updateActivePaylines,
    spin,
    toggleAutoSpin,
    updateSettings
  } = useGameState(1, 10);
  
  // استخدام الصوت
  const sound = useSound(true);
  
  // استخدام الرسوم المتحركة
  const animation = useAnimation(false);
  
  // حالات واجهة المستخدم
  const [showPaytable, setShowPaytable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAutoSpinOptions, setShowAutoSpinOptions] = useState(false);
  
  // تحميل إعدادات الصوت عند التهيئة
  useEffect(() => {
    if (gameState) {
      sound.setEnabled(gameState.settings.soundEnabled);
    }
  }, [gameState?.settings.soundEnabled]);
  
  // التعامل مع تغيير قيمة الرهان
  const handleBetChange = (value: number) => {
    if (spinning) return;
    updateBetAmount(value);
  };
  
  // التعامل مع تغيير خطوط الدفع النشطة
  const handlePaylinesChange = (value: number) => {
    if (spinning) return;
    updateActivePaylines(value);
  };
  
  // بدء الدوران
  const handleSpin = () => {
    if (spinning) return;
    
    // تشغيل صوت الدوران
    sound.play('spin');
    
    // بدء الرسوم المتحركة
    animation.startSpinAnimation();
    
    // بدء الدوران منطقيًا
    spin();
  };
  
  // تشغيل الدوران التلقائي
  const handleAutoSpin = (count: number) => {
    setShowAutoSpinOptions(false);
    toggleAutoSpin(count);
    
    // تشغيل صوت الدوران
    sound.play('spin');
    
    toast({
      title: 'وضع الدوران التلقائي',
      description: `تم تفعيل الدوران التلقائي لعدد ${count} لفة.`
    });
  };
  
  // إيقاف الدوران التلقائي
  const handleStopAutoSpin = () => {
    toggleAutoSpin(0);
    
    toast({
      title: 'إيقاف الدوران التلقائي',
      description: 'تم إيقاف الدوران التلقائي.'
    });
  };
  
  // تحديث إعدادات اللعبة
  const handleUpdateSettings = (key: string, value: any) => {
    const newSettings: Partial<typeof gameState.settings> = {
      [key]: value
    };
    
    // تحديث إعدادات الصوت
    if (key === 'soundEnabled') {
      sound.setEnabled(value);
    }
    
    // تحديث سرعة الدوران
    if (key === 'fastSpin') {
      animation.stopAllAnimations();
    }
    
    updateSettings(newSettings);
  };
  
  // العودة إلى الصفحة الرئيسية
  const handleExit = () => {
    navigate('/');
  };
  
  // عرض الفوز
  useEffect(() => {
    if (!gameState || !gameState.lastWin) return;
    
    const { lastWin } = gameState;
    
    // تشغيل صوت الفوز المناسب
    if (lastWin.type === WinType.SMALL) {
      sound.play('win');
    } else if (lastWin.type === WinType.MEDIUM) {
      sound.play('win');
    } else if (lastWin.type === WinType.LARGE) {
      sound.play('bigWin');
    } else if (lastWin.type === WinType.MEGA) {
      sound.play('megaWin');
    }
    
    // عرض رسائل الفوز
    if (lastWin.type === WinType.LARGE || lastWin.type === WinType.MEGA) {
      toast({
        title: 'فوز كبير!',
        description: `لقد ربحت ${lastWin.amount} رقاقة!`,
        variant: 'default',
      });
    }
    
  }, [gameState?.lastWin]);
  
  // تنظيف الأصوات عند مغادرة اللعبة
  useEffect(() => {
    return () => {
      sound.stop('music');
    };
  }, []);
  
  // إذا كانت اللعبة لم تتم تهيئتها بعد
  if (!gameState) {
    return (
      <div className="fishing-game-container">
        <div className="loading-screen">
          <p>جاري تحميل اللعبة...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fishing-game-container">
      {/* خلفية اللعبة المتحركة */}
      <div className="fishing-game-background">
        <div className="water-animation"></div>
        <div className="bubbles-animation"></div>
      </div>
      
      {/* رأس اللعبة */}
      <header className="game-header">
        <h1 className="game-title">صياد السمك</h1>
        <Button 
          variant="destructive" 
          className="exit-button" 
          onClick={handleExit}
        >
          خروج
        </Button>
      </header>
      
      {/* معلومات اللاعب */}
      <div className="player-info">
        <div className="balance-card">
          <span className="balance-label">الرصيد</span>
          <span className="balance-amount">{gameState.balance.toFixed(2)}</span>
        </div>
        
        <div className="bet-card">
          <span className="bet-label">الرهان</span>
          <span className="bet-amount">{gameState.betAmount.toFixed(2)}</span>
        </div>
        
        <div className="win-card">
          <span className="win-label">الفوز</span>
          <span className="win-amount">
            {gameState.lastWin ? gameState.lastWin.amount.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>
      
      {/* منطقة البكرات */}
      <div className="reels-area">
        <div className="reels-container">
          <div className="reels-grid">
            {/* عرض الشريط المتحرك هنا */}
            {/* سيتم تنفيذه لاحقًا */}
          </div>
          
          {/* طبقة خطوط الدفع */}
          <div className="paylines-overlay">
            {/* ستعرض خطوط الدفع عند وجود فوز */}
          </div>
        </div>
        
        {/* اللفات المجانية */}
        {gameState.freeSpins.active && (
          <div className="free-spins-container">
            <div className="free-spins-label">لفات مجانية</div>
            <div className="free-spins-count">{gameState.freeSpins.count}</div>
            
            {gameState.freeSpins.multiplier > 1 && (
              <div className="free-spins-multiplier">
                <span className="multiplier-text">مضاعف</span>
                <span className="multiplier-value">×{gameState.freeSpins.multiplier}</span>
              </div>
            )}
            
            <div className="free-spins-effect"></div>
          </div>
        )}
        
        {/* عرض الفوز */}
        {gameState.gameStatus === 'showing_win' && gameState.lastWin && (
          <div className="win-display">
            <div className={`win-effect ${gameState.lastWin.type.toLowerCase()}-win-effect`}></div>
            
            <div className="win-content">
              <div className="win-text">
                {gameState.lastWin.type === WinType.SMALL && 'فوز!'}
                {gameState.lastWin.type === WinType.MEDIUM && 'فوز جيد!'}
                {gameState.lastWin.type === WinType.LARGE && 'فوز كبير!'}
                {gameState.lastWin.type === WinType.MEGA && 'فوز ضخم!'}
              </div>
              
              <div className="win-multiplier">×{gameState.lastWin.payoutMultiplier.toFixed(2)}</div>
              <div className="win-amount">{gameState.lastWin.amount.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* أزرار التحكم */}
      <div className="game-controls">
        {/* التحكم في الرهان */}
        <div className="bet-controls">
          <span className="control-label">الرهان</span>
          <div className="bet-amount-controls">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleBetChange(gameState.betAmount - 0.5)} 
              disabled={spinning || gameState.betAmount <= gameState.minBet}
            >
              -
            </Button>
            
            <span className="bet-amount">{gameState.betAmount.toFixed(2)}</span>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleBetChange(gameState.betAmount + 0.5)} 
              disabled={spinning || gameState.betAmount >= gameState.maxBet}
            >
              +
            </Button>
          </div>
        </div>
        
        {/* التحكم في خطوط الدفع */}
        <div className="paylines-controls">
          <span className="control-label">خطوط الدفع</span>
          <div className="paylines-count-controls">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handlePaylinesChange(gameState.activePaylines - 1)} 
              disabled={spinning || gameState.activePaylines <= 10}
            >
              -
            </Button>
            
            <span className="paylines-count">{gameState.activePaylines}</span>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handlePaylinesChange(gameState.activePaylines + 1)} 
              disabled={spinning || gameState.activePaylines >= 20}
            >
              +
            </Button>
          </div>
        </div>
        
        {/* أزرار اللعب الرئيسية */}
        <div className="main-controls">
          <Button 
            variant="default" 
            onClick={() => setShowPaytable(true)}
            disabled={spinning}
          >
            جدول المدفوعات
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => setShowSettings(true)}
            disabled={spinning}
          >
            الإعدادات
          </Button>
          
          <Button 
            variant="secondary" 
            className="max-bet-button"
            onClick={() => handleBetChange(gameState.maxBet)}
            disabled={spinning}
          >
            الحد الأقصى
          </Button>
          
          <div className="play-controls">
            <Button 
              variant="default" 
              className="spin-button"
              onClick={handleSpin}
              disabled={spinning}
            >
              دوران
            </Button>
            
            <div className="autospin-container">
              {gameState.isAutoSpin ? (
                <Button 
                  variant="destructive" 
                  className="stop-autospin-button"
                  onClick={handleStopAutoSpin}
                >
                  إيقاف ({gameState.autoSpinCount})
                </Button>
              ) : (
                <>
                  <Button 
                    variant="secondary" 
                    className="autospin-button"
                    onClick={() => setShowAutoSpinOptions(!showAutoSpinOptions)}
                    disabled={spinning}
                  >
                    دوران تلقائي
                  </Button>
                  
                  {showAutoSpinOptions && (
                    <div className="autospin-options">
                      {[5, 10, 25, 50, 100].map(count => (
                        <Button 
                          key={count} 
                          variant="outline" 
                          className="autospin-option"
                          onClick={() => handleAutoSpin(count)}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* مكونات إضافية */}
      {/* سيتم دمج SettingsPanel وPaytableDisplay لاحقًا */}
    </div>
  );
}