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
    try {
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
      
      // استخدام مسار نسبي للصورة SVG المطلوبة نسبةً للمجلد العام
      const svgPath = `/images/pharaohs-book/${symbol}.svg`;
      
      // تحديد محتوى SVG المضمّن للرمز استناداً إلى اسم الرمز
      const SVGContent = getSVGContent(symbol);
      
      return (
        <div className={`symbol-inner-container symbol-${symbol}`}>
          {SVGContent ? (
            // عرض محتوى SVG المضمّن مباشرةً
            <div 
              className={`svg-embed w-full h-full symbol-svg symbol-${symbol}-svg`}
              dangerouslySetInnerHTML={{ __html: SVGContent }}
            />
          ) : (
            // استخدام صورة كبديل (نسخة احتياطية)
            <div className="image-container w-full h-full relative">
              <img 
                src={svgPath}
                alt={symbolDisplayName}
                className={`w-full h-full object-contain symbol-svg symbol-${symbol}-svg`}
                loading="eager"
                onError={(e) => {
                  // إخفاء الصورة الفاشلة وإظهار الرمز البديل
                  const imgEl = e.currentTarget;
                  imgEl.style.display = 'none';
                  
                  // إظهار الرمز البديل
                  const parentDiv = imgEl.closest('.symbol-inner-container');
                  if (parentDiv) {
                    const fallbackEl = parentDiv.querySelector('.fallback-symbol');
                    if (fallbackEl) {
                      (fallbackEl as HTMLElement).style.display = 'flex';
                    }
                  }
                }}
              />
              
              {/* رمز بديل (محجوب افتراضياً) */}
              <div 
                className="fallback-symbol w-full h-full absolute top-0 left-0 flex items-center justify-center text-3xl"
                style={{ display: 'none' }}
              >
                {getFallbackIcon(symbol)}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error(`فشل في عرض رمز: ${symbol}`, error);
      // في حالة حدوث خطأ استخدم الرموز النصية
      return (
        <div className="fallback-icon flex items-center justify-center text-3xl symbol-fallback">
          {getFallbackIcon(symbol)}
        </div>
      );
    }
  };
  
  // الحصول على محتوى SVG المضمّن للرمز
  const getSVGContent = (symbol: string): string => {
    // كود SVG مضمّن للرموز الرئيسية
    switch(symbol) {
      case 'pharaoh':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="60" fill="#D4AF37" opacity="0.4" />
            <path d="M 75 150 L 75 90 C 75 70, 125 70, 125 90 L 125 150 Z"
                  fill="#B8860B" stroke="#FFD700" stroke-width="2" />
            <path d="M 85 85 L 85 60 L 115 60 L 115 85 Z" fill="#D4AF37" stroke="#FFD700" stroke-width="1.5" />
            <rect x="95" y="40" width="10" height="20" fill="#FFD700" />
            <rect x="65" y="110" width="70" height="10" fill="#D4AF37" stroke="#FFD700" stroke-width="1" />
            <circle cx="85" cy="100" r="5" fill="white" />
            <circle cx="115" cy="100" r="5" fill="white" />
            <circle cx="85" cy="100" r="2" fill="black" />
            <circle cx="115" cy="100" r="2" fill="black" />
            <path d="M 90 115 C 95 125, 105 125, 110 115" stroke="#FFD700" stroke-width="2" fill="none" />
          </g>
        </svg>`;
      
      case 'book':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <rect x="50" y="50" width="100" height="125" rx="5" ry="5" fill="#8B4513" stroke="#FFD700" stroke-width="2" />
            <rect x="55" y="55" width="90" height="115" rx="3" ry="3" fill="#A0522D" stroke="#D4AF37" stroke-width="1" />
            <line x1="100" y1="55" x2="100" y2="170" stroke="#FFD700" stroke-width="2" />
            <circle cx="100" cy="100" r="25" fill="#D4AF37" opacity="0.6" />
            <path d="M 85 90 L 85 65 L 115 65 L 115 90 Z" fill="#B8860B" stroke="#FFD700" stroke-width="1" />
            <rect x="95" y="45" width="10" height="20" fill="#FFD700" />
            <path d="M 70 130 L 130 130" stroke="#FFD700" stroke-width="1" stroke-dasharray="2,2" />
            <path d="M 70 140 L 130 140" stroke="#FFD700" stroke-width="1" stroke-dasharray="2,2" />
            <path d="M 70 150 L 130 150" stroke="#FFD700" stroke-width="1" stroke-dasharray="2,2" />
          </g>
        </svg>`;
      
      case 'anubis':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <path d="M 70 150 L 70 70 L 85 50 L 115 50 L 130 70 L 130 150 Z" fill="#222" stroke="#D4AF37" stroke-width="2" />
            <path d="M 75 70 L 85 55 L 115 55 L 125 70 L 125 90 L 75 90 Z" fill="#444" />
            <path d="M 85 80 L 85 70 L 95 70 L 95 80 Z" fill="#D4AF37" />
            <path d="M 105 80 L 105 70 L 115 70 L 115 80 Z" fill="#D4AF37" />
            <rect x="75" y="100" width="50" height="30" fill="#444" />
            <path d="M 65 110 L 75 90 L 75 130 L 65 140 Z" fill="#222" stroke="#D4AF37" stroke-width="1" />
            <path d="M 135 110 L 125 90 L 125 130 L 135 140 Z" fill="#222" stroke="#D4AF37" stroke-width="1" />
            <circle cx="100" cy="120" r="20" fill="#333" opacity="0.6" />
          </g>
        </svg>`;
      
      case 'eye':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <ellipse cx="100" cy="100" rx="60" ry="40" fill="#D4AF37" opacity="0.4" />
            <path d="M 50 100 C 70 60, 130 60, 150 100 C 130 140, 70 140, 50 100 Z" 
                fill="#FFF" stroke="#D4AF37" stroke-width="2" />
            <circle cx="100" cy="100" r="20" fill="#4682B4" stroke="#D4AF37" stroke-width="1" />
            <circle cx="100" cy="100" r="10" fill="#000" />
            <circle cx="95" cy="95" r="3" fill="#FFF" />
            <path d="M 75 100 L 50 100" stroke="#D4AF37" stroke-width="2" />
            <path d="M 125 100 L 150 100" stroke="#D4AF37" stroke-width="2" />
            <path d="M 100 120 L 100 140" stroke="#D4AF37" stroke-width="2" />
          </g>
        </svg>`;
      
      case 'scarab':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <ellipse cx="100" cy="110" rx="40" ry="30" fill="#228B22" stroke="#D4AF37" stroke-width="2" />
            <path d="M 70 110 C 70 90, 130 90, 130 110" fill="#1E6B1E" stroke="#D4AF37" stroke-width="1" />
            <circle cx="100" cy="100" r="15" fill="#D4AF37" opacity="0.6" />
            <path d="M 85 90 L 115 90 L 110 80 L 90 80 Z" fill="#D4AF37" stroke="#B8860B" stroke-width="1" />
            <line x1="100" y1="80" x2="100" y2="60" stroke="#D4AF37" stroke-width="2" />
            <circle cx="100" cy="55" r="5" fill="#D4AF37" />
            <path d="M 70 110 L 60 100 L 60 120 L 70 130" fill="none" stroke="#D4AF37" stroke-width="1.5" />
            <path d="M 130 110 L 140 100 L 140 120 L 130 130" fill="none" stroke="#D4AF37" stroke-width="1.5" />
          </g>
        </svg>`;
        
      case 'a':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="50" fill="#FF6347" opacity="0.2" />
            <path d="M 70 150 L 100 50 L 130 150 Z" fill="none" stroke="#FF6347" stroke-width="4" />
            <line x1="80" y1="125" x2="120" y2="125" stroke="#FF6347" stroke-width="4" />
          </g>
        </svg>`;
        
      case 'k':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="50" fill="#9370DB" opacity="0.2" />
            <line x1="70" y1="50" x2="70" y2="150" stroke="#9370DB" stroke-width="4" />
            <line x1="70" y1="100" x2="120" y2="50" stroke="#9370DB" stroke-width="4" />
            <line x1="70" y1="100" x2="120" y2="150" stroke="#9370DB" stroke-width="4" />
          </g>
        </svg>`;
        
      case 'q':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="50" fill="#20B2AA" opacity="0.2" />
            <circle cx="100" cy="90" r="40" stroke="#20B2AA" stroke-width="4" fill="none" />
            <line x1="115" y1="125" x2="130" y2="140" stroke="#20B2AA" stroke-width="4" />
          </g>
        </svg>`;
        
      case 'j':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="50" fill="#FF8C00" opacity="0.2" />
            <line x1="70" y1="50" x2="130" y2="50" stroke="#FF8C00" stroke-width="4" />
            <line x1="100" y1="50" x2="100" y2="130" stroke="#FF8C00" stroke-width="4" />
            <path d="M 100 130 C 100 150, 70 150, 70 130" stroke="#FF8C00" stroke-width="4" fill="none" />
          </g>
        </svg>`;
        
      case '10':
        return `<svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1A2530" />
          <g>
            <circle cx="100" cy="100" r="50" fill="#CD5C5C" opacity="0.2" />
            <line x1="70" y1="50" x2="70" y2="150" stroke="#CD5C5C" stroke-width="4" />
            <circle cx="120" cy="100" r="30" stroke="#CD5C5C" stroke-width="4" fill="none" />
          </g>
        </svg>`;
        
      default:
        return '';
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