import React, { useState, useEffect, ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { getOptimalImageSize } from "@/lib/performance-utils";

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'fallback'> {
  fallback?: string | ReactNode;
  lazyLoad?: boolean;
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  lowQualityPlaceholder?: string;
  blurhash?: string;
}

export function Image({ 
  src, 
  alt, 
  className, 
  fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%23D4AF37' text-anchor='middle' dominant-baseline='middle'%3E%D8%AC%D8%A7%D8%B1%D9%8A %D8%A7%D9%84%D8%AA%D8%AD%D9%85%D9%8A%D9%84...%3C/text%3E%3C/svg%3E",
  lazyLoad = true,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  lowQualityPlaceholder,
  blurhash,
  ...props 
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(lowQualityPlaceholder || src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const imgRef = useRef<HTMLImageElement>(null);

  // تحديد الحجم المناسب للصورة بناءً على حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (mobileSrc || tabletSrc || desktopSrc) {
        const size = getOptimalImageSize();
        if (size === 'small' && mobileSrc) {
          setImgSrc(mobileSrc);
        } else if (size === 'medium' && tabletSrc) {
          setImgSrc(tabletSrc);
        } else if (size === 'large' && desktopSrc) {
          setImgSrc(desktopSrc);
        } else {
          setImgSrc(src);
        }
      } else {
        setImgSrc(src);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [src, mobileSrc, tabletSrc, desktopSrc]);

  // التحميل الكسول
  useEffect(() => {
    if (!lazyLoad || !imgRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(imgRef.current!);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazyLoad]);

  // تحديث حالة الصورة عند تغيير المصدر
  useEffect(() => {
    if (isInView && imgSrc) {
      const fullImage = document.createElement('img');
      fullImage.src = imgSrc;
      fullImage.onload = () => {
        setIsLoading(false);
      };
      fullImage.onerror = () => {
        setError(true);
        setIsLoading(false);
      };
    }
  }, [imgSrc, isInView]);

  if (error && typeof fallback !== 'string') {
    return <div className={className}>{fallback}</div>;
  }

  // إذا كان هناك blurhash، استخدمه كخلفية أثناء التحميل
  const blurStyle = blurhash && isLoading ? { 
    backgroundImage: `url(${blurhash})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center' 
  } : {};

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        isLoading && "bg-slate-800/20",
        className
      )}
      style={blurStyle}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-800/30 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={!isInView ? (lowQualityPlaceholder || 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==')
            : error && typeof fallback === 'string' ? fallback 
            : imgSrc
        }
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          isLoading && "opacity-0",
          !isLoading && "transition-opacity duration-500 opacity-100",
          className
        )}
        loading={lazyLoad ? "lazy" : "eager"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
