import React from 'react';

/**
 * مكون شاشة التحميل للعبة ملكة مصر ثلاثية الأبعاد
 * يعرض رسوم متحركة وتقدم التحميل أثناء تهيئة اللعبة
 */
const GameLoader: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="w-36 h-36 relative mb-6">
        {/* رسم متحرك لتاج ملكة مصر */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <g className="animate-pulse">
              <path
                d="M50,20 L70,40 L90,25 L80,65 L20,65 L10,25 L30,40 Z"
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
                className="animate-dash"
                strokeDasharray="200"
                strokeDashoffset="200"
              />
              <circle cx="50" cy="20" r="5" fill="#FFD700" className="animate-ping-slow" />
              <circle cx="30" cy="40" r="4" fill="#FFD700" className="animate-ping-slow origin-center" style={{ animationDelay: '0.2s' }} />
              <circle cx="70" cy="40" r="4" fill="#FFD700" className="animate-ping-slow origin-center" style={{ animationDelay: '0.4s' }} />
              <circle cx="10" cy="25" r="4" fill="#FFD700" className="animate-ping-slow origin-center" style={{ animationDelay: '0.6s' }} />
              <circle cx="90" cy="25" r="4" fill="#FFD700" className="animate-ping-slow origin-center" style={{ animationDelay: '0.8s' }} />
            </g>
          </svg>
        </div>
        
        {/* دائرة تحميل متحركة */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-36 h-36 border-4 border-t-transparent border-yellow-400 rounded-full animate-spin"></div>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">جاري تحميل ملكة مصر 3D</h1>
      
      <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 rounded-full animate-progress-indeterminate"></div>
      </div>
      
      <p className="text-yellow-200 text-sm">
        يرجى الانتظار بينما نقوم بإعداد تجربة سلوتس غامرة...
      </p>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-progress-indeterminate {
          animation: progress-indeterminate 2s ease-in-out infinite;
        }
        
        .animate-dash {
          animation: dash 3s linear forwards;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
};

export default GameLoader;