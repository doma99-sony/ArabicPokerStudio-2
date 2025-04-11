import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopPlayers } from "@/components/lobby/top-players";
import { Home, Gift, Users, Calendar, Shield, Clock, Heart } from "lucide-react";
import { GameIconSet } from "@/games/queen-of-egypt-3d/assets/egyptian-icons";

// نوع إعلان ترويجي
interface Announcement {
  id: number;
  title: string;
  content: string;
  icon: "gift" | "users" | "calendar" | "shield" | "clock" | "heart";
  date: string;
}

export function HomeLobby() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "عرض اليوم",
      content: "رقائق مجانية بقيمة 1000 عند إحالة صديق",
      icon: "gift",
      date: "اليوم"
    },
    {
      id: 2,
      title: "بطولة الأسبوع",
      content: "انضم إلى بطولة البوكر الكبرى يوم الجمعة",
      icon: "calendar",
      date: "2 أيام"
    },
    {
      id: 3,
      title: "تحديث النظام",
      content: "تم إضافة ميزات جديدة وتحسين الأداء",
      icon: "shield",
      date: "3 أيام"
    }
  ]);
  
  const [, navigate] = useLocation();

  // تصميم أيقونات الإعلانات
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "gift":
        return <Gift className="h-5 w-5 text-[#D4AF37]" />;
      case "users":
        return <Users className="h-5 w-5 text-[#D4AF37]" />;
      case "calendar":
        return <Calendar className="h-5 w-5 text-[#D4AF37]" />;
      case "shield":
        return <Shield className="h-5 w-5 text-[#D4AF37]" />;
      case "clock":
        return <Clock className="h-5 w-5 text-[#D4AF37]" />;
      case "heart":
        return <Heart className="h-5 w-5 text-[#D4AF37]" />;
      default:
        return <Home className="h-5 w-5 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* القسم الأيسر - أفضل اللاعبين والإعلانات */}
      <div className="md:col-span-1 space-y-4">
        {/* أفضل اللاعبين */}
        <TopPlayers />
        
        {/* إعلانات وأخبار */}
        <div className="bg-gradient-to-b from-[#0A3A2A]/90 to-black/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-lg p-4">
          <div className="flex items-center mb-4 border-b border-[#D4AF37]/20 pb-2">
            <GameIconSet.Ankh className="h-5 w-5 text-[#D4AF37] ml-2" />
            <h3 className="text-[#D4AF37] font-bold text-lg">الإعلانات والأخبار</h3>
          </div>
          
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="bg-black/20 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-all shadow-md">
                <div className="p-3">
                  <div className="flex items-center mb-2">
                    <div className="ml-2 bg-[#0A3A2A] p-1.5 rounded-full">
                      {renderIcon(announcement.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#D4AF37] font-bold text-sm">{announcement.title}</h4>
                      <span className="text-gray-400 text-xs">{announcement.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{announcement.content}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* القسم الأيمن - الألعاب المتاحة */}
      <div className="md:col-span-2">
        <div className="bg-gradient-to-b from-[#0A3A2A]/90 to-black/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-xl shadow-lg p-4 h-full">
          <div className="flex items-center mb-6 border-b border-[#D4AF37]/20 pb-2">
            <Home className="h-5 w-5 text-[#D4AF37] ml-2" />
            <h3 className="text-[#D4AF37] font-bold text-lg">الألعاب المتاحة</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* بوكر تكساس عرباوي */}
            <div className="relative group overflow-hidden rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/80 to-black group-hover:opacity-90 transition-opacity z-10"></div>
              <img src="/images/poker-game-bg.jpg" alt="بوكر تكساس عرباوي" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h4 className="text-[#D4AF37] font-bold text-lg mb-1">بوكر تكساس عرباوي</h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">استمتع بلعب البوكر التقليدي مع لمسة عربية فريدة وأجواء مميزة</p>
                <Button 
                  variant="outline" 
                  className="bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all w-full"
                  onClick={() => navigate("/poker-tables")}
                >
                  ابدأ اللعب
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-[#D4AF37]/80 text-black text-xs font-bold px-2 py-1 rounded-full z-20">
                متصل الآن: 24
              </div>
            </div>
            
            {/* صاروخ مصر */}
            <div className="relative group overflow-hidden rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/80 to-black group-hover:opacity-90 transition-opacity z-10"></div>
              <img src="/images/egypt-rocket-bg.jpg" alt="صاروخ مصر" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h4 className="text-[#D4AF37] font-bold text-lg mb-1">صاروخ مصر</h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">لعبة رهان مثيرة مع رسومات فريدة ومستوحاة من الحضارة المصرية القديمة</p>
                <Button 
                  variant="outline" 
                  className="bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all w-full"
                  onClick={() => navigate("/egypt-rocket")}
                >
                  ابدأ اللعب
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded-full z-20 animate-pulse">
                جديد
              </div>
            </div>
            
            {/* ملكة النيل - سلوتس */}
            <div className="relative group overflow-hidden rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/80 to-black group-hover:opacity-90 transition-opacity z-10"></div>
              <img src="/images/queen-of-egypt-bg.jpg" alt="ملكة النيل - سلوتس" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h4 className="text-[#D4AF37] font-bold text-lg mb-1">ملكة النيل - سلوتس</h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">لعبة سلوتس بتصميم فرعوني رائع مع فرص للفوز بجوائز كبيرة</p>
                <Button 
                  variant="outline" 
                  className="bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all w-full"
                  onClick={() => navigate("/queen-of-egypt")}
                >
                  ابدأ اللعب
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                شائع
              </div>
            </div>
            
            {/* دومينو - قريباً */}
            <div className="relative group overflow-hidden rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/80 to-black group-hover:opacity-90 transition-opacity z-10"></div>
              <img src="/images/domino-bg.jpg" alt="دومينو" className="w-full h-48 object-cover filter grayscale group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/50 z-10"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                <h4 className="text-gray-400 font-bold text-lg mb-1">دومينو</h4>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">قريباً - لعبة الدومينو التقليدية مع قواعد متنوعة</p>
                <Button 
                  variant="outline" 
                  className="bg-gray-800/50 border-gray-600 text-gray-400 cursor-not-allowed w-full"
                  disabled
                >
                  قريباً
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-gray-500/80 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                قريباً
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}