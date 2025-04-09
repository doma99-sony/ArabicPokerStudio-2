import { useState, useEffect } from 'react';

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

  // تأثير الدوران المتأخر لكل بكرة
  useEffect(() => {
    if (spinning) {
      setIsSpinning(true);
      
      // إنشاء تأخير مختلف لكل بكرة
      const delays = Array(5).fill(0).map((_, i) => 100 + i * 200);
      setSpinDelay(delays);
      
      // إعادة تعيين الخلايا المضاءة
      setHighlightedCells(new Set());
      
      // تأخير طويل لإيقاف تأثير الدوران
      const maxDelay = Math.max(...delays);
      setTimeout(() => {
        setIsSpinning(false);
        
        // بعد انتهاء الدوران، إضاءة الخطوط الفائزة بتأثير متسلسل
        if (winningLines.length > 0) {
          // تأخير قليل قبل بدء عرض الخطوط الفائزة
          setTimeout(() => {
            const showWinningLines = () => {
              // جمع كل الخلايا الفائزة في مجموعة واحدة
              const allHighlightedCells = new Set<string>();
              
              winningLines.forEach((line, lineIndex) => {
                line.forEach(cellIndex => {
                  const row = Math.floor(cellIndex / 5);
                  const reelIndex = cellIndex % 5;
                  allHighlightedCells.add(`${reelIndex}-${row}`);
                });
              });
              
              // تحديث الخلايا المضاءة مرة واحدة
              setHighlightedCells(allHighlightedCells);
            };
            
            showWinningLines();
          }, 500);
        }
      }, maxDelay + 1000);
    }
  }, [spinning, winningLines]);

  // دالة مساعدة لعرض الرمز
  const renderSymbol = (symbol: string) => {
    // استخدام الصور إذا كانت متوفرة أو استخدام الرموز النصية كبديل
    try {
      // أولاً نحاول استخدام الصور
      if (['pharaoh', 'book', 'anubis'].includes(symbol)) {
        return <img 
          src={`/images/pharaohs-book/${symbol}.svg`} 
          alt={symbol} 
          className="w-full h-full object-contain"
        />;
      }
      
      // استخدام الرموز كبديل
      const symbolIcons: Record<string, string> = {
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
      
      return symbolIcons[symbol] || symbol;
    } catch (error) {
      // في حالة حدوث خطأ استخدم الرموز النصية
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
    }
  };

  // التحقق مما إذا كان الرمز هو الرمز الخاص في الدورات المجانية
  const isSpecial = (symbol: string) => {
    return specialSymbol === symbol;
  };

  // التحقق ما إذا كانت الخلية ضمن خط فائز
  const isHighlighted = (reelIndex: number, symbolIndex: number) => {
    return highlightedCells.has(`${reelIndex}-${symbolIndex}`);
  };

  return (
    <div className="reels-container">
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
                `}
                style={{ 
                  animationDelay: isSpinning ? `${spinDelay[reelIndex] + symbolIndex * 100}ms` : '0ms',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className={`symbol-icon ${symbol}`}>
                  {renderSymbol(symbol)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}