// هذا الملف يمكن استخدامه في المتصفح لإنشاء وتشغيل موسيقى وأصوات اللعبة

class EgyptSoundEffect {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      // إنشاء سياق الصوت
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.error('خطأ في إنشاء سياق الصوت:', e);
    }
  }

  // صوت دوران البكرات
  createSpinSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 1.5;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + duration);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
  }

  // صوت الفوز
  createWinSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 1.5;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(500, this.audioContext.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(700, this.audioContext.currentTime + duration);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(1000, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
  }

  // صوت الفوز الكبير
  createBigWinSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 2;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(1000, this.audioContext.currentTime + duration);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(900, this.audioContext.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + duration);
    
    oscillator3.type = 'triangle';
    oscillator3.frequency.setValueAtTime(450, this.audioContext.currentTime);
    oscillator3.frequency.linearRampToValueAtTime(700, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
    oscillator3.stop(this.audioContext.currentTime + duration);
  }

  // صوت تفعيل لعبة المكافأة
  createBonusSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 2.5;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + duration);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(1100, this.audioContext.currentTime + duration);
    
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(700, this.audioContext.currentTime);
    oscillator3.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    
    // إنشاء تأثير النبض
    const now = this.audioContext.currentTime;
    const pulseCount = 5;
    const pulseInterval = duration / pulseCount;
    
    for (let i = 0; i < pulseCount; i++) {
      gainNode.gain.setValueAtTime(0.2, now + i * pulseInterval);
      gainNode.gain.exponentialRampToValueAtTime(0.05, now + (i + 0.5) * pulseInterval);
    }
    
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    oscillator3.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
    oscillator3.stop(this.audioContext.currentTime + duration);
  }

  // صوت النقر على الأزرار
  createClickSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 0.15;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(700, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // صوت فتح صندوق الكنز في لعبة المكافأة
  createChestOpenSound() {
    if (!this.audioContext) this.init();
    if (!this.initialized) return;
    
    const duration = 1;
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator1.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + duration);
    
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(500, this.audioContext.currentTime);
    oscillator2.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(this.audioContext.currentTime + duration);
    oscillator2.stop(this.audioContext.currentTime + duration);
  }
}

// تصدير الكلاس ليكون متاحًا للاستخدام
if (typeof window !== 'undefined') {
  window.EgyptSoundEffect = EgyptSoundEffect;
}

// للاختبار في Node.js
if (typeof module !== 'undefined') {
  module.exports = { EgyptSoundEffect };
}