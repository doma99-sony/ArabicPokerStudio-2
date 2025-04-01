import { useEffect, useRef } from "react";
import { useNotifications } from "@/components/ui/notifications-system";

/**
 * مكون لعرض الرسائل الترحيبية الدورية
 * يستخدم نظام الإشعارات المركزي
 */
export function WelcomeMessageNotification() {
  const { addNotification } = useNotifications();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // قائمة الرسائل الترحيبية
  const welcomeMessages = [
    {
      title: "مرحبًا بك في بوكر ستارز!",
      content: "استمتع بألعاب البوكر المثيرة وتنافس مع أفضل اللاعبين. إذا كنت جديدًا، يمكنك الاطلاع على دليل المبتدئين واستكشاف الطاولات المختلفة.",
      type: "system" as const
    },
    {
      title: "عرض خاص لهذا الأسبوع!",
      content: "احصل على 1000 رقاقة إضافية عند تسجيل الدخول لمدة 3 أيام متتالية. استفد من العرض الآن واستمتع بالمزيد من اللعب!",
      type: "reward" as const
    },
    {
      title: "بطولة الفائزين قادمة!",
      content: "انضم إلى بطولة الفائزين الأسبوعية يوم الجمعة القادم. الجائزة الكبرى 10000 رقاقة! سجل الآن واستعد للمنافسة.",
      type: "game" as const
    },
    {
      title: "تحديثات جديدة للعبة الدومينو!",
      content: "أضفنا تحديثات جديدة للعبة الدومينو، جرب الآن طاولات اللعب الجديدة وشارك أصدقاءك في التجربة!",
      type: "game" as const
    },
    {
      title: "ارتقِ في التصنيفات!",
      content: "حان الوقت للتقدم في تصنيفات اللاعبين! العب المزيد من المباريات واربح للوصول إلى المراكز المتقدمة واحصل على مكافآت خاصة.",
      type: "vip" as const
    }
  ];

  // إضافة إشعار ترحيبي جديد
  const createNewMessage = () => {
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    const message = welcomeMessages[randomIndex];
    
    addNotification({
      title: message.title,
      content: message.content,
      type: message.type
    });
  };

  // إعداد المؤقت لإرسال رسائل كل 3 دقائق
  useEffect(() => {
    // إضافة رسالة ترحيبية فورية عند بدء التشغيل
    createNewMessage();
    
    // إعداد المؤقت لإرسال رسالة كل 3 دقائق
    timerRef.current = setInterval(() => {
      createNewMessage();
    }, 3 * 60 * 1000); // 3 دقائق
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // لا يحتاج إلى واجهة مستخدم خاصة به لأنه يستخدم نظام الإشعارات المركزي
  return null;
}