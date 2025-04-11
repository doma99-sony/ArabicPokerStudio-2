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
    <div className="w-full h-full flex flex-col overflow-hidden" 
      style={{ 
        backgroundColor: '#FDA82A',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
      }}
    >
      {/* شريط العنوان مع زر الإغلاق */}
      <div className="bg-gradient-to-b from-[#FDA82A] to-[#E88F19] flex justify-between items-center px-4 py-2 border-b-2 border-[#B27324]">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <h3 className="text-[#8B4513] font-bold text-lg">الدردشة</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#8B4513] hover:bg-[#E88F19] p-1 rounded-full flex items-center justify-center bg-[#FFECBC] border border-[#B27324] h-8 w-8"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* الحاوية الرئيسية بتقسيم مربع */}
      <div className="flex flex-1">
        {/* قائمة اللاعبين الجانبية */}
        <div className="w-[250px] bg-[#FFECBC] border-l border-[#B27324] overflow-y-auto">
          <div className="sticky top-0 bg-[#FDA82A] p-2 border-b border-[#B27324] flex justify-between items-center">
            <h4 className="text-[#8B4513] font-semibold">اللاعبين المتصلين</h4>
            <div className="bg-[#FFECBC] text-xs text-[#8B4513] px-2 py-0.5 rounded border border-[#B27324]">
              {predefinedPlayers.length}
            </div>
          </div>
          
          {/* قائمة اللاعبين */}
          <div className="p-2">
            {predefinedPlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-2 p-2 hover:bg-[#FDA82A]/20 rounded-lg mb-2 border border-[#B27324]/20">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-[#B27324]">
                  {player.avatar ? (
                    <img src={player.avatar} alt={player.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#E88F19] text-[#8B4513] font-bold">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-[#8B4513] font-medium text-sm">{player.username}</span>
                    <div className="flex items-center mx-1">
                      {renderBadges(player.badges || [])}
                    </div>
                  </div>
                  <span className="text-[#8B4513]/70 text-xs">
                    {Math.random() > 0.5 ? 'متصل الآن' : 'نشط منذ 5 دقائق'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* محتوى الدردشة الرئيسي */}
        <div className="flex-1 flex flex-col">
          {/* محتوى الدردشة */}
          <ScrollArea className="flex-1 bg-white custom-scrollbar">
            <div className="py-2">
              {messages.map((msg, index) => {
                const playerInfo = getPlayerInfo(msg.username);
                const isCurrentUser = msg.username === user?.username;
                
                return (
                  <div key={msg.id} className="mb-3">
                    {/* عرض صف المستخدم والشارات للمرسل */}
                    <div className="flex items-center px-3 mb-1">
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
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} px-3`}>
                      <div 
                        className={`relative px-3 py-2 max-w-[80%] rounded-lg ${
                          isCurrentUser 
                            ? 'bg-[#FFECBC] border border-[#B27324] mr-12'
                            : 'bg-white border border-[#B27324] ml-12'
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
                  placeholder="اكتب رسالتك هنا..."
                  disabled={!canSendMessage}
                  className="w-full h-10 px-4 py-2 bg-white border border-[#B27324] rounded-xl placeholder-[#8B4513]/50 text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#E88F19]"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!canSendMessage || !newMessage.trim()}
                className="h-10 w-28 flex items-center justify-center bg-gradient-to-r from-[#4CAF50] to-[#388E3C] hover:from-[#45A049] hover:to-[#2E7D32] text-white rounded-xl border border-[#2E7D32]"
              >
                <span className="mr-1 font-medium">إرسال</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}