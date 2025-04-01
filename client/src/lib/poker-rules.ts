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

// Get all possible combinations of k elements from arr
function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length === 0) return [];
  
  const first = arr[0];
  const rest = arr.slice(1);
  
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = getCombinations(rest, k);
  
  return [...withFirst, ...withoutFirst];
}

// Count occurrences of each card value
function getValueCounts(cards: Card[]): Map<string, Card[]> {
  const counts = new Map<string, Card[]>();
  
  for (const card of cards) {
    if (!counts.has(card.value)) {
      counts.set(card.value, []);
    }
    counts.get(card.value)!.push(card);
  }
  
  return counts;
}

// Check for royal flush
function isRoyalFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards) && cards.some(card => card.value === "A") && 
         cards.some(card => card.value === "K") && cards.some(card => card.value === "Q") &&
         cards.some(card => card.value === "J") && cards.some(card => card.value === "10");
}

// Check for straight flush
function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards);
}

// Check for four of a kind
function isFourOfAKind(cards: Card[]): boolean {
  const valueCounts = getValueCounts(cards);
  return Array.from(valueCounts.values()).some(cards => cards.length >= 4);
}

// Check for full house
function isFullHouse(cards: Card[]): boolean {
  const valueCounts = getValueCounts(cards);
  const counts = Array.from(valueCounts.values()).map(cards => cards.length);
  return counts.includes(3) && counts.includes(2);
}

// Check for three of a kind
function isThreeOfAKind(cards: Card[]): boolean {
  const valueCounts = getValueCounts(cards);
  return Array.from(valueCounts.values()).some(cards => cards.length >= 3);
}

// Check for two pair
function isTwoPair(cards: Card[]): boolean {
  const valueCounts = getValueCounts(cards);
  const pairs = Array.from(valueCounts.values()).filter(cards => cards.length >= 2);
  return pairs.length >= 2;
}

// Check for one pair
function isOnePair(cards: Card[]): boolean {
  const valueCounts = getValueCounts(cards);
  return Array.from(valueCounts.values()).some(cards => cards.length >= 2);
}

// Get hand name in Arabic
function getHandName(ranking: HandRanking): string {
  switch (ranking) {
    case HandRanking.RoyalFlush:
      return "رويال فلاش";
    case HandRanking.StraightFlush:
      return "ستريت فلاش";
    case HandRanking.FourOfAKind:
      return "فور أوف آ كايند";
    case HandRanking.FullHouse:
      return "فول هاوس";
    case HandRanking.Flush:
      return "فلاش";
    case HandRanking.Straight:
      return "ستريت";
    case HandRanking.ThreeOfAKind:
      return "ثلاثة متشابهة";
    case HandRanking.TwoPair:
      return "زوجان";
    case HandRanking.OnePair:
      return "زوج واحد";
    case HandRanking.HighCard:
      return "أعلى ورقة";
    default:
      return "غير معروف";
  }
}

// Calculate the best 5-card hand from 7 cards (5 community + 2 hole cards)
export function evaluateHand(communityCards: Card[], holeCards: Card[]): { ranking: HandRanking, name: string, bestHand?: Card[] } {
  const allCards = [...communityCards, ...holeCards];
  
  // Get all possible 5-card combinations from the 7 cards
  const hand5Combinations = getCombinations(allCards, 5);
  
  let bestRanking = HandRanking.HighCard;
  let bestHand: Card[] = hand5Combinations[0]; // Default to first hand
  
  // Check each 5-card combination for the best hand
  for (const hand of hand5Combinations) {
    const sortedHand = sortCardsByValue(hand);
    
    let currentRanking: HandRanking;
    
    if (isRoyalFlush(sortedHand)) {
      currentRanking = HandRanking.RoyalFlush;
    } else if (isStraightFlush(sortedHand)) {
      currentRanking = HandRanking.StraightFlush;
    } else if (isFourOfAKind(sortedHand)) {
      currentRanking = HandRanking.FourOfAKind;
    } else if (isFullHouse(sortedHand)) {
      currentRanking = HandRanking.FullHouse;
    } else if (isFlush(sortedHand)) {
      currentRanking = HandRanking.Flush;
    } else if (isStraight(sortedHand)) {
      currentRanking = HandRanking.Straight;
    } else if (isThreeOfAKind(sortedHand)) {
      currentRanking = HandRanking.ThreeOfAKind;
    } else if (isTwoPair(sortedHand)) {
      currentRanking = HandRanking.TwoPair;
    } else if (isOnePair(sortedHand)) {
      currentRanking = HandRanking.OnePair;
    } else {
      currentRanking = HandRanking.HighCard;
    }
    
    // Update best hand if this combination is better
    if (currentRanking > bestRanking) {
      bestRanking = currentRanking;
      bestHand = sortedHand;
    }
  }
  
  return { 
    ranking: bestRanking, 
    name: getHandName(bestRanking),
    bestHand: bestHand
  };
}

// Compare two hands by their high card values (used for tiebreakers)
function compareHighCards(hand1: Card[], hand2: Card[]): number {
  const sortedHand1 = sortCardsByValue(hand1);
  const sortedHand2 = sortCardsByValue(hand2);
  
  for (let i = 0; i < Math.min(sortedHand1.length, sortedHand2.length); i++) {
    const value1 = getCardValue(sortedHand1[i].value);
    const value2 = getCardValue(sortedHand2[i].value);
    
    if (value1 !== value2) {
      return value1 - value2;
    }
  }
  
  return 0; // Hands are equal
}

// Determine the winner from multiple hands
export function determineWinner(hands: { playerId: number; cards: Card[] }[], communityCards: Card[]): { 
  winnerId: number, 
  handName: string,
  bestHand: Card[]
} {
  if (hands.length === 0) {
    throw new Error("No hands to evaluate");
  }
  
  let bestPlayerId = hands[0].playerId;
  let bestRanking = HandRanking.HighCard;
  let bestHandName = "أعلى ورقة";
  let bestHand: Card[] = [];
  
  // Evaluate each player's hand
  for (const { playerId, cards: holeCards } of hands) {
    const { ranking, name, bestHand: playerBestHand } = evaluateHand(communityCards, holeCards);
    
    if (playerBestHand && (ranking > bestRanking || 
        (ranking === bestRanking && compareHighCards(playerBestHand, bestHand) > 0))) {
      bestPlayerId = playerId;
      bestRanking = ranking;
      bestHandName = name;
      bestHand = playerBestHand;
    }
  }
  
  return { 
    winnerId: bestPlayerId, 
    handName: bestHandName,
    bestHand: bestHand
  };
}
