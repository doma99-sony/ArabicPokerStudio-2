import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from "lucide-react";

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
    
    // تحميل مكتبة SoundCloud SDK إذا لم تكن موجودة
    // @ts-ignore
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        console.log("تم تحميل SoundCloud SDK");
      };
    }
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
  // حالة لتتبع مستوى الصوت الحالي
  const [volume, setVolumeState] = useState<number>(0.75);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTrack, setCurrentTrack] = useState({ title: "Best Songs Mix", artist: "SoundCloud" });

  // الحصول على كائن SDK لـ SoundCloud
  const getSoundCloudWidget = (): any => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return null;
    
    // @ts-ignore
    if (window.SC && window.SC.Widget) {
      // @ts-ignore
      return window.SC.Widget(iframe);
    }
    return null;
  };

  // ضبط مستوى الصوت باستخدام SoundCloud API
  const setVolume = (newVolume: number) => {
    const boundedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(boundedVolume);
    
    try {
      // الحصول على نافذة iframe
      const iframe = document.querySelector('iframe');
      
      if (iframe) {
        // ضبط الصوت باستخدام واجهة برمجة التطبيقات المباشرة من SoundCloud
        // @ts-ignore
        if (window.SC && window.SC.Widget) {
          // @ts-ignore
          const widget = window.SC.Widget(iframe);
          
          // استخدام طريقة الوعود للتأكد من استدعاء أمر ضبط الصوت بعد تحميل اللاعب
          // @ts-ignore
          widget.bind(window.SC.Widget.Events.READY, () => {
            widget.setVolume(boundedVolume * 100);
            console.log(`تم ضبط مستوى الصوت على ${boundedVolume * 100}%`);
          });
          
          // محاولة ضبط الصوت مباشرة أيضًا (في حالة كان اللاعب جاهزًا بالفعل)
          widget.setVolume(boundedVolume * 100);
        } else {
          console.warn("لم يتم العثور على واجهة برمجة التطبيقات SoundCloud");
        }
      }
      
      // احتياطي: محاولة ضبط صوت العناصر الصوتية الأخرى
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => { 
        audio.volume = boundedVolume; 
      });
    } catch (error) {
      console.warn("خطأ في ضبط مستوى الصوت:", error);
    }
  };

  // الدوال الأخرى
  const play = () => {
    try {
      const widget = getSoundCloudWidget();
      if (widget) {
        widget.play();
      }
      
      // احتياطي: محاولة تشغيل العناصر الصوتية الأخرى
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        if (audio.paused) {
          const playPromise = audio.play();
          if (playPromise) {
            playPromise.catch(err => console.warn("فشل في استئناف التشغيل", err));
          }
        }
      });
    } catch (error) {
      console.warn("خطأ في تشغيل الموسيقى:", error);
    }
  };

  const pause = () => {
    try {
      const widget = getSoundCloudWidget();
      if (widget) {
        widget.pause();
      }
      
      // احتياطي: محاولة إيقاف العناصر الصوتية الأخرى
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
        }
      });
    } catch (error) {
      console.warn("خطأ في إيقاف الموسيقى مؤقتًا:", error);
    }
  };

  // دالة لرفع الصوت تدريجياً
  const fadeInVolume = (duration: number = 1000) => {
    try {
      let startVolume = 0;
      const targetVolume = 0.75;
      const steps = 20;
      const stepTime = duration / steps;
      
      setVolume(startVolume);
      
      let step = 0;
      const fadeInterval = setInterval(() => {
        step++;
        if (step <= steps) {
          const newVolume = startVolume + (targetVolume - startVolume) * (step / steps);
          setVolume(newVolume);
        } else {
          clearInterval(fadeInterval);
        }
      }, stepTime);
    } catch (error) {
      console.warn("خطأ في رفع الصوت تدريجياً:", error);
    }
  };

  // دالة لخفض الصوت تدريجياً
  const fadeOutVolume = (duration: number = 1000, callback?: () => void) => {
    try {
      const startVolume = volume;
      const steps = 20;
      const stepTime = duration / steps;
      
      let step = 0;
      const fadeInterval = setInterval(() => {
        step++;
        if (step <= steps) {
          const newVolume = startVolume * (1 - step / steps);
          setVolume(newVolume);
        } else {
          clearInterval(fadeInterval);
          pause();
          if (callback) callback();
        }
      }, stepTime);
    } catch (error) {
      console.warn("خطأ في خفض الصوت تدريجياً:", error);
      if (callback) callback();
    }
  };

  // دالة لتبديل حالة التشغيل
  const togglePlay = () => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    } else {
      play();
      setIsPlaying(true);
    }
  };

  // دوال للتنقل بين المسارات (وهمية حالياً)
  const nextTrack = () => {
    console.log("التالي");
    // في المستقبل: يمكن إضافة التنقل الحقيقي بين المسارات
  };

  const previousTrack = () => {
    console.log("السابق");
    // في المستقبل: يمكن إضافة التنقل الحقيقي بين المسارات
  };

  return {
    play,
    pause,
    setVolume,
    fadeInVolume,
    fadeOutVolume,
    togglePlay,
    nextTrack,
    previousTrack,
    isPlaying,
    currentTrack,
    volume // إعادة الحجم الحالي
  };
};