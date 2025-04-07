import { 
  users, 
  type User, 
  type InsertUser, 
  type Badge,
  type BadgeCategory,
  type UserBadge,
  type InsertBadge,
  badges,
  badgeCategories,
  userBadges
} from "@shared/schema";
import { userService } from './services/user-service';
import createMemoryStore from "memorystore";
import session from "express-session";
import fs from "fs";
import path from "path";
import { 
  GameTable, 
  TableStatus, 
  GameState, 
  GameAction,
  PlayerStats,
  GameHistoryItem,
  PlayerProfile,
  GameType
} from "../shared/types";

// األإنجازات (غير موجودة في ملف shared/types)
interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

// تأثيرات الشارات (غير موجودة في ملف shared/types)
interface BadgeEffect {
  type: "glow" | "rotate" | "pulse" | "bounce";
  intensity?: number;
  color?: string;
  activationMode: "hover" | "always" | "click";
}
import { createDeck, shuffleDeck, dealCards, remainingCards } from "../client/src/lib/card-utils";
import { GameRoom, createGameRoom } from "./game-room";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserChips(userId: number, newChips: number, type?: string, description?: string): Promise<User | undefined>;
  updateUsername(userId: number, username: string): Promise<User | undefined>;
  uploadAvatar(userId: number, avatar: any): Promise<string>;
  uploadCoverPhoto(userId: number, coverPhoto: any): Promise<string>;
  
  // Game table operations
  getGameTables(): Promise<GameTable[]>;
  getGameTablesByType(gameType: GameType): Promise<GameTable[]>;
  getGameTable(tableId: number): Promise<GameTable | undefined>;
  createTable(tableData: Partial<GameTable>): Promise<GameTable>;
  removeVirtualPlayers(): Promise<void>; // إضافة وظيفة لإزالة اللاعبين الوهميين
  
  // Game state operations
  getGameState(tableId: number, userId: number): Promise<GameState | undefined>;
  joinTable(tableId: number, userId: number, position?: number): Promise<{ success: boolean; message?: string; gameState?: GameState; isSpectator?: boolean }>;
  leaveTable(tableId: number, userId: number): Promise<{ success: boolean; message?: string }>;
  performGameAction(
    tableId: number,
    userId: number,
    action: GameAction,
    amount?: number
  ): Promise<{ success: boolean; message?: string; gameState?: GameState }>;
  startNewRound?(tableId: number): Promise<{ success: boolean; message?: string; gameState?: GameState }>; // إضافة وظيفة اختيارية لبدء جولة جديدة
  
  // Player profile operations
  getPlayerProfile(userId: number): Promise<PlayerProfile | undefined>;
  addGameToHistory(
    userId: number,
    tableId: number,
    result: "win" | "loss",
    chipsChange: number
  ): Promise<void>;
  
  // Badge operations
  getBadgeCategories(): Promise<BadgeCategory[]>;
  getBadges(categoryId?: number): Promise<Badge[]>;
  getUserBadges(userId: number): Promise<UserBadge[]>;
  addUserBadge(userId: number, badgeId: number): Promise<UserBadge | undefined>;
  equipBadge(userId: number, badgeId: number, position?: number): Promise<UserBadge | undefined>;
  unequipBadge(userId: number, badgeId: number): Promise<UserBadge | undefined>;
  addToFavorites(userId: number, badgeId: number, order?: number): Promise<UserBadge | undefined>;
  removeFromFavorites(userId: number, badgeId: number): Promise<UserBadge | undefined>;
  
  // Session store
  sessionStore: any; // Express session store
}

export class MemStorage implements IStorage {
  // تحويل إلى عام للسماح بالوصول من routes.ts
  public users: Map<number, User>;
  public tables: Map<number, GameTable>;
  public gameRooms: Map<number, GameRoom>;
  public playerProfiles: Map<number, PlayerProfile>;
  sessionStore: any; // Express session store
  currentId: number;
  currentTableId: number;
  currentGameHistoryId: number;
  
  // إضافة وظيفة لبدء جولة جديدة
  public startNewRound = async (tableId: number): Promise<{ success: boolean; message?: string; gameState?: GameState }> => {
    console.log(`بدء جولة جديدة في الطاولة ${tableId}`);
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) {
      return { success: false, message: "الطاولة غير موجودة" };
    }
    
    try {
      // الحصول على حالة اللعبة الحالية
      const users = Array.from(this.users.values());
      
      // البحث عن أول مستخدم متاح لاستخدامه للحصول على حالة اللعبة
      let anyPlayerId = -1;
      for (const user of users) {
        const gameState = gameRoom.getGameStateForPlayer(user.id);
        if (gameState.players.some(p => p.isCurrentPlayer)) {
          anyPlayerId = user.id;
          break;
        }
      }
      
      if (anyPlayerId === -1) {
        return { success: false, message: "لا يوجد لاعبين متاحين على الطاولة" };
      }
      
      // محاولة إعادة تشغيل الجولة بإرسال رسالة خاصة
      // هذا سيؤدي إلى إعادة ضبط حالة اللاعبين (folded = false)
      const result = await this.performGameAction(tableId, anyPlayerId, "restart_round");
      
      return {
        success: true,
        message: "تم بدء جولة جديدة بنجاح",
        gameState: result.gameState
      };
    } catch (error) {
      console.error("خطأ في بدء جولة جديدة:", error);
      return { success: false, message: "حدث خطأ أثناء بدء جولة جديدة" };
    }
  };

  constructor() {
    this.users = new Map();
    this.tables = new Map();
    this.gameRooms = new Map();
    this.playerProfiles = new Map();
    this.sessionStore = new (createMemoryStore(session))({
      checkPeriod: 86400000,
    });
    this.currentId = 1;
    this.currentTableId = 1;
    this.currentGameHistoryId = 1;
    
    // Initialize with some default tables
    this.initializeGameTables();
  }

  // Initialize some default game tables
  private initializeGameTables() {
    // إنشاء فئات الطاولات المختلفة لكل نوع من أنواع الألعاب
    
    // طاولات لعبة البوكر العربي
    this.createTableCategory("نوب", 10, 20, 20000, 5, 10, "poker");
    this.createTableCategory("لسه بتعلم", 50, 100, 100000, 5, 10, "poker");
    this.createTableCategory("محترف", 250, 500, 500000, 5, 10, "poker");
    // طاولات صف الفاجر الجديد
    this.createTableCategoryWithNames(["الفاجر المصري", "الفاجر السعودي", "الفاجر الإماراتي", "الفاجر الكويتي", "الفاجر اللبناني", "الفاجر الأردني", "الفاجر المغربي"], 
      100000, 200000, 1000000, 5, "poker");
    
    // طاولات بوكر عرباوي VIP
    this.createTableCategoryWithNames(["المصريين", "السعوديين", "الإماراتيين", "الكويتيين", "اللبنانيين", "الأردنيين", "المغاربة"], 
      100000, 200000, 1000000, 5, "poker");
      
    // طاولات المصريين VIP
    this.createTableCategoryWithNames(["المصريين 1", "المصريين 2", "المصريين 3", "المصريين 4", "المصريين 5", "المصريين 6", "المصريين 7"], 
      100000, 200000, 1000000, 5, "poker");
    
    // طاولات بوكر العرب - طاولات خاصة (الحلو، الحادق، الحراق)
    this.createTableCategoryWithNames(["الحلو", "الحادق", "الحراق"], 
      50, 100, 100000, 9, "arab_poker");
    
    // طاولات لعبة ناروتو
    this.createTableCategory("سهل", 10, 20, 10000, 2, 5, "naruto");
    this.createTableCategory("متوسط", 50, 100, 50000, 2, 5, "naruto");
    this.createTableCategory("صعب", 500, 1000, 500000, 2, 5, "naruto");
    
    // طاولات لعبة تيكين
    this.createTableCategory("مبتدئ", 10, 20, 10000, 2, 5, "tekken");
    this.createTableCategory("متمرس", 100, 200, 100000, 2, 5, "tekken");
    this.createTableCategory("محترف", 1000, 2000, 1000000, 2, 5, "tekken");
    
    // طاولات لعبة دومينو
    this.createTableCategory("عادي", 50, 100, 10000, 4, 5, "domino");
    this.createTableCategory("VIP", 500, 1000, 100000, 4, 5, "domino");
  }
  
  // إنشاء فئة من الطاولات
  private createTableCategory(
    categoryName: string,
    smallBlind: number,
    bigBlind: number,
    minBuyIn: number,
    maxPlayers: number,
    tableCount: number,
    gameType: GameType // إضافة نوع اللعبة
  ) {
    for (let i = 1; i <= tableCount; i++) {
      // توزيع عشوائي لعدد اللاعبين في كل طاولة ليبدو واقعياً
      const currentPlayers = Math.floor(Math.random() * maxPlayers);
      let status: TableStatus = "available";
      
      if (currentPlayers === maxPlayers) {
        status = "full";
      } else if (currentPlayers > 0) {
        status = "available"; // تغيير من busy لأنه غير موجود في نوع TableStatus
      }
      
      const now = new Date();
      
      const table: GameTable = {
        id: this.currentTableId++,
        name: `${categoryName} ${i}`,
        smallBlind,
        bigBlind,
        minBuyIn,
        maxBuyIn: minBuyIn * 10,
        maxPlayers,
        currentPlayers,
        status,
        category: categoryName, // إضافة فئة الطاولة
        gameType, // إضافة نوع اللعبة
        createdAt: now,
        updatedAt: now,
        isVip: false,
        requiredVipLevel: 0
      };
      
      this.tables.set(table.id, table);
      this.gameRooms.set(table.id, createGameRoom(table));
    }
  }
  
  // إنشاء فئة من الطاولات بأسماء محددة
  private createTableCategoryWithNames(
    tableNames: string[],
    smallBlind: number,
    bigBlind: number,
    minBuyIn: number,
    maxPlayers: number,
    gameType: GameType
  ) {
    for (let i = 0; i < tableNames.length; i++) {
      const tableName = tableNames[i];
      // توزيع عشوائي لعدد اللاعبين في كل طاولة ليبدو واقعياً
      const currentPlayers = Math.floor(Math.random() * maxPlayers);
      let status: TableStatus = "available";
      
      if (currentPlayers === maxPlayers) {
        status = "full";
      } else if (currentPlayers > 0) {
        status = "available"; // تغيير من busy لأنه غير موجود في نوع TableStatus
      }
      
      const now = new Date();
      
      const table: GameTable = {
        id: this.currentTableId++,
        name: tableName,
        smallBlind,
        bigBlind,
        minBuyIn,
        maxBuyIn: minBuyIn * 10,
        maxPlayers,
        currentPlayers,
        status,
        category: "الفاجر", // فئة الطاولة
        gameType,
        isVip: true,
        requiredVipLevel: 1,
        createdAt: now,
        updatedAt: now,
        tableSettings: {}
      };
      
      this.tables.set(table.id, table);
      this.gameRooms.set(table.id, createGameRoom(table));
    }
  }

  // User operations
  // إضافة وظائف تحديث المستخدم
  async updateUsername(userId: number, username: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    user.username = username;
    this.users.set(userId, user);
    return user;
  }

  async uploadAvatar(userId: number, avatar: any): Promise<string> {
    // تحديد نوع الملف
    let fileType = avatar.mimetype.split('/')[1];
    if (!fileType || !['jpeg', 'jpg', 'png', 'gif'].includes(fileType)) {
      fileType = 'jpeg'; // استخدام jpeg كامتداد افتراضي
    }
    
    // إنشاء معرّف فريد للصورة
    const uniqueId = Date.now().toString();
    const relativePath = `/uploads/avatars/${userId}_${uniqueId}.${fileType}`;
    const avatarUrl = relativePath; // سنستخدم المسار النسبي
    
    // تأكد من وجود المجلد
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // تخزين بيانات الصورة على القرص
    try {
      // حفظ الملف في المجلد العام
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      fs.writeFileSync(fullPath, avatar.data);
      console.log(`تم حفظ صورة الملف الشخصي بنجاح في: ${fullPath}`);
    } catch (error) {
      console.error('حدث خطأ أثناء تخزين صورة الملف الشخصي:', error);
      // في حالة حدوث خطأ، نستخدم رابط وهمي
      return `https://via.placeholder.com/150?text=user_${userId}`;
    }
    
    // تحديث معلومات المستخدم
    const user = this.users.get(userId);
    if (user) {
      user.avatar = avatarUrl;
      this.users.set(userId, user);
    }
    
    // تحديث ملف تعريف المستخدم
    const profile = this.playerProfiles.get(userId);
    if (profile) {
      profile.avatar = avatarUrl;
      this.playerProfiles.set(userId, profile);
    }
    
    return avatarUrl;
  }

  async uploadCoverPhoto(userId: number, coverPhoto: any): Promise<string> {
    // تحديد نوع الملف
    let fileType = coverPhoto.mimetype.split('/')[1];
    if (!fileType || !['jpeg', 'jpg', 'png', 'gif'].includes(fileType)) {
      fileType = 'jpeg'; // استخدام jpeg كامتداد افتراضي
    }
    
    // إنشاء معرّف فريد للصورة
    const uniqueId = Date.now().toString();
    const relativePath = `/uploads/covers/${userId}_${uniqueId}.${fileType}`;
    const coverPhotoUrl = relativePath; // سنستخدم المسار النسبي
    
    // تأكد من وجود المجلد
    const uploadDir = path.join(process.cwd(), 'public/uploads/covers');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // تخزين بيانات الصورة على القرص
    try {
      // حفظ الملف في المجلد العام
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      fs.writeFileSync(fullPath, coverPhoto.data);
      console.log(`تم حفظ صورة الغلاف بنجاح في: ${fullPath}`);
    } catch (error) {
      console.error('حدث خطأ أثناء تخزين صورة الغلاف:', error);
      // في حالة حدوث خطأ، نستخدم رابط وهمي
      return `https://via.placeholder.com/1200x400?text=cover_${userId}`;
    }
    
    // تحديث ملف تعريف المستخدم
    const profile = this.playerProfiles.get(userId);
    if (profile) {
      profile.coverPhoto = coverPhotoUrl;
      this.playerProfiles.set(userId, profile);
    }
    
    return coverPhotoUrl;
  }

  async convertGuestToRegistered(userId: number, username: string, password: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    // تحديث معلومات المستخدم
    user.username = username;
    user.password = password; // كلمة المرور المشفرة بالفعل
    this.users.set(userId, user);
    
    // تحديث المعلومات في ملف التعريف
    const profile = this.playerProfiles.get(userId);
    if (profile) {
      profile.username = username;
      this.playerProfiles.set(userId, profile);
    }
    
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  // وظيفة للحصول على المستخدمين باستخدام دالة فلتر معينة
  async getUsersByFilter(filter: (user: User) => boolean): Promise<User[]> {
    return Array.from(this.users.values()).filter(filter);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    
    // إنشاء معرف فريد مكون من 5 أرقام للمستخدم
    const userCode = this.generateUniqueUserCode();
    
    const user: User = { 
      ...insertUser, 
      id,
      chips: 1000000, // مليون رقاقة ترحيبية للمستخدمين الجدد
      avatar: null, // استخدام null بدلاً من undefined
      userCode: userCode // إضافة معرف المستخدم المكون من 5 أرقام
    };
    this.users.set(id, user);
    
    // Create initial player profile
    this.createInitialPlayerProfile(user);
    
    return user;
  }
  
  // دالة مساعدة لإنشاء معرف فريد من 5 أرقام لكل مستخدم
  private generateUniqueUserCode(): string {
    // توليد رقم عشوائي من 5 أرقام
    const min = 10000; // أصغر رقم مكون من 5 أرقام
    const max = 99999; // أكبر رقم مكون من 5 أرقام
    let userCode: string;
    
    do {
      // توليد رقم عشوائي
      const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
      userCode = randomCode.toString();
      
      // التحقق من عدم وجود مستخدم آخر بنفس الرمز
      const isCodeTaken = Array.from(this.users.values()).some(user => user.userCode === userCode);
      
      if (!isCodeTaken) {
        break;
      }
      // إذا كان الرمز مستخدم بالفعل، سنقوم بتوليد رمز جديد في الدورة التالية
    } while (true);
    
    return userCode;
  }
  
  async updateUserChips(userId: number, newChips: number, type?: string, description?: string): Promise<User | undefined> {
    try {
      // الحصول على بيانات المستخدم الحالية من الذاكرة
      const user = await this.getUser(userId);
      if (!user) return undefined;
      
      // حساب التغيير في الرصيد
      const chipsChange = newChips - user.chips;
      
      // تحديث الرصيد في الذاكرة
      user.chips = newChips;
      this.users.set(userId, user);
      
      console.log(`تم تحديث رصيد المستخدم ${userId} في الذاكرة، الرصيد الجديد: ${newChips}`);
      
      // سجل المعاملة في سجل التطبيق
      if (type && chipsChange !== 0) {
        console.log(`سجل معاملة: المستخدم ${userId} - ${type} - التغيير: ${chipsChange} - الوصف: ${description || 'غير متوفر'}`);
      }
      
      // تحديث رصيد المستخدم في قاعدة البيانات يتم إجراؤه في routes.ts
      // عن طريق استدعاء userService.updateUserChips مباشرة
      
      return user;
    } catch (error) {
      console.error(`خطأ غير متوقع في تحديث رصيد المستخدم ${userId}:`, error);
      return undefined;
    }
  }
  
  // Create initial player profile with default stats
  private async createInitialPlayerProfile(user: User): Promise<void> {
    const achievements: Achievement[] = [
      {
        id: "beginner",
        name: "لاعب مبتدئ",
        icon: "fa-trophy",
        unlocked: true,
        description: "انضم إلى لعبة البوكر"
      },
      {
        id: "winner",
        name: "فائز 5 مرات",
        icon: "fa-medal",
        unlocked: false,
        description: "فاز 5 مرات في البوكر"
      },
      {
        id: "table_champ",
        name: "بطل الطاولة",
        icon: "fa-crown",
        unlocked: false,
        description: "فاز في نفس الطاولة 3 مرات متتالية"
      },
      {
        id: "poker_king",
        name: "ملك البوكر",
        icon: "fa-gem",
        unlocked: false,
        description: "جمع أكثر من 2,000,000 رقاقة"
      }
    ];
    
    const stats: PlayerStats = {
      gamesPlayed: 0,
      wins: 0,
      highestWin: 0,
      winRate: 0,
      achievements,
      joinDate: new Date().toLocaleDateString("ar-SA")
    };
    
    const profile: PlayerProfile = {
      ...user,
      stats,
      gameHistory: []
    };
    
    this.playerProfiles.set(user.id, profile);
  }
  
  // Game table operations
  async getGameTables(): Promise<GameTable[]> {
    return Array.from(this.tables.values());
  }
  
  // Get game tables by type
  async getGameTablesByType(gameType: GameType): Promise<GameTable[]> {
    return Array.from(this.tables.values()).filter(table => table.gameType === gameType);
  }
  
  async getGameTable(tableId: number): Promise<GameTable | undefined> {
    return this.tables.get(tableId);
  }
  
  // إنشاء طاولة جديدة
  async createTable(tableData: Partial<GameTable>): Promise<GameTable> {
    const tableId = this.currentTableId++;
    
    // إنشاء طاولة جديدة مع جميع الحقول المطلوبة
    const newTable: GameTable = {
      id: tableId,
      name: tableData.name || `طاولة ${tableId}`,
      gameType: tableData.gameType || "poker",
      smallBlind: tableData.smallBlind || 10,
      bigBlind: tableData.bigBlind || (tableData.smallBlind ? tableData.smallBlind * 2 : 20),
      minBuyIn: tableData.minBuyIn || 200,
      maxBuyIn: tableData.maxBuyIn || 2000,
      maxPlayers: tableData.maxPlayers || 9,
      currentPlayers: 0,
      status: "available" as TableStatus,
      category: tableData.category || "عام",
      tableSettings: tableData.tableSettings || {},
      ownerId: tableData.ownerId,
      isVip: tableData.isVip || false,
      password: tableData.password,
      requiredVipLevel: tableData.requiredVipLevel || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      tableImage: tableData.tableImage
    };
    
    console.log(`تم إنشاء طاولة جديدة: ${newTable.name} (${newTable.id})`);
    
    // إضافة الطاولة إلى قائمة الطاولات
    this.tables.set(tableId, newTable);
    
    // إنشاء غرفة لعبة جديدة مرتبطة بهذه الطاولة
    this.gameRooms.set(tableId, createGameRoom(newTable));
    
    return newTable;
  }
  
  // إزالة اللاعبين الوهميين من جميع الطاولات
  async removeVirtualPlayers(): Promise<void> {
    console.log("جاري إزالة جميع اللاعبين الوهميين من الطاولات...");
    
    // إعادة تعيين حالة الطاولات إلى متاحة وعدد اللاعبين إلى 0
    for (const table of this.tables.values()) {
      const oldCount = table.currentPlayers;
      table.currentPlayers = 0;
      table.status = "available";
      
      console.log(`تم تفريغ الطاولة ${table.id} (${table.name}) من ${oldCount} لاعب وهمي`);
    }
    
    // تجديد غرف اللعبة
    for (const [tableId, gameRoom] of this.gameRooms.entries()) {
      const table = this.tables.get(tableId);
      if (table) {
        // إعادة إنشاء غرفة اللعبة لهذه الطاولة
        this.gameRooms.set(tableId, createGameRoom(table));
      }
    }
    
    console.log("تمت إزالة جميع اللاعبين الوهميين بنجاح!");
  }
  
  // Game state operations
  async getGameState(tableId: number, userId: number): Promise<GameState | undefined> {
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) return undefined;
    
    return gameRoom.getGameStateForPlayer(userId);
  }
  
  async joinTable(tableId: number, userId: number, position?: number): Promise<{ success: boolean; message?: string; gameState?: GameState; isSpectator?: boolean }> {
    console.log(`محاولة انضمام المستخدم ${userId} إلى الطاولة ${tableId} بالموضع ${position}`);
    
    const table = await this.getGameTable(tableId);
    if (!table) {
      console.log(`الطاولة ${tableId} غير موجودة`);
      return { success: false, message: "الطاولة غير موجودة" };
    }
    
    if (table.status === "full") {
      console.log(`الطاولة ${tableId} ممتلئة`);
      return { success: false, message: "الطاولة ممتلئة" };
    }
    
    const user = await this.getUser(userId);
    if (!user) {
      console.log(`المستخدم ${userId} غير موجود`);
      return { success: false, message: "المستخدم غير موجود" };
    }
    
    console.log(`تحقق من رصيد المستخدم ${user.username}: ${user.chips} - الحد الأدنى للدخول: ${table.minBuyIn}`);
    
    if (user.chips < table.minBuyIn) {
      console.log(`المستخدم ${userId} لا يملك رقاقات كافية`);
      return { success: false, message: "لا تملك رقاقات كافية للانضمام إلى هذه الطاولة" };
    }
    
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) {
      console.log(`غرفة اللعبة ${tableId} غير موجودة`);
      return { success: false, message: "غرفة اللعبة غير موجودة" };
    }
    
    // التحقق إذا كان اللاعب بالفعل في الغرفة
    try {
      const currentGameState = gameRoom.getGameStateForPlayer(userId);
      const playerInGame = currentGameState.players.some(p => p.id === userId);
      
      if (playerInGame) {
        console.log(`المستخدم ${userId} موجود بالفعل في الطاولة ${tableId}`);
        return { 
          success: true, 
          gameState: currentGameState,
          message: "أنت منضم بالفعل لهذه الطاولة"
        };
      }
    } catch (error) {
      // يمكن تجاهل الخطأ هنا، هذا يعني أن اللاعب غير موجود في اللعبة
      console.log(`المستخدم ${userId} لم يوجد في الغرفة سابقاً، سيتم إضافته الآن`);
    }
    
    // نحفظ رصيد المستخدم الحالي قبل أي تعديل
    const originalChips = user.chips;
    let updatedGameState;
    let joinSuccess = false;
    
    try {
      // أولاً أضف اللاعب إلى غرفة اللعبة بموضع محدد إن وجد
      console.log(`محاولة إضافة المستخدم ${userId} إلى غرفة اللعبة`);
      const joinResult = gameRoom.addPlayer(userId, user.username, table.minBuyIn, user.avatar, position);
      
      console.log(`نتيجة إضافة المستخدم:`, joinResult);
      
      if (!joinResult.success) {
        console.log(`فشل إضافة المستخدم ${userId}: ${joinResult.message}`);
        return joinResult;
      }
      
      // بعد التأكد من نجاح إضافة اللاعب، نقوم بخصم الرقاقات (فقط قيمة الدخول بالضبط)
      console.log(`تحديث رصيد المستخدم ${userId} من ${user.chips} إلى ${user.chips - table.minBuyIn} (خصم ${table.minBuyIn} رقاقة للدخول)`);
      const updatedUser = await this.updateUserChips(userId, Math.max(0, user.chips - table.minBuyIn));
      
      if (!updatedUser) {
        throw new Error("فشل تحديث رصيد المستخدم");
      }
      
      // Update table status and player count
      table.currentPlayers++;
      if (table.currentPlayers >= table.maxPlayers) {
        table.status = "full";
      } else if (table.currentPlayers > 0) {
        table.status = "available"; // تغيير من busy لأنه غير موجود في نوع TableStatus
      }
      this.tables.set(tableId, table);
      
      console.log(`تم انضمام المستخدم ${userId} إلى الطاولة ${tableId} بنجاح`);
      
      // احصل على حالة اللعبة المُحدّثة
      updatedGameState = gameRoom.getGameStateForPlayer(userId);
      console.log(`عدد اللاعبين في الطاولة ${tableId}: ${updatedGameState.players.length}`);
      
      // إذا كان اللاعب وحيداً في الطاولة، نضيف لاعب وهمي تلقائياً بعد فترة قصيرة
      if (updatedGameState.players.length === 1 && updatedGameState.gameStatus === "waiting") {
        console.log(`لاعب وحيد في الطاولة ${tableId}، سيتم إضافة لاعب وهمي بعد 3 ثوانٍ...`);
        
        // إضافة تأخير 3 ثوانٍ قبل إضافة اللاعب الوهمي
        setTimeout(async () => {
          try {
            // التحقق مرة أخرى من عدد اللاعبين (في حال انضم لاعب آخر خلال فترة الانتظار)
            const currentState = gameRoom.getGameStateForPlayer(userId);
            if (currentState.players.length === 1 && currentState.gameStatus === "waiting") {
              // إنشاء معرف فريد للاعب الوهمي (سالب لتمييزه عن اللاعبين الحقيقيين)
              const aiId = -Math.floor(Math.random() * 1000) - 1; // -1, -2, -3, ... , -1000
              
              // اختيار اسم عشوائي للاعب الوهمي
              const aiNames = ["روبوت ذكي", "لاعب آلي", "جيمي بوت", "بوت الفاجر", "ذكاء اصطناعي", "بوكر بوت"];
              const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
              
              // إضافة اللاعب الوهمي مع رقاقات مساوية للحد الأدنى للدخول
              console.log(`إضافة لاعب وهمي (${aiName}) إلى الطاولة ${tableId}...`);
              
              // موقع عشوائي للاعب الوهمي
              const aiPosition = Math.floor(Math.random() * (table.maxPlayers - 1)) + 1;
              const aiResult = gameRoom.addPlayer(aiId, aiName, table.minBuyIn * 2, "/images/ai-avatar.png", aiPosition, true);
              
              if (aiResult.success) {
                console.log(`تم إضافة اللاعب الوهمي بنجاح إلى الطاولة ${tableId}`);
                
                // تحديث حالة الطاولة
                table.currentPlayers = Math.min(table.currentPlayers + 1, table.maxPlayers);
                if (table.currentPlayers >= table.maxPlayers) {
                  table.status = "full";
                } else {
                  table.status = "available"; // تغيير من busy لأنه غير موجود في نوع TableStatus
                }
                this.tables.set(tableId, table);
              } else {
                console.error(`فشل إضافة اللاعب الوهمي: ${aiResult.message}`);
              }
            } else {
              console.log(`تم إلغاء إضافة اللاعب الوهمي لأن الطاولة ${tableId} أصبحت تحتوي على أكثر من لاعب واحد`);
            }
          } catch (error) {
            console.error(`خطأ عند محاولة إضافة لاعب وهمي: ${error}`);
          }
        }, 3000); // انتظار 3 ثوانٍ قبل إضافة اللاعب الوهمي
      }
      
      // التأكد من وجود اللاعب في قائمة اللاعبين
      if (updatedGameState.players.some(p => p.id === userId)) {
        joinSuccess = true;
      } else {
        throw new Error("اللاعب غير موجود في قائمة اللاعبين بعد الانضمام");
      }
    } catch (error) {
      // في حالة حدوث أي خطأ، أعد رصيد المستخدم إلى الحالة الأصلية
      console.error(`خطأ أثناء الانضمام: ${error}`);
      await this.updateUserChips(userId, originalChips);
      
      // وحاول إزالته من الطاولة
      try {
        gameRoom.removePlayer(userId);
      } catch (removeError) {
        console.error(`خطأ أثناء محاولة إزالة اللاعب بعد فشل الانضمام: ${removeError}`);
      }
      
      return { 
        success: false, 
        message: "حدث خطأ أثناء الانضمام إلى الطاولة. لم يتم خصم أي رقاقات." 
      };
    }
    
    if (!joinSuccess) {
      // إذا فشلت العملية في أي مرحلة، تأكد من إعادة رصيد المستخدم
      await this.updateUserChips(userId, originalChips);
      return { 
        success: false, 
        message: "لم تنجح عملية الانضمام. لم يتم خصم أي رقاقات." 
      };
    }
    
    return { 
      success: true, 
      gameState: updatedGameState,
      isSpectator: false
    };
  }
  
  async leaveTable(tableId: number, userId: number): Promise<{ success: boolean; message?: string }> {
    const table = await this.getGameTable(tableId);
    if (!table) {
      return { success: false, message: "الطاولة غير موجودة" };
    }
    
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) {
      return { success: false, message: "غرفة اللعبة غير موجودة" };
    }
    
    // Remove player and get their chips
    const leaveResult = gameRoom.removePlayer(userId);
    if (!leaveResult.success) {
      return leaveResult;
    }
    
    // Update user's chips (add remaining chips from table)
    const user = await this.getUser(userId);
    if (user && leaveResult.chips) {
      await this.updateUserChips(userId, user.chips + leaveResult.chips);
    }
    
    // Update table status and player count
    table.currentPlayers--;
    if (table.currentPlayers <= 0) {
      table.status = "available";
    } else if (table.currentPlayers < table.maxPlayers) {
      table.status = "available"; // تغيير من busy لأنه غير موجود في نوع TableStatus
    }
    this.tables.set(tableId, table);
    
    return { success: true };
  }
  
  async performGameAction(
    tableId: number,
    userId: number,
    action: GameAction,
    amount?: number
  ): Promise<{ success: boolean; message?: string; gameState?: GameState }> {
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) {
      return { success: false, message: "غرفة اللعبة غير موجودة" };
    }
    
    const actionResult = gameRoom.performAction(userId, action, amount);
    if (!actionResult.success) {
      return actionResult;
    }
    
    // If the action resulted in a game end (showdown), update player stats and history
    if (actionResult.gameEnded && actionResult.results) {
      for (const result of actionResult.results) {
        const user = await this.getUser(result.playerId);
        if (user) {
          // Update user chips
          await this.updateUserChips(user.id, user.chips + result.chipsChange);
          
          // Update player profile
          await this.addGameToHistory(
            user.id,
            tableId,
            result.chipsChange > 0 ? "win" : "loss",
            result.chipsChange
          );
        }
      }
    }
    
    return { 
      success: true, 
      gameState: gameRoom.getGameStateForPlayer(userId) 
    };
  }
  
  // Player profile operations
  async getPlayerProfile(userId: number): Promise<PlayerProfile | undefined> {
    return this.playerProfiles.get(userId);
  }
  
  async addGameToHistory(
    userId: number,
    tableId: number,
    result: "win" | "loss",
    chipsChange: number
  ): Promise<void> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile) return;
    
    const table = await this.getGameTable(tableId);
    
    // Create game history entry
    const historyItem: GameHistoryItem = {
      id: this.currentGameHistoryId++,
      date: new Date().toLocaleDateString("ar-SA"),
      tableName: table ? table.name : "طاولة غير معروفة",
      result,
      chipsChange: Math.abs(chipsChange)
    };
    
    // Update statistics
    profile.stats.gamesPlayed++;
    if (result === "win") {
      profile.stats.wins++;
      if (chipsChange > profile.stats.highestWin) {
        profile.stats.highestWin = chipsChange;
      }
    }
    profile.stats.winRate = Math.round((profile.stats.wins / profile.stats.gamesPlayed) * 100);
    
    // Update achievements
    // 1. Winner achievement
    if (profile.stats.wins >= 5) {
      const winnerAchievement = profile.stats.achievements.find(a => a.id === "winner");
      if (winnerAchievement && !winnerAchievement.unlocked) {
        winnerAchievement.unlocked = true;
      }
    }
    
    // 2. Poker king achievement
    if (profile.chips >= 2000000) { // مليونان رقاقة للحصول على إنجاز ملك البوكر
      const kingAchievement = profile.stats.achievements.find(a => a.id === "poker_king");
      if (kingAchievement && !kingAchievement.unlocked) {
        kingAchievement.unlocked = true;
      }
    }
    
    // Add to history (keep most recent 20 games)
    profile.gameHistory.unshift(historyItem);
    if (profile.gameHistory.length > 20) {
      profile.gameHistory = profile.gameHistory.slice(0, 20);
    }
    
    // Update the profile
    this.playerProfiles.set(userId, profile);
  }
  
  // Badge operations
  async getBadgeCategories(): Promise<BadgeCategory[]> {
    // In the memory storage implementation, we'll create some default badge categories
    const categories: BadgeCategory[] = [
      {
        id: 1,
        name: "إنجازات اللعب",
        description: "شارات تمنح عند تحقيق إنجازات معينة في اللعب",
        icon: "🏆",
        sortOrder: 1
      },
      {
        id: 2,
        name: "شارات VIP",
        description: "شارات خاصة بأعضاء VIP",
        icon: "👑",
        sortOrder: 2
      },
      {
        id: 3,
        name: "أحداث خاصة",
        description: "شارات تمنح خلال المناسبات والأحداث الخاصة",
        icon: "🎉",
        sortOrder: 3
      },
      {
        id: 4,
        name: "مجتمع اللاعبين",
        description: "شارات تتعلق بالتفاعل مع المجتمع",
        icon: "👥",
        sortOrder: 4
      }
    ];
    
    return categories;
  }
  
  async getBadges(categoryId?: number): Promise<Badge[]> {
    // Define default badges
    const allBadges: Badge[] = [
      {
        id: 1,
        name: "لاعب جديد",
        description: "انضم للعبة وأكمل التسجيل",
        imageUrl: "/assets/badges/new-player.svg",
        categoryId: 1,
        isRare: false,
        isHidden: false,
        requiredVipLevel: 0,
        rarityLevel: 1,
        sortOrder: 1,
        color: "#4CAF50",
        createdAt: new Date()
      },
      {
        id: 2,
        name: "فائز محترف",
        description: "فاز بـ 10 مباريات متتالية",
        imageUrl: "/assets/badges/pro-winner.svg",
        categoryId: 1,
        isRare: true,
        isHidden: false,
        requiredVipLevel: 0,
        rarityLevel: 4,
        sortOrder: 2,
        color: "#FFC107",
        glowColor: "#FFD700",
        effects: [
          { type: "glow", intensity: 5, color: "#FFD700", activationMode: "always" }
        ],
        createdAt: new Date()
      },
      {
        id: 3,
        name: "عضو VIP",
        description: "وصل إلى مستوى VIP",
        imageUrl: "/assets/badges/vip-member.svg",
        categoryId: 2,
        isRare: false,
        isHidden: false,
        requiredVipLevel: 1,
        rarityLevel: 2,
        sortOrder: 1,
        color: "#9C27B0",
        glowColor: "#E1BEE7",
        effects: [
          { type: "pulse", intensity: 3, activationMode: "hover" }
        ],
        createdAt: new Date()
      },
      {
        id: 4,
        name: "مليونير الرقائق",
        description: "امتلك أكثر من مليون رقاقة",
        imageUrl: "/assets/badges/chip-millionaire.svg",
        categoryId: 1,
        isRare: true,
        isHidden: false,
        requiredVipLevel: 0,
        rarityLevel: 3,
        sortOrder: 3,
        color: "#F44336",
        glowColor: "#FFCDD2",
        effects: [
          { type: "sparkle", intensity: 7, color: "#FFD700", activationMode: "hover" }
        ],
        createdAt: new Date()
      },
      {
        id: 5,
        name: "بطل رمضان",
        description: "شارك في بطولة رمضان",
        imageUrl: "/assets/badges/ramadan-champion.svg",
        categoryId: 3,
        isRare: true,
        isHidden: false,
        requiredVipLevel: 0,
        rarityLevel: 3,
        sortOrder: 1,
        color: "#2196F3",
        effects: [
          { type: "rotate", intensity: 2, activationMode: "hover" }
        ],
        createdAt: new Date()
      }
    ];
    
    // Filter by category ID if provided
    if (categoryId !== undefined) {
      return allBadges.filter(badge => badge.categoryId === categoryId);
    }
    
    return allBadges;
  }
  
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile || !profile.badges) {
      return [];
    }
    
    return profile.badges;
  }
  
  async addUserBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile) return undefined;
    
    // Make sure badges array exists
    if (!profile.badges) {
      profile.badges = [];
    }
    
    // Check if user already has this badge
    const existingBadge = profile.badges.find(ub => ub.badgeId === badgeId);
    if (existingBadge) {
      return existingBadge;
    }
    
    // Get the badge details
    const allBadges = await this.getBadges();
    const badge = allBadges.find(b => b.id === badgeId);
    
    if (!badge) {
      return undefined;
    }
    
    // Create new user badge
    const userBadge: UserBadge = {
      id: Date.now(), // Use timestamp as ID for in-memory storage
      userId,
      badgeId,
      badge,
      acquiredAt: new Date(),
      isEquipped: false,
      displayProgress: 100, // Default to complete
      source: "award" // Default source
    };
    
    // Add to user's badges
    profile.badges.push(userBadge);
    
    // Update badge counts
    profile.badgeCount = profile.badges.length;
    profile.rareCount = profile.badges.filter(ub => ub.badge.isRare).length;
    
    // Save changes
    this.playerProfiles.set(userId, profile);
    
    return userBadge;
  }
  
  async equipBadge(userId: number, badgeId: number, position: number = 0): Promise<UserBadge | undefined> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile || !profile.badges) return undefined;
    
    // Find the badge
    const userBadge = profile.badges.find(ub => ub.badgeId === badgeId);
    if (!userBadge) return undefined;
    
    // Unequip any badge in the same position
    if (profile.equippedBadges && position !== undefined) {
      const badgeInPosition = profile.equippedBadges.find(ub => ub.equippedPosition === position);
      if (badgeInPosition) {
        badgeInPosition.isEquipped = false;
        badgeInPosition.equippedPosition = undefined;
      }
    }
    
    // Equip the badge
    userBadge.isEquipped = true;
    userBadge.equippedPosition = position;
    
    // Make sure equippedBadges array exists
    if (!profile.equippedBadges) {
      profile.equippedBadges = [];
    }
    
    // Add to equipped badges (if not already there)
    const existingIndex = profile.equippedBadges.findIndex(ub => ub.badgeId === badgeId);
    if (existingIndex >= 0) {
      profile.equippedBadges[existingIndex] = userBadge;
    } else {
      profile.equippedBadges.push(userBadge);
    }
    
    // Save changes
    this.playerProfiles.set(userId, profile);
    
    return userBadge;
  }
  
  async unequipBadge(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile || !profile.badges) return undefined;
    
    // Find the badge
    const userBadge = profile.badges.find(ub => ub.badgeId === badgeId);
    if (!userBadge) return undefined;
    
    // Unequip the badge
    userBadge.isEquipped = false;
    userBadge.equippedPosition = undefined;
    
    // Remove from equipped badges
    if (profile.equippedBadges) {
      profile.equippedBadges = profile.equippedBadges.filter(ub => ub.badgeId !== badgeId);
    }
    
    // Save changes
    this.playerProfiles.set(userId, profile);
    
    return userBadge;
  }
  
  async addToFavorites(userId: number, badgeId: number, order: number = 0): Promise<UserBadge | undefined> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile || !profile.badges) return undefined;
    
    // Find the badge
    const userBadge = profile.badges.find(ub => ub.badgeId === badgeId);
    if (!userBadge) return undefined;
    
    // Update favorite order
    userBadge.favoriteOrder = order;
    
    // Make sure favoriteBadges array exists
    if (!profile.favoriteBadges) {
      profile.favoriteBadges = [];
    }
    
    // Add to favorite badges (if not already there)
    const existingIndex = profile.favoriteBadges.findIndex(ub => ub.badgeId === badgeId);
    if (existingIndex >= 0) {
      profile.favoriteBadges[existingIndex] = userBadge;
    } else {
      profile.favoriteBadges.push(userBadge);
    }
    
    // Sort favorites by order
    profile.favoriteBadges.sort((a, b) => (a.favoriteOrder || 0) - (b.favoriteOrder || 0));
    
    // Save changes
    this.playerProfiles.set(userId, profile);
    
    return userBadge;
  }
  
  async removeFromFavorites(userId: number, badgeId: number): Promise<UserBadge | undefined> {
    const profile = await this.getPlayerProfile(userId);
    if (!profile || !profile.badges) return undefined;
    
    // Find the badge
    const userBadge = profile.badges.find(ub => ub.badgeId === badgeId);
    if (!userBadge) return undefined;
    
    // Remove favorite order
    userBadge.favoriteOrder = undefined;
    
    // Remove from favorites
    if (profile.favoriteBadges) {
      profile.favoriteBadges = profile.favoriteBadges.filter(ub => ub.badgeId !== badgeId);
    }
    
    // Save changes
    this.playerProfiles.set(userId, profile);
    
    return userBadge;
  }
}

export const storage = new MemStorage();
