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
  const [showChat, setShowChat] = useState(false);
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
    <div className="w-full">
      <div 
        className="cursor-pointer bg-[#1B4D3E] hover:bg-[#2A6E5B] p-4 rounded-lg flex items-center justify-between"
        onClick={() => setShowChat(!showChat)}
      >
        <h3 className="text-white font-bold">الدردشة العامة</h3>
        <span className="text-sm text-white/70">
          {showChat ? "إخفاء الدردشة" : "اضغط للدردشة"}
        </span>
      </div>

      {showChat && (
        <div className="mt-4 bg-black/50 rounded-lg border border-gold/10 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-[300px] p-4">
            <div className="space-y-4">
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
      )}
    </div>
  );
}