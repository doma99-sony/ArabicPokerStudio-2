import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Text, useTexture, Float } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// مكون القطعة النقدية المتساقطة داخل Canvas
function Coin({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const texture = useTexture('/images/egypt-queen/coin-texture.png');
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const [visible, setVisible] = useState(false);
  
  // حركة العملة
  useEffect(() => {
    // تأخير ظهور العملة
    const showTimeout = setTimeout(() => {
      setVisible(true);
      
      if (meshRef.current) {
        // حركة القطعة تحت تأثير الجاذبية والارتداد
        gsap.fromTo(
          meshRef.current.position,
          { y: initialY + 10 },
          { 
            y: initialY, 
            duration: 1.2 + Math.random() * 0.4,
            ease: "bounce.out",
            delay: Math.random() * 0.2
          }
        );
        
        // دوران العملة أثناء السقوط
        gsap.to(meshRef.current.rotation, {
          x: Math.random() * Math.PI * 4,
          y: Math.random() * Math.PI * 4,
          duration: 1.2 + Math.random() * 0.4,
          ease: "power1.in"
        });
      }
    }, delay);
    
    return () => clearTimeout(showTimeout);
  }, [initialY, delay]);
  
  // دوران مستمر للعملة
  useFrame(() => {
    if (meshRef.current && visible) {
      meshRef.current.rotation.y += 0.03;
    }
  });
  
  if (!visible) return null;
  
  return (
    <mesh ref={meshRef} position={[position[0], initialY + 10, position[2]]} castShadow>
      <cylinderGeometry args={[0.7, 0.7, 0.1, 32]} />
      <meshStandardMaterial 
        map={texture} 
        metalness={0.8} 
        roughness={0.2} 
        emissive="#FFCC00" 
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// نص الفوز الكبير مع تأثيرات داخل Canvas
function BigWinText({ amount, isActive }: { amount: number; isActive: boolean }) {
  const textRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);
  const amountRef = useRef(0);
  const [amountValue, setAmountValue] = useState(0);
  
  // تحريك النص وتكبيره عند التفعيل
  useEffect(() => {
    if (isActive && textRef.current) {
      // عرض النص من خلال تكبيره تدريجياً مع تأثير مرتد
      gsap.fromTo(
        textRef.current.scale,
        { x: 0.1, y: 0.1, z: 0.1 },
        { 
          x: 1, y: 1, z: 1, 
          duration: 1, 
          ease: "elastic.out(1, 0.3)",
          onUpdate: () => {
            if (textRef.current) {
              setScale(textRef.current.scale.x);
            }
          }
        }
      );
      
      // تحريك النص للأعلى ثم للأسفل ببطء
      gsap.to(textRef.current.position, {
        y: textRef.current.position.y + 0.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      // تنشيط المبلغ ليزداد تدريجياً
      gsap.to(amountRef, {
        current: amount,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          setAmountValue(Math.floor(amountRef.current));
        }
      });
    }
  }, [isActive, amount]);
  
  // نبضات مستمرة للنص
  useFrame((state) => {
    if (textRef.current && isActive) {
      // تأثير النبض المستمر
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.05;
      textRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
      
      // تأثير دوران خفيف
      textRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  return (
    <group position={[0, 2, 0]}>
      <group ref={textRef} scale={[0.1, 0.1, 0.1]}>
        <Text
          position={[0, 2, 0]}
          fontSize={3}
          font="/fonts/Cairo-Bold.ttf"
          color="#FFCC00"
          anchorX="center"
          anchorY="middle"
          strokeColor="#8B4513"
          strokeWidth={0.05}
        >
          فوز كبير!
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={2.5}
          font="/fonts/Cairo-Bold.ttf"
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          {new Intl.NumberFormat('ar-EG').format(amountValue)}
        </Text>
      </group>
    </group>
  );
}

// مكون الخلفية داخل Canvas
function Background() {
  const texture = useTexture('/images/egypt-queen/big-win-bg.jpg');
  
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[40, 30]} />
      <meshBasicMaterial map={texture} transparent opacity={0.7} />
    </mesh>
  );
}

// مكون ثلاثي الأبعاد للفوز الكبير داخل Canvas
function BigWinScene({ winAmount }: { winAmount: number }) {
  const [coins, setCoins] = useState<Array<{ id: number; position: [number, number, number]; delay: number }>>([]);
  
  // إنشاء العملات المتساقطة
  useEffect(() => {
    // عدد العملات يتناسب مع قيمة الفوز
    const coinCount = Math.min(Math.floor(winAmount / 10000), 100);
    
    const newCoins = Array.from({ length: coinCount }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20, // موقع س عشوائي
        (Math.random() - 0.5) * 5, // موقع ص عشوائي
        (Math.random() - 0.5) * 5 // موقع ع عشوائي
      ] as [number, number, number],
      delay: Math.random() * 2000 // تأخير عشوائي
    }));
    
    setCoins(newCoins);
  }, [winAmount]);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.6} penumbra={0.5} castShadow />
      
      {/* خلفية الفوز الكبير */}
      <Background />
      
      {/* نص الفوز الكبير */}
      <BigWinText amount={winAmount} isActive={true} />
      
      {/* العملات المتساقطة */}
      {coins.map(coin => (
        <Coin 
          key={coin.id} 
          position={coin.position} 
          delay={coin.delay} 
        />
      ))}
      
      {/* شرار مضيء حول النص */}
      <Float floatIntensity={1} speed={2}>
        <group position={[0, 2, -2]}>
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial color="#FFCC00" transparent opacity={0.1} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

interface BigWinEffectsProps {
  isActive: boolean;
  winAmount: number;
  onComplete?: () => void;
}

export function BigWinEffects({ isActive, winAmount, onComplete }: BigWinEffectsProps) {
  // تفعيل دالة الانتهاء بعد فترة
  useEffect(() => {
    if (isActive && onComplete) {
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 8000); // 8 ثواني للعرض
      
      return () => clearTimeout(completeTimeout);
    }
  }, [isActive, winAmount, onComplete]);
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 z-50">
      <Canvas>
        <BigWinScene winAmount={winAmount} />
      </Canvas>
    </div>
  );
}