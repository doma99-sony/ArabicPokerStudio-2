import { useEffect, useState } from 'react';

interface ChristmasLightsProps {
  count?: number;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function ChristmasLights({
  count = 20,
  className = '',
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  speed = 1000
}: ChristmasLightsProps) {
  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [glowingLights, setGlowingLights] = useState<number[]>([]);

  useEffect(() => {
    // إنشاء مصفوفة للأضواء المتوهجة العشوائية
    const randomLights = Array.from({ length: Math.floor(count / 3) }, () => 
      Math.floor(Math.random() * count)
    );
    setGlowingLights(randomLights);

    // بدء تأثير الوميض
    const interval = setInterval(() => {
      // تحديث الأضواء المتوهجة
      const newRandomLights = Array.from({ length: Math.floor(count / 3) }, () => 
        Math.floor(Math.random() * count)
      );
      setGlowingLights(newRandomLights);
      
      // تأثير توهج ضوء واحد بشكل متسلسل
      setActiveLight((prev) => {
        if (prev === null || prev >= count - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [count, speed]);

  return (
    <div className={`flex justify-center overflow-hidden ${className}`}>
      <div className="relative w-full flex justify-between mx-auto">
        {/* سلك الأضواء */}
        <div 
          className="absolute top-2 left-0 right-0 h-1 bg-gray-800 z-0"
          style={{ transform: 'translateY(8px)' }}
        ></div>
        
        {/* الأضواء */}
        {Array.from({ length: count }).map((_, index) => {
          const colorIndex = index % colors.length;
          const isGlowing = glowingLights.includes(index);
          const isActive = activeLight === index;
          
          return (
            <div 
              key={index}
              className="relative"
              style={{ zIndex: 1 }}
            >
              {/* سلك متصل بالضوء */}
              <div className="absolute top-0 left-1/2 h-3 w-[2px] bg-gray-700 -translate-x-1/2"></div>
              
              {/* الضوء نفسه */}
              <div
                className={`relative w-4 h-6 rounded-full transition-all duration-300 
                  ${isActive || isGlowing ? 'animate-pulse shadow-lg scale-110' : 'opacity-70'}`}
                style={{
                  backgroundColor: colors[colorIndex],
                  boxShadow: (isActive || isGlowing) 
                    ? `0 0 10px 2px ${colors[colorIndex]}, 0 0 20px ${colors[colorIndex]}` 
                    : 'none',
                  marginTop: '6px'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// مكون للزينة المتناثرة (أشكال الكريسماس)
interface ChristmasDecorationProps {
  className?: string;
}

export function ChristmasDecoration({ className = '' }: ChristmasDecorationProps) {
  // أشكال متنوعة للديكور (ندفة ثلج، شجرة، هدية، إلخ)
  const shapes = [
    '❄️', '🎄', '🎁', '🎅', '⭐', '🔔', '🦌', '🧦', '🕯️'
  ];
  
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {Array.from({ length: 30 }).map((_, index) => {
        const shape = shapes[index % shapes.length];
        const size = Math.random() * 1.5 + 0.7; // حجم عشوائي
        const left = `${Math.random() * 100}%`;
        const top = `${Math.random() * 100}%`;
        const animationDuration = Math.random() * 20 + 10; // مدة التحريك
        const delay = Math.random() * 5; // تأخير عشوائي
        
        return (
          <div
            key={index}
            className="absolute opacity-80 animate-float"
            style={{
              left,
              top,
              fontSize: `${size}rem`,
              animation: `float ${animationDuration}s ease-in-out ${delay}s infinite`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {shape}
          </div>
        );
      })}
    </div>
  );
}