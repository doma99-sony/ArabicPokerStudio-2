import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket-simplified";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  avatar?: string;
  timestamp?: number;
  isSystem?: boolean;
}

// رسائل الدردشة المطابقة للصورة
const systemMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    username: 'الدردشة العامة',
    message: 'لو هاخد كمية هخسسيبها كام',
    timestamp: new Date('2024/04/04').getTime(),
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'msg_2',
    username: 'الدردشة العامة',
    message: 'تعالى يا بنت الحلال',
    timestamp: new Date('2024/04/05').getTime(),
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'msg_3',
    username: 'الدردشة العامة',
    message: 'أنا انصب عليك منك',
    timestamp: new Date().setHours(1, 7, 36),
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'msg_4',
    username: 'أم مروان',
    message: 'ايه كداب',
    timestamp: new Date().setHours(1, 12, 53),
    avatar: '/assets/avatars/avatar-2.png'
  }
];

// معلومات اللاعبين المُعرّفة مسبقًا مع الأيقونات - مطابقة للصورة
const predefinedPlayers = [
  { id: '1', username: 'Mohamed', avatar: '/assets/avatars/avatar-1.png', badges: ['diamond', 'gold', 'vip'] },
  { id: '2', username: 'مريم محمد', avatar: '/assets/avatars/avatar-3.png', badges: ['gold', 'vip'] },
  { id: '3', username: 'أم علي', avatar: '/assets/avatars/avatar-4.png', badges: ['diamond', 'regular'] },
  { id: '4', username: 'guest_426', avatar: '/assets/avatars/avatar-5.png', badges: ['regular', 'vip'] },
  { id: '5', username: 'guest_959', avatar: '/assets/avatars/avatar-6.png', badges: ['diamond', 'vip'] },
  { id: '6', username: 'أم مروان', avatar: '/assets/avatars/avatar-2.png', badges: ['vip', 'gold', 'diamond'] }
];

// القائمة الجانبية كما في الصورة المرجعية
const sidebarItems = [
  { id: 'friends', name: 'الأصدقاء', icon: 'الأصدقاء' },
  { id: 'chat', name: 'الشات العام', icon: 'الشات العام', active: true },
  { id: 'players', name: 'اللاعبين', icon: 'اللاعبين' }
];

export function NewChatBox({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { registerMessageHandler: registerHandler, sendMessage, status } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(systemMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("players"); // "players" | "friends" | "chat"

  // تسجيل معالج الرسائل من الويب سوكيت
  useEffect(() => {
    const unregister = registerHandler("chat_message", (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
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

  // دالة مساعدة لإنشاء تاريخ بتنسيق مناسب
  const formatChatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    
    // الصورة تعرض التاريخ بصيغة YYYY/MM/DD
    if (date.getDate() === new Date().getDate()) {
      // اليوم عرض الساعة:الدقيقة فقط
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // للتواريخ الأخرى عرض تاريخ كامل
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }
  };

  // دالة مساعدة للحصول على بيانات اللاعب
  const getPlayerInfo = (username: string) => {
    return predefinedPlayers.find(p => p.username === username) || {
      username,
      avatar: null,
      badges: []
    };
  };

  // رسم أيقونات الشارات - كما في الصورة المرجعية
  const renderBadges = (badges: string[]) => {
    return badges.map((badge, index) => {
      let badgeContent = null;
      
      if (badge === 'diamond') {
        badgeContent = (
          <img src="/assets/badges/diamond.png" alt="diamond" width={20} height={20} />
        );
      } else if (badge === 'gold') {
        badgeContent = (
          <img src="/assets/badges/trophy.png" alt="gold" width={20} height={20} />
        );
      } else if (badge === 'vip') {
        badgeContent = (
          <img src="/assets/badges/crown.png" alt="vip" width={20} height={20} />
        );
      } else {
        badgeContent = (
          <div className="w-5 h-5 flex items-center justify-center bg-yellow-600 rounded-full text-white text-[10px]">
            VIP
          </div>
        );
      }
      
      return (
        <div key={index} className="inline-flex mx-0.5">
          {badgeContent}
        </div>
      );
    });
  };

  return (
    <div className="w-full h-full flex overflow-hidden" 
      style={{ 
        backgroundColor: '#FFDDB3',
        borderRadius: '8px',
        boxShadow: '0 1px 10px rgba(0,0,0,0.15)'
      }}
    >
      {/* القائمة الجانبية اليسرى - مطابقة للصورة */}
      <div className="w-20 bg-[#CF8800] flex flex-col border-l border-[#B27324]">
        <div className="p-2 flex flex-col items-center space-y-3">
          {/* رمز الأصدقاء */}
          <div className="p-2 flex flex-col items-center justify-center rounded-lg cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A05B05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="text-white text-xs mt-1">الأصدقاء</span>
          </div>
          
          {/* رمز الشات العام - نشط */}
          <div className="p-2 flex flex-col items-center justify-center bg-amber-500/40 rounded-lg cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A05B05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <span className="text-white text-xs mt-1">الشات</span>
          </div>
          
          {/* رمز اللاعبين */}
          <div className="p-2 flex flex-col items-center justify-center rounded-lg cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A05B05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="text-white text-xs mt-1">اللاعبين</span>
          </div>
        </div>
      </div>
      
      {/* محتوى الدردشة */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* شريط العنوان - تصميم مطابق للصورة */}
        <div className="bg-[#DC8E08] flex justify-between items-center px-3 py-2.5 relative">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-white font-semibold text-base">الدردشة العامة</h3>
              <div className="flex items-center space-x-1 space-x-reverse">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-white/80 text-xs">متصل الآن</span>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white p-1"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* محتوى الدردشة الرئيسي - مطابق للصورة */}
        <div className="flex-1 flex flex-col">
          {/* محتوى الدردشة */}
          <ScrollArea className="flex-1" style={{ backgroundColor: '#ECE0C7', backgroundImage: 'url("/assets/chat-background.png")' }}>
            <div className="py-2 space-y-1 px-2">
              {messages.map((msg, index) => {
                // لتحديد ما إذا كانت الرسالة من "محمد" أو "أم مروان"
                const isMohamedMessage = msg.username === 'Mohamed';
                
                return (
                  <div key={msg.id} className="mb-3">
                    {/* عرض بيانات المرسل مع الصورة - فقط مع أول رسالة من "محمد" في المجموعة */}
                    {index === 0 || messages[index-1]?.username !== msg.username ? (
                      <div className="flex items-center px-1 pb-0.5">
                        <div className="flex-1 flex items-center">
                          <img 
                            src={isMohamedMessage ? '/assets/avatars/avatar-1.png' : '/assets/avatars/avatar-2.png'} 
                            alt={msg.username} 
                            className="h-7 w-7 rounded-full border border-amber-600/30"
                          />
                          <span className="text-xs font-medium mr-2 text-amber-900">{msg.username}</span>
                          
                          {/* رموز مثل في الصورة */}
                          {isMohamedMessage && (
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <img src="/assets/badges/diamond.png" alt="icon" className="h-4 w-4" />
                              <img src="/assets/badges/trophy.png" alt="icon" className="h-4 w-4" />
                              <img src="/assets/badges/crown.png" alt="icon" className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                    
                    {/* فقاعة الرسالة - تصميم مطابق للصورة */}
                    <div className="flex">
                      <div className={`relative max-w-[85%] p-2 px-3 rounded-lg mb-1 ${
                        isMohamedMessage 
                          ? 'bg-[#EDDBB4] border border-[#D4B67B]/30 mr-10 ml-auto'
                          : 'bg-white border border-gray-200/50 ml-10'
                      }`}>
                        {/* محتوى الرسالة */}
                        <div className="text-[#664B29] text-sm">
                          {msg.message}
                        </div>
                        
                        {/* التوقيت */}
                        {msg.timestamp && (
                          <div className="text-left mt-0.5">
                            <span className="text-[10px] text-[#A1A1AA]" dir="ltr">
                              {formatChatTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* منطقة إدخال الرسائل - مطابقة للصورة */}
          <div className="bg-[#FFDDB3] p-1.5 flex items-center gap-1">
            <div className="flex items-center gap-1 w-full">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                type="button"
                className="flex items-center justify-center h-10 w-10 text-amber-600"
              >
                <span className="text-2xl">😊</span>
              </button>
              
              <div className="relative flex-1 bg-white rounded-full">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اضغط للدخول..."
                  disabled={!canSendMessage}
                  className="w-full h-10 px-4 py-2 bg-white rounded-full placeholder-gray-500 text-gray-700 focus:outline-none"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !newMessage.trim()}
                className="h-10 w-10 flex items-center justify-center text-amber-600"
              >
                <Send className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}