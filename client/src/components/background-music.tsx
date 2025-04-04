import { useEffect, useState } from 'react';

// قائمة المسارات الموسيقية الحماسية
const energeticTracks = [
  {
    title: "Epic Electronic Rock",
    src: "/audio/energetic/energetic_1.mp3",
  },
  {
    title: "Powerful Energetic Dubstep",
    src: "/audio/energetic/energetic_2.mp3",
  },
  {
    title: "Sport Workout Energy",
    src: "/audio/energetic/energetic_3.mp3",
  },
  {
    title: "Epic Piano Dubstep",
    src: "/audio/energetic/energetic_4.mp3",
  },
  {
    title: "Action Sport Rock",
    src: "/audio/energetic/energetic_5.mp3",
  },
  {
    title: "Poker Classic",
    src: "/background-music.mp3",
  },
  {
    title: "Test Energetic",
    src: "/test-music.mp3",
  },
  {
    title: "Sample Sound Special",
    src: "/audio/sample-sound.mp3",
  }
];

// طريقة لتشغيل الموسيقى تلقائيًا دون أي قيود
export function BackgroundMusicProvider() {
  useEffect(() => {
    // إنشاء عنصر الصوت برمجيًا
    const audio = new Audio();
    audio.volume = 0.5;
    
    // اختيار مسار عشوائي من القائمة
    let currentTrackIndex = Math.floor(Math.random() * energeticTracks.length);
    audio.src = energeticTracks[currentTrackIndex].src;
    
    // دالة للتشغيل الفوري
    const playMusic = () => {
      // محاولة التشغيل مباشرة
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("محاولة تشغيل الموسيقى تلقائيًا...");
          
          // إذا فشل تشغيل المسار الحالي، جرب المسار التالي
          currentTrackIndex = (currentTrackIndex + 1) % energeticTracks.length;
          audio.src = energeticTracks[currentTrackIndex].src;
          setTimeout(playMusic, 1000);
        });
      }
    };
    
    // انتقل للمسار التالي عند انتهاء المسار الحالي
    audio.onended = () => {
      currentTrackIndex = (currentTrackIndex + 1) % energeticTracks.length;
      audio.src = energeticTracks[currentTrackIndex].src;
      playMusic();
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