// استخدام الصوت في لعبة صياد السمك
import { useState, useEffect, useCallback, useRef } from 'react';
import { SoundControl } from '../types';

// مسارات ملفات الصوت
const SOUND_PATHS = {
  spin: '/audio/fishing-slots/spin.mp3',
  win: '/audio/fishing-slots/win.mp3',
  bigWin: '/audio/fishing-slots/big-win.mp3',
  megaWin: '/audio/fishing-slots/mega-win.mp3',
  scatter: '/audio/fishing-slots/scatter.mp3',
  wild: '/audio/fishing-slots/wild.mp3',
  fishCollect: '/audio/fishing-slots/fish-collect.mp3',
  freeSpin: '/audio/fishing-slots/free-spin.mp3',
  freeSpinEnd: '/audio/fishing-slots/free-spin-end.mp3',
  reel: '/audio/fishing-slots/reel.mp3',
  click: '/audio/fishing-slots/click.mp3',
  music: '/audio/fishing-slots/background-music.mp3',
};

/**
 * Hook لإدارة الصوت في لعبة صياد السمك
 */
export function useSound(initialEnabled = true): SoundControl {
  const [enabled, setEnabled] = useState(initialEnabled);
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});
  
  // تهيئة عناصر الصوت
  useEffect(() => {
    // إنشاء عناصر الصوت لكل مسار
    Object.entries(SOUND_PATHS).forEach(([key, path]) => {
      const audio = new Audio(path);
      
      // ضبط خصائص الصوت
      if (key === 'music') {
        audio.loop = true;
        audio.volume = 0.3;
      } else {
        audio.volume = 0.5;
      }
      
      audioElements.current[key] = audio;
    });
    
    // تنظيف عند إزالة المكون
    return () => {
      Object.values(audioElements.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioElements.current = {};
    };
  }, []);
  
  // تشغيل صوت
  const play = useCallback((sound: string) => {
    if (!enabled || !audioElements.current[sound]) return;
    
    try {
      const audio = audioElements.current[sound];
      
      // إعادة ضبط الصوت إلى البداية إذا كان يعمل بالفعل
      audio.currentTime = 0;
      
      // تشغيل الصوت
      audio.play().catch(err => {
        console.warn(`Error playing sound ${sound}:`, err);
      });
    } catch (error) {
      console.error(`Error playing ${sound}:`, error);
    }
  }, [enabled]);
  
  // إيقاف صوت
  const stop = useCallback((sound: string) => {
    if (!audioElements.current[sound]) return;
    
    try {
      const audio = audioElements.current[sound];
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      console.error(`Error stopping ${sound}:`, error);
    }
  }, []);
  
  // ضبط حالة تمكين الصوت
  const setIsEnabled = useCallback((isEnabled: boolean) => {
    setEnabled(isEnabled);
    
    // إيقاف/تشغيل الموسيقى بناءً على الحالة
    if (isEnabled) {
      if (audioElements.current.music) {
        audioElements.current.music.play().catch(err => {
          console.warn('Error playing background music:', err);
        });
      }
    } else {
      // إيقاف جميع الأصوات
      Object.values(audioElements.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, []);
  
  // الحصول على حالة تمكين الصوت
  const isEnabled = useCallback(() => {
    return enabled;
  }, [enabled]);
  
  return {
    play,
    stop,
    setEnabled: setIsEnabled,
    isEnabled
  };
}