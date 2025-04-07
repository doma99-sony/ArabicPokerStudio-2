/**
 * خطاف للتحكم بالأصوات في لعبة صياد السمك
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SoundControl } from '../types';
import { SOUNDS } from '../assets/images';

/**
 * خطاف للتحكم بالأصوات في اللعبة
 * @param initialMuted هل الصوت مكتوم في البداية
 * @param initialVolume مستوى الصوت الابتدائي (0-1)
 * @returns حالة وتحكم الصوت
 */
export const useSound = (initialMuted: boolean = false, initialVolume: number = 0.5): SoundControl => {
  // حالة كتم الصوت
  const [muted, setMuted] = useState<boolean>(initialMuted);
  // مستوى الصوت (0-1)
  const [volume, setVolumeState] = useState<number>(Math.min(Math.max(initialVolume, 0), 1));
  
  // مخزن الأصوات
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  // تحميل الأصوات عند بدء التشغيل
  useEffect(() => {
    // تهيئة وتحميل جميع الأصوات
    Object.entries(SOUNDS).forEach(([name, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = volume;
      soundsRef.current[name] = audio;
    });
    
    // تنظيف الأصوات عند إزالة المكون
    return () => {
      Object.values(soundsRef.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      soundsRef.current = {};
    };
  }, []);
  
  // تحديث مستوى الصوت للأصوات المحملة
  useEffect(() => {
    Object.values(soundsRef.current).forEach(audio => {
      audio.volume = muted ? 0 : volume;
    });
  }, [volume, muted]);
  
  /**
   * تشغيل صوت معين
   * @param soundName اسم الصوت المراد تشغيله
   */
  const playSound = useCallback((soundName: string) => {
    if (muted) return;
    
    const audio = soundsRef.current[soundName];
    if (audio) {
      // إعادة تعيين الصوت للتشغيل من البداية
      audio.currentTime = 0;
      
      // وعد لتشغيل الصوت (للتعامل مع الأخطاء المحتملة)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('خطأ في تشغيل الصوت:', error);
        });
      }
    }
  }, [muted]);
  
  /**
   * تبديل حالة كتم الصوت
   */
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);
  
  /**
   * تعيين مستوى الصوت
   * @param value مستوى الصوت الجديد (0-1)
   */
  const setVolume = useCallback((value: number) => {
    // التأكد من أن القيمة ضمن النطاق المسموح (0-1)
    const normalizedValue = Math.min(Math.max(value, 0), 1);
    setVolumeState(normalizedValue);
  }, []);
  
  /**
   * تشغيل صوت الخلفية بشكل متكرر
   * @param soundName اسم صوت الخلفية
   */
  const playBackgroundMusic = useCallback((soundName: string) => {
    if (muted) return;
    
    const audio = soundsRef.current[soundName];
    if (audio) {
      audio.loop = true;
      audio.play().catch(error => {
        console.error('خطأ في تشغيل موسيقى الخلفية:', error);
      });
    }
  }, [muted]);
  
  /**
   * إيقاف صوت الخلفية
   * @param soundName اسم صوت الخلفية
   */
  const stopBackgroundMusic = useCallback((soundName: string) => {
    const audio = soundsRef.current[soundName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);
  
  // بدء تشغيل موسيقى الخلفية عند تحميل المكون
  useEffect(() => {
    if (!muted) {
      playBackgroundMusic('BACKGROUND_MUSIC');
    }
    
    return () => {
      stopBackgroundMusic('BACKGROUND_MUSIC');
    };
  }, [muted, playBackgroundMusic, stopBackgroundMusic]);
  
  return {
    muted,
    volume,
    playSound,
    toggleMute,
    setVolume
  };
};

export default useSound;