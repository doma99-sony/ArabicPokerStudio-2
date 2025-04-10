import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ScrollBackgroundProps {
  children: React.ReactNode;
  isRevealed?: boolean;  // للتحكم في ظهور المحتوى
  direction?: 'horizontal' | 'vertical';  // اتجاه فتح البردية
  revealDuration?: number;  // مدة انيميشن الكشف
  scrollTexture?: string;  // مسار نسيج البردية
}

/**
 * مكون خلفية البردية المتحركة
 * يقوم بإظهار المحتوى كأنه على بردية مصرية قديمة تتكشف
 */
export default function ScrollBackground({
  children,
  isRevealed = true,
  direction = 'vertical',
  revealDuration = 1.2,
  scrollTexture
}: ScrollBackgroundProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [initialHeight, setInitialHeight] = useState<number>(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState<boolean>(false);
  
  // إعداد تأثير البردية عند التحميل
  useEffect(() => {
    if (scrollRef.current && contentRef.current) {
      // حفظ الارتفاع الأصلي للمحتوى
      const contentHeight = contentRef.current.scrollHeight;
      setInitialHeight(contentHeight);
      
      // إعادة ضبط الحالة لإمكانية تكرار الانيميشن
      if (!isRevealed) {
        setIsAnimationComplete(false);
        
        // إخفاء المحتوى (البردية مطوية)
        if (direction === 'vertical') {
          gsap.set(scrollRef.current, { height: 0 });
        } else {
          gsap.set(scrollRef.current, { width: 0 });
        }
      } else {
        // إظهار المحتوى مباشرة إذا كان isRevealed صحيحًا
        if (direction === 'vertical') {
          gsap.set(scrollRef.current, { height: 'auto' });
        } else {
          gsap.set(scrollRef.current, { width: '100%' });
        }
        setIsAnimationComplete(true);
      }
    }
  }, [direction]);
  
  // تنفيذ انيميشن فتح/طي البردية عند تغيير isRevealed
  useEffect(() => {
    if (scrollRef.current) {
      if (isRevealed) {
        // انيميشن فتح البردية
        const unrollAnimation = direction === 'vertical'
          ? { height: 'auto', ease: 'power2.out' }
          : { width: '100%', ease: 'power2.out' };
        
        gsap.to(scrollRef.current, {
          ...unrollAnimation,
          duration: revealDuration,
          onComplete: () => setIsAnimationComplete(true)
        });
        
        // تأثير ظهور تدريجي للمحتوى بعد فتح البردية
        gsap.to(contentRef.current, {
          opacity: 1,
          duration: revealDuration * 0.7,
          delay: revealDuration * 0.3
        });
      } else {
        // انيميشن طي البردية
        const rollAnimation = direction === 'vertical'
          ? { height: 0, ease: 'power2.in' }
          : { width: 0, ease: 'power2.in' };
        
        // إخفاء المحتوى أولاً
        gsap.to(contentRef.current, {
          opacity: 0,
          duration: revealDuration * 0.3,
          onComplete: () => {
            // ثم طي البردية
            gsap.to(scrollRef.current, {
              ...rollAnimation,
              duration: revealDuration * 0.7,
              onComplete: () => setIsAnimationComplete(false)
            });
          }
        });
      }
    }
  }, [isRevealed, direction, revealDuration]);
  
  // تحديد أنماط الاتجاه بناءً على اتجاه فتح البردية
  const scrollDirectionStyles = direction === 'vertical'
    ? 'flex-col overflow-hidden'
    : 'flex-row overflow-hidden w-0';
  
  // تحديد نسيج البردية النهائي (استخدام نسيج افتراضي إذا لم يتم توفير أي شيء)
  const finalScrollTexture = scrollTexture || 'radial-gradient(circle, rgba(219,177,131,1) 0%, rgba(200,155,100,1) 100%)';
  
  return (
    <div className={`scroll-background-container relative w-full h-full flex ${scrollDirectionStyles}`} ref={scrollRef}>
      {/* تأثيرات حواف البردية */}
      {direction === 'vertical' && (
        <>
          <div className="scroll-edge-top h-8 w-full bg-gradient-to-b from-amber-900/50 to-transparent sticky top-0 z-10"></div>
          <div className="scroll-edge-bottom h-8 w-full bg-gradient-to-t from-amber-900/50 to-transparent sticky bottom-0 z-10"></div>
        </>
      )}
      
      {direction === 'horizontal' && (
        <>
          <div className="scroll-edge-left w-8 h-full bg-gradient-to-r from-amber-900/50 to-transparent sticky left-0 z-10"></div>
          <div className="scroll-edge-right w-8 h-full bg-gradient-to-l from-amber-900/50 to-transparent sticky right-0 z-10"></div>
        </>
      )}
      
      {/* حاوية المحتوى مع نسيج البردية */}
      <div
        className="scroll-content relative w-full flex-grow p-4 md:p-8"
        style={{
          background: finalScrollTexture,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          opacity: isAnimationComplete ? 1 : 0
        }}
        ref={contentRef}
      >
        {/* زخارف البردية */}
        <div className="scroll-decorations absolute inset-0 pointer-events-none">
          {/* خطوط أفقية على البردية لتحاكي الطيات */}
          <div className="h-full w-full flex flex-col justify-between">
            {Array.from({ length: 8 }).map((_, index) => (
              <div 
                key={`line-${index}`}
                className="w-full h-px bg-amber-900/10"
                style={{ marginTop: index === 0 ? '0' : 'auto' }}
              ></div>
            ))}
          </div>
          
          {/* نقوش هيروغليفية باهتة */}
          <div className="hieroglyphs absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 text-amber-900 text-3xl">𓂀</div>
            <div className="absolute top-4 right-4 text-amber-900 text-3xl">𓃀</div>
            <div className="absolute bottom-4 left-4 text-amber-900 text-3xl">𓅓</div>
            <div className="absolute bottom-4 right-4 text-amber-900 text-3xl">𓆣</div>
          </div>
        </div>
        
        {/* المحتوى الفعلي */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}