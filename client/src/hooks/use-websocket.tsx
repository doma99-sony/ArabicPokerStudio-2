import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

const WEBSOCKET_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  
  const connect = useCallback(() => {
    if (!user?.id) return;
    
    try {
      const ws = new WebSocket(WEBSOCKET_URL);
      
      ws.onopen = () => {
        console.log("WebSocket connection established");
        reconnectAttemptsRef.current = 0;
        setSocket(ws);
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setSocket(null);
        
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, RECONNECT_DELAY * Math.min(reconnectAttemptsRef.current + 1, 5));
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
      
      return ws;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      return null;
    }
  }, [user?.id]);
  
  useEffect(() => {
    const ws = connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }, [socket]);

  return { socket, sendMessage };
}

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

export function useWebSocket() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // Create WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Determine the correct host and protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`; // Use the explicit path we set on the server

    // Create new WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => {
      setStatus("open");
      console.log("WebSocket connection established");
      
      // Authenticate with the server
      if (user) {
        sendMessage({
          type: "auth",
          userId: user.id
        });
      }
    };

    socket.onclose = () => {
      setStatus("closed");
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      setStatus("error");
      console.error("WebSocket error:", error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type } = message;
        
        // Handle standard message types
        if (type === "error") {
          toast({
            title: "خطأ",
            description: message.message,
            variant: "destructive",
          });
        }
        
        // Call any registered handlers for this message type
        const handler = messageHandlersRef.current.get(type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    return () => {
      console.log("Closing WebSocket connection");
      socket.close();
      socketRef.current = null;
    };
  }, [user, toast]);

  // Send message via WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Register a message handler
  const registerHandler = useCallback((type: string, handler: (data: any) => void) => {
    messageHandlersRef.current.set(type, handler);
    
    // Return function to unregister handler
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  // Join a game table
  const joinTable = useCallback((tableId: number) => {
    return sendMessage({
      type: "join_table",
      tableId
    });
  }, [sendMessage]);

  // Leave a game table
  const leaveTable = useCallback((tableId: number) => {
    return sendMessage({
      type: "leave_table",
      tableId
    });
  }, [sendMessage]);

  // Perform a game action
  const performGameAction = useCallback((action: string, amount?: number) => {
    return sendMessage({
      type: "game_action",
      action,
      amount
    });
  }, [sendMessage]);

  return {
    status,
    sendMessage,
    registerHandler,
    joinTable,
    leaveTable,
    performGameAction
  };
}