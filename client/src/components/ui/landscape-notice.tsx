import { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export const LandscapeNotice = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // تحقق من اتجاه الجهاز (عمودي أو أفقي)
  useEffect(() => {
    const checkOrientation = () => {
      if (window.matchMedia("(max-width: 991px)").matches) {
        setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
      } else {
        setIsPortrait(false);
      }
    };

    // تحقق عند تحميل الصفحة
    checkOrientation();
    
    // تأخير قصير قبل إظهار الإشعار لتجنب الظهور السريع عند تحميل الصفحة
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    // تحسين الأداء باستخدام debounce (تأخير) للاستجابة
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        checkOrientation();
      }, 100);
    };

    // الاستماع لتغييرات اتجاه الشاشة
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkOrientation);
      clearTimeout(resizeTimer);
    };
  }, []);

  // تجاهل أثناء التحميل الأولي
  if (isInitialLoad || !isPortrait) return null;

  return (
    <div className="mobile-portrait-notice">
      <div className="bg-black/90 p-6 rounded-xl border-2 border-gold max-w-sm mx-auto text-center backdrop-blur-sm">
        <div className="flex justify-center mb-4 gap-4">
          <div className="inline-block relative">
            <Smartphone size={48} className="text-gold animate-pulse" />
          </div>
          <div className="inline-block relative">
            <RotateCw size={48} className="text-gold animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-gold text-xl font-bold mb-3 font-cairo">قم بتدوير جهازك</h2>
        
        <p className="text-white mb-4 font-tajawal text-sm md:text-base">
          للحصول على أفضل تجربة لعب في بوكر تكساس عرباوي، يرجى استخدام هاتفك بالوضع الأفقي
        </p>
        
        <div className="flex justify-center items-center mt-4">
          <div className="w-24 h-24 bg-deepBlack rounded-lg border border-gold/30 flex items-center justify-center relative overflow-hidden transform">
            <div className="w-10 h-16 border-2 border-gold/50 rounded-md relative rotate-0">
              <div className="absolute left-1/2 top-1/2 w-4 h-8 bg-deepBlack border border-gold/30 rounded-sm transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};