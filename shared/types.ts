// أنواع بطاقات اللعب
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface Card {
  suit: Suit;
  value: Value;
}

// نوع لعبة البوكر
export type GameType = "poker" | "naruto" | "domino" | "tekken" | "arabic_rocket" | "zeus_king" | "egypt_queen" | "arab_poker" | "hunter" | "baloot" | "slots" | "crash";

// حالة الطاولة
export type TableStatus = "available" | "full" | "in_progress" | "maintenance";

// إجراءات اللعب
export type GameAction = "fold" | "check" | "call" | "bet" | "raise" | "all_in" | "restart_round";

// واجهة طاولة اللعب
export interface GameTable {
  id: number;
  name: string;
  gameType: GameType;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn?: number;
  maxPlayers: number;
  currentPlayers: number;
  status: TableStatus;
  createdAt: Date;
  updatedAt: Date;
  tableImage?: string;
  isVip: boolean;
  requiredVipLevel: number;
  password?: string;
  ownerId?: number;
  tableSettings?: Record<string, any>;
  category?: string; // مستوى الطاولة: نوب، لسه بتعلم، محترف، الفاجر
}

// واجهة لاعب في طاولة
export interface TablePlayer {
  id: number;
  tableId: number;
  userId: number;
  position: number;
  currentChips: number;
  isActive: boolean;
  joinedAt: Date;
  lastAction?: string;
  lastActionTime?: Date;
}

// بيانات اللاعب في اللعبة
export interface GamePlayer {
  id: number;
  username: string;
  chips: number;
  position: number;
  avatar?: string;
  cards: Card[];
  folded: boolean;
  betAmount: number;
  isAllIn: boolean;
  isActive: boolean;
}

// بيانات حالة اللعبة
export interface GameState {
  tableId: number;
  players: GamePlayer[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  currentTurn: number;
  dealer: number;
  smallBlind: number;
  bigBlind: number;
  gameStatus: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
  winners?: {
    playerId: number;
    amount: number;
    handName: string;
  }[];
  message?: string;
  lastAction?: {
    playerId: number;
    action: GameAction;
    amount?: number;
  };
}

// إحصائيات اللاعب
export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestWin: number;
  biggestPot: number;
  winRate: number;
  joinDate: Date;
  totalPlayTime?: number;
  
  // إحصائيات خاصة بالبوكر
  handsPlayed?: number;
  flopsSeenRate?: number;
  royalFlushes?: number;
  straightFlushes?: number;
  fourOfAKind?: number;
  fullHouses?: number;
  flushes?: number;
  straights?: number;
  threeOfAKind?: number;
  twoPairs?: number;
  onePairs?: number;
  
  // إحصائيات إضافية
  totalBets?: number;
  totalRaises?: number;
  totalCalls?: number;
  totalFolds?: number;
  totalChecks?: number;
  totalAllIns?: number;
}

// سجل تاريخ لعبة
export interface GameHistoryItem {
  id: number;
  userId: number;
  tableId: number;
  gameType: GameType;
  startedAt: Date;
  endedAt?: Date;
  result: "win" | "loss" | "tie";
  chipsChange: number;
  finalPosition?: number;
  handDetails?: {
    cards: Card[];
    handName: string;
    bestHand?: Card[];
  };
  opponentIds?: number[];
}

// بيانات ملف اللاعب
export interface PlayerProfile {
  id: number;
  username: string;
  chips: number;
  diamonds: number;
  vipLevel: number;
  vipPoints: number;
  avatar?: string;
  coverPhoto?: string;
  userCode: string;
  stats: PlayerStats;
  gameHistory: GameHistoryItem[];
  createdAt: Date;
  lastLogin?: Date;
}

// بيانات لتسجيل الدخول
export interface LoginCredentials {
  username: string;
  password: string;
}

// بيانات الإشعارات
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: "general" | "friend_request" | "gift" | "achievement" | "reward";
  isRead: boolean;
  createdAt: Date;
  relatedId?: number;
  actionUrl?: string;
}

// استجابة API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}