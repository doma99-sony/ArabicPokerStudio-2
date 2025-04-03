import { useState, useEffect, useCallback } from 'react';
import { useGlobalWebSocket, WebSocketMessageType } from './use-global-websocket';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { useLocalStorage } from './use-local-storage';

// واجهة معلومات الجلسة
interface SessionInfo {
  sessionId: string;
  lastActiveTableId?: number;
  lastActivePage?: string;
  lastPosition?: number;
  connected: boolean;
  reconnectAttempts: number;
  lastConnectionTime: number;
  lastDisconnectTime?: number;
  isReconnecting: boolean;
}

// الوقت بالمللي ثانية بين محاولات إعادة الاتصال
const RECONNECT_INTERVAL = 3000;
// الحد الأقصى لعدد محاولات إعادة الاتصال
const MAX_RECONNECT_ATTEMPTS = 10;
// الوقت الذي يمكن للاعب العودة خلاله بعد قطع الاتصال (بالمللي ثانية)
const SESSION_TIMEOUT = 30 * 1000; // 30 ثانية

export function useSessionManager() {
  const { isConnected, connect, disconnect, onMessage, sendMessage } = useGlobalWebSocket();
  const auth = useAuth();
  const { toast } = useToast();
  
  // استخدام التخزين المحلي لحفظ معلومات الجلسة
  const [sessionInfo, setSessionInfo] = useLocalStorage<SessionInfo>('pokerSessionInfo', {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    connected: false,
    reconnectAttempts: 0,
    lastConnectionTime: 0,
    isReconnecting: false
  });
  
  // حالة إذا كانت الجلسة مؤقتة (أي أن المستخدم ضيف)
  const [isTemporarySession, setIsTemporarySession] = useState(false);
  
  // عند التحميل، تحقق مما إذا كان المستخدم ضيفًا
  useEffect(() => {
    if (auth.user) {
      setIsTemporarySession(auth.user.isGuest || false);
    }
  }, [auth.user]);
  
  // الاتصال عند تسجيل الدخول
  useEffect(() => {
    if (auth.user && !isConnected) {
      connect(auth.user.id);
      
      setSessionInfo(prev => ({
        ...prev,
        lastConnectionTime: Date.now(),
        connected: true,
        reconnectAttempts: 0
      }));
    }
  }, [auth.user, isConnected, connect, setSessionInfo]);
  
  // عند قطع الاتصال، حاول إعادة الاتصال
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout | null = null;
    
    if (auth.user && !isConnected && sessionInfo.connected) {
      // تسجيل وقت قطع الاتصال
      const disconnectTime = Date.now();
      
      setSessionInfo(prev => ({
        ...prev,
        connected: false,
        lastDisconnectTime: disconnectTime,
        isReconnecting: true
      }));
      
      // محاولة إعادة الاتصال
      const attemptReconnect = () => {
        if (!auth.user) return;
        
        setSessionInfo(prev => {
          // إذا تجاوزنا الحد الأقصى لمحاولات إعادة الاتصال، توقف
          if (prev.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            toast({
              title: "فشل إعادة الاتصال",
              description: "تعذر الاتصال بالخادم بعد عدة محاولات. يرجى تحديث الصفحة.",
              variant: "destructive",
            });
            
            return { ...prev, isReconnecting: false };
          }
          
          // إذا مرت فترة طويلة منذ قطع الاتصال، اعتبر الجلسة منتهية
          if (prev.lastDisconnectTime && (Date.now() - prev.lastDisconnectTime > SESSION_TIMEOUT)) {
            toast({
              title: "انتهت الجلسة",
              description: "انتهت جلستك بسبب طول فترة الانقطاع. يرجى تسجيل الدخول مرة أخرى.",
              variant: "destructive",
            });
            
            return { ...prev, isReconnecting: false };
          }
          
          // زيادة عدد محاولات إعادة الاتصال
          const newAttempts = prev.reconnectAttempts + 1;
          console.log(`محاولة إعادة الاتصال ${newAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
          
          // محاولة إعادة الاتصال
          connect(auth.user!.id);
          
          // جدولة المحاولة التالية بعد فترة زمنية
          reconnectTimer = setTimeout(attemptReconnect, RECONNECT_INTERVAL);
          
          return { ...prev, reconnectAttempts: newAttempts };
        });
      };
      
      // بدء محاولات إعادة الاتصال بعد وقت قصير
      reconnectTimer = setTimeout(attemptReconnect, 1000);
    }
    
    // إذا اتصلنا بنجاح، أعد تعيين حالة إعادة الاتصال
    if (isConnected && sessionInfo.isReconnecting) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      setSessionInfo(prev => ({
        ...prev,
        connected: true,
        isReconnecting: false,
        reconnectAttempts: 0,
        lastConnectionTime: Date.now(),
        lastDisconnectTime: undefined
      }));
      
      // إرسال رسالة إعادة اتصال للخادم
      if (sessionInfo.lastActiveTableId) {
        sendMessage({
          type: 'rejoin_table',
          tableId: sessionInfo.lastActiveTableId,
          sessionId: sessionInfo.sessionId,
          userId: auth.user?.id,
          position: sessionInfo.lastPosition,
          timestamp: Date.now()
        });
        
        toast({
          title: "تم إعادة الاتصال",
          description: "تم إعادة الاتصال بالخادم بنجاح. جاري العودة إلى طاولة اللعب...",
        });
      } else {
        toast({
          title: "تم إعادة الاتصال",
          description: "تم إعادة الاتصال بالخادم بنجاح.",
        });
      }
    }
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [isConnected, auth.user, sessionInfo.connected, sessionInfo.isReconnecting, sessionInfo.lastActiveTableId, sessionInfo.lastPosition, sessionInfo.sessionId, connect, toast, sendMessage, setSessionInfo]);
  
  // حفظ معلومات الطاولة النشطة
  const setActiveTable = useCallback((tableId: number, position?: number) => {
    setSessionInfo(prev => ({
      ...prev,
      lastActiveTableId: tableId,
      lastPosition: position
    }));
  }, [setSessionInfo]);
  
  // حفظ معلومات الصفحة النشطة
  const setActivePage = useCallback((page: string) => {
    setSessionInfo(prev => ({
      ...prev,
      lastActivePage: page
    }));
  }, [setSessionInfo]);
  
  // مسح معلومات الجلسة عند تسجيل الخروج
  const clearSession = useCallback(() => {
    setSessionInfo({
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      connected: false,
      reconnectAttempts: 0,
      lastConnectionTime: 0,
      isReconnecting: false
    });
    
    // قطع اتصال WebSocket
    disconnect();
  }, [setSessionInfo, disconnect]);
  
  return {
    isConnected,
    sessionId: sessionInfo.sessionId,
    lastActiveTableId: sessionInfo.lastActiveTableId,
    lastActivePage: sessionInfo.lastActivePage,
    isReconnecting: sessionInfo.isReconnecting,
    reconnectAttempts: sessionInfo.reconnectAttempts,
    isTemporarySession,
    
    setActiveTable,
    setActivePage,
    clearSession
  };
}