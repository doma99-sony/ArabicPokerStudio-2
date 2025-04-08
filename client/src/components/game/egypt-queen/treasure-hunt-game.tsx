import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, useTexture, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';

interface TreasureProps {
  position: [number, number, number];
  scale?: number;
  value: number;
  isCollected: boolean;
  onClick: () => void;
  id: number;
}

// مكون كنز فردي
function Treasure({ position, scale = 1, value, isCollected, onClick, id }: TreasureProps) {
  const treasureRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/treasure-chest.png');
  const valueRef = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  
  // تأثيرات حركة للكنز
  useEffect(() => {
    if (treasureRef.current) {
      // حركة بسيطة للطفو
      gsap.to(treasureRef.current.position, {
        y: position[1] + 0.2,
        duration: 1.5 + Math.random() * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 0.5
      });
      
      // دوران بطيء
      gsap.to(treasureRef.current.rotation, {
        y: Math.PI * 2,
        duration: 10 + Math.random() * 5,
        repeat: -1,
        ease: "none"
      });
    }
    
    // إظهار المكافأة عند تجميعها
    if (isCollected && valueRef.current) {
      gsap.fromTo(
        valueRef.current.position,
        { y: position[1] },
        { 
          y: position[1] + 3, 
          duration: 1.5,
          ease: "power1.out"
        }
      );
      
      gsap.to(valueRef.current.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
      
      // اختفاء تدريجي للقيمة
      gsap.to(valueRef.current, {
        opacity: 0,
        duration: 1,
        delay: 1.2
      });
    }
  }, [position, isCollected]);
  
  // تأثيرات إضافية للتوهج عند التحويم
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2 * 0.3 + 0.4;
      glowRef.current.material.opacity = hover ? 0.7 : pulse;
      
      if (glowRef.current.scale.x) {
        const scalePulse = hover ? 1.2 : (1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05);
        glowRef.current.scale.set(scalePulse, scalePulse, 1);
      }
    }
  });
  
  // تغيير حجم الكنز عند تجميعه
  useEffect(() => {
    if (treasureRef.current && isCollected) {
      gsap.to(treasureRef.current.scale, {
        x: 0.1, y: 0.1, z: 0.1,
        duration: 0.5,
        ease: "back.in"
      });
    }
  }, [isCollected]);
  
  return (
    <group position={position}>
      {/* توهج خلفي للكنز */}
      <mesh 
        ref={glowRef} 
        position={[0, 0, -0.1]}
      >
        <circleGeometry args={[1.2 * scale, 32]} />
        <meshBasicMaterial 
          color={hover ? "#FFD700" : "#D4AF37"}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* الكنز نفسه */}
      <group 
        ref={treasureRef}
        onClick={onClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={[scale, scale, scale]}
      >
        <mesh>
          <boxGeometry args={[1, 0.8, 0.6]} />
          <meshStandardMaterial 
            map={texture}
            metalness={0.7}
            roughness={0.3}
            emissive={hover ? "#FFCC00" : "#000000"}
            emissiveIntensity={hover ? 0.5 : 0}
          />
        </mesh>
      </group>
      
      {/* قيمة الكنز (تظهر عند التجميع) */}
      {isCollected && (
        <group ref={valueRef} position={[0, 0, 0]}>
          <Text
            position={[0, 0, 0]}
            color="#FFD700"
            fontSize={0.5}
            font="/fonts/Cairo-Bold.ttf"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            +{value.toLocaleString('ar-EG')}
          </Text>
        </group>
      )}
    </group>
  );
}

// الخلفية الرملية مع الأهرامات
function DesertBackground() {
  const bgTexture = useTexture('/images/egypt-queen/backgrounds/pyramids-desert.svg');
  
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[30, 15]} />
      <meshBasicMaterial map={bgTexture} transparent opacity={0.8} />
    </mesh>
  );
}

// أشعة الشمس
function SunRays() {
  const rayRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (rayRef.current) {
      rayRef.current.rotation.z += 0.001;
      const pulse = (Math.sin(state.clock.elapsedTime * 0.5) + 1) / 2 * 0.3 + 0.3;
      rayRef.current.material.opacity = pulse;
    }
  });
  
  return (
    <mesh ref={rayRef} position={[8, 5, -4]} rotation={[0, 0, Math.PI / 4]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

interface TreasureHuntGameProps {
  isActive: boolean;
  initialTreasures?: number;
  onComplete: (treasureValue: number) => void;
  gameTime?: number; // وقت اللعبة بالثواني
}

export function TreasureHuntGame({ 
  isActive, 
  initialTreasures = 12, 
  onComplete,
  gameTime = 30 // 30 ثانية افتراضياً
}: TreasureHuntGameProps) {
  const [treasures, setTreasures] = useState<Array<{
    id: number;
    position: [number, number, number];
    value: number;
    isCollected: boolean;
  }>>([]);
  
  const [totalCollected, setTotalCollected] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(gameTime);
  const [showResults, setShowResults] = useState(false);
  const gameActive = useRef(false);
  
  // توليد الكنوز عند بدء اللعبة
  useEffect(() => {
    if (isActive && !gameActive.current) {
      gameActive.current = true;
      
      // إعادة تعيين الحالة
      setTreasures([]);
      setTotalCollected(0);
      setTimeRemaining(gameTime);
      setShowResults(false);
      
      // إنشاء الكنوز
      const newTreasures = Array.from({ length: initialTreasures }, (_, i) => {
        // القيم تتراوح بين 500 و10000
        const treasureValue = Math.floor(Math.random() * 9500) + 500;
        
        // التوزيع على الشاشة
        return {
          id: i,
          position: [
            (Math.random() - 0.5) * 16, // -8 إلى 8
            (Math.random() - 0.5) * 8, // -4 إلى 4
            (Math.random() - 0.5) * 2 // توزيع بسيط على محور Z
          ] as [number, number, number],
          value: treasureValue,
          isCollected: false
        };
      });
      
      setTreasures(newTreasures);
      
      // بدء مؤقت العد التنازلي
      const gameTimer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(gameTimer);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(gameTimer);
        gameActive.current = false;
      };
    }
  }, [isActive, initialTreasures, gameTime]);
  
  // تجميع الكنز
  const collectTreasure = (treasureId: number) => {
    setTreasures(prevTreasures => {
      const updatedTreasures = [...prevTreasures];
      const treasureIndex = updatedTreasures.findIndex(t => t.id === treasureId);
      
      if (treasureIndex !== -1 && !updatedTreasures[treasureIndex].isCollected) {
        // تحديث حالة الكنز
        updatedTreasures[treasureIndex] = {
          ...updatedTreasures[treasureIndex],
          isCollected: true
        };
        
        // إضافة القيمة إلى المجموع
        setTotalCollected(prev => prev + updatedTreasures[treasureIndex].value);
        
        // تشغيل صوت تجميع الكنز
        const treasureSound = document.getElementById('egypt-chest-open-sound') as HTMLAudioElement;
        if (treasureSound) {
          treasureSound.currentTime = 0;
          treasureSound.play().catch(e => console.error(e));
        }
        
        return updatedTreasures;
      }
      
      return prevTreasures;
    });
  };
  
  // إنهاء اللعبة وعرض النتائج
  const endGame = () => {
    gameActive.current = false;
    setShowResults(true);
    
    // إرسال النتيجة النهائية بعد عرض النتائج
    setTimeout(() => {
      onComplete(totalCollected);
    }, 3000);
  };
  
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 z-40 overflow-hidden">
      {/* عرض الوقت المتبقي والنقاط المجمعة */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/60 p-2 rounded-full px-6 flex gap-6">
        <div className="text-white text-xl">
          <span className="text-amber-400">الوقت: </span> 
          <span className={`${timeRemaining < 10 ? 'text-red-500 animate-pulse font-bold' : 'text-white'}`}>
            {timeRemaining}
          </span>
        </div>
        <div className="text-white text-xl">
          <span className="text-amber-400">المجموع: </span> 
          <span className="text-white">{totalCollected.toLocaleString('ar-EG')}</span>
        </div>
      </div>
      
      {/* عرض النتائج النهائية */}
      {showResults && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-black/80 p-8 rounded-2xl border-4 border-[#D4AF37] text-center">
            <h2 className="text-4xl text-[#D4AF37] mb-4 font-bold">انتهى الوقت!</h2>
            <h3 className="text-2xl text-white mb-6">لقد جمعت:</h3>
            <div className="text-5xl text-[#FFD700] font-bold mb-8 animate-pulse">
              {totalCollected.toLocaleString('ar-EG')} رقاقة
            </div>
          </div>
        </div>
      )}
      
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[0, 5, 5]} intensity={0.8} castShadow angle={0.6} penumbra={0.5} />
        
        {/* خلفية الصحراء والأهرامات */}
        <DesertBackground />
        
        {/* أشعة الشمس */}
        <SunRays />
        
        {/* الكنوز المتاحة للتجميع */}
        {treasures.map(treasure => (
          <Treasure 
            key={treasure.id}
            id={treasure.id}
            position={treasure.position}
            value={treasure.value}
            isCollected={treasure.isCollected}
            onClick={() => !treasure.isCollected && collectTreasure(treasure.id)}
            scale={0.8 + Math.random() * 0.4}
          />
        ))}
        
        {/* تعليمات اللعبة */}
        <Html position={[0, -6, 0]} center>
          <div className="bg-black/60 p-2 rounded-xl text-white text-center px-4 w-[300px]">
            اضغط على صناديق الكنز لجمع أكبر قدر ممكن قبل نفاد الوقت!
          </div>
        </Html>
      </Canvas>
    </div>
  );
}