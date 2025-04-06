import { useState, useEffect, useCallback, useRef } from 'react';

// قاموس لمسارات الأصوات المختلفة
const SOUND_PATHS: Record<string, string> = {
  // أصوات البوكر
  shuffle: '/sounds/poker/shuffle.mp3',
  check: '/sounds/poker/check.mp3',
  call: '/sounds/poker/chips.mp3',
  bet: '/sounds/poker/chips.mp3',
  raise: '/sounds/poker/chips_stack.mp3',
  fold: '/sounds/poker/fold.mp3',
  all_in: '/sounds/poker/all_in.mp3',
  win_hand: '/sounds/poker/win_hand.mp3',
  card_flip: '/sounds/poker/card_flip.mp3',
  
  // أصوات الصاروخ العرباوي
  crash: '/sounds/rocket/crash.mp3',
  bet_placed: '/sounds/rocket/bet_placed.mp3',
  cash_out: '/sounds/rocket/cash_out.mp3',
  rocket_start: '/sounds/rocket/rocket_start.mp3',
  rocket_flying: '/sounds/rocket/rocket_flying.mp3',
  win: '/sounds/common/win.mp3',
  
  // أصوات عامة
  click: '/sounds/common/click.mp3',
  error: '/sounds/common/error.mp3',
  achievement: '/sounds/common/achievement.mp3',
  notification: '/sounds/common/notification.mp3',
};

// واجهة نظام الصوت
export interface UseSoundSystem {
  playSound: (soundId: string) => void;
  stopSound: (soundId: string) => void;
  toggleMute: () => void;
  isMuted: boolean;
  isPlaying: (soundId: string) => boolean;
  volume: number;
  setVolume: (volume: number) => void;
}

// صدى نظام الصوت المستخدم في المشروع
export function useSoundSystem(): UseSoundSystem {
  const [isMuted, setIsMuted] = useState(() => {
    // استرجاع حالة كتم الصوت من التخزين المحلي
    const storedMute = localStorage.getItem('isMuted');
    return storedMute === 'true';
  });
  
  const [volume, setVolumeState] = useState(() => {
    // استرجاع مستوى الصوت من التخزين المحلي
    const storedVolume = localStorage.getItem('soundVolume');
    return storedVolume ? parseFloat(storedVolume) : 0.5; // القيمة الافتراضية هي 0.5
  });
  
  // مرجع لتخزين ملفات الصوت النشطة
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  
  // تغيير حالة كتم الصوت
  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => {
      const newMuted = !prevMuted;
      localStorage.setItem('isMuted', newMuted.toString());
      return newMuted;
    });
  }, []);
  
  // ضبط مستوى الصوت
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    localStorage.setItem('soundVolume', newVolume.toString());
    
    // تحديث مستوى الصوت لجميع الأصوات النشطة
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = newVolume;
    });
  }, []);
  
  // تشغيل صوت
  const playSound = useCallback((soundId: string) => {
    if (isMuted) return; // لا تشغل الصوت إذا كان الصوت مكتوماً
    
    const soundPath = SOUND_PATHS[soundId];
    if (!soundPath) {
      console.warn(`الصوت غير موجود: ${soundId}`);
      return;
    }
    
    // إنشاء عنصر صوت جديد أو إعادة استخدام الموجود
    let audio = audioRefs.current[soundId];
    if (!audio) {
      audio = new Audio(soundPath);
      audioRefs.current[soundId] = audio;
    } else {
      // إعادة ضبط الصوت الموجود للتشغيل من البداية
      audio.pause();
      audio.currentTime = 0;
    }
    
    audio.volume = volume;
    audio.play().catch(error => {
      console.error(`خطأ في تشغيل الصوت ${soundId}:`, error);
    });
  }, [isMuted, volume]);
  
  // إيقاف صوت
  const stopSound = useCallback((soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);
  
  // التحقق مما إذا كان الصوت قيد التشغيل
  const isPlaying = useCallback((soundId: string) => {
    const audio = audioRefs.current[soundId];
    return !!audio && !audio.paused;
  }, []);
  
  // تنظيف عند إلغاء تحميل المكون
  useEffect(() => {
    return () => {
      // إيقاف جميع الأصوات عند إلغاء تحميل المكون
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
      audioRefs.current = {};
    };
  }, []);
  
  return {
    playSound,
    stopSound,
    toggleMute,
    isMuted,
    isPlaying,
    volume,
    setVolume,
  };
}