import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export const LandscapeNotice = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  // تحقق من اتجاه الجهاز (عمودي أو أفقي)
  useEffect(() => {
    const checkOrientation = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
      } else {
        setIsPortrait(false);
      }
    };

    // تحقق عند تحميل الصفحة
    checkOrientation();

    // الاستماع لتغييرات اتجاه الشاشة
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="mobile-landscape-notice">
      <div className="bg-black/80 p-6 rounded-xl border-2 border-[#D4AF37] max-w-sm mx-auto text-center">
        <div className="flex justify-center mb-4">
          <div className="inline-block relative animate-pulse">
            <Smartphone size={60} className="text-[#D4AF37] transform rotate-90 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/30 to-[#D4AF37]/0 rounded-full animate-spin-slow"></div>
          </div>
        </div>
        
        <h2 className="text-[#D4AF37] text-xl font-bold mb-2">قم بتدوير جهازك</h2>
        
        <p className="text-white mb-4">
          للحصول على تجربة أفضل، يرجى استخدام هاتفك بالوضع الأفقي (Landscape)
        </p>
        
        <div className="flex justify-center items-center">
          <div className="w-16 h-16 bg-black/60 rounded-lg border border-[#D4AF37] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 animate-pulse"></div>
            <span className="text-3xl animate-bounce">↻</span>
          </div>
        </div>
      </div>
    </div>
  );
};