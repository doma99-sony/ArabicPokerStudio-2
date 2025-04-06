import { useState, useEffect, useCallback } from "react";
import { 
  egyptRocketSocket, 
  GameState, 
  initialGameState,
  ConnectionStatus
} from "../egypt-rocket-websocket";

/**
 * واجهة هوك استخدام لعبة صاروخ مصر
 */
export interface UseEgyptRocketGame {
  gameState: GameState;
  placeBet: (amount: number, autoCashout?: number | null) => boolean;
  cashout: () => boolean;
  isConnected: boolean;
  error: string | null;
}

/**
 * هوك استخدام لعبة صاروخ مصر
 * يوفر واجهة بسيطة للتفاعل مع اللعبة
 */
export function useEgyptRocketGame(): UseEgyptRocketGame {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // معالجة تغيرات حالة الاتصال
  const handleStatusChange = useCallback((status: ConnectionStatus, errorMessage?: string) => {
    console.log(`تغير حالة اتصال صاروخ مصر: ${status}`);
    
    switch (status) {
      case 'connected':
        setIsConnected(true);
        setError(null);
        break;
      case 'connecting':
        setIsConnected(false);
        setError("جارِ الاتصال بالخادم...");
        break;
      case 'disconnected':
        setIsConnected(false);
        setError("تم قطع الاتصال بالخادم. جاري إعادة الاتصال...");
        break;
      case 'error':
        setIsConnected(false);
        setError(errorMessage || "حدث خطأ أثناء الاتصال بالخادم");
        break;
    }
  }, []);

  // معالجة الرسائل الواردة
  const handleMessage = useCallback((message: any) => {
    if (message.type === "game_state") {
      setGameState(message.state);
    } else if (message.type === "connection_status" && message.connected) {
      setIsConnected(true);
      setError(null);
    } else if (message.type === "error") {
      setError(message.message || "حدث خطأ غير محدد");
    }
  }, []);

  // الاتصال بالخادم عند تحميل المكون
  useEffect(() => {
    console.log("بدء اتصال صاروخ مصر...");
    
    // تسجيل معالجات الأحداث
    const removeStatusListener = egyptRocketSocket.onStatusChange(handleStatusChange);
    const removeMessageListener = egyptRocketSocket.onMessage(handleMessage);
    
    // بدء الاتصال
    egyptRocketSocket.connect();
    
    // الحصول على الحالة الأولية
    setGameState(egyptRocketSocket.getState());
    
    // تنظيف عند إلغاء التحميل
    return () => {
      removeStatusListener();
      removeMessageListener();
      egyptRocketSocket.disconnect();
    };
  }, [handleStatusChange, handleMessage]);

  // وضع رهان
  const placeBet = useCallback((amount: number, autoCashout: number | null = null): boolean => {
    return egyptRocketSocket.placeBet(amount, autoCashout);
  }, []);

  // سحب الأموال
  const cashout = useCallback((): boolean => {
    return egyptRocketSocket.cashout();
  }, []);

  return {
    gameState,
    placeBet,
    cashout,
    isConnected,
    error
  };
}

export default useEgyptRocketGame;