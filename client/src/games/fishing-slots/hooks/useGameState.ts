// استخدام حالة لعبة صياد السمك
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import useAuth from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';

import { 
  FishingGameState, 
  GameStatus, 
  SpinResult,
  FreeSpinsState,
  WinType
} from '../types';

import { 
  paylines,
  getActivePaylines
} from '../utils/paylines';

import { 
  symbols,
  createRandomReels
} from '../utils/symbols';

import {
  initializeGameState,
  createSpinResult,
  updateFreeSpinsState,
  calculateFishCollectionWin
} from '../utils/game-logic';

/**
 * Hook لإدارة حالة لعبة صياد السمك
 */
export function useGameState(initialBet = 1, initialActivePaylines = 10) {
  const [initialized, setInitialized] = useState(false);
  const [gameState, setGameState] = useState<FishingGameState | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [autoSpinEnabled, setAutoSpinEnabled] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const { toast } = useToast();
  const auth = useAuth();
  
  // تهيئة اللعبة
  useEffect(() => {
    if (!auth.userData || initialized) return;
    
    const balance = auth.userData.chips || 1000;
    
    setGameState(
      initializeGameState(initialBet, balance)
    );
    
    setInitialized(true);
  }, [auth.userData, initialized, initialBet]);
  
  // تحديث عدد خطوط الدفع النشطة
  const updateActivePaylines = useCallback((count: number) => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      // التأكد من أن العدد ضمن النطاق المسموح (10-20)
      const newCount = Math.max(10, Math.min(20, count));
      
      return {
        ...prev,
        activePaylines: newCount
      };
    });
  }, [gameState]);
  
  // تحديث قيمة الرهان
  const updateBetAmount = useCallback((amount: number) => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      // التأكد من أن المبلغ ضمن النطاق المسموح
      const newAmount = Math.max(prev.minBet, Math.min(prev.maxBet, amount));
      
      return {
        ...prev,
        betAmount: newAmount
      };
    });
  }, [gameState]);
  
  // تحديث رصيد اللاعب
  const updateBalance = useCallback(async (amount: number) => {
    if (!gameState || !auth.userData) return;
    
    const newBalance = gameState.balance + amount;
    
    // تحديث الرصيد في حالة اللعبة
    setGameState(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        balance: newBalance
      };
    });
    
    // تحديث الرصيد في قاعدة البيانات
    try {
      const response = await apiRequest('/api/user/chips', {
        method: 'POST',
        data: { amount }
      });
      
      if (response && auth.updateUserData) {
        auth.updateUserData({
          ...auth.userData,
          chips: newBalance
        });
      }
    } catch (error) {
      console.error('Error updating chips balance:', error);
      
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث رصيدك',
        variant: 'destructive'
      });
      
      // إعادة الرصيد إلى القيمة السابقة في حالة الخطأ
      setGameState(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          balance: gameState.balance
        };
      });
    }
  }, [gameState, auth, toast]);
  
  // دوران البكرات
  const spin = useCallback(async () => {
    if (!gameState || spinning) return;
    
    // التحقق من وجود رصيد كافٍ
    if (gameState.balance < gameState.betAmount) {
      toast({
        title: 'رصيد غير كافٍ',
        description: 'يرجى إيداع المزيد من الرقائق للمتابعة',
        variant: 'destructive'
      });
      return;
    }
    
    // بدء الدوران
    setSpinning(true);
    setGameState(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        gameStatus: GameStatus.SPINNING,
        lastWin: null
      };
    });
    
    // خصم مبلغ الرهان إذا لم نكن في وضع اللفات المجانية
    if (!gameState.freeSpins.active) {
      await updateBalance(-gameState.betAmount);
    }
    
    // مهلة لمحاكاة دوران البكرات
    setTimeout(() => {
      const spinResult = createSpinResult(
        gameState.activePaylines,
        gameState.betAmount,
        gameState.freeSpins.active ? gameState.freeSpins : undefined
      );
      
      // تحديث حالة اللفات المجانية إذا لزم الأمر
      const updatedFreeSpins = updateFreeSpinsState(
        gameState.freeSpins,
        spinResult.triggeredFreeSpins,
        !!spinResult.collectedFisherman
      );
      
      // حساب الفوز الكلي (بما في ذلك جمع رموز الأسماك إذا كنا في وضع اللفات المجانية)
      let totalWin = spinResult.totalWin;
      
      // إذا تم جمع قيم الأسماك في اللفات المجانية
      if (spinResult.collectedFishSymbols && spinResult.collectedFishSymbols.length > 0) {
        const fishWin = calculateFishCollectionWin(
          spinResult.collectedFishSymbols,
          updatedFreeSpins.multiplier
        );
        
        totalWin += fishWin;
        
        // تحديث إجمالي الفوز في اللفات المجانية
        updatedFreeSpins.totalWin += totalWin;
      }
      
      // إضافة المكسب إلى الرصيد
      if (totalWin > 0) {
        updateBalance(totalWin);
      }
      
      // إظهار الفوز إذا كان أكبر من الصفر
      if (totalWin > 0) {
        // تحديد نوع الفوز
        let winType = WinType.SMALL;
        
        const multiplier = totalWin / gameState.betAmount;
        
        if (multiplier >= 5 && multiplier < 20) winType = WinType.MEDIUM;
        else if (multiplier >= 20 && multiplier < 50) winType = WinType.LARGE;
        else if (multiplier >= 50) winType = WinType.MEGA;
        
        setGameState(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            gameStatus: GameStatus.SHOWING_WIN,
            lastWin: {
              type: winType,
              amount: totalWin,
              payoutMultiplier: multiplier
            },
            totalWin: prev.totalWin + totalWin,
            freeSpins: updatedFreeSpins,
            visibleSymbols: spinResult.visibleSymbols
          };
        });
        
        // مهلة لعرض الفوز
        setTimeout(() => {
          // انتهاء عرض الفوز
          continueAfterWin(updatedFreeSpins);
        }, 3000);
      } else {
        // لا يوجد فوز، الانتقال مباشرة إلى الحالة التالية
        continueAfterWin(updatedFreeSpins);
      }
      
      // استمرار اللعبة بعد عرض الفوز أو عند عدم وجود فوز
      function continueAfterWin(freeSpinsState: FreeSpinsState) {
        // التحقق مما إذا كانت اللفات المجانية قد انتهت للتو
        const justEndedFreeSpins = gameState.freeSpins.active && !freeSpinsState.active;
        
        // إذا انتهت اللفات المجانية للتو، عرض إجمالي الفوز
        if (justEndedFreeSpins) {
          setGameState(prev => {
            if (!prev) return prev;
            
            return {
              ...prev,
              gameStatus: GameStatus.SHOWING_WIN,
              lastWin: {
                type: WinType.MEGA,
                amount: freeSpinsState.totalWin,
                payoutMultiplier: freeSpinsState.totalWin / gameState.betAmount
              },
              visibleSymbols: spinResult.visibleSymbols,
              freeSpins: freeSpinsState
            };
          });
          
          // مهلة إضافية لعرض إجمالي الفوز في اللفات المجانية
          setTimeout(() => {
            completeSpinCycle(freeSpinsState);
          }, 3000);
        } else {
          completeSpinCycle(freeSpinsState);
        }
      }
      
      // إكمال دورة الدوران
      function completeSpinCycle(freeSpinsState: FreeSpinsState) {
        setGameState(prev => {
          if (!prev) return prev;
          
          // تحديد الحالة التالية
          let nextStatus = GameStatus.IDLE;
          
          if (freeSpinsState.active) {
            nextStatus = GameStatus.FREE_SPINS;
          } else if (autoSpinEnabled && autoSpinCount > 0) {
            nextStatus = GameStatus.IDLE;
          } else {
            nextStatus = GameStatus.IDLE;
          }
          
          return {
            ...prev,
            gameStatus: nextStatus,
            visibleSymbols: spinResult.visibleSymbols,
            freeSpins: freeSpinsState
          };
        });
        
        setSpinning(false);
        
        // إذا كانت اللفات المجانية مفعلة، تلقائيًا بدء لفة جديدة بعد مهلة قصيرة
        if (freeSpinsState.active) {
          setTimeout(() => {
            spin();
          }, 1000);
        } else if (autoSpinEnabled && autoSpinCount > 0) {
          // إذا كان الدوران التلقائي مفعلاً، تقليل العداد وبدء لفة جديدة
          setAutoSpinCount(prev => prev - 1);
          
          setTimeout(() => {
            spin();
          }, 1000);
        }
      }
    }, gameState.settings.fastSpin ? 500 : 2000);
  }, [
    gameState, 
    spinning, 
    autoSpinEnabled, 
    autoSpinCount, 
    toast, 
    updateBalance
  ]);
  
  // تشغيل/إيقاف الدوران التلقائي
  const toggleAutoSpin = useCallback((count?: number) => {
    if (!gameState) return;
    
    if (count && count > 0) {
      setAutoSpinEnabled(true);
      setAutoSpinCount(count);
      
      // بدء الدوران التلقائي إذا لم تكن هناك لفة جارية
      if (!spinning && gameState.gameStatus === GameStatus.IDLE) {
        setTimeout(() => {
          spin();
        }, 500);
      }
    } else {
      setAutoSpinEnabled(false);
      setAutoSpinCount(0);
    }
  }, [gameState, spinning, spin]);
  
  // تحديث إعدادات اللعبة
  const updateSettings = useCallback((settings: Partial<typeof gameState.settings>) => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        settings: {
          ...prev.settings,
          ...settings
        }
      };
    });
  }, [gameState]);
  
  return {
    gameState,
    spinning,
    autoSpinEnabled,
    autoSpinCount,
    updateActivePaylines,
    updateBetAmount,
    updateBalance,
    spin,
    toggleAutoSpin,
    updateSettings
  };
}