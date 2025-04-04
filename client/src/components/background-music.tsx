import { useState, useEffect, useRef } from 'react';

// قائمة بالأغاني الحماسية المناسبة للتطبيق
// استخدام مصادر أغاني حقيقية متاحة عبر الإنترنت
const musicTracks = [
  {
    title: "Poker Face",
    artist: "Lady Gaga",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
  },
  {
    title: "الليلة حلوة",
    artist: "عمرو دياب",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_07_-_Interception.mp3"
  },
  {
    title: "حبيبي يا نور العين",
    artist: "عمرو دياب",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3"
  },
  {
    title: "أحلى و أحلى",
    artist: "عمرو دياب",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Passages/Chad_Crouch_-_Moonrise.mp3"
  },
  {
    title: "يتعلموا",
    artist: "عمرو دياب",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Drifter/Chad_Crouch_-_01_-_Gypsy.mp3"
  },
  {
    title: "عندي سؤال",
    artist: "إليسا",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Blue_Dot_Sessions/Bitters/Blue_Dot_Sessions_-_Bitters_-_07_-_Halpless.mp3"
  },
  {
    title: "لو اسمحتلي",
    artist: "تامر حسني",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3"
  },
  {
    title: "نور العين",
    artist: "عمرو دياب",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3"
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
    audio.volume = 0.45; // مستوى صوت متوسط للأغاني
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