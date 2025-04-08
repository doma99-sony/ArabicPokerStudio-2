import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ChevronLeft, User, Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

/**
 * بوكر مصر - الصفحة الرئيسية
 * الصفحة الرئيسية للعبة بوكر مصر التي تعرض غرف اللعب المختلفة
 */
export default function PokerMasrLobby() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // أنواع غرف البوكر
  const pokerRooms = [
    {
      id: 'texas-holdem',
      title: 'بوكر تكساس هولديم',
      description: 'لعبة البوكر الأكثر شعبية عالمياً بنكهة عربية',
      players: 532,
      tables: 24,
      minBet: 5000,
      maxBet: 100000,
      imgSrc: '/images/egyptian-poker-bg.jpg',
      isHot: true
    },
    {
      id: 'mecca-poker',
      title: 'مكة بوكر',
      description: 'مغامرات بوكر فريدة مستوحاة من التراث العربي',
      players: 345,
      tables: 18,
      minBet: 10000,
      maxBet: 250000,
      imgSrc: '/images/egyptian-poker-bg.jpg',
      isVIP: true
    },
    {
      id: 'turkish-classic',
      title: 'بوكر تركي كلاسيك',
      description: 'تجربة البوكر العثمانية الأصيلة',
      players: 278,
      tables: 15,
      minBet: 3000,
      maxBet: 80000,
      imgSrc: '/images/egyptian-poker-bg.jpg',
      isNew: true
    }
  ];
  
  const handleRoomSelect = (roomId: string) => {
    // التوجيه إلى صفحة الغرفة المطلوبة
    navigate(`/poker-lobby/poker-masr/${roomId}`);
  };
  
  return (
    <div className="poker-masr-lobby min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
      {/* الهيدر */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src="/images/egyptian-poker-bg.jpg" 
          alt="بوكر مصر" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-white mb-2">بوكر مصر</h1>
          <p className="text-lg text-white/80">أفضل تجربة للعب البوكر بنكهة عربية</p>
        </div>
        
        {/* زر العودة */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white/80 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      {/* قسم الغرف */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#D4AF37]/30 pb-2">
          <span className="text-[#D4AF37]">ألعاب</span> البوكر
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pokerRooms.map(room => (
            <Card 
              key={room.id}
              className="overflow-hidden group border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 transition-all duration-300 bg-black/60 backdrop-blur-sm"
              onClick={() => handleRoomSelect(room.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={room.imgSrc} 
                  alt={room.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                
                {/* شارات الحالة */}
                <div className="absolute top-3 left-3 flex gap-2 rtl:flex-row-reverse">
                  {room.isHot && (
                    <span className="bg-red-500 text-white text-xs uppercase font-bold px-2 py-1 rounded">الأكثر شعبية</span>
                  )}
                  {room.isNew && (
                    <span className="bg-green-500 text-white text-xs uppercase font-bold px-2 py-1 rounded">جديد</span>
                  )}
                  {room.isVIP && (
                    <span className="bg-[#D4AF37] text-black text-xs uppercase font-bold px-2 py-1 rounded">VIP</span>
                  )}
                </div>
                
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex items-center bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      <User size={12} className="mr-1" />
                      <span>{room.players.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      <Users size={12} className="mr-1" />
                      <span>{room.tables} طاولة</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {room.title}
                </h3>
                <p className="text-white/70 text-sm mt-1 mb-3">
                  {room.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-white/80">
                    <span className="flex items-center">
                      <DollarSign size={14} className="mr-1 text-[#D4AF37]" />
                      <span className="text-[#D4AF37]">{room.minBet.toLocaleString()}</span>
                      <span className="mx-1">-</span>
                      <span className="text-[#D4AF37]">{room.maxBet.toLocaleString()}</span>
                    </span>
                  </div>
                  
                  <button className="bg-gradient-to-r from-[#D4AF37] to-[#FFC800] px-3 py-1 rounded-full text-black text-sm font-bold flex items-center">
                    ادخل الآن
                    <ChevronLeft size={16} className="mr-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}