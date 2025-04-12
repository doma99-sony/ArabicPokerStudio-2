# دليل بناء تطبيق بوكر عرباوي للأجهزة المحمولة
# Poker 3arabawy Mobile App Build Guide

## نظرة عامة
هذا الدليل يشرح كيفية بناء ونشر تطبيق بوكر عرباوي (Poker 3arabawy) على أجهزة أندرويد باستخدام Capacitor. 
التطبيق مصمم للعمل بدون إنترنت (offline) عن طريق تخزين الملفات محليًا وتشغيلها باستخدام مخطط `file://`.

## المتطلبات الأساسية
- Node.js (اصدار 16 أو أعلى)
- npm (أحدث إصدار)
- Android Studio (للبناء والتشغيل على أندرويد)
- Xcode (للبناء والتشغيل على iOS - اختياري)

## تسلسل البناء

### 1. بناء نسخة الإنتاج من التطبيق
```bash
npm run build
```
ستقوم هذه الخطوة بإنشاء مجلد `dist` يحتوي على ملفات التطبيق المُحسنة للإنتاج.

### 2. نسخ ملفات التحسينات المتعلقة بالموبايل (إذا لم تكن موجودة)
```bash
cp mobile-enhancements.js dist/public/
cp mobile-styles.css dist/public/
```

### 3. مزامنة البنية مع Capacitor (أندرويد/iOS)
```bash
npx cap sync android
```
هذا الأمر سينسخ الملفات من مجلد `dist` إلى مشروع أندرويد وسيقوم بتحديث التبعيات.

### 4. فتح مشروع أندرويد في Android Studio
```bash
npx cap open android
```
سيتم فتح مشروع أندرويد في Android Studio، حيث يمكنك بناء وتشغيل التطبيق على جهاز أو محاكي.

## ملاحظات هامة لوضع البناء المحلي (Offline Mode)

### ضبط تهيئة Capacitor
تم ضبط الملف `capacitor.config.ts` لتمكين وضع التشغيل المحلي باستخدام مخطط `file://`:

```typescript
server: {
  hostname: '',
  androidScheme: 'file',
  iosScheme: 'file',
}
```

هذا التكوين ضروري لضمان تحميل الموارد بشكل صحيح عندما يكون التطبيق غير متصل بالإنترنت.

### العمل بدون خادم خلفي
في وضع التشغيل المحلي، قد لا تعمل بعض ميزات التطبيق التي تعتمد على الخادم الخلفي. يجب أن يكون التطبيق مصممًا للتعامل مع هذه الحالة بأمان.

### اختبار التوافق
تأكد من اختبار التطبيق في وضع الطيران أو بدون اتصال بالإنترنت للتأكد من أن جميع الأصول (CSS، JS، الصور) تُحمل بشكل صحيح.

## حل المشكلات الشائعة

### مشاكل تحميل الأصول
إذا واجهت مشاكل في تحميل الأصول (CSS، JS، الصور)، تأكد من:
1. أن مسارات جميع الأصول نسبية وليست مطلقة
2. أن الأصول موجودة في المجلد الصحيح (`dist/public`)
3. أن `androidScheme` مضبوط على `file` في `capacitor.config.ts`

### مشاكل التحميل الأولي
إذا كان التطبيق يواجه مشاكل أثناء التحميل الأولي، يمكن تضمين شاشة البداية (splash screen) لفترة أطول:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 3000,
    launchAutoHide: true,
  }
}
```

### أخطاء CORS
في وضع التشغيل المحلي، قد تواجه أخطاء CORS عند محاولة الوصول إلى أصول خارجية. تأكد من تضمين جميع الأصول المطلوبة محليًا.

## توقيع التطبيق للنشر

للنشر على متاجر التطبيقات، ستحتاج إلى توقيع حزمة APK:

1. قم بإنشاء مفتاح التوقيع (إذا لم يكن موجودًا):
```bash
keytool -genkey -v -keystore android.keystore -alias poker3arabawy -keyalg RSA -keysize 2048 -validity 10000
```

2. تكوين التوقيع في Gradle (ملف `android/app/build.gradle`):
```gradle
signingConfigs {
    release {
        storeFile file("../../android.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias "poker3arabawy"
        keyPassword System.getenv("KEY_PASSWORD")
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // ...
    }
}
```

3. بناء APK للنشر:
من Android Studio، اختر Build > Generate Signed Bundle/APK

## التطوير المستمر

عند إجراء تغييرات على التطبيق، يجب تكرار تسلسل البناء:
1. `npm run build`
2. `npx cap sync android`
3. `npx cap open android`

## خاتمة
باتباع هذه الخطوات، يمكنك بناء ونشر تطبيق بوكر عرباوي بنجاح على أجهزة أندرويد بطريقة تعمل بدون اتصال بالإنترنت.