import React from 'react';

interface ScrollBackgroundProps {
  children: React.ReactNode;
  isRevealed?: boolean;
  layerImage1?: string;
  layerImage2?: string;
}

/**
 * مكون خلفية متحركة على شكل بردية مصرية
 * تنفتح وتنطوي عند التفاعل معها مع تأثيرات بصرية
 */
const ScrollBackground: React.FC<ScrollBackgroundProps> = ({
  children,
  isRevealed = true,
  layerImage1,
  layerImage2
}) => {
  // إنشاء خلفيات SVG على الطاير بدلاً من استخدام صور خارجية
  const hieroglyphsSvgBackground = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 800">
      <defs>
        <pattern id="hieroglyphs" patternUnits="userSpaceOnUse" width="100" height="100">
          <path d="M20,20 L40,20 L40,40 L20,40 Z" fill="none" stroke="rgba(255,215,0,0.3)" stroke-width="1" />
          <path d="M60,20 Q70,10 80,20 Q90,30 80,40 Q70,50 60,40 Q50,30 60,20 Z" fill="none" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
          <path d="M10,60 L30,60 M20,50 L20,70" stroke="rgba(255,215,0,0.3)" stroke-width="1" />
          <path d="M50,80 L70,60 M50,60 L70,80" stroke="rgba(255,215,0,0.25)" stroke-width="1" />
          <circle cx="80" cy="70" r="10" fill="none" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
          <path d="M15,80 L35,80 L25,60 Z" fill="none" stroke="rgba(255,215,0,0.3)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hieroglyphs)" />
    </svg>
  `;

  const symbolsSvgBackground = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 800">
      <defs>
        <pattern id="egyptSymbols" patternUnits="userSpaceOnUse" width="100" height="100">
          <path d="M50,20 L60,10 L70,20 L60,30 Z" fill="none" stroke="rgba(255,215,0,0.25)" stroke-width="1" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
          <path d="M80,10 L80,30 M70,20 L90,20" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
          <path d="M20,50 L30,60 L20,70 L10,60 Z" fill="none" stroke="rgba(255,215,0,0.3)" stroke-width="1" />
          <path d="M50,50 C55,45 65,45 70,50 C75,55 75,65 70,70 C65,75 55,75 50,70 C45,65 45,55 50,50 Z" fill="none" stroke="rgba(255,215,0,0.25)" stroke-width="1" />
          <path d="M85,85 L75,75 M85,75 L75,85" stroke="rgba(255,215,0,0.2)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#egyptSymbols)" />
    </svg>
  `;

  // تحويل SVG إلى Data URL
  const svgToDataUrl = (svg: string) => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // استخدام الصور المقدمة أو إنشاء SVG
  const layer1Background = layerImage1 || svgToDataUrl(hieroglyphsSvgBackground);
  const layer2Background = layerImage2 || svgToDataUrl(symbolsSvgBackground);

  return (
    <div className="scroll-background w-full min-h-screen relative overflow-hidden">
      {/* الخلفية الأساسية */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900"></div>
      
      {/* طبقات البردية */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isRevealed ? 'opacity-50' : 'opacity-0'}`}
        style={{
          backgroundImage: `url("${layer1Background}")`,
          backgroundSize: '800px 800px',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          transform: isRevealed ? 'translateX(0)' : 'translateX(-100%)'
        }}
      ></div>
      
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out delay-100 ${isRevealed ? 'opacity-30' : 'opacity-0'}`}
        style={{
          backgroundImage: `url("${layer2Background}")`,
          backgroundSize: '800px 800px',
          backgroundPosition: 'center',
          backgroundBlendMode: 'color-burn',
          transform: isRevealed ? 'translateX(0)' : 'translateX(100%)'
        }}
      ></div>
      
      {/* زخارف إضافية */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.1),_transparent_70%)]"></div>
      
      {/* الحدود المزخرفة */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-amber-700 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-700 to-transparent"></div>
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-amber-700 to-transparent"></div>
      <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-amber-700 to-transparent"></div>
      
      {/* المحتوى */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ScrollBackground;