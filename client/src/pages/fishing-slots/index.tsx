/**
 * صفحة لعبة صياد السمك
 * تعرض واجهة اللعبة وتتحكم في تحميلها
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import '../../games/fishing-slots/assets/fishing-slots.css';

// استيراد الصور والأصول
import images from '../../games/fishing-slots/assets/images';

// استيراد مكونات اللعبة
// سيتم استبدال هذا لاحقًا بالمكونات الحقيقية عند إنشائها
const FishingGamePlaceholder = () => (
  <div className="fishing-game-container">
    <div className="fishing-game-background">
      <div className="water-animation"></div>
      <div className="bubbles-animation"></div>
      <div className="water-grid"></div>
    </div>
    
    <div className="game-header">
      <h1 className="game-title">صياد السمك 🎣</h1>
      <button className="exit-button" onClick={() => window.history.back()}>خروج</button>
    </div>
    
    <div className="player-info">
      <div className="balance-card">
        <div className="balance-label">رصيدك</div>
        <div className="balance-amount">5,000</div>
      </div>
      <div className="bet-card">
        <div className="bet-label">الرهان</div>
        <div className="bet-amount">100</div>
      </div>
      <div className="win-card">
        <div className="win-label">الفوز</div>
        <div className="win-amount">0</div>
      </div>
    </div>
    
    <div className="reels-area">
      <div className="reels-container">
        <div className="reels-grid">
          {Array(3).fill(0).map((_, row) => (
            Array(5).fill(0).map((_, col) => (
              <div key={`${row}-${col}`} className="symbol">
                <img 
                  src={Object.values(images.symbols)[Math.floor(Math.random() * Object.values(images.symbols).length)]} 
                  alt="Symbol" 
                />
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
    
    <div className="game-controls">
      <div className="bet-controls">
        <div className="control-label">الرهان:</div>
        <div className="bet-amount-controls">
          <Button variant="outline" size="sm">-</Button>
          <span className="mx-2">100</span>
          <Button variant="outline" size="sm">+</Button>
        </div>
      </div>
      
      <div className="main-controls">
        <button className="max-bet-button">أقصى رهان</button>
        <div className="play-controls">
          <button className="spin-button">لف! 🎣</button>
        </div>
      </div>
    </div>
    
    <div className="mt-4 text-center text-white/60 text-xs">
      <p>قريباً! ستتمكن من جمع الأسماك ذات القيمة أثناء دورات اللفات المجانية</p>
    </div>
  </div>
);

export default function FishingSlotsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [, navigate] = useLocation();

  // تحميل اللعبة ومواردها
  useEffect(() => {
    // تحميل مسبق للصور
    images.preload();
    
    // محاكاة وقت التحميل
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // التبديل بين كتم الصوت وتشغيله
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // العودة إلى الصفحة السابقة
  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-animation"></div>
        <h2 className="text-gold text-xl font-bold mb-2">جاري تحميل اللعبة...</h2>
        <p className="text-white/70 text-sm">استعد لصيد كنوز البحر!</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* زر العودة */}
      <button 
        className="fixed top-4 left-4 z-50 bg-black/60 p-2 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-black/80 transition-all"
        onClick={handleBack}
      >
        <ArrowLeft size={24} />
      </button>
      
      {/* زر كتم/تشغيل الصوت */}
      <button 
        className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-black/80 transition-all"
        onClick={toggleMute}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
      
      {/* مكون اللعبة */}
      <FishingGamePlaceholder />
    </div>
  );
}