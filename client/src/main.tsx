import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { SplashScreen } from '@capacitor/splash-screen';
import CapacitorBridge from '../../capacitor-bridge';

// معالجة الأخطاء وقت التشغيل
const handleError = (event: ErrorEvent) => {
  console.error("Runtime error:", event.error);
  event.preventDefault();
};

// معالجة الوعود غير المعالجة (عادة أخطاء الشبكة)
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error("Unhandled promise rejection:", event.reason);
  
  // التحقق ما إذا كان الخطأ متعلق بالمصادقة (401)
  if (event.reason && (
    event.reason.message?.includes("401") || 
    event.reason.status === 401 ||
    event.reason.message?.includes("Unauthorized")
  )) {
    console.log("خطأ في المصادقة:", event.reason.message);
    
    // تعطيل إعادة التوجيه التلقائي لمنع الحلقات اللانهائية
    // سيتم التعامل مع ذلك في مكونات المصادقة
  }
  
  event.preventDefault();
};

// إضافة معالجات الأخطاء العامة
window.addEventListener("error", handleError);
window.addEventListener("unhandledrejection", handleUnhandledRejection);

// تحسينات الموبايل والتهيئة
const initializeApp = async () => {
  try {
    // كشف ما إذا كان التطبيق يعمل على منصة أصلية
    const isNative = CapacitorBridge.isNativePlatform();
    
    if (isNative) {
      console.log("تشغيل التطبيق على منصة أصلية:", CapacitorBridge.getPlatform());
      
      // تخصيص شريط الحالة
      await CapacitorBridge.statusBar.setColor("#006400");
      await CapacitorBridge.statusBar.setStyle("dark");
      
      // تفعيل وضع تجربة المستخدم المحمول
      document.body.classList.add('is-mobile-app');
      
      // إخفاء شاشة البداية بعد التحميل الكامل
      window.addEventListener('load', () => {
        // إخفاء شاشة البداية بعد تأخير قصير للتأكد من تحميل التطبيق
        setTimeout(() => {
          SplashScreen.hide();
        }, 1000);
      });
    } else {
      console.log("تشغيل التطبيق على متصفح ويب");
    }
    
    // تفعيل تحسينات الموبايل بغض النظر عن المنصة (يتكيف تلقائياً)
    if (typeof window !== 'undefined') {
      // التحقق من وجود سكريبت التحسينات
      const enhancementsScript = document.querySelector('script[src="/mobile-enhancements.js"]');
      if (enhancementsScript) {
        console.log("تم تحميل سكريبت تحسينات الموبايل");
      } else {
        console.warn("لم يتم العثور على سكريبت تحسينات الموبايل");
      }
    }
    
  } catch (error) {
    console.error("خطأ في تهيئة التطبيق:", error);
  }
  
  // إنشاء وعرض التطبيق
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  );
};

// بدء تشغيل التطبيق
initializeApp();
