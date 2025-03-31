import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // تحقق أول مرة
    checkIsMobile();

    // إضافة مستمع لتغيير حجم النافذة
    window.addEventListener('resize', checkIsMobile);

    // تنظيف المستمع عند تفكيك المكون
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
}