import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar?: string;
  timestamp?: number;
  isSystem?: boolean;
  tableId?: number;
}

// رسائل النظام الافتراضية
const systemMessages: ChatMessage[] = [
  {
    id: 'table_chat_welcome_1',
    username: 'النظام',
    message: 'أهلاً بك في دردشة الطاولة 👋',
    timestamp: Date.now(),
    isSystem: true
  },
  {
    id: 'table_chat_welcome_2',
    username: 'النظام',
    message: 'يمكنك التواصل مع لاعبي هذه الطاولة فقط هنا',
    timestamp: Date.now() + 100,
    isSystem: true
  }
];

interface TableChatProps {
  tableId: number;
}

export function TableChat({ tableId }: TableChatProps) {
  const { user } = useAuth();
  const { registerMessageHandler, sendMessage, status } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(systemMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // تسجيل معالج الرسائل من الويب سوكيت
  useEffect(() => {
    const unregister = registerMessageHandler("table_chat_message", (data: ChatMessage) => {
      // تصفية الرسائل حسب معرف الطاولة
      if (data.tableId === tableId) {
        // إضافة رسالة جديدة تلقائيًا
        setMessages(prev => [...prev, data]);
        
        // قم بالتمرير إلى أسفل عند استلام رسالة جديدة
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    });

    return () => unregister();
  }, [registerMessageHandler, tableId]);

  // التمرير للأسفل عند تحميل المكون
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, []);

  // إضافة رسالة نظام عند تغير حالة الاتصال
  useEffect(() => {
    if (status === 'open') {
      // إضافة رسالة بأن المستخدم متصل
      const connectionMsg: ChatMessage = {
        id: `table_conn_${Date.now()}`,
        username: 'النظام',
        message: 'تم الاتصال بدردشة الطاولة ✅',
        timestamp: Date.now(),
        isSystem: true,
        tableId: tableId
      };
      setMessages(prev => [...prev, connectionMsg]);
    } else if (status === 'closed' || status === 'error') {
      // إضافة رسالة بأن المستخدم غير متصل
      const disconnectionMsg: ChatMessage = {
        id: `table_disconn_${Date.now()}`,
        username: 'النظام',
        message: 'انقطع الاتصال بدردشة الطاولة ❌',
        timestamp: Date.now(),
        isSystem: true,
        tableId: tableId
      };
      setMessages(prev => [...prev, disconnectionMsg]);
    }
  }, [status, tableId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    // إرسال رسالة مع تحديد معرف الطاولة
    sendMessage("table_chat_message", {
      message: newMessage.trim(),
      tableId: tableId
    });

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // تحديد إذا كان المستخدم متصل ويمكنه إرسال رسائل
  const canSendMessage = status === 'open' && !!user;

  return (
    <div className={`fixed bottom-0 left-0 z-40 w-80 bg-black/70 border-r border-t border-[#D4AF37]/60 rounded-tr-lg shadow-lg transition-all duration-300 transform ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
      {/* رأس الدردشة */}
      <div 
        className="bg-gradient-to-r from-[#0A3A2A] to-[#1A5B4A] p-2 flex items-center justify-between border-b border-[#D4AF37] cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#D4AF37]" />
          <h3 className="text-[#D4AF37] font-bold text-sm">دردشة الطاولة</h3>
          <div className="flex items-center mr-2 text-xs text-white/90 bg-black/30 px-2 py-0.5 rounded-full">
            <span>{messages.length} رسالة</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'open' 
              ? 'bg-green-500' 
              : status === 'connecting' 
                ? 'bg-yellow-500 animate-pulse' 
                : 'bg-red-500'
          }`} />
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white/80" />
          ) : (
            <ChevronUp className="h-4 w-4 text-white/80" />
          )}
        </div>
      </div>

      {/* منطقة الرسائل */}
      <div className={`transition-all duration-300 ${isExpanded ? 'h-72' : 'h-0'}`}>
        <ScrollArea className="h-full p-3">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col mb-3 ${msg.isSystem ? 'opacity-70' : ''}`}>
                <div className="flex items-center space-x-1 space-x-reverse">
                  {/* حالة رسائل النظام */}
                  {msg.isSystem ? (
                    <span className="text-xs font-semibold bg-[#0A3A2A]/90 text-white/90 px-2 py-0.5 rounded-sm">
                      {msg.username}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-[#D4AF37]">
                      {msg.username}
                    </span>
                  )}
                  {msg.timestamp && (
                    <span className="text-[10px] text-white/50">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                  )}
                </div>
                <div className={`mt-1 px-3 py-2 rounded-lg ${
                  msg.isSystem 
                    ? 'bg-[#1A1A1A]/80 text-white/80 text-xs' 
                    : msg.username === user?.username 
                      ? 'bg-[#0A3A2A] text-white ml-auto' 
                      : 'bg-black/40 text-white/90'
                }`}>
                  {msg.message}
                </div>
              </div>
            ))}
            {/* عنصر للتمرير الآلي إلى آخر الرسائل */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* مربع إدخال الرسالة الجديدة */}
        <div className="p-3 border-t border-[#D4AF37]/20 bg-black/30">
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!canSendMessage}
                className="h-9 w-9 rounded-full bg-[#0A3A2A]/60 hover:bg-[#0A3A2A] text-[#D4AF37]"
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
              className="flex-1 bg-black/20 border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-0"
            />

            <Button 
              onClick={handleSendMessage}
              disabled={!canSendMessage || !newMessage.trim()}
              className="bg-[#D4AF37] hover:bg-[#E5C04B] text-black rounded-full h-9 w-9 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}