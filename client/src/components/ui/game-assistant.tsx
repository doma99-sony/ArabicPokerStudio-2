import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

// قائمة بالنصائح التي ستظهر في نافذة المساعد
const TIPS = [
  "احرص على متابعة أوراق الخصوم ومراقبة أنماط لعبهم.",
  "لا تلعب بكل يد تأتيك، اختر أفضل الأوراق واترك الباقي.",
  "تعلم قواعد القوة النسبية للأيدي في البوكر.",
  "لا تبالغ في المخاطرة عندما تكون أوراقك متوسطة.",
  "استخدم خدعة المراوغة (Bluff) بحذر وفي الأوقات المناسبة فقط.",
  "حافظ على مراقبة رصيدك من الرقائق.",
  "كن صبوراً، البوكر لعبة تحتاج إلى الصبر والتركيز.",
  "خطط لكل جولة واتخذ قرارات استراتيجية.",
  "لا تخجل من الانسحاب إذا كانت أوراقك غير جيدة.",
  "استفد من مزايا VIP للحصول على مكافآت أكبر."
];

export function GameAssistant() {
  const [currentTip, setCurrentTip] = useState<number>(0);
  const isMobile = useIsMobile();
  
  // تغيير النصيحة التالية
  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };
  
  // تغيير النصيحة السابقة
  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };
  
  return (
    <div className={`assistant-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <Dialog>
        <DialogTrigger asChild>
          <button className="assistant-button" aria-label="فتح المساعد">
            <img 
              src="/assets/assistant/game-assistant.png" 
              alt="مساعد اللعبة" 
              className="assistant-image" 
            />
          </button>
        </DialogTrigger>
        <DialogContent className="assistant-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">نصائح احترافية للعبة البوكر</DialogTitle>
            <DialogClose className="absolute left-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">إغلاق</span>
            </DialogClose>
          </DialogHeader>
          <div className="assistant-content">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/assets/assistant/game-assistant.png" 
                alt="مساعد اللعبة" 
                className="assistant-dialog-image w-24 h-24 object-contain"
              />
            </div>
            <div className="tip-container p-4 bg-secondary/20 rounded-lg">
              <p className="tip-text text-lg text-center">
                {TIPS[currentTip]}
              </p>
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={prevTip} variant="outline" size="sm">
                السابق
              </Button>
              <Button onClick={nextTip} variant="outline" size="sm">
                التالي
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// تصدير الأنماط التي يمكن استخدامها عالمياً
export const gameAssistantStyles = `
  .assistant-container {
    position: fixed;
    z-index: 50;
  }
  
  .assistant-container.desktop {
    left: 20px;
    bottom: 20px;
  }
  
  .assistant-container.mobile {
    left: 10px;
    bottom: 70px;
  }
  
  .assistant-button {
    background: none;
    border: none;
    cursor: pointer;
    transition: transform 0.3s ease;
    outline: none;
    position: relative;
  }
  
  .assistant-button:hover {
    transform: scale(1.05);
  }
  
  .assistant-button:active {
    transform: scale(0.95);
  }
  
  .assistant-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .assistant-dialog {
    direction: rtl;
  }
  
  .tip-container {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 640px) {
    .assistant-image {
      width: 60px;
      height: 60px;
    }
  }
`;