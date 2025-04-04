import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLocalStorage } from '../lib/hooks/use-local-storage';

// قائمة بالمسارات الموسيقية الحماسية
const musicTracks = [
  {
    title: "Epic Electronic Rock",
    artist: "King Around Here",
    src: "/audio/energetic/energetic_1.mp3",
    thumbnail: ""
  },
  {
    title: "Powerful Energetic Dubstep",
    artist: "Powerful Bass",
    src: "/audio/energetic/energetic_2.mp3",
    thumbnail: ""
  },
  {
    title: "Sport Workout Energy",
    artist: "Fitness Master",
    src: "/audio/energetic/energetic_3.mp3",
    thumbnail: ""
  },
  {
    title: "Epic Piano Dubstep",
    artist: "Sport Trailer",
    src: "/audio/energetic/energetic_4.mp3",
    thumbnail: ""
  },
  {
    title: "Action Sport Rock",
    artist: "Power Players",
    src: "/audio/energetic/energetic_5.mp3",
    thumbnail: ""
  },
  {
    title: "Poker Classic",
    artist: "Gaming Masters",
    src: "/background-music.mp3",
    thumbnail: ""
  },
  {
    title: "Test Energetic",
    artist: "Test Music",
    src: "/test-music.mp3",
    thumbnail: ""
  },
  {
    title: "Sample Sound Special",
    artist: "Sound Effects Pro",
    src: "/audio/sample-sound.mp3",
    thumbnail: ""
  }
];

export function MusicPlayer() {
  const [isReady, setIsReady] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useLocalStorage<boolean>("music-muted", false);
  const [volume, setVolume] = useLocalStorage<number>("music-volume", 80);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // جلب المسار الحالي
  const currentTrack = musicTracks[currentTrackIndex];
  
  // تهيئة عنصر الصوت
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume / 100;
    audio.muted = isMuted;
    audio.onended = handleNextTrack;
    audio.oncanplaythrough = () => setIsReady(true);
    audioRef.current = audio;
    
    // تفريغ عنصر الصوت عند التدمير
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
      console.warn(`تعذر تحميل الملف الصوتي: ${currentTrack.src}`);
      // الانتقال للمسار التالي بعد فشل التحميل
      setTimeout(() => {
        setCurrentTrackIndex((prev: number) => (prev + 1) % musicTracks.length);
      }, 1000);
    };
    
    // إضافة محقق أخطاء تحميل الملفات الصوتية
    audio.onerror = handleError;
    
    // تعيين المسار الجديد
    audio.src = currentTrack.src;
    
    // تحميل المسار
    audio.load();
    
    // تشغيل المسار إذا كان يجب تشغيله
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("تعذر تشغيل المسار الصوتي: ", error);
          setIsPlaying(false);
          // محاولة الانتقال للمسار التالي بعد فشل التشغيل
          setTimeout(() => {
            setCurrentTrackIndex((prev: number) => (prev + 1) % musicTracks.length);
          }, 1000);
        });
      }
    }
    
    // تنظيف عند إزالة المكون
    return () => {
      audio.onerror = null;
    };
  }, [currentTrackIndex, currentTrack.src]);
  
  // تحديث حالة التشغيل
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("تعذر تشغيل المسار الصوتي: ", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // تحديث مستوى الصوت
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);
  
  // تحديث حالة كتم الصوت
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // تشغيل الموسيقى تلقائيًا عند بدء التطبيق (مع تأخير قليل)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMuted && audioRef.current) {
        setIsPlaying(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isMuted]);
  
  // التبديل بين تشغيل وإيقاف الموسيقى
  const togglePlay = () => {
    setIsPlaying((prev: boolean) => !prev);
  };
  
  // التبديل بين كتم وتشغيل الصوت
  const toggleMute = () => {
    setIsMuted((prev: boolean) => !prev);
  };
  
  // الانتقال للمسار التالي
  const handleNextTrack = () => {
    setCurrentTrackIndex((prev: number) => (prev + 1) % musicTracks.length);
  };
  
  // تغيير مستوى الصوت
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  // التعامل مع تحريك مؤشر الصوت
  const handleShowControls = () => {
    setShowControls(true);
  };
  
  const handleHideControls = () => {
    setShowControls(false);
  };
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={handleShowControls}
      onMouseLeave={handleHideControls}
    >
      {/* زر عائم للتحكم في الموسيقى */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className={`h-12 w-12 rounded-full bg-gradient-to-r from-[#0A3A2A]/80 to-[#0A3A2A]/95 border-2 border-[#D4AF37] shadow-lg ${isPlaying && !isMuted ? 'animate-pulse-slow' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-[#D4AF37]" />
          ) : (
            <Volume2 className="h-6 w-6 text-[#D4AF37]" />
          )}
        </Button>
        
        {/* معلومات المسار الحالي - تظهر عند تحريك المؤشر */}
        {showControls && (
          <div className="absolute bottom-14 right-0 p-3 bg-gradient-to-r from-[#0A3A2A]/90 to-black/90 border border-[#D4AF37]/50 rounded-lg w-64 backdrop-blur-sm shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-md overflow-hidden border border-[#D4AF37]/30 bg-[#0A3A2A]/50 flex items-center justify-center">
                <span className="text-[#D4AF37] text-xl">♫</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[#D4AF37] font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                  {currentTrack.title}
                </p>
                <p className="text-[#D4AF37]/70 text-xs">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
            
            {/* أزرار التحكم */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                onClick={togglePlay}
                disabled={!isReady}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                onClick={handleNextTrack}
                disabled={!isReady}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* شريط التمرير للتحكم في مستوى الصوت */}
            <div className="w-full">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>
            
            {/* اسم المسار الحالي */}
            <div className="text-center mt-2">
              <p className="text-xs text-[#D4AF37]/60">
                {isReady ? (
                  isPlaying ? 'يتم التشغيل الآن' : 'متوقف مؤقتاً'
                ) : (
                  'جاري التحميل...'
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// هذا المكون الذي يقوم بتضمين مشغل الموسيقى في التطبيق
export function MusicPlayerProvider() {
  // تستخدم للتأكد من أن مشغل الموسيقى يتم تحميله مرة واحدة فقط
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // عرض المشغل فقط على جانب العميل بعد التحميل
  if (!isMounted) return null;
  
  return <MusicPlayer />;
}