/**
 * متجر حالة البوكر باستخدام Zustand
 * يتيح إدارة حالة اللعبة بشكل مركزي وربطها مع واجهة المستخدم والخادم
 */
import { create } from 'zustand';
import { SocketManager, SocketMessageType } from '../logic/socket-manager';
import { GameState, GamePlayer, WinnerInfo, ActionResult } from '../logic/game-manager';
import { PlayerAction, GamePhase, Card } from '../logic/poker-engine';

/**
 * واجهة حالة متجر البوكر
 */
interface PokerStore {
  // حالة اللعبة
  gameState: GameState | null;
  localPlayerId: number | null;
  socketManager: SocketManager | null;
  isConnected: boolean;
  isJoining: boolean;
  currentAction: string | null;
  actionInProgress: boolean;
  errorMessage: string | null;
  chatMessages: ChatMessageType[];
  soundEnabled: boolean;
  
  // الأحداث
  winners: WinnerInfo[] | null;
  
  // الإجراءات
  initializeSocket: (userId: number, username: string) => Promise<boolean>;
  closeSocket: () => void;
  joinTable: (tableId: number, chips: number) => Promise<boolean>;
  leaveTable: () => void;
  performAction: (action: PlayerAction, amount?: number) => Promise<boolean>;
  sendChatMessage: (message: string) => void;
  addSystemMessage: (message: string) => void; // إضافة رسالة نظام
  getWinnersText: (winners: WinnerInfo[]) => string; // الحصول على نص الفائزين
  resetGame: () => void;
  setErrorMessage: (message: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  clearWinners: () => void;
  
  // معلومات اللاعب المحلي
  getLocalPlayer: () => GamePlayer | null;
  canCheck: () => boolean;
  canRaise: () => boolean;
  getMinRaise: () => number;
  getMaxRaise: () => number;
  getCommunityCards: () => Card[];
  getCurrentPhase: () => GamePhase;
  
  // التصفيات والتحولات
  getActivePlayers: () => GamePlayer[];
  isPlayerTurn: () => boolean;
  getActionDescription: (action: string, player: GamePlayer, amount?: number) => string;
}

/**
 * نوع رسالة الدردشة
 */
export interface ChatMessageType {
  id: string;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

/**
 * إنشاء متجر البوكر
 */
export const usePokerStore = create<PokerStore>((set, get) => ({
  // الحالة الأولية
  gameState: null,
  localPlayerId: null,
  socketManager: null,
  isConnected: false,
  isJoining: false,
  currentAction: null,
  actionInProgress: false,
  errorMessage: null,
  chatMessages: [],
  soundEnabled: true,
  winners: null,
  
  /**
   * تهيئة اتصال WebSocket
   */
  initializeSocket: async (userId: number, username: string) => {
    try {
      // إنشاء مدير WebSocket جديد
      const socketManager = new SocketManager();
      
      // تسجيل معالجات الرسائل
      socketManager.registerHandlers({
        [SocketMessageType.GAME_STATE]: (data: GameState) => {
          set({ gameState: data });
        },
        [SocketMessageType.ACTION_RESULT]: (data: ActionResult) => {
          // تحديث حالة الإجراء
          set({ actionInProgress: false, currentAction: null });
          
          // عرض رسالة خطأ إذا فشل الإجراء
          if (!data.success && data.message) {
            set({ errorMessage: data.message });
          }
          
          // التعامل مع نهاية الجولة والفائزين
          if (data.roundComplete && data.winners) {
            set({ winners: data.winners });
            
            // إضافة رسالة إعلام بالفائزين
            get().addSystemMessage(`انتهت الجولة! ${get().getWinnersText(data.winners)}`);
          }
        },
        [SocketMessageType.PLAYER_JOINED]: (data: GamePlayer) => {
          // إضافة رسالة إعلام بانضمام لاعب جديد
          get().addSystemMessage(`انضم ${data.username} إلى الطاولة.`);
        },
        [SocketMessageType.PLAYER_LEFT]: (data: { playerId: number }) => {
          // البحث عن اللاعب في الحالة الحالية
          const player = get().gameState?.players.find(p => p.id === data.playerId);
          if (player) {
            // إضافة رسالة إعلام بمغادرة اللاعب
            get().addSystemMessage(`غادر ${player.username} الطاولة.`);
          }
        },
        [SocketMessageType.CHAT_MESSAGE]: (data: { message: string, senderName: string, senderId: number }) => {
          // إضافة رسالة دردشة جديدة
          const newMessage: ChatMessageType = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId: data.senderId,
            senderName: data.senderName,
            message: data.message,
            timestamp: Date.now()
          };
          
          set(state => ({
            chatMessages: [...state.chatMessages, newMessage]
          }));
        },
        [SocketMessageType.ERROR]: (data: { message: string }) => {
          // عرض رسالة خطأ من الخادم
          set({ errorMessage: data.message });
        }
      });
      
      // محاولة الاتصال
      const connected = await socketManager.connect('wss://1ce60656-4249-4497-a454-d68123b667b0-00-37uru2h3zkwvh.riker.replit.dev/poker', userId, username);
      
      // تحديث الحالة
      set({
        socketManager,
        localPlayerId: userId,
        isConnected: connected
      });
      
      return connected;
    } catch (error) {
      console.error('فشل تهيئة اتصال WebSocket:', error);
      set({ errorMessage: 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.' });
      return false;
    }
  },
  
  /**
   * إغلاق اتصال WebSocket
   */
  closeSocket: () => {
    const { socketManager } = get();
    if (socketManager) {
      socketManager.closeConnection();
      set({ socketManager: null, isConnected: false });
    }
  },
  
  /**
   * الانضمام إلى طاولة
   */
  joinTable: async (tableId: number, chips: number) => {
    const { socketManager, isConnected } = get();
    
    // التحقق من وجود اتصال
    if (!socketManager || !isConnected) {
      set({ errorMessage: 'لا يوجد اتصال بالخادم.' });
      return false;
    }
    
    try {
      // تعيين حالة الانضمام
      set({ isJoining: true });
      
      // إرسال طلب الانضمام
      const joined = socketManager.joinTable(tableId, chips);
      
      // إضافة رسالة إعلام
      if (joined) {
        get().addSystemMessage('أنت تنضم إلى الطاولة...');
      }
      
      // إعادة تعيين حالة الانضمام بعد فترة قصيرة
      setTimeout(() => {
        set({ isJoining: false });
      }, 2000);
      
      return joined;
    } catch (error) {
      console.error('فشل الانضمام إلى الطاولة:', error);
      set({ isJoining: false, errorMessage: 'فشل الانضمام إلى الطاولة. يرجى المحاولة مرة أخرى.' });
      return false;
    }
  },
  
  /**
   * مغادرة الطاولة
   */
  leaveTable: () => {
    const { socketManager, isConnected } = get();
    
    // التحقق من وجود اتصال
    if (!socketManager || !isConnected) {
      return;
    }
    
    // إرسال طلب المغادرة
    socketManager.leaveTable();
    
    // إعادة تعيين حالة اللعبة
    set({ gameState: null });
  },
  
  /**
   * تنفيذ إجراء
   */
  performAction: async (action: PlayerAction, amount?: number) => {
    const { socketManager, isConnected, gameState } = get();
    
    // التحقق من وجود اتصال وحالة لعبة
    if (!socketManager || !isConnected || !gameState) {
      set({ errorMessage: 'لا يوجد اتصال بالخادم أو لعبة نشطة.' });
      return false;
    }
    
    try {
      // تعيين حالة الإجراء
      set({ actionInProgress: true, currentAction: action });
      
      // إضافة رسالة إعلام
      const player = get().getLocalPlayer();
      if (player) {
        get().addSystemMessage(get().getActionDescription(action, player, amount));
      }
      
      // إرسال الإجراء
      const success = socketManager.sendPlayerAction(action, amount);
      
      // إذا فشل الإرسال، إعادة تعيين حالة الإجراء
      if (!success) {
        set({ actionInProgress: false, currentAction: null, errorMessage: 'فشل إرسال الإجراء.' });
      }
      
      return success;
    } catch (error) {
      console.error('فشل تنفيذ الإجراء:', error);
      set({ actionInProgress: false, currentAction: null, errorMessage: 'فشل تنفيذ الإجراء. يرجى المحاولة مرة أخرى.' });
      return false;
    }
  },
  
  /**
   * إرسال رسالة دردشة
   */
  sendChatMessage: (message: string) => {
    const { socketManager, isConnected, localPlayerId } = get();
    
    // التحقق من وجود اتصال
    if (!socketManager || !isConnected) {
      return;
    }
    
    // التحقق من وجود رسالة
    if (!message || message.trim() === '') {
      return;
    }
    
    // إرسال الرسالة
    socketManager.sendChatMessage(message);
    
    // إضافة الرسالة محلياً
    const newMessage: ChatMessageType = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: localPlayerId || 0,
      senderName: 'أنت',
      message,
      timestamp: Date.now()
    };
    
    set(state => ({
      chatMessages: [...state.chatMessages, newMessage]
    }));
  },
  
  /**
   * إضافة رسالة نظام
   */
  addSystemMessage: (message: string) => {
    const newMessage: ChatMessageType = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: 0,
      senderName: 'النظام',
      message,
      timestamp: Date.now(),
      isSystem: true
    };
    
    set(state => ({
      chatMessages: [...state.chatMessages, newMessage]
    }));
  },
  
  /**
   * الحصول على نص الفائزين
   */
  getWinnersText: (winners: WinnerInfo[]) => {
    if (!winners || winners.length === 0) {
      return '';
    }
    
    const { gameState } = get();
    if (!gameState) {
      return '';
    }
    
    // تجميع نص الفائزين
    const winnerTexts = winners.map(winner => {
      const player = gameState.players.find(p => p.id === winner.playerId);
      if (!player) return '';
      
      return `${player.username} فاز بـ ${winner.winningAmount.toLocaleString()} رقاقة (${winner.handDescription})`;
    });
    
    return winnerTexts.join(' | ');
  },
  
  /**
   * إعادة تعيين اللعبة
   */
  resetGame: () => {
    set({
      gameState: null,
      currentAction: null,
      actionInProgress: false,
      winners: null,
      chatMessages: []
    });
  },
  
  /**
   * تعيين رسالة خطأ
   */
  setErrorMessage: (message: string | null) => {
    set({ errorMessage: message });
  },
  
  /**
   * تعيين حالة الصوت
   */
  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },
  
  /**
   * مسح الفائزين
   */
  clearWinners: () => {
    set({ winners: null });
  },
  
  /**
   * الحصول على اللاعب المحلي
   */
  getLocalPlayer: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || !localPlayerId) {
      return null;
    }
    
    return gameState.players.find(p => p.id === localPlayerId) || null;
  },
  
  /**
   * التحقق من إمكانية التمرير (check)
   */
  canCheck: () => {
    const { gameState } = get();
    const localPlayer = get().getLocalPlayer();
    
    if (!gameState || !localPlayer) {
      return false;
    }
    
    return localPlayer.isCurrentTurn && 
      !localPlayer.folded && 
      !localPlayer.isAllIn && 
      (localPlayer.betAmount === gameState.currentRound.currentBet);
  },
  
  /**
   * التحقق من إمكانية الزيادة (raise)
   */
  canRaise: () => {
    const { gameState } = get();
    const localPlayer = get().getLocalPlayer();
    
    if (!gameState || !localPlayer) {
      return false;
    }
    
    return localPlayer.isCurrentTurn && 
      !localPlayer.folded && 
      !localPlayer.isAllIn && 
      localPlayer.chips > 0;
  },
  
  /**
   * الحصول على الحد الأدنى للزيادة
   */
  getMinRaise: () => {
    const { gameState } = get();
    
    if (!gameState) {
      return 0;
    }
    
    return gameState.currentRound.minRaise || gameState.blindAmount.big;
  },
  
  /**
   * الحصول على الحد الأقصى للزيادة
   */
  getMaxRaise: () => {
    const { gameState } = get();
    const localPlayer = get().getLocalPlayer();
    
    if (!gameState || !localPlayer) {
      return 0;
    }
    
    return localPlayer.chips;
  },
  
  /**
   * الحصول على بطاقات المجتمع
   */
  getCommunityCards: () => {
    const { gameState } = get();
    
    if (!gameState) {
      return [];
    }
    
    return gameState.currentRound.communityCards || [];
  },
  
  /**
   * الحصول على المرحلة الحالية
   */
  getCurrentPhase: () => {
    const { gameState } = get();
    
    if (!gameState) {
      return GamePhase.PREFLOP;
    }
    
    return gameState.currentRound.gamePhase;
  },
  
  /**
   * الحصول على اللاعبين النشطين
   */
  getActivePlayers: () => {
    const { gameState } = get();
    
    if (!gameState) {
      return [];
    }
    
    return gameState.players.filter(p => p.isActive);
  },
  
  /**
   * التحقق من دور اللاعب الحالي
   */
  isPlayerTurn: () => {
    const localPlayer = get().getLocalPlayer();
    
    if (!localPlayer) {
      return false;
    }
    
    return localPlayer.isCurrentTurn && !localPlayer.folded && !localPlayer.isAllIn;
  },
  
  /**
   * الحصول على وصف الإجراء
   */
  getActionDescription: (action: string, player: GamePlayer, amount?: number) => {
    switch (action) {
      case PlayerAction.FOLD:
        return `${player.username} طوى أوراقه.`;
      
      case PlayerAction.CHECK:
        return `${player.username} مرر.`;
      
      case PlayerAction.CALL:
        return `${player.username} جارى بـ ${amount?.toLocaleString() || 0} رقاقة.`;
      
      case PlayerAction.RAISE:
        return `${player.username} زاد إلى ${amount?.toLocaleString() || 0} رقاقة.`;
      
      case PlayerAction.ALL_IN:
        return `${player.username} وضع كل رقائقه (${player.chips.toLocaleString()}).`;
      
      default:
        return `${player.username} قام بإجراء غير معروف.`;
    }
  }
}));