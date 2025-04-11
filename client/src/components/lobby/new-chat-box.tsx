import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, X } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar?: string;
  timestamp?: number;
  isSystem?: boolean;
}

// رسائل النظام الافتراضية
const systemMessages: ChatMessage[] = [
  {
    id: 'welcome_msg_1',
    username: 'النظام',
    message: 'أهلاً بك في الدردشة العامة 👋',
    timestamp: Date.now(),
    isSystem: true
  },
  {
    id: 'welcome_msg_2',
    username: 'النظام',
    message: 'يمكنك التواصل مع اللاعبين الآخرين هنا',
    timestamp: Date.now() + 100,
    isSystem: true
  }
];

export function NewChatBox({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { registerMessageHandler: registerHandler, sendMessage, status } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(systemMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // تسجيل معالج الرسائل من الويب سوكيت
  useEffect(() => {
    const unregister = registerHandler("chat_message", (message: ChatMessage) => {
      // إضافة رسالة جديدة تلقائيًا
      setMessages(prev => [...prev, message]);
      
      // قم بالتمرير إلى أسفل عند استلام رسالة جديدة
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unregister();
  }, [registerHandler]);

  // التمرير للأسفل عند تحميل المكون
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  // إضافة رسالة نظام عند تغير حالة الاتصال
  useEffect(() => {
    if (status === 'open') {
      // إضافة رسالة بأن المستخدم متصل
      const connectionMsg: ChatMessage = {
        id: `conn_${Date.now()}`,
        username: 'النظام',
        message: 'تم الاتصال بالخادم بنجاح ✅',
        timestamp: Date.now(),
        isSystem: true
      };
      setMessages(prev => [...prev, connectionMsg]);
    } else if (status === 'closed' || status === 'error') {
      // إضافة رسالة بأن المستخدم غير متصل
      const disconnectionMsg: ChatMessage = {
        id: `disconn_${Date.now()}`,
        username: 'النظام',
        message: 'انقطع الاتصال بالخادم ❌',
        timestamp: Date.now(),
        isSystem: true
      };
      setMessages(prev => [...prev, disconnectionMsg]);
    }
  }, [status]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage("chat_message", {
      message: newMessage.trim()
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  // تحديد إذا كان المستخدم متصل ويمكنه إرسال رسائل
  const canSendMessage = status === 'open' && !!user;

  return (
    <div className="w-full h-full flex flex-col bg-[#FFECBC] rounded-lg overflow-hidden shadow-md">
      {/* رأس الدردشة */}
      <div className="bg-gradient-to-b from-[#FDA82A] to-[#EB9C2C] px-2 py-1 flex justify-between items-center border-b border-[#CD7B12]">
        <div className="flex items-center">
          <h3 className="text-[#8B4513] font-bold text-sm">الأصدقاء</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#B27324]/20 rounded-full transition-colors"
          >
            <X size={16} className="text-[#8B4513]" />
          </button>
        )}
      </div>

      {/* محتوى الدردشة */}
      <ScrollArea className="flex-1 bg-[#FFECBC] custom-scrollbar">
        <div className="py-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col px-2 py-1 ${msg.isSystem ? 'opacity-80' : ''}`}>
              <div className="flex items-center">
                {/* صورة المستخدم */}
                <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 bg-[#EB9C2C]/30 border border-[#B27324] mr-2">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt={msg.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#EB9C2C]/50 text-[#8B4513]/80 font-bold text-xs">
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col grow">
                  {/* اسم المستخدم */}
                  <div className="flex justify-between items-center">
                    {msg.isSystem ? (
                      <span className="text-xs font-semibold bg-[#EB9C2C]/20 text-[#8B4513] px-2 py-0.5 rounded-sm">
                        {msg.username}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-[#8B4513]">
                        {msg.username}
                      </span>
                    )}

                    {/* وقت الرسالة */}
                    {msg.timestamp && (
                      <span className="text-[10px] text-[#8B4513]/60" dir="ltr">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    )}
                  </div>

                  {/* نص الرسالة */}
                  <div className={`text-sm px-3 py-1 my-1 rounded-lg ${
                    msg.isSystem 
                      ? 'bg-[#EB9C2C]/20 text-[#8B4513]/80 text-xs' 
                      : msg.username === user?.username 
                        ? 'bg-[#EB9C2C]/30 text-[#8B4513]' 
                        : 'bg-white/70 text-[#8B4513]'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* عنصر للتمرير الآلي إلى آخر الرسائل */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* منطقة إدخال الرسائل */}
      <div className="p-2 border-t border-[#EB9C2C]/40 bg-[#FFECBC] flex items-center">
        <div className="flex items-center w-full gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!canSendMessage}
            className="h-9 w-9 p-0 rounded-full bg-[#EB9C2C]/40 hover:bg-[#EB9C2C]/60 text-[#8B4513]"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-4 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
            </div>
          )}

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={canSendMessage ? "اكتب رسالتك هنا..." : "جاري الاتصال..."}
            disabled={!canSendMessage}
            className="flex-1 h-9 bg-white/80 border-[#EB9C2C]/50 focus:border-[#EB9C2C] focus:ring-0 placeholder-[#8B4513]/50 text-[#8B4513] rounded-full"
          />

          <Button 
            onClick={handleSendMessage}
            disabled={!canSendMessage || !newMessage.trim()}
            className="h-9 min-w-[100px] ml-2 bg-gradient-to-r from-[#00C851] to-[#009A3E] hover:from-[#00D65C] hover:to-[#00B048] text-white rounded-full"
          >
            <span className="mr-1">إرسال</span>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}