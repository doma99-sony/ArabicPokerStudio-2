/**
 * مكون إدارة الأصوات في لعبة صياد السمك
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SoundControl } from '../types';

/**
 * Hook لإدارة الأصوات في اللعبة
 * يسمح بتشغيل وإيقاف أصوات مختلفة مرتبطة بأحداث اللعبة
 */
export const useSound = (): SoundControl => {
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7); // مستوى الصوت الافتراضي 70%
  
  // مراجع لعناصر الصوت
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const bigWinSound = useRef<HTMLAudioElement | null>(null);
  const freeSpinsSound = useRef<HTMLAudioElement | null>(null);
  const buttonClickSound = useRef<HTMLAudioElement | null>(null);
  const fishermanSound = useRef<HTMLAudioElement | null>(null);
  const fishCollectSound = useRef<HTMLAudioElement | null>(null);
  const backgroundMusic = useRef<HTMLAudioElement | null>(null);

  // تهيئة عناصر الصوت عند التحميل
  useEffect(() => {
    // إنشاء عناصر الصوت المختلفة وتكوينها
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    bigWinSound.current = new Audio('/sounds/big-win.mp3');
    freeSpinsSound.current = new Audio('/sounds/free-spins.mp3');
    buttonClickSound.current = new Audio('/sounds/button-click.mp3');
    fishermanSound.current = new Audio('/sounds/fisherman.mp3');
    fishCollectSound.current = new Audio('/sounds/fish-collect.mp3');
    backgroundMusic.current = new Audio('/sounds/underwater-background.mp3');
    
    // إعداد موسيقى الخلفية للتشغيل المتكرر
    if (backgroundMusic.current) {
      backgroundMusic.current.loop = true;
    }
    
    // تعيين مستوى الصوت لجميع العناصر
    const allSounds = [
      spinSound.current,
      winSound.current,
      bigWinSound.current,
      freeSpinsSound.current,
      buttonClickSound.current,
      fishermanSound.current,
      fishCollectSound.current,
      backgroundMusic.current
    ];
    
    allSounds.forEach(sound => {
      if (sound) {
        sound.volume = volume;
      }
    });
    
    // تنظيف عند تفكيك المكون
    return () => {
      allSounds.forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    };
  }, []);
  
  // تحديث مستوى الصوت لجميع العناصر عند تغيير مستوى الصوت
  useEffect(() => {
    const allSounds = [
      spinSound.current,
      winSound.current,
      bigWinSound.current,
      freeSpinsSound.current,
      buttonClickSound.current,
      fishermanSound.current,
      fishCollectSound.current,
      backgroundMusic.current
    ];
    
    allSounds.forEach(sound => {
      if (sound) {
        sound.volume = muted ? 0 : volume;
      }
    });
  }, [volume, muted]);
  
  /**
   * تشغيل موسيقى الخلفية
   */
  const playBackgroundMusic = useCallback(() => {
    if (backgroundMusic.current && !muted) {
      backgroundMusic.current.play().catch(e => console.error("Error playing background music:", e));
    }
  }, [muted]);
  
  /**
   * إيقاف موسيقى الخلفية
   */
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusic.current) {
      backgroundMusic.current.pause();
      backgroundMusic.current.currentTime = 0;
    }
  }, []);
  
  /**
   * تشغيل صوت الدوران
   */
  const playSpinSound = useCallback(() => {
    if (spinSound.current && !muted) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(e => console.error("Error playing spin sound:", e));
    }
  }, [muted]);
  
  /**
   * تشغيل صوت الفوز
   * @param big ما إذا كان فوزًا كبيرًا
   */
  const playWinSound = useCallback((big = false) => {
    if (!muted) {
      const soundToPlay = big ? bigWinSound.current : winSound.current;
      if (soundToPlay) {
        soundToPlay.currentTime = 0;
        soundToPlay.play().catch(e => console.error("Error playing win sound:", e));
      }
    }
  }, [muted]);
  
  /**
   * تشغيل صوت اللفات المجانية
   */
  const playFreeSpinsSound = useCallback(() => {
    if (freeSpinsSound.current && !muted) {
      freeSpinsSound.current.currentTime = 0;
      freeSpinsSound.current.play().catch(e => console.error("Error playing free spins sound:", e));
    }
  }, [muted]);
  
  /**
   * تشغيل صوت الضغط على الزر
   */
  const playButtonClickSound = useCallback(() => {
    if (buttonClickSound.current && !muted) {
      buttonClickSound.current.currentTime = 0;
      buttonClickSound.current.play().catch(e => console.error("Error playing button click sound:", e));
    }
  }, [muted]);
  
  /**
   * تشغيل صوت الصياد
   */
  const playFishermanSound = useCallback(() => {
    if (fishermanSound.current && !muted) {
      fishermanSound.current.currentTime = 0;
      fishermanSound.current.play().catch(e => console.error("Error playing fisherman sound:", e));
    }
  }, [muted]);
  
  /**
   * تشغيل صوت جمع السمك
   */
  const playFishCollectSound = useCallback(() => {
    if (fishCollectSound.current && !muted) {
      fishCollectSound.current.currentTime = 0;
      fishCollectSound.current.play().catch(e => console.error("Error playing fish collect sound:", e));
    }
  }, [muted]);
  
  /**
   * كتم/إلغاء كتم جميع الأصوات
   */
  const toggleMute = useCallback(() => {
    setMuted(prev => !prev);
  }, []);
  
  /**
   * تعيين مستوى الصوت
   * @param newVolume مستوى الصوت الجديد (0.0-1.0)
   */
  const handleSetVolume = useCallback((newVolume: number) => {
    // تقييد مستوى الصوت بين 0 و 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);
  
  // كائن التحكم بالصوت الذي سيتم إرجاعه
  return {
    muted,
    volume,
    toggleMute,
    setVolume: handleSetVolume,
    playSpinSound,
    playWinSound,
    playFreeSpinsSound,
    playButtonClickSound,
    playFishermanSound,
    playFishCollectSound,
    playBackgroundMusic,
    stopBackgroundMusic
  };
};

export default useSound;