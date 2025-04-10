import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { gsap } from 'gsap';
import { useThree, Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Text3D, 
  useGLTF, 
  SpotLight, 
  useTexture, 
  Environment, 
  Stars, 
  useAnimations,
  Sky,
  Cloud,
  Sparkles,
  Float,
  Loader
} from '@react-three/drei';
import * as THREE from 'three';

interface CinematicIntroProps {
  onComplete: () => void;
}

// جزيئات الغبار المتطايرة
const DustParticles = () => {
  return (
    <Sparkles
      count={200}
      scale={[20, 10, 20]}
      size={0.3}
      speed={0.2}
      color="#FFD700"
      opacity={0.1}
      noise={1.5}
      position={[0, 0, -30]}
    />
  );
};

// أشعة ضوء متسللة من سقف المعبد
const LightRays = () => {
  const spotRef = useRef<THREE.SpotLight>(null);
  
  useFrame(({ clock }) => {
    if (!spotRef.current) return;
    // حركة بسيطة متموجة للضوء
    const sin = Math.sin(clock.getElapsedTime() * 0.2) * 0.5;
    const cos = Math.cos(clock.getElapsedTime() * 0.2) * 0.5;
    spotRef.current.position.x = sin * 5;
    spotRef.current.position.z = -20 + cos * 5;
  });
  
  return (
    <SpotLight
      ref={spotRef}
      position={[0, 20, -20]}
      angle={0.15}
      penumbra={0.5}
      intensity={2}
      color="#F8EFBA"
      castShadow
      distance={40}
      decay={0.5}
      attenuation={5}
      anglePower={5} // أشعة ضوء أكثر تركيزاً ودرامية
    />
  );
};

// النقوش المصرية على الجدران
const HieroglyphsWall = ({ position }: { position: [number, number, number] }) => {
  // استخدام قوام للنقوش المصرية (في التطبيق الفعلي)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();
    
    // رسم خلفية
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, 512, 512);
    
    // رسم نقوش مصرية أساسية باستخدام ألوان داكنة
    ctx.fillStyle = '#8B4513';
    
    // رموز هيروغليفية مبسطة
    for (let y = 40; y < 480; y += 60) {
      for (let x = 40; x < 480; x += 60) {
        const symbol = Math.floor(Math.random() * 5);
        ctx.save();
        ctx.translate(x, y);
        
        switch(symbol) {
          case 0: // عين
            ctx.beginPath();
            ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            break;
          case 1: // أنخ
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(0, 10);
            ctx.moveTo(-10, 0);
            ctx.lineTo(10, 0);
            ctx.moveTo(0, 10);
            ctx.arc(0, 20, 10, Math.PI * 1.5, Math.PI * 0.5, false);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.stroke();
            break;
          case 2: // هرم
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(-15, 15);
            ctx.lineTo(15, 15);
            ctx.closePath();
            ctx.fill();
            break;
          case 3: // نسر
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(15, 0);
            ctx.moveTo(0, -15);
            ctx.lineTo(0, 15);
            ctx.moveTo(-10, -10);
            ctx.lineTo(10, 10);
            ctx.moveTo(10, -10);
            ctx.lineTo(-10, 10);
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.stroke();
            break;
          case 4: // خطوط متوازية
            for (let i = -12; i <= 12; i += 6) {
              ctx.fillRect(-15, i, 30, 3);
            }
            break;
        }
        
        ctx.restore();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);
  
  // أضف الطبقة الملمسية
  const bumpTexture = useMemo(() => {
    const bump = texture.clone();
    return bump;
  }, [texture]);
  
  return (
    <mesh position={position} receiveShadow>
      <planeGeometry args={[30, 15]} />
      <meshStandardMaterial 
        map={texture}
        bumpMap={bumpTexture}
        bumpScale={0.1}
        roughness={0.7}
        metalness={0.3}
        color="#DEB887"
      />
    </mesh>
  );
};

// عامود مصري مزخرف
const EgyptianColumn = ({ position }: { position: [number, number, number] }) => {
  const capPosition: [number, number, number] = [position[0], position[1] + 6.5, position[2]];
  const basePosition: [number, number, number] = [position[0], position[1] - 6.5, position[2]];
  
  return (
    <group>
      {/* جسم العمود */}
      <mesh castShadow position={position}>
        <cylinderGeometry args={[1, 1.1, 12, 20]} />
        <meshStandardMaterial 
          color="#DEB887" 
          roughness={0.6}
          metalness={0.3}
          emissive="#B8860B"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* تاج العمود المزخرف (على شكل زهرة البردي) */}
      <mesh castShadow position={capPosition}>
        <cylinderGeometry args={[1.8, 1, 1, 8]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.4}
          metalness={0.5}
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* قاعدة العمود */}
      <mesh castShadow position={basePosition}>
        <cylinderGeometry args={[1.4, 1.8, 1, 8]} />
        <meshStandardMaterial 
          color="#D4AF37" 
          roughness={0.4}
          metalness={0.5}
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* زخارف على العمود (حلقات) */}
      {[-5, -2.5, 0, 2.5, 5].map((y, index) => (
        <mesh key={index} castShadow position={[position[0], position[1] + y, position[2]]}>
          <torusGeometry args={[1.05, 0.1, 8, 16]} />
          <meshStandardMaterial 
            color="#D4AF37"
            metalness={0.6}
            roughness={0.3}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// شخصية الملكة المصرية
const QueenFigure = ({ position, queenRef }: { position: [number, number, number], queenRef: React.RefObject<THREE.Group> }) => {
  return (
    <group ref={queenRef} position={position}>
      {/* جسم الملكة */}
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 1.8, 6, 16]} />
        <meshStandardMaterial 
          color="#8A2BE2"
          roughness={0.3}
          metalness={0.5}
          emissive="#4B0082"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* رأس الملكة */}
      <mesh castShadow position={[0, 3.5, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>
      
      {/* تاج الملكة */}
      <mesh castShadow position={[0, 5, 0]}>
        <cylinderGeometry args={[0.4, 1.5, 2, 16]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.2}
          metalness={0.8}
          emissive="#FFA500"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* زخارف تاج الملكة */}
      <mesh castShadow position={[0, 6, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#FF0000" 
          roughness={0.2}
          metalness={0.7}
          emissive="#FF0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* الذراع اليسرى */}
      <group position={[-1.2, 1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.25, 2.5, 8]} />
          <meshStandardMaterial color="#8A2BE2" />
        </mesh>
      </group>
      
      {/* الذراع اليمنى (ممدودة للأمام تحمل رمز مصري) */}
      <group position={[1.2, 1, 0.5]} rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.25, 2.5, 8]} />
          <meshStandardMaterial color="#8A2BE2" />
        </mesh>
        
        {/* رمز مصري (أنخ) في يد الملكة */}
        <group position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.4, 0.1, 8, 16]} />
            <meshStandardMaterial 
              color="#FFD700"
              metalness={0.8}
              roughness={0.2}
              emissive="#FFD700"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh castShadow position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
            <meshStandardMaterial 
              color="#FFD700"
              metalness={0.8}
              roughness={0.2}
              emissive="#FFD700"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>
      
      {/* هالة تحيط بالملكة */}
      <Sparkles
        count={50}
        scale={[3, 3, 3]}
        size={0.5}
        speed={0.3}
        opacity={0.5}
        color="#FFD700"
      />
      
      {/* تأثير التعويم للملكة */}
      <pointLight position={[0, 2, 0]} color="#FFD700" intensity={1} distance={5} />
    </group>
  );
};

// لوحة نصية للحوار
const DialogPanel = ({ 
  textRef, 
  text = "مرحبًا بك أيها المحارب... هل أنت مستعد للكنز؟" 
}: { 
  textRef: React.RefObject<THREE.Group>,
  text?: string
}) => {
  const [displayedText, setDisplayedText] = useState("");
  
  // تأثير ظهور النص تدريجياً كنوع من الكتابة
  useEffect(() => {
    let currentText = "";
    const textInterval = setInterval(() => {
      if (currentText.length >= text.length) {
        clearInterval(textInterval);
        return;
      }
      currentText = text.substring(0, currentText.length + 1);
      setDisplayedText(currentText);
    }, 100);
    
    return () => clearInterval(textInterval);
  }, [text]);
  
  return (
    <group ref={textRef} position={[0, -5, -30]}>
      <mesh>
        <planeGeometry args={[22, 5]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.7} />
      </mesh>
      
      {/* إطار مزخرف للوحة الحوار */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[22.4, 5.4]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.6} />
      </mesh>
      
      {/* محتوى النص */}
      <Text3D
        position={[-10, 0, 0.1]}
        size={0.8}
        height={0.1}
        bevelEnabled={false}
        font="/fonts/cairo.json"
        curveSegments={6}
      >
        {displayedText}
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </Text3D>
      
      {/* زخارف في زوايا لوحة الحوار */}
      {[
        [-10.8, 2.4, 0.05],
        [10.8, 2.4, 0.05],
        [-10.8, -2.4, 0.05],
        [10.8, -2.4, 0.05]
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]}>
          <boxGeometry args={[0.8, 0.8, 0.1]} />
          <meshStandardMaterial 
            color="#D4AF37"
            metalness={0.7}
            roughness={0.3}
            emissive="#FFD700"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* مؤشر متحرك في نهاية النص */}
      {displayedText.length === text.length && (
        <mesh position={[10, -2, 0.1]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={Math.sin(Date.now() * 0.005) * 0.5 + 0.5} />
        </mesh>
      )}
    </group>
  );
};

// مكون المشهد ثلاثي الأبعاد
const Temple3DScene = ({ onStepComplete }: { onStepComplete: () => void }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const columnsRef = useRef<THREE.Group>(null);
  const queenRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const textRef = useRef<THREE.Group>(null);
  const { scene, camera } = useThree();
  
  // محاكاة تحميل النماذج ثلاثية الأبعاد
  useEffect(() => {
    // محاكاة حركة الكاميرا داخل المعبد
    const cameraTimeline = gsap.timeline({
      onComplete: () => {
        // بعد انتهاء حركة الكاميرا، إظهار الملكة
        animateQueenAppearance();
      }
    });
    
    // تتحرك الكاميرا ببطء بين الأعمدة (مسار درامي)
    cameraTimeline.to(cameraRef.current?.position, {
      z: -10,
      y: 5,
      duration: 2,
      ease: "power1.inOut"
    })
    .to(cameraRef.current?.position, {
      z: -20,
      y: 3,
      x: 3,
      duration: 2.5,
      ease: "power1.inOut"
    })
    .to(cameraRef.current?.rotation, {
      y: 0.2,
      duration: 1,
      ease: "power1.inOut"
    }, "-=2")
    // تتوقف عند منصة في نهاية المعبد
    .to(cameraRef.current?.position, {
      z: -40,
      y: 2,
      x: 0,
      duration: 2.5,
      ease: "power2.inOut"
    })
    .to(cameraRef.current?.rotation, {
      y: 0,
      duration: 1.5,
      ease: "power1.inOut"
    }, "-=2.5");
    
    // ضبط إضاءة المعبد تدريجياً
    gsap.fromTo(
      spotlightRef.current,
      { intensity: 0 },
      { 
        intensity: 2, 
        duration: 3, 
        ease: "power2.out"
      }
    );
    
    // إظهار أعمدة المعبد تدريجياً
    if (columnsRef.current) {
      const columns = columnsRef.current.children;
      for (let i = 0; i < columns.length; i++) {
        gsap.fromTo(
          columns[i].scale,
          { y: 0 },
          { 
            y: 1, 
            duration: 1, 
            delay: i * 0.15,
            ease: "back.out(1.5)"
          }
        );
      }
    }
    
    // إضافة تأثيرات صوتية
    playTempleAmbience();
    
    return () => {
      cameraTimeline.kill();
    };
  }, []);
  
  // إظهار الملكة
  const animateQueenAppearance = () => {
    // ظهور الملكة بتأثير خاص
    if (queenRef.current) {
      // ابدأ من خارج منطقة الرؤية وحرك لأعلى مع تأثير ضوئي
      gsap.fromTo(
        queenRef.current.position,
        { y: -10 },
        {
          y: 0,
          duration: 2.5,
          ease: "power3.out",
          onComplete: () => {
            // إضافة حركة تعويم للملكة
            gsap.to(queenRef.current?.position, {
              y: '+=0.5',
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut"
            });
            
            // إظهار الحوار بعد ظهور الملكة
            showQueenDialog();
          }
        }
      );
      
      // دوران بطيء للملكة
      gsap.to(queenRef.current.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    }
    
    // ضبط إضاءة دراماتيكية على الملكة
    if (spotlightRef.current) {
      gsap.to(spotlightRef.current.position, {
        x: 0,
        y: 15,
        z: -35,
        duration: 1.5
      });
      
      // زيادة شدة الضوء
      gsap.to(spotlightRef.current, {
        intensity: 10,
        angle: 0.5,
        penumbra: 0.9,
        duration: 1.5
      });
    }
  };
  
  // إظهار حوار الملكة
  const showQueenDialog = () => {
    // رسوم متحركة لظهور لوحة الحوار
    if (textRef.current) {
      gsap.fromTo(
        textRef.current.position,
        { y: -10, z: -35 },
        {
          y: 6,
          z: -30,
          duration: 1.5,
          ease: "elastic.out(1, 0.5)",
          onComplete: () => {
            // صوت الملكة
            playQueenVoice();
            
            // الانتقال للخطوة التالية بعد 6 ثوانٍ
            setTimeout(() => {
              onStepComplete();
            }, 6000);
          }
        }
      );
    }
  };
  
  // تشغيل صوت محيط المعبد
  const playTempleAmbience = () => {
    // في التطبيق الفعلي، يتم استخدام عناصر صوتية مخصصة
    // ضجيج المعبد، صدى، خطوات
    console.log("تشغيل أصوات المعبد (صدى، خطوات، صفير الرياح)");
    // تنفيذ التشغيل الفعلي في التطبيق النهائي
  };
  
  // تشغيل صوت الملكة
  const playQueenVoice = () => {
    console.log("الملكة: مرحبًا بك أيها المحارب... هل أنت مستعد للكنز؟");
    // تنفيذ التشغيل الفعلي في التطبيق النهائي
  };
  
  // حركة التعويم البطيء لبعض العناصر (تعزيز الجو الأسطوري)
  useFrame(({ clock }) => {
    if (textRef.current) {
      textRef.current.position.y += Math.sin(clock.getElapsedTime() * 0.5) * 0.001;
    }
  });
  
  return (
    <>
      {/* الكاميرا ثلاثية الأبعاد */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 2, 0]}
        fov={60}
      />
      
      {/* إضاءة محيطة للمعبد */}
      <ambientLight intensity={0.2} />
      
      {/* الضوء الموجه */}
      <SpotLight
        ref={spotlightRef}
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={0.8}
        intensity={0}
        color="#FFD700"
        castShadow
      />
      
      {/* أشعة الضوء المتسللة */}
      <LightRays />
      
      {/* جزيئات الغبار المعلقة في الهواء */}
      <DustParticles />
      
      {/* بيئة سماوية مصرية ليلية */}
      <Sky 
        distance={450000} 
        sunPosition={[0, -0.5, -1]} 
        inclination={0.1}
        azimuth={0.25}
        rayleigh={0.3}
      />
      
      {/* أرضية المعبد */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
      </mesh>
      
      {/* درج معبد صغير في المنتصف */}
      <group position={[0, -2, -35]}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[12, 12, 0.5]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* درجات السلم */}
        {[0.4, 0.8, 1.2].map((y, idx) => (
          <mesh key={idx} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 2 + idx * 1.2]}>
            <boxGeometry args={[10 - idx * 1.5, 1.5, 0.3]} />
            <meshStandardMaterial color="#D4AF37" roughness={0.6} metalness={0.3} />
          </mesh>
        ))}
      </group>
      
      {/* نقوش الجدران */}
      <HieroglyphsWall position={[-15, 5, -25]} />
      <HieroglyphsWall position={[15, 5, -25]} />
      <HieroglyphsWall position={[0, 5, -50]} />
      
      {/* مجموعة أعمدة المعبد المرتبة في صفين */}
      <group ref={columnsRef}>
        {/* الصف الأيسر */}
        {[-10, -6, -2, 2, 6, 10].map((x, index) => (
          <EgyptianColumn key={`left-${index}`} position={[x, 0, -15 - index * 3]} />
        ))}
        
        {/* الصف الأيمن */}
        {[-10, -6, -2, 2, 6, 10].map((x, index) => (
          <EgyptianColumn key={`right-${index}`} position={[-x, 0, -15 - index * 3]} />
        ))}
      </group>
      
      {/* منصة مرتفعة في نهاية المعبد */}
      <mesh receiveShadow position={[0, -1, -35]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[6, 6, 1, 16]} />
        <meshStandardMaterial color="#B8860B" roughness={0.4} metalness={0.3} />
      </mesh>
      
      {/* شخصية الملكة المصرية */}
      <QueenFigure position={[0, -10, -35]} queenRef={queenRef} />
      
      {/* لوحة نصية للحوار */}
      <DialogPanel textRef={textRef} />
      
      {/* نجوم وإضاءة محيطية */}
      <Stars radius={100} depth={50} count={5000} factor={4} fade />
      <Environment preset="night" />
    </>
  );
};

/**
 * مكون المقدمة السينمائية للعبة ملكة مصر ثلاثية الأبعاد
 * يعرض مشهد سينمائي للدخول إلى معبد الملكة قبل بدء اللعبة
 */
const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [skipEnabled, setSkipEnabled] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [templeReady, setTempleReady] = useState<boolean>(false);
  
  // تشغيل المقدمة
  useEffect(() => {
    // تمكين زر التخطي بعد 2 ثانية
    const skipTimer = setTimeout(() => {
      setSkipEnabled(true);
    }, 2000);
    
    // تجهيز عناصر الصوت
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("عليك النقر على الشاشة أولاً لتشغيل الصوت"));
    }
    
    // تعتيم الشاشة في البداية ثم إظهارها تدريجياً
    gsap.fromTo(
      ".cinematic-overlay",
      { opacity: 1 },
      { 
        opacity: 0, 
        duration: 2,
        delay: 1,
        ease: "power2.inOut",
        onComplete: () => {
          // إظهار عنوان المقدمة
          showIntroTitle();
        }
      }
    );
    
    // انتهاء المقدمة تلقائياً بعد 6 ثوانٍ من معاينة المعبد
    const introTimer = setTimeout(() => {
      handleComplete();
    }, 15000); // 2 ثانية للتعتيم + 1 ثانية تأخير + 2 ثانية لعنوان المقدمة + 4 ثوانٍ للمعبد + 6 ثوانٍ للعرض
    
    return () => {
      clearTimeout(skipTimer);
      clearTimeout(introTimer);
      
      // إيقاف جميع الرسوم المتحركة والأصوات عند إزالة المكون
      gsap.killTweensOf(".cinematic-element");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // إظهار عنوان المقدمة
  const showIntroTitle = () => {
    gsap.fromTo(
      ".cinematic-title",
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 2,
        ease: "power2.out",
        onComplete: () => {
          // بعد ظهور العنوان، ننتقل لمشهد المعبد
          setTimeout(() => {
            // إخفاء العنوان
            gsap.to(".cinematic-title", { 
              opacity: 0, 
              y: -50, 
              duration: 1,
              onComplete: () => {
                setTempleReady(true);
              }
            });
          }, 3000);
        }
      }
    );
  };
  
  // انتهاء مشهد المعبد
  const handleTempleComplete = () => {
    // ومضة نهائية قبل انتهاء المقدمة
    gsap.fromTo(
      ".flash-element",
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          // تعيين مؤقت لإنهاء المقدمة
          setTimeout(() => {
            handleComplete();
          }, 1000);
        }
      }
    );
  };
  
  // إنهاء المقدمة
  const handleComplete = () => {
    // تلاشي المشهد قبل الانتقال إلى اللعبة
    gsap.to(".cinematic-intro", {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        // استدعاء دالة الانتهاء
        onComplete();
      }
    });
  };
  
  // تخطي المقدمة
  const handleSkip = () => {
    if (!skipEnabled) return;
    handleComplete();
  };
  
  return (
    <div 
      ref={containerRef} 
      className="cinematic-intro fixed inset-0 z-50 overflow-hidden bg-black text-white"
    >
      {/* طبقة التراكب للتحكم في الشفافية */}
      <div className="cinematic-overlay absolute inset-0 bg-black z-10"></div>
      
      {/* عنوان المقدمة */}
      <div className="cinematic-title absolute inset-0 flex items-center justify-center z-20">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 text-center px-4">
          <span className="block mb-2">رحلة إلى</span>
          <span className="block text-5xl md:text-7xl tracking-wider">معبد ملكة مصر</span>
        </h1>
      </div>
      
      {/* مشهد المعبد ثلاثي الأبعاد */}
      {templeReady && (
        <div className="temple-3d-scene absolute inset-0 z-20">
          <Canvas shadows>
            <Temple3DScene onStepComplete={handleTempleComplete} />
          </Canvas>
        </div>
      )}
      
      {/* وميض أبيض للكشف النهائي */}
      <div className="flash-element absolute inset-0 bg-white z-30 opacity-0"></div>
      
      {/* زر التخطي */}
      <button 
        onClick={handleSkip}
        className={`absolute bottom-8 right-8 z-40 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-all ${skipEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        تخطي المقدمة
      </button>
      
      {/* الأصوات */}
      <audio ref={audioRef} loop={false} preload="auto">
        <source src="/assets/sounds/egyptian-cinematic.mp3" type="audio/mpeg" />
      </audio>
      
      {/* أصوات الخطوات وصدى المعبد ستتم إضافتها في التطبيق النهائي */}
      
      {/* الأنماط المضمنة */}
      <style>{`
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(2px, -2px); }
          50% { transform: translate(0, -4px); }
          75% { transform: translate(-2px, -2px); }
        }
        
        .dust-particle {
          animation: particle-float 4s infinite;
          background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(255,215,0,0) 70%);
        }
      `}</style>
    </div>
  );
};

export default CinematicIntro;