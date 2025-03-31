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
  timestamp?: number;
}

export function ChatBox() {
  const { user } = useAuth();
  const { registerHandler, sendMessage, socket } = useWebSocket();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unregister = registerHandler("chat_message", (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    return () => unregister();
  }, [registerHandler]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage({
      type: "chat_message",
      message: newMessage.trim()
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

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col mb-2">
              <span className="text-sm text-[#D4AF37]">{msg.username}</span>
              <div className={`mt-1 px-3 py-2 rounded-lg ${
                msg.username === user?.username 
                  ? 'bg-[#0A3A2A] text-white ml-auto' 
                  : 'bg-black/40 text-white/90'
              }`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#D4AF37]/20">
        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1"
          />

          <Button onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}