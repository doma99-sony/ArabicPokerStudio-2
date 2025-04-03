import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onOpen?: (ws: WebSocket) => void;
  onMessage?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export default function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
) {
  const {
    autoReconnect = true,
    reconnectAttempts = 15,
    reconnectDelay = 1000,
    onOpen,
    onMessage,
    onClose,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Event | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // الرسالة الأخيرة التي تم استلامها
  const [lastMessage, setLastMessage] = useState<any>(null);

  // إرسال رسالة إلى الخادم
  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      console.log(`إرسال رسالة WebSocket:`, data);
      webSocketRef.current.send(message);
      return true;
    }
    console.error('لا يمكن إرسال الرسالة. WebSocket غير متصل.');
    return false;
  }, []);
  
  // إرسال إجراء لعبة 
  const sendGameAction = useCallback((tableId: number, action: string, amount?: number) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'game_action',
        tableId,
        action,
        amount,
        timestamp: Date.now()
      };
      console.log(`إرسال إجراء لعبة عبر WebSocket:`, message);
      webSocketRef.current.send(JSON.stringify(message));
      return true;
    }
    console.error('لا يمكن إرسال إجراء اللعبة. WebSocket غير متصل.');
    return false;
  }, []);

  // إنشاء اتصال WebSocket جديد
  const connectWebSocket = useCallback(() => {
    if (!url) return;

    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    console.log(`إنشاء اتصال WebSocket جديد: ${url}`);
    const ws = new WebSocket(url);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('تم فتح اتصال WebSocket بنجاح');
      setIsConnected(true);
      setError(null);
      reconnectCountRef.current = 0;
      if (onOpen) onOpen(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('خطأ في تحليل رسالة WebSocket:', e);
        setLastMessage(event.data);
        if (onMessage) onMessage(event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(`تم إغلاق اتصال WebSocket. الرمز: ${event.code}، السبب: ${event.reason}`);
      setIsConnected(false);
      if (onClose) onClose();

      if (autoReconnect && reconnectCountRef.current < reconnectAttempts) {
        const delay = reconnectDelay * Math.pow(1.5, Math.min(reconnectCountRef.current, 5));
        console.log(`جدولة إعادة الاتصال (المحاولة ${reconnectCountRef.current + 1}/${reconnectAttempts})...`);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          reconnectCountRef.current += 1;
          console.log(`محاولة إعادة الاتصال رقم ${reconnectCountRef.current}...`);
          connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = (event) => {
      console.error('خطأ في اتصال WebSocket:', event);
      setError(event);
      if (onError) onError(event);
    };
  }, [url, autoReconnect, reconnectAttempts, reconnectDelay, onOpen, onMessage, onClose, onError]);

  // إنشاء اتصال عند تحميل المكون
  useEffect(() => {
    if (url) {
      connectWebSocket();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
    };
  }, [url, connectWebSocket]);

  return {
    isConnected,
    error,
    sendMessage,
    sendGameAction,
    lastMessage,
    webSocket: webSocketRef.current,
    reconnect: connectWebSocket
  };
}