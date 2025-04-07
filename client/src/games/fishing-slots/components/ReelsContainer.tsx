/**
 * مكون عرض بكرات لعبة صياد السمك
 * يدير عرض البكرات والرموز وتأثيرات الدوران
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SymbolType } from '../types';
import { SYMBOL_IMAGES, TEMP_SYMBOL_IMAGES } from '../assets/images';

interface ReelsContainerProps {
  reels: SymbolType[][]; // مصفوفة البكرات المعروضة
  spinning: boolean; // هل البكرات تدور حالياً
  onSpinComplete: () => void; // دالة تستدعى عند اكتمال الدوران
  winPositions: [number, number][]; // مواضع الرموز الفائزة [صف، عمود]
  fishValues: { [position: string]: number }; // قيم الأسماك النقدية
  animationSpeed: number; // سرعة الرسومات المتحركة
}

const ReelsContainer: React.FC<ReelsContainerProps> = ({
  reels,
  spinning,
  onSpinComplete,
  winPositions,
  fishValues,
  animationSpeed = 1.0,
}) => {
  // حالة البكرات المتحركة
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  
  // إشارة للتأكد من أن المكون لا يزال مثبتًا
  const isMounted = useRef(true);
  
  // تأخيرات توقف كل بكرة
  const reelStopDelays = [800, 1000, 1200, 1400, 1600].map(d => d / animationSpeed);
  
  // عدد الرموز المرئية في كل عمود
  const visibleSymbolsCount = 3;
  
  // إنشاء قائمة برموز مضاعفة للدوران
  const generateSpinningSymbols = () => {
    // إنشاء قائمة عشوائية من الرموز للدوران
    const allSymbols = Object.values(SymbolType);
    const spinSymbols: SymbolType[] = [];
    
    // إنشاء قائمة من 20 رمز عشوائي
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * allSymbols.length);
      spinSymbols.push(allSymbols[randomIndex]);
    }
    
    return spinSymbols;
  };
  
  // رموز الدوران لكل بكرة
  const [spinningSymbols, setSpinningSymbols] = useState<SymbolType[][]>(
    Array(5).fill(0).map(() => generateSpinningSymbols())
  );
  
  // تحديد ما إذا كان الرمز في موضع فوز
  const isWinningPosition = (rowIndex: number, colIndex: number) => {
    return winPositions.some(pos => pos[0] === rowIndex && pos[1] === colIndex);
  };
  
  // الحصول على قيمة السمكة النقدية إن وجدت
  const getFishValue = (rowIndex: number, colIndex: number, symbol: SymbolType) => {
    if (symbol === SymbolType.FISH_MONEY) {
      const posKey = `${rowIndex},${colIndex}`;
      if (fishValues && fishValues[posKey]) {
        return fishValues[posKey];
      }
    }
    return null;
  };

  // بدء الدوران
  useEffect(() => {
    if (spinning) {
      // إعادة إنشاء الرموز المتحركة
      setSpinningSymbols(Array(5).fill(0).map(() => generateSpinningSymbols()));
      
      // تعيين جميع البكرات للدوران
      setSpinningReels([true, true, true, true, true]);
      
      // تعيين توقيت لإيقاف كل بكرة
      reelStopDelays.forEach((delay, index) => {
        setTimeout(() => {
          if (isMounted.current) {
            setSpinningReels(prev => {
              const updated = [...prev];
              updated[index] = false;
              
              // التحقق مما إذا كانت جميع البكرات قد توقفت
              if (updated.every(spinning => !spinning)) {
                setTimeout(() => {
                  if (isMounted.current) {
                    onSpinComplete();
                  }
                }, 500); // تأخير قصير بعد توقف البكرة الأخيرة
              }
              
              return updated;
            });
          }
        }, delay);
      });
    }
    
    // تنظيف عند فك المكون
    return () => {
      isMounted.current = false;
    };
  }, [spinning]);

  return (
    <div className="reels-container">
      <div className="reels-frame">
        <div className="reels-grid">
          {reels.map((column, colIndex) => (
            <div key={`reel-${colIndex}`} className="reel">
              {spinningReels[colIndex] ? (
                // بكرة متحركة
                <div className="spinning-reel">
                  <AnimatePresence>
                    <motion.div
                      key={`spinning-${colIndex}`}
                      className="spinning-symbols"
                      initial={{ y: '-100%' }}
                      animate={{ y: '100%' }}
                      exit={{ y: '200%' }}
                      transition={{
                        duration: 2 / animationSpeed,
                        ease: "linear",
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      {spinningSymbols[colIndex].map((symbol, symbolIndex) => (
                        <div
                          key={`spin-symbol-${colIndex}-${symbolIndex}`}
                          className="symbol-container"
                        >
                          <img
                            src={SYMBOL_IMAGES[symbol] || TEMP_SYMBOL_IMAGES[symbol]}
                            alt={symbol}
                            className="symbol-image"
                          />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                // بكرة ثابتة
                <div className="static-reel">
                  {column.map((symbol, rowIndex) => {
                    const winning = isWinningPosition(rowIndex, colIndex);
                    const fishValue = getFishValue(rowIndex, colIndex, symbol);
                    
                    return (
                      <div
                        key={`symbol-${colIndex}-${rowIndex}`}
                        className={`symbol-container ${winning ? 'winning' : ''}`}
                      >
                        <img
                          src={SYMBOL_IMAGES[symbol] || TEMP_SYMBOL_IMAGES[symbol]}
                          alt={symbol}
                          className="symbol-image"
                        />
                        {fishValue !== null && (
                          <div className="fish-value">{fishValue}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReelsContainer;