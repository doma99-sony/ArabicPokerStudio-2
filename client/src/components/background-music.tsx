import { useEffect, useState } from 'react';

// مكون بسيط للموسيقى الخلفية باستخدام عنصر HTML audio مباشرة
export function BackgroundMusicProvider() {
  const [isMounted, setIsMounted] = useState(false);
  
  // التأكد من تحميل المكون فقط في جانب العميل
  useEffect(() => {
    setIsMounted(true);
    
    // تشغيل الموسيقى بمجرد تفاعل المستخدم مع الصفحة
    const playAudio = () => {
      // إنشاء عنصر الصوت
      const audioElement = document.getElementById('background-music') as HTMLAudioElement;
      
      if (audioElement) {
        // محاولة التشغيل
        const promise = audioElement.play();
        if (promise !== undefined) {
          promise.catch(() => {
            console.log("تعذر تشغيل الموسيقى تلقائيًا، سيتم التشغيل عند أول تفاعل");
          });
        }
      }
    };
    
    // تسجيل مستمعي الأحداث للتشغيل عند أول تفاعل
    document.addEventListener('click', playAudio, { once: true });
    document.addEventListener('touchstart', playAudio, { once: true });
    document.addEventListener('keydown', playAudio, { once: true });
    
    // محاولة التشغيل مباشرة
    setTimeout(playAudio, 1000);
    
    // تنظيف المكون عند إزالته
    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('touchstart', playAudio);
      document.removeEventListener('keydown', playAudio);
      setIsMounted(false);
    };
  }, []);
  
  // لا نعرض أي شيء إذا كان المكون لم يتم تحميله بعد
  if (!isMounted) return null;
  
  // إنشاء عنصر صوت مرئي للتحكم بالتشغيل
  return (
    <audio 
      id="background-music"
      src="/test-music.mp3"
      autoPlay
      loop
      style={{ display: 'none' }}
    />
  );
}

// تصدير واجهة بسيطة لاستخدام مكون الموسيقى في المكونات الأخرى
export const useMusic = () => {
  return {
    play: () => {
      const audio = document.getElementById('background-music') as HTMLAudioElement;
      if (audio) audio.play();
    },
    pause: () => {
      const audio = document.getElementById('background-music') as HTMLAudioElement;
      if (audio) audio.pause();
    },
    setVolume: (volume: number) => {
      const audio = document.getElementById('background-music') as HTMLAudioElement;
      if (audio) audio.volume = volume;
    }
  };
};