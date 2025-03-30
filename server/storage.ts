import { users, type User, type InsertUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { 
  GameTable, 
  TableStatus, 
  GameState, 
  PlayerPosition,
  GameAction,
  PlayerStats,
  Achievement,
  GameHistoryItem,
  PlayerProfile
} from "../client/src/types";
import { createDeck, shuffleDeck, dealCards, remainingCards } from "../client/src/lib/card-utils";
import { GameRoom, createGameRoom } from "./game-room";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserChips(userId: number, newChips: number): Promise<User | undefined>;
  
  // Game table operations
  getGameTables(): Promise<GameTable[]>;
  getGameTable(tableId: number): Promise<GameTable | undefined>;
  
  // Game state operations
  getGameState(tableId: number, userId: number): Promise<GameState | undefined>;
  joinTable(tableId: number, userId: number): Promise<{ success: boolean; message?: string; gameState?: GameState }>;
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tables: Map<number, GameTable>;
  private gameRooms: Map<number, GameRoom>;
  private playerProfiles: Map<number, PlayerProfile>;
  sessionStore: session.SessionStore;
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
    const tables: GameTable[] = [
      {
        id: this.currentTableId++,
        name: "طاولة المبتدئين",
        smallBlind: 10,
        bigBlind: 20,
        minBuyIn: 500,
        maxPlayers: 9,
        currentPlayers: 2,
        status: "available"
      },
      {
        id: this.currentTableId++,
        name: "الطاولة الذهبية",
        smallBlind: 100,
        bigBlind: 200,
        minBuyIn: 2000,
        maxPlayers: 9,
        currentPlayers: 5,
        status: "busy"
      },
      {
        id: this.currentTableId++,
        name: "طاولة المحترفين",
        smallBlind: 500,
        bigBlind: 1000,
        minBuyIn: 10000,
        maxPlayers: 9,
        currentPlayers: 9,
        status: "full"
      }
    ];
    
    for (const table of tables) {
      this.tables.set(table.id, table);
      this.gameRooms.set(table.id, createGameRoom(table));
    }
  }

  // User operations
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
    const user: User = { 
      ...insertUser, 
      id,
      chips: 5000, // Initial chips for new users
      avatar: undefined
    };
    this.users.set(id, user);
    
    // Create initial player profile
    this.createInitialPlayerProfile(user);
    
    return user;
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
        description: "جمع أكثر من 50,000 رقاقة"
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
  
  async getGameTable(tableId: number): Promise<GameTable | undefined> {
    return this.tables.get(tableId);
  }
  
  // Game state operations
  async getGameState(tableId: number, userId: number): Promise<GameState | undefined> {
    const gameRoom = this.gameRooms.get(tableId);
    if (!gameRoom) return undefined;
    
    return gameRoom.getGameStateForPlayer(userId);
  }
  
  async joinTable(tableId: number, userId: number): Promise<{ success: boolean; message?: string; gameState?: GameState }> {
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
    
    // Add player to the game
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
    if (profile.chips >= 50000) {
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
