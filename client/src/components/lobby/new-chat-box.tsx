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

// رسائل النظام الافتراضية - نستخدمها كمجموعة افتراضية من الرسائل
const systemMessages: ChatMessage[] = [
  {
    id: 'welcome_msg_1',
    username: 'Mohamed',
    message: 'لو هاخد كمية هخسسيبها كام',
    timestamp: new Date('2024/04/04').getTime(),
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'welcome_msg_2',
    username: 'Mohamed',
    message: 'تعالى يا بنت الحلال',
    timestamp: new Date('2024/04/05').getTime(),
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'welcome_msg_3',
    username: 'Mohamed',
    message: 'أنا انصب عليك منك',
    timestamp: Date.now() - 3600000,
    avatar: '/assets/avatars/avatar-1.png'
  },
  {
    id: 'welcome_msg_4',
    username: 'أم مروان',
    message: 'ايه كداب',
    timestamp: Date.now() - 1800000,
    avatar: '/assets/avatars/avatar-2.png'
  }
];

// معلومات اللاعبين المُعرّفة مسبقًا مع الأيقونات
const predefinedPlayers = [
  { id: '1', username: 'Mohamed', avatar: '/assets/avatars/avatar-1.png', badges: ['diamond', 'gold', 'vip'] },
  { id: '2', username: 'مريم محمد', avatar: '/assets/avatars/avatar-3.png', badges: ['gold', 'vip'] },
  { id: '3', username: 'أم علي', avatar: '/assets/avatars/avatar-4.png', badges: ['diamond', 'regular'] },
  { id: '4', username: 'guest_426', avatar: '/assets/avatars/avatar-5.png', badges: ['regular', 'vip'] },
  { id: '5', username: 'guest_959', avatar: '/assets/avatars/avatar-6.png', badges: ['diamond', 'vip'] },
  { id: '6', username: 'أم مروان', avatar: '/assets/avatars/avatar-2.png', badges: ['vip', 'gold', 'diamond'] }
];

export function NewChatBox({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth();
  const { registerMessageHandler: registerHandler, sendMessage, status } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(systemMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const today = new Date();
    
    // إذا كان التاريخ اليوم، أظهر الساعة والدقيقة فقط
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // إذا كان ضمن نطاق أسبوع، أظهر اليوم والوقت
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (date > weekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // خلاف ذلك، أظهر التاريخ
    return date.toLocaleDateString('ar-EG').split('،')[0];
  };

  // دالة مساعدة للحصول على بيانات اللاعب
  const getPlayerInfo = (username: string) => {
    return predefinedPlayers.find(p => p.username === username) || {
      username,
      avatar: null,
      badges: []
    };
  };

  // رسم أيقونات الشارات
  const renderBadges = (badges: string[]) => {
    return badges.map((badge, index) => {
      let badgeIcon = '';
      
      if (badge === 'diamond') {
        badgeIcon = '💎';
      } else if (badge === 'gold') {
        badgeIcon = '🏆';
      } else if (badge === 'vip') {
        badgeIcon = '👑';
      } else if (badge === 'regular') {
        badgeIcon = '🎮';
      }
      
      return (
        <span key={index} className="inline-block mx-0.5">
          {badgeIcon}
        </span>
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#FDA82A', borderRadius: '15px' }}>
      {/* شريط الجانب الأيسر */}
      <div className="flex h-full">
        <div className="w-[70px] bg-[#E88F19] flex flex-col items-center py-4 space-y-4 border-l border-[#B27324]">
          <div className="flex flex-col items-center">
            <div className="text-[#8B4513] text-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="text-[#8B4513] text-xs font-medium">الأصدقاء</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-[#8B4513] text-center mb-1 opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <span className="text-[#8B4513] text-xs font-medium opacity-70">الشات العام</span>
          </div>
          
          <div className="flex flex-col items-center bg-[#FDA82A] w-full py-3 relative">
            <div className="absolute right-1 top-3 w-2 h-2 rounded-full bg-red-500"></div>
            <div className="text-[#8B4513] text-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="16" y1="11" x2="22" y2="11"></line>
                <line x1="19" y1="8" x2="19" y2="14"></line>
              </svg>
            </div>
            <span className="text-[#8B4513] text-xs font-medium">اللاعبين</span>
          </div>
        </div>

        {/* محتوى الدردشة الرئيسي */}
        <div className="flex-1 flex flex-col">
          {/* رأس الدردشة */}
          <div className="bg-[#FDA82A] flex justify-between items-center p-2 border-b border-[#B27324] h-10">
            <div className="flex items-center gap-1">
              <span className="text-[#8B4513] font-bold text-sm">Mohamed</span>
              {renderBadges(['diamond', 'gold', 'vip'])}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-[#8B4513] hover:bg-[#E88F19] p-1 rounded-full"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* محتوى الدردشة */}
          <ScrollArea className="flex-1 bg-[#FFDFA8] custom-scrollbar">
            <div className="py-2">
              {messages.map((msg, index) => {
                const playerInfo = getPlayerInfo(msg.username);
                const isCurrentUser = msg.username === user?.username;
                
                return (
                  <div key={msg.id} className="mb-2">
                    {/* عرض صف المستخدم والشارات للمرسل */}
                    <div className="flex items-center px-2 mb-1">
                      {!isCurrentUser && (
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#B27324] mr-2">
                          {playerInfo.avatar ? (
                            <img src={playerInfo.avatar} alt={msg.username} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#E88F19] text-[#8B4513] font-bold">
                              {msg.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <span className="text-[#8B4513] font-medium text-sm">{msg.username}</span>
                        <div className="flex items-center mx-1">
                          {renderBadges(playerInfo.badges || [])}
                        </div>
                      </div>
                    </div>
                    
                    {/* فقاعة الرسالة */}
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} px-2`}>
                      <div 
                        className={`relative px-3 py-2 max-w-[80%] rounded-lg ${
                          isCurrentUser 
                            ? 'bg-white border border-[#B27324] mr-12'
                            : 'bg-[#FFECBC] border border-[#B27324] ml-12'
                        }`}
                        style={{
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="text-[#8B4513] text-sm">
                          {msg.message}
                        </div>
                        {msg.timestamp && (
                          <div className="text-right mt-1">
                            <span className="text-[10px] text-[#8B4513]/60" dir="ltr">
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

          {/* منطقة إدخال الرسائل */}
          <div className="p-3 bg-[#FDA82A] border-t border-[#B27324] flex items-center">
            <div className="flex w-full items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  type="button"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFECBC] border border-[#B27324] text-[#E88F19] hover:bg-[#FFDFA8]"
                >
                  <span className="text-lg">😊</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="اضغط للدخول..."
                  disabled={!canSendMessage}
                  className="w-full h-10 px-4 py-2 bg-white/90 border border-[#B27324] rounded-xl placeholder-[#8B4513]/50 text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#E88F19]"
                />
              </div>

              {/* أيقونات إضافية */}
              <button
                type="button"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFECBC] border border-[#B27324] text-[#E88F19] hover:bg-[#FFDFA8]"
              >
                <span className="text-lg">🎁</span>
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !newMessage.trim()}
                className="h-12 w-[250px] flex items-center justify-center bg-gradient-to-r from-[#4CAF50] to-[#388E3C] hover:from-[#45A049] hover:to-[#2E7D32] text-white rounded-xl border border-[#2E7D32]"
              >
                <span className="mr-2 font-medium">إرسال</span>
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}