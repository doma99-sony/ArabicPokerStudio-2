import React, { useEffect, useState } from 'react';
import { GoldCoinIcon, AnkhIcon } from '../assets/egyptian-icons';
import EgyptianFrame from './EgyptianFrame';
import AnimatedCoinCounter, { WinType } from './AnimatedCoinCounter';

interface EgyptianScorePanelProps {
  balance: number;
  bet: number;
  win: number;
  maxBet?: number;
  minBet?: number;
  onBetChange?: (newBet: number) => void;
  onMaxBet?: () => void;
  className?: string;
  jackpot?: number;
  freeSpin?: number;
  showJackpot?: boolean;
  showFreeSpin?: boolean;
  lastWinType?: WinType | null;
}

/**
 * مكون لوحة النتائج المصرية
 * يعرض رصيد اللاعب والرهان والربح بتصميم مصري قديم
 */
const EgyptianScorePanel: React.FC<EgyptianScorePanelProps> = ({
  balance,
  bet,
  win,
  maxBet = 100,
  minBet = 1,
  onBetChange,
  onMaxBet,
  className = '',
  jackpot = 0,
  freeSpin = 0,
  showJackpot = false,
  showFreeSpin = false,
  lastWinType = null
}) => {
  const [previousWin, setPreviousWin] = useState<number>(0);
  const [showWinAnimation, setShowWinAnimation] = useState<boolean>(false);
  
  // عند تغير قيمة الربح، عرض الرسوم المتحركة
  useEffect(() => {
    if (win > 0 && win !== previousWin) {
      setPreviousWin(win);
      setShowWinAnimation(true);
    } else if (win === 0) {
      setPreviousWin(0);
      setShowWinAnimation(false);
    }
  }, [win, previousWin]);
  
  // زيادة قيمة الرهان
  const increaseBet = () => {
    if (!onBetChange) return;
    
    const newBet = Math.min(bet + 1, maxBet);
    onBetChange(newBet);
  };
  
  // خفض قيمة الرهان
  const decreaseBet = () => {
    if (!onBetChange) return;
    
    const newBet = Math.max(bet - 1, minBet);
    onBetChange(newBet);
  };
  
  // تنسيق العدد للعرض (إضافة فواصل للآلاف)
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  return (
    <div className={`egyptian-score-panel ${className}`}>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {/* رصيد اللاعب */}
        <EgyptianFrame variant="primary" size="medium" className="p-2">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-yellow-200 uppercase mb-1">الرصيد</div>
            <div className="flex items-center justify-center">
              <GoldCoinIcon width={16} height={16} className="mr-1" />
              <span className="text-lg font-bold text-yellow-100">{formatNumber(balance)}</span>
            </div>
          </div>
        </EgyptianFrame>
        
        {/* الرهان */}
        <EgyptianFrame variant="secondary" size="medium" className="p-2">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-yellow-200 uppercase mb-1">الرهان</div>
            <div className="flex items-center justify-center space-x-2">
              <button 
                onClick={decreaseBet}
                className="w-6 h-6 flex items-center justify-center text-yellow-100 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                disabled={bet <= minBet}
              >
                -
              </button>
              <span className="text-lg font-bold text-yellow-100">{bet}</span>
              <button 
                onClick={increaseBet}
                className="w-6 h-6 flex items-center justify-center text-yellow-100 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                disabled={bet >= maxBet}
              >
                +
              </button>
            </div>
            {onMaxBet && (
              <button 
                onClick={onMaxBet}
                className="mt-1 text-xs text-yellow-400 hover:text-yellow-300 bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded transition-colors"
              >
                الحد الأقصى
              </button>
            )}
          </div>
        </EgyptianFrame>
        
        {/* الربح */}
        <EgyptianFrame 
          variant={showWinAnimation ? 'gold' : 'primary'} 
          size="medium" 
          className="p-2"
          animated={showWinAnimation}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-xs text-yellow-200 uppercase mb-1">الربح</div>
            {showWinAnimation ? (
              <AnimatedCoinCounter
                initialValue={0}
                targetValue={win}
                duration={1.5}
                winType={lastWinType}
                size="small"
              />
            ) : (
              <div className="flex items-center justify-center">
                <GoldCoinIcon width={16} height={16} className="mr-1" />
                <span className="text-lg font-bold text-yellow-100">{formatNumber(win)}</span>
              </div>
            )}
          </div>
        </EgyptianFrame>
      </div>
      
      {/* عناصر إضافية (الجاكبوت والدورات المجانية) */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        {showJackpot && (
          <EgyptianFrame variant="royal" size="small" className="p-1">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="text-xs text-purple-200">جاكبوت</div>
                <div className="flex items-center">
                  <GoldCoinIcon width={14} height={14} className="mr-1" color="#FFD700" />
                  <span className="text-sm font-bold text-yellow-300">{formatNumber(jackpot)}</span>
                </div>
              </div>
            </div>
          </EgyptianFrame>
        )}
        
        {showFreeSpin && (
          <EgyptianFrame variant="gold" size="small" className="p-1">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="text-xs text-yellow-200">دورات مجانية</div>
                <div className="flex items-center">
                  <AnkhIcon width={14} height={14} className="mr-1" color="#FFD700" />
                  <span className="text-sm font-bold text-yellow-100">{freeSpin}</span>
                </div>
              </div>
            </div>
          </EgyptianFrame>
        )}
      </div>
    </div>
  );
};

export default EgyptianScorePanel;