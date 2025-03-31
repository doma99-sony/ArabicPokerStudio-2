import { users, type User, type InsertUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import fs from "fs";
import path from "path";
import { 
  GameTable, 
  TableStatus, 
  GameState, 
  PlayerPosition,
  GameAction,
  PlayerStats,
  Achievement,
  GameHistoryItem,
  PlayerProfile,
  GameType
} from "../client/src/types";
import { createDeck, shuffleDeck, dealCards, remainingCards } from "../client/src/lib/card-utils";
import { GameRoom, createGameRoom } from "./game-room";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserChips(userId: number, newChips: number): Promise<User | undefined>;
  updateUsername(userId: number, username: string): Promise<User | undefined>;
  uploadAvatar(userId: number, avatar: any): Promise<string>;
  uploadCoverPhoto(userId: number, coverPhoto: any): Promise<string>;
  
  // Game table operations
  getGameTables(): Promise<GameTable[]>;
  getGameTablesByType(gameType: GameType): Promise<GameTable[]>;
  getGameTable(tableId: number): Promise<GameTable | undefined>;
  
  // Game state operations
  getGameState(tableId: number, userId: number): Promise<GameState | undefined>;
  joinTable(tableId: number, userId: number, position?: number): Promise<{ success: boolean; message?: string; gameState?: GameState }>;
  leaveTable(tableId: number, userId: number): Promise<{ success: boolean; message?: string }>;
  performGameAction(
    tableId: number,
    userId: number,
    action: GameAction,
    amount?: number
  ): Promise<{ success: boolean; message?: string; gameState?: GameState }>;
  
  // Player profile operations
  getPlayerProfile(userId: number): Promise<PlayerProfile | undefined>;
  addGameToHistory(
    userId: number,
    tableId: number,
    result: "win" | "loss",
    chipsChange: number
  ): Promise<void>;
  
  // Session store
  sessionStore: any; // Express session store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tables: Map<number, GameTable>;
  private gameRooms: Map<number, GameRoom>;
  private playerProfiles: Map<number, PlayerProfile>;
  sessionStore: any; // Express session store
  currentId: number;
  currentTableId: number;
  currentGameHistoryId: number;

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
    this.createTableCategory("الفاجر", 2000, 4000, 10000000, 5, 10, "poker");
    
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
        status = "busy";
      }
      
      const table: GameTable = {
        id: this.currentTableId++,
        name: `${categoryName} ${i}`,
        smallBlind,
        bigBlind,
        minBuyIn,
        maxPlayers,
        currentPlayers,
        status,
        category: categoryName, // إضافة فئة الطاولة
        gameType // إضافة نوع اللعبة
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
  
  async updateUserChips(userId: number, newChips: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    user.chips = newChips;
    this.users.set(userId, user);
    return user;
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
  
  // Game state operations
  async getGameState(tableId: number, userId: number): Promise<GameState | undefined> {
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) return undefined;
    
    return gameRoom.getGameStateForPlayer(userId);
  }
  
  async joinTable(tableId: number, userId: number, position?: number): Promise<{ success: boolean; message?: string; gameState?: GameState }> {
    const table = await this.getGameTable(tableId);
    if (!table) {
      return { success: false, message: "الطاولة غير موجودة" };
    }
    
    if (table.status === "full") {
      return { success: false, message: "الطاولة ممتلئة" };
    }
    
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, message: "المستخدم غير موجود" };
    }
    
    if (user.chips < table.minBuyIn) {
      return { success: false, message: "لا تملك رقاقات كافية للانضمام إلى هذه الطاولة" };
    }
    
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) {
      return { success: false, message: "غرفة اللعبة غير موجودة" };
    }
    
    // Update user's chips (deduct table buy-in)
    await this.updateUserChips(userId, user.chips - table.minBuyIn);
    
    // Add player to the game at the specified position if provided
    const joinResult = gameRoom.addPlayer(userId, user.username, table.minBuyIn, user.avatar);
    if (!joinResult.success) {
      // Refund chips if join failed
      await this.updateUserChips(userId, user.chips);
      return joinResult;
    }
    
    // Update table status and player count
    table.currentPlayers++;
    if (table.currentPlayers >= table.maxPlayers) {
      table.status = "full";
    } else if (table.currentPlayers > 0) {
      table.status = "busy";
    }
    this.tables.set(tableId, table);
    
    // Add AI players if the table has only one player (the current user)
    if (table.currentPlayers === 1 && table.gameType === "poker") {
      // Add 1-3 AI players
      const aiCount = Math.min(3, table.maxPlayers - table.currentPlayers);
      
      for (let i = 0; i < aiCount; i++) {
        // Generate AI profile with negative IDs (to distinguish from real users)
        const aiId = -10000 - i; // Negative IDs for AI players
        const aiNames = ["لاعب_آلي_علي", "لاعب_آلي_عمر", "لاعب_آلي_سعيد", "لاعب_آلي_محمد"];
        const aiName = aiNames[i % aiNames.length];
        const aiChips = table.minBuyIn * 2; // AI players start with double buy-in
        
        // Add AI to game
        gameRoom.addPlayer(aiId, aiName, aiChips, null);
        
        // Update table info
        table.currentPlayers++;
        if (table.currentPlayers >= table.maxPlayers) {
          table.status = "full";
          break;
        }
      }
      this.tables.set(tableId, table);
    }
    
    return { 
      success: true, 
      gameState: gameRoom.getGameStateForPlayer(userId) 
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
      table.status = "busy";
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
}

export const storage = new MemStorage();
