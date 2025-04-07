/**
 * خطاف إدارة الرسوم المتحركة للعبة صياد السمك
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, AnimationSettings } from '../types';

/**
 * تعريف حالات الرسوم المتحركة المختلفة
 */
enum AnimationState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  WIN = 'WIN',
  REEL_STOP = 'REEL_STOP',
  COLLECT = 'COLLECT',
  FREE_SPINS_START = 'FREE_SPINS_START',
  FREE_SPINS_END = 'FREE_SPINS_END',
}

/**
 * تعريف سرعات الرسوم المتحركة
 */
const ANIMATION_SPEEDS = {
  SLOW: 1.5,
  NORMAL: 1,
  FAST: 0.7,
  VERY_FAST: 0.5,
};

/**
 * دالة لإدارة الرسوم المتحركة في اللعبة
 *
 * @param gameState حالة اللعبة الحالية
 * @param onAnimationComplete دالة تُستدعى عند اكتمال الرسوم المتحركة
 * @returns حالة الرسوم المتحركة ودوال التحكم
 */
export const useAnimation = (
  gameState: GameState,
  onAnimationComplete?: (type: string) => void
) => {
  // حالة الرسم المتحرك الحالية
  const [animationState, setAnimationState] = useState<AnimationState>(AnimationState.IDLE);
  
  // إعدادات الرسوم المتحركة
  const [settings, setSettings] = useState<AnimationSettings>({
    speed: ANIMATION_SPEEDS.NORMAL,
    effects: true,
    quality: 'high',
  });
  
  // مؤقت للرسوم المتحركة
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // تعقب تغييرات حالة اللعبة لتحديث حالة الرسوم المتحركة
  useEffect(() => {
    // إلغاء أي مؤقتات سابقة
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    // تحديث حالة الرسم المتحرك بناءً على حالة اللعبة
    switch (gameState) {
      case GameState.SPINNING:
        setAnimationState(AnimationState.SPINNING);
        break;
      case GameState.WIN_ANIMATION:
        setAnimationState(AnimationState.WIN);
        // تعيين مؤقت لإنهاء رسوم متحركة الفوز
        animationTimerRef.current = setTimeout(() => {
          setAnimationState(AnimationState.IDLE);
          if (onAnimationComplete) {
            onAnimationComplete('win');
          }
        }, 3000 * settings.speed);
        break;
      case GameState.FREE_SPINS:
        setAnimationState(AnimationState.FREE_SPINS_START);
        // تعيين مؤقت لإنهاء رسوم متحركة بدء الدورات المجانية
        animationTimerRef.current = setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete('freespins_start');
          }
        }, 2000 * settings.speed);
        break;
      default:
        // تعيين حالة الخمول كافتراضي
        setAnimationState(AnimationState.IDLE);
    }
    
    // تنظيف المؤقت عند إلغاء تحميل المكون
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [gameState, onAnimationComplete, settings.speed]);
  
  /**
   * تشغيل الرسوم المتحركة للفوز بقيمة معينة
   * @param amount قيمة الفوز
   */
  const playWinAnimation = useCallback((amount: number) => {
    setAnimationState(AnimationState.WIN);
    
    // تعيين مؤقت لإنهاء الرسوم المتحركة بعد فترة
    const duration = amount > 50 ? 5000 : 3000; // عرض أطول للفوز الكبير
    
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    animationTimerRef.current = setTimeout(() => {
      setAnimationState(AnimationState.IDLE);
      if (onAnimationComplete) {
        onAnimationComplete('win');
      }
    }, duration * settings.speed);
  }, [onAnimationComplete, settings.speed]);
  
  /**
   * تشغيل رسوم متحركة لإيقاف البكرة
   * @param reelIndex رقم البكرة
   */
  const playReelStopAnimation = useCallback((reelIndex: number) => {
    setAnimationState(AnimationState.REEL_STOP);
    
    // إعادة التعيين إلى الحالة السابقة بعد وقت قصير
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    animationTimerRef.current = setTimeout(() => {
      setAnimationState(prevState => 
        prevState === AnimationState.REEL_STOP ? AnimationState.SPINNING : prevState
      );
      
      if (onAnimationComplete) {
        onAnimationComplete(`reel_stop_${reelIndex}`);
      }
    }, 300 * settings.speed);
  }, [onAnimationComplete, settings.speed]);
  
  /**
   * تشغيل رسوم متحركة لجمع الفوز
   */
  const playCollectAnimation = useCallback(() => {
    setAnimationState(AnimationState.COLLECT);
    
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    animationTimerRef.current = setTimeout(() => {
      setAnimationState(AnimationState.IDLE);
      if (onAnimationComplete) {
        onAnimationComplete('collect');
      }
    }, 1500 * settings.speed);
  }, [onAnimationComplete, settings.speed]);
  
  /**
   * تغيير سرعة الرسوم المتحركة
   * @param speed مستوى السرعة
   */
  const setAnimationSpeed = useCallback((speed: 'SLOW' | 'NORMAL' | 'FAST' | 'VERY_FAST') => {
    setSettings(prev => ({
      ...prev,
      speed: ANIMATION_SPEEDS[speed]
    }));
  }, []);
  
  /**
   * تبديل تفعيل المؤثرات المرئية
   */
  const toggleEffects = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      effects: !prev.effects
    }));
  }, []);
  
  /**
   * تعيين جودة الرسومات
   * @param quality مستوى الجودة
   */
  const setQuality = useCallback((quality: 'low' | 'medium' | 'high') => {
    setSettings(prev => ({
      ...prev,
      quality
    }));
  }, []);
  
  // تنظيف المؤقت عند إزالة المكون
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);
  
  return {
    animationState,
    settings,
    playWinAnimation,
    playReelStopAnimation,
    playCollectAnimation,
    setAnimationSpeed,
    toggleEffects,
    setQuality,
  };
};

export default useAnimation;