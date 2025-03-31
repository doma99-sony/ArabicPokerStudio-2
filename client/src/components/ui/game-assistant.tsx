import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Info, Star } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

// قائمة بالنصائح التي ستظهر في نافذة المساعد
const TIPS = [
  {
    title: "مراقبة الخصوم",
    content: "احرص على متابعة أوراق الخصوم ومراقبة أنماط لعبهم لتتمكن من توقع حركاتهم."
  },
  {
    title: "اختيار الأوراق",
    content: "لا تلعب بكل يد تأتيك، تعلم اختيار أفضل الأوراق الابتدائية واترك الباقي."
  },
  {
    title: "قوة الأيدي",
    content: "تعلم قواعد القوة النسبية للأيدي في البوكر وتسلسلها من الرويال فلش إلى الورقة العالية."
  },
  {
    title: "إدارة المخاطر",
    content: "لا تبالغ في المخاطرة عندما تكون أوراقك متوسطة. حافظ على رصيدك للفرص المناسبة."
  },
  {
    title: "فن المراوغة",
    content: "استخدم خدعة المراوغة (Bluff) بحذر وفي الأوقات المناسبة فقط، ولا تبالغ في استخدامها."
  },
  {
    title: "إدارة الرقائق",
    content: "حافظ على مراقبة رصيدك من الرقائق، ولا تخاطر بأكثر من 10-15% من رصيدك في لعبة واحدة."
  },
  {
    title: "الصبر والتركيز",
    content: "كن صبوراً، البوكر لعبة تحتاج إلى الصبر والتركيز. الانتظار للفرصة المناسبة مهارة أساسية."
  },
  {
    title: "التخطيط الاستراتيجي",
    content: "خطط لكل جولة واتخذ قرارات استراتيجية بناءً على قوة يدك وحالة اللعبة وحركات المنافسين."
  },
  {
    title: "الانسحاب الذكي",
    content: "لا تخجل من الانسحاب إذا كانت أوراقك غير جيدة. الانسحاب في الوقت المناسب يحميك من خسائر كبيرة."
  },
  {
    title: "مزايا VIP",
    content: "استفد من مزايا VIP للحصول على مكافآت أكبر ورقائق إضافية يومية ومزايا حصرية."
  },
  {
    title: "وقت الراحة",
    content: "خذ استراحة قصيرة عندما تشعر بالتعب أو الإحباط، حيث تؤثر الحالة النفسية على أداءك في اللعب."
  },
  {
    title: "التحكم في المشاعر",
    content: "تعلم السيطرة على مشاعرك. لا تجعل غضبك أو حماسك يؤثر على قراراتك في اللعب."
  },
  {
    title: "قراءة الطاولة",
    content: "تعلم قراءة ديناميكيات الطاولة وأساليب لعب المنافسين. كل طاولة لها طبيعة مختلفة."
  },
  {
    title: "التنويع في الاستراتيجية",
    content: "غير استراتيجية لعبك من وقت لآخر حتى لا يتمكن الخصوم من توقع حركاتك."
  },
  {
    title: "المكافآت اليومية",
    content: "لا تنس تحصيل المكافآت اليومية وإكمال المهام للحصول على رقائق ومزايا إضافية."
  }
];

export function GameAssistant() {
  const [currentTip, setCurrentTip] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showBadge, setShowBadge] = useState<boolean>(true);
  const isMobile = useIsMobile();
  
  // تغيير النصيحة التالية
  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };
  
  // تغيير النصيحة السابقة
  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };
  
  // التنقل إلى نصيحة عشوائية
  const randomTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * TIPS.length);
    } while (newIndex === currentTip);
    setCurrentTip(newIndex);
  };
  
  // عند فتح النافذة
  const handleOpen = () => {
    setIsOpen(true);
    setShowBadge(false);
    
    // إعادة عرض الشارة بعد فترة زمنية
    setTimeout(() => {
      setShowBadge(true);
    }, 300000); // 5 دقائق
  };
  
  // عرض نصيحة عشوائية كل 60 ثانية عندما تكون النافذة مفتوحة
  useEffect(() => {
    let tipInterval: NodeJS.Timeout;
    
    if (isOpen) {
      tipInterval = setInterval(() => {
        nextTip();
      }, 60000);
    }
    
    return () => {
      if (tipInterval) clearInterval(tipInterval);
    };
  }, [isOpen]);
  
  return (
    <div className={`assistant-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <Dialog onOpenChange={(open) => {
        setIsOpen(open);
        if (open) handleOpen();
      }}>
        <DialogTrigger asChild>
          <button className="assistant-button" aria-label="فتح المساعد">
            <img 
              src="/assets/assistant/game-assistant.png" 
              alt="مساعد اللعبة" 
              className="assistant-image" 
            />
            {showBadge && (
              <span className="notification-badge">
                <Info size={12} />
              </span>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="assistant-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gold">
              نصائح احترافية للعبة البوكر
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              تصفح هذه النصائح لتحسين مهاراتك وزيادة فرص الفوز
            </DialogDescription>
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
                className="assistant-dialog-image w-24 h-24 object-contain rounded-full border-2 border-gold"
              />
            </div>
            <div className="tip-container p-6 bg-secondary/20 rounded-lg flex flex-col">
              <div className="flex items-center justify-center mb-2 gap-1">
                <Star className="h-4 w-4 text-gold" />
                <h3 className="tip-title text-lg font-bold text-gold">
                  {TIPS[currentTip].title}
                </h3>
                <Star className="h-4 w-4 text-gold" />
              </div>
              <p className="tip-text text-base text-center">
                {TIPS[currentTip].content}
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button 
                onClick={prevTip} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-gold/50 hover:bg-gold/10"
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentTip + 1} / {TIPS.length}
              </span>
              <Button 
                onClick={nextTip} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1 border-gold/50 hover:bg-gold/10"
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex justify-center">
              <Button 
                onClick={randomTip} 
                variant="secondary" 
                size="sm"
                className="text-xs"
              >
                نصيحة عشوائية
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