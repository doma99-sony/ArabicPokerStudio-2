// تعريف نوع الورقة
export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
  hidden?: boolean;
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