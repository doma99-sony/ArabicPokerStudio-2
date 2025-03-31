
import { useState, useEffect } from 'react';

interface ChristmasLightsProps {
  count?: number;
  className?: string;
  colors?: string[];
  speed?: number;
}

// مكون أضواء الكريسماس المتحركة
export function ChristmasLights({
  count = 20,
  className = '',
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
  speed = 1000
}: ChristmasLightsProps) {
  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [glowingLights, setGlowingLights] = useState<number[]>([]);

  useEffect(() => {
    const randomLights = Array.from({ length: Math.floor(count / 2) }, () => 
      Math.floor(Math.random() * count)
    );
    setGlowingLights(randomLights);

    const interval = setInterval(() => {
      const newRandomLights = Array.from({ length: Math.floor(count / 2) }, () => 
        Math.floor(Math.random() * count)
      );
      setGlowingLights(newRandomLights);
      
      setActiveLight((prev) => {
        if (prev === null || prev >= count - 1) return 0;
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [count, speed]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="flex justify-around items-center h-full" style={{ gap: '10px' }}>
        {Array.from({ length: count }).map((_, index) => {
          const isGlowing = glowingLights.includes(index);
          const color = colors[index % colors.length];
          
          return (
            <div
              key={index}
              className="relative"
              style={{
                animation: `swing ${2 + Math.random()}s ease-in-out infinite`,
                transformOrigin: 'top'
              }}
            >
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  isGlowing ? 'scale-125' : 'scale-100'
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: isGlowing
                    ? `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`
                    : `0 0 5px ${color}`,
                  opacity: isGlowing ? 1 : 0.7
                }}
              />
              <div
                className="absolute top-0 left-1/2 w-px h-4 -translate-x-1/2 -translate-y-full"
                style={{ backgroundColor: '#2C3E50' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChristmasDecorationProps {
  className?: string;
}

// مكون الزينة المتناثرة
export function ChristmasDecoration({ className = '' }: ChristmasDecorationProps) {
  const decorations = [
    { emoji: '❄️', size: '2rem', animation: 'float-slow' },
    { emoji: '🎄', size: '3rem', animation: 'float-medium' },
    { emoji: '🎁', size: '2.5rem', animation: 'float-fast' },
    { emoji: '🎅', size: '3rem', animation: 'float-medium' },
    { emoji: '⭐', size: '2rem', animation: 'float-slow' },
    { emoji: '🔔', size: '2rem', animation: 'float-medium' },
    { emoji: '🦌', size: '2.5rem', animation: 'float-fast' },
    { emoji: '🧦', size: '2rem', animation: 'float-slow' },
    { emoji: '🕯️', size: '2rem', animation: 'float-medium' }
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {decorations.map((decoration, index) => {
        const left = `${Math.random() * 90 + 5}%`;
        const top = `${Math.random() * 90 + 5}%`;
        const delay = `${Math.random() * 5}s`;

        return (
          <div
            key={index}
            className={`absolute animate-${decoration.animation}`}
            style={{
              left,
              top,
              fontSize: decoration.size,
              animationDelay: delay,
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))',
              transform: `rotate(${Math.random() * 360}deg)`,
              transition: 'all 0.3s ease-in-out'
            }}
          >
            {decoration.emoji}
          </div>
        );
      })}
    </div>
  );
}

// إضافة ثلج متساقط
export function Snowflakes({ count = 50 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, index) => {
        const size = Math.random() * 10 + 5;
        const left = `${Math.random() * 100}%`;
        const animationDuration = `${Math.random() * 5 + 5}s`;
        const animationDelay = `${Math.random() * 5}s`;

        return (
          <div
            key={index}
            className="absolute top-0 animate-snowfall"
            style={{
              left,
              width: size,
              height: size,
              background: 'white',
              borderRadius: '50%',
              filter: 'blur(1px)',
              opacity: Math.random() * 0.6 + 0.4,
              animationDuration,
              animationDelay,
            }}
          />
        );
      })}
    </div>
  );
}

// بابا نويل مع العربة
interface SantaSleighProps {
  size?: 'sm' | 'md' | 'lg';
  startDelay?: number;
}

export function SantaSleigh({ size = 'md', startDelay = 0 }: SantaSleighProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div 
      className={`fixed -right-20 animate-fly-across ${sizes[size]}`}
      style={{
        top: size === 'lg' ? '20%' : size === 'md' ? '40%' : '60%',
        animationDelay: `${startDelay}s`,
        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
      }}
    >
      🎅🏻🛷
    </div>
  );
}
