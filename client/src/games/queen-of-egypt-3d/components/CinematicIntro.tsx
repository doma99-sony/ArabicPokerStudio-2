import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Stars, Text, useTexture, PerspectiveCamera } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import gsap from 'gsap';

interface CinematicIntroProps {
  onComplete?: () => void;
  skipEnabled?: boolean;
  duration?: number;
}

// مكون معبد مصري ثلاثي الأبعاد
function EgyptianTemple({ scale = 1 }) {
  // استخدام نموذج افتراضي بسيط بدلاً من تحميل نموذج خارجي
  return (
    <group scale={[scale, scale, scale]} position={[0, -2, -10]}>
      {/* قاعدة المعبد */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      
      {/* أعمدة المعبد */}
      {[...Array(4)].map((_, idx) => (
        <group key={`column-left-${idx}`} position={[-8 + idx * 5.5, 6, -8]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 1, 12, 16]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 0.8, 1, 16]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>
        </group>
      ))}
      
      {/* الصف الثاني من الأعمدة */}
      {[...Array(4)].map((_, idx) => (
        <group key={`column-right-${idx}`} position={[-8 + idx * 5.5, 6, 8]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 1, 12, 16]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>
          <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.2, 0.8, 1, 16]} />
            <meshStandardMaterial color="#f5deb3" />
          </mesh>
        </group>
      ))}
      
      {/* سقف المعبد */}
      <mesh position={[0, 13, 0]} castShadow receiveShadow>
        <boxGeometry args={[22, 1, 22]} />
        <meshStandardMaterial color="#d2b48c" />
      </mesh>
      
      {/* الهرم الصغير فوق المعبد */}
      <mesh position={[0, 16, 0]} castShadow receiveShadow>
        <coneGeometry args={[8, 6, 4]} />
        <meshStandardMaterial color="#f5deb3" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* تماثيل أبو الهول */}
      <group position={[-12, 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 3, 8]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
        <mesh position={[0, 3, 3]} castShadow receiveShadow>
          <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
      </group>
      
      <group position={[12, 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 3, 8]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
        <mesh position={[0, 3, 3]} castShadow receiveShadow>
          <sphereGeometry args={[1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d2b48c" />
        </mesh>
      </group>
    </group>
  );
}

// مكون العنوان المتحرك
interface AnimatedTitleProps {
  visible: boolean;
}

function AnimatedTitle({ visible }: AnimatedTitleProps) {
  const spring = useSpring({
    scale: visible ? [1, 1, 1] as any : [0, 0, 0] as any,
    position: visible ? [0, 0, -5] as any : [0, -10, -5] as any,
    rotation: visible ? [0, 0, 0] as any : [0, -Math.PI, 0] as any,
    config: {
      mass: 2,
      tension: 300,
      friction: 60
    },
    delay: 1000
  });
  
  return (
    <animated.group {...spring}>
      <Text
        position={[0, 0, 0]}
        color="#D4AF37"
        fontSize={1.5}
        lineHeight={1}
        font="/fonts/Cinzel-Bold.ttf"
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#8B4513"
      >
        Queen of Egypt
      </Text>
      <Text
        position={[0, -1.5, 0]}
        color="#D4AF37"
        fontSize={0.8}
        lineHeight={1}
        font="/fonts/Cinzel-Regular.ttf"
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        A Journey Through Ancient Egypt
      </Text>
    </animated.group>
  );
}

// مكون المشهد الرئيسي
function IntroScene({ onComplete, duration = 10 }: { onComplete?: () => void, duration?: number }) {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 5, 20]);
  const [cameraTilt, setCameraTilt] = useState<[number, number, number]>([0, 0, 0]);
  const [showTitle, setShowTitle] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);
  
  // تحريك الكاميرا عبر المشهد
  useEffect(() => {
    if (cameraRef.current) {
      // المرحلة 1: البداية - الكاميرا بعيدة
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 10,
        z: 30,
        duration: duration * 0.2,
        ease: "power1.inOut",
        onComplete: () => {
          // المرحلة 2: الاقتراب من المعبد
          gsap.to(cameraRef.current.position, {
            x: 10,
            y: 8,
            z: 20,
            duration: duration * 0.3,
            ease: "power2.inOut",
            onComplete: () => {
              // المرحلة 3: الدوران حول المعبد
              gsap.to(cameraRef.current.position, {
                x: -10,
                y: 6,
                z: 15,
                duration: duration * 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                  // المرحلة 4: التحرك للأمام
                  gsap.to(cameraRef.current.position, {
                    x: 0,
                    y: 5,
                    z: 10,
                    duration: duration * 0.2,
                    ease: "power2.inOut",
                    onComplete: () => {
                      // إظهار العنوان
                      setShowTitle(true);
                      
                      // استدعاء دالة الإكمال بعد انتهاء العرض
                      if (onComplete) {
                        setTimeout(() => {
                          onComplete();
                        }, duration * 1000 * 0.2);
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }, [cameraRef, duration, onComplete]);
  
  return (
    <>
      <fog attach="fog" args={['#000', 10, 50]} />
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={cameraPosition}
        rotation={cameraTilt}
        fov={50}
        near={0.1}
        far={1000}
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <EgyptianTemple scale={1} />
      <AnimatedTitle visible={showTitle} />
    </>
  );
}

// المكون الرئيسي للمقدمة السينمائية
const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  skipEnabled = true,
  duration = 12
}) => {
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  
  // معالجة تخطي المقدمة
  const handleSkip = () => {
    if (skipEnabled && !isSkipped) {
      setIsSkipped(true);
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // تشغيل أصوات المقدمة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // يمكن استبدال هذه الدالة بتنفيذ حقيقي لتشغيل الأصوات
      const playTempleEchoes = () => {
        console.log("تشغيل أصوات صدى المعبد وخطوات الأقدام");
      };
      
      if (!isSkipped) {
        playTempleEchoes();
      }
    }
    
    return () => {
      // إيقاف الأصوات عند إزالة المكون
    };
  }, [isSkipped]);
  
  return (
    <div className="cinematic-intro w-full h-screen relative overflow-hidden bg-black">
      {/* شاشة التحميل */}
      <div className={`loading-screen absolute inset-0 z-30 bg-black flex items-center justify-center transition-opacity duration-1000 ${isSkipped ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="text-center">
          {/* لوجو اللعبة */}
          <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-amber-600 animate-spin-slow rounded-full"></div>
            <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-24 md:h-24 text-amber-500">
                <path d="M50,10 L90,90 L10,90 Z" fill="currentColor" stroke="currentColor" strokeWidth="0" />
              </svg>
            </div>
          </div>
          <h2 className="text-amber-500 text-xl md:text-2xl font-bold">Queen of Egypt</h2>
          <p className="text-amber-300 mt-4">جاري تحميل المقدمة السينمائية...</p>
        </div>
      </div>
      
      {/* مشهد ثلاثي الأبعاد */}
      <div className={`canvas-container w-full h-full ${isSkipped ? 'opacity-0 pointer-events-none' : ''}`}>
        <Canvas shadows gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <IntroScene onComplete={onComplete} duration={duration} />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
      
      {/* زر تخطي المقدمة */}
      {skipEnabled && !isSkipped && (
        <button
          onClick={handleSkip}
          className="skip-button absolute bottom-8 right-8 px-4 py-2 bg-amber-800 text-amber-100 rounded-md opacity-80 hover:opacity-100 transition-opacity z-40"
        >
          تخطي المقدمة
        </button>
      )}
      
      {/* أنماط CSS المخصصة */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CinematicIntro;