/**
 * مكون لإضافة تأثير فقاعات متحركة للخلفية المائية
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BUBBLE_IMAGE } from '../assets/images';

interface BubblesEffectProps {
  count?: number; // عدد الفقاعات
  speed?: number; // سرعة الحركة (1 = عادي)
  size?: [number, number]; // نطاق أحجام الفقاعات [الحد الأدنى، الحد الأقصى]
}

interface Bubble {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
}

const BubblesEffect: React.FC<BubblesEffectProps> = ({
  count = 20,
  speed = 1,
  size = [10, 30]
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  // إنشاء الفقاعات عند تحميل المكون
  useEffect(() => {
    const newBubbles: Bubble[] = [];
    
    for (let i = 0; i < count; i++) {
      newBubbles.push({
        id: i,
        size: Math.random() * (size[1] - size[0]) + size[0],
        x: Math.random() * 100, // موقع عشوائي أفقياً (0-100%)
        y: 100 + Math.random() * 50, // تبدأ من أسفل الشاشة أو أدنى
        duration: (Math.random() * 10 + 5) / speed, // مدة الصعود
        delay: Math.random() * 15 // تأخير عشوائي قبل البدء
      });
    }
    
    setBubbles(newBubbles);
  }, [count, speed, size]);
  
  return (
    <div className="bubbles-container" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none', // السماح بالتفاعل مع العناصر التي في الخلف
      zIndex: 5 // طبقة فوق الخلفية ولكن تحت العناصر التفاعلية
    }}>
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          style={{
            position: 'absolute',
            left: `${bubble.x}%`,
            bottom: `-${bubble.size}px`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: 0,
            zIndex: Math.floor(bubble.size), // الفقاعات الكبيرة أكثر للأمام
            backgroundImage: `url(${BUBBLE_IMAGE})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'blur(0.5px)'
          }}
          animate={{
            y: [`0%`, `-${100 + bubble.y}%`],
            x: [
              `${bubble.x}%`,
              `${bubble.x + (Math.random() * 10 - 5)}%`,
              `${bubble.x + (Math.random() * 20 - 10)}%`,
              `${bubble.x + (Math.random() * 10 - 5)}%`
            ],
            opacity: [0, 0.7, 0.7, 0],
            scale: [1, 1.1, 0.9, 1.2, 1]
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export default BubblesEffect;