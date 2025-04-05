import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, primaryKey, pgEnum, real, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// تعريف نوع جديد للأدوار
export const userRoleEnum = pgEnum('user_role', ['player', 'vip', 'admin', 'moderator', 'guest']);

// تعريف نوع للعبة
export const gameTypeEnum = pgEnum('game_type', ['poker', 'naruto', 'domino', 'tekken', 'arabic_rocket', 'zeus_king', 'egypt_queen']);

// تعريف نوع لحالة الطاولة
export const tableStatusEnum = pgEnum('table_status', ['available', 'full', 'in_progress', 'maintenance']);

// جدول المستخدمين
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  chips: integer("chips").default(5000).notNull(),
  diamonds: integer("diamonds").default(0).notNull(),
  vipLevel: integer("vip_level").default(0).notNull(),
  vipPoints: integer("vip_points").default(0).notNull(),
  role: userRoleEnum("role").default('player').notNull(),
  avatar: text("avatar"),
  coverPhoto: text("cover_photo"),
  userCode: text("user_code"), // معرف المستخدم المكون من 5 أرقام
  totalDeposits: integer("total_deposits").default(0),
  isVerified: boolean("is_verified").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  facebookId: text("facebook_id"),
  isGuest: boolean("is_guest").default(false),
  preferences: jsonb("preferences"), // إعدادات المستخدم وتفضيلاته
  status: text("status").default('online'), // حالة المستخدم (متصل، غير متصل، في لعبة)
  bio: text("bio"), // نبذة تعريفية
  phone: text("phone"), // رقم الهاتف
});

// مخطط إدخال المستخدم (لا يشمل الحقول التي تُنشئها قاعدة البيانات تلقائيًا)
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  chips: true,
  diamonds: true,
  isGuest: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// جدول رقائق المستخدم وتاريخ المعاملات
export const userChipsTransactions = pgTable("user_chips_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(), // مبلغ المعاملة (سالب للسحب، موجب للإيداع)
  balanceAfter: integer("balance_after").notNull(), // الرصيد بعد المعاملة
  type: text("type").notNull(), // نوع المعاملة (شراء، ربح، خسارة، هدية، إلخ)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  gameId: integer("game_id"), // مرجع إلى اللعبة إذا كانت المعاملة متعلقة بلعبة
  tableId: integer("table_id"), // مرجع إلى الطاولة
  sourceUserId: integer("source_user_id"), // المستخدم المصدر (في حالة التحويل)
  reference: text("reference"), // مرجع للمعاملة (رقم عملية الشراء، رقم اللعبة، إلخ)
});

// جدول الماس المستخدم وتاريخ المعاملات
export const userDiamondsTransactions = pgTable("user_diamonds_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reference: text("reference"),
});

// جدول العناصر والممتلكات (مثل الصور الرمزية والهدايا وعناصر VIP)
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // نوع العنصر (avatar, gift, vip_item, etc)
  price: integer("price"), // السعر بالرقائق
  diamondPrice: integer("diamond_price"), // السعر بالماس
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  requiredVipLevel: integer("required_vip_level").default(0),
  category: text("category"),
  expiresInDays: integer("expires_in_days"), // عدد الأيام للانتهاء (0 للعناصر الدائمة)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// جدول ممتلكات المستخدم
export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: integer("item_id").notNull().references(() => items.id),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isEquipped: boolean("is_equipped").default(false), // هل العنصر مجهز (مثل الصورة الرمزية)
  quantity: integer("quantity").default(1).notNull(), // كمية العنصر (لو يمكن وجود أكثر من واحد)
});

// جدول هدايا المستخدم
export const userGifts = pgTable("user_gifts", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isOpened: boolean("is_opened").default(false),
});

// جدول الأصدقاء
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: integer("friend_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").default('pending').notNull(), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// جدول الرسائل
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipientId: integer("recipient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false),
  replyToId: integer("reply_to_id"), // مرجع للرسالة التي يرد عليها
});

// جدول طاولات اللعب
export const gameTables = pgTable("game_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameType: gameTypeEnum("game_type").notNull().default('poker'),
  smallBlind: integer("small_blind").notNull(),
  bigBlind: integer("big_blind").notNull(),
  minBuyIn: integer("min_buy_in").notNull(),
  maxBuyIn: integer("max_buy_in"),
  maxPlayers: integer("max_players").notNull().default(9),
  currentPlayers: integer("current_players").notNull().default(0),
  status: tableStatusEnum("status").notNull().default('available'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  tableImage: text("table_image"),
  isVip: boolean("is_vip").default(false),
  requiredVipLevel: integer("required_vip_level").default(0),
  password: text("password"), // كلمة مرور للطاولات الخاصة
  ownerId: integer("owner_id"), // صاحب الطاولة (للطاولات الخاصة)
  tableSettings: jsonb("table_settings"), // إعدادات إضافية للطاولة
});

// جدول تاريخ اللعب
export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tableId: integer("table_id").notNull().references(() => gameTables.id),
  gameType: gameTypeEnum("game_type").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  result: text("result").notNull(), // win, loss, draw
  chipsChange: integer("chips_change").notNull(),
  finalPosition: integer("final_position"), // المركز النهائي للاعب
  handDetails: jsonb("hand_details"), // تفاصيل اليد للاعب (حسب نوع اللعبة)
  opponentIds: integer("opponent_ids").array(), // قائمة معرفات المنافسين
});

// جدول لاعبين الطاولة الحاليين
export const tablePlayers = pgTable("table_players", {
  id: serial("id").primaryKey(),
  tableId: integer("table_id").notNull().references(() => gameTables.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  position: integer("position").notNull(), // موضع اللاعب على الطاولة
  currentChips: integer("current_chips").notNull(), // الرقائق الحالية في اللعبة
  isActive: boolean("is_active").default(true), // هل اللاعب نشط أم خارج حالياً
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastAction: text("last_action"), // آخر حركة قام بها
  lastActionTime: timestamp("last_action_time"),
});

// جدول الإنجازات
export const achievementDefinitions = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  rewardChips: integer("reward_chips").default(0),
  rewardDiamonds: integer("reward_diamonds").default(0),
  rewardItemId: integer("reward_item_id"), // مكافأة عنصر خاص
  category: text("category").notNull(), // تصنيف الإنجاز
  difficultyLevel: integer("difficulty_level").default(1).notNull(), // مستوى صعوبة الإنجاز
  requirements: jsonb("requirements").notNull(), // متطلبات تحقيق الإنجاز بتنسيق JSON
});

// جدول إنجازات المستخدم
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer("achievement_id").notNull().references(() => achievementDefinitions.id),
  progress: integer("progress").default(0).notNull(), // نسبة الإكمال (0-100)
  unlocked: boolean("unlocked").notNull().default(false),
  unlockedDate: timestamp("unlocked_date"),
  rewardClaimed: boolean("reward_claimed").default(false),
});

// جدول إحصائيات اللاعب
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  draws: integer("draws").notNull().default(0),
  highestWin: integer("highest_win").notNull().default(0),
  biggestPot: integer("biggest_pot").notNull().default(0),
  winRate: real("win_rate").notNull().default(0), // نسبة الفوز من 0 إلى 1
  joinDate: timestamp("join_date").notNull().defaultNow(),
  totalPlayTime: integer("total_play_time").default(0), // الوقت الإجمالي باللعب بالدقائق
  
  // إحصائيات خاصة بالبوكر
  handsPlayed: integer("hands_played").default(0),
  flopsSeen: integer("flops_seen").default(0),
  turnsReached: integer("turns_reached").default(0),
  riverReached: integer("river_reached").default(0),
  showdownsReached: integer("showdowns_reached").default(0),
  royalFlushes: integer("royal_flushes").default(0),
  straightFlushes: integer("straight_flushes").default(0),
  fourOfAKind: integer("four_of_a_kind").default(0),
  fullHouses: integer("full_houses").default(0),
  flushes: integer("flushes").default(0),
  straights: integer("straights").default(0),
  threeOfAKind: integer("three_of_a_kind").default(0),
  twoPairs: integer("two_pairs").default(0),
  onePairs: integer("one_pairs").default(0),
  
  // إحصائيات إضافية
  totalBets: integer("total_bets").default(0),
  totalRaises: integer("total_raises").default(0),
  totalCalls: integer("total_calls").default(0),
  totalFolds: integer("total_folds").default(0),
  totalChecks: integer("total_checks").default(0),
  totalAllIns: integer("total_all_ins").default(0),
});

// جدول المهام اليومية والأسبوعية
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rewardChips: integer("reward_chips").default(0),
  rewardDiamonds: integer("reward_diamonds").default(0),
  rewardVipPoints: integer("reward_vip_points").default(0),
  type: text("type").notNull(), // يومي، أسبوعي، خاص، إلخ
  requirementType: text("requirement_type").notNull(), // نوع المهمة (عدد الألعاب، الفوز، إلخ)
  targetValue: integer("target_value").notNull(), // القيمة المطلوبة للإكمال
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  gameType: gameTypeEnum("game_type"), // نوع اللعبة المتعلقة بالمهمة
});

// جدول مهام المستخدم
export const userMissions = pgTable("user_missions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  missionId: integer("mission_id").notNull().references(() => missions.id),
  currentProgress: integer("current_progress").default(0).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// جدول المتجر والعروض
export const shopOffers = pgTable("shop_offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: real("price").notNull(), // السعر بالعملة الحقيقية
  chipsAmount: integer("chips_amount").default(0),
  diamondsAmount: integer("diamonds_amount").default(0),
  itemIds: integer("item_ids").array(), // قائمة معرفات العناصر المتضمنة
  discountPercentage: integer("discount_percentage").default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isVipOnly: boolean("is_vip_only").default(false),
  requiredVipLevel: integer("required_vip_level").default(0),
});

// جدول عمليات شراء المستخدمين
export const userPurchases = pgTable("user_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  offerId: integer("offer_id").references(() => shopOffers.id),
  amount: real("amount").notNull(), // المبلغ المدفوع
  currency: text("currency").notNull(), // عملة الدفع
  status: text("status").notNull(), // تم، معلق، ملغي، إلخ
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  itemsPurchased: jsonb("items_purchased"), // تفاصيل العناصر المشتراة
});

// جدول فئات الشارات
export const badgeCategories = pgTable("badge_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // رمز الفئة
  sortOrder: integer("sort_order").default(0), // ترتيب العرض
});

// جدول الشارات
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").references(() => badgeCategories.id),
  isRare: boolean("is_rare").default(false), // هل الشارة نادرة
  isHidden: boolean("is_hidden").default(false), // هل الشارة مخفية حتى يتم اكتسابها
  createdAt: timestamp("created_at").defaultNow().notNull(),
  requiredVipLevel: integer("required_vip_level").default(0), // مستوى VIP المطلوب
  rarityLevel: integer("rarity_level").default(1), // مستوى ندرة الشارة (1-5)
  sortOrder: integer("sort_order").default(0), // ترتيب العرض
  grantCriteria: jsonb("grant_criteria"), // معايير منح الشارة
  color: text("color").default('#D4AF37'), // لون الشارة الافتراضي ذهبي
  glowColor: text("glow_color"), // لون توهج الشارة
  effects: jsonb("effects"), // تأثيرات خاصة للشارة (مثل توهج، حركة، إلخ)
});

// جدول شارات المستخدم
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
  isEquipped: boolean("is_equipped").default(false), // هل الشارة مجهزة (معروضة في الملف الشخصي)
  equippedPosition: integer("equipped_position"), // موضع العرض في الملف الشخصي
  displayProgress: integer("display_progress"), // تقدم العرض (0-100 للشارات التراكمية)
  source: text("source"), // مصدر الحصول على الشارة (إنجاز، هدية، مناسبة، شراء...)
  favoriteOrder: integer("favorite_order"), // ترتيب المفضلة
  metadata: jsonb("metadata"), // بيانات إضافية عن الشارة
});

// مخططات الإدخال للشارات
export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  acquiredAt: true
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type BadgeCategory = typeof badgeCategories.$inferSelect;

// تعريف نوع للتحسينات في لعبة البوكر
export const powerUpTypeEnum = pgEnum('power_up_type', ['speed_boost', 'shield', 'slow_down', 'teleport', 'invisibility', 'double_coins', 'magnet']);

// نظام إضافي مستقبلي يمكن إضافته هنا
