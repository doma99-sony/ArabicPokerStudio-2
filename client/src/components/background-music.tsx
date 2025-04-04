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
    src: "/audio/sample-sound.mp3"
  },
  {
    title: "إيقاعات شرقية",
    artist: "نجم الميكس",
    src: "/audio/sample-sound2.mp3"
  },
  {
    title: "ريمكس عربي",
    artist: "DJ خليجي",
    src: "/audio/sample-sound3.mp3"
  },
  {
    title: "ليلة سهر",
    artist: "نجوم الريمكس",
    src: "/audio/sample-sound4.mp3"
  },
  {
    title: "إيقاع الطبلة",
    artist: "موسيقى الشرق",
    src: "/audio/sample-sound5.mp3"
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

// المكون الفعلي للموسيقى مع زر للتحكم
function BackgroundMusic() {
  const { isPlaying, togglePlay } = useContext(MusicContext);
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button 
        onClick={togglePlay}
        className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-700 p-3 text-white shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>
    </div>
  );
}