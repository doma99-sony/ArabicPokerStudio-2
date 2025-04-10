// مولد الأصوات للعبة كتاب الفرعون
// يستخدم Web Audio API لتوليد الأصوات برمجياً بدلاً من استخدام ملفات صوت

/**
 * مولد الأصوات - ينشئ أصوات اللعبة برمجياً بدلاً من الاعتماد على ملفات خارجية
 */
class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private masterVolume = 0.4; // مستوى الصوت الرئيسي (1.0 = 100%)
  
  /**
   * تهيئة مولد الصوت
   */
  initialize() {
    if (this.isInitialized) return;
    
    // إنشاء سياق الصوت (مدعوم في جميع المتصفحات الحديثة)
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء عقدة التحكم في مستوى الصوت
      if (this.audioContext) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.masterVolume;
        this.gainNode.connect(this.audioContext.destination);
        this.isInitialized = true;
        console.log('تم تهيئة مولد الصوت بنجاح');
      }
    } catch (error) {
      console.error('فشل تهيئة مولد الصوت:', error);
    }
  }
  
  /**
   * توليد صوت الدوران
   */
  generateSpinSound() {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      this.initialize();
      if (!this.isInitialized) return;
    }
    
    try {
      // إنشاء المذبذب
      const oscillator = this.audioContext!.createOscillator();
      
      // إعداد المذبذب لصوت دوران البكرات
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(400, this.audioContext!.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext!.currentTime + 0.3);
      
      // عقدة التضخيم للتحكم في مستوى الصوت
      const gainNode = this.audioContext!.createGain();
      gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);
      
      // توصيل العقد
      oscillator.connect(gainNode);
      if (this.gainNode) {
        gainNode.connect(this.gainNode);
      }
      
      // تشغيل الصوت وإيقافه
      oscillator.start();
      oscillator.stop(this.audioContext!.currentTime + 0.3);
    } catch (error) {
      console.log('تم تجاهل خطأ تشغيل الصوت spin:', error);
    }
  }
  
  /**
   * توليد صوت الفوز
   * @param bigWin هل هو فوز كبير؟
   */
  generateWinSound(bigWin = false) {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      this.initialize();
      if (!this.isInitialized) return;
    }
    
    try {
      // أصوات مختلفة حسب نوع الفوز
      if (bigWin) {
        this.generateBigWinSound();
      } else {
        this.generateNormalWinSound();
      }
    } catch (error) {
      console.log('تم تجاهل خطأ تشغيل الصوت win:', error);
    }
  }
  
  /**
   * توليد صوت الفوز العادي
   */
  private generateNormalWinSound() {
    // إنشاء المذبذبات
    const oscillator1 = this.audioContext!.createOscillator();
    const oscillator2 = this.audioContext!.createOscillator();
    
    // إعداد المذبذبات
    oscillator1.type = 'sine';
    oscillator2.type = 'triangle';
    
    // إعداد الترددات
    oscillator1.frequency.setValueAtTime(440, this.audioContext!.currentTime); // A4
    oscillator1.frequency.setValueAtTime(523.25, this.audioContext!.currentTime + 0.1); // C5
    oscillator1.frequency.setValueAtTime(659.25, this.audioContext!.currentTime + 0.2); // E5
    
    oscillator2.frequency.setValueAtTime(440 * 2, this.audioContext!.currentTime);
    oscillator2.frequency.setValueAtTime(523.25 * 2, this.audioContext!.currentTime + 0.1);
    oscillator2.frequency.setValueAtTime(659.25 * 2, this.audioContext!.currentTime + 0.2);
    
    // عقدة التضخيم للتحكم في مستوى الصوت
    const gainNode1 = this.audioContext!.createGain();
    const gainNode2 = this.audioContext!.createGain();
    
    gainNode1.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.5);
    
    gainNode2.gain.setValueAtTime(0.05, this.audioContext!.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.005, this.audioContext!.currentTime + 0.5);
    
    // توصيل العقد
    oscillator1.connect(gainNode1);
    oscillator2.connect(gainNode2);
    
    gainNode1.connect(this.gainNode!);
    gainNode2.connect(this.gainNode!);
    
    // تشغيل الصوت وإيقافه
    oscillator1.start();
    oscillator2.start();
    
    oscillator1.stop(this.audioContext!.currentTime + 0.5);
    oscillator2.stop(this.audioContext!.currentTime + 0.5);
  }
  
  /**
   * توليد صوت الفوز الكبير
   */
  private generateBigWinSound() {
    // إعداد أكثر تعقيداً للفوز الكبير
    const notes = [
      { note: 523.25, duration: 0.1 }, // C5
      { note: 587.33, duration: 0.1 }, // D5
      { note: 659.25, duration: 0.1 }, // E5
      { note: 698.46, duration: 0.1 }, // F5
      { note: 783.99, duration: 0.1 }, // G5
      { note: 880.00, duration: 0.1 }, // A5
      { note: 987.77, duration: 0.3 }  // B5
    ];
    
    // عقدة التضخيم الرئيسية
    const mainGain = this.audioContext!.createGain();
    mainGain.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
    mainGain.connect(this.gainNode!);
    
    // إنشاء المذبذبات لكل نغمة
    let time = this.audioContext!.currentTime;
    
    notes.forEach((note, index) => {
      // المذبذب الأساسي
      const oscillator = this.audioContext!.createOscillator();
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(note.note, time);
      
      // عقدة تضخيم خاصة بهذه النغمة
      const noteGain = this.audioContext!.createGain();
      noteGain.gain.setValueAtTime(0.2, time);
      noteGain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      // توصيل المذبذب
      oscillator.connect(noteGain);
      noteGain.connect(mainGain);
      
      // تشغيل المذبذب وإيقافه
      oscillator.start(time);
      oscillator.stop(time + note.duration + 0.05);
      
      // تحديث الوقت للنغمة التالية
      time += note.duration;
    });
  }
  
  /**
   * توليد صوت دورات مجانية
   */
  generateFreespinSound() {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) {
      this.initialize();
      if (!this.isInitialized) return;
    }
    
    try {
      // الوقت الحالي
      const now = this.audioContext!.currentTime;
      
      // إنشاء المذبذبات
      const oscillator1 = this.audioContext!.createOscillator();
      const oscillator2 = this.audioContext!.createOscillator();
      const oscillator3 = this.audioContext!.createOscillator();
      
      // إعداد أنواع المذبذبات
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      oscillator3.type = 'square';
      
      // إعداد الترددات
      oscillator1.frequency.setValueAtTime(523.25, now); // C5
      oscillator1.frequency.exponentialRampToValueAtTime(698.46, now + 0.2); // F5
      oscillator1.frequency.exponentialRampToValueAtTime(880.00, now + 0.4); // A5
      
      oscillator2.frequency.setValueAtTime(523.25 * 2, now); // C6
      oscillator2.frequency.exponentialRampToValueAtTime(698.46 * 2, now + 0.3); // F6
      
      oscillator3.frequency.setValueAtTime(261.63, now); // C4
      oscillator3.frequency.exponentialRampToValueAtTime(349.23, now + 0.5); // F4
      
      // عقد التضخيم
      const gainNode1 = this.audioContext!.createGain();
      const gainNode2 = this.audioContext!.createGain();
      const gainNode3 = this.audioContext!.createGain();
      
      gainNode1.gain.setValueAtTime(0.15, now);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      gainNode2.gain.setValueAtTime(0.07, now);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      gainNode3.gain.setValueAtTime(0.05, now);
      gainNode3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      
      // إضافة تأثير الصدى
      if (typeof this.audioContext!.createDelay === 'function') {
        const delay = this.audioContext!.createDelay();
        delay.delayTime.value = 0.2;
        
        const feedbackGain = this.audioContext!.createGain();
        feedbackGain.gain.value = 0.3;
        
        // توصيل حلقة التأخير
        gainNode1.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        feedbackGain.connect(this.gainNode!);
      }
      
      // توصيل العقد
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      oscillator3.connect(gainNode3);
      
      gainNode1.connect(this.gainNode!);
      gainNode2.connect(this.gainNode!);
      gainNode3.connect(this.gainNode!);
      
      // تشغيل المذبذبات
      oscillator1.start();
      oscillator2.start();
      oscillator3.start();
      
      // إيقاف المذبذبات
      oscillator1.stop(now + 0.7);
      oscillator2.stop(now + 0.6);
      oscillator3.stop(now + 0.8);
    } catch (error) {
      console.log('تم تجاهل خطأ تشغيل الصوت freespin:', error);
    }
  }
  
  /**
   * ضبط مستوى الصوت الرئيسي
   * @param volume مستوى الصوت (0.0 إلى 1.0)
   */
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = this.masterVolume;
    }
  }
  
  /**
   * تفعيل الصوت (يحتاج إلى تفاعل المستخدم أولاً)
   */
  activate() {
    this.initialize();
    
    // تشغيل صوت صامت لتفعيل نظام الصوت (يتطلب تفاعل المستخدم)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// إنشاء نسخة واحدة للاستخدام في جميع أنحاء التطبيق
const audioGenerator = new AudioGenerator();

export default audioGenerator;