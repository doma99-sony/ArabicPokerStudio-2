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
    <div className={`w-full bg-black/50 rounded-lg border border-gold/10 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'h-[400px]' : 'h-[60px]'}`}>
      <div className="bg-[#1B4D3E] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-sm">الدردشة العامة</h3>
          
          {!isExpanded && (
            <div className="flex items-center mr-2 text-xs text-gold/60">
              <MessageSquare className="h-3 w-3 ml-1" />
              <span>{messages.length} رسالة</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 text-white hover:bg-white/10 focus:ring-0 ring-offset-0 focus:ring-offset-0"
          onClick={toggleExpanded}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  {msg.username === "system" ? (
                    // رسالة النظام (مثل الأخبار)
                    <div className="flex justify-center my-1">
                      <div className="bg-white/80 text-black text-sm px-4 py-1 rounded-full border border-gold/40">
                        {msg.message}
                        {msg.timestamp && (
                          <span className="text-xs text-gray-500 mr-2">
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
                          ? "bg-white text-black rounded-t-2xl rounded-l-2xl rounded-br-sm mr-auto border-2 border-[#D4AF37]"
                          : "bg-white text-black rounded-t-2xl rounded-r-2xl rounded-bl-sm border-2 border-gold/60"
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
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef} 
                className="absolute bottom-16 right-3 z-50 shadow-lg rounded-lg overflow-hidden"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled lazyLoadEmojis />
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-white">
                <span className="text-gold font-bold">{100 - messageCount}</span> رسالة متبقية اليوم
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="bg-black/30 hover:bg-black/50 text-gold border border-gold/30 p-2 emoji-toggle-button"
                type="button"
              >
                <Smile className="h-4 w-4" />
              </Button>
              
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
      )}
      
      {/* المساحة السفلية المتوفرة عند تصغير مربع الدردشة */}
      {!isExpanded && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-3">
          <div className="text-xs text-gold/60">● المساحة المتاحة للأيقونات ●</div>
        </div>
      )}
    </div>
  );
}