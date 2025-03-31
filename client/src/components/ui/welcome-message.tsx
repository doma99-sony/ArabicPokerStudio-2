import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeMessage {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  read: boolean;
}

/**
 * مكون لعرض الرسائل الترحيبية الدورية
 */
export function WelcomeMessageNotification() {
  const [messages, setMessages] = useState<WelcomeMessage[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<WelcomeMessage | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, navigate] = useLocation();

  // قائمة الرسائل الترحيبية
  const welcomeMessages: Omit<WelcomeMessage, 'id' | 'timestamp' | 'read'>[] = [
    {
      title: "مرحبًا بك في بوكر ستارز!",
      content: "استمتع بألعاب البوكر المثيرة وتنافس مع أفضل اللاعبين. إذا كنت جديدًا، يمكنك الاطلاع على دليل المبتدئين واستكشاف الطاولات المختلفة."
    },
    {
      title: "عرض خاص لهذا الأسبوع!",
      content: "احصل على 1000 رقاقة إضافية عند تسجيل الدخول لمدة 3 أيام متتالية. استفد من العرض الآن واستمتع بالمزيد من اللعب!"
    },
    {
      title: "بطولة الفائزين قادمة!",
      content: "انضم إلى بطولة الفائزين الأسبوعية يوم الجمعة القادم. الجائزة الكبرى 10000 رقاقة! سجل الآن واستعد للمنافسة."
    },
    {
      title: "تحديثات جديدة للعبة الدومينو!",
      content: "أضفنا تحديثات جديدة للعبة الدومينو، جرب الآن طاولات اللعب الجديدة وشارك أصدقاءك في التجربة!"
    },
    {
      title: "ارتقِ في التصنيفات!",
      content: "حان الوقت للتقدم في تصنيفات اللاعبين! العب المزيد من المباريات واربح للوصول إلى المراكز المتقدمة واحصل على مكافآت خاصة."
    }
  ];

  // إنشاء رسالة ترحيبية جديدة
  const createNewMessage = () => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    const newMessage: WelcomeMessage = {
      id: `msg_${Date.now()}`,
      title: welcomeMessages[randomIndex].title,
      content: welcomeMessages[randomIndex].content,
      timestamp: Date.now(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setShowNotification(true);
    startBlinking();
  };

  // بدء تأثير الوميض
  const startBlinking = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }
    
    blinkIntervalRef.current = setInterval(() => {
      setBlinking(prevState => !prevState);
    }, 500); // تبديل كل نصف ثانية
  };

  // إيقاف تأثير الوميض
  const stopBlinking = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    setBlinking(false);
  };

  // فتح الرسالة
  const openMessage = (message: WelcomeMessage) => {
    setSelectedMessage(message);
    setOpenDialog(true);
    stopBlinking();
  };

  // وضع علامة "مقروءة" على الرسالة
  const markAsRead = () => {
    if (selectedMessage) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === selectedMessage.id 
            ? { ...msg, read: true } 
            : msg
        )
      );
      setOpenDialog(false);
      setShowNotification(false);
    }
  };

  // التنقل إلى صفحة الإشعارات
  const navigateToNotificationsPage = () => {
    if (selectedMessage) {
      // يمكن إنشاء صفحة مخصصة للإشعارات لاحقاً
      navigate(`/notifications/${selectedMessage.id}`);
      setOpenDialog(false);
    }
  };

  // إعداد المؤقت لإرسال رسائل كل 3 دقائق
  useEffect(() => {
    // إنشاء رسالة فورية عند بدء التشغيل
    createNewMessage();
    
    // إعداد المؤقت لإرسال رسالة كل 3 دقائق
    timerRef.current = setInterval(() => {
      createNewMessage();
    }, 3 * 60 * 1000); // 3 دقائق
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopBlinking();
    };
  }, []);

  // عرض زر الإشعارات فقط إذا كانت هناك رسائل غير مقروءة
  const hasUnreadMessages = messages.some(msg => !msg.read);

  // الحصول على أحدث رسالة غير مقروءة
  const latestUnreadMessage = messages.filter(msg => !msg.read).slice(-1)[0];

  return (
    <>
      {showNotification && hasUnreadMessages && (
        <div 
          className={`fixed left-4 top-16 cursor-pointer flex items-center gap-2 bg-black/70 p-2 rounded-lg border-2 transition-all duration-300 ${blinking ? 'border-[#FFD700] text-[#FFD700]' : 'border-[#D4AF37]/50 text-white'}`}
          onClick={() => latestUnreadMessage && openMessage(latestUnreadMessage)}
        >
          <Bell className={`h-5 w-5 ${blinking ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`} />
          <div className="overflow-hidden text-sm">
            <p className="font-bold truncate" style={{maxWidth: '200px'}}>{latestUnreadMessage?.title}</p>
            <p className="text-xs opacity-80 truncate" style={{maxWidth: '200px'}}>رسالة جديدة! انقر للعرض</p>
          </div>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-b from-black to-[#1a1708] border-[#D4AF37]/30 text-white">
          <DialogHeader>
            <DialogTitle className={`text-center text-xl font-bold transition-colors duration-300 ${blinking ? 'text-[#FFD700]' : 'text-[#D4AF37]'}`}>
              {selectedMessage?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-md leading-relaxed">{selectedMessage?.content}</p>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              className="bg-transparent border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20"
              onClick={navigateToNotificationsPage}
            >
              عرض كل الإشعارات
            </Button>
            <Button 
              className="bg-[#D4AF37] text-black hover:bg-[#FFD700]"
              onClick={markAsRead}
            >
              تم قراءة الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}