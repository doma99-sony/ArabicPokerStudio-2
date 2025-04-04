import { useState, useEffect, useRef } from 'react';

// قائمة مسارات الموسيقى
const musicTracks = [
  {
    title: "Best Songs Mix 2023",
    artist: "SoundCloud",
    src: "https://soundcloud.com/8dsongs/best-songs-mix-2023", // الموسيقى من SoundCloud
    isSoundCloud: true // علامة لتمييز مسارات SoundCloud
  }
];

// مكون للموسيقى الخلفية التي تدعم SoundCloud
export function BackgroundMusic() {
  // حالة لتتبع ما إذا كان المستخدم قد تفاعل مع الصفحة
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // في حالة SoundCloud، نحتاج إلى عرض iframe
  const currentTrack = musicTracks[0]; // نستخدم المسار الأول دائماً
  
  // وظيفة للتعامل مع تفاعل المستخدم
  const handleUserInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsVisible(true);
      console.log("تم تفعيل عنصر SoundCloud!");
      
      // إزالة مستمعي الأحداث بعد التفاعل الأول
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    }
  };
  
  // إضافة مستمعي أحداث للتفاعل مع الصفحة
  useEffect(() => {
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [hasInteracted]);
  
  // إعداد iframe من SoundCloud
  const setupSoundCloud = () => {
    if (!hasInteracted) return null;
    
    // تحويل رابط SoundCloud إلى رابط تضمين
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentTrack.src)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;
    
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        backgroundColor: '#444',
        border: '1px solid #666',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        <iframe
          title="SoundCloud Player"
          width="300"
          height="80"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
        ></iframe>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '4px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <button 
            onClick={() => setIsVisible(false)} 
            style={{ 
              padding: '4px 8px',
              backgroundColor: '#777',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            إخفاء
          </button>
          <button 
            onClick={() => setIsVisible(true)} 
            style={{ 
              padding: '4px 8px',
              backgroundColor: '#777',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: isVisible ? 'none' : 'block',
              position: isVisible ? 'absolute' : 'relative',
              right: isVisible ? '-9999px' : 'auto'
            }}
          >
            إظهار
          </button>
        </div>
      </div>
    );
  };
  
  return setupSoundCloud();
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