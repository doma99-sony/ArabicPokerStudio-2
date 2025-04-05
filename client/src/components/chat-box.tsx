import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// نوع رسالة الدردشة
interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // محاكاة بعض الرسائل الافتراضية للعرض
  useEffect(() => {
    const demoMessages = [
      {
        id: '1',
        userId: 1,
        username: 'المشرف',
        message: 'مرحباً بكم في لعبة الصاروخ العرباوي! 🚀',
        timestamp: new Date(Date.now() - 3600000),
        isSystem: true
      },
      {
        id: '2',
        userId: 2,
        username: 'لاعب_عرباوي',
        message: 'محظوظ اليوم! وصلت إلى 7x!',
        timestamp: new Date(Date.now() - 1800000)
      },
      {
        id: '3',
        userId: 3,
        username: 'صقر_الصحراء',
        message: 'انفجر بسرعة جداً في الجولة السابقة 😢',
        timestamp: new Date(Date.now() - 1200000)
      },
      {
        id: '4',
        userId: 4,
        username: 'نجم_الليل',
        message: 'هل جربتم الانسحاب التلقائي؟ يعمل بشكل جيد',
        timestamp: new Date(Date.now() - 600000)
      }
    ];
    
    setMessages(demoMessages);
  }, []);
  
  // تمرير الدردشة إلى الأسفل عند إضافة رسالة جديدة
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);
  
  // إرسال رسالة جديدة
  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    // في الإنتاج سنرسل الرسالة إلى السيرفر، لكن هنا سنقوم بإضافتها مباشرة
    const newChatMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newChatMessage]);
    setNewMessage('');
  };
  
  // التعامل مع ضغط Enter لإرسال الرسالة
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // تنسيق الوقت للعرض
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* منطقة الرسائل */}
      <ScrollArea className="flex-1 px-3 py-2" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] p-2 px-3 rounded-lg mb-1
                  ${msg.isSystem 
                    ? 'bg-[#334155]/50 text-white' 
                    : msg.userId === user?.id 
                      ? 'bg-[#3B82F6] text-white' 
                      : 'bg-[#334155] text-white'}
                `}
              >
                {!msg.isSystem && msg.userId !== user?.id && (
                  <div className="text-xs text-[#A1A1AA] mb-1">{msg.username}</div>
                )}
                <p className="text-sm">{msg.message}</p>
              </div>
              <span className="text-xs text-[#6B7280]">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* منطقة إدخال الرسالة */}
      <div className="p-3 border-t border-[#334155]">
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-full text-[#A1A1AA] hover:text-white"
          >
            <Smile size={18} />
          </Button>
          <Input
            placeholder="اكتب رسالة..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-[#0F172A] border-[#334155] text-white focus-visible:ring-[#3B82F6]"
          />
          <Button 
            size="icon" 
            className="h-8 w-8 rounded-full bg-[#3B82F6] hover:bg-[#2563EB]"
            onClick={sendMessage}
          >
            <Send size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;