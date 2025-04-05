import { db } from '../db';
import { sql } from 'drizzle-orm';
import { 
  lionGazelleLevels, 
  lionGameUserStats, 
  lionGameHistory, 
  userChipsTransactions,
  lionGamePowerUps,
  lionGameCharacters,
  userLionGameItems
} from '../../shared/schema';
import { and, eq, desc, gte, avg, count, sum } from 'drizzle-orm';

export interface LionGameState {
  gameId: string;
  status: 'waiting' | 'running' | 'ended';
  startTime?: number;
  endTime?: number;
  crashPoint: number;
  currentMultiplier: number;
  players: LionGamePlayer[];
  countdown: number;
}

export interface LionGamePlayer {
  userId: number;
  username: string;
  avatar?: string;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number;
  status: 'betting' | 'playing' | 'cashed_out' | 'busted';
}

export interface LionGameBet {
  userId: number;
  betAmount: number;
}

export interface LionGameCashout {
  userId: number;
  multiplier: number;
  profit: number;
}

export interface LionGameResult {
  gameId: string;
  crashPoint: number;
  duration: number;
  players: LionGamePlayer[];
  totalBets: number;
  totalProfits: number;
  timestamp: number;
}

export interface UserGameStats {
  totalGames: number;
  wins: number;
  losses: number;
  bestMultiplier: number;
  biggestWin: number;
  totalWagered: number;
  totalProfit: number;
  averageMultiplier: number;
  favoriteCharacter?: {
    id: number;
    name: string;
    imageUrl: string;
  };
}

class LionGazelleGameService {
  private activeGames: Map<string, LionGameState> = new Map();
  private gameIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  // Seed values for provably fair game results (should be stored securely in production)
  private serverSeed: string = this.generateRandomString(32);
  private nextServerSeed: string = this.generateRandomString(32);
  
  constructor() {
    // Initialize any required settings
    console.log('Lion and Gazelle Game Service initialized');
  }
  
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const rand = new Uint8Array(length);
    crypto.getRandomValues(rand);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(rand[i] % chars.length);
    }
    return result;
  }
  
  /**
   * Create a new game session
   */
  async createGame(): Promise<string> {
    const gameId = Date.now().toString();
    
    // Generate a crash point between 1.0 and 10.0
    // In production, this should use a provably fair algorithm
    // For simplicity, we're using a random number generator here
    const crashPoint = this.generateCrashPoint();
    
    const gameState: LionGameState = {
      gameId,
      status: 'waiting',
      crashPoint,
      currentMultiplier: 1.0,
      players: [],
      countdown: 10
    };
    
    this.activeGames.set(gameId, gameState);
    
    // Start countdown timer
    this.startCountdown(gameId);
    
    return gameId;
  }
  
  /**
   * Generate a crash point using a provably fair algorithm
   * This is a simplified version, in production should use HMAC-SHA256 or similar
   */
  private generateCrashPoint(): number {
    // Simple algorithm to generate a crash point
    // For production, use a more secure and provably fair approach
    const e = 2 ** 32;
    const h = this.simpleHash(this.serverSeed);
    
    // Generate a number between 1 and 10
    // Normal distribution would be more realistic
    const crashPoint = 1 + ((h / e) * 9);
    return parseFloat(crashPoint.toFixed(2));
  }
  
  /**
   * Simplified hash function for demo purposes
   * In production, use a cryptographically secure hash like HMAC-SHA256
   */
  private simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Start the countdown timer for a game
   */
  private startCountdown(gameId: string): void {
    const game = this.activeGames.get(gameId);
    if (!game) return;
    
    let countdown = 10; // 10 seconds countdown
    game.countdown = countdown;
    
    const interval = setInterval(() => {
      countdown--;
      
      const updatedGame = this.activeGames.get(gameId);
      if (!updatedGame) {
        clearInterval(interval);
        return;
      }
      
      updatedGame.countdown = countdown;
      this.activeGames.set(gameId, updatedGame);
      
      if (countdown <= 0) {
        clearInterval(interval);
        this.startGame(gameId);
      }
    }, 1000);
    
    this.gameIntervals.set(gameId, interval);
  }
  
  /**
   * Start a game after countdown
   */
  private startGame(gameId: string): void {
    const game = this.activeGames.get(gameId);
    if (!game) return;
    
    // Update game state
    game.status = 'running';
    game.startTime = Date.now();
    this.activeGames.set(gameId, game);
    
    // Start the multiplier increment
    const interval = setInterval(() => {
      const currentGame = this.activeGames.get(gameId);
      if (!currentGame) {
        clearInterval(interval);
        return;
      }
      
      // Use an exponential curve for multiplier growth
      // This gives it the typical "crash" game feel
      const elapsedTime = Date.now() - (currentGame.startTime || 0);
      const elapsedSeconds = elapsedTime / 1000;
      
      // Calculate new multiplier using an exponential function
      // Formula: 1.0 * e^(0.06 * elapsedSeconds)
      // This gives a reasonable growth curve for a crash game
      const newMultiplier = 1.0 * Math.pow(Math.E, 0.06 * elapsedSeconds);
      currentGame.currentMultiplier = parseFloat(newMultiplier.toFixed(2));
      
      // Update game state
      this.activeGames.set(gameId, currentGame);
      
      // Check if crash point reached
      if (currentGame.currentMultiplier >= currentGame.crashPoint) {
        clearInterval(interval);
        this.endGame(gameId);
      }
    }, 100); // Update every 100ms for smooth animation
    
    this.gameIntervals.set(gameId, interval);
  }
  
  /**
   * End a game when crash point is reached
   */
  private async endGame(gameId: string): Promise<void> {
    const game = this.activeGames.get(gameId);
    if (!game) return;
    
    // Mark game as ended
    game.status = 'ended';
    game.endTime = Date.now();
    
    // Mark all remaining active players as busted
    game.players = game.players.map(player => {
      if (player.status === 'playing') {
        return {
          ...player,
          status: 'busted',
          profit: -player.betAmount
        };
      }
      return player;
    });
    
    // Save game result to database
    try {
      await this.saveGameResult(game);
      
      // Rotate server seeds for next game
      this.serverSeed = this.nextServerSeed;
      this.nextServerSeed = this.generateRandomString(32);
      
      // Start a new game automatically after a short delay
      setTimeout(() => {
        this.createGame();
      }, 5000);
      
    } catch (error) {
      console.error('Error saving game result:', error);
    }
    
    // Update active games map
    this.activeGames.set(gameId, game);
  }
  
  /**
   * Save game result to database
   */
  private async saveGameResult(game: LionGameState): Promise<void> {
    if (!db) return;
    
    // Calculate game statistics
    const totalBets = game.players.reduce((sum, p) => sum + p.betAmount, 0);
    const totalProfits = game.players.reduce((sum, p) => sum + p.profit, 0);
    const duration = ((game.endTime || 0) - (game.startTime || 0)) / 1000;
    
    // For each player, create a game history entry
    for (const player of game.players) {
      try {
        // Insert game history record
        await db.insert(lionGameHistory).values({
          userId: player.userId,
          startTime: new Date((game.startTime || 0)),
          endTime: new Date((game.endTime || 0)),
          duration: Math.round(duration),
          score: Math.floor(player.cashoutMultiplier || 1),
          multiplier: player.cashoutMultiplier || 1.0,
          result: player.status === 'cashed_out' ? 'win' : 'loss',
          rewardChips: Math.max(0, player.profit),
          gameData: {
            betAmount: player.betAmount,
            crashPoint: game.crashPoint,
            cashoutMultiplier: player.cashoutMultiplier
          }
        });
        
        // Update user stats
        await this.updateUserStats(player.userId, {
          won: player.status === 'cashed_out',
          betAmount: player.betAmount,
          profit: player.profit,
          multiplier: player.cashoutMultiplier || 1.0
        });
        
        // Create transaction for player's bet result
        if (player.status === 'cashed_out' && player.profit > 0) {
          // Player won
          await db.insert(userChipsTransactions).values({
            userId: player.userId,
            amount: player.profit,
            balanceAfter: 0, // Will be calculated in the storage layer
            type: 'lion_game_win',
            description: `Lion Game Win - ${player.cashoutMultiplier}x multiplier`,
            reference: game.gameId
          });
        }
      } catch (error) {
        console.error(`Error saving game result for player ${player.userId}:`, error);
      }
    }
  }
  
  /**
   * Update user statistics
   */
  private async updateUserStats(userId: number, stats: { 
    won: boolean;
    betAmount: number;
    profit: number;
    multiplier: number;
  }): Promise<void> {
    if (!db) return;
    
    try {
      // Get existing stats for user
      const existingStats = await db.select().from(lionGameUserStats)
        .where(eq(lionGameUserStats.userId, userId));
      
      if (existingStats.length > 0) {
        // Update existing stats
        await db.update(lionGameUserStats)
          .set({
            totalGamesPlayed: existingStats[0].totalGamesPlayed + 1,
            gamesWon: existingStats[0].gamesWon + (stats.won ? 1 : 0),
            gamesLost: existingStats[0].gamesLost + (stats.won ? 0 : 1),
            highestScore: Math.max(existingStats[0].highestScore, stats.won ? Math.floor(stats.betAmount * stats.multiplier) : 0),
            lastPlayed: new Date()
          })
          .where(eq(lionGameUserStats.userId, userId));
      } else {
        // Create new stats record
        await db.insert(lionGameUserStats).values({
          userId,
          totalGamesPlayed: 1,
          gamesWon: stats.won ? 1 : 0,
          gamesLost: stats.won ? 0 : 1,
          highestScore: stats.won ? Math.floor(stats.betAmount * stats.multiplier) : 0,
          lastPlayed: new Date()
        });
      }
    } catch (error) {
      console.error(`Error updating stats for user ${userId}:`, error);
    }
  }
  
  /**
   * Place a bet in an active game
   */
  async placeBet(gameId: string, userId: number, username: string, avatar: string | null, betAmount: number): Promise<{ success: boolean; message?: string }> {
    const game = this.activeGames.get(gameId);
    
    if (!game) {
      return { success: false, message: 'اللعبة غير موجودة' };
    }
    
    if (game.status !== 'waiting') {
      return { success: false, message: 'لا يمكن المراهنة بعد بدء اللعبة' };
    }
    
    // Check if player already has a bet in this game
    const existingPlayerIndex = game.players.findIndex(p => p.userId === userId);
    
    if (existingPlayerIndex >= 0) {
      return { success: false, message: 'لديك مراهنة بالفعل في هذه اللعبة' };
    }
    
    // Add player to game
    game.players.push({
      userId,
      username,
      avatar: avatar || undefined,
      betAmount,
      cashoutMultiplier: null,
      profit: 0,
      status: 'betting'
    });
    
    // Update game state
    this.activeGames.set(gameId, game);
    
    // Record transaction in database
    try {
      if (db) {
        await db.insert(userChipsTransactions).values({
          userId: userId,
          amount: -betAmount,
          balanceAfter: 0, // Will be calculated in the storage layer
          type: 'lion_game_bet',
          description: 'Lion Game Bet',
          reference: gameId
        });
      }
    } catch (error) {
      console.error('Error recording bet transaction:', error);
    }
    
    return { success: true };
  }
  
  /**
   * Cash out from an active game
   */
  async cashOut(gameId: string, userId: number): Promise<{ 
    success: boolean; 
    message?: string;
    multiplier?: number;
    profit?: number;
  }> {
    const game = this.activeGames.get(gameId);
    
    if (!game) {
      return { success: false, message: 'اللعبة غير موجودة' };
    }
    
    if (game.status !== 'running') {
      return { success: false, message: 'لا يمكن السحب قبل بدء اللعبة أو بعد انتهائها' };
    }
    
    // Find player
    const playerIndex = game.players.findIndex(p => p.userId === userId);
    
    if (playerIndex < 0) {
      return { success: false, message: 'لست مشاركًا في هذه اللعبة' };
    }
    
    const player = game.players[playerIndex];
    
    if (player.status !== 'playing' && player.status !== 'betting') {
      return { success: false, message: 'لقد قمت بالسحب بالفعل أو انتهت اللعبة' };
    }
    
    // Calculate profit
    const multiplier = game.currentMultiplier;
    const winAmount = Math.floor(player.betAmount * multiplier);
    const profit = winAmount - player.betAmount;
    
    // Update player status
    game.players[playerIndex] = {
      ...player,
      status: 'cashed_out',
      cashoutMultiplier: multiplier,
      profit
    };
    
    // Update game state
    this.activeGames.set(gameId, game);
    
    return { 
      success: true,
      multiplier,
      profit
    };
  }
  
  /**
   * Get a specific game
   */
  getGame(gameId: string): LionGameState | undefined {
    return this.activeGames.get(gameId);
  }
  
  /**
   * Get all active games
   */
  getAllGames(): LionGameState[] {
    return Array.from(this.activeGames.values());
  }
  
  /**
   * Get current active game
   */
  getCurrentGame(): LionGameState | undefined {
    // Get the most recent game (should be the only one in most cases)
    const games = Array.from(this.activeGames.values());
    if (games.length === 0) {
      // Create a new game if none exist
      this.createGame();
      return undefined;
    }
    return games[games.length - 1];
  }
  
  /**
   * Get recent game history
   */
  async getRecentGames(limit = 10): Promise<any[]> {
    if (!db) return [];
    
    try {
      const results = await db.select({
        gameId: lionGameHistory.id,
        startTime: lionGameHistory.startTime,
        endTime: lionGameHistory.endTime,
        multiplier: lionGameHistory.multiplier,
        playerCount: count(),
        totalBet: sum(lionGameHistory.score)
      })
      .from(lionGameHistory)
      .groupBy(lionGameHistory.id, lionGameHistory.startTime, lionGameHistory.endTime, lionGameHistory.multiplier)
      .orderBy(desc(lionGameHistory.startTime))
      .limit(limit);
      
      return results;
    } catch (error) {
      console.error('Error fetching recent games:', error);
      return [];
    }
  }
  
  /**
   * Get user stats for the game
   */
  async getUserStats(userId: number): Promise<UserGameStats | null> {
    if (!db) return null;
    
    try {
      // Get basic stats from lionGameUserStats
      const userStats = await db.select().from(lionGameUserStats)
        .where(eq(lionGameUserStats.userId, userId));
      
      if (userStats.length === 0) {
        return {
          totalGames: 0,
          wins: 0,
          losses: 0,
          bestMultiplier: 0,
          biggestWin: 0,
          totalWagered: 0,
          totalProfit: 0,
          averageMultiplier: 0
        };
      }
      
      // Get more detailed stats from game history
      const history = await db.select({
        totalWagered: sum(sql`CAST((game_data->>'betAmount') AS INTEGER)`),
        totalProfit: sum(lionGameHistory.rewardChips),
        bestMultiplier: sql`MAX(multiplier)`,
        averageMultiplier: avg(lionGameHistory.multiplier)
      })
      .from(lionGameHistory)
      .where(eq(lionGameHistory.userId, userId));
      
      // Get favorite character if exists
      let favoriteCharacter;
      if (userStats[0].favoriteCharacter) {
        const character = await db.select().from(lionGameCharacters)
          .where(eq(lionGameCharacters.id, userStats[0].favoriteCharacter!));
        
        if (character.length > 0) {
          favoriteCharacter = {
            id: character[0].id,
            name: character[0].name,
            imageUrl: character[0].imageUrl
          };
        }
      }
      
      return {
        totalGames: userStats[0].totalGamesPlayed,
        wins: userStats[0].gamesWon,
        losses: userStats[0].gamesLost,
        bestMultiplier: Number(history[0].bestMultiplier) || 0,
        biggestWin: userStats[0].highestScore,
        totalWagered: Number(history[0].totalWagered) || 0,
        totalProfit: Number(history[0].totalProfit) || 0,
        averageMultiplier: Number(history[0].averageMultiplier) || 0,
        favoriteCharacter
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
  
  /**
   * Get leaderboard for the game
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time', limit = 10): Promise<any[]> {
    if (!db) return [];
    
    try {
      // Calculate date range based on period
      let dateFilter;
      const now = new Date();
      
      switch (period) {
        case 'daily':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = gte(lionGameHistory.startTime, today);
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateFilter = gte(lionGameHistory.startTime, weekStart);
          break;
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = gte(lionGameHistory.startTime, monthStart);
          break;
        case 'all_time':
        default:
          dateFilter = sql`1=1`; // No date filter
      }
      
      // Get top winners
      const leaderboard = await db.select({
        userId: lionGameHistory.userId,
        totalWins: sum(lionGameHistory.rewardChips),
        gamesPlayed: count(),
        highestMultiplier: sql`MAX(multiplier)`
      })
      .from(lionGameHistory)
      .where(and(
        eq(lionGameHistory.result, 'win'),
        dateFilter
      ))
      .groupBy(lionGameHistory.userId)
      .orderBy(desc(sum(lionGameHistory.rewardChips)))
      .limit(limit);
      
      // Get user details for each entry
      const enrichedLeaderboard = await Promise.all(
        leaderboard.map(async (entry) => {
          // Here you would fetch user details from your database
          // For now, we'll return a simplified version
          return {
            userId: entry.userId,
            // username: Get from your user system
            totalWins: Number(entry.totalWins),
            gamesPlayed: Number(entry.gamesPlayed),
            highestMultiplier: Number(entry.highestMultiplier)
          };
        })
      );
      
      return enrichedLeaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}

export const lionGazelleService = new LionGazelleGameService();
export default lionGazelleService;