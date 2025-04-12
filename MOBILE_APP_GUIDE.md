# دليل تطوير تطبيق بوكر عرباوي للأجهزة المحمولة
# Poker 3arabawy Mobile App Development Guide

## نظرة عامة
هذا الدليل يقدم إرشادات شاملة لتطوير تطبيق بوكر عرباوي على منصات الأجهزة المحمولة باستخدام Capacitor. يغطي هيكل المشروع، الملفات الرئيسية، وكيفية تضمين الأصول والتعامل مع تحديات تطوير التطبيقات المحمولة.

## هيكل المشروع

```
poker-3arabawy/
├── android/                  # مشروع أندرويد المولد بواسطة Capacitor
├── ios/                      # مشروع iOS المولد بواسطة Capacitor (اختياري)
├── client/                   # التطبيق الرئيسي بـ React
│   ├── src/                  # كود المصدر للتطبيق
│   │   ├── main.tsx          # نقطة الدخول الرئيسية
│   │   ├── App.tsx           # مكون التطبيق الرئيسي
│   │   ├── pages/            # صفحات التطبيق
│   │   └── ...
│   └── index.html            # ملف HTML الرئيسي
├── public/                   # الموارد العامة
│   ├── mobile-enhancements.js # تحسينات خاصة بالهاتف
│   ├── mobile-styles.css     # أنماط CSS للهاتف
│   └── ...
├── dist/                     # مجلد البناء (يتم إنشاؤه تلقائيًا)
├── server/                   # كود الخادم
├── shared/                   # كود مشترك بين العميل والخادم
├── capacitor.config.ts       # ملف تكوين Capacitor
└── ...
```

## ملفات رئيسية

### 1. capacitor.config.ts
ملف التكوين الرئيسي لـ Capacitor الذي يحدد كيفية عمل التطبيق على الأجهزة المحمولة:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poker3arabawy.app',
  appName: 'Poker 3arabawy',
  webDir: 'dist/public',
  // تكوين للتشغيل المحلي (offline mode)
  server: {
    hostname: '',
    androidScheme: 'file',
    iosScheme: 'file',
  },
  // تكوين البلجنات
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      // ...
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#006400",
      // ...
    }
  }
};

export default config;
```

### 2. mobile-enhancements.js
تحسينات خاصة للأجهزة المحمولة:

```javascript
// تنفيذ تحسينات الجوال
function initMobileEnhancements() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    document.body.classList.add('is-mobile-app');
    enhanceTouchEvents();
    disableZoom();
    optimizeRendering();
    setupVibration();
    setupStatusBar();
    preventScreenLock();
    handleOrientation();
  }
}

// تعزيز أحداث اللمس
function enhanceTouchEvents() {
  // تحسين استجابة الأزرار للمس
  // ...
}

// دعم اهتزاز الجهاز
function setupVibration() {
  // إضافة ردود فعل اهتزازية
  // ...
}

// ... وظائف أخرى للتحسين
```

### 3. mobile-styles.css
أنماط CSS خاصة للأجهزة المحمولة:

```css
/* متغيرات CSS للتطبيق المحمول */
:root {
  --poker-green: #006400;
  --poker-gold: #D4AF37;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --touch-target-size: 44px;
}

/* تنسيقات خاصة بالأجهزة المحمولة */
.is-mobile-app {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* تنسيقات للأزرار والعناصر التفاعلية */
.action-button {
  min-width: var(--touch-target-size);
  min-height: var(--touch-target-size);
}

/* دعم الاتجاهات المختلفة للشاشة */
.landscape-mode .poker-table {
  /* تنسيقات للوضع الأفقي */
}

.portrait-mode .action-buttons {
  /* تنسيقات للوضع العمودي */
}

/* تحسينات للأداء والتسريع */
.is-scrolling * {
  animation-play-state: paused !important;
  transition: none !important;
}
```

## تضمين وإدارة الأصول (Assets)

### الصور والوسائط
- ضع الصور والملفات الوسائطية في مجلد `public/images` أو `public/media`.
- استخدم صيغ محسنة للصور (WebP) للأداء الأفضل على الأجهزة المحمولة.
- قم بإنشاء نسخ متعددة الدقة للصور (1x, 2x, 3x) للتعامل مع شاشات مختلفة.

### الخطوط
- ضمن الخطوط محليًا في مجلد `public/fonts`.
- استخدم صيغة WOFF2 المضغوطة للخطوط لتسريع التحميل.

### الأيقونات
- فكر في استخدام صيغة SVG للأيقونات لتجنب فقدان الدقة عند التكبير.
- دمج الأيقونات المستخدمة بكثرة في sprite واحد لتقليل عدد الطلبات.

## توافق مع منصات الأجهزة المحمولة

### أندرويد
- اختبر على إصدارات متعددة من أندرويد (خاصة 7.0+).
- تعامل مع اختلافات الشاشات بين أجهزة أندرويد المختلفة.
- استخدم `androidScheme: 'file'` في `capacitor.config.ts` للتشغيل المحلي.

### تنسيق واجهة المستخدم
- استخدم نهج Mobile-First في التصميم.
- تأكد من أن حجم نقاط اللمس لا يقل عن 44×44 بكسل.
- تعامل مع "القصة" (Notch) في الهواتف الحديثة باستخدام متغيرات CSS المناسبة.

```css
/* مثال للتعامل مع "القصة" في الهواتف الحديثة */
@supports (padding: max(0px)) {
  .mobile-header {
    padding-top: max(var(--safe-area-inset-top), 8px);
  }
}
```

## تحسين الأداء

### تحميل البيانات
- استخدم أنماط مثل lazy loading للصور والمكونات.
- قم بتنفيذ ذاكرة التخزين المؤقت للبيانات المستخدمة بشكل متكرر.

### تحسين عرض الصفحة
- تجنب إعادة الرسم المتكررة للشاشة (repaints).
- استخدم تحولات الأجهزة (hardware-accelerated transitions) للحركات السلسة.

```css
/* تسريع الأجهزة للحركات */
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}
```

### تقليل استهلاك البطارية
- قلل من استخدام خدمات تحديد المواقع والميزات كثيفة استخدام المعالج.
- أطلق المصادر غير المستخدمة وقم بإيقاف المؤقتات عندما لا تكون نشطة.

## استخدام واجهات برمجة التطبيقات المحلية

### Capacitor Bridge
استخدم جسر Capacitor للوصول إلى ميزات الجهاز الأصلية:

```typescript
// مثال لاستخدام ميزات شريط الحالة
import { StatusBar } from '@capacitor/status-bar';

// تغيير لون شريط الحالة
async function changeStatusBarColor(color: string) {
  await StatusBar.setBackgroundColor({ color });
}

// مثال لاستخدام الاهتزاز
import { Haptics } from '@capacitor/haptics';

async function vibrate() {
  await Haptics.vibrate();
}
```

### التخزين المحلي والتفضيلات
استخدم Storage API من Capacitor للتخزين الآمن:

```typescript
import { Storage } from '@capacitor/storage';

// حفظ البيانات
async function saveUserPreference(key: string, value: string) {
  await Storage.set({ key, value });
}

// استرجاع البيانات
async function getUserPreference(key: string) {
  const { value } = await Storage.get({ key });
  return value;
}
```

## اختبار التطبيق

### اختبار على أجهزة حقيقية
- اختبر التطبيق على مجموعة متنوعة من الأجهزة الفعلية.
- اختبر في ظروف شبكة مختلفة (3G، 4G، WiFi، وضع الطيران).

### اختبار الأداء
- راقب استخدام الذاكرة واستهلاك البطارية.
- اختبر التشغيل المطول للتأكد من عدم وجود تسريبات للذاكرة.

### اختبار وضع الطيران
- تأكد من أن التطبيق يعمل بشكل صحيح في وضع عدم الاتصال.
- اختبر سيناريوهات فقدان الاتصال واستعادته.

## نصائح عامة

### تصميم التجربة
- صمم واجهة تناسب شاشات اللمس أولاً.
- استخدم إشارات سحب واضحة وبديهية.
- تأكد من وضوح جميع النصوص والعناصر التفاعلية.

### ملاحظات اللمس
- أضف ردود فعل مرئية واهتزازية للتفاعلات.
- استخدم رسوم متحركة بسيطة للإشارة إلى تغيرات الحالة.

### التعريب والتدويل
- تأكد من دعم اللغات من اليمين إلى اليسار بشكل صحيح.
- استخدم متغيرات CSS المناسبة للتعامل مع اختلافات التخطيط.

```css
/* دعم تخطيط اليمين إلى اليسار */
.rtl-support {
  direction: rtl;
}

.flex-container {
  flex-direction: row-reverse;
}
```

## خاتمة
باتباع هذه الإرشادات، يمكنك تطوير تطبيق بوكر عرباوي للأجهزة المحمولة يتمتع بأداء عالٍ وتجربة مستخدم سلسة، سواء كان متصلاً بالإنترنت أو يعمل بشكل محلي.