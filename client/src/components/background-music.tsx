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
    title: "Ace of Spades",
    artist: "Casino Music",
    src: "/assets/music/ace-of-spades.mp3"
  },
  {
    title: "Casino Royale",
    artist: "Vegas Sound",
    src: "/assets/music/casino-royale.mp3"
  },
  {
    title: "High Stakes",
    artist: "Table Games",
    src: "/assets/music/high-stakes.mp3"
  },
  {
    title: "Royal Flush",
    artist: "Poker Kings",
    src: "/assets/music/royal-flush.mp3"
  },
  {
    title: "Vegas Nights",
    artist: "Casino Lounge",
    src: "/assets/music/vegas-nights.mp3"
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
          console.warn("Failed to play track", error);
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
            console.warn("Failed to autoplay track", error);
            
            // محاولة التشغيل عند تفاعل المستخدم إذا فشل التشغيل التلقائي
            const handleUserInteraction = () => {
              if (audioRef.current && audioRef.current.paused && isPlaying) {
                const retryPromise = audioRef.current.play();
                if (retryPromise !== undefined) {
                  retryPromise.catch(retryError => {
                    console.warn("Failed to play track after user interaction", retryError);
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
      console.warn(`Failed to load track: ${currentTrack.src}`);
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
          console.warn("Failed to play track", error);
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