
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col h-[400px] rounded-lg border border-emerald-600/30 overflow-hidden relative" 
         style={{
           backgroundImage: "url(/attached_assets/gradient-poker-table-background_23-2151085419%20(1).jpg)",
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="px-4 py-2 bg-emerald-900/80 border-b border-emerald-600/30">
        <h3 className="text-emerald-400 font-bold">الدردشة</h3>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-black/30">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.username === user?.username ? "items-end" : "items-start"
              }`}
            >
              <span className="text-sm text-emerald-400/80">{msg.username}</span>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-lg ${
                msg.username === user?.username
                ? "bg-gradient-to-r from-emerald-600/90 to-emerald-500/90 text-black border-2 border-emerald-400/30"
                : "bg-gradient-to-r from-slate-800/90 to-slate-700/90 text-black border-2 border-emerald-600/30"
              }`}
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 75%, 95% 75%, 95% 100%, 85% 75%, 0% 75%)"
              }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 bg-emerald-900/80 border-t border-emerald-600/30">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-black/50 border-emerald-600/30 text-emerald-100"
          />
          <Button
            onClick={sendChatMessage}
            className="bg-emerald-600 hover:bg-emerald-500 text-black"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
