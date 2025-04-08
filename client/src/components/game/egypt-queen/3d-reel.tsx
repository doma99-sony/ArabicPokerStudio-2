import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { EgyptSymbol3D } from './3d-symbols';

type SymbolType = 
  | "cleopatra" 
  | "book" 
  | "eye" 
  | "anubis" 
  | "cat" 
  | "A" | "K" | "Q" | "J" | "10"
  | "wild";

interface ReelProps {
  reelIndex: number;
  symbols: SymbolType[];
  spinning: boolean;
  spinCompleted: (reelIndex: number, finalSymbols: SymbolType[]) => void;
  winningPositions?: number[];
  bigWin?: boolean;
  reelStopDelay?: number;
}

function Reel3D({ 
  reelIndex, 
  symbols, 
  spinning, 
  spinCompleted, 
  winningPositions = [], 
  bigWin = false,
  reelStopDelay = 200
}: ReelProps) {
  const texture = useTexture('/images/egypt-queen/reels-bg.jpg');
  const reelRef = useRef<THREE.Group>(null);
  const [localSymbols, setLocalSymbols] = useState<SymbolType[]>(symbols);
  const [spinning3D, setSpinning3D] = useState(false);
  const symbolRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spinSpeed = useRef(0);
  const spinEndY = useRef(0);
  
  // إعدادات دوران البكرة
  const reelSettings = useMemo(() => ({
    symbolHeight: 2.2,  // ارتفاع الرمز
    spinDuration: 1.8 + (reelIndex * 0.4),  // مدة الدوران (تزداد لكل بكرة)
    spinStartDelay: reelIndex * 200,  // تأخير بدء الدوران
    spinEndDelay: reelStopDelay * reelIndex,  // تأخير نهاية الدوران
    initialSpinSpeed: 0.4,  // سرعة البداية
    maxSpinSpeed: 0.8 + (Math.random() * 0.2)  // السرعة القصوى
  }), [reelIndex, reelStopDelay]);
  
  // الرموز القادمة (نتيجة الدوران)
  const nextSymbols = useRef<SymbolType[]>([]);
  
  // إنشاء رموز جديدة عشوائية مع مزيد من الاحتمالات للرموز المهمة
  const generateRandomSymbols = () => {
    const allSymbols: SymbolType[] = [
      'cleopatra', 'book', 'eye', 'anubis', 'cat', 
      'A', 'K', 'Q', 'J', '10', 'wild'
    ];
    
    // أوزان مختلفة للرموز (الرموز ذات القيمة الأعلى أقل احتمالاً)
    const symbolWeights: Record<SymbolType, number> = {
      'cleopatra': 1,
      'book': 1,
      'eye': 2,
      'anubis': 2,
      'cat': 3,
      'A': 4,
      'K': 4,
      'Q': 5,
      'J': 5,
      '10': 5,
      'wild': 1
    };
    
    // إنشاء مصفوفة موسعة بناءً على الأوزان
    const weightedSymbols: SymbolType[] = [];
    allSymbols.forEach(symbol => {
      for (let i = 0; i < symbolWeights[symbol]; i++) {
        weightedSymbols.push(symbol);
      }
    });
    
    // اختيار 3 رموز عشوائية من المصفوفة الموزونة
    const result: SymbolType[] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
      result.push(weightedSymbols[randomIndex]);
    }
    
    return result;
  };
  
  // معالجة بدء الدوران
  useEffect(() => {
    if (spinning && !spinning3D) {
      // تأخير بدء دوران البكرة لإنشاء تأثير متدرج
      const startSpinTimeout = setTimeout(() => {
        setSpinning3D(true);
        
        // إعداد سرعة الدوران تدريجياً
        spinSpeed.current = reelSettings.initialSpinSpeed;
        gsap.to(spinSpeed, {
          current: reelSettings.maxSpinSpeed,
          duration: 0.5,
          ease: "power2.in"
        });
        
        // توليد رموز جديدة (ستظهر بعد انتهاء الدوران)
        nextSymbols.current = generateRandomSymbols();
        
        // حساب مقدار الدوران المطلوب ليكون مضاعفاً دقيقاً للرموز
        const spinRevolutions = 5 + Math.floor(Math.random() * 2); // 5-6 دورات كاملة
        spinEndY.current = spinRevolutions * (reelSettings.symbolHeight * 3);
        
        // إيقاف الدوران بعد المدة المحددة
        setTimeout(() => {
          stopSpin();
        }, reelSettings.spinDuration * 1000);
        
      }, reelSettings.spinStartDelay);
      
      return () => clearTimeout(startSpinTimeout);
    }
  }, [spinning, spinning3D, reelSettings]);
  
  // إنهاء الدوران بسلاسة
  const stopSpin = () => {
    // إبطاء الدوران تدريجياً
    gsap.to(spinSpeed, {
      current: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        setSpinning3D(false);
        setLocalSymbols(nextSymbols.current);
        
        // تأخير في التوقف قبل إبلاغ المكون الأب
        setTimeout(() => {
          spinCompleted(reelIndex, nextSymbols.current);
        }, reelSettings.spinEndDelay);
      }
    });
  };
  
  // تحريك البكرة في كل إطار
  useFrame(() => {
    if (spinning3D && reelRef.current) {
      reelRef.current.position.y -= spinSpeed.current;
      
      // إعادة تعيين موضع البكرة عند الدوران الكامل
      if (reelRef.current.position.y <= -reelSettings.symbolHeight) {
        reelRef.current.position.y += reelSettings.symbolHeight;
        // تحريك الرمز السفلي إلى الأعلى لإنشاء تأثير دوران لا نهائي
        if (symbolRefs.current[0] && symbolRefs.current[symbolRefs.current.length - 1]) {
          const tempY = symbolRefs.current[0]?.position.y || 0;
          
          for (let i = 0; i < symbolRefs.current.length - 1; i++) {
            if (symbolRefs.current[i] && symbolRefs.current[i + 1]) {
              symbolRefs.current[i]!.position.y = symbolRefs.current[i + 1]!.position.y;
            }
          }
          
          if (symbolRefs.current[symbolRefs.current.length - 1]) {
            symbolRefs.current[symbolRefs.current.length - 1]!.position.y = tempY;
          }
        }
      }
    }
  });
  
  return (
    <group position={[0, 0, 0]}>
      {/* خلفية البكرة */}
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <planeGeometry args={[2.2, 7.2]} />
        <meshStandardMaterial map={texture} color="#222222" transparent opacity={0.7} />
      </mesh>
      
      {/* إطار البكرة المضيء */}
      <mesh position={[0, 0, -0.05]} receiveShadow>
        <planeGeometry args={[2.3, 7.3]} />
        <meshStandardMaterial color="#D4AF37" transparent opacity={0.3} />
      </mesh>
      
      {/* مجموعة الرموز الدوارة */}
      <group ref={reelRef}>
        {localSymbols.map((symbol, index) => {
          const yPos = (1 - index) * reelSettings.symbolHeight;
          const isWinning = winningPositions.includes(index);
          
          return (
            <EgyptSymbol3D 
              key={`reel-${reelIndex}-symbol-${index}`}
              type={symbol}
              position={[0, yPos, 0]}
              scale={0.9}
              isWinning={isWinning && !spinning3D}
              bigWin={bigWin && isWinning && !spinning3D}
              ref={(el: THREE.Mesh) => {
                symbolRefs.current[index] = el;
              }}
            />
          );
        })}
      </group>
    </group>
  );
}

interface ReelsSceneProps {
  reels: SymbolType[][];
  spinning: boolean;
  onReelComplete: (reelIndex: number, finalSymbols: SymbolType[]) => void;
  winningPositions: Record<number, number[]>;
  bigWin?: boolean;
}

function ReelsScene({
  reels,
  spinning,
  onReelComplete,
  winningPositions,
  bigWin
}: ReelsSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <spotLight position={[0, 5, 5]} intensity={0.6} castShadow penumbra={0.5} />
      {/* حذف مكون Environment لإزالة الأخطاء */}
      
      <group position={[-4.4, 0, 0]}>
        {reels.map((reelSymbols, index) => (
          <group 
            key={`reel-container-${index}`}
            position={[index * 2.2, 0, 0]}
          >
            <Reel3D
              reelIndex={index}
              symbols={reelSymbols}
              spinning={spinning}
              spinCompleted={onReelComplete}
              winningPositions={winningPositions[index] || []}
              bigWin={bigWin}
              reelStopDelay={400} // تأخير توقف كل بكرة بعد البكرة السابقة
            />
          </group>
        ))}
      </group>
    </>
  );
}

interface ReelsContainerProps {
  reels: SymbolType[][];
  spinning: boolean;
  onSpinComplete: (finalReels: SymbolType[][]) => void;
  winningLines?: { row: number, col: number }[][];
  bigWin?: boolean;
}

export function Reels3DContainer({
  reels,
  spinning,
  onSpinComplete,
  winningLines = [],
  bigWin = false
}: ReelsContainerProps) {
  const [completedReels, setCompletedReels] = useState<number[]>([]);
  const [finalReelsResult, setFinalReelsResult] = useState<SymbolType[][]>(reels);
  
  // تحويل مواقع الفوز إلى بنية بسيطة
  const winningPositions = useMemo(() => {
    const positions: Record<number, number[]> = {};
    
    winningLines.forEach(line => {
      line.forEach(pos => {
        if (!positions[pos.col]) {
          positions[pos.col] = [];
        }
        if (!positions[pos.col].includes(pos.row)) {
          positions[pos.col].push(pos.row);
        }
      });
    });
    
    return positions;
  }, [winningLines]);
  
  // معالجة إكمال دوران البكرة
  const handleReelComplete = (reelIndex: number, finalSymbols: SymbolType[]) => {
    // تحديث نتيجة البكرة المنتهية
    setFinalReelsResult(prev => {
      const updated = [...prev];
      updated[reelIndex] = finalSymbols;
      return updated;
    });
    
    // إضافة البكرة إلى قائمة البكرات المكتملة
    setCompletedReels(prev => [...prev, reelIndex]);
  };
  
  // إعادة تعيين عند بدء دوران جديد
  useEffect(() => {
    if (spinning) {
      setCompletedReels([]);
    }
  }, [spinning]);
  
  // إخطار المكون الأب عند اكتمال جميع البكرات
  useEffect(() => {
    if (completedReels.length === reels.length && completedReels.length > 0) {
      onSpinComplete(finalReelsResult);
    }
  }, [completedReels, reels.length, finalReelsResult, onSpinComplete]);
  
  return (
    <Canvas shadows style={{ width: '100%', height: '100%' }}>
      <ReelsScene 
        reels={reels}
        spinning={spinning}
        onReelComplete={handleReelComplete}
        winningPositions={winningPositions}
        bigWin={bigWin}
      />
    </Canvas>
  );
}