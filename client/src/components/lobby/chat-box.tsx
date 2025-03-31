
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User } from "lucide-react";

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
    const handler = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    };

    registerHandler("chat_message", handler);
  }, [registerHandler]);

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
    <div className="flex flex-col h-[400px] rounded-lg border border-gold/10 overflow-hidden bg-[url('/attached_assets/gradient-poker-table-background_23-2151085419 (1).jpg')] bg-cover bg-center">
      <div className="px-4 py-2 border-b border-gold/10">
        <h3 className="text-gold font-bold">الدردشة</h3>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.username === user?.username ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-gold/60" />
                </div>
                <span className="text-sm text-gold/60">{msg.username}</span>
              </div>
              <div className={`max-w-[80%] px-3 py-2 ${
                msg.username === user?.username
                ? "bg-white/90 text-black rounded-t-2xl rounded-l-2xl rounded-br-sm border-2 border-gold/30"
                : "bg-white/90 text-black rounded-t-2xl rounded-r-2xl rounded-bl-sm border-2 border-gold/30"
              }`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gold/10">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1"
          />
          <Button
            onClick={sendChatMessage}
            className="bg-gold hover:bg-gold/80 text-black"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
