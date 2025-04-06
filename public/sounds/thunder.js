/**
 * مشغل الأصوات للتأثيرات الصوتية
 * يستخدم Web Audio API لتشغيل أصوات الرعد والبرق
 */
class ThunderSoundPlayer {
  constructor() {
    // إنشاء AudioContext فقط عندما يتفاعل المستخدم مع الصفحة
    this.audioContext = null;
    this.thunderSounds = [];
    this.volumeLevel = 0.2; // مستوى صوت منخفض افتراضي
    this.isEnabled = false; // تعطيل الأصوات افتراضيًا
    
    // تسجيل أحداث التفاعل
    document.addEventListener('click', () => this.initAudio(), { once: true });
  }
  
  // تهيئة سياق الصوت عند أول تفاعل
  initAudio() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // إنشاء أصوات الرعد الاصطناعية
      this.createThunderSounds();
      
      console.log('تم تهيئة نظام الصوت بنجاح');
    } catch (error) {
      console.error('فشل في تهيئة نظام الصوت:', error);
    }
  }
  
  // إنشاء أصوات الرعد المختلفة
  createThunderSounds() {
    const createThunder = (duration, frequency, type = 'sawtooth') => {
      const fadeInTime = 0.01;
      const fadeOutTime = duration - 0.05;
      
      return () => {
        if (!this.audioContext || !this.isEnabled) return;
        
        // إنشاء مصدر الصوت
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // تكوين النغمة
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          frequency / 10, 
          this.audioContext.currentTime + duration * 0.8
        );
        
        // تكوين مستوى الصوت
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          this.volumeLevel, 
          this.audioContext.currentTime + fadeInTime
        );
        gainNode.gain.linearRampToValueAtTime(
          0, 
          this.audioContext.currentTime + fadeOutTime
        );
        
        // توصيل وتشغيل
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
      };
    };
    
    // إنشاء ثلاثة أنواع مختلفة من الرعد
    this.thunderSounds = [
      createThunder(1.5, 80, 'sawtooth'),  // رعد قريب وقوي
      createThunder(2.0, 60, 'sawtooth'),  // رعد متوسط
      createThunder(3.0, 40, 'triangle'),  // رعد بعيد
    ];
  }
  
  // تشغيل صوت الرعد
  playThunder(type = 'random') {
    if (!this.audioContext || !this.isEnabled || this.thunderSounds.length === 0) {
      if (!this.audioContext) this.initAudio();
      return;
    }
    
    let soundIndex;
    
    if (type === 'random') {
      soundIndex = Math.floor(Math.random() * this.thunderSounds.length);
    } else if (type === 'close') {
      soundIndex = 0;
    } else if (type === 'medium') {
      soundIndex = 1;
    } else {
      soundIndex = 2; // بعيد
    }
    
    this.thunderSounds[soundIndex]();
    console.log(`تشغيل صوت الرعد من النوع: ${type}, بمؤشر: ${soundIndex}`);
  }
  
  // تفعيل/تعطيل الأصوات
  toggleSounds(enabled) {
    this.isEnabled = enabled;
    if (enabled && !this.audioContext) {
      this.initAudio();
    }
    return this.isEnabled;
  }
  
  // تعديل مستوى الصوت
  setVolume(level) {
    this.volumeLevel = Math.max(0, Math.min(1, level));
    console.log(`تم ضبط مستوى الصوت على ${this.volumeLevel * 100}%`);
    return this.volumeLevel;
  }
}

// إنشاء كائن عالمي لمشغل الأصوات
window.thunderSoundPlayer = new ThunderSoundPlayer();

// ربط نظام الصوت بتأثيرات البرق
document.addEventListener('DOMContentLoaded', () => {
  const setupThunderSounds = () => {
    const lightningEffect = document.querySelector('.lightning-effect');
    const lightningEffectDelayed = document.querySelector('.lightning-effect-delayed');
    
    if (lightningEffect) {
      // مراقبة تغييرات التحريك
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style' && 
              window.getComputedStyle(lightningEffect).backgroundColor !== 'rgba(255, 255, 255, 0)') {
            window.thunderSoundPlayer.playThunder('close');
          }
        });
      });
      
      observer.observe(lightningEffect, { attributes: true });
    }
    
    if (lightningEffectDelayed) {
      // مراقبة تغييرات التحريك المتأخر
      const observerDelayed = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style' && 
              window.getComputedStyle(lightningEffectDelayed).backgroundColor !== 'rgba(255, 255, 255, 0)') {
            setTimeout(() => {
              window.thunderSoundPlayer.playThunder('medium');
            }, 300);
          }
        });
      });
      
      observerDelayed.observe(lightningEffectDelayed, { attributes: true });
    }
  };
  
  // التحقق من وجود عناصر تأثير البرق
  if (document.querySelector('.lightning-effect')) {
    setupThunderSounds();
  } else {
    // انتظار تحميل العناصر
    const checkExist = setInterval(() => {
      if (document.querySelector('.lightning-effect')) {
        clearInterval(checkExist);
        setupThunderSounds();
      }
    }, 500);
    
    // إيقاف التحقق بعد 10 ثوانٍ (في حالة عدم تحميل العناصر)
    setTimeout(() => {
      clearInterval(checkExist);
    }, 10000);
  }
  
  // إضافة تحكم في مستوى الصوت
  document.addEventListener('keydown', (e) => {
    // Alt + Up Arrow: رفع مستوى الصوت
    if (e.altKey && e.key === 'ArrowUp') {
      const newLevel = window.thunderSoundPlayer.setVolume(window.thunderSoundPlayer.volumeLevel + 0.05);
      console.log(`تم ضبط مستوى الصوت على ${Math.round(newLevel * 100)}%`);
    }
    // Alt + Down Arrow: خفض مستوى الصوت
    else if (e.altKey && e.key === 'ArrowDown') {
      const newLevel = window.thunderSoundPlayer.setVolume(window.thunderSoundPlayer.volumeLevel - 0.05);
      console.log(`تم ضبط مستوى الصوت على ${Math.round(newLevel * 100)}%`);
    }
    // Alt + M: كتم/تشغيل الصوت
    else if (e.altKey && e.key === 'm') {
      const isEnabled = window.thunderSoundPlayer.toggleSounds(!window.thunderSoundPlayer.isEnabled);
      console.log(`تم ${isEnabled ? 'تفعيل' : 'تعطيل'} الأصوات`);
    }
  });
});
