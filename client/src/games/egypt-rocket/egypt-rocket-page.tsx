import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

// صفحة صاروخ مصر - الصفحة الرئيسية للعبة
export default function EgyptRocketPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // عند تحميل الصفحة
  useEffect(() => {
    // إخبار المستخدم أن اللعبة قيد التطوير
    toast({
      title: "صاروخ مصر",
      description: "اللعبة قيد التطوير، ستكون متاحة قريباً!",
      variant: "default"
    });
  }, [toast]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0A0D16] to-[#1A2035] text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#D4AF37]">🚀 صاروخ مصر</h1>
        <p className="text-xl text-gray-300">اللعبة قيد التطوير...</p>
        <div className="animate-pulse my-8">
          <img 
            src="/attached_assets/image_1743971608301.png" 
            alt="صاروخ مصر" 
            className="w-64 h-64 object-contain mx-auto"
          />
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded-md hover:bg-[#B08D2A] transition-colors"
        >
          العودة للوبي
        </button>
      </div>
    </div>
  );
}