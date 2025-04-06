import { useState, useEffect, useRef } from "react";

interface FallingCard {
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
  cardIndex: number; // يحدد نوع الكارت من المجموعة
}

interface PokerCardsEffectProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  zIndex?: number;
  cardImages?: string[];
}

// صور بطاقات البوكر المتاحة
const defaultCardImages = [
  "♠️", "♥️", "♦️", "♣️", 
  "🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮",
  "🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾",
  "🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎",
  "🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"
];

export function PokerCardsEffect({
  count = 50,
  minSize = 25,
  maxSize = 40,
  minSpeed = 1,
  maxSpeed = 3,
  minOpacity = 0.4,
  maxOpacity = 0.8,
  zIndex = 50,
  cardImages = defaultCardImages
}: PokerCardsEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fallingCards, setFallingCards] = useState<FallingCard[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number | null>(null);
  const frameTimeRef = useRef<number>(0);
  
  // إنشاء بطاقات البوكر المتساقطة
  const createFallingCards = () => {
    if (!containerRef.current) return [];
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const newFallingCards: FallingCard[] = [];
    
    for (let i = 0; i < count; i++) {
      newFallingCards.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
        swing: Math.random() * 4 - 2,
        swingDelta: Math.random() * 0.04 - 0.02,
        rotateSpeed: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        cardIndex: Math.floor(Math.random() * cardImages.length)
      });
    }
    
    return newFallingCards;
  };
  
  // تحديث موقع البطاقات في كل إطار
  const updateFallingCards = (deltaTime: number) => {
    if (!containerRef.current) return [];
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    return fallingCards.map(card => {
      // تحديث الموقع الرأسي
      let y = card.y + card.speed * deltaTime;
      
      // إعادة تدوير البطاقات التي تتجاوز الحد السفلي
      if (y > height) {
        y = -card.size;
      }
      
      // تحديث التأرجح
      let swing = card.swing + card.swingDelta * deltaTime;
      if (Math.abs(swing) > 2) {
        card.swingDelta *= -1;
      }
      
      // تحديث الموقع الأفقي مع التأرجح
      let x = card.x + Math.sin(y * 0.01) * swing;
      
      // إعادة ضبط إذا خرج من الحدود الجانبية
      if (x < -card.size) {
        x = width + card.size;
      } else if (x > width + card.size) {
        x = -card.size;
      }
      
      // تحديث الدوران
      const rotation = (card.rotation + card.rotateSpeed * deltaTime) % 360;
      
      return {
        ...card,
        x,
        y,
        swing,
        rotation
      };
    });
  };
  
  // رسم البطاقات على الكانفس
  const drawFallingCards = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // مسح الكانفس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم كل بطاقة متساقطة
    fallingCards.forEach(card => {
      ctx.save();
      
      // التحويل للبطاقة
      ctx.translate(card.x, card.y);
      ctx.rotate((card.rotation * Math.PI) / 180);
      
      // ضبط الشفافية
      ctx.globalAlpha = card.opacity;
      
      // رسم البطاقة
      ctx.font = `${card.size}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // اختيار بطاقة عشوائية من المجموعة المحددة
      const cardChar = cardImages[card.cardIndex];
      ctx.fillText(cardChar, 0, 0);
      
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
    
    // تحديث مواقع البطاقات
    setFallingCards(prevCards => updateFallingCards(deltaTime / 16));
    
    // رسم الإطار الحالي
    drawFallingCards();
    
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
        
        // إعادة إنشاء البطاقات
        setFallingCards(createFallingCards());
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
    console.log("تم تفعيل تساقط بطاقات البوكر!");
    
    return () => {
      // تنظيف عند إلغاء تحميل المكون
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerSize, fallingCards]);
  
  // التهيئة الأولية للبطاقات
  useEffect(() => {
    setFallingCards(createFallingCards());
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

// إصدارات مختلفة من تأثير البطاقات
export function HeavyPokerCardsEffect() {
  return (
    <PokerCardsEffect
      count={75}
      minSize={30}
      maxSize={50}
      minSpeed={1.5}
      maxSpeed={3.5}
      minOpacity={0.6}
      maxOpacity={0.9}
      zIndex={40}
    />
  );
}

export function LightPokerCardsEffect() {
  return (
    <PokerCardsEffect
      count={30}
      minSize={20}
      maxSize={35}
      minSpeed={0.8}
      maxSpeed={2}
      minOpacity={0.4}
      maxOpacity={0.7}
      zIndex={40}
    />
  );
}

// تأثير يظهر فقط بطاقات الشدة (الشكل)
export function SuitSymbolsEffect() {
  return (
    <PokerCardsEffect
      count={40}
      minSize={20}
      maxSize={35}
      minSpeed={1}
      maxSpeed={2.5}
      minOpacity={0.5}
      maxOpacity={0.8}
      zIndex={40}
      cardImages={["♠️", "♥️", "♦️", "♣️"]}
    />
  );
}