/**
 * إدارة الصوت للعبة ملكة مصر ثلاثية الأبعاد
 * يدير جميع الأصوات والموسيقى في اللعبة
 */

class AudioManager {
  constructor() {
    // الأصوات المستخدمة في اللعبة
    this.sounds = {
      bgMusic: null,          // الموسيقى الخلفية
      spin: null,             // صوت الدوران
      win: null,              // صوت الفوز العادي
      bigWin: null,           // صوت الفوز الكبير
      superWin: null,         // صوت السوبر وين
      freeSpins: null,        // صوت اللفات المجانية
      click: null,            // صوت النقر على الأزرار
      coinDrop: null,         // صوت إضافة العملات
      spinStop: null,         // صوت توقف البكرات
      introCinematic: null    // صوت المشهد السينمائي
    };
    
    // مراجع لعناصر الصوت الحالية
    this.audioElements = {};
    
    // حالة الصوت
    this.isMuted = false;
    this.musicVolume = 0.5;   // مستوى صوت الموسيقى (0-1)
    this.effectsVolume = 0.7; // مستوى صوت المؤثرات (0-1)
    
    // العداد لإنشاء WebAudio على بعض المتصفحات
    this.audioContext = null;
    this.gainNode = null;
    
    // التهيئة
    this._initAudioContext();
  }

  /**
   * تهيئة سياق الصوت للمتصفحات التي تتطلب ذلك
   * @private
   */
  _initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1;
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('لا يمكن تهيئة سياق الصوت:', error);
    }
  }

  /**
   * تنشيط سياق الصوت (لبعض المتصفحات التي تتطلب تفاعل المستخدم)
   */
  activate() {
    // تنشيط سياق الصوت إذا كان متوقفاً
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        console.warn('لا يمكن تنشيط سياق الصوت:', error);
      });
    }
  }

  /**
   * تحميل الأصوات المطلوبة في اللعبة
   * @param {Function} onProgress - دالة callback للإبلاغ عن تقدم التحميل (0-1)
   * @param {Function} onComplete - دالة callback عند اكتمال تحميل جميع الملفات
   */
  loadSounds(onProgress, onComplete) {
    // قائمة الملفات الصوتية الافتراضية - وفي حالة عدم توفرها سننشئ أصوات بديلة
    const audioFiles = {
      bgMusic: 'audio/egypt-theme.mp3',
      spin: 'audio/spin.mp3',
      win: 'audio/win.mp3',
      bigWin: 'audio/big-win.mp3',
      superWin: 'audio/super-win.mp3',
      freeSpins: 'audio/free-spins.mp3',
      click: 'audio/click.mp3',
      coinDrop: 'audio/coin-drop.mp3',
      spinStop: 'audio/spin-stop.mp3',
      introCinematic: 'audio/intro.mp3'
    };
    
    // نظراً لأن الملفات الصوتية قد لا تكون متوفرة، سننشئ أصوات بديلة باستخدام Web Audio API
    this._createFallbackSounds();
    
    // تنفيذ دالة الاكتمال
    if (onComplete) {
      onComplete();
    }
  }

  /**
   * إنشاء أصوات بديلة باستخدام Web Audio API
   * @private
   */
  _createFallbackSounds() {
    if (!this.audioContext) return;
    
    // سننشئ أصوات بسيطة كبديل للملفات الصوتية
    
    // 1. صوت الدوران - نغمة قصيرة مع تأثير vibrato
    this.sounds.spin = (frequency = 400, duration = 0.3) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.frequency.setValueCurveAtTime(
        [frequency, frequency + 50, frequency],
        this.audioContext.currentTime,
        duration
      );
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
    
    // 2. صوت الفوز - سلسلة نغمات صاعدة
    this.sounds.win = (baseFrequency = 400, duration = 0.8) => {
      const notes = [0, 4, 7, 12]; // C, E, G, C (نغمات متناغمة)
      
      notes.forEach((note, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        const frequency = baseFrequency * Math.pow(2, note / 12);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + index * 0.15 + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + index * 0.15 + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
      });
    };
    
    // 3. صوت الفوز الكبير - نغمات متعددة مع تأثير vibrato وصدى
    this.sounds.bigWin = (baseFrequency = 400, duration = 1.5) => {
      const notes = [0, 4, 7, 12, 7, 4, 7, 12, 16]; // مقياس موسيقي صاعد ونازل
      
      notes.forEach((note, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        const frequency = baseFrequency * Math.pow(2, note / 12);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.frequency.setValueCurveAtTime(
          [frequency, frequency * 1.01, frequency],
          this.audioContext.currentTime + index * 0.15,
          0.15
        );
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + index * 0.15 + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + index * 0.15 + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.4);
      });
      
      // نعيد الصوت مرة أخرى بتردد أعلى كصدى
      setTimeout(() => {
        notes.forEach((note, index) => {
          if (index % 2 === 0) { // نلعب نصف النغمات فقط للصدى
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            const frequency = baseFrequency * 2 * Math.pow(2, note / 12);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.3, this.audioContext.currentTime + index * 0.1 + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + index * 0.1 + 0.2);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + index * 0.1 + 0.3);
          }
        });
      }, 300);
    };
    
    // 4. صوت اللفات المجانية - نغمة مميزة مع ترددات عالية
    this.sounds.freeSpins = (baseFrequency = 600, duration = 1.0) => {
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(baseFrequency, this.audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(baseFrequency * 1.5, this.audioContext.currentTime + duration * 0.5);
      oscillator1.frequency.exponentialRampToValueAtTime(baseFrequency * 2, this.audioContext.currentTime + duration);
      
      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(baseFrequency * 1.5, this.audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(baseFrequency * 2, this.audioContext.currentTime + duration * 0.5);
      oscillator2.frequency.exponentialRampToValueAtTime(baseFrequency * 3, this.audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.7, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + duration * 0.5);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(this.audioContext.currentTime + duration);
      oscillator2.stop(this.audioContext.currentTime + duration);
      
      // إضافة صوت طبول
      setTimeout(() => {
        this._playDrumSound(100, 0.3);
        setTimeout(() => this._playDrumSound(100, 0.3), 200);
        setTimeout(() => this._playDrumSound(100, 0.5), 400);
      }, 300);
    };
    
    // 5. صوت النقر - نقرة بسيطة
    this.sounds.click = (frequency = 800, duration = 0.1) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
    
    // 6. صوت سقوط العملات
    this.sounds.coinDrop = (count = 5) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const frequency = 1200 + Math.random() * 400;
          const duration = 0.1 + Math.random() * 0.2;
          
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + duration);
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.7, this.audioContext.currentTime + 0.01);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.gainNode);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + duration);
        }, i * 100);
      }
    };
    
    // 7. صوت توقف البكرات
    this.sounds.spinStop = (frequency = 300, duration = 0.2) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency * 1.5, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency, this.audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.5, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
    
    // 8. موسيقى الخلفية - تفعل بشكل منفصل
    this.sounds.bgMusic = () => {
      // سننشئ نغمات متكررة بإيقاع مصري
      this._createBackgroundMusicLoop();
    };
    
    // 9. صوت المشهد السينمائي
    this.sounds.introCinematic = () => {
      // سلسلة من النغمات المنسقة
      const notes = [0, 4, 7, 12, 16, 12, 7, 4, 0, -5, 0, 4, 7];
      const baseFrequency = 200;
      
      notes.forEach((note, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          const frequency = baseFrequency * Math.pow(2, note / 12);
          
          oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
          oscillator.frequency.value = frequency;
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.6, this.audioContext.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.6);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.gainNode);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.7);
          
          // إضافة صوت طبول في بعض النقاط
          if (index % 4 === 0) {
            this._playDrumSound(80, 0.4);
          }
        }, index * 300);
      });
    };
    
    // 10. صوت السوبر وين
    this.sounds.superWin = () => {
      // موسيقى فرعونية احتفالية
      const baseFrequency = 300;
      const notes1 = [0, 0, 4, 7, 7, 4, 0, -5, -5, 0];
      const notes2 = [12, 12, 16, 19, 19, 16, 12, 7, 7, 12];
      const durations = [0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.4, 0.2, 0.8];
      
      let time = 0;
      
      // النغمات الرئيسية
      notes1.forEach((note, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          const frequency = baseFrequency * Math.pow(2, note / 12);
          
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + durations[index]);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.gainNode);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + durations[index] + 0.1);
          
          // إضافة صوت طبول
          if (index % 2 === 0) {
            this._playDrumSound(100, 0.3);
          }
        }, time * 1000);
        
        time += durations[index];
      });
      
      // النغمات الثانوية (أعلى)
      time = 0.1; // تأخير قليل عن النغمات الرئيسية
      notes2.forEach((note, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          const frequency = baseFrequency * Math.pow(2, note / 12);
          
          oscillator.type = 'triangle';
          oscillator.frequency.value = frequency;
          
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.effectsVolume * 0.4, this.audioContext.currentTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + durations[index]);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.gainNode);
          
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + durations[index] + 0.1);
        }, time * 1000);
        
        time += durations[index];
      });
    };
  }

  /**
   * تشغيل صوت الطبل
   * @param {number} frequency - تردد الطبل
   * @param {number} duration - مدة الصوت بالثواني
   * @private
   */
  _playDrumSound(frequency, duration) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.effectsVolume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * إنشاء حلقة موسيقية مصرية للخلفية
   * @private
   */
  _createBackgroundMusicLoop() {
    if (!this.audioContext) return;
    
    // استمرار الخلفية
    this.bgMusicInterval = setInterval(() => {
      if (this.isMuted) return;
      
      // إيقاع مصري بسيط
      const baseFrequency = 200;
      const rhythmPattern = [
        { note: 0, duration: 0.3, type: 'drum' },
        { note: 7, duration: 0.2, type: 'melody' },
        { note: 4, duration: 0.2, type: 'melody' },
        { note: 0, duration: 0.3, type: 'drum' },
        { note: 0, duration: 0.3, type: 'melody' },
        { note: -5, duration: 0.2, type: 'melody' },
        { note: 0, duration: 0.2, type: 'melody' },
        { note: 0, duration: 0.3, type: 'drum' }
      ];
      
      let time = 0;
      rhythmPattern.forEach(item => {
        setTimeout(() => {
          if (item.type === 'drum') {
            this._playDrumSound(80, 0.3);
          } else {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            const frequency = baseFrequency * Math.pow(2, item.note / 12);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.3, this.audioContext.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + item.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + item.duration + 0.1);
          }
        }, time * 1000);
        
        time += item.duration;
      });
    }, 3000); // تكرار كل 3 ثوانٍ
  }

  /**
   * تشغيل صوت
   * @param {string} soundName - اسم الصوت المراد تشغيله
   * @param {Object} options - خيارات إضافية للصوت
   */
  play(soundName, options = {}) {
    if (this.isMuted) return;
    
    // تنشيط سياق الصوت
    this.activate();
    
    // تشغيل الصوت المطلوب
    const sound = this.sounds[soundName];
    if (typeof sound === 'function') {
      sound(options.frequency, options.duration);
    } else {
      console.warn(`الصوت ${soundName} غير موجود أو غير مدعوم.`);
    }
  }

  /**
   * بدء تشغيل الموسيقى الخلفية
   */
  startBackgroundMusic() {
    // إيقاف أي موسيقى سابقة
    this.stopBackgroundMusic();
    
    // تنشيط سياق الصوت
    this.activate();
    
    // بدء الموسيقى الخلفية
    if (this.sounds.bgMusic && typeof this.sounds.bgMusic === 'function') {
      this.sounds.bgMusic();
    }
  }

  /**
   * إيقاف الموسيقى الخلفية
   */
  stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }

  /**
   * كتم/إلغاء كتم جميع الأصوات
   * @param {boolean} mute - كتم الصوت (true) أو إلغاء الكتم (false)
   */
  setMute(mute) {
    this.isMuted = mute;
    
    if (mute) {
      this.stopBackgroundMusic();
      
      // كتم صوت الإخراج الرئيسي
      if (this.gainNode) {
        this.gainNode.gain.value = 0;
      }
    } else {
      // إعادة تشغيل الموسيقى الخلفية
      this.startBackgroundMusic();
      
      // إلغاء كتم صوت الإخراج الرئيسي
      if (this.gainNode) {
        this.gainNode.gain.value = 1;
      }
    }
    
    return this.isMuted;
  }

  /**
   * تعيين مستوى صوت الموسيقى
   * @param {number} volume - مستوى الصوت (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * تعيين مستوى صوت المؤثرات
   * @param {number} volume - مستوى الصوت (0-1)
   */
  setEffectsVolume(volume) {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
  }
}

// تصدير مدير الصوت للاستخدام في الملفات الأخرى
const audioManager = new AudioManager();