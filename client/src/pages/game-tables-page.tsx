
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

export default function GameTablesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A17] to-[#111] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gold text-center mb-8">طاولات اللعب</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* يمكن إضافة الطاولات هنا */}
          <div className="bg-black/40 p-6 rounded-lg border border-gold/30">
            <h2 className="text-2xl font-bold text-gold mb-2">طاولة 1</h2>
            <p className="text-gray-300 mb-4">الحد الأدنى: 1000 رقاقة</p>
            <button 
              className="w-full bg-gold hover:bg-gold/80 text-black font-bold py-2 px-4 rounded"
              onClick={() => navigate('/game/1')}
            >
              انضم للعب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
