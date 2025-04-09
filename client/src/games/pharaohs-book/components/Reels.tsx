import { useState, useEffect, useRef } from 'react';

interface ReelsProps {
  reels: string[][];
  spinning: boolean;
  specialSymbol: string | null;
  winningLines?: number[][];
}

/**
 * مكون البكرات (Reels)
 * يعرض البكرات الخمسة للعبة السلوتس مع الرموز المختلفة
 */
export default function Reels({ reels, spinning, specialSymbol, winningLines = [] }: ReelsProps) {
  const [isSpinning, setIsSpinning] = useState(spinning);
  const [spinDelay, setSpinDelay] = useState<number[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [winAnimationActive, setWinAnimationActive] = useState(false);
  const [winLineIndex, setWinLineIndex] = useState(0);
  
  // مراجع للعناصر لإضافة تأثيرات متقدمة
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  const winningAnimationRef = useRef<number | null>(null);

  // تأثير الدوران المتأخر لكل بكرة
  useEffect(() => {
    if (spinning) {
      setIsSpinning(true);
      setWinAnimationActive(false);
      
      // إلغاء أي تأثيرات سابقة
      if (winningAnimationRef.current) {
        cancelAnimationFrame(winningAnimationRef.current);
        winningAnimationRef.current = null;
      }
      
      // إضافة تأثير الاهتزاز للبكرات أثناء الدوران
      if (reelsContainerRef.current) {
        reelsContainerRef.current.classList.add('shaking');
      }
      
      // إنشاء تأخير مختلف لكل بكرة
      const delays = Array(5).fill(0).map((_, i) => 100 + i * 200);
      setSpinDelay(delays);
      
      // إعادة تعيين الخلايا المضاءة
      setHighlightedCells(new Set());
      
      // تأخير طويل لإيقاف تأثير الدوران
      const maxDelay = Math.max(...delays);
      setTimeout(() => {
        setIsSpinning(false);
        
        // إزالة تأثير الاهتزاز
        if (reelsContainerRef.current) {
          reelsContainerRef.current.classList.remove('shaking');
        }
        
        // بعد انتهاء الدوران، إضاءة الخطوط الفائزة بتأثير متسلسل
        if (winningLines.length > 0) {
          // تأخير قليل قبل بدء عرض الخطوط الفائزة
          setTimeout(() => {
            setWinAnimationActive(true);
            setWinLineIndex(0);
            
            // عرض خطوط الفوز بتأثير متتابع
            const animateWinningLines = () => {
              setHighlightedCells(prevCells => {
                const newCells = new Set(prevCells);
                
                // إضافة الخط الحالي فقط للتأثير المتتابع
                if (winLineIndex < winningLines.length) {
                  const currentLine = winningLines[winLineIndex];
                  currentLine.forEach(cellIndex => {
                    const row = Math.floor(cellIndex / 5);
                    const reelIndex = cellIndex % 5;
                    newCells.add(`${reelIndex}-${row}`);
                  });
                }
                
                return newCells;
              });
              
              // التقدم إلى الخط التالي بعد وقت مناسب
              setTimeout(() => {
                if (winLineIndex < winningLines.length - 1) {
                  setWinLineIndex(prev => prev + 1);
                } else {
                  // إعادة البدء من أول خط بعد عرض جميع الخطوط
                  setWinLineIndex(0);
                  
                  // بعد دورة كاملة، إضاءة كل الخطوط معاً
                  setTimeout(() => {
                    const allHighlightedCells = new Set<string>();
                    
                    winningLines.forEach(line => {
                      line.forEach(cellIndex => {
                        const row = Math.floor(cellIndex / 5);
                        const reelIndex = cellIndex % 5;
                        allHighlightedCells.add(`${reelIndex}-${row}`);
                      });
                    });
                    
                    setHighlightedCells(allHighlightedCells);
                  }, 500);
                }
              }, 800);
            };
            
            // بدء تأثير التتابع
            animateWinningLines();
          }, 500);
        }
      }, maxDelay + 1000);
    }
    
    // تنظيف عند إلغاء التحميل
    return () => {
      if (winningAnimationRef.current) {
        cancelAnimationFrame(winningAnimationRef.current);
      }
    };
  }, [spinning, winningLines, winLineIndex]);

  // دالة مساعدة لعرض الرمز
  const renderSymbol = (symbol: string) => {
    // استخدام الصور SVG لجميع الرموز
    try {
      // استخدام مرجع مباشر للصورة SVG المطلوبة
      const symbolPath = `/images/pharaohs-book/${symbol}.svg`;
      
      // تحديد أسماء العرض بالعربية للرموز (للوصف النصي)
      const symbolNames: Record<string, string> = {
        'pharaoh': 'الفرعون',
        'book': 'كتاب الفرعون',
        'anubis': 'أنوبيس',
        'eye': 'عين حورس',
        'scarab': 'الجعران المقدس',
        'a': 'حرف A',
        'k': 'حرف K',
        'q': 'حرف Q',
        'j': 'حرف J',
        '10': 'رقم 10'
      };
      
      // الاسم المعروض للرمز
      const symbolDisplayName = symbolNames[symbol] || symbol;
      
      // إنشاء عنصر العرض مع فئات CSS مخصصة لكل رمز
      return (
        <div className={`symbol-inner-container symbol-${symbol}`}>
          {/* عرض الصورة SVG */}
          <object 
            type="image/svg+xml"
            data={symbolPath}
            className={`w-full h-full object-contain symbol-svg symbol-${symbol}-svg`}
            aria-label={symbolDisplayName}
          >
            {/* البديل في حالة فشل تحميل الصورة SVG */}
            <img 
              src={symbolPath} 
              alt={symbolDisplayName}
              className="w-full h-full object-contain"
              loading="eager"
              onError={(e) => {
                // في حالة فشل تحميل الصورة، إظهار الرمز النصي البديل
                const imgEl = e.currentTarget;
                imgEl.style.display = 'none';
                
                // البحث عن العنصر الأب
                const parentEl = imgEl.parentElement;
                if (parentEl) {
                  // إضافة فئة لإظهار الرمز البديل
                  parentEl.classList.add('fallback-active');
                }
              }}
            />
            
            {/* عنصر الرمز النصي البديل */}
            <div className="fallback-icon w-full h-full flex items-center justify-center text-3xl">
              {getFallbackIcon(symbol)}
            </div>
          </object>
        </div>
      );
    } catch (error) {
      console.error(`فشل في تحميل صورة الرمز: ${symbol}`, error);
      // في حالة حدوث خطأ استخدم الرموز النصية
      return (
        <div className="fallback-icon flex items-center justify-center text-3xl symbol-fallback">
          {getFallbackIcon(symbol)}
        </div>
      );
    }
  };

  // الحصول على الرمز النصي البديل
  const getFallbackIcon = (symbol: string): string => {
    const fallbackIcons: Record<string, string> = {
      'pharaoh': '🧙‍♂️',
      'book': '📕',
      'anubis': '🐕',
      'eye': '👁️',
      'scarab': '🪲',
      'a': 'A',
      'k': 'K',
      'q': 'Q',
      'j': 'J',
      '10': '10'
    };
    
    return fallbackIcons[symbol] || symbol;
  };

  // التحقق مما إذا كان الرمز هو الرمز الخاص في الدورات المجانية
  const isSpecial = (symbol: string) => {
    return specialSymbol === symbol;
  };

  // التحقق ما إذا كانت الخلية ضمن خط فائز
  const isHighlighted = (reelIndex: number, symbolIndex: number) => {
    return highlightedCells.has(`${reelIndex}-${symbolIndex}`);
  };

  // دالة لتحديد فئة تأثير الفوز (لتنويع التأثيرات)
  const getWinEffectClass = (reelIndex: number, symbolIndex: number) => {
    if (!isHighlighted(reelIndex, symbolIndex)) return '';
    
    // تحديد نوع التأثير بناءً على موقع الرمز
    const effectIndex = (reelIndex + symbolIndex) % 4;
    return `win-effect-${effectIndex + 1}`;
  };

  return (
    <div className="reels-container relative" ref={reelsContainerRef}>
      {/* تأثيرات الفوز حول البكرات */}
      {winAnimationActive && (
        <div className="win-effects absolute inset-0 z-10 pointer-events-none">
          <div className="win-glow absolute inset-0 animate-pulse-gold"></div>
          <div className="win-particles absolute inset-0"></div>
        </div>
      )}
      
      {/* خطوط الفوز */}
      {winAnimationActive && winningLines.map((line, index) => (
        <div 
          key={`line-${index}`} 
          className={`win-line win-line-${index % 5} ${winLineIndex === index ? 'active' : ''}`}
        ></div>
      ))}
      
      <div className="reels-grid">
        {reels.map((reel, reelIndex) => (
          <div 
            key={reelIndex} 
            className="reel"
            style={{ 
              animationDelay: isSpinning ? `${spinDelay[reelIndex]}ms` : '0ms' 
            }}
          >
            {reel.map((symbol, symbolIndex) => (
              <div
                key={`${reelIndex}-${symbolIndex}`}
                className={`
                  symbol 
                  ${isSpinning ? 'spinning' : ''} 
                  ${symbol === 'book' ? 'special-symbol' : ''} 
                  ${isSpecial(symbol) ? 'special-symbol' : ''} 
                  ${isHighlighted(reelIndex, symbolIndex) ? 'winning-symbol' : ''}
                  ${getWinEffectClass(reelIndex, symbolIndex)}
                `}
                style={{ 
                  animationDelay: isSpinning ? `${spinDelay[reelIndex] + symbolIndex * 100}ms` : '0ms',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* تأثير توهج حول الرموز الفائزة */}
                {isHighlighted(reelIndex, symbolIndex) && (
                  <div className="symbol-glow absolute inset-0 rounded-lg z-0"></div>
                )}
                
                <div className={`symbol-icon ${symbol} relative z-10`}>
                  {renderSymbol(symbol)}
                </div>
                
                {/* تأثير نجوم متساقطة على الرموز الفائزة */}
                {isHighlighted(reelIndex, symbolIndex) && (
                  <div className="symbol-stars absolute inset-0 overflow-hidden z-20">
                    <div className="stars-inner"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}