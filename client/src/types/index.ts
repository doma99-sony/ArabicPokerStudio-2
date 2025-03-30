import { User } from "@shared/schema";

export type TableStatus = "available" | "busy" | "full";

export interface GameTable {
  id: number;
  name: string;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxPlayers: number;
  currentPlayers: number;
  status: TableStatus;
}

export interface PlayerPosition {
  id: number;
  username: string;
  chips: number;
  avatar: string;
  position: "bottom" | "bottomRight" | "right" | "top" | "left";
  isCurrentPlayer: boolean;
  isTurn: boolean;
  cards?: Card[];
  folded?: boolean;
  betAmount?: number;
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  hidden?: boolean;
}

export type GameAction = "fold" | "check" | "call" | "raise" | "allIn";

export interface GameState {
  id: number;
  tableName: string;
  players: PlayerPosition[];
  communityCards: Card[];
  pot: number;
  dealer: number;
  currentTurn: number;
  smallBlind: number;
  bigBlind: number;
  round: number;
  currentBet: number;
  userChips: number;
  gameStatus: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  highestWin: number;
  winRate: number;
  achievements: Achievement[];
  joinDate: string;
}

export interface GameHistoryItem {
  id: number;
  date: string;
  tableName: string;
  result: "win" | "loss";
  chipsChange: number;
}

export interface PlayerProfile extends User {
  stats: PlayerStats;
  gameHistory: GameHistoryItem[];
}
