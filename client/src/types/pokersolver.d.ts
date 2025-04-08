/**
 * ملف تعريف لمكتبة pokersolver
 */
declare module 'pokersolver' {
  export interface Card {
    value: string;
    suit: string;
    rank: number;
    wildValue?: string;
  }

  export interface HandResult {
    name: string;
    rank: number;
    cards: Card[];
    values: number[];
    toString(): string;
    descr?: string;
  }

  export class Hand {
    static solve(cards: string[], game?: string): HandResult;
    static winners(hands: HandResult[]): HandResult[];
    static compare(hands: HandResult[]): number[];
  }
}