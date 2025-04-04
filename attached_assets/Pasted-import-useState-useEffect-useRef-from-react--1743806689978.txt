import { useState, useEffect, useRef } from 'react';

// قائمة بالمسارات الموسيقية الحماسية
// استخدام عناوين URL للموسيقى المتاحة مجاناً عبر الإنترنت
const musicTracks = [
  {
    title: "Background Music",
    artist: "Poker Game",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Casino Lounge",
    artist: "Game Sounds",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Poker Night",
    artist: "Card Music",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "High Stakes",
    artist: "Casino Beats",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    title: "Royal Vibes",
    artist: "Poker Club",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
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
    audio.volume = 0.2; // مستوى صوت منخفض جداً للبداية
    audio.loop = false; // عدم تكرار الأغنية الواحدة
    
    // تشغيل الأغنية التالية عند انتهاء الحالية
    audio.onended = () => {
      setCurrentTrackIndex(prev => (prev + 1) % musicTracks.length);
    };
    
    audioRef.current = audio;
    
    // تحريك الأغاني بشكل عشوائي عند التحميل
    shuffleTracks();
    
    // التأكد من أن تشغيل الصوت يحدث فقط بعد تفاعل المستخدم مع الصفحة
    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("تعذر تشغيل المسار الصوتي بعد تفاعل المستخدم", error);
          });
        }
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
    
    // تفريغ عنصر الصوت وإزالة مستمعي الأحداث عند التدمير
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
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
      }, 3000);
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
        }, 3000);
      });
    }
    
    // تنظيف عند إزالة المكون
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