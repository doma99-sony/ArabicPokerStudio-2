# دليل أمان تطبيق Android لـ "بوكر عرباوي"
# Android Security Guide for Poker 3arabawy

هذا الدليل يقدم إرشادات متقدمة لتأمين تطبيق Poker 3arabawy على نظام Android، خاصة وأن التطبيق يتعامل مع:
- حسابات المستخدمين
- العملة الافتراضية في اللعبة
- بيانات المستخدم الحساسة
- اتصالات الشبكة في الوقت الفعلي (WebSockets)

## 1. تأمين بيانات المستخدم

### تشفير البيانات المُخزّنة
استخدم مكتبة `capacitor-secure-storage-plugin` لتخزين جميع البيانات الحساسة:

```typescript
import { Plugins } from '@capacitor/core';
const { SecureStoragePlugin } = Plugins;

// تخزين البيانات بشكل آمن
async function secureStore(key: string, value: string) {
  await SecureStoragePlugin.set({
    key,
    value
  });
}

// استرجاع البيانات المشفرة
async function secureRetrieve(key: string) {
  const result = await SecureStoragePlugin.get({ key });
  return result.value;
}
```

### حماية المعلومات الشخصية
تأكد من عدم تخزين معلومات شخصية غير ضرورية على الجهاز. بدلاً من ذلك، قم بتخزين معرف المستخدم فقط واسترجاع البيانات من الخادم عند الحاجة:

```typescript
// تخزين رمز الجلسة المشفر والمعرف فقط
await secureStore('session_token', token);
await secureStore('user_id', userId);

// لا تخزن كلمات المرور أبدًا محليًا
// ❌ await store('password', password);  // خطأ كبير!
```

## 2. تعزيز أمان الشبكة

### فرض استخدام HTTPS
تأكد من أن جميع الاتصالات تستخدم HTTPS. قم بتعديل ملف `android/app/src/main/AndroidManifest.xml` لفرض ذلك:

```xml
<application
    ...
    android:usesCleartextTraffic="false">
    ...
</application>
```

### تثبيت الشهادات (Certificate Pinning)
قم بتنفيذ تثبيت الشهادات لمنع هجمات الوسيط (Man-in-the-Middle):

```kotlin
// يجب وضع هذا الكود في ملف Java/Kotlin في مشروع Android
OkHttpClient client = new OkHttpClient.Builder()
    .certificatePinner(new CertificatePinner.Builder()
        .add("your-api-domain.com", "sha256/YOUR_CERT_HASH")
        .build())
    .build();
```

### حماية اتصالات WebSocket
تأكد من أن اتصالات WebSocket تستخدم WSS (WebSocket Secure) وتتضمن رمز المصادقة:

```typescript
// استخدم WSS دائمًا
const wsUrl = 'wss://your-api-domain.com/ws';

const socket = new WebSocket(wsUrl);
socket.onopen = () => {
  // إرسال رمز المصادقة فورًا بعد فتح الاتصال
  socket.send(JSON.stringify({ 
    type: 'auth', 
    token: await secureRetrieve('session_token')
  }));
};
```

## 3. تشويش الشيفرة وإخفاء الكود

### تمكين ProGuard/R8
قم بتعديل ملف `android/app/build.gradle` لتمكين تشويش الشيفرة:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### إنشاء ملف proguard-rules.pro مخصص
أضف قواعد ProGuard مخصصة للتطبيق:

```
# قواعد عامة
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# حماية الكود الخاص بك
-keep class com.poker3arabawy.app.security.** { *; }
-keepclassmembers class com.poker3arabawy.app.security.** { *; }

# حماية الكود الخاص بـ Capacitor
-keep class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin
```

## 4. الكشف عن الأجهزة المكسورة (Rooted) وإجراءات التخفيف

### كشف الجهاز المكسور (Rooted)
استخدم مكتبة مثل `capacitor-jailbreak-detect` لتحديد ما إذا كان الجهاز مكسورًا:

```typescript
import { Plugins } from '@capacitor/core';
const { JailbreakDetection } = Plugins;

async function checkDeviceSecurity() {
  const result = await JailbreakDetection.isJailbroken();
  
  if (result.value) {
    // الجهاز مكسور، اتخذ إجراءات تخفيف
    showSecurityWarning();
    limitFunctionality();
  }
}
```

### منع تشغيل المصححات (Debuggers)
أضف كودًا للكشف عن تشغيل المصححات في وقت التشغيل:

```java
// أضف هذا إلى ملف Java في مشروع Android
private boolean isDebuggerConnected() {
    return android.os.Debug.isDebuggerConnected();
}

@Override
public void onResume() {
    super.onResume();
    if (isDebuggerConnected() && !BuildConfig.DEBUG) {
        // إغلاق التطبيق أو تقييد الوظائف
        finishAffinity();
    }
}
```

## 5. التعامل مع العملة الافتراضية والمدفوعات

### حماية قيم العملة الافتراضية
نفذ عمليات تحقق من جانب الخادم للتأكد من أن العملات الافتراضية لا يمكن التلاعب بها:

```typescript
// ❌ لا تعتمد أبدًا على قيم تأتي من العميل فقط
// بدلاً من ذلك، قم دائمًا بالتحقق من قيم العملات من الخادم

// عند إجراء عمليات شراء/بيع/رهان:
async function placeBet(amount: number) {
  // إرسال طلب إلى الخادم مع رمز المصادقة
  const response = await fetch('https://your-api.com/place-bet', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await secureRetrieve('session_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  });
  
  // استخدام قيم الرصيد المُحدثة التي يعيدها الخادم فقط
  const { newBalance, betResult } = await response.json();
  
  // تحديث واجهة المستخدم بالقيمة الجديدة
  updateUIBalance(newBalance);
}
```

### تشفير المعاملات الحساسة
قم بتنفيذ مصادقة إضافية للمعاملات الكبيرة:

```typescript
// للمعاملات المهمة، أضف تحققًا إضافيًا:
async function withdrawChips(amount: number) {
  if (amount > 1000) {
    // طلب مصادقة إضافية للمبالغ الكبيرة
    const verified = await requestAdditionalAuth();
    if (!verified) {
      return showError('فشلت المصادقة الإضافية');
    }
  }
  
  // متابعة المعاملة إذا تمت المصادقة
  processWithdrawal(amount);
}
```

## 6. الحماية من الهجمات الشائعة

### مكافحة حقن SQL
استخدم طرق تقييد محكمة مع استعلامات SQL:

```typescript
// ❌ لا تستخدم أبدًا سلاسل محشوة مباشرة في استعلامات SQL
// بدلاً من ذلك، استخدم استعلامات مُعدة مع ترميز:

// على جانب الخادم (Node.js مثلاً)
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### منع هجمات XSS
استخدم مكتبات آمنة لعرض المحتوى الذي ينشئه المستخدم:

```typescript
// استخدم DOMPurify لتنقية أي محتوى HTML يتم إدخاله
import DOMPurify from 'dompurify';

function displayUserMessage(message) {
  const sanitizedMessage = DOMPurify.sanitize(message);
  document.getElementById('message-container').innerHTML = sanitizedMessage;
}
```

## 7. آلية التحديث وإصلاح الثغرات

### تنفيذ فحص الإصدار
قم بتنفيذ فحص إجباري للإصدار لضمان أن المستخدمين يستخدمون أحدث نسخة:

```typescript
async function checkAppVersion() {
  try {
    const response = await fetch('https://your-api.com/app-version');
    const { minVersion, latestVersion } = await response.json();
    
    const currentVersion = '1.0.0'; // احصل على هذا من التطبيق
    
    if (isVersionLower(currentVersion, minVersion)) {
      // الإصدار أقدم من الحد الأدنى المطلوب، فرض التحديث
      showForceUpdateDialog();
    } else if (isVersionLower(currentVersion, latestVersion)) {
      // تحديث متاح ولكنه اختياري
      showUpdateAvailableDialog();
    }
  } catch (error) {
    console.error('فشل التحقق من الإصدار:', error);
  }
}
```

### تنفيذ استراتيجية إصلاح الثغرات
أنشئ خطة للاستجابة السريعة للثغرات الأمنية:

1. راقب خدمات الإخطار الأمنية مثل NVD و CVE
2. اعتمد برنامج الإصلاح السريع وإطلاق التحديثات
3. استخدم الإشعارات داخل التطبيق لإبلاغ المستخدمين بالتحديثات المهمة

## 8. اختبار الأمان

### قائمة اختبار الأمان
قبل إصدار التطبيق، تأكد من إجراء الاختبارات التالية:

- [ ] اختبار إفصاح مفتوح عن المعلومات غير المقصود
- [ ] اختبار تغيير المعرفات/الرموز للتحقق من حماية الوصول
- [ ] اختبار اختراق واكتشاف نقاط الضعف
- [ ] اختبار لتأكيد أن كل البيانات الحساسة مشفرة
- [ ] اختبار سلوك التطبيق على الأجهزة المكسورة (rooted)
- [ ] اختبار التعامل مع حالات فقدان الاتصال بالإنترنت

### استخدام أدوات الاختبار الأمني
استخدم أدوات مثل:
- OWASP ZAP للأمان العام
- MobSF لاختبار أمان التطبيق المحمول
- Drozer لاختبار أمان Android

## 9. توثيق ومراقبة الأحداث الأمنية

### تنفيذ المراقبة الأمنية
لاكتشاف النشاط المشبوه:

```typescript
// توثيق أحداث الأمان المهمة
function logSecurityEvent(eventType, details) {
  // إرسال بيانات الحدث إلى الخادم
  fetch('https://your-api.com/security-log', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventType,
      details,
      timestamp: new Date().toISOString(),
      deviceInfo: getDeviceInfo()
    })
  }).catch(err => console.error('خطأ في تسجيل حدث أمني:', err));
}

// استخدام الوظيفة لتسجيل الأحداث المهمة
function onLoginAttempt(success, username) {
  logSecurityEvent(
    success ? 'login_success' : 'login_failure',
    { username, ipAddress: currentIpAddress }
  );
}
```

## 10. ملخص أفضل الممارسات

### قائمة التحقق النهائية
✅ استخدم HTTPS/WSS لجميع الاتصالات
✅ طبق تثبيت الشهادات لمنع هجمات MITM
✅ شغل ProGuard/R8 لتشويش الشيفرة وإخفاء الكود
✅ خزن البيانات الحساسة بشكل آمن باستخدام التشفير
✅ اكشف عن الأجهزة المكسورة واتخذ إجراءات مناسبة
✅ تحقق من صحة البيانات على جانب الخادم دائمًا
✅ نفذ التحقق من الإصدار وآلية التحديث الإلزامي
✅ استخدم بروتوكول آمن للمصادقة مثل OAuth 2.0 أو JWT

تطبيق هذه الممارسات سيوفر مستوى عالٍ من الأمان لتطبيق "بوكر عرباوي" على نظام Android، مما يحمي بيانات المستخدمين والعملة الافتراضية في اللعبة.