import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * صفحة بوكر تركي كلاسيك - قيد التطوير
 */
export default function TurkishClassicPoker() {
  const [, navigate] = useLocation();
  
  return (
    <div className="turkish-classic-poker min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black flex flex-col">
      {/* الهيدر */}
      <div className="poker-header bg-black/80 p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
        <button 
          onClick={() => navigate('/poker-lobby/poker-masr')}
          className="bg-black/60 hover:bg-black/80 p-2 rounded-full text-white/80 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        
        <h1 className="text-2xl text-white font-bold">بوكر تركي كلاسيك</h1>
        
        <div className="w-10"></div>
      </div>
      
      {/* المحتوى */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-[#D4AF37]">🚧 قيد التطوير 🚧</h2>
          <p className="text-white text-lg">
            لعبة بوكر تركي كلاسيك قيد التطوير حالياً وستكون متاحة قريباً بإذن الله
          </p>
          <p className="text-white/70">
            استمتع بتجربة البوكر العثمانية الأصيلة، ستتوفر في الإصدار القادم
          </p>
          
          <Button 
            onClick={() => navigate('/poker-lobby/poker-masr')}
            className="mt-8 bg-[#D4AF37] hover:bg-[#C19A20] text-black"
          >
            العودة للوبي
          </Button>
        </div>
      </div>
    </div>
  );
}