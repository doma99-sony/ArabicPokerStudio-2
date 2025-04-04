import { useState, useEffect, useRef } from 'react';

// قائمة بالأغاني الأجنبية الحماسية المناسبة للتطبيق
// استخدام مصادر أغاني حقيقية متاحة عبر الإنترنت
const musicTracks = [
  {
    title: "High Energy",
    artist: "Rock Stars",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
  },
  {
    title: "Electric Pulse",
    artist: "DJ Beatmaster",
    src: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3"
  },
  {
    title: "Casino Royale",
    artist: "James Bond",
    src: "https://storage.googleapis.com/media-session/big-buck-bunny/prelude.mp3"
  },
  {
    title: "Power Play",
    artist: "Game Masters",
    src: "https://dl.dropboxusercontent.com/s/8c9m92u1euqnkl3/Michael%20Jackson%20-%20Rock%20With%20You.mp3"
  },
  {
    title: "Poker Night",
    artist: "Card Kings",
    src: "https://dl.dropboxusercontent.com/s/rk5e6qb7vjqnxrh/Eurythmics%20-%20Sweet%20Dreams.mp3"
  },
  {
    title: "Victory Dance",
    artist: "Winners Circle",
    src: "https://dl.dropboxusercontent.com/s/38qrdl6sdf4j6d5/Michael%20Jackson%20-%20Billie%20Jean.mp3"
  },
  {
    title: "All In",
    artist: "Vegas Players",
    src: "https://dl.dropboxusercontent.com/s/qn33hbt5t1blmhu/Metallica%20-%20Nothing%20Else%20Matters.mp3"
  },
  {
    title: "Royal Flush",
    artist: "Ace Squad",
    src: "https://dl.dropboxusercontent.com/s/a9fa06cgzz3hm30/Eagles%20-%20Hotel%20California.mp3"
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
    audio.volume = 0.65; // مستوى صوت مرتفع نسبياً للأغاني الحماسية
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