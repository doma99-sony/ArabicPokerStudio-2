import { useState, useEffect, useRef } from 'react';

// قائمة بالأغاني الإلكترونية والحماسية المشابهة للأغنية المطلوبة
// استخدام مصادر أغاني متاحة عبر الإنترنت
const musicTracks = [
  {
    title: "Electronic Energy",
    artist: "DJ Mixer",
    src: "https://storage.googleapis.com/media-session/big-buck-bunny/prelude.mp3"
  },
  {
    title: "Party House",
    artist: "Club Masters",
    src: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3"
  },
  {
    title: "Deep Bass",
    artist: "Electronic Kings",
    src: "https://cdn.freesound.org/previews/686/686367_9715151-lq.mp3"
  },
  {
    title: "Dance Floor",
    artist: "House Nation",
    src: "https://cdn.freesound.org/previews/608/608280_12422346-lq.mp3"
  },
  {
    title: "High Energy",
    artist: "EDM Stars",
    src: "https://cdn.freesound.org/previews/458/458587_9159316-lq.mp3"
  },
  {
    title: "Electric Dreams",
    artist: "Future Beat",
    src: "https://cdn.freesound.org/previews/650/650781_11861866-lq.mp3"
  },
  {
    title: "Club Remix",
    artist: "Beat Monsters",
    src: "https://cdn.freesound.org/previews/624/624736_5674468-lq.mp3"
  },
  {
    title: "Techno Rush",
    artist: "Digital DJs",
    src: "https://cdn.freesound.org/previews/631/631440_10402710-lq.mp3"
  }
];

// مكون للموسيقى الخلفية التي تعمل تلقائياً بدون عناصر تحكم مرئية
export function BackgroundMusic() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(Math.floor(Math.random() * musicTracks.length));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // جلب المسار الحالي
  const currentTrack = musicTracks[currentTrackIndex];
  
  // تهيئة عنصر الصوت
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.65; // مستوى صوت مرتفع للأغاني الحماسية
    audio.loop = false; // عدم تكرار الأغنية الواحدة
    
    // تشغيل الأغنية التالية عند انتهاء الحالية
    audio.onended = () => {
      setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
    };
    
    audioRef.current = audio;
    
    // تحريك الأغاني بشكل عشوائي عند التحميل
    shuffleTracks();
    
    // محاولة تشغيل الموسيقى فوراً عند تحميل الصفحة
    setTimeout(() => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("تعذر التشغيل التلقائي للموسيقى", error);
            
            // خطة بديلة في حال عدم السماح بالتشغيل التلقائي
            const handleUserInteraction = () => {
              if (audioRef.current && audioRef.current.paused) {
                const retryPromise = audioRef.current.play();
                if (retryPromise !== undefined) {
                  retryPromise.catch(retryError => {
                    console.warn("تعذر تشغيل الموسيقى بعد تفاعل المستخدم", retryError);
                  });
                }
                
                // إزالة مستمعي الأحداث بعد محاولة التشغيل
                document.removeEventListener('click', handleUserInteraction);
                document.removeEventListener('touchstart', handleUserInteraction);
                document.removeEventListener('keydown', handleUserInteraction);
              }
            };
            
            // إضافة مستمعي أحداث لتفاعل المستخدم
            document.addEventListener('click', handleUserInteraction);
            document.addEventListener('touchstart', handleUserInteraction);
            document.addEventListener('keydown', handleUserInteraction);
          });
        }
      }
    }, 1000); // تأخير مناسب للتأكد من تحميل الصفحة
    
    // تنظيف عند إزالة المكون
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);
  
  // مزج مسارات الموسيقى بشكل عشوائي
  const shuffleTracks = () => {
    const randomIndex = Math.floor(Math.random() * musicTracks.length);
    setCurrentTrackIndex(randomIndex);
  };
  
  // تحديث المسار عند تغيير المؤشر
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleError = () => {
      console.warn(`تعذر تحميل الملف الصوتي: ${currentTrack.src}`);
      // الانتقال للمسار التالي بعد فشل التحميل
      setTimeout(() => {
        setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
      }, 2000);
    };
    
    // إضافة محقق أخطاء تحميل الملفات الصوتية
    audio.onerror = handleError;
    
    // تعيين المسار الجديد
    audio.src = currentTrack.src;
    
    // تحميل المسار
    audio.load();
    
    // تشغيل الموسيقى
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("تعذر تشغيل المسار الصوتي", error);
        // محاولة الانتقال للمسار التالي بعد فشل التشغيل
        setTimeout(() => {
          setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
        }, 2000);
      });
    }
    
    // تنظيف عند تغيير المسار
    return () => {
      audio.onerror = null;
    };
  }, [currentTrackIndex, currentTrack.src]);
  
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