import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";

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
    console.log("خطأ في المصادقة، إعادة توجيه إلى صفحة تسجيل الدخول...");
    localStorage.removeItem("lastAuthTimestamp"); // مسح أي معلومات تخزين محلية متعلقة بالمصادقة
    
    // إعادة تحميل الصفحة فقط إذا لم نكن بالفعل في صفحة المصادقة
    if (!window.location.pathname.includes("/auth")) {
      window.location.href = "/auth";
    }
  }
  
  event.preventDefault();
};

// إضافة معالجات الأخطاء العامة
window.addEventListener("error", handleError);
window.addEventListener("unhandledrejection", handleUnhandledRejection);

// Create and render the app
const root = createRoot(document.getElementById("root")!);
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);
