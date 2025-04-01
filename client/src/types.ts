// تعريف نوع الورقة
export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
  hidden?: boolean;
  isWinning?: boolean;
}

// تعريف نوع طاولة اللعب
export interface GameTable {
  id: number;
  name: string;
  gameType: "poker" | "naruto" | "domino" | "tekken";
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn?: number;
  maxPlayers: number;
  currentPlayers: number;
  status: "available" | "busy" | "full" | "in_progress" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
  tableImage?: string;
  isVip: boolean;
  requiredVipLevel: number;
  password?: string;
  ownerId?: number;
  tableSettings?: Record<string, any>;
}

// تفاصيل اليد الفائزة
export interface HandDetails {
  cards: Card[]; // الأوراق المستخدمة لتكوين اليد
  handName: string; // اسم اليد بالعربية
  bestHand?: Card[]; // أفضل 5 أوراق تشكل اليد
}

export interface PlayerPosition {
  id: number;
  username: string;
  chips: number;
  position: "bottom" | "bottomRight" | "right" | "topRight" | "top" | "topLeft" | "left" | "bottomLeft" | "dealer";
  avatar?: string;
  cards: Card[];
  folded: boolean;
  betAmount?: number;
  isAllIn?: boolean;
  isVIP?: boolean;
  isActive?: boolean;
  isCurrentPlayer?: boolean;
  isTurn?: boolean;
  // إضافات لدعم حالة الفائز وتفاصيل اليد
  winner?: boolean; // هل هذا اللاعب هو الفائز
  handName?: string; // اسم يد اللاعب مثل "فلاش ملكي"
  handDetails?: HandDetails; // تفاصيل اليد الفائزة
  winAmount?: number; // مقدار الفوز
}

// تعريف الفائز في اللعبة
export interface Winner {
  playerId: number; // معرف اللاعب
  handName: string; // اسم اليد الفائزة
  amount: number; // مقدار الفوز
  handDetails?: HandDetails; // تفاصيل اليد (الأوراق المستخدمة)
}

// إجراءات اللعب المختلفة 
export type GameAction = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

// حالة اللعبة الحالية
export interface GameState {
  id: number;
  gameId: number;
  players: PlayerPosition[];
  pot: number;
  currentBet: number;
  communityCards: Card[];
  currentTurn: number;
  status: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  gameStatus?: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'; // لدعم الاسمين
  dealer: number;
  smallBlind: number;
  bigBlind: number;
  isSpectator?: boolean;
  minRaise?: number;
  winningHands?: Record<number, Card[]>;
  winners?: Winner[]; // قائمة الفائزين مع تفاصيل الفوز
  tableName?: string;
  round?: number;
  maxRound?: number;
  // إضافات لمعلومات إضافية
  message?: string; // رسالة النظام
  lastAction?: { // آخر إجراء تم تنفيذه
    playerId: number;
    action: GameAction;
    amount?: number;
  };
}