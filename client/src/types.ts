// تعريف نوع الورقة
export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
  hidden?: boolean;
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
  position: "bottom" | "bottomRight" | "topRight" | "topLeft" | "bottomLeft";
  avatar?: string;
  cards: Card[];
  folded: boolean;
  betAmount?: number;
  isAllIn?: boolean;
  isVIP?: boolean;
  isActive?: boolean;
  isCurrentPlayer?: boolean;
}