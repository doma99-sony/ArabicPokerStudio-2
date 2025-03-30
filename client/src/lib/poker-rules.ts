import { Card } from "../types";

// Hand rankings from highest to lowest
export enum HandRanking {
  RoyalFlush = 10,
  StraightFlush = 9,
  FourOfAKind = 8,
  FullHouse = 7,
  Flush = 6,
  Straight = 5,
  ThreeOfAKind = 4,
  TwoPair = 3,
  OnePair = 2,
  HighCard = 1
}

// Map card value to numeric value for comparisons
export function getCardValue(value: string): number {
  const valueMap: { [key: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 11,
    "Q": 12,
    "K": 13,
    "A": 14
  };
  
  return valueMap[value] || 0;
}

// Sort cards by value (descending)
export function sortCardsByValue(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardValue(b.value) - getCardValue(a.value));
}

// Check if cards form a flush (all same suit)
export function isFlush(cards: Card[]): boolean {
  const suit = cards[0].suit;
  return cards.every(card => card.suit === suit);
}

// Check if cards form a straight (consecutive values)
export function isStraight(cards: Card[]): boolean {
  const sortedCards = sortCardsByValue(cards);
  
  // Handle Ace low straight (A-2-3-4-5)
  if (
    sortedCards[0].value === "A" &&
    sortedCards[1].value === "5" &&
    sortedCards[2].value === "4" &&
    sortedCards[3].value === "3" &&
    sortedCards[4].value === "2"
  ) {
    return true;
  }
  
  // Check for regular straight
  for (let i = 0; i < sortedCards.length - 1; i++) {
    if (getCardValue(sortedCards[i].value) - getCardValue(sortedCards[i + 1].value) !== 1) {
      return false;
    }
  }
  
  return true;
}

// Calculate the best 5-card hand from 7 cards (5 community + 2 hole cards)
export function evaluateHand(communityCards: Card[], holeCards: Card[]): { ranking: HandRanking, name: string } {
  const allCards = [...communityCards, ...holeCards];
  
  // Check for royal flush
  // Check for straight flush
  // Check for four of a kind
  // Check for full house
  // Check for flush
  // Check for straight
  // Check for three of a kind
  // Check for two pair
  // Check for pair
  // High card
  
  // This is a simplified version - in a real implementation, we would check each hand type
  
  // For now, return a placeholder result
  return { ranking: HandRanking.HighCard, name: "High Card" };
}

// Determine the winner from multiple hands
export function determineWinner(hands: { playerId: number; cards: Card[] }[], communityCards: Card[]): number {
  // Evaluate each hand and return the player ID with the highest ranking hand
  // In a real implementation, we would compare hand rankings and handle tiebreakers
  
  // For now, return the first player as the winner
  return hands[0].playerId;
}
