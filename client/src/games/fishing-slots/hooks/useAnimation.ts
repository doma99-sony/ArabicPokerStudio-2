// استخدام الرسوم المتحركة في لعبة صياد السمك
import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimationSettings } from '../types';

/**
 * Hook لإدارة الرسوم المتحركة في لعبة صياد السمك
 */
export function useAnimation(fastMode = false) {
  // إعدادات الرسوم المتحركة
  const [settings, setSettings] = useState<AnimationSettings>({
    duration: fastMode ? 500 : 1000,
    reelSpinDuration: fastMode ? 500 : 1500,
    reelStopInterval: fastMode ? 100 : 300,
    winDisplayDuration: fastMode ? 1500 : 3000,
    winEffectDuration: fastMode ? 1000 : 2000
  });
  
  // الحالة الحالية للرسوم المتحركة
  const [spinning, setSpinning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [showingWin, setShowingWin] = useState(false);
  
  // مراجع لمؤقتات الرسوم المتحركة
  const timers = useRef<Record<string, NodeJS.Timeout>>({});
  
  // تغيير وضع السرعة
  useEffect(() => {
    setSettings({
      duration: fastMode ? 500 : 1000,
      reelSpinDuration: fastMode ? 500 : 1500,
      reelStopInterval: fastMode ? 100 : 300,
      winDisplayDuration: fastMode ? 1500 : 3000,
      winEffectDuration: fastMode ? 1000 : 2000
    });
  }, [fastMode]);
  
  // مسح جميع المؤقتات عند إزالة المكون
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(timer => clearTimeout(timer));
      timers.current = {};
    };
  }, []);
  
  // بدء رسوم متحركة لدوران البكرات
  const startSpinAnimation = useCallback((onComplete?: () => void) => {
    setSpinning(true);
    setStopping(false);
    
    // مسح المؤقت السابق إذا وجد
    if (timers.current.spin) {
      clearTimeout(timers.current.spin);
    }
    
    // إنشاء مؤقت جديد لانتهاء الدوران
    timers.current.spin = setTimeout(() => {
      setSpinning(false);
      if (onComplete) onComplete();
    }, settings.reelSpinDuration);
  }, [settings.reelSpinDuration]);
  
  // بدء رسوم متحركة لإيقاف البكرات
  const startStopAnimation = useCallback((onComplete?: () => void, reelCount = 5) => {
    setStopping(true);
    
    // مسح المؤقت السابق إذا وجد
    if (timers.current.stop) {
      clearTimeout(timers.current.stop);
    }
    
    // إنشاء مؤقت جديد لانتهاء الإيقاف
    timers.current.stop = setTimeout(() => {
      setStopping(false);
      if (onComplete) onComplete();
    }, settings.reelStopInterval * reelCount);
  }, [settings.reelStopInterval]);
  
  // عرض رسوم متحركة للفوز
  const showWinAnimation = useCallback((onComplete?: () => void, duration?: number) => {
    setShowingWin(true);
    
    // مسح المؤقت السابق إذا وجد
    if (timers.current.win) {
      clearTimeout(timers.current.win);
    }
    
    // إنشاء مؤقت جديد لانتهاء عرض الفوز
    const winDuration = duration || settings.winDisplayDuration;
    
    timers.current.win = setTimeout(() => {
      setShowingWin(false);
      if (onComplete) onComplete();
    }, winDuration);
  }, [settings.winDisplayDuration]);
  
  // تطبيق رسوم متحركة على عنصر DOM
  const animateElement = useCallback((
    element: HTMLElement | null, 
    animation: string,
    duration = settings.duration,
    onComplete?: () => void
  ) => {
    if (!element) return;
    
    // إضافة فئة الرسوم المتحركة
    element.style.animationDuration = `${duration}ms`;
    element.classList.add(animation);
    
    // إنشاء معرف فريد للمؤقت
    const timerId = `animate_${Date.now()}`;
    
    // مسح أي مؤقت سابق لهذا العنصر
    if (timers.current[timerId]) {
      clearTimeout(timers.current[timerId]);
    }
    
    // إنشاء مؤقت جديد لإزالة فئة الرسوم المتحركة
    timers.current[timerId] = setTimeout(() => {
      if (element) {
        element.classList.remove(animation);
      }
      
      // حذف المؤقت بعد الانتهاء
      delete timers.current[timerId];
      
      if (onComplete) onComplete();
    }, duration);
  }, [settings.duration]);
  
  // إيقاف جميع الرسوم المتحركة
  const stopAllAnimations = useCallback(() => {
    setSpinning(false);
    setStopping(false);
    setShowingWin(false);
    
    // مسح جميع المؤقتات
    Object.values(timers.current).forEach(timer => clearTimeout(timer));
    timers.current = {};
  }, []);
  
  return {
    settings,
    spinning,
    stopping,
    showingWin,
    startSpinAnimation,
    startStopAnimation,
    showWinAnimation,
    animateElement,
    stopAllAnimations
  };
}