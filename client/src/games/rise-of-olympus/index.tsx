import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import './assets/olympus-styles.css';

/**
 * صعود الأوليمبوس (Rise of Olympus)
 * لعبة سلوتس مستوحاة من الأساطير اليونانية
 */
export default function RiseOfOlympus() {
  const [, setLocation] = useLocation();
  const animationFrameRef = useRef<number | null>(null);
  
  // تأثير لإنشاء عناصر الخلفية ثلاثية الأبعاد عند تحميل الصفحة
  useEffect(() => {
    // تنظيف وإلغاء أي تأثيرات عند مغادرة الصفحة
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // العودة للصفحة الرئيسية/ردهة الألعاب
  const goBack = () => {
    setLocation('/');
  };
  
  return (
    <div className="olympus-container">
      {/* طبقات الخلفية الديناميكية */}
      <div className="olympus-sky-background"></div>
      <div className="olympus-clouds"></div>
      <div className="olympus-light-rays"></div>
      <div className="olympus-golden-glow"></div>
      
      {/* المعبد الرئيسي - المبنى المركزي */}
      <div className="olympus-temple"></div>
      
      {/* تماثيل الآلهة اليونانية مع تأثيرات 3D */}
      <div className="olympus-statue zeus">
        <div className="olympus-statue-inner"></div>
        <div className="olympus-statue-glow"></div>
      </div>
      <div className="olympus-statue poseidon">
        <div className="olympus-statue-inner"></div>
        <div className="olympus-statue-glow"></div>
      </div>
      
      {/* تأثيرات إضافية */}
      <div className="olympus-particles"></div>
      <div className="olympus-fog-effect"></div>
      
      {/* عرض باقي عناصر اللعبة - مكان خاص بواجهة اللعب */}
      <div className="olympus-game-content" style={{ position: 'relative', zIndex: 20, marginTop: '10vh' }}>
        <header className="bg-blue-900 bg-opacity-50 backdrop-blur-sm p-4 text-white flex justify-between items-center border-b border-blue-700">
          <button 
            onClick={goBack}
            className="text-white hover:text-blue-300 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-center gradient-text">صعود الأوليمبوس</h1>
          <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500">
            <span className="text-blue-300 mr-2 font-bold">1,000,000</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <circle cx="12" cy="12" r="8"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
        </header>
        
        <div className="flex flex-col items-center justify-center mt-16 text-center px-4">
          <div className="text-white text-2xl mb-8 bg-blue-900 bg-opacity-40 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 text-blue-300">مرحبًا بك في صعود الأوليمبوس</h2>
            <p>خلفية ثلاثية الأبعاد مستوحاة من الأساطير اليونانية القديمة</p>
            <p className="mt-2">انظر إلى التماثيل ثلاثية الأبعاد على الجانبين مع تأثيرات الإضاءة والظلال</p>
            <p className="italic text-blue-300 mt-4">سيتم إضافة اللعبة الكاملة قريبًا</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              ابدأ اللعب
            </button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              جدول المكافآت
            </button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
              الإعدادات
            </button>
          </div>
        </div>
      </div>
      
      <style>
        {`
        .gradient-text {
          background: linear-gradient(to right, #4a89dc, #79a6f2, #4a89dc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 3s infinite linear;
          background-size: 200% 100%;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 200% 0%;
          }
        }
        `}
      </style>
    </div>
  );
}