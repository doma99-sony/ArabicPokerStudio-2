/**
 * محرك لعبة البوكر
 * محاكاة أساسية للعبة البوكر تكساس هولدم
 */
import * as pokerSolver from 'pokersolver';

// تعريف أنواع البطاقات
export interface Card {
  suit: string; // الشكل (♠, ♥, ♦, ♣)
  rank: string; // القيمة (2-10, J, Q, K, A)
  hidden?: boolean; // هل البطاقة مخفية أم لا
}

// الأشكال المتاحة
const SUITS = ['♠', '♥', '♦', '♣'];

// قيم البطاقات
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * إنشاء مجموعة بطاقات كاملة (52 بطاقة)
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, hidden: false });
    }
  }
  
  return deck;
}

/**
 * خلط البطاقات باستخدام خوارزمية Fisher-Yates
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffledDeck = [...deck];
  
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  return shuffledDeck;
}

/**
 * توزيع البطاقات على اللاعبين
 */
export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number = 2): Card[][] {
  const hands: Card[][] = [];
  
  // التحقق من أن عدد البطاقات كافٍ
  if (deck.length < numPlayers * cardsPerPlayer) {
    throw new Error('عدد البطاقات غير كافٍ للتوزيع على جميع اللاعبين');
  }
  
  // تهيئة مصفوفة الأيدي
  for (let i = 0; i < numPlayers; i++) {
    hands.push([]);
  }
  
  // توزيع البطاقات
  for (let c = 0; c < cardsPerPlayer; c++) {
    for (let p = 0; p < numPlayers; p++) {
      const card = { ...deck[c * numPlayers + p] };
      // تعيين البطاقات كمخفية للاعبين الآخرين
      card.hidden = true;
      hands[p].push(card);
    }
  }
  
  return hands;
}

/**
 * تقييم أولي لقوة اليد (للاستخدام من قبل اللاعبين الوهميين)
 * قيمة بين 0 و 1، حيث 1 هي الأقوى
 */
export function evaluateHand(cards: Card[], communityCards: Card[] = []): number {
  // التنفيذ المبسط هنا يقيم فقط البطاقات الأولية
  // في تطبيق كامل، يجب أن يشمل ترتيب الأيدي الكامل للبوكر
  
  const allCards = [...cards, ...communityCards];
  
  // حساب أولي استنادًا إلى قيمة البطاقات
  let value = 0;
  
  for (const card of cards) {
    // تحويل قيمة البطاقة إلى رقم
    let rankValue = 0;
    
    switch (card.rank) {
      case 'A': rankValue = 14; break;
      case 'K': rankValue = 13; break;
      case 'Q': rankValue = 12; break;
      case 'J': rankValue = 11; break;
      default: rankValue = parseInt(card.rank, 10);
    }
    
    // زيادة القيمة بناءً على قيمة البطاقة (البطاقات العالية تحصل على قيمة أعلى)
    value += rankValue / 14;
  }
  
  // معادلة بسيطة لتطبيع القيمة بين 0 و 1
  return value / cards.length;
}

/**
 * إضافة منطق اللعب والدورات للعبة البوكر تكساس هولدم
 */

// أنواع مراحل اللعبة
export enum GamePhase {
  PREFLOP = 'preflop', // قبل الفلوب
  FLOP = 'flop',       // الفلوب (3 بطاقات)
  TURN = 'turn',       // التيرن (بطاقة رابعة)
  RIVER = 'river',     // الريفر (بطاقة خامسة)
  SHOWDOWN = 'showdown' // كشف الأوراق والتحقق من الفائز
}

// أنواع إجراءات اللاعبين
export enum PlayerAction {
  FOLD = 'fold',    // طي
  CHECK = 'check',  // تمرير
  CALL = 'call',    // مجاراة
  RAISE = 'raise',  // زيادة
  ALL_IN = 'all_in' // كل الرقائق
}

/**
 * تحديد قوة اليد للاعب باستخدام مكتبة pokersolver
 * تقوم بتقييم ترتيب اليد (زوج، ثلاثيات، فلاش، الخ) وحساب القوة النسبية
 */

// واجهة لنتيجة تقييم اليد
export interface HandEvaluation {
  handType: string;       // نوع اليد (زوج، فلاش، ستريت، الخ)
  handRank: number;       // قوة اليد (1-10، حيث 10 هي الأقوى)
  handName: string;       // اسم اليد بالعربية
  description: string;    // وصف تفصيلي لليد
  cards: Card[];          // البطاقات المستخدمة في تكوين اليد
  strength: number;       // قوة اليد (0-1)
}

// قاموس أنواع الأيدي بالعربية
const handTypesArabic: Record<string, string> = {
  'High Card': 'ورقة عالية',
  'Pair': 'زوج',
  'Two Pair': 'زوجان',
  'Three of a Kind': 'ثلاثية',
  'Straight': 'ستريت',
  'Flush': 'فلاش',
  'Full House': 'فل هاوس',
  'Four of a Kind': 'رباعية',
  'Straight Flush': 'ستريت فلاش',
  'Royal Flush': 'رويال فلاش'
};

// ترتيب قوة أنواع الأيدي (من 1 إلى 10)
const handRanks: Record<string, number> = {
  'High Card': 1,
  'Pair': 2,
  'Two Pair': 3,
  'Three of a Kind': 4,
  'Straight': 5,
  'Flush': 6,
  'Full House': 7,
  'Four of a Kind': 8,
  'Straight Flush': 9,
  'Royal Flush': 10
};

/**
 * تحويل البطاقة إلى الصيغة المناسبة لمكتبة pokersolver
 */
export function formatCardForSolver(card: Card): string {
  // تحويل الشكل إلى الأحرف التي تفهمها المكتبة
  const suitMap: Record<string, string> = {
    '♠': 's', // spades
    '♥': 'h', // hearts
    '♦': 'd', // diamonds
    '♣': 'c'  // clubs
  };
  
  // تحويل الرتبة إلى الصيغة المناسبة
  let rank = card.rank;
  
  return rank + suitMap[card.suit];
}

/**
 * تقييم يد اللاعب باستخدام مكتبة pokersolver
 */
export function evaluatePlayerHand(playerCards: Card[], communityCards: Card[]): HandEvaluation {
  // تحويل البطاقات إلى الصيغة المناسبة
  const allCardsFormatted = [...playerCards, ...communityCards].map(formatCardForSolver);
  
  // استخدام المكتبة لتقييم اليد
  const hand = pokerSolver.Hand.solve(allCardsFormatted);
  
  // الحصول على نوع اليد والبطاقات المستخدمة
  const handType = hand.name;
  const handRank = handRanks[handType] || 0;
  const handName = handTypesArabic[handType] || handType;
  
  // إنشاء وصف مفصل لليد
  let description = `${handName}`;
  
  // إضافة تفاصيل حسب نوع اليد
  if (handType === 'Pair') {
    description += ` زوج`;
  } else if (handType === 'Two Pair') {
    description += ` زوجان`;
  } else if (handType === 'Three of a Kind') {
    description += ` ثلاثية`;
  } else if (handType === 'Straight') {
    description += ` ستريت`;
  } else if (handType === 'Flush') {
    description += ` فلاش`;
  } else if (handType === 'Full House') {
    description += ` فل هاوس`;
  } else if (handType === 'Four of a Kind') {
    description += ` رباعية`;
  }
  
  // حساب قوة اليد النسبية من 0 إلى 1
  const strength = handRank / 10;
  
  return {
    handType,
    handRank,
    handName,
    description,
    cards: playerCards,  // نعيد البطاقات الأصلية للاعب
    strength
  };
}

/**
 * ترجمة رتبة البطاقة إلى العربية
 */
function translateRank(rank: string): string {
  const rankMap: Record<string, string> = {
    'A': 'آس',
    'K': 'ملك',
    'Q': 'ملكة',
    'J': 'شاب',
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
  
  return rankMap[rank] || rank;
}

/**
 * ترجمة شكل البطاقة إلى العربية
 */
function translateSuit(suit: string): string {
  const suitMap: Record<string, string> = {
    's': 'البستوني',
    'h': 'القلوب',
    'd': 'الديناري',
    'c': 'الورقة'
  };
  
  return suitMap[suit] || suit;
}

/**
 * واجهة بديلة للحفاظ على التوافق مع الكود القديم
 */
export function calculateHandStrength(playerCards: Card[], communityCards: Card[]): number {
  const evaluation = evaluatePlayerHand(playerCards, communityCards);
  return evaluation.strength;
}

/**
 * تدوير الموزع والمكفوفين (الدور التالي)
 */
export function rotateDealer(currentDealerPosition: number, activePlayers: number): number {
  // ضمان بقاء الموقع ضمن نطاق عدد اللاعبين النشطين
  return (currentDealerPosition + 1) % activePlayers;
}

/**
 * تحديد المكفوفين الصغير والكبير
 */
export function determineBlindPositions(dealerPosition: number, activePlayers: number): { smallBlind: number, bigBlind: number } {
  // في حالة لاعبين فقط
  if (activePlayers === 2) {
    return {
      smallBlind: dealerPosition,
      bigBlind: (dealerPosition + 1) % activePlayers
    };
  }
  
  // في حالة 3 لاعبين أو أكثر
  return {
    smallBlind: (dealerPosition + 1) % activePlayers,
    bigBlind: (dealerPosition + 2) % activePlayers
  };
}

/**
 * تحديد اللاعب الذي يبدأ الجولة
 */
export function determineFirstToAct(dealerPosition: number, activePlayers: number, phase: GamePhase): number {
  // في مرحلة ما قبل الفلوب، يبدأ اللاعب الذي يلي المكفوف الكبير
  if (phase === GamePhase.PREFLOP) {
    // في حالة لاعبين فقط، يبدأ الموزع (المكفوف الصغير)
    if (activePlayers === 2) {
      return dealerPosition;
    }
    // في حالة 3 لاعبين أو أكثر، يبدأ اللاعب الثالث بعد الموزع
    return (dealerPosition + 3) % activePlayers;
  }
  
  // في المراحل الأخرى، يبدأ اللاعب الذي يلي الموزع
  return (dealerPosition + 1) % activePlayers;
}