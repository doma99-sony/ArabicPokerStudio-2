// capacitor-bridge.ts
// جسر التكامل بين تطبيق الويب والإمكانيات الأصلية باستخدام Capacitor
// Bridge between web app and native capabilities using Capacitor

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// التحقق مما إذا كان التطبيق يعمل في بيئة أصلية أم في متصفح
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

// التعامل مع شريط الحالة
export const statusBarManager = {
  // تعيين لون شريط الحالة
  setColor: async (color: string) => {
    if (isNativePlatform()) {
      try {
        await StatusBar.setBackgroundColor({ color });
      } catch (error) {
        console.error('خطأ في تغيير لون شريط الحالة:', error);
      }
    }
  },
  
  // تعيين نمط النص في شريط الحالة (فاتح/داكن)
  setStyle: async (style: 'dark' | 'light') => {
    if (isNativePlatform()) {
      try {
        await StatusBar.setStyle({
          style: style === 'dark' ? Style.Dark : Style.Light
        });
      } catch (error) {
        console.error('خطأ في تغيير نمط شريط الحالة:', error);
      }
    }
  },
  
  // إظهار أو إخفاء شريط الحالة
  setVisible: async (visible: boolean) => {
    if (isNativePlatform()) {
      try {
        if (visible) {
          await StatusBar.show();
        } else {
          await StatusBar.hide();
        }
      } catch (error) {
        console.error('خطأ في تغيير رؤية شريط الحالة:', error);
      }
    }
  }
};

// التعامل مع شاشة البداية
export const splashScreenManager = {
  // إخفاء شاشة البداية
  hide: async () => {
    if (isNativePlatform()) {
      try {
        await SplashScreen.hide();
      } catch (error) {
        console.error('خطأ في إخفاء شاشة البداية:', error);
      }
    }
  },
  
  // إظهار شاشة البداية
  show: async () => {
    if (isNativePlatform()) {
      try {
        await SplashScreen.show({
          autoHide: false
        });
      } catch (error) {
        console.error('خطأ في إظهار شاشة البداية:', error);
      }
    }
  }
};

// التعامل مع اهتزاز الجهاز (للمنصات التي تدعم ذلك)
export const vibrationManager = {
  // اهتزاز بنمط معين
  vibrate: (pattern: number[] = [100]) => {
    if (isNativePlatform() && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.error('خطأ في تفعيل الاهتزاز:', error);
      }
    }
  },
  
  // اهتزاز خفيف للتأكيد
  vibrateLight: () => {
    vibrationManager.vibrate([20]);
  },
  
  // اهتزاز قوي للتنبيه
  vibrateHeavy: () => {
    vibrationManager.vibrate([50, 50, 100]);
  },
  
  // نمط اهتزاز للفوز
  vibrateWin: () => {
    vibrationManager.vibrate([100, 50, 100, 50, 200]);
  },
  
  // إيقاف الاهتزاز
  cancel: () => {
    if (isNativePlatform() && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (error) {
        console.error('خطأ في إلغاء الاهتزاز:', error);
      }
    }
  }
};

// دمج التطبيق مع المتصفح الأصلي
export const browserManager = {
  // فتح رابط خارجي
  openExternalUrl: (url: string) => {
    if (isNativePlatform()) {
      // استخدام الواجهة البرمجية الأصلية
      try {
        Capacitor.Plugins.Browser?.open({ url });
      } catch (error) {
        console.error('خطأ في فتح الرابط الخارجي:', error);
        // احتياطي: استخدام window.open
        window.open(url, '_blank');
      }
    } else {
      // سلوك المتصفح العادي
      window.open(url, '_blank');
    }
  }
};

// مدير الذاكرة المحلية مع التوافق مع المنصات الأصلية
export const storageManager = {
  // تخزين قيمة
  setItem: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('خطأ في تخزين البيانات:', error);
      return false;
    }
  },
  
  // استرجاع قيمة
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('خطأ في استرجاع البيانات:', error);
      return null;
    }
  },
  
  // حذف قيمة
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      return false;
    }
  },
  
  // تنظيف التخزين
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('خطأ في مسح التخزين:', error);
      return false;
    }
  }
};

// وظائف مساعدة للتعامل مع شبكة الإنترنت
export const networkManager = {
  // التحقق من اتصال الشبكة
  isOnline: () => {
    return navigator.onLine;
  },
  
  // الاستماع لتغييرات حالة الاتصال
  addConnectivityListener: (callback: (isOnline: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};

// وظائف إضافية للأمان
export const securityManager = {
  // حساب البصمة الرقمية للبيانات باستخدام SHA-256
  async hashData(data: string): Promise<string> {
    try {
      // استخدام SubtleCrypto API المتوفرة في المتصفحات الحديثة
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      
      // تحويل البصمة إلى سلسلة
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.error('خطأ في حساب بصمة البيانات:', error);
      // استرجاع قيمة بديلة في حالة فشل الحساب
      return data;
    }
  }
};

// تصدير كائن موحد للاستخدام في التطبيق
export const CapacitorBridge = {
  isNativePlatform,
  getPlatform,
  statusBar: statusBarManager,
  splashScreen: splashScreenManager,
  vibration: vibrationManager,
  browser: browserManager,
  storage: storageManager,
  network: networkManager,
  security: securityManager
};

export default CapacitorBridge;