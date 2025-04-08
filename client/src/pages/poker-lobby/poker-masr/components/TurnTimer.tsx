import React, { useState, useEffect } from 'react';

interface TurnTimerProps {
  duration: number; // المدة بالثواني
  isActive: boolean; // هل المؤقت نشط؟
  onTimeout: () => void; // دالة يتم استدعاؤها عند انتهاء الوقت
}

/**
 * مكون مؤقت دور اللاعب
 * يعرض مؤقت عد تنازلي لدور اللاعب الحالي
 */
const TurnTimer: React.FC<TurnTimerProps> = ({ 
  duration = 10, 
  isActive = false, 
  onTimeout 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  // إعادة ضبط المؤقت عند تغيير حالة النشاط
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [isActive, duration]);
  
  // تحديث العد التنازلي كل ثانية
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // انتهاء الوقت
      setIsRunning(false);
      onTimeout();
    }
    
    // تنظيف المؤقت عند إلغاء التركيب
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isRunning, timeLeft, onTimeout]);
  
  // حساب نسبة الوقت المتبقي
  const progressPercent = (timeLeft / duration) * 100;
  
  // تحديد لون المؤقت بناءً على الوقت المتبقي
  const getTimerColor = () => {
    if (timeLeft <= 3) return 'bg-red-500';
    if (timeLeft <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // إذا لم يكن المؤقت نشطًا، لا تعرض شيئًا
  if (!isActive) {
    return null;
  }
  
  return (
    <div className="turn-timer flex flex-col items-center mt-1">
      <div className="progress-bar w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getTimerColor()} transition-all duration-200 ease-linear`} 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={`time-display text-xs font-bold mt-1 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
        {timeLeft}s
      </div>
    </div>
  );
};

export default TurnTimer;