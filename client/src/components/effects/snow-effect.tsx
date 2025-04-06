import { useState, useEffect, useRef } from "react";

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  swing: number;
  swingDelta: number;
  rotateSpeed: number;
  rotation: number;
}

interface SnowEffectProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  color?: string;
  zIndex?: number;
  snowflakeChars?: string[];
  goldFlakes?: boolean;
}

export function SnowEffect({
  count = 50,
  minSize = 5,
  maxSize = 15,
  minSpeed = 1,
  maxSpeed = 3,
  minOpacity = 0.4,
  maxOpacity = 0.8,
  color = "white",
  zIndex = 50,
  snowflakeChars = ["❄", "❅", "❆", "✨", "*", "•"],
  goldFlakes = false
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);
  const frameTimeRef = useRef<number>(0);
  
  // إنشاء كتلة من الثلوج بناءً على المعلمات المقدمة
  const createSnowflakes = () => {
    if (!containerRef.current) return [];
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const newSnowflakes: Snowflake[] = [];
    
    for (let i = 0; i < count; i++) {
      newSnowflakes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
        swing: Math.random() * 4 - 2,
        swingDelta: Math.random() * 0.04 - 0.02,
        rotateSpeed: Math.random() * 2 - 1,
        rotation: Math.random() * 360
      });
    }
    
    return newSnowflakes;
  };
  
  // تحديث موقع الثلج في كل إطار
  const updateSnowflakes = (deltaTime: number) => {
    if (!containerRef.current) return [];
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    return snowflakes.map(flake => {
      // تحديث الموقع الرأسي
      let y = flake.y + flake.speed * deltaTime;
      
      // إعادة تدوير الندف التي تتجاوز الحد السفلي
      if (y > height) {
        y = -flake.size;
      }
      
      // تحديث التأرجح
      let swing = flake.swing + flake.swingDelta * deltaTime;
      if (Math.abs(swing) > 2) {
        flake.swingDelta *= -1;
      }
      
      // تحديث الموقع الأفقي مع التأرجح
      let x = flake.x + Math.sin(y * 0.01) * swing;
      
      // إعادة ضبط إذا خرج من الحدود الجانبية
      if (x < -flake.size) {
        x = width + flake.size;
      } else if (x > width + flake.size) {
        x = -flake.size;
      }
      
      // تحديث الدوران
      const rotation = (flake.rotation + flake.rotateSpeed * deltaTime) % 360;
      
      return {
        ...flake,
        x,
        y,
        swing,
        rotation
      };
    });
  };
  
  // رسم الثلوج على الكانفس
  const drawSnowflakes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // مسح الكانفس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم كل ندفة ثلج
    snowflakes.forEach(flake => {
      ctx.save();
      
      // القلب والتحويل للندفة
      ctx.translate(flake.x, flake.y);
      ctx.rotate((flake.rotation * Math.PI) / 180);
      
      // ضبط الشفافية واللون
      ctx.globalAlpha = flake.opacity;
      
      // تحديد نوع الرسم بناءً على نوع الندفة
      if (goldFlakes) {
        // ندف ذهبية مع توهج
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flake.size);
        gradient.addColorStop(0, "rgba(255, 215, 0, 0.8)");
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, flake.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // إضافة لمعان
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(0, 0, flake.size / 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // رسم ندف الثلج النصية
        ctx.font = `${flake.size}px Arial`;
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // اختيار حرف عشوائي من المجموعة المحددة
        const char = snowflakeChars[Math.floor(flake.id % snowflakeChars.length)];
        ctx.fillText(char, 0, 0);
      }
      
      ctx.restore();
    });
  };
  
  // حلقة الرسوم المتحركة
  const animate = (timestamp: number) => {
    if (!frameTimeRef.current) {
      frameTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - frameTimeRef.current;
    frameTimeRef.current = timestamp;
    
    // تحديث مواقع الثلج
    setSnowflakes(prevSnowflakes => updateSnowflakes(deltaTime / 16));
    
    // رسم الإطار الحالي
    drawSnowflakes();
    
    // استمرار الحلقة
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // مراقبة تغييرات حجم النافذة
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
        
        // ضبط حجم الكانفس بناءً على حجم الحاوية
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        
        // إعادة إنشاء الثلوج
        setSnowflakes(createSnowflakes());
      }
    };
    
    // التحديث المبدئي
    updateSize();
    
    // الاستجابة للتغييرات في حجم النافذة
    window.addEventListener("resize", updateSize);
    
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);
  
  // بدء وإيقاف حلقة الرسوم المتحركة
  useEffect(() => {
    // بدء الرسوم المتحركة
    if (canvasRef.current && containerSize.width > 0 && containerSize.height > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // تسجيل في وحدة التحكم للتأكيد
    console.log("تم تفعيل تساقط الثلج!");
    
    return () => {
      // تنظيف عند إلغاء تحميل المكون
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerSize, snowflakes]);
  
  // التهيئة الأولية للثلوج
  useEffect(() => {
    setSnowflakes(createSnowflakes());
  }, [count, minSize, maxSize]);
  
  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0" 
        width={containerSize.width} 
        height={containerSize.height}
      />
    </div>
  );
}

// إصدارات مختلفة من مكون الثلج
export function GoldDustEffect() {
  return (
    <SnowEffect
      count={35}
      minSize={3}
      maxSize={8}
      minSpeed={0.5}
      maxSpeed={1.5}
      minOpacity={0.3}
      maxOpacity={0.7}
      color="#FFD700"
      zIndex={40}
      snowflakeChars={["✨", "⋆", "⊹", "✧", "✦"]}
      goldFlakes={true}
    />
  );
}

export function HeavySnowEffect() {
  return (
    <SnowEffect
      count={100}
      minSize={8}
      maxSize={20}
      minSpeed={1.5}
      maxSpeed={4}
      minOpacity={0.6}
      maxOpacity={0.9}
      color="white"
      zIndex={40}
    />
  );
}

export function LightSnowEffect() {
  return (
    <SnowEffect
      count={40}
      minSize={5}
      maxSize={12}
      minSpeed={0.8}
      maxSpeed={2}
      minOpacity={0.4}
      maxOpacity={0.7}
      color="white"
      zIndex={40}
    />
  );
}