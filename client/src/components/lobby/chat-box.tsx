import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Image } from "@/components/ui/image";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar?: string;
  timestamp?: number; // إضافة طابع زمني لتتبع متى تم إرسال الرسالة
}

export function ChatBox() {
  const { user } = useAuth();
  const { registerHandler, sendMessage, socket } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // استرجاع الرسائل المخزنة من التخزين المحلي
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        
        // التحقق من صلاحية الرسائل (لا تزال خلال 24 ساعة)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return parsedMessages.filter((msg: ChatMessage & { timestamp?: number }) => 
          !msg.timestamp || msg.timestamp > oneDayAgo
        );
      } catch (e) {
        console.error("خطأ في استرجاع الرسائل المخزنة:", e);
        return [];
      }
    }
    return [];
  });
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // تحديث الرسائل عند استلام رسالة جديدة
  useEffect(() => {
    // استخدام نظام التسجيل الموحد للرسائل
    const unregister = registerHandler("chat_message", (data) => {
      const newMessage = {
        id: data.id,
        username: data.username,
        message: data.message,
        avatar: data.avatar,
        timestamp: Date.now() // إضافة طابع زمني للرسالة
      };
      
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        // حفظ الرسائل في التخزين المحلي
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    // تنظيف عند إزالة المكون
    return () => {
      unregister();
    };
  }, [registerHandler]);

  // التمرير التلقائي إلى آخر رسالة
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendChatMessage = () => {
    if (newMessage.trim() && user) {
      const timestamp = Date.now();
      const messageData = {
        type: "chat_message",
        message: newMessage.trim(),
        username: user.username,
        avatar: user.avatar,
        id: timestamp.toString(),  // استخدم معرف فريد
        timestamp: timestamp // طابع زمني للرسالة
      };
      sendMessage(messageData);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };
  
  // دالة لعرض الوقت المناسب للرسالة
  const getMessageTime = (timestamp?: number): string => {
    if (!timestamp) return "";
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    
    // إذا كانت الرسالة من نفس اليوم، نعرض الساعة فقط
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // وإلا نعرض التاريخ والوقت
    return messageDate.toLocaleString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-[400px] bg-black/50 rounded-lg border border-gold/10 overflow-hidden flex flex-col">
      <div className="bg-[#1B4D3E] p-3 flex items-center">
        <h3 className="text-white font-bold text-sm">الدردشة العامة</h3>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              {msg.username === "system" ? (
                // رسالة النظام (مثل الأخبار)
                <div className="flex justify-center my-1">
                  <div className="bg-black/30 text-gold/80 text-sm px-4 py-1 rounded-full border border-gold/20">
                    {msg.message}
                    {msg.timestamp && (
                      <span className="text-xs text-gold/40 mr-2">
                        {getMessageTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                // رسالة مستخدم عادية
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gold/20 border border-gold/30">
                      {msg.avatar ? (
                        <Image 
                          src={msg.avatar} 
                          alt={msg.username} 
                          className="w-full h-full object-cover"
                          fallback="https://via.placeholder.com/24?text=?"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold/70 text-xs">
                          {msg.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gold/60">{msg.username}</span>
                    {msg.timestamp && (
                      <span className="text-xs text-gold/40">
                        {getMessageTime(msg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className={`p-3 max-w-[80%] text-base ${
                    msg.username === user?.username
                      ? "bg-gold/90 text-black rounded-t-2xl rounded-l-2xl rounded-br-sm mr-auto border-2 border-[#D4AF37]"
                      : "bg-white/90 text-black rounded-t-2xl rounded-r-2xl rounded-bl-sm border-2 border-gold/60"
                  }`}>
                    {msg.message}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gold/10 bg-black/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 text-base h-10"
          />
          <Button
            onClick={sendChatMessage}
            className="bg-gold hover:bg-gold/80 text-black px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}