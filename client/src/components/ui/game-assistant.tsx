import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useRef, useEffect } from 'react';

export function GameAssistant() {
  const isMobile = useIsMobile();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [initialTouch, setInitialTouch] = useState({ x: 0, y: 0 });
  const assistantRef = useRef<HTMLDivElement>(null);
  
  // تحديد الموضع الأولي للمساعد
  useEffect(() => {
    if (isMobile) {
      setPosition({ x: 10, y: window.innerHeight - 160 });
    } else {
      setPosition({ x: window.innerWidth - 200, y: window.innerHeight - 200 });
    }
  }, [isMobile]);
  
  // وظائف التحريك للماوس
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - (assistantRef.current?.offsetWidth || 0) / 2,
        y: e.clientY - (assistantRef.current?.offsetHeight || 0) / 2
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // وظائف التحريك للمس
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // تحريك عادي
      setIsDragging(true);
      setInitialTouch({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } else if (e.touches.length === 2) {
      // تغيير الحجم (بالضغط بإصبعين)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setInitialTouch({ x: distance, y: 0 });
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      // تحريك عادي
      setPosition({
        x: position.x + (e.touches[0].clientX - initialTouch.x),
        y: position.y + (e.touches[0].clientY - initialTouch.y)
      });
      setInitialTouch({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    } else if (e.touches.length === 2) {
      // تغيير الحجم
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // حساب مقدار التغيير في الحجم
      const initialDistance = initialTouch.x;
      if (initialDistance > 0) {
        const newScale = Math.max(0.5, Math.min(2.0, scale * (distance / initialDistance)));
        setScale(newScale);
      }
      setInitialTouch({ x: distance, y: 0 });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // إضافة مستمعي الأحداث للماوس واللمس
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove as any);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, position, initialTouch, scale]);
  
  // تغيير الحجم باستخدام عجلة الماوس
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(2.0, scale + delta));
    setScale(newScale);
  };
  
  // أنماط للتحكم في موضع وحجم المساعد
  const assistantStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: `scale(${scale})`,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'fixed',
    zIndex: 50,
    userSelect: 'none',
    touchAction: 'none'
  } as React.CSSProperties;
  
  return (
    <div 
      ref={assistantRef}
      className={`assistant-container ${isMobile ? 'mobile' : 'desktop'}`}
      style={assistantStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      <div className="assistant-wrapper">
        <img 
          src="/assets/assistant/game-assistant.png" 
          alt="مساعد اللعبة" 
          className="assistant-image"
          draggable="false"
        />
      </div>
      {/* زر للتكبير/التصغير على الجوال */}
      <div className="assistant-resize-controls">
        <button 
          className="resize-button" 
          onClick={() => setScale(Math.min(2.0, scale + 0.2))}
        >
          +
        </button>
        <button 
          className="resize-button" 
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
        >
          -
        </button>
      </div>
    </div>
  );
}

// تصدير الأنماط التي يمكن استخدامها عالمياً
export const gameAssistantStyles = `
  .assistant-container {
    position: fixed;
    z-index: 50;
    transition: transform 0.2s ease;
  }
  
  .assistant-wrapper {
    position: relative;
  }
  
  .assistant-container.desktop {
    left: 20px;
    bottom: 20px;
  }
  
  .assistant-container.mobile {
    left: 10px;
    bottom: 70px;
  }
  
  .assistant-button {
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease;
    outline: none;
    position: relative;
  }
  
  .assistant-button:hover {
    transform: scale(1.05);
  }
  
  .assistant-button:active {
    transform: scale(0.95);
  }
  
  .assistant-image {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }
  
  .assistant-dialog {
    direction: rtl;
  }
  
  .tip-container {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .assistant-resize-controls {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 51;
  }
  
  .resize-button {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #D4AF37;
    background-color: rgba(0, 0, 0, 0.7);
    color: #D4AF37;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  }
  
  .resize-button:hover {
    background-color: rgba(212, 175, 55, 0.2);
    transform: scale(1.1);
  }
  
  .resize-button:active {
    transform: scale(0.9);
  }
  
  @media (max-width: 640px) {
    .assistant-image {
      width: 80px;
      height: 80px;
    }
    
    .resize-button {
      width: 24px;
      height: 24px;
      font-size: 14px;
    }
  }
`;