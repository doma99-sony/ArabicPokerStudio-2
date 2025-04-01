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
}

// إجراءات اللعب المختلفة 
export type GameAction = 'fold' | 'check' | 'call' | 'raise' | 'allIn';

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
  winners?: { playerId: number, hand: string, amount: number }[];
  tableName?: string;
  round?: number;
  maxRound?: number;
}