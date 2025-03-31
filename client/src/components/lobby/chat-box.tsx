
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export function ChatBox() {
  const { user } = useAuth();
  const { sendMessage, registerHandler } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const handler = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      });
    };

    registerHandler("chat_message", handler);
    
    // تنظيف الرسائل عند إغلاق المكون
    return () => {
      setMessages([]);
    };
  }, [registerHandler, user]);

  const sendChatMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage({
      type: "chat_message",
      message: newMessage.trim()
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="w-full h-[400px] bg-black/50 rounded-lg border border-gold/10 overflow-hidden flex flex-col">
      <div className="bg-[#1B4D3E] p-3 flex items-center">
        <h3 className="text-white font-bold text-sm">الدردشة العامة</h3>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-xs text-gold/60 mb-1">{msg.username}</span>
              <div className={`p-2 max-w-[80%] ${
                msg.username === user?.username
                  ? "bg-gold/90 text-black rounded-t-2xl rounded-l-2xl rounded-br-sm mr-auto"
                  : "bg-white/90 text-black rounded-t-2xl rounded-r-2xl rounded-bl-sm border-2 border-gold/30"
              }`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gold/10 bg-black/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 text-sm"
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
  );
}
