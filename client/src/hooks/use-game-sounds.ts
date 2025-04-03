import { useState, useEffect, useCallback } from 'react';

// أنواع الأصوات المتاحة في اللعبة
export type SoundType = 
  | 'turn_alert'        // تنبيه دورك
  | 'win'               // الفوز
  | 'lose'              // الخسارة
  | 'fold'              // انسحاب
  | 'check'             // تحقق
  | 'call'              // مجاراة
  | 'raise'             // زيادة
  | 'all_in'            // المجازفة بكل الرقائق
  | 'card_deal'         // توزيع البطاقات
  | 'chip_stack'        // وضع الرقائق
  | 'time_warning'      // تحذير الوقت
  | 'button_click'      // نقرة زر
  | 'notification'      // إشعار
  | 'game_start'        // بدء اللعبة
  | 'round_end';        // نهاية الجولة

// قاموس يربط أنواع الأصوات بمسارات الملفات
const soundPaths: Record<SoundType, string> = {
  turn_alert: '/sounds/notification/turn-alert-ar.mp3',
  win: '/sounds/win/win-ar.mp3',
  lose: '/sounds/game/lose-ar.mp3',
  fold: '/sounds/game/fold-ar.mp3',
  check: '/sounds/game/check-ar.mp3',
  call: '/sounds/game/call-ar.mp3',
  raise: '/sounds/game/raise-ar.mp3',
  all_in: '/sounds/game/all-in-ar.mp3',
  card_deal: '/sounds/game/card-deal.mp3',
  chip_stack: '/sounds/game/chip-stack.mp3',
  time_warning: '/sounds/notification/time-warning-ar.mp3',
  button_click: '/sounds/ui/button-click.mp3',
  notification: '/sounds/notification/notification.mp3',
  game_start: '/sounds/game/game-start-ar.mp3',
  round_end: '/sounds/game/round-end.mp3'
};

// خاصية مستوى الصوت لكل نوع
const defaultVolumes: Record<SoundType, number> = {
  turn_alert: 0.8,
  win: 0.7,
  lose: 0.7,
  fold: 0.6,
  check: 0.6,
  call: 0.6,
  raise: 0.6,
  all_in: 0.7,
  card_deal: 0.4,
  chip_stack: 0.5,
  time_warning: 0.8,
  button_click: 0.3,
  notification: 0.6,
  game_start: 0.7,
  round_end: 0.6
};

// كاش للأصوات المحملة
const soundCache: Record<SoundType, HTMLAudioElement | null> = {
  turn_alert: null,
  win: null,
  lose: null,
  fold: null,
  check: null,
  call: null,
  raise: null,
  all_in: null,
  card_deal: null,
  chip_stack: null,
  time_warning: null,
  button_click: null,
  notification: null,
  game_start: null,
  round_end: null
};

interface GameSoundsOptions {
  enabled?: boolean;
  masterVolume?: number;
}

export function useGameSounds(options: GameSoundsOptions = {}) {
  const [enabled, setEnabled] = useState(options.enabled ?? true);
  const [masterVolume, setMasterVolume] = useState(options.masterVolume ?? 0.7);
  const [loaded, setLoaded] = useState(false);
  
  // تحميل الأصوات مسبقاً
  useEffect(() => {
    // حالة التحميل
    let mounted = true;
    let loadedCount = 0;
    
    // تحميل كل صوت
    Object.entries(soundPaths).forEach(([type, path]) => {
      const soundType = type as SoundType;
      
      // إذا كان الصوت محملاً بالفعل، تخطي
      if (soundCache[soundType]) {
        loadedCount++;
        if (loadedCount === Object.keys(soundPaths).length && mounted) {
          setLoaded(true);
        }
        return;
      }
      
      // إنشاء عنصر صوت جديد
      const audio = new Audio(path);
      audio.preload = 'auto';
      
      // تعيين مستوى الصوت
      audio.volume = defaultVolumes[soundType] * masterVolume;
      
      // الاستماع إلى حدث التحميل
      audio.addEventListener('canplaythrough', () => {
        soundCache[soundType] = audio;
        loadedCount++;
        
        if (loadedCount === Object.keys(soundPaths).length && mounted) {
          setLoaded(true);
        }
      });
      
      // الاستماع إلى أحداث الخطأ
      audio.addEventListener('error', (e) => {
        console.error(`خطأ في تحميل الصوت ${type}:`, e);
        loadedCount++;
        
        if (loadedCount === Object.keys(soundPaths).length && mounted) {
          setLoaded(true);
        }
      });
    });
    
    // تنظيف عند إلغاء التثبيت
    return () => {
      mounted = false;
    };
  }, [masterVolume]);
  
  // تحديث مستوى الصوت لجميع الأصوات
  useEffect(() => {
    Object.entries(soundCache).forEach(([type, audio]) => {
      if (audio) {
        const soundType = type as SoundType;
        audio.volume = defaultVolumes[soundType] * masterVolume;
      }
    });
  }, [masterVolume]);
  
  // تشغيل صوت
  const playSound = useCallback((type: SoundType) => {
    if (!enabled || !loaded) return;
    
    const audio = soundCache[type];
    if (audio) {
      // إذا كان الصوت قيد التشغيل، أعد تعيينه
      audio.pause();
      audio.currentTime = 0;
      
      // تشغيل الصوت
      audio.play().catch(err => {
        console.error(`خطأ في تشغيل الصوت ${type}:`, err);
      });
    }
  }, [enabled, loaded]);
  
  // توقف جميع الأصوات
  const stopAllSounds = useCallback(() => {
    Object.values(soundCache).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, []);
  
  // تمكين أو تعطيل الأصوات
  const toggleSounds = useCallback(() => {
    setEnabled(prev => !prev);
  }, []);
  
  // تغيير مستوى الصوت الرئيسي
  const changeMasterVolume = useCallback((volume: number) => {
    setMasterVolume(Math.max(0, Math.min(1, volume)));
  }, []);
  
  return {
    playSound,
    stopAllSounds,
    toggleSounds,
    changeMasterVolume,
    enabled,
    masterVolume,
    loaded
  };
}