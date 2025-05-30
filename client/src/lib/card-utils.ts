import { Card } from '@/types';

export function getSuitColor(suit: string): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
}

export function getCardDisplayValue(card: Card): { suit: string, value: string } {
  const suitMap: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };

  const valueMap: Record<string, string> = {
    'A': 'A',
    'K': 'K',
    'Q': 'Q',
    'J': 'J',
    '10': '10',
    '9': '9',
    '8': '8',
    '7': '7',
    '6': '6',
    '5': '5',
    '4': '4',
    '3': '3',
    '2': '2'
  };

  return {
    suit: suitMap[card.suit] || '?',
    value: valueMap[card.value] || '?'
  };
}

// إنشاء مجموعة كاملة من الورق (52 ورقة)
export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: Card['value'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
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