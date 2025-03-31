/**
 * مساعدة لتحسين أداء التطبيق خاصة للهواتف المحمولة
 */

export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * تحميل الصور وملفات الفيديو بشكل كسول لتحسين الأداء
 * 
 * @param target العنصر المراد تحميله بشكل كسول
 * @param options خيارات التحميل الكسول
 */
export function setupLazyLoading(
  target: string = 'img, video', 
  options: LazyLoadOptions = { threshold: 0.1, rootMargin: '100px' }
): void {
  if ('IntersectionObserver' in window) {
    const lazyElements = document.querySelectorAll(target);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLImageElement | HTMLVideoElement;
          if (element.dataset.src) {
            element.src = element.dataset.src;
            delete element.dataset.src;
          }
          
          if (element.tagName === 'VIDEO' && element.dataset.autoplay) {
            try {
              (element as HTMLVideoElement).play();
            } catch (e) {
              console.log('تعذر تشغيل الفيديو تلقائيًا');
            }
          }
          
          observer.unobserve(element);
        }
      });
    }, options);
    
    lazyElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // إذا كان المتصفح لا يدعم IntersectionObserver، فقط قم بتحميل الصور فورًا
    const elements = document.querySelectorAll('[data-src]');
    elements.forEach(element => {
      const el = element as HTMLImageElement | HTMLVideoElement;
      if (el.dataset.src) {
        el.src = el.dataset.src;
      }
    });
  }
}

/**
 * تحسين حجم الصور حسب حجم شاشة الجهاز
 * 
 * @returns حجم الصورة المناسب
 */
export function getOptimalImageSize(): 'small' | 'medium' | 'large' {
  const width = window.innerWidth;
  if (width <= 576) return 'small';
  if (width <= 992) return 'medium';
  return 'large';
}

/**
 * تهيئة موارد الصفحة لتحسين الأداء
 */
export function initializePerformanceOptimizations(): void {
  // إضافة طبقة للصور المحملة كسولًا بعد تحميل DOM
  document.addEventListener('DOMContentLoaded', () => {
    setupLazyLoading();
    
    // تحسين معالجة الأحداث للهواتف المحمولة
    optimizeEventHandlersForMobile();
  });
}

/**
 * تحسين معالجة الأحداث للأجهزة المحمولة
 */
function optimizeEventHandlersForMobile(): void {
  if ('ontouchstart' in window) {
    // تحسين الاستجابة اللمسية على الهواتف المحمولة
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
  }
}