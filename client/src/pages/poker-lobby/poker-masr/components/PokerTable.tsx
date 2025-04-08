import React from 'react';

/**
 * مكون طاولة البوكر - يستخدم لعرض طاولة البوكر التفاعلية
 */
export default function PokerTable() {
  return (
    <div className="poker-table relative w-[800px] h-[400px] max-w-full mx-auto rounded-[50%] bg-gradient-to-b from-[#076324] to-[#0A3A2A] border-8 border-[#4A2511] shadow-2xl flex items-center justify-center">
      {/* حافة الطاولة */}
      <div className="table-rim absolute inset-0 rounded-[50%] border-8 border-[#B8860B] pointer-events-none"></div>
      
      {/* المنطقة الوسطى في الطاولة */}
      <div className="table-center absolute w-[85%] h-[85%] rounded-[50%] bg-[#076324] flex flex-col items-center justify-center">
        <div className="pot-area mb-2 text-center">
          <div className="pot-label text-white/70 text-sm">المراهنة الحالية</div>
          <div className="pot-amount text-white font-bold text-2xl">$0</div>
        </div>
        
        {/* بطاقات المجتمع (مخفية مبدئيًا) */}
        <div className="community-cards flex gap-2 mt-2">
          <div className="card w-16 h-24 bg-slate-700/50 rounded-lg border border-white/20"></div>
          <div className="card w-16 h-24 bg-slate-700/50 rounded-lg border border-white/20"></div>
          <div className="card w-16 h-24 bg-slate-700/50 rounded-lg border border-white/20"></div>
          <div className="card w-16 h-24 bg-slate-700/50 rounded-lg border border-white/20"></div>
          <div className="card w-16 h-24 bg-slate-700/50 rounded-lg border border-white/20"></div>
        </div>
      </div>
      
      {/* أماكن اللاعبين موزعة حول الطاولة */}
      <div className="player-positions absolute inset-0 pointer-events-none">
        {/* سيتم استبدال هذا بمكونات اللاعبين الديناميكية */}
      </div>
    </div>
  );
}