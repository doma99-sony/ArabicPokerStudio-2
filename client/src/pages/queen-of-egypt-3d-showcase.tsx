import React, { useState } from 'react';
import { useLocation } from 'wouter';
import EgyptianComponentsShowcase from '@/games/queen-of-egypt-3d/components/EgyptianComponentsShowcase';

/**
 * صفحة عرض لمكونات لعبة ملكة مصر ثلاثية الأبعاد
 * تُستخدم للاختبار والعرض التقديمي للمكونات
 */
export default function QueenOfEgypt3DShowcasePage() {
  const [, navigate] = useLocation();
  
  // للعودة إلى الصفحة الرئيسية
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* زر العودة للصفحة الرئيسية */}
      <button 
        onClick={handleBackToHome}
        className="fixed top-4 left-4 z-50 px-3 py-2 bg-black/60 text-white rounded-md hover:bg-black/80 backdrop-blur-sm"
      >
        العودة للرئيسية
      </button>
      
      {/* عرض المكونات المصرية */}
      <EgyptianComponentsShowcase />
    </div>
  );
}