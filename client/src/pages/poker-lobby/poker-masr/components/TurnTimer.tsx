import React, { useState, useEffect } from 'react';
import { usePokerStore } from '../store/poker-store';
import { PlayerAction } from '../logic/poker-engine';

interface TurnTimerProps {
  isCurrentTurn: boolean; // هل الدور الحالي للاعب؟
  playerId: number; // معرف اللاعب صاحب المؤقت
  duration?: number; // مدة التوقيت بالثواني (الافتراضي: 10 ثوان)
  onTimeout?: () => void; // وظيفة تنفذ عند انتهاء الوقت
}

/**
 * مكون مؤقت دور اللاعب في البوكر
 * يعرض عداد تنازلي لمدة الدور ويطوي الأوراق تلقائياً عند انتهاء الوقت
 */
const TurnTimer: React.FC<TurnTimerProps> = ({
  isCurrentTurn,
  playerId,
  duration = 10, // 10 ثوان كمدة افتراضية للدور
  onTimeout
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const { performAction, localPlayerId } = usePokerStore();
  
  // تشغيل المؤقت عندما يكون دور اللاعب
  useEffect(() => {
    // إعادة تعيين المؤقت عند تغيير دور اللاعب
    if (isCurrentTurn) {
      setTimeLeft(duration);
      
      // بدء العد التنازلي
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            
            // إذا انتهى الوقت وكان هذا اللاعب المحلي، نفذ إجراء الطي تلقائياً
            if (playerId === localPlayerId) {
              console.log('انتهى وقت اللاعب المحلي، تنفيذ طي تلقائي');
              performAction(PlayerAction.FOLD);
            }
            
            // استدعاء وظيفة انتهاء الوقت إذا تم تمريرها
            if (onTimeout) {
              onTimeout();
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // تنظيف المؤقت عند تفكيك المكون أو تغيير الحالة
      return () => clearInterval(timer);
    }
  }, [isCurrentTurn, duration, playerId, localPlayerId, performAction, onTimeout]);
  
  // إذا لم يكن دور اللاعب، لا تعرض المؤقت
  if (!isCurrentTurn) {
    return null;
  }
  
  // حساب نسبة الوقت المتبقي لعرض الحلقة التقدمية
  const progressPercentage = (timeLeft / duration) * 100;
  
  // تحديد لون الحلقة بناءً على الوقت المتبقي
  let progressColor = 'bg-green-500';
  if (timeLeft <= duration * 0.3) {
    progressColor = 'bg-red-500'; // أحمر عند 30% أو أقل من الوقت المتبقي
  } else if (timeLeft <= duration * 0.6) {
    progressColor = 'bg-yellow-500'; // أصفر عند 60% أو أقل من الوقت المتبقي
  }
  
  return (
    <div className="turn-timer-container absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none">
      <div className="turn-timer flex items-center justify-center w-16 h-16 relative">
        {/* دائرة تقدم الوقت */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* دائرة خلفية */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="10"
          />
          
          {/* دائرة التقدم - تتناقص مع مرور الوقت */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={progressColor.replace('bg-', 'text-')}
            strokeWidth="10"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progressPercentage) / 100}
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* عرض الوقت المتبقي */}
        <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${progressColor.replace('bg-', 'text-')}`}>
          {timeLeft}
        </div>
      </div>
    </div>
  );
};

export default TurnTimer;