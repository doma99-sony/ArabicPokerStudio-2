import { useState, useEffect, useRef, createContext, useContext } from 'react';

// سياق عام للموسيقى لمشاركة حالة التشغيل بين المكونات
interface MusicContextType {
  volume: number;
  setVolume: (volume: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTrack: typeof musicTracks[0];
  nextTrack: () => void;
  previousTrack: () => void;
}

const defaultMusicContext: MusicContextType = {
  volume: 0.7,
  setVolume: () => {},
  isPlaying: true,
  togglePlay: () => {},
  currentTrack: {
    title: "",
    artist: "",
    src: ""
  },
  nextTrack: () => {},
  previousTrack: () => {}
};

const MusicContext = createContext<MusicContextType>(defaultMusicContext);

// استخدام سياق الموسيقى في المكونات الأخرى
export const useMusic = () => useContext(MusicContext);

// قائمة بالأغاني العربية والإلكترونية الحماسية
const musicTracks = [
  {
    title: "أغنية حماسية 1",
    artist: "DJ مصري",
    src: "https://dl.dropbox.com/scl/fi/l0vw2ep5a2i5r1d9z0mcp/arabic-trap.mp3?rlkey=hz1itfm13jvtdh37rtw9tmbq9&dl=0"
  },
  {
    title: "إيقاعات شرقية",
    artist: "نجم الميكس",
    src: "https://dl.dropbox.com/scl/fi/xbjgk2ogknpfq59z6rqwd/arabic-house.mp3?rlkey=p7wicfh2eqamf9zcmtjnhzrsj&dl=0"
  },
  {
    title: "ريمكس عربي",
    artist: "DJ خليجي",
    src: "https://dl.dropbox.com/scl/fi/0k1pji63sak6l0jkhj6ud/arabic-mix.mp3?rlkey=yrfhmmr4kkx25tojxwpejl5un&dl=0"
  },
  {
    title: "ليلة سهر",
    artist: "نجوم الريمكس",
    src: "https://dl.dropbox.com/scl/fi/66iu3a02ys2e2p9zwu3vp/club-energy.mp3?rlkey=5eplj5w4wz2xt6y8b94m90odz&dl=0"
  },
  {
    title: "إيقاع الطبلة",
    artist: "موسيقى الشرق",
    src: "https://dl.dropbox.com/scl/fi/qyg9yiw8e7f5f0svjihq3/energetic-trap.mp3?rlkey=4dvvh651iu6cti3m5mmkcwdmt&dl=0"
  }
];

// مكون مزود الموسيقى الذي يوفر السياق لباقي التطبيق
export function BackgroundMusicProvider() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(Math.floor(Math.random() * musicTracks.length));
  const [volume, setVolume] = useState<number>(0.7); // افتراضي 70%
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // الحصول على المسار الحالي
  const currentTrack = musicTracks[currentTrackIndex];
  
  // التبديل بين تشغيل وإيقاف الموسيقى
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("تعذر تشغيل الأغنية", error);
        });
      }
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // الانتقال للأغنية التالية
  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
  };
  
  // الانتقال للأغنية السابقة
  const previousTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + musicTracks.length) % musicTracks.length);
  };
  
  // تحديث مستوى الصوت
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // تهيئة عنصر الصوت
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.loop = false;
    
    // تشغيل الأغنية التالية عند انتهاء الحالية
    audio.onended = () => {
      nextTrack();
    };
    
    audioRef.current = audio;
    
    // تشغيل الموسيقى تلقائياً عند بدء التطبيق
    setTimeout(() => {
      if (audioRef.current && isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("تعذر التشغيل التلقائي للأغنية", error);
            
            // محاولة التشغيل عند تفاعل المستخدم إذا فشل التشغيل التلقائي
            const handleUserInteraction = () => {
              if (audioRef.current && audioRef.current.paused && isPlaying) {
                const retryPromise = audioRef.current.play();
                if (retryPromise !== undefined) {
                  retryPromise.catch(retryError => {
                    console.warn("تعذر تشغيل الأغنية بعد تفاعل المستخدم", retryError);
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
    }, 1000);
    
    // تنظيف عند إزالة المكون
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);
  
  // تحديث المسار عند تغيير المؤشر
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleError = () => {
      console.warn(`تعذر تحميل ملف الأغنية: ${currentTrack.src}`);
      // الانتقال للمسار التالي بعد فشل التحميل
      setTimeout(() => {
        nextTrack();
      }, 1000);
    };
    
    // إضافة محقق أخطاء تحميل الملفات الصوتية
    audio.onerror = handleError;
    
    // تعيين المسار الجديد
    audio.src = currentTrack.src;
    
    // تحميل المسار
    audio.load();
    
    // تشغيل الأغنية إذا كان وضع التشغيل نشط
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("تعذر تشغيل الأغنية", error);
          setTimeout(() => {
            nextTrack();
          }, 1000);
        });
      }
    }
    
    // تنظيف عند تغيير المسار
    return () => {
      audio.onerror = null;
    };
  }, [currentTrackIndex, currentTrack.src]);
  
  // التأكد من تحميل المكون فقط في جانب العميل
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  if (!isMounted) return null;
  
  // توفير معلومات التحكم بالموسيقى لباقي المكونات
  return (
    <MusicContext.Provider
      value={{
        volume,
        setVolume,
        isPlaying,
        togglePlay,
        currentTrack,
        nextTrack,
        previousTrack
      }}
    >
      <BackgroundMusic />
    </MusicContext.Provider>
  );
}

// المكون الفعلي للموسيقى (بدون واجهة مرئية)
function BackgroundMusic() {
  // لا يوجد أي عناصر مرئية، المكون يعمل فقط لتشغيل الموسيقى في الخلفية
  return null;
}