import { useState, useEffect, useRef } from 'react';

// قائمة مسارات الموسيقى المحلية
const musicTracks = [
  {
    title: "Ambient 1",
    artist: "Poker Game",
    src: "/sounds/music/ambient1.mp3" // استخدام ملفات موسيقية من مجلد sounds
  },
  {
    title: "Music 1",
    artist: "Game Sounds",
    src: "/sounds/music/music1.mp3"
  },
  {
    title: "Ambient 2",
    artist: "Card Music",
    src: "/sounds/music/ambient2.mp3"
  },
  {
    title: "Music 2",
    artist: "Casino Beats",
    src: "/sounds/music/music2.mp3"
  },
  {
    title: "Ambient 3",
    artist: "Poker Club",
    src: "/sounds/music/ambient3.mp3"
  },
  {
    title: "Music 3",
    artist: "Poker Game",
    src: "/sounds/music/music3.mp3"
  }
];

// مكون للموسيقى الخلفية التي تعمل تلقائياً بدون عناصر تحكم مرئية
export function BackgroundMusic() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // نبدأ بالمسار الأول
  const [volume, setVolume] = useState(0.05); // بداية بمستوى صوت منخفض
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // جلب المسار الحالي
  const currentTrack = musicTracks[currentTrackIndex];
  
  // وظيفة لزيادة مستوى الصوت بشكل تدريجي
  const fadeInVolume = () => {
    if (audioRef.current) {
      // بدء من مستوى صوت منخفض وزيادته تدريجياً
      setVolume(0.05);
      let currentVol = 0.05;
      const targetVol = 0.3; // مستوى الصوت المستهدف
      
      // إلغاء أي فاصل زمني سابق
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      // زيادة مستوى الصوت تدريجيا على مدار 3 ثوان
      fadeIntervalRef.current = setInterval(() => {
        currentVol = Math.min(currentVol + 0.02, targetVol);
        if (audioRef.current) {
          audioRef.current.volume = currentVol;
          setVolume(currentVol);
        }
        
        if (currentVol >= targetVol) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
        }
      }, 200);
    }
  };
  
  // وظيفة لخفض مستوى الصوت تدريجياً
  const fadeOutVolume = (callback?: () => void) => {
    if (audioRef.current) {
      let currentVol = audioRef.current.volume;
      
      // إلغاء أي فاصل زمني سابق
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      // خفض مستوى الصوت تدريجياً على مدار ثانية واحدة
      fadeIntervalRef.current = setInterval(() => {
        currentVol = Math.max(currentVol - 0.05, 0);
        if (audioRef.current) {
          audioRef.current.volume = currentVol;
          setVolume(currentVol);
        }
        
        if (currentVol <= 0) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
            
            if (callback) callback();
          }
        }
      }, 100);
    } else if (callback) {
      callback();
    }
  };
  
  // وظيفة لبدء تشغيل المسار الحالي
  const playCurrentTrack = () => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    audio.volume = volume;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // تم التشغيل بنجاح، زيادة مستوى الصوت تدريجياً
        fadeInVolume();
      }).catch(error => {
        console.warn("تعذر تشغيل المسار الصوتي", error);
        // محاولة الانتقال للمسار التالي بعد فشل التشغيل
        setTimeout(() => {
          setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
        }, 2000);
      });
    }
  };
  
  // تهيئة عنصر الصوت
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume; // مستوى صوت منخفض للبداية
    audio.loop = false; // عدم تكرار الأغنية الواحدة
    
    // تشغيل الأغنية التالية عند انتهاء الحالية
    audio.onended = () => {
      // خفض مستوى الصوت تدريجياً قبل الانتقال للمسار التالي
      fadeOutVolume(() => {
        setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
      });
    };
    
    audioRef.current = audio;
    
    // التأكد من أن تشغيل الصوت يحدث فقط بعد تفاعل المستخدم مع الصفحة
    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        playCurrentTrack();
      }
      
      // إزالة مستمعي الأحداث بعد التفاعل الأول
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    // إضافة مستمعي أحداث للتفاعل مع الصفحة
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // إعداد مؤقت للمحاولة بشكل متكرر
    const autoPlayInterval = setInterval(() => {
      if (audioRef.current && audioRef.current.paused) {
        const tryPlay = audioRef.current.play();
        if (tryPlay) {
          tryPlay.catch(() => {
            console.log("محاولة التشغيل التلقائي مستمرة...");
          });
        }
      } else {
        clearInterval(autoPlayInterval);
      }
    }, 3000);
    
    // تفريغ عنصر الصوت وإزالة مستمعي الأحداث عند التدمير
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      clearInterval(autoPlayInterval);
      
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      audioRef.current = null;
      
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);
  
  // تحديث المسار عند تغيير المؤشر
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleCanPlay = () => {
      console.log(`جاهز لتشغيل: ${currentTrack.title}`);
      playCurrentTrack();
    };
    
    const handleError = () => {
      console.warn(`تعذر تحميل الملف الصوتي: ${currentTrack.src}`);
      // الانتقال للمسار التالي بعد فشل التحميل
      setTimeout(() => {
        setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
      }, 2000);
    };
    
    // إضافة معالجات الأحداث
    audio.oncanplay = handleCanPlay;
    audio.onerror = handleError;
    
    // تعيين المسار الجديد وتحميله
    audio.src = currentTrack.src;
    audio.load();
    
    // تنظيف عند إزالة التأثير
    return () => {
      audio.oncanplay = null;
      audio.onerror = null;
    };
  }, [currentTrackIndex]);
  
  // لا يوجد شيء مرئي للعرض، فقط تشغيل الموسيقى في الخلفية
  return null;
}

// المكون الذي سيتم استخدامه في التطبيق
export function BackgroundMusicProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // التأكد من تحميل المكون فقط في جانب العميل
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;
  
  return <BackgroundMusic />;
}

// واجهة برمجية بسيطة للتحكم بالموسيقى من المكونات الأخرى
export const useMusic = () => {
  return {
    play: () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        if (audio.paused) {
          const playPromise = audio.play();
          if (playPromise) {
            playPromise.catch(err => console.warn("فشل في استئناف التشغيل", err));
          }
        }
      });
    },
    pause: () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
        }
      });
    },
    setVolume: (volume: number) => {
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => { 
        audio.volume = Math.max(0, Math.min(1, volume)); 
      });
    },
    // دالة لرفع الصوت تدريجياً
    fadeInVolume: (duration: number = 1000) => {
      const audios = document.querySelectorAll('audio');
      
      audios.forEach(audio => {
        let startVolume = 0;
        const targetVolume = 0.3; // مستوى الصوت المستهدف
        const steps = 20;
        const stepTime = duration / steps;
        
        audio.volume = startVolume;
        
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          if (step <= steps) {
            const newVolume = startVolume + (targetVolume - startVolume) * (step / steps);
            audio.volume = newVolume;
          } else {
            clearInterval(fadeInterval);
          }
        }, stepTime);
      });
    },
    // دالة لخفض الصوت تدريجياً
    fadeOutVolume: (duration: number = 1000, callback?: () => void) => {
      const audios = document.querySelectorAll('audio');
      if (audios.length === 0 && callback) {
        callback();
        return;
      }
      
      let completedCount = 0;
      
      audios.forEach(audio => {
        const startVolume = audio.volume;
        const steps = 20;
        const stepTime = duration / steps;
        
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          if (step <= steps) {
            const newVolume = startVolume * (1 - step / steps);
            audio.volume = newVolume;
          } else {
            clearInterval(fadeInterval);
            audio.pause();
            completedCount++;
            
            if (completedCount === audios.length && callback) {
              callback();
            }
          }
        }, stepTime);
      });
    }
  };
};