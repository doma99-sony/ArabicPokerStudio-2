/**
 * محرك منطق لعبة البوكر - يتحكم في منطق اللعبة ويدير الحالات المختلفة
 */

// تعريف أنواع البيانات
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  hidden?: boolean;
}

export interface Player {
  id: number;
  username: string;
  chips: number;
  avatar?: string;
  position: number;
  cards: Card[];
  isActive: boolean;
  isCurrentTurn: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
}

export type GameStage = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameState {
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  minBet: number;
  dealerPosition: number;
  currentTurnPosition: number;
  gameStage: GameStage;
  lastAction?: {
    playerId: number;
    action: string;
    amount?: number;
  };
}

// دالة إنشاء مجموعة كاملة من الكروت (52 كارت)
export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return deck;
}

// دالة خلط الكروت
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

// دالة توزيع الكروت على اللاعبين
export function dealCards(deck: Card[], players: Player[], cardsPerPlayer: number = 2): [Card[], Player[]] {
  const updatedPlayers = [...players];
  const remainingDeck = [...deck];
  
  // توزيع الكروت للاعبين
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < updatedPlayers.length; j++) {
      if (updatedPlayers[j].isActive && !updatedPlayers[j].isFolded) {
        const card = remainingDeck.pop();
        if (card) {
          updatedPlayers[j].cards.push({ ...card, hidden: true });
        }
      }
    }
  }
  
  return [remainingDeck, updatedPlayers];
}

// دالة توزيع كروت الطاولة المشتركة
export function dealCommunityCards(deck: Card[], count: number, existing: Card[] = []): [Card[], Card[]] {
  const remainingDeck = [...deck];
  const communityCards = [...existing];
  
  for (let i = 0; i < count; i++) {
    const card = remainingDeck.pop();
    if (card) {
      communityCards.push(card);
    }
  }
  
  return [remainingDeck, communityCards];
}

// دالة تحديد اللاعب التالي
export function getNextActivePlayer(players: Player[], currentPosition: number): number {
  const count = players.length;
  let nextPosition = (currentPosition + 1) % count;
  
  // البحث عن اللاعب التالي النشط
  while (
    nextPosition !== currentPosition && 
    (!players[nextPosition].isActive || players[nextPosition].isFolded || players[nextPosition].isAllIn)
  ) {
    nextPosition = (nextPosition + 1) % count;
  }
  
  return nextPosition;
}

// دالة لحساب قيمة يد اللاعب (مبسطة)
export function evaluateHand(playerCards: Card[], communityCards: Card[]): number {
  // سيتم تطوير هذه الدالة لاحقاً لتقييم قوة اليد الفعلية
  // حاليًا تعيد قيمة عشوائية للتجربة
  return Math.random() * 1000;
}

// دالة تحديد الفائز
export function determineWinner(players: Player[], communityCards: Card[]): Player[] {
  // تطبق فقط على اللاعبين النشطين الذين لم يطووا
  const activePlayers = players.filter(p => p.isActive && !p.isFolded);
  
  // حساب قيمة يد كل لاعب
  const handValues = activePlayers.map(player => ({
    player,
    handValue: evaluateHand(player.cards, communityCards)
  }));
  
  // ترتيب اللاعبين حسب قيمة اليد (من الأعلى للأدنى)
  handValues.sort((a, b) => b.handValue - a.handValue);
  
  // إرجاع الفائز أو الفائزين في حالة التعادل
  const winningValue = handValues[0].handValue;
  const winners = handValues
    .filter(item => item.handValue === winningValue)
    .map(item => item.player);
  
  return winners;
}

// مزيد من المنطق سيتم إضافته لاحقاً لإدارة تقدم الجولة، توزيع الرقائق، إلخ.