import { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X } from 'lucide-react';
import { Button } from './button';

export const LandscapeNotice = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showOptionalNotice, setShowOptionalNotice] = useState(false);

  // تحقق من اتجاه الجهاز (عمودي أو أفقي)
  useEffect(() => {
    // التحقق من وجود تفضيل سابق للمستخدم
    const userPreference = localStorage.getItem('allowPortraitMode');
    
    // إذا اختار المستخدم تجاهل الإشعار سابقاً، لا تظهره
    if (userPreference === 'true') {
      setIsDismissed(true);
    }

    const checkOrientation = () => {
      if (window.matchMedia("(max-width: 991px)").matches) {
        const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
        setIsPortrait(isPortraitMode);
        
        // إظهار الإشعار فقط إذا كان في الوضع العمودي ولم يتم تجاهل الإشعار
        setShowOptionalNotice(isPortraitMode && !isDismissed);
      } else {
        setIsPortrait(false);
        setShowOptionalNotice(false);
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
  }, [isDismissed]);

  // وظيفة لتجاهل الإشعار وحفظ تفضيل المستخدم
  const dismissNotice = () => {
    setIsDismissed(true);
    localStorage.setItem('allowPortraitMode', 'true');
    setShowOptionalNotice(false);
  };

  // تجاهل أثناء التحميل الأولي أو إذا لم يكن في وضع عمودي أو تم رفض الإشعار
  if (isInitialLoad || !showOptionalNotice) return null;

  return (
    <div className="mobile-portrait-notice fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-black/90 p-6 rounded-xl border-2 border-gold max-w-sm mx-auto text-center">
        {/* زر إغلاق لتجاهل الإشعار */}
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={dismissNotice}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex justify-center mb-4 gap-4">
          <div className="inline-block relative">
            <Smartphone size={48} className="text-gold animate-pulse" />
          </div>
          <div className="inline-block relative">
            <RotateCw size={48} className="text-gold animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-gold text-xl font-bold mb-3 font-cairo">تدوير الجهاز (اختياري)</h2>
        
        <p className="text-white mb-4 font-tajawal text-sm md:text-base">
          للحصول على أفضل تجربة لعب في بوكر تكساس عرباوي، نوصي باستخدام هاتفك بالوضع الأفقي
        </p>
        
        <div className="flex justify-center items-center mt-4 mb-6">
          <div className="w-24 h-24 bg-deepBlack rounded-lg border border-gold/30 flex items-center justify-center relative overflow-hidden transform">
            <div className="w-10 h-16 border-2 border-gold/50 rounded-md relative rotate-0">
              <div className="absolute left-1/2 top-1/2 w-4 h-8 bg-deepBlack border border-gold/30 rounded-sm transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-t-2 border-r-2 border-gold animate-spin"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-3 mt-4">
          <Button 
            variant="outline" 
            className="w-full border-gold/70 text-gold hover:bg-gold/20"
            onClick={dismissNotice}
          >
            متابعة بالوضع العمودي
          </Button>
          
          <Button 
            variant="default" 
            className="w-full bg-gold hover:bg-gold/80 text-black"
            onClick={() => {
              // زر المتابعة يغلق الإشعار فقط لهذه الجلسة دون حفظ التفضيل
              setShowOptionalNotice(false);
            }}
          >
            حسناً
          </Button>
        </div>
      </div>
    </div>
  );
};