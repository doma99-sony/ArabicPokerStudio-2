/**
 * صفحة لعبة صياد السمك (Big Bass Bonanza)
 * تعرض اللعبة الرئيسية مع الواجهة المتكاملة
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { LOGO_IMAGE, BACKGROUND_IMAGE } from '@/games/fishing-slots/assets/images';
import '@/games/fishing-slots/assets/fishing-slots.css';

// استيراد المكونات
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ui/error-display';
import { BackButton } from '@/components/navigation/back-button';

const FishingSlotsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // تحميل أصول اللعبة ومعلومات اللاعب
    const loadGameAssets = async () => {
      try {
        setIsLoading(true);
        
        // محاكاة وقت التحميل للأصول الرسومية والصوتية
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // التحقق من رصيد اللاعب
        if (!user || user.chips < 100) {
          toast({
            title: "رصيد غير كافي",
            description: "يجب أن يكون لديك على الأقل 100 رقاقة للعب.",
            variant: "destructive"
          });
          setError("الرصيد غير كافٍ للعب. يجب أن يكون لديك على الأقل 100 رقاقة.");
        }
      } catch (err) {
        console.error("خطأ في تحميل اللعبة:", err);
        setError("حدث خطأ أثناء تحميل اللعبة. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGameAssets();
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700">
        <img 
          src={LOGO_IMAGE} 
          alt="شعار صياد السمك" 
          className="mb-8 w-64 h-auto"
        />
        <Loading variant="centered" text="جاري تحميل اللعبة..." />
        <p className="mt-4 text-white text-xl font-bold">جاري تحميل لعبة صياد السمك...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex flex-col items-center justify-center p-4">
        <ErrorDisplay
          title="غير قادر على بدء اللعبة"
          message={error}
          action={
            <div className="flex flex-col space-y-2 mt-4 w-full">
              <BackButton
                label="العودة للصفحة الرئيسية"
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              />
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                إعادة المحاولة
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="fishing-slots-game">
      {/* خلفية اللعبة */}
      <img 
        src={BACKGROUND_IMAGE} 
        alt="خلفية البحر" 
        className="fishing-game-background"
      />
      
      {/* رأس اللعبة */}
      <div className="fishing-header">
        <BackButton 
          label="العودة للصفحة الرئيسية" 
          href="/"
          className="bg-[#01447a] border-[#0277bd] text-white hover:bg-[#025a9e]"
        />
        
        <img 
          src={LOGO_IMAGE} 
          alt="شعار صياد السمك" 
          className="game-logo"
        />
        
        <div className="balance-display">
          <div className="balance-value">{user?.chips.toLocaleString()}</div>
        </div>
      </div>
      
      {/* حاوية اللعبة الرئيسية */}
      <div className="flex justify-center items-center flex-grow">
        <div className="p-8 bg-[#012c44] rounded-xl border-4 border-[#0277bd] shadow-2xl text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">صياد السمك</h2>
          <p className="text-white text-xl mb-8">لعبة السلوت الأكثر إثارة بتصميم Big Bass Bonanza!</p>
          
          <div className="flex flex-col items-center p-4 bg-[#011a29] rounded-lg mb-8">
            <div className="text-white mb-2">ميزات اللعبة:</div>
            <ul className="text-white text-right mb-4">
              <li className="mb-2">• رموز سمك ذات قيم نقدية متغيرة</li>
              <li className="mb-2">• رمز الصياد يجمع قيم الأسماك</li>
              <li className="mb-2">• لفات مجانية مع 3 صناديق طعم</li>
              <li>• مضاعفات x2, x3, و x10 بجمع الصيادين</li>
            </ul>
          </div>
          
          <Button
            className="bg-[#f5af19] hover:bg-[#f7be36] text-[#012c44] font-bold text-lg py-6 px-12 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            ابدأ اللعب الآن!
          </Button>
        </div>
      </div>
      
      {/* التذييل مع الإعدادات */}
      <div className="controls-container">
        <div className="text-white opacity-70 text-sm">
          تطوير بواسطة Replit © 2025 | جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
};

export default FishingSlotsPage;