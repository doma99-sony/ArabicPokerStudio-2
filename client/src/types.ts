// تعريف نوع الورقة
export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
  hidden?: boolean;
  isWinning?: boolean;
}

// تعريف فئات الشارات
export interface BadgeCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  sortOrder: number;
}

// تعريف الشارة
export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryId?: number;
  category?: BadgeCategory;
  isRare: boolean;
  isHidden: boolean;
  requiredVipLevel: number;
  rarityLevel: number; // مستوى الندرة من 1 إلى 5
  sortOrder: number;
  grantCriteria?: Record<string, any>; // معايير منح الشارة
  color: string; // لون أساسي للشارة
  glowColor?: string; // لون التوهج للشارة
  effects?: BadgeEffect[]; // التأثيرات الخاصة بالشارة
  createdAt: Date;
}

// تعريف تأثيرات الشارة
export interface BadgeEffect {
  type: 'glow' | 'pulse' | 'rotate' | 'shake' | 'sparkle' | 'flip' | 'rainbow';
  intensity?: number; // قوة التأثير (1-10)
  color?: string; // لون التأثير إن وجد
  activationMode?: 'always' | 'hover' | 'click' | 'sequence'; // متى يتم تنشيط التأثير
}

// تعريف شارة المستخدم
export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  badge: Badge; // معلومات الشارة الكاملة
  acquiredAt: Date;
  isEquipped: boolean;
  equippedPosition?: number;
  displayProgress?: number; // تقدم العرض (0-100)
  source?: string; // مصدر الحصول على الشارة
  favoriteOrder?: number; // ترتيب المفضلة
  metadata?: Record<string, any>; // بيانات إضافية
}

// تعريف نوع طاولة اللعب
export interface GameTable {
  id: number;
  name: string;
  gameType: "poker" | "naruto" | "domino" | "tekken";
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn?: number;
  maxPlayers: number;
  currentPlayers: number;
  status: "available" | "busy" | "full" | "in_progress" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
  tableImage?: string;
  isVip: boolean;
  requiredVipLevel: number;
  password?: string;
  ownerId?: number;
  tableSettings?: Record<string, any>;
  category?: string; // فئة الطاولة: نوب، لسه بتعلم، محترف، الفاجر 
}

// تفاصيل اليد الفائزة
export interface HandDetails {
  cards: Card[]; // الأوراق المستخدمة لتكوين اليد
  handName: string; // اسم اليد بالعربية
  bestHand?: Card[]; // أفضل 5 أوراق تشكل اليد
}

export interface GamePlayer {
  id: number;
  username: string;
  chips: number;
  position: number;
  avatar?: string;
  cards: Card[];
  folded: boolean;
  betAmount: number;
  isAllIn: boolean;
  isActive: boolean;
  isTurn?: boolean;
}

export interface PlayerPosition {
  id: number;
  username: string;
  chips: number;
  position: "bottom" | "bottomRight" | "right" | "topRight" | "top" | "topLeft" | "left" | "bottomLeft" | "dealer";
  avatar?: string;
  cards: Card[];
  folded: boolean;
  betAmount?: number;
  isAllIn?: boolean;
  isVIP?: boolean;
  isActive?: boolean;
  isCurrentPlayer?: boolean;
  isTurn?: boolean;
  // إضافات لدعم حالة الفائز وتفاصيل اليد
  winner?: boolean; // هل هذا اللاعب هو الفائز
  handName?: string; // اسم يد اللاعب مثل "فلاش ملكي"
  handDetails?: HandDetails; // تفاصيل اليد الفائزة
  winAmount?: number; // مقدار الفوز
}

// تعريف الفائز في اللعبة
export interface Winner {
  playerId: number; // معرف اللاعب
  handName: string; // اسم اليد الفائزة
  amount: number; // مقدار الفوز
  handDetails?: HandDetails; // تفاصيل اليد (الأوراق المستخدمة)
}

// إجراءات اللعب المختلفة 
export type GameAction = 'fold' | 'check' | 'call' | 'raise' | 'all_in' | 'restart_round';

// حالة اللعبة الحالية
export interface GameState {
  id: number;
  gameId: number;
  players: PlayerPosition[];
  pot: number;
  currentBet: number;
  communityCards: Card[];
  currentTurn: number;
  status: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  gameStatus?: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'; // لدعم الاسمين
  dealer: number;
  smallBlind: number;
  bigBlind: number;
  isSpectator?: boolean;
  minRaise?: number;
  winningHands?: Record<number, Card[]>;
  winners?: Winner[]; // قائمة الفائزين مع تفاصيل الفوز
  tableName?: string;
  round?: number;
  maxRound?: number;
  // إضافات لمعلومات إضافية
  message?: string; // رسالة النظام
  lastAction?: { // آخر إجراء تم تنفيذه
    playerId: number;
    action: GameAction;
    amount?: number;
  };
}

// إحصائيات اللاعب
export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestWin: number;
  biggestPot: number;
  winRate: number;
  joinDate: Date;
  totalPlayTime: number;
  
  // إحصائيات إضافية للبوكر
  handsPlayed?: number;
  flopsSeen?: number;
  turnsReached?: number;
  riverReached?: number;
  showdownsReached?: number;
  
  // أيادي البوكر
  royalFlushes?: number;
  straightFlushes?: number;
  fourOfAKind?: number;
  fullHouses?: number;
  flushes?: number;
  straights?: number;
  threeOfAKind?: number;
  twoPairs?: number;
  onePairs?: number;
  
  // إحصائيات الأفعال
  totalBets?: number;
  totalRaises?: number;
  totalCalls?: number;
  totalFolds?: number;
  totalChecks?: number;
  totalAllIns?: number;
}

// عنصر تاريخ اللعب
export interface GameHistoryItem {
  id: number;
  tableId: number;
  tableName?: string;
  gameType: "poker" | "naruto" | "domino" | "tekken";
  startedAt: Date;
  endedAt?: Date;
  result: "win" | "loss" | "draw";
  chipsChange: number;
  opponentNames?: string[];
  handDetails?: HandDetails;
}

// الإنجازات
export interface Achievement {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  progress: number; // 0 - 100
  unlocked: boolean;
  unlockedDate?: Date;
  category: string;
}

// الملف الشخصي للاعب
export interface PlayerProfile {
  userId: number;
  username: string;
  level: number;
  vipLevel: number;
  vipPoints: number;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  chips: number;
  diamonds: number;
  stats: PlayerStats;
  achievements: Achievement[];
  gameHistory: GameHistoryItem[];
  lastLogin?: Date;
  status: 'online' | 'offline' | 'in_game';
  totalDeposits?: number;
  badges: UserBadge[]; // شارات المستخدم
  equippedBadges: UserBadge[]; // الشارات المجهزة حالياً
  favoriteBadges: UserBadge[]; // الشارات المفضلة
  badgeProgress: Record<number, number>; // تقدم الحصول على الشارات (بقية الشارات)
  badgeCount: number; // عدد الشارات الكلي
  rareCount: number; // عدد الشارات النادرة
}