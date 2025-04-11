import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, ChevronDown, ChevronUp, X, MessageSquare } from "lucide-react";
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
    <div className="w-full h-full flex flex-col bg-[#FFECBC] rounded-lg overflow-hidden border border-[#EB9C2C] shadow-lg">
      {/* رأس الدردشة */}
      <div className="bg-gradient-to-b from-[#FDA82A] to-[#EB9C2C] p-2 flex justify-between items-center border-b border-[#CD7B12]">
        <div className="flex items-center gap-1">
          <MessageSquare size={16} className="text-[#8B4513] mr-1" />
          <h3 className="text-[#8B4513] font-bold text-base">الدردشة العامة</h3>
          <div className="flex items-center mr-2 text-xs text-[#8B4513] bg-white/30 px-2 py-0.5 rounded-full">
            <span>{messages.length} رسالة</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#B27324]/20 rounded-full transition-colors"
          >
            <X size={18} className="text-[#8B4513]" />
          </button>
        )}
      </div>

      {/* محتوى الدردشة */}
      <ScrollArea className="flex-1 p-3 bg-[#FFECBC]">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col mb-2 ${msg.isSystem ? 'opacity-80' : ''}`}>
              <div className="flex items-center space-x-1 space-x-reverse">
                {/* صورة المستخدم */}
                <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 bg-[#EB9C2C]/30">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt={msg.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#EB9C2C]/50 text-[#8B4513]/80 font-bold text-xs">
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* اسم المستخدم */}
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
                  <span className="text-[10px] text-[#8B4513]/60 mr-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </span>
                )}
              </div>

              {/* نص الرسالة */}
              <div className={`mt-1 px-3 py-1.5 rounded-lg ${
                msg.isSystem 
                  ? 'bg-[#EB9C2C]/20 text-[#8B4513]/80 text-xs' 
                  : msg.username === user?.username 
                    ? 'bg-[#EB9C2C]/40 text-[#8B4513] mr-8' 
                    : 'bg-white text-[#8B4513] ml-8'
              }`}>
                {msg.message}
              </div>
            </div>
          ))}
          {/* عنصر للتمرير الآلي إلى آخر الرسائل */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* منطقة إدخال الرسائل */}
      <div className="p-2 border-t border-[#EB9C2C]/40 bg-[#FFECBC]">
        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={!canSendMessage}
              className="h-9 w-9 rounded-full bg-[#EB9C2C]/40 hover:bg-[#EB9C2C]/60 text-[#8B4513]"
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={canSendMessage ? "اكتب رسالتك هنا..." : "جاري الاتصال..."}
            disabled={!canSendMessage}
            className="flex-1 bg-white border-[#EB9C2C]/50 focus:border-[#EB9C2C] focus:ring-0 placeholder-[#8B4513]/50 text-[#8B4513]"
          />

          <Button 
            onClick={handleSendMessage}
            disabled={!canSendMessage || !newMessage.trim()}
            className="bg-[#EB9C2C] hover:bg-[#FDA82A] text-white rounded-full h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}