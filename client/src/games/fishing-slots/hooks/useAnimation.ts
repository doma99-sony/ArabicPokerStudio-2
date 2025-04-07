/**
 * مكون إدارة حالة الرسوم المتحركة في لعبة صياد السمك
 */

import { useState, useCallback } from 'react';
import { AnimationSettings } from '../types';

/**
 * Hook لإدارة إعدادات الرسوم المتحركة في اللعبة
 * يسمح بتخصيص سرعة وجودة الرسوم المتحركة
 */
export const useAnimation = (): AnimationSettings => {
  const [speed, setSpeed] = useState<number>(1); // سرعة عادية افتراضيًا
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium'); // جودة متوسطة افتراضيًا

  /**
   * تعيين سرعة الرسوم المتحركة
   * @param newSpeed السرعة الجديدة (0.5-2.0)
   */
  const handleSetSpeed = useCallback((newSpeed: number) => {
    // تقييد السرعة بين 0.5 (بطيء) و 2.0 (سريع)
    const clampedSpeed = Math.max(0.5, Math.min(2.0, newSpeed));
    setSpeed(clampedSpeed);
  }, []);

  /**
   * تعيين جودة الرسوم المتحركة
   * @param newQuality الجودة الجديدة
   */
  const handleSetQuality = useCallback((newQuality: 'low' | 'medium' | 'high') => {
    setQuality(newQuality);
  }, []);

  // كائن الإعدادات الذي سيتم إرجاعه
  return {
    speed,
    quality,
    setSpeed: handleSetSpeed,
    setQuality: handleSetQuality
  };
};

export default useAnimation;