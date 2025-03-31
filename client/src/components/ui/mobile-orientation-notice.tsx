import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileOrientationNotice() {
  const isMobile = useIsMobile();
  const [isPortrait, setIsPortrait] = useState(false);
  
  // استخدام useCallback لتحسين الأداء
  const handleOrientationChange = useCallback(() => {
    if (typeof window !== 'undefined') {
      // استخدام screen.orientation إذا كان متاحًا (أكثر كفاءة)
      if (window.screen && window.screen.orientation) {
        const orientation = window.screen.orientation.type;
        setIsPortrait(orientation.includes('portrait'));
      } else {
        // الطريقة التقليدية لأجهزة قديمة
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    }
  }, []);

  useEffect(() => {
    // تحقق من الاتجاه الأولي فقط إذا كان على الموبايل (تحسين أداء)
    if (isMobile) {
      handleOrientationChange();
      
      // إضافة مستمعين للتغييرات
      window.addEventListener("resize", handleOrientationChange, { passive: true });
      window.addEventListener("orientationchange", handleOrientationChange, { passive: true });
      
      // استخدام MatchMedia للأداء الأفضل (إذا كان متاحًا)
      const mediaQuery = window.matchMedia("(orientation: portrait)");
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleOrientationChange);
      }

      // تنظيف المستمعين عند إزالة المكون
      return () => {
        window.removeEventListener("resize", handleOrientationChange);
        window.removeEventListener("orientationchange", handleOrientationChange);
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleOrientationChange);
        }
      };
    }
  }, [isMobile, handleOrientationChange]);

  // لا حاجة للرسم إذا لم تكن الشاشة للموبايل أو في وضع أفقي
  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="mobile-portrait-notice">
      <div className="bg-black/90 p-6 rounded-xl max-w-md mx-auto">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
            <path d="M12 18h.01"></path>
            <path d="M7 22v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"></path>
            <path d="M11 6h2"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gold mb-2">الرجاء تدوير جهازك</h2>
        <p className="text-white mb-4">
          للحصول على أفضل تجربة في لعبة البوكر، يرجى تدوير جهازك إلى الوضع الأفقي.
        </p>
        <div className="flex items-center justify-center">
          <div className="border-2 border-gold rounded p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-90"
            >
              <path d="M12 2v1"></path>
              <path d="M3 11V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2.5"></path>
              <path d="M12 22v-1"></path>
              <path d="M7 7v10"></path>
              <path d="M17 7v10"></path>
              <path d="M2 10h13"></path>
              <path d="M2 14h8"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}