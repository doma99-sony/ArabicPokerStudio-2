import { Card } from "../shared/types";

// إنشاء مجموعة كاملة من الورق (52 ورقة)
export function createDeck(): Card[] {
  const suits: Array<"hearts" | "diamonds" | "clubs" | "spades"> = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: Array<"2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"> = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return deck;
}

// خلط الورق بطريقة عشوائية
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// توزيع الأوراق على اللاعبين
export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number): Card[][] {
  const hands: Card[][] = Array(numPlayers).fill(null).map(() => []);
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < numPlayers; j++) {
      if (deck.length > 0) {
        const card = deck.pop()!;
        hands[j].push(card);
      }
    }
  }
  
  return hands;
}

// دالة خاصة لتوزيع الأوراق للاعب واحد
export function dealCardsToPlayer(deck: Card[], count: number): Card[] {
  const hand: Card[] = [];
  
  for (let i = 0; i < count; i++) {
    if (deck.length > 0) {
      const card = deck.pop()!;
      hand.push(card);
    }
  }
  
  return hand;
}

// الحصول على الأوراق المتبقية بعد التوزيع
export function remainingCards(deck: Card[], numToPop: number): Card[] {
  if (numToPop <= 0) return [];
  if (numToPop >= deck.length) return [...deck];
  
  const result: Card[] = [];
  const tempDeck = [...deck];
  
  for (let i = 0; i < numToPop; i++) {
    if (tempDeck.length > 0) {
      const card = tempDeck.pop()!;
      result.push(card);
    }
  }
  
  return result;
}