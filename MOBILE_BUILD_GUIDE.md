# دليل بناء تطبيق بوكر عرباوي للأندرويد

هذا الدليل يشرح كيفية بناء وتشغيل تطبيق بوكر عرباوي على أجهزة الأندرويد باستخدام Capacitor.

## المتطلبات الأساسية

قبل البدء، تأكد من توفر المتطلبات التالية:

1. **Node.js و npm** (الإصدار 14 أو أحدث)
2. **Android Studio** (أحدث إصدار)
3. **JDK** (Java Development Kit) الإصدار 11 أو أحدث
4. **Android SDK** مثبت ومكون بشكل صحيح مع أدوات سطر الأوامر

## خطوات البناء

### 1. بناء تطبيق الويب للإنتاج

أولاً، نحتاج إلى بناء نسخة الإنتاج من التطبيق:

```bash
npm run build
```

هذا سينشئ مجلد `dist` يحتوي على النسخة النهائية من تطبيق الويب.

### 2. نسخ الملفات إلى مشروع Capacitor

بعد بناء المشروع، نحتاج إلى نسخ ملفات الويب إلى مشروع Capacitor:

```bash
npx cap copy
```

### 3. تحديث مشروع الأندرويد

قد تحتاج إلى تحديث مشروع الأندرويد ليعكس أي تغييرات في التكوين:

```bash
npx cap update android
```

### 4. فتح المشروع في Android Studio

الآن نحتاج إلى فتح المشروع في Android Studio:

```bash
npx cap open android
```

هذا سيفتح مشروع الأندرويد في Android Studio.

### 5. تكوين توقيع التطبيق

لنشر التطبيق على متجر Google Play أو لتوزيعه، نحتاج إلى توقيع التطبيق:

1. في Android Studio، اذهب إلى `Build` > `Generate Signed Bundle/APK`.
2. اختر `APK` لإنشاء ملف APK قابل للتثبيت أو `Android App Bundle` للنشر على متجر Google Play.
3. إنشاء أو اختيار keystore موجود.
4. إكمال عملية التوقيع.

### 6. بناء ملف APK للتنصيب المباشر

لإنشاء ملف APK بسيط للتوزيع المباشر:

1. في Android Studio، اذهب إلى `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`.
2. انتظر حتى اكتمال عملية البناء.
3. سيتم إنشاء ملف APK في `android/app/build/outputs/apk/debug/` أو `android/app/build/outputs/apk/release/`.

## توزيع التطبيق

### التوزيع المباشر

بعد بناء ملف APK، يمكنك توزيعه مباشرة عبر:
- البريد الإلكتروني
- خدمات التخزين السحابي
- مواقع الويب الخاصة بك

### النشر على متجر Google Play

لنشر التطبيق على متجر Google Play:

1. قم بإنشاء حساب مطور على Google Play Console.
2. أنشئ تطبيقًا جديدًا وأكمل معلومات التطبيق.
3. قم بتحميل ملف AAB الموقّع الذي تم إنشاؤه من Android Studio.
4. أكمل معلومات القائمة والتسعير والتوافق.
5. قم بنشر التطبيق للمراجعة.

## تكوين ملف capacitor.config.ts

يحتوي ملفنا الحالي `capacitor.config.ts` على الإعدادات التالية:

```typescript
{
  appId: 'com.poker3arabawy.app',
  appName: 'Poker 3arabawy',
  webDir: 'dist',
  server: {
    hostname: '',
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['*.replit.app', 'localhost:*']
  },
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'poker3arabawy',
    }
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
      overlaysWebView: false
    }
  }
}
```

## تحديث الموارد

للحصول على تجربة استخدام أفضل، يُنصح بتحديث الموارد التالية:

- **أيقونة التطبيق**: قم بتحديث الأيقونات في مجلد `resources` وقم بتشغيل أمر `npx cap update`
- **شاشة البداية**: قم بتحديث شاشة البداية في مجلد `resources` ثم قم بتشغيل أمر `npx cap update`

## استكشاف الأخطاء وإصلاحها

### التطبيق لا يعمل على الجهاز

- تأكد من تفعيل وضع المطور USB على الجهاز
- تأكد من تثبيت التطبيق بشكل صحيح
- افحص سجلات Android Studio لمعرفة سبب المشكلة

### مشاكل الاتصال بالخادم

- تأكد من إمكانية الوصول للخادم من الجهاز المحمول
- افحص قواعد الجدار الناري وإعدادات CORS

## المراجع

- [توثيق Capacitor](https://capacitorjs.com/docs)
- [دليل Android Studio](https://developer.android.com/studio/intro)
- [نشر تطبيقات على Google Play](https://developer.android.com/distribute/best-practices/launch)