/**
 * مكون تأثير الفقاعات للخلفية
 * يضيف فقاعات متحركة لخلفية اللعبة لإضفاء الحيوية
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface BubblesEffectProps {
  count?: number; // عدد الفقاعات
  className?: string; // فئة CSS إضافية
}

const BubblesEffect: React.FC<BubblesEffectProps> = ({ 
  count = 15,
  className = ''
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // إنشاء الفقاعات عند تحميل المكون
  useEffect(() => {
    const newBubbles: Bubble[] = [];
    
    for (let i = 0; i < count; i++) {
      newBubbles.push({
        id: i,
        x: Math.random() * 100, // موقع أفقي عشوائي (0-100%)
        size: Math.random() * 20 + 10, // حجم عشوائي (10-30px)
        delay: Math.random() * 10, // تأخير بدء الحركة (0-10s)
        duration: Math.random() * 10 + 15, // مدة الحركة (15-25s)
        opacity: Math.random() * 0.3 + 0.1 // شفافية عشوائية (0.1-0.4)
      });
    }
    
    setBubbles(newBubbles);
  }, [count]);

  return (
    <div className={`bubbles-container ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="bubble"
          style={{
            left: `${bubble.x}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
          }}
          initial={{ y: '100vh' }}
          animate={{ 
            y: '-100vh',
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default BubblesEffect;