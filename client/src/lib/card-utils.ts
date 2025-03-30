import { Card } from "../types";

// Card suits and values
export const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
export const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;

// Create a deck of cards
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        suit: suit,
        value: value
      });
    }
  }
  
  return deck;
}

// Shuffle a deck of cards using Fisher-Yates algorithm
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// Deal a specific number of cards from a deck
export function dealCards(deck: Card[], numCards: number): Card[] {
  return deck.slice(0, numCards);
}

// Get the remaining cards after dealing
export function remainingCards(deck: Card[], dealtCards: number): Card[] {
  return deck.slice(dealtCards);
}

// Get card image path
export function getCardImagePath(card: Card): string {
  if (card.hidden) {
    return "/card-back.svg";
  }
  
  const suitSymbol = getSuitSymbol(card.suit);
  return `${card.value}${suitSymbol}`;
}

// Get suit symbol
export function getSuitSymbol(suit: Card["suit"]): string {
  switch (suit) {
    case "hearts": return "♥";
    case "diamonds": return "♦";
    case "clubs": return "♣";
    case "spades": return "♠";
  }
}

// Get suit color
export function getSuitColor(suit: Card["suit"]): string {
  return suit === "hearts" || suit === "diamonds" ? "text-casinoRed" : "text-deepBlack";
}

// Get card display value
export function getCardDisplayValue(card: Card): { value: string, suit: string } {
  return {
    value: card.value,
    suit: getSuitSymbol(card.suit)
  };
}
