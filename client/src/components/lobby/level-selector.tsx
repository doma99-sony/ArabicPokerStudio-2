import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// تعريف نوع للمستوى
type GameLevel = {
  id: string;
  name: string;
  chips: number;
  color: string;
  game: string;
};

// تعريف مستويات اللعب والمبلغ المطلوب لكل مستوى
const pokerLevels = [
  { id: "noob", name: "نوب", chips: 20000, color: "bg-green-600", game: "poker" },
  { id: "beginner", name: "لسه بتعلم", chips: 100000, color: "bg-blue-600", game: "poker" },
  { id: "pro", name: "محترف", chips: 500000, color: "bg-purple-600", game: "poker" },
  { id: "expert", name: "الفاجر", chips: 10000000, color: "bg-red-600", game: "poker" }
];

// تعريف الألعاب الأخرى المتاحة
const otherGames = [
  { id: "naruto", name: "ناروتو", chips: 5000, color: "bg-orange-500", game: "naruto" }
];

export function LevelSelector() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // دالة للتحقق مما إذا كان المستخدم يملك الرصيد الكافي للعب في مستوى معين
  const canPlayLevel = (requiredChips: number) => {
    if (!user) return false;
    return user.chips >= requiredChips;
  };

  // عند اختيار مستوى معين
  const selectLevel = (levelId: string) => {
    setSelectedLevel(levelId);
  };

  // عند الضغط على زر "ابدأ اللعب"
  const startGame = () => {
    if (!selectedLevel) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار مستوى اللعب أولاً",
        variant: "destructive",
      });
      return;
    }

    // البحث عن المستوى في مستويات البوكر أو الألعاب الأخرى
    const level = [...pokerLevels, ...otherGames].find(level => level.id === selectedLevel);
    if (!level) return;

    if (!canPlayLevel(level.chips)) {
      toast({
        title: "رصيد غير كافي",
        description: `تحتاج إلى ${level.chips.toLocaleString()} رقاقة على الأقل للعب في هذا المستوى`,
        variant: "destructive",
      });
      return;
    }

    // توجيه اللاعب إلى صفحة اللعبة المناسبة مع المستوى المختار
    if (level.game === "poker") {
      navigate(`/poker/${selectedLevel}`);
    } else if (level.game === "naruto") {
      navigate(`/naruto/${selectedLevel}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-gold">اختر مستوى اللعب</h2>
      
      <h3 className="text-xl font-bold text-gold mb-4 self-start">البوكر</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        {pokerLevels.map((level) => {
          const isAffordable = canPlayLevel(level.chips);
          
          return (
            <Card 
              key={level.id}
              className={`p-5 border-2 transition-all cursor-pointer hover:shadow-xl
                ${selectedLevel === level.id ? 'border-gold' : 'border-gray-600'}
                ${isAffordable ? 'opacity-100' : 'opacity-50'}
              `}
              onClick={() => isAffordable && selectLevel(level.id)}
            >
              <div className={`${level.color} w-16 h-16 rounded-full mb-4 flex items-center justify-center mx-auto`}>
                <span className="text-white text-2xl font-bold">{level.name[0]}</span>
              </div>
              
              <h3 className="text-xl font-bold text-center text-white mb-2">{level.name}</h3>
              
              <div className="text-center mb-3">
                <span className="text-gold font-bold">{level.chips.toLocaleString()}</span>
                <span className="text-gray-300 text-sm mr-1">رقاقة</span>
              </div>
              
              {!isAffordable && (
                <div className="text-red-500 text-xs text-center">
                  رصيدك غير كافٍ، تحتاج {(level.chips - (user?.chips || 0)).toLocaleString()} رقاقة إضافية
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      <h3 className="text-xl font-bold text-gold mb-4 self-start">ألعاب أخرى</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        {otherGames.map((level) => {
          const isAffordable = canPlayLevel(level.chips);
          
          return (
            <Card 
              key={level.id}
              className={`p-5 border-2 transition-all cursor-pointer hover:shadow-xl
                ${selectedLevel === level.id ? 'border-gold' : 'border-gray-600'}
                ${isAffordable ? 'opacity-100' : 'opacity-50'}
              `}
              onClick={() => isAffordable && selectLevel(level.id)}
            >
              <div className={`${level.color} w-16 h-16 rounded-full mb-4 flex items-center justify-center mx-auto`}>
                <span className="text-white text-2xl font-bold">{level.name[0]}</span>
              </div>
              
              <h3 className="text-xl font-bold text-center text-white mb-2">{level.name}</h3>
              
              <div className="text-center mb-3">
                <span className="text-gold font-bold">{level.chips.toLocaleString()}</span>
                <span className="text-gray-300 text-sm mr-1">رقاقة</span>
              </div>
              
              {!isAffordable && (
                <div className="text-red-500 text-xs text-center">
                  رصيدك غير كافٍ، تحتاج {(level.chips - (user?.chips || 0)).toLocaleString()} رقاقة إضافية
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={startGame}
          disabled={!selectedLevel}
          className="bg-gold hover:bg-gold/80 text-black font-bold px-8 py-2 rounded-lg shadow-lg"
        >
          ابدأ اللعب
        </Button>
      </div>
    </div>
  );
}