import { useState, useEffect, useCallback, useRef } from "react";

// تعريف أنواع البيانات
export interface Player {
  id: number;
  username: string;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number | null;
}

export interface GameHistory {
  id: number;
  multiplier: number;
  crashed_at: string;
}

export interface GameState {
  status: 'waiting' | 'flying' | 'crashed';
  countdown: number;
  currentMultiplier: number | null;
  crashPoint?: number;
  players: Player[];
  gameHistory: GameHistory[];
}

export interface UseEgyptRocketSocket {
  gameState: GameState;
  placeBet: (amount: number, autoCashout?: number | null) => void;
  cashout: () => void;
  isConnected: boolean;
  error: string | null;
}

// هوك لإدارة اتصال WebSocket للعبة صاروخ مصر
export function useEgyptRocketSocket(): UseEgyptRocketSocket {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    countdown: 10,
    currentMultiplier: null,
    players: [],
    gameHistory: []
  });

  // إنشاء اتصال WebSocket
  useEffect(() => {
    // في الإنتاج، سيتم استخدام عنوان الخادم الحقيقي
    const socketUrl = import.meta.env.PROD
      ? `wss://${window.location.host}/ws/egypt-rocket`
      : `ws://${window.location.host}/ws/egypt-rocket`;

    const connect = () => {
      try {
        const ws = new WebSocket(socketUrl);
        
        ws.onopen = () => {
          console.log("تم الاتصال بخادم صاروخ مصر");
          setIsConnected(true);
          setError(null);
        };
        
        ws.onclose = (event) => {
          if (event.wasClean) {
            console.log(`تم إغلاق الاتصال بشكل نظيف، الكود: ${event.code}, السبب: ${event.reason}`);
          } else {
            console.error('تم قطع الاتصال');
            setError("تم فقدان الاتصال بالخادم. يرجى تحديث الصفحة.");
          }
          setIsConnected(false);
          
          // محاولة إعادة الاتصال بعد 3 ثوانٍ
          setTimeout(connect, 3000);
        };
        
        ws.onerror = (error) => {
          console.error("خطأ في اتصال WebSocket:", error);
          setError("حدث خطأ في الاتصال بالخادم.");
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("رسالة من الخادم:", data);
            
            // معالجة الرسائل من الخادم بناءً على نوعها
            if (data.type === "game_state") {
              setGameState(data.state);
            } else if (data.type === "countdown") {
              setGameState(prev => ({ ...prev, countdown: data.seconds, status: 'waiting' }));
            } else if (data.type === "game_start") {
              setGameState(prev => ({ ...prev, status: 'flying', currentMultiplier: 1, countdown: 0 }));
            } else if (data.type === "multiplier_update") {
              setGameState(prev => ({ ...prev, currentMultiplier: data.multiplier }));
            } else if (data.type === "game_crash") {
              setGameState(prev => ({ 
                ...prev, 
                status: 'crashed', 
                crashPoint: data.crashPoint,
                currentMultiplier: data.crashPoint
              }));
            } else if (data.type === "players_update") {
              setGameState(prev => ({ ...prev, players: data.players }));
            } else if (data.type === "history_update") {
              setGameState(prev => ({ ...prev, gameHistory: data.history }));
            } else if (data.type === "error") {
              setError(data.message);
            }
          } catch (error) {
            console.error("خطأ في معالجة رسالة WebSocket:", error);
          }
        };
        
        socketRef.current = ws;
        
        // تنظيف عند إلغاء التحميل
        return () => {
          ws.close();
        };
      } catch (error) {
        console.error("خطأ في إنشاء اتصال WebSocket:", error);
        setError("فشل الاتصال بالخادم. يرجى تحديث الصفحة.");
        
        // محاولة إعادة الاتصال بعد 3 ثوانٍ
        setTimeout(connect, 3000);
      }
    };
    
    connect();
    
    // تنظيف عند إلغاء التحميل المكون
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // إرسال رهان إلى الخادم
  const placeBet = useCallback((amount: number, autoCashout: number | null = null) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "place_bet",
        amount,
        autoCashout
      }));
    } else {
      setError("غير متصل بالخادم. لا يمكن وضع رهان.");
    }
  }, []);

  // إرسال طلب سحب إلى الخادم
  const cashout = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "cashout"
      }));
    } else {
      setError("غير متصل بالخادم. لا يمكن السحب.");
    }
  }, []);

  return {
    gameState,
    placeBet,
    cashout,
    isConnected,
    error
  };
}