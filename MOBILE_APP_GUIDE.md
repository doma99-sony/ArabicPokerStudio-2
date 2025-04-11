# دليل تحويل تطبيق بوكر عرباوي إلى تطبيق جوال
# Poker 3arabawy Mobile App Guide

هذا الدليل يشرح كيفية تحويل تطبيق الويب الخاص بك "بوكر عرباوي" إلى تطبيق جوال كامل لنظامي Android و iOS باستخدام Capacitor.

## المتطلبات المسبقة

قبل البدء، تأكد من تثبيت الأدوات التالية:

### لجميع المنصات:
- [Node.js](https://nodejs.org/) (v14 أو أحدث)
- [npm](https://www.npmjs.com/) (يأتي مع Node.js)
- [Git](https://git-scm.com/)

### لبناء تطبيقات Android:
- [Android Studio](https://developer.android.com/studio)
- [JDK 11](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) أو أحدث

### لبناء تطبيقات iOS:
- Mac مع macOS (10.15 أو أحدث)
- [Xcode](https://developer.apple.com/xcode/) (12 أو أحدث)
- [CocoaPods](https://cocoapods.org/)

## الخطوة 1: إعداد المشروع

1. قم بتنزيل المشروع الحالي من Replit أو استنساخه.

```bash
git clone <رابط مستودع المشروع> poker-3arabawy-mobile
cd poker-3arabawy-mobile
npm install
```

2. قم بتثبيت حزم Capacitor الضرورية:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/splash-screen @capacitor/status-bar
```

3. نسخ ملفات التحسينات المحمولة إلى المشروع:

تم إنشاء الملفات التالية بالفعل في المشروع:
- `capacitor.config.ts` - ملف تكوين Capacitor
- `capacitor-bridge.ts` - جسر بين تطبيق الويب والإمكانيات الأصلية
- `mobile-enhancements.js` - تحسينات خاصة للأجهزة المحمولة
- `mobile-styles.css` - أنماط CSS خاصة بالجوال
- `resources/` - مجلد يحتوي على أيقونات وشاشات البداية

## الخطوة 2: تحسين تطبيق الويب للجوال

1. أضف الأنماط المحمولة إلى تطبيقك عن طريق استيراد ملف CSS في ملف `client/src/index.css`:

```css
/* استيراد الأنماط المحمولة */
@import '../../mobile-styles.css';
```

2. أضف ملف تحسينات الجوال إلى تطبيقك عن طريق استيراده في المكون الرئيسي، على سبيل المثال في `client/src/App.tsx`:

```tsx
import { useEffect } from 'react';
import '../../mobile-enhancements.js';

function App() {
  useEffect(() => {
    // تطبيق فئة تطبيق الجوال عند الكشف عن جهاز محمول
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.classList.add('is-mobile-app');
    }
  }, []);
  
  // ... بقية التطبيق
}
```

3. استخدم جسر Capacitor في تطبيقك حسب الحاجة:

```tsx
import CapacitorBridge from '../../capacitor-bridge';

// استخدام الجسر لإظهار اهتزاز عند الفوز
function handleWin() {
  CapacitorBridge.vibration.vibrateWin();
}

// استخدام الجسر للتحقق مما إذا كان التطبيق يعمل في بيئة أصلية
function isNative() {
  return CapacitorBridge.isNativePlatform();
}
```

## الخطوة 3: بناء تطبيق الويب للإنتاج

1. قم ببناء تطبيق الويب الخاص بك:

```bash
npm run build
```

هذا سينشئ نسخة مبنية من تطبيقك في مجلد `dist` أو المجلد المحدد في تكوين المشروع.

## الخطوة 4: إعداد Capacitor

1. تهيئة Capacitor (إذا لم تقم بذلك بالفعل):

```bash
npx cap init "Poker 3arabawy" "com.poker3arabawy.app" --web-dir=dist
```

ملاحظة: تأكد من استبدال `dist` بمجلد الإخراج الصحيح لتطبيقك.

2. قم بتحديث ملف `capacitor.config.ts` ليشير إلى المجلد الصحيح:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.poker3arabawy.app',
  appName: 'Poker 3arabawy',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['*.replit.app', 'localhost:*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#006400",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#D4AF37",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#006400",
    }
  }
};

export default config;
```

3. أضف منصات Capacitor:

```bash
npx cap add android
npx cap add ios
```

## الخطوة 5: تخصيص الأيقونات وشاشات البداية

1. نسخ ملفات الموارد إلى حافظات المنصة:

```bash
# نسخ الأيقونات
npx cordova-res android --skip-config --copy
npx cordova-res ios --skip-config --copy
```

2. يمكنك أيضًا استخدام الملفات المخصصة من مجلد `resources/` الذي تم إنشاؤه بواسطة الخطوات السابقة.

## الخطوة 6: بناء وتشغيل تطبيق Android

1. نسخ تغييرات الويب إلى مشروع Android:

```bash
npx cap copy android
```

2. فتح مشروع Android في Android Studio:

```bash
npx cap open android
```

3. من Android Studio:
   - اضغط على زر "Run" (تشغيل) لاختبار التطبيق على جهاز أو محاكي.
   - لإنشاء ملف APK للتوزيع، اذهب إلى Build > Build Bundle(s) / APK(s) > Build APK(s).

### إنشاء ملف APK موقع للتوزيع:

1. إنشاء مفتاح التوقيع:

```bash
keytool -genkey -v -keystore poker3arabawy.keystore -alias poker3arabawy -keyalg RSA -keysize 2048 -validity 10000
```

2. في Android Studio:
   - اذهب إلى Build > Generate Signed Bundle/APK
   - اختر APK
   - استخدم ملف keystore الذي قمت بإنشائه
   - اكمل العملية وانتظر اكتمال البناء

3. ستجد ملف APK الموقع في:
   `android/app/build/outputs/apk/release/app-release.apk`

## الخطوة 7: بناء وتشغيل تطبيق iOS (يتطلب Mac)

1. نسخ تغييرات الويب إلى مشروع iOS:

```bash
npx cap copy ios
```

2. فتح مشروع iOS في Xcode:

```bash
npx cap open ios
```

3. من Xcode:
   - اختر جهاز أو محاكي iOS
   - اضغط على زر "Play" للاختبار
   - للتوزيع، اذهب إلى Product > Archive

## الخطوة 8: تأمين التطبيق

تم تضمين بعض ميزات الأمان الأساسية في الشيفرة المقدمة، لكن للإصدار الإنتاجي، يوصى بتنفيذ:

1. **تشفير التخزين**: استخدم مكتبة مثل `capacitor-secure-storage-plugin` لتخزين البيانات الحساسة

```bash
npm install capacitor-secure-storage-plugin
npx cap update
```

2. **مكافحة التلاعب**: قم بتنفيذ تحققات سلامة التطبيق باستخدام مكتبة مثل `capacitor-jailbreak-detect`

3. **HTTPS الإجباري**: تأكد من أن كل الطلبات تستخدم HTTPS فقط

4. **تشويش الشيفرة**: استخدم أداة مثل `ProGuard` لـ Android (يتم تفعيلها تلقائيًا في وضع الإصدار)

## الخطوة 9: الاختبار والنشر

1. اختبر تطبيقك على مجموعة متنوعة من الأجهزة.

2. **نشر Android**:
   - أنشئ حسابًا على [Google Play Console](https://play.google.com/console)
   - اتبع تعليمات نشر تطبيق جديد
   - قم بتحميل ملف APK أو App Bundle الموقع

3. **نشر iOS**:
   - أنشئ حسابًا على [Apple Developer Program](https://developer.apple.com/programs/)
   - استخدم App Store Connect لإعداد تطبيقك
   - قم بتحميل الأرشيف الذي قمت بإنشائه من Xcode

## ملاحظات إضافية

- **الأذونات**: تأكد من تكوين أذونات الأجهزة المناسبة في `AndroidManifest.xml` و `Info.plist`
- **التصميم المتجاوب**: استخدم CSS Grid وFlexbox لضمان أن تطبيقك يبدو جيدًا على جميع أحجام الشاشات
- **تحسين الأداء**: استخدم ترشيد الرسومات المتحركة والتحميل الكسول للتأكد من أن التطبيق يعمل بسلاسة

## حل المشكلات

### Android
- **مشاكل في Gradle**: حاول تحديث Android Studio وملفات Gradle
- **خطأ في الأذونات**: تأكد من تضمين جميع الأذونات المطلوبة في `AndroidManifest.xml`

### iOS
- **أخطاء CocoaPods**: جرب `pod repo update` متبوعًا بـ `pod install`
- **مشاكل التوقيع**: تأكد من تكوين شهادات Apple ID وProvision Profile بشكل صحيح

## موارد مفيدة

- [توثيق Capacitor](https://capacitorjs.com/docs)
- [دليل متجر Google Play](https://developer.android.com/distribute/best-practices/launch)
- [دليل App Store](https://developer.apple.com/app-store/submissions/)