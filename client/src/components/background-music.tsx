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
  // نستخدم مشغل مخفي بالكامل بدون عناصر تحكم
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // في حالة SoundCloud، نحتاج إلى عرض iframe ولكن سنخفيه
  const currentTrack = musicTracks[0]; // نستخدم المسار الأول دائماً
  
  // بدء تشغيل الموسيقى تلقائياً عند تحميل الصفحة
  useEffect(() => {
    // تعيين عنصر الموسيقى كمحمل
    setIframeLoaded(true);
    console.log("تم تفعيل عنصر SoundCloud!");
  }, []);
  
  // إعداد iframe من SoundCloud (مخفي تماماً)
  const setupSoundCloud = () => {
    if (!iframeLoaded) return null;
    
    // تحويل رابط SoundCloud إلى رابط تضمين
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(currentTrack.src)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;
    
    return (
      <div style={{ 
        position: 'absolute', 
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <iframe
          ref={iframeRef}
          title="SoundCloud Player"
          width="1"
          height="1"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
        ></iframe>
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