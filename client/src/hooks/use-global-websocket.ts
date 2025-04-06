import { create } from 'zustand';
import { useState, useEffect, useRef, useCallback } from 'react';

// تعريف أنواع الرسائل المختلفة
export type WebSocketMessageType = 
  | 'auth'
  | 'join_table'
  | 'rejoin_table'  // إضافة نوع للاتصال من جديد
  | 'leave_table'
  | 'game_action'
  | 'game_state'
  | 'error'
  | 'player_list'
  | 'ping'
  | 'pong';

// تعريف هيكل رسالة WebSocket
export interface WebSocketMessage {
  type: WebSocketMessageType;
  [key: string]: any;
}

// تعريف مستمع للرسائل القادمة
export type WebSocketMessageListener = (message: WebSocketMessage) => void;

// حالة اتصال WebSocket
interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  connecting: boolean;
  lastMessage: WebSocketMessage | null;
  listeners: Map<string, Set<WebSocketMessageListener>>;
  connection: WebSocket | null;
  userId: number | null;
  
  // الوظائف
  connect: (userId: number) => void;
  disconnect: () => void;
  sendMessage: (message: WebSocketMessage) => boolean;
  sendGameAction: (tableId: number, action: string, amount?: number) => boolean;
  addMessageListener: (type: WebSocketMessageType, listener: WebSocketMessageListener) => () => void;
  removeMessageListener: (type: WebSocketMessageType, listener: WebSocketMessageListener) => void;
}

// خلق مخزن مركزي لحالة WebSocket
export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  isConnected: false,
  error: null,
  connecting: false,
  lastMessage: null,
  listeners: new Map(),
  connection: null,
  userId: null,
  
  connect: (userId: number) => {
    const { connection, connecting } = get();
    
    // إذا كان الاتصال قائماً بالفعل أو في طور الاتصال، لا تفعل شيئاً
    if (connection || connecting) return;
    
    // تخزين معرف المستخدم في localStorage للاستعادة في حالة انقطاع الاتصال
    localStorage.setItem('userId', userId.toString());
    
    // إعادة تعيين عدد محاولات إعادة الاتصال عند الاتصال المتعمد
    localStorage.setItem('wsReconnectAttempts', '0');
    
    set({ connecting: true, userId });
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // نُضيف علامة مميزة للجلسة للتمييز بين الجلسات المختلفة
    const sessionToken = localStorage.getItem('sessionToken') || 
      `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    // تخزين علامة الجلسة
    localStorage.setItem('sessionToken', sessionToken);
    
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?sid=${sessionToken}&uid=${userId}&ts=${Date.now()}`;
    
    console.log("إنشاء اتصال WebSocket عمومي جديد:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("تم فتح اتصال WebSocket العمومي بنجاح");
      set({ isConnected: true, error: null, connecting: false, connection: ws });
      
      // إرسال رسالة المصادقة عند الاتصال
      const authMessage: WebSocketMessage = {
        type: 'auth',
        userId,
        timestamp: Date.now()
      };
      
      ws.send(JSON.stringify(authMessage));
      
      // إرسال رسالة اختبار
      const pingMessage: WebSocketMessage = {
        type: 'ping',
        time: Date.now(),
        message: 'مرحبا من خدمة WebSocket العمومية'
      };
      
      ws.send(JSON.stringify(pingMessage));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        console.log("رسالة واردة من WebSocket العمومي:", data);
        
        // تحديث آخر رسالة مستلمة
        set({ lastMessage: data });
        
        // إرسال الرسالة إلى جميع المستمعين المهتمين بهذا النوع
        const listeners = get().listeners.get(data.type);
        if (listeners) {
          listeners.forEach(listener => {
            try {
              listener(data);
            } catch (error) {
              console.error("خطأ في معالجة المستمع:", error);
            }
          });
        }
      } catch (error) {
        console.error("خطأ في تحليل رسالة WebSocket:", error);
      }
    };
    
    ws.onclose = (event) => {
      console.log(`تم إغلاق اتصال WebSocket العمومي (كود: ${event.code})`, event.reason);
      set({ isConnected: false, connection: null });
      
      // محاولة إعادة الاتصال تلقائياً بغض النظر عن سبب الإغلاق 
      // للحفاظ على الاتصال حتى عند تغيير الصفحات
      console.log("جدولة إعادة اتصال WebSocket العمومي...");
      
      // استراتيجية إعادة اتصال تدريجية - زيادة فترة الانتظار مع المحاولات
      let reconnectAttempts = localStorage.getItem('wsReconnectAttempts') 
        ? parseInt(localStorage.getItem('wsReconnectAttempts') || '0') 
        : 0;
      
      // زيادة عدد المحاولات وتخزينه
      reconnectAttempts++;
      localStorage.setItem('wsReconnectAttempts', reconnectAttempts.toString());
      
      // حساب فترة الانتظار بين المحاولات (1-10 ثوانٍ)
      const delay = Math.min(3000 * Math.pow(1.2, Math.min(reconnectAttempts, 5)), 10000);
      
      setTimeout(() => {
        const state = get();
        if (state.userId) {
          console.log(`محاولة إعادة اتصال #${reconnectAttempts}`);
          state.connect(state.userId);
        } else {
          // استعادة معرف المستخدم من التخزين المحلي إذا كان متاحاً
          const storedUserId = localStorage.getItem('userId');
          if (storedUserId) {
            const userId = parseInt(storedUserId);
            console.log(`استعادة اتصال للمستخدم ${userId} من التخزين المحلي`);
            state.connect(userId);
          }
        }
      }, delay);
    };
    
    ws.onerror = (event) => {
      console.error("خطأ في اتصال WebSocket العمومي:", event);
      set({ error: new Error("حدثت مشكلة في اتصال WebSocket") });
    };
  },
  
  disconnect: () => {
    const { connection } = get();
    if (connection) {
      // إرسال رسالة إغلاق نظيفة
      try {
        connection.close(1000, "إغلاق متعمد من العميل");
      } catch (error) {
        console.error("خطأ أثناء إغلاق اتصال WebSocket:", error);
      }
    }
    
    // مسح معلومات المستخدم من التخزين المحلي عند تسجيل الخروج المتعمد
    localStorage.removeItem('userId');
    localStorage.removeItem('wsReconnectAttempts');
    // لا نقوم بمسح sessionToken للحفاظ على معرف الجلسة للتتبع
    
    set({ isConnected: false, connection: null, userId: null });
  },
  
  sendMessage: (message: WebSocketMessage) => {
    const { connection, isConnected } = get();
    
    if (connection && isConnected) {
      try {
        connection.send(JSON.stringify(message));
        console.log("تم إرسال رسالة WebSocket:", message);
        return true;
      } catch (error) {
        console.error("خطأ في إرسال رسالة WebSocket:", error);
        return false;
      }
    }
    
    console.error('لا يمكن إرسال الرسالة. WebSocket غير متصل.');
    return false;
  },
  
  sendGameAction: (tableId: number, action: string, amount?: number) => {
    const message: WebSocketMessage = {
      type: 'game_action',
      tableId,
      action,
      amount,
      timestamp: Date.now()
    };
    
    return get().sendMessage(message);
  },
  
  addMessageListener: (type: WebSocketMessageType, listener: WebSocketMessageListener) => {
    const { listeners } = get();
    
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    
    const typeListeners = listeners.get(type)!;
    typeListeners.add(listener);
    
    // تحديث المخزن بمجموعة المستمعين الجديدة
    set({ listeners: new Map(listeners) });
    
    // إرجاع دالة لإزالة المستمع
    return () => {
      get().removeMessageListener(type, listener);
    };
  },
  
  removeMessageListener: (type: WebSocketMessageType, listener: WebSocketMessageListener) => {
    const { listeners } = get();
    
    if (listeners.has(type)) {
      const typeListeners = listeners.get(type)!;
      typeListeners.delete(listener);
      
      // إذا لم يعد هناك مستمعون لهذا النوع، قم بإزالة المجموعة
      if (typeListeners.size === 0) {
        listeners.delete(type);
      }
      
      // تحديث المخزن بمجموعة المستمعين الجديدة
      set({ listeners: new Map(listeners) });
    }
  }
}));

// Hook مساعد لاستخدام WebSocket في المكونات
export function useGlobalWebSocket() {
  const { 
    isConnected, 
    error, 
    connect, 
    disconnect,
    sendMessage,
    sendGameAction,
    addMessageListener,
    removeMessageListener,
    lastMessage 
  } = useWebSocketStore();
  
  // نسخة من addMessageListener تستخدم useCallback لضمان استقرار المراجع
  const onMessage = useCallback((type: WebSocketMessageType, listener: WebSocketMessageListener) => {
    return addMessageListener(type, listener);
  }, [addMessageListener]);
  
  // مستمعو الرسائل المخصصة (مجموعة من المستمعين لجميع أنواع الرسائل)
  const customHandlersRef = useRef<Map<string, (message: any) => void>>(new Map());
  
  // إضافة مستمع مخصص للرسائل
  const addMessageHandler = useCallback((handlerId: string, handler: (message: any) => void) => {
    // تخزين المستمع باستخدام معرف فريد
    customHandlersRef.current.set(handlerId, handler);
    
    // إذا لم يكن لدينا مستمع عام بعد، أضفه الآن
    if (!customHandlersRef.current.has('_global_listener')) {
      // إنشاء مستمع عام يوجه الرسائل لجميع المستمعين المسجلين
      const globalListener = (message: WebSocketMessage) => {
        // توجيه الرسالة لجميع المستمعين المخصصين
        customHandlersRef.current.forEach((handler, id) => {
          if (id !== '_global_listener') {
            try {
              handler(message);
            } catch (error) {
              console.error(`خطأ في معالج الرسائل ${id}:`, error);
            }
          }
        });
      };
      
      // تسجيل المستمع العام لجميع أنواع الرسائل الممكنة
      const messageTypes: WebSocketMessageType[] = [
        'auth', 'join_table', 'rejoin_table', 'leave_table', 
        'game_action', 'game_state', 'error', 'player_list', 'ping', 'pong'
      ];
      
      // نحن نخزن وظائف الإزالة لكل نوع من الرسائل
      const removeListeners: (() => void)[] = [];
      
      messageTypes.forEach(type => {
        const removeListener = addMessageListener(type, globalListener);
        removeListeners.push(removeListener);
      });
      
      // تخزين وظيفة تنظيف لإزالة المستمع العام عند الحاجة
      customHandlersRef.current.set('_global_listener', () => {
        removeListeners.forEach(remove => remove());
      });
    }
  }, [addMessageListener]);
  
  // إزالة مستمع مخصص
  const removeMessageHandler = useCallback((handlerId: string) => {
    // إزالة المستمع باستخدام المعرف
    customHandlersRef.current.delete(handlerId);
    
    // إذا لم يعد هناك مستمعون مخصصون (فقط المستمع العام)، قم بإزالة المستمع العام
    if (customHandlersRef.current.size === 1 && customHandlersRef.current.has('_global_listener')) {
      const cleanupGlobalListener = customHandlersRef.current.get('_global_listener') as () => void;
      cleanupGlobalListener();
      customHandlersRef.current.delete('_global_listener');
    }
  }, []);
  
  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendMessage,
    sendGameAction,
    onMessage,
    lastMessage,
    addMessageHandler,
    removeMessageHandler
  };
}