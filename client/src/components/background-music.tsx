import { useEffect } from 'react';

// طريقة بسيطة لتشغيل الموسيقى تلقائيًا دون أي قيود
export function BackgroundMusicProvider() {
  useEffect(() => {
    // إنشاء عنصر صوت برمجيًا
    const audio = new Audio('/assets/music/demo-music.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    
    // دالة للتشغيل الفوري
    const playMusic = () => {
      // محاولة التشغيل مباشرة
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("محاولة تشغيل الموسيقى تلقائيًا...");
        });
      }
    };
    
    // محاولة التشغيل عند تحميل الصفحة
    playMusic();
    
    // محاولة التشغيل عند أي تفاعل من المستخدم
    const handleInteraction = () => {
      playMusic();
      
      // إزالة مستمعي الأحداث بعد التشغيل الناجح
      if (!audio.paused) {
        removeEventListeners();
      }
    };
    
    // إضافة مستمعي أحداث متعددة لتفاعل المستخدم
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('scroll', handleInteraction);
    
    // دالة لإزالة جميع مستمعي الأحداث
    const removeEventListeners = () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
    };
    
    // محاولة التشغيل بشكل متكرر كل ثانية لضمان بدء الموسيقى تلقائيًا
    const interval = setInterval(() => {
      if (audio.paused) {
        playMusic();
      } else {
        // إذا بدأ التشغيل، توقف عن المحاولة
        clearInterval(interval);
      }
    }, 1000);
    
    // تنظيف الموارد عند إزالة المكون
    return () => {
      audio.pause();
      audio.src = '';
      clearInterval(interval);
      removeEventListeners();
    };
  }, []);
  
  // هذا المكون لا يُظهر أي عناصر مرئية
  return null;
}

// واجهة بسيطة للتحكم بالموسيقى في المكونات الأخرى
export const useMusic = () => {
  return {
    play: () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => audio.play());
    },
    pause: () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => audio.pause());
    },
    setVolume: (volume: number) => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => { audio.volume = volume; });
    }
  };
};