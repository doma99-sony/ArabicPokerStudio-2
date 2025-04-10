import React from 'react';
import QueenOfEgypt3D from '@/games/queen-of-egypt-3d';
import { useLocation } from 'wouter';

/**
 * صفحة لعبة "ملكة مصر" ثلاثية الأبعاد
 * تعرض مكون اللعبة بشكل كامل
 */
export default function QueenOfEgypt3DPage() {
  const [, navigate] = useLocation();
  
  // دالة للعودة للقائمة الرئيسية
  const handleExit = () => {
    navigate('/');
  };

  return (
    <div className="w-full h-full flex flex-col">
      <QueenOfEgypt3D onExit={handleExit} />
    </div>
  );
}