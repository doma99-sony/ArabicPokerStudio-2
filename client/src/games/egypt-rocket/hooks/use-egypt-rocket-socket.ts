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
    const getSocketUrl = () => {
      // في الإنتاج، سيتم استخدام عنوان الخادم الحقيقي
      // استخدام النمط "//" لجعل البروتوكول يتوافق مع الصفحة (ws أو wss)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws/egypt-rocket`;
    };

    const socketUrl = getSocketUrl();
    console.log(`محاولة الاتصال بخادم صاروخ مصر على: ${socketUrl}`);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        // فصل الاتصال القديم إذا كان موجوداً
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }

        // تحقق أولاً من حالة خادم صاروخ مصر
        fetch('/api/egypt-rocket/status')
          .then(response => {
            if (!response.ok) {
              throw new Error("خادم بايثون غير متاح");
            }
            return response.json();
          })
          .then(data => {
            if (!data.running) {
              throw new Error("خادم بايثون غير نشط");
            }

            // إنشاء اتصال WebSocket بعد التأكد من حالة الخادم
            const ws = new WebSocket(socketUrl);
            
            ws.onopen = () => {
              console.log("تم الاتصال بخادم صاروخ مصر بنجاح");
              setIsConnected(true);
              setError(null);
              reconnectAttempts = 0; // إعادة تعيين عدد محاولات إعادة الاتصال
            };
            
            ws.onclose = (event) => {
              if (event.wasClean) {
                console.log(`تم إغلاق الاتصال بشكل نظيف، الكود: ${event.code}, السبب: ${event.reason}`);
              } else {
                console.error('تم قطع الاتصال بشكل غير متوقع');
              }
              setIsConnected(false);
              
              // محاولة إعادة الاتصال إذا لم يتجاوز الحد الأقصى
              if (reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // زيادة مدة الانتظار تدريجياً
                console.log(`محاولة إعادة الاتصال بعد ${delay}ms (محاولة ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
                setError(`فقدان الاتصال بالخادم. محاولة إعادة الاتصال... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
                reconnectTimeout = setTimeout(connect, delay);
                reconnectAttempts++;
              } else {
                setError("تعذر الاتصال بالخادم بعد عدة محاولات. يرجى تحديث الصفحة.");
              }
            };
            
            ws.onerror = (error) => {
              console.error("خطأ في اتصال WebSocket:", error);
            };
            
            ws.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                console.log("رسالة من خادم صاروخ مصر:", data);
                
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
                } else if (data.type === "bet_response" || data.type === "cash_out_response") {
                  // معالجة استجابات المراهنة والسحب
                  if (!data.success) {
                    setError(data.message || 'حدث خطأ أثناء معالجة طلبك');
                  }
                }
              } catch (error) {
                console.error("خطأ في معالجة رسالة WebSocket:", error);
              }
            };
            
            socketRef.current = ws;
          })
          .catch(error => {
            console.error("خطأ في التحقق من حالة خادم صاروخ مصر:", error);
            setError("خادم صاروخ مصر غير متاح حاليًا. يرجى تحديث الصفحة أو المحاولة لاحقًا.");
            
            // محاولة إعادة الاتصال إذا لم يتجاوز الحد الأقصى
            if (reconnectAttempts < maxReconnectAttempts) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
              console.log(`محاولة التحقق من حالة الخادم مرة أخرى بعد ${delay}ms`);
              reconnectTimeout = setTimeout(connect, delay);
              reconnectAttempts++;
            }
          });
      } catch (error) {
        console.error("خطأ في إنشاء اتصال WebSocket:", error);
        setError("فشل الاتصال بالخادم. يرجى تحديث الصفحة.");
        
        // محاولة إعادة الاتصال إذا لم يتجاوز الحد الأقصى
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          reconnectTimeout = setTimeout(connect, delay);
          reconnectAttempts++;
        }
      }
    };
    
    // بدء محاولة الاتصال
    connect();
    
    // تنظيف عند إلغاء التحميل المكون
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
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