import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Float, Text, PerspectiveCamera, useGLTF, 
         Html, Environment, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface SymbolProps {
  type: string;
  position?: [number, number, number];
  scale?: number;
  isWinning?: boolean;
  bigWin?: boolean;
  rotation?: [number, number, number];
  onClick?: () => void;
}

// رمز كتاب الأسرار المصري (SCATTER)
function EgyptianBook({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/symbols/book.svg');
  const glowRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 4,
        duration: 2,
        ease: "power2.out"
      });
      
      gsap.to(meshRef.current.position, {
        y: meshRef.current.position.y + 0.2,
        duration: 0.5,
        yoyo: true,
        repeat: 3,
        ease: "power2.inOut"
      });
    }
    
    if (bigWin && meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.3,
        yoyo: true,
        repeat: 5,
        ease: "elastic.out(1, 0.3)"
      });
    }
  }, [isWinning, bigWin]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
      glowRef.current.rotation.z -= 0.01;
      if (isWinning && glowRef.current.material instanceof THREE.Material) {
        glowRef.current.material.opacity = (Math.sin(state.clock.elapsedTime * 5) + 1) / 2;
      }
    }
  });
  
  return (
    <group {...props}>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.5, 0.2]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.7} />
        <Sparkles count={20} scale={2} size={4} speed={0.4} opacity={0.2} color="yellow" />
      </mesh>
      {isWinning && (
        <mesh ref={glowRef} position={[0, 0, -0.1]}>
          <planeGeometry args={[2, 2.5]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// رمز كليوباترا (الرمز الأعلى قيمة)
function CleopatraSymbol({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/symbols/cleopatra.svg');
  const glowRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 2,
        duration: 1.5,
        ease: "back.out(1.7)"
      });
      
      // تأثير تكبير وتصغير للرمز
      gsap.to(meshRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 5,
        ease: "power1.inOut"
      });
    }
    
    if (bigWin && meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: 1.8,
        y: 1.8,
        z: 1.8,
        duration: 0.5,
        yoyo: true,
        repeat: 3,
        ease: "elastic.out(1, 0.3)"
      });
    }
  }, [isWinning, bigWin]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += hover ? 0.02 : 0.001;
      if (isWinning || hover) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      }
    }
    if (glowRef.current && isWinning) {
      glowRef.current.rotation.z += 0.02;
      glowRef.current.material.opacity = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
    }
  });
  
  return (
    <group {...props}>
      <mesh 
        ref={meshRef} 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
        castShadow
      >
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.2} 
          metalness={0.8} 
          emissive={isWinning ? "#FFD700" : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
        />
      </mesh>
      {isWinning && (
        <>
          <mesh ref={glowRef} position={[0, 0, -0.1]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          <Sparkles count={30} scale={1.5} size={6} speed={0.3} opacity={0.5} color="#FFD700" />
        </>
      )}
    </group>
  );
}

// رمز عين حورس
function EyeOfHorusSymbol({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/symbols/eye.svg');
  const glowRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        z: meshRef.current.rotation.z + Math.PI * 0.5,
        duration: 1,
        ease: "elastic.out(1, 0.3)"
      });
      
      gsap.to(meshRef.current.position, {
        y: meshRef.current.position.y + 0.1,
        duration: 0.2,
        yoyo: true,
        repeat: 9,
        ease: "sine.inOut"
      });
    }
  }, [isWinning]);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isWinning) {
        // تأثير نبض متوهج لعين حورس
        meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      }
    }
    if (glowRef.current && isWinning) {
      glowRef.current.material.opacity = (Math.sin(state.clock.elapsedTime * 4) + 1) / 3 + 0.3;
    }
  });
  
  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[1, 0.7]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          roughness={0.3} 
          metalness={0.7}
          emissive={isWinning ? "#00FFFF" : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isWinning && (
        <>
          <mesh ref={glowRef} position={[0, 0, -0.1]}>
            <planeGeometry args={[1.5, 1.2]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <Sparkles count={20} scale={1.2} size={3} speed={0.5} opacity={0.3} color="cyan" />
        </>
      )}
    </group>
  );
}

// رمز أنوبيس
function AnubisSymbol({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/symbols/anubis.svg');
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      // تأثير دوران للأنوبيس
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 2,
        duration: 1.2,
        ease: "power3.out"
      });
      
      // تأثير قفزة للرمز
      gsap.to(meshRef.current.position, {
        y: meshRef.current.position.y + 0.3,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      });
    }
  }, [isWinning]);
  
  useFrame(() => {
    if (meshRef.current && isWinning) {
      // تأثير اهتزاز خفيف
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.005) * 0.05;
    }
  });
  
  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          roughness={0.4} 
          metalness={0.3}
          emissive={isWinning ? "#770000" : "#000000"}
          emissiveIntensity={isWinning ? 0.3 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isWinning && (
        <Sparkles count={15} scale={1.2} size={2} speed={0.4} opacity={0.3} color="orangered" />
      )}
    </group>
  );
}

// رمز القط المصري
function EgyptianCatSymbol({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture('/images/egypt-queen/symbols/cat.svg');
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      // تأثير قفزة متعددة للقط
      gsap.to(meshRef.current.position, {
        y: meshRef.current.position.y + 0.4,
        duration: 0.2,
        yoyo: true,
        repeat: 3,
        ease: "power2.out"
      });
      
      // تأثير تكبير وتصغير للقط
      gsap.to(meshRef.current.scale, {
        x: 1.3,
        y: 1.3,
        z: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut"
      });
    }
  }, [isWinning]);
  
  useFrame(() => {
    if (meshRef.current && isWinning) {
      // تأثير دوران خفيف
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.003) * 0.2;
    }
  });
  
  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[0.9, 1]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          roughness={0.3} 
          metalness={0.5}
          emissive={isWinning ? "#885500" : "#000000"}
          emissiveIntensity={isWinning ? 0.4 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isWinning && (
        <Sparkles count={15} scale={1.2} size={2} speed={0.3} opacity={0.4} color="gold" />
      )}
    </group>
  );
}

// رمز WILD المميز
function WildSymbol({ isWinning, bigWin, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture('/images/egypt-queen/symbols/wild.png');
  const glowRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      // تأثير دوران للوايلد
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 4,
        duration: 2,
        ease: "power3.inOut"
      });
      
      // تأثير تكبير وتصغير كبير
      gsap.to(meshRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.4,
        yoyo: true,
        repeat: 5,
        ease: "elastic.out(1, 0.3)"
      });
    }
  }, [isWinning]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // دوران مستمر للرمز
      meshRef.current.rotation.y += 0.01;
      
      if (isWinning) {
        // تأثير تموج عند الفوز
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.1;
      }
    }
    
    if (glowRef.current && isWinning) {
      // تغيير شدة توهج الهالة
      glowRef.current.material.opacity = (Math.sin(state.clock.elapsedTime * 6) + 1) / 2 + 0.2;
      glowRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  return (
    <group {...props}>
      <group ref={meshRef}>
        <mesh castShadow>
          <circleGeometry args={[0.6, 32]} />
          <meshStandardMaterial 
            map={texture} 
            transparent 
            roughness={0.2} 
            metalness={0.9}
            emissive={isWinning ? "#FFFFFF" : "#888888"}
            emissiveIntensity={isWinning ? 1 : 0.2}
          />
        </mesh>
      </group>
      
      {/* هالة متوهجة حول رمز الوايلد */}
      {isWinning && (
        <>
          <mesh ref={glowRef} position={[0, 0, -0.1]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial color="#FFCC00" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <Sparkles count={40} scale={1.5} size={6} speed={0.6} opacity={0.8} color="gold" />
        </>
      )}
    </group>
  );
}

// رمز حرف A
function CardSymbol({ type, isWinning, ...props }: SymbolProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(`/images/egypt-queen/symbols/${type}.svg`);
  
  useEffect(() => {
    if (isWinning && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        y: meshRef.current.rotation.y + Math.PI * 2,
        duration: 1,
        ease: "back.out(1.2)"
      });
      
      gsap.to(meshRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut"
      });
    }
  }, [isWinning, type]);
  
  useFrame(() => {
    if (meshRef.current && isWinning) {
      // تأثير اهتزاز للرموز
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.005) * 0.1;
    }
  });
  
  // لون خاص لكل رمز من رموز الكروت
  const getSymbolColor = () => {
    switch(type) {
      case 'A': return "#FF5555";
      case 'K': return "#5555FF";
      case 'Q': return "#AA55CC";
      case 'J': return "#55AA55";
      case '10': return "#DDAA33";
      default: return "#FFFFFF";
    }
  };
  
  return (
    <group {...props}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          roughness={0.4} 
          metalness={0.6}
          emissive={isWinning ? getSymbolColor() : "#000000"}
          emissiveIntensity={isWinning ? 0.5 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {isWinning && (
        <Sparkles count={15} scale={1} size={3} speed={0.3} opacity={0.3} color={getSymbolColor()} />
      )}
    </group>
  );
}

export function EgyptSymbol3D({ type, isWinning = false, bigWin = false, ...props }: SymbolProps) {
  switch(type) {
    case 'cleopatra':
      return <CleopatraSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'book':
      return <EgyptianBook type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'eye':
      return <EyeOfHorusSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'anubis':
      return <AnubisSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'cat':
      return <EgyptianCatSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'wild':
      return <WildSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    case 'A':
    case 'K':
    case 'Q':
    case 'J':
    case '10':
      return <CardSymbol type={type} isWinning={isWinning} bigWin={bigWin} {...props} />;
    default:
      return null;
  }
}

interface SymbolsSceneProps {
  symbols: Array<{
    type: string;
    position: [number, number, number];
    isWinning?: boolean;
    bigWin?: boolean;
  }>;
}

export function SymbolsScene({ symbols }: SymbolsSceneProps) {
  return (
    <Canvas shadows>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <Environment preset="sunset" />
      
      {symbols.map((symbol, index) => (
        <EgyptSymbol3D
          key={`symbol-${index}`}
          type={symbol.type}
          position={symbol.position}
          isWinning={symbol.isWinning}
          bigWin={symbol.bigWin}
        />
      ))}
    </Canvas>
  );
}