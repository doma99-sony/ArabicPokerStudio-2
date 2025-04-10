/**
 * ملف الوظائف المساعدة
 * يحتوي على وظائف مشتركة مستخدمة في مختلف أجزاء اللعبة
 */

/**
 * مولد الأصوات باستخدام Web Audio API
 * يستخدم لإنشاء الأصوات برمجياً بدلاً من تحميل ملفات صوتية
 */
class AudioGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isActive = false;
  }
  
  /**
   * تهيئة مولد الأصوات
   */
  initialize() {
    try {
      // إنشاء سياق الصوت
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // إنشاء عقدة التحكم الرئيسية في الصوت
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.5; // مستوى الصوت الافتراضي
      this.masterGain.connect(this.audioContext.destination);
      
      console.log('تم تحميل سكريبت تأثيرات الصوت بنجاح');
      this.isActive = true;
    } catch (error) {
      console.warn('لا يمكن تهيئة Web Audio API:', error);
      this.isActive = false;
    }
  }
  
  /**
   * تنشيط سياق الصوت (مطلوب في بعض المتصفحات بعد تفاعل المستخدم)
   */
  activate() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(error => {
        console.warn('فشل تنشيط سياق الصوت:', error);
      });
    }
  }
  
  /**
   * تعيين مستوى الصوت الرئيسي
   * @param {number} value - مستوى الصوت (0-1)
   */
  setMasterVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  /**
   * إنشاء صوت الدوران
   */
  generateSpinSound() {
    if (!this.isActive) return;
    
    try {
      // إنشاء مذبذب للصوت
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // إعداد المذبذب
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
      
      // إعداد عقدة التحكم بالصوت
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
      
      // توصيل العقد
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // تشغيل الصوت
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('فشل إنشاء صوت الدوران:', error);
    }
  }

  /**
   * إنشاء صوت الفوز
   * @param {boolean} isBig - هل هو فوز كبير؟
   */
  generateWinSound(isBig = false) {
    if (!this.isActive) return;
    
    try {
      // صوت الفوز يتكون من عدة نغمات متتالية
      const notes = isBig ? 
        [0, 4, 7, 12, 16] : // فوز كبير: C, E, G, C(أعلى), E(أعلى)
        [0, 4, 7];          // فوز عادي: C, E, G
      
      const baseFrequency = 300;
      
      notes.forEach((note, index) => {
        setTimeout(() => {
          // حساب التردد بناءً على النغمة
          const frequency = baseFrequency * Math.pow(2, note / 12);
          
          // إنشاء مذبذب للنغمة
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          // إعداد المذبذب
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          
          // إعداد عقدة التحكم بالصوت
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
          
          // توصيل العقد
          oscillator.connect(gainNode);
          gainNode.connect(this.masterGain);
          
          // تشغيل الصوت
          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.3);
        }, index * 150); // تأخير كل نغمة عن السابقة
      });
    } catch (error) {
      console.warn('فشل إنشاء صوت الفوز:', error);
    }
  }

  /**
   * إنشاء صوت اللفات المجانية
   */
  generateFreespinSound() {
    if (!this.isActive) return;
    
    try {
      // صوت اللفات المجانية يتكون من تردد متزايد مع إضافة صدى
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // إعداد المذبذبات
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(300, this.audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 1.5);
      
      oscillator2.type = 'triangle';
      oscillator2.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 1.5);
      
      // إعداد عقدة التحكم بالصوت
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1.0);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.5);
      
      // توصيل العقد
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // تشغيل الصوت
      oscillator1.start();
      oscillator2.start();
      oscillator1.stop(this.audioContext.currentTime + 1.5);
      oscillator2.stop(this.audioContext.currentTime + 1.5);
      
      // إضافة طبل للتأكيد
      setTimeout(() => {
        this._generateDrumSound(120, 0.6);
      }, 800);
    } catch (error) {
      console.warn('فشل إنشاء صوت اللفات المجانية:', error);
    }
  }

  /**
   * إنشاء صوت الطبل
   * @param {number} frequency - تردد الطبل
   * @param {number} duration - مدة الصوت بالثواني
   * @private
   */
  _generateDrumSound(frequency, duration) {
    if (!this.isActive) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // إعداد المذبذب
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 0.5, 
        this.audioContext.currentTime + duration
      );
      
      // إعداد عقدة التحكم بالصوت
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      // توصيل العقد
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // تشغيل الصوت
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('فشل إنشاء صوت الطبل:', error);
    }
  }
}

// إنشاء نسخة مولد الصوت
const audioGenerator = new AudioGenerator();

/**
 * تنسيق الرقم بإضافة فواصل للآلاف
 * @param {number} value - الرقم المراد تنسيقه
 * @returns {string} الرقم المنسق
 */
function formatNumber(value) {
  return value.toLocaleString();
}

/**
 * تأخير التنفيذ
 * @param {number} ms - المدة بالمللي ثانية
 * @returns {Promise} وعد ينتهي بعد المدة المحددة
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * توليد رقم عشوائي ضمن مجال
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأعلى
 * @returns {number} رقم عشوائي ضمن المجال
 */
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * اختيار عنصر عشوائي من مصفوفة
 * @param {Array} array - المصفوفة
 * @returns {*} عنصر عشوائي من المصفوفة
 */
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * تحويل درجة إلى راديان
 * @param {number} degrees - الدرجة
 * @returns {number} الراديان
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * تحويل راديان إلى درجة
 * @param {number} radians - الراديان
 * @returns {number} الدرجة
 */
function radToDeg(radians) {
  return radians * 180 / Math.PI;
}

/**
 * تقييد قيمة ضمن مجال
 * @param {number} value - القيمة
 * @param {number} min - الحد الأدنى
 * @param {number} max - الحد الأعلى
 * @returns {number} القيمة المقيدة
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * الحصول على معرف فريد
 * @returns {string} معرف فريد
 */
function getUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// تصدير الوظائف والكائنات
window.utils = {
  audioGenerator,
  formatNumber,
  delay,
  randomRange,
  randomItem,
  degToRad,
  radToDeg,
  clamp,
  getUniqueId
};