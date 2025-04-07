import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatChips } from '@/lib/utils';

interface RocketGameProps {
  gameStatus: 'waiting' | 'flying' | 'crashed';
  multiplier: number;
}

const RocketGame = forwardRef(({ gameStatus, multiplier }: RocketGameProps, ref) => {
  const [rocketHeight, setRocketHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Array<{ id: number, x: number, y: number, size: number, delay: number }>>([]);
  const [smokeParticles, setSmokeParticles] = useState<Array<{ id: number, x: number, y: number, size: number, opacity: number, delay: number }>>([]);
  
  // كشف رجوع الصاروخ (منع من الخروج من الشاشة)
  useEffect(() => {
    if (containerRef.current && rocketRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const rocketHeight = containerRef.current.clientHeight * 0.15; // حجم الصاروخ 15% من الارتفاع
      
      // عند وضع الانتظار، الصاروخ في الأسفل
      if (gameStatus === 'waiting') {
        setRocketHeight(0);
      }
      // عند وضع الطيران أو التحطم
      else {
        // استخدام اللوغاريتم لجعل الحركة أكثر جاذبية مع زيادة المضاعف
        const heightPercentage = Math.log10(multiplier + 1) / Math.log10(11); // Max multiplier ~10x
        const newHeight = Math.min(containerHeight * 0.8 * heightPercentage, containerHeight * 0.8);
        setRocketHeight(newHeight);
      }
    }
  }, [gameStatus, multiplier]);
  
  // إنشاء النجوم في الخلفية
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // إنشاء 100 نجمة عشوائية
      const newStars = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
      }));
      
      setStars(newStars);
    }
  }, []);
  
  // إنشاء دخان للصاروخ
  useEffect(() => {
    if (gameStatus === 'flying' && rocketRef.current) {
      const interval = setInterval(() => {
        if (rocketRef.current) {
          const rocketRect = rocketRef.current.getBoundingClientRect();
          const particleX = rocketRect.left + rocketRect.width / 2;
          const particleY = rocketRect.bottom;
          
          setSmokeParticles(prev => [
            ...prev,
            {
              id: Date.now(),
              x: particleX + (Math.random() * 10 - 5),
              y: particleY,
              size: Math.random() * 10 + 5,
              opacity: 0.8,
              delay: 0,
            },
          ]);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameStatus]);
  
  // إزالة جسيمات الدخان بعد فترة
  useEffect(() => {
    const interval = setInterval(() => {
      setSmokeParticles(prev => prev.filter(p => Date.now() - p.id < 2000));
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // إضافة وظائف للمرجع الخارجي
  useImperativeHandle(ref, () => ({
    triggerExplosion: () => {
      // يمكن إضافة تأثير انفجار هنا عند الحاجة
      console.log('BOOM!');
    }
  }));
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gradient-to-b from-[#0A0D16] to-[#1A2035]"
    >
      {/* طبقة النجوم */}
      <div ref={starsRef} className="absolute inset-0">
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: Math.random() * 0.5 + 0.5,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ${star.delay}s`
            }}
          />
        ))}
      </div>
      
      {/* طبقة النار والهالة في أسفل الصاروخ */}
      {gameStatus === 'flying' && (
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2" style={{ bottom: `${rocketHeight + 20}px` }}>
          <div className="relative">
            <div className="absolute bottom-0 w-8 h-16 bg-gradient-to-t from-orange-500 via-yellow-300 to-transparent rounded-full opacity-80 animate-pulse-fast" style={{ transform: 'translateY(40%)' }}></div>
            <div className="absolute bottom-0 w-4 h-24 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full opacity-70 animate-pulse-fast" style={{ transform: 'translateY(30%)' }}></div>
          </div>
        </div>
      )}
      
      {/* المؤثرات الصوتية (جسيمات الدخان) */}
      {gameStatus === 'flying' && smokeParticles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            opacity: particle.opacity,
            scale: 1
          }}
          animate={{ 
            y: particle.y + 100, 
            x: particle.x + (Math.random() * 40 - 20),
            opacity: 0,
            scale: 0.5
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute bg-gray-300 rounded-full pointer-events-none"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
      
      {/* الهرم (خلفية مصرية) */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1/4">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#D4AF37]/20 triangle-pyramid"></div>
          <div className="absolute bottom-0 left-1/4 right-1/4 h-3/4 bg-[#D4AF37]/10 triangle-pyramid"></div>
        </div>
      </div>
      
      {/* أرض مصرية */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#5e3d0f] to-[#8B4513]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]/30"></div>
      </div>
      
      {/* الصاروخ */}
      <div 
        ref={rocketRef}
        className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-200"
        style={{ 
          bottom: `${gameStatus === 'crashed' ? 20 : 20 + rocketHeight}px`,
          filter: gameStatus === 'crashed' ? 'brightness(0.7) hue-rotate(240deg)' : 'brightness(1)',
          transition: gameStatus === 'flying' ? 'bottom 0.2s ease-out' : 'bottom 0.5s ease-in'
        }}
      >
        {/* الصاروخ نفسه */}
        <div className="relative">
          {/* جسم الصاروخ */}
          <div className="w-12 h-24 bg-gradient-to-b from-[#D4AF37] to-[#E6D696] rounded-t-full relative">
            {/* رأس الصاروخ */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#D4AF37] rounded-t-full"></div>
            
            {/* نوافذ الصاروخ */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#87CEEB] rounded-full border-2 border-[#B08D2A]"></div>
            
            {/* زخارف مصرية */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-[#0A0D16]"></div>
            <div className="absolute bottom-4 left-0 right-0 h-1 bg-[#0A0D16]"></div>
            
            {/* زعانف الصاروخ */}
            <div className="absolute -left-3 bottom-0 w-3 h-8 bg-[#D4AF37] skew-y-[45deg]"></div>
            <div className="absolute -right-3 bottom-0 w-3 h-8 bg-[#D4AF37] skew-y-[-45deg]"></div>
          </div>
          
          {/* علم مصر أو رمز مصري */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-6 h-4 overflow-hidden">
            <div className="w-full h-1/3 bg-red-600"></div>
            <div className="w-full h-1/3 bg-white"></div>
            <div className="w-full h-1/3 bg-black"></div>
          </div>
        </div>
        
        {/* تأثير الانفجار */}
        {gameStatus === 'crashed' && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500 rounded-full mix-blend-screen"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-600 rounded-full mix-blend-screen"
            />
          </motion.div>
        )}
      </div>
      
      {/* مسار الصاروخ - خط متقطع على الجانب */}
      {(gameStatus === 'flying' || gameStatus === 'crashed') && (
        <div className="absolute left-0 bottom-0 top-0 w-10 flex flex-col justify-end">
          <div className="w-full h-full flex flex-col justify-between py-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-2 h-[1px] bg-gray-500"></div>
                <div className="text-[10px] text-gray-400 ml-1">
                  {(10 - i).toFixed(1)}x
                </div>
              </div>
            ))}
          </div>
          
          {/* مؤشر المضاعف الحالي على الجانب */}
          <div 
            className="absolute left-0 w-8 flex items-center"
            style={{ 
              bottom: `${(Math.min(multiplier / 10, 1) * 100)}%`, 
              transition: 'bottom 0.2s ease-out',
              opacity: gameStatus === 'flying' || gameStatus === 'crashed' ? 1 : 0
            }}
          >
            <div className="w-2 h-[1px] bg-[#D4AF37]"></div>
            <div className="text-[10px] text-[#D4AF37] font-bold ml-1">
              {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}
      
      {/* حالة اللعبة */}
      {gameStatus === 'waiting' && (
        <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border border-[#D4AF37]/30 animate-pulse">
          <div className="text-white text-xl font-bold">جاري الإطلاق...</div>
        </div>
      )}
      
      {gameStatus === 'crashed' && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm px-10 py-6 rounded-xl border border-red-500/50"
        >
          {multiplier === 1.0 ? (
            <>
              <div className="text-red-500 text-3xl font-bold text-center mb-2">⚡ لعنة الفراعنة! ⚡</div>
              <div className="text-white text-lg font-bold text-center">انفجار فوري {multiplier.toFixed(2)}x</div>
            </>
          ) : (
            <>
              <div className="text-red-500 text-3xl font-bold text-center mb-2">💥 انفجر! 💥</div>
              <div className="text-white text-lg font-bold text-center">{multiplier.toFixed(2)}x</div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
});

RocketGame.displayName = 'RocketGame';

export default RocketGame;