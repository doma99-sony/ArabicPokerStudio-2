import { useState, useEffect } from "react";
import { useGlobalWebSocket } from "@/hooks/use-global-websocket";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionIndicator({ className }: { className?: string }) {
  const { isConnected } = useGlobalWebSocket();
  const [visible, setVisible] = useState(false);
  
  // عرض المؤشر فقط عندما تتغير حالة الاتصال أو يكون غير متصل
  useEffect(() => {
    // إذا لم يكن متصلاً، أظهر المؤشر فوراً
    if (!isConnected) {
      setVisible(true);
    } else {
      // عند الاتصال، أظهر المؤشر لبضع ثوانٍ ثم أخفيه
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000); // يظهر لمدة ثانيتين ثم يختفي
      
      return () => clearTimeout(timer);
    }
  }, [isConnected]);
  
  if (!visible) return null;
  
  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300",
      isConnected 
        ? "bg-green-600/80 text-white" 
        : "bg-red-600/80 text-white",
      className
    )}>
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-xs font-medium">متصل</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-xs font-medium">غير متصل</span>
        </>
      )}
    </div>
  );
}

export default ConnectionIndicator;