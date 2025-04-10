import React, { useEffect, useRef, useState } from 'react';

interface SoundSystemProps {
  muted?: boolean;
}

/**
 * نظام الصوت للعبة ملكة مصر ثلاثية الأبعاد
 * يدير كل الأصوات والموسيقى في اللعبة
 */
const SoundSystem: React.FC<SoundSystemProps> = ({ muted = false }) => {
  const [isMuted, setIsMuted] = useState<boolean>(muted);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // تهيئة نظام الصوت
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        // تعيين حالة كتم الصوت
        setMuteState(isMuted);
        
        // توليد نغمة صوتية مصرية بسيطة
        generateEgyptianMelody();
      }
    } catch (error) {
      console.error("خطأ في تهيئة نظام الصوت:", error);
    }

    return () => {
      // إيقاف الصوت عند تدمير المكون
      stopAllSounds();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(console.error);
      }
    };
  }, []);

  // تطبيق حالة كتم الصوت
  useEffect(() => {
    setMuteState(isMuted);
  }, [isMuted]);

  // تعيين حالة كتم الصوت
  const setMuteState = (muted: boolean) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = muted ? 0 : 0.5;
    }
  };

  // إيقاف جميع الأصوات
  const stopAllSounds = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.stop();
      bgMusicRef.current = null;
    }
  };

  // توليد نغمة صوتية مصرية
  const generateEgyptianMelody = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    // إيقاف النغمة السابقة إذا كانت موجودة
    if (bgMusicRef.current) {
      bgMusicRef.current.stop();
    }

    // تأخير توليد النغمة حتى يكون هناك تفاعل من المستخدم
    if (audioContextRef.current.state === 'suspended') {
      return;
    }

    // النوتات الموسيقية المصرية التقليدية (مقام صبا)
    const notes = [
      { note: 0, duration: 0.5 },    // دو
      { note: 3, duration: 0.25 },   // مي بيمول
      { note: 5, duration: 0.25 },   // صول
      { note: 7, duration: 0.5 },    // سي بيمول
      { note: 5, duration: 0.25 },   // صول
      { note: 3, duration: 0.25 },   // مي بيمول
      { note: 0, duration: 0.5 },    // دو
      { note: -2, duration: 0.5 },   // لا
      { note: 0, duration: 0.5 },    // دو
    ];

    // التردد الأساسي
    const baseFrequency = 220; // A3
    
    // وقت البدء
    let startTime = audioContextRef.current.currentTime;
    
    // إنشاء النغمات
    notes.forEach(({ note, duration }) => {
      // حساب التردد بناءً على النوتة
      const frequency = baseFrequency * Math.pow(2, note / 12);
      
      // إنشاء المذبذب
      const oscillator = audioContextRef.current!.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // إنشاء مغلف الصوت
      const gainNode = audioContextRef.current!.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      // توصيل العقد
      oscillator.connect(gainNode);
      gainNode.connect(gainNodeRef.current!);
      
      // تشغيل المذبذب
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.05);
      
      // تحديث وقت البدء للنوتة التالية
      startTime += duration;
    });
  };

  // للأغراض التصحيحية والتطوير، نعرض مكون شفاف - لن يظهر في واجهة المستخدم
  return <div className="sound-system-component" style={{ display: 'none' }} />;
};

export default SoundSystem;