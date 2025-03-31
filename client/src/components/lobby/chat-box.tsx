import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Image } from "@/components/ui/image";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [messageCount, setMessageCount] = useState(() => {
    // استرجاع عدد الرسائل اليومية من التخزين المحلي
    try {
      const today = new Date().toDateString();
      const storedData = localStorage.getItem('messageCount');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === today) {
          return parsedData.count;
        }
      }
      return 0; // بداية يوم جديد
    } catch (e) {
      return 0;
    }
  });

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
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // تحديث الرسائل عند استلام رسالة جديدة
  useEffect(() => {
    // استخدام نظام التسجيل الموحد للرسائل
    const unregister = registerHandler("chat_message", (data) => {
      const newMessage = {
        id: data.id || Date.now().toString(),
        username: data.username,
        message: data.message,
        avatar: data.avatar,
        timestamp: data.timestamp || Date.now() // إضافة طابع زمني للرسالة
      };

      setMessages(prev => {
        // التحقق مما إذا كانت الرسالة موجودة بالفعل (لتجنب التكرار)
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          return prev; // عدم إضافة رسالة مكررة
        }

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

  // إغلاق منتقي الإيموجي عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.emoji-toggle-button')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // إضافة إيموجي إلى الرسالة
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // حفظ عدد الرسائل المرسلة
  const updateMessageCount = () => {
    const today = new Date().toDateString();
    const newCount = messageCount + 1;
    localStorage.setItem('messageCount', JSON.stringify({
      date: today,
      count: newCount
    }));
    setMessageCount(newCount);
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && user) {
      // التحقق من عدد الرسائل المرسلة
      if (messageCount >= 100) {
        // إضافة رسالة نظام للمستخدم فقط
        setMessages(prev => {
          const systemMessage: ChatMessage = {
            id: Date.now().toString(),
            username: "system",
            message: "لقد وصلت إلى الحد الأقصى للرسائل اليومية (100 رسالة)",
            timestamp: Date.now()
          };

          const updatedMessages = [...prev, systemMessage];
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
        return;
      }

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

      // تحديث عدد الرسائل
      updateMessageCount();
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

  // تبديل حالة توسيع/تصغير المربع
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full h-full bg-black/70 border-r border-[#D4AF37] overflow-hidden flex flex-col">
      <div className="bg-[#0A3A2A] p-2 flex items-center justify-between border-b border-[#D4AF37]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
          <h3 className="text-[#D4AF37] font-bold text-sm">الدردشة العامة</h3>

          <div className="flex items-center mr-2 text-xs text-white">
            <span>({messages.length} رسالة)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 h-[300px]"> {/* Reduced height */}
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col mb-2">
                {msg.username === "system" ? (
                  // رسالة النظام (مثل الأخبار)
                  <div className="flex justify-center my-1">
                    <div className="bg-[#0A3A2A] text-white text-xs px-3 py-1 rounded-md 
                                  border border-[#D4AF37] max-w-[90%]">
                      <div className="flex items-center gap-1 justify-center">
                        <MessageSquare className="h-3 w-3 text-[#D4AF37]" />
                        <span className="text-[#D4AF37] font-medium">{msg.message}</span>
                        {msg.timestamp && (
                          <span className="text-xs text-gray-400 mr-1">
                            {getMessageTime(msg.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // رسالة مستخدم عادية
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#0A3A2A] border border-[#D4AF37]">
                        {msg.avatar ? (
                          <Image 
                            src={msg.avatar} 
                            alt={msg.username} 
                            className="w-full h-full object-cover"
                            fallback="https://via.placeholder.com/24?text=?"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#D4AF37] text-xs">
                            {msg.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-[#D4AF37] font-bold">{msg.username}</span>
                      {msg.timestamp && (
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {getMessageTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className={`p-2 max-w-[85%] text-sm ${
                      msg.username === user?.username
                        ? "bg-white text-black rounded-lg mr-auto border border-[#D4AF37]"
                        : "bg-white text-black rounded-lg border border-[#D4AF37]"
                    }`}>
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-2 pt-1 pb-2 border-t border-[#D4AF37] bg-[#0A3A2A]">
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef} 
              className="absolute bottom-14 right-3 z-50 shadow-lg rounded-lg overflow-hidden"
              style={{ height: '250px' }}
            >
              <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled lazyLoadEmojis height={250} width={260} />
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] text-white px-1">
              <span className="text-[#D4AF37] font-bold">{100 - messageCount}</span> رسالة متبقية اليوم
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black border-none p-1 h-9 w-9 emoji-toggle-button"
              type="button"
            >
              <Smile className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك..."
                className="flex-1 text-sm h-9 bg-white border border-[#D4AF37] pr-2 rounded-md"
                style={{ paddingLeft: '36px' }}
              />
              <Button
                onClick={sendChatMessage}
                className="absolute left-0 top-0 bottom-0 w-9 bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black border-none"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}