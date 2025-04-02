import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { User, Users } from "lucide-react";

/**
 * مكون للعداد المستخدمين المتصلين عبر الويب سوكيت
 */
export function OnlineUsersCounter() {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const { registerMessageHandler: registerHandler, status } = useWebSocket();

  useEffect(() => {
    // تسجيل للاستماع إلى تحديثات عدد المستخدمين
    const unregister = registerHandler("online_users_count", (data: { count: number }) => {
      setOnlineUsers(data.count);
    });

    return () => unregister();
  }, [registerHandler]);

  return (
    <div className="flex items-center bg-black/30 text-white rounded-full px-3 py-1 text-xs border border-[#D4AF37]/30">
      <Users className="h-4 w-4 text-[#D4AF37] ml-2" />
      <div className="flex flex-col items-start">
        <span>المستخدمين المتصلين</span>
        <span className="font-bold text-[#D4AF37]">{onlineUsers}</span>
      </div>
      <div className={`w-2 h-2 rounded-full mr-2 ml-2 ${
        status === 'open' ? 'bg-green-500' : 'bg-red-500'
      }`} />
    </div>
  );
}