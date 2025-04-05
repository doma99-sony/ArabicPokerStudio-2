import { db } from "../db";
import { v4 as uuidv4 } from 'uuid';
import { lionCrashGames, lionCrashBets, lionGameUserStats, insertLionCrashGameSchema, insertLionCrashBetSchema } from "../../shared/schema";
import { storage } from "../storage";
import { eq, and, desc, gte, lt, sql, count, avg, max, sum } from "drizzle-orm";
import { createHash } from "crypto";
import { virtualPlayerManager } from "../virtual-players";

// تعريف واجهة حالة اللعبة
interface GameState {
  gameId: string;
  status: 'waiting' | 'running' | 'ended';
  startTime?: number;
  endTime?: number;
  crashPoint: number;
  currentMultiplier: number;
  players: GamePlayer[];
  countdown: number;
}

// تعريف واجهة لاعب في اللعبة
interface GamePlayer {
  userId: number;
  username: string;
  avatar?: string | null;
  betAmount: number;
  cashoutMultiplier: number | null;
  profit: number;
  status: 'betting' | 'playing' | 'cashed_out' | 'busted';
}

// تعريف واجهة رهان في اللعبة
interface GameBet {
  userId: number;
  betAmount: number;
  autoCashoutAt?: number;
}

// تعريف واجهة سحب الرهان
interface GameCashout {
  userId: number;
  multiplier: number;
  profit: number;
}

// تعريف واجهة نتيجة اللعبة
interface GameResult {
  gameId: string;
  crashPoint: number;
  duration: number;
  players: GamePlayer[];
  totalBets: number;
  totalProfits: number;
  timestamp: number;
}

// تعريف واجهة إحصائيات اللاعب
interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  bestMultiplier: number;
  biggestWin: number;
  totalWagered: number;
  totalProfit: number;
  averageMultiplier: number;
}

/**
 * خدمة لعبة الأسد من نوع "crash"
 * تقوم بإدارة اللعبة، الرهانات، والنتائج
 */
class LionCrashGameService {
  private activeGames: Map<string, GameState> = new Map();
  private gameIntervals: Map<string, NodeJS.Timeout> = new Map();
  private waitingQueues: Map<string, GamePlayer[]> = new Map();
  private readonly COUNTDOWN_TIME = 5; // ثوانٍ للانتظار قبل بدء جولة جديدة (تم تقليله من 10 لتسريع اللعب)
  private readonly GROWTH_FACTOR = 0.00006; // معامل نمو المضاعف
  private readonly MIN_MULTIPLIER = 1.0; // الحد الأدنى للمضاعف
  private readonly MAX_MULTIPLIER = 100.0; // الحد الأقصى للمضاعف
  private readonly UPDATE_INTERVAL = 100; // تحديث حالة اللعبة كل 100 مللي ثانية
  private readonly DEFAULT_HISTORY_SIZE = 50; // حجم التاريخ الافتراضي للعبة
  
  // بذور التشفير للتحقق من نزاهة اللعبة
  private serverSeed: string = this.generateRandomString(32);
  private nextServerSeed: string = this.generateRandomString(32);
  private clientSeed: string = this.generateRandomString(16);
  
  // متغير لتتبع ما إذا كانت هناك لعبة قيد التشغيل
  private isCreatingGame: boolean = false;
  
  constructor() {
    // بدء اللعبة الأولى عند تهيئة الخدمة
    this.createGame().catch(err => console.error('فشل إنشاء اللعبة الأولى:', err));
    
    // إعداد عملية دورية للتأكد من وجود لعبة نشطة دائمًا
    setInterval(() => {
      if (this.activeGames.size === 0 && !this.isCreatingGame) {
        this.createGame().catch(err => console.error('فشل إنشاء لعبة جديدة في المراقبة الدورية:', err));
      }
    }, 5000);
  }
  
  /**
   * توليد سلسلة عشوائية بطول معين
   */
  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  }
  
  /**
   * إنشاء جلسة لعبة جديدة
   */
  async createGame(): Promise<string> {
    try {
      this.isCreatingGame = true;
      
      // توليد معرف فريد للعبة
      const gameId = uuidv4();
      
      // إنشاء حالة لعبة جديدة
      const crashPoint = this.generateCrashPoint();
      
      console.log(`إنشاء لعبة جديدة (${gameId}) بنقطة انهيار: ${crashPoint}`);
      
      const gameState: GameState = {
        gameId,
        status: 'waiting',
        crashPoint,
        currentMultiplier: this.MIN_MULTIPLIER,
        players: [],
        countdown: this.COUNTDOWN_TIME
      };
      
      // حفظ اللعبة في قاعدة البيانات
      try {
        await db.insert(lionCrashGames).values({
          gameId,
          crashPoint,
          serverSeed: this.serverSeed,
          clientSeed: this.clientSeed,
          status: 'waiting',
          createdAt: new Date()
        });
      } catch (error) {
        console.error('خطأ في حفظ بيانات اللعبة:', error);
      }
      
      // تخزين حالة اللعبة
      this.activeGames.set(gameId, gameState);
      
      // بدء العد التنازلي
      this.startCountdown(gameId);
      
      this.isCreatingGame = false;
      return gameId;
    } catch (error) {
      this.isCreatingGame = false;
      console.error('خطأ في إنشاء اللعبة:', error);
      throw error;
    }
  }
  
  /**
   * توليد نقطة انهيار باستخدام خوارزمية عادلة يمكن التحقق منها
   * هذه نسخة مبسطة، في الإنتاج يجب استخدام HMAC-SHA256 أو مشابه
   */
  private generateCrashPoint(): number {
    try {
      // استخدام بذرة الخادم وبذرة العميل لتوليد هاش
      const hash = createHash('sha256')
        .update(`${this.serverSeed}:${this.clientSeed}`)
        .digest('hex');
      
      // تحويل أول 8 أرقام من الهاش إلى رقم بين 0 و 1
      const seed = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
      
      // استخدام خوارزمية تحويل لإنتاج توزيع مناسب
      // هذا هو الصيغة الأساسية لخوارزمية Crash المستخدمة في العديد من الألعاب المماثلة
      // 0.99 / (1 - seed) وليس 1 / (1 - seed) لتجنب التضخم المفرط
      let result = 0.99 / (1 - seed);
      
      // تقريب النتيجة إلى رقمين عشريين
      result = Math.floor(result * 100) / 100;
      
      // تأكد من أن نقطة الانهيار ليست منخفضة جدًا
      if (result < 1.01) {
        result = 1.01;
      }
      
      return result;
    } catch (error) {
      console.error('خطأ في توليد نقطة الانهيار:', error);
      // في حالة حدوث خطأ، استخدم قيمة افتراضية عشوائية
      return 1.01 + Math.random() * 5;
    }
  }
  
  /**
   * بدء مؤقت العد التنازلي للعبة
   */
  private startCountdown(gameId: string): void {
    console.log(`بدء العد التنازلي للعبة ${gameId}`);
    
    const countdownInterval = setInterval(() => {
      const game = this.activeGames.get(gameId);
      if (!game) {
        clearInterval(countdownInterval);
        return;
      }
      
      // تحديث العد التنازلي
      game.countdown -= 1;
      
      // إذا انتهى العد التنازلي، ابدأ اللعبة
      if (game.countdown <= 0) {
        clearInterval(countdownInterval);
        this.startGame(gameId);
      }
    }, 1000);
  }
  
  /**
   * بدء اللعبة بعد انتهاء العد التنازلي
   */
  private startGame(gameId: string): void {
    console.log(`بدء اللعبة ${gameId}`);
    
    const game = this.activeGames.get(gameId);
    if (!game) return;
    
    // تغيير حالة اللعبة إلى "قيد التشغيل"
    game.status = 'running';
    game.startTime = Date.now();
    
    // تحديث حالة اللاعبين
    game.players.forEach(player => {
      if (player.status === 'betting') {
        player.status = 'playing';
      }
    });
    
    // تحديث حالة اللعبة في قاعدة البيانات
    try {
      db.update(lionCrashGames)
        .set({
          status: 'running',
          startedAt: new Date()
        })
        .where(eq(lionCrashGames.gameId, gameId))
        .execute();
    } catch (error) {
      console.error('خطأ في تحديث حالة اللعبة في قاعدة البيانات:', error);
    }
    
    // بدء مؤقت لتحديث المضاعف
    const updateInterval = setInterval(() => {
      const updatedGame = this.activeGames.get(gameId);
      if (!updatedGame || updatedGame.status !== 'running') {
        clearInterval(updateInterval);
        return;
      }
      
      // حساب الوقت المنقضي بالثواني
      const elapsedTime = (Date.now() - (updatedGame.startTime || 0)) / 1000;
      
      // حساب المضاعف الحالي باستخدام صيغة النمو الأسي
      // multiplier = e^(GROWTH_FACTOR * elapsedTime)
      const newMultiplier = Math.exp(this.GROWTH_FACTOR * elapsedTime * 1000);
      
      // تحديث المضاعف الحالي
      updatedGame.currentMultiplier = Math.min(newMultiplier, this.MAX_MULTIPLIER);
      
      // التحقق من حالات السحب التلقائي
      updatedGame.players.forEach(player => {
        if (player.status === 'playing') {
          // التحقق مما إذا كان اللاعب لديه إعداد للسحب التلقائي
          const playerBet = db.select()
            .from(lionCrashBets)
            .where(
              and(
                eq(lionCrashBets.gameId, gameId),
                eq(lionCrashBets.userId, player.userId)
              )
            )
            .get();
          
          if (playerBet && playerBet.autoCashoutAt && updatedGame.currentMultiplier >= playerBet.autoCashoutAt) {
            this.processAutoCashout(gameId, player.userId);
          }
        }
      });
      
      // إذا وصل المضاعف إلى نقطة الانهيار، قم بإنهاء اللعبة
      if (updatedGame.currentMultiplier >= updatedGame.crashPoint) {
        clearInterval(updateInterval);
        this.endGame(gameId);
      }
    }, this.UPDATE_INTERVAL);
    
    // تخزين مرجع المؤقت للتنظيف لاحقًا
    this.gameIntervals.set(gameId, updateInterval);
  }
  
  /**
   * معالجة السحب التلقائي للاعبين
   */
  private processAutoCashout(gameId: string, userId: number): void {
    const game = this.activeGames.get(gameId);
    if (!game || game.status !== 'running') return;
    
    const playerIndex = game.players.findIndex(p => p.userId === userId && p.status === 'playing');
    if (playerIndex === -1) return;
    
    const player = game.players[playerIndex];
    
    // حساب الربح
    const multiplier = game.currentMultiplier;
    // الربح الإجمالي هو مبلغ الرهان × المضاعف (مثال: 1000 × 3 = 3000)
    const totalWinAmount = Math.floor(player.betAmount * multiplier);
    // الربح الصافي هو الربح الإجمالي - مبلغ الرهان الأصلي (3000 - 1000 = 2000)
    const profit = totalWinAmount - player.betAmount;
    
    // تحديث حالة اللاعب
    game.players[playerIndex].status = 'cashed_out';
    game.players[playerIndex].cashoutMultiplier = multiplier;
    game.players[playerIndex].profit = profit;
    
    // تحديث رصيد اللاعب (نرجع المبلغ الأصلي + الربح)
    this.updateUserChips(userId, totalWinAmount);
    
    // تحديث الرهان في قاعدة البيانات
    try {
      db.update(lionCrashBets)
        .set({
          cashoutMultiplier: multiplier,
          profit: profit,
          status: 'cashed_out',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(lionCrashBets.gameId, gameId),
            eq(lionCrashBets.userId, userId)
          )
        )
        .execute();
    } catch (error) {
      console.error('خطأ في تحديث رهان اللاعب في قاعدة البيانات:', error);
    }
    
    console.log(`سحب تلقائي: اللاعب ${userId} سحب عند ${multiplier}x مع رهان ${player.betAmount} وربح إجمالي ${totalWinAmount}`);
  }
  
  /**
   * إنهاء اللعبة عند الوصول إلى نقطة الانهيار
   */
  private async endGame(gameId: string): Promise<void> {
    console.log(`إنهاء اللعبة ${gameId}`);
    
    const game = this.activeGames.get(gameId);
    if (!game) return;
    
    // وضع وقت الانتهاء
    game.endTime = Date.now();
    
    // تغيير حالة اللعبة إلى "منتهية"
    game.status = 'ended';
    
    // تحديث حالة اللاعبين الذين لم يقوموا بالسحب
    game.players.forEach((player, index) => {
      if (player.status === 'playing') {
        game.players[index].status = 'busted';
        game.players[index].profit = -player.betAmount;
        
        // تحديث الرهان في قاعدة البيانات
        try {
          db.update(lionCrashBets)
            .set({
              status: 'busted',
              profit: -player.betAmount,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(lionCrashBets.gameId, gameId),
                eq(lionCrashBets.userId, player.userId)
              )
            )
            .execute();
        } catch (error) {
          console.error('خطأ في تحديث حالة الرهان للاعبين الخاسرين:', error);
        }
      }
    });
    
    // تحديث حالة اللعبة في قاعدة البيانات
    try {
      db.update(lionCrashGames)
        .set({
          status: 'ended',
          endedAt: new Date()
        })
        .where(eq(lionCrashGames.gameId, gameId))
        .execute();
    } catch (error) {
      console.error('خطأ في تحديث حالة اللعبة في قاعدة البيانات:', error);
    }
    
    // حفظ نتيجة اللعبة
    await this.saveGameResult(game);
    
    // إنشاء لعبة جديدة بعد فترة قصيرة
    setTimeout(() => {
      // تنظيف اللعبة الحالية
      this.activeGames.delete(gameId);
      
      // إنشاء لعبة جديدة
      this.createGame().catch(err => console.error('فشل إنشاء لعبة جديدة بعد انهيار اللعبة السابقة:', err));
    }, 3000);
    
    // استبدال بذور التحقق للعبة القادمة
    this.serverSeed = this.nextServerSeed;
    this.nextServerSeed = this.generateRandomString(32);
    this.clientSeed = this.generateRandomString(16);
  }
  
  /**
   * حفظ نتيجة اللعبة في قاعدة البيانات
   */
  private async saveGameResult(game: GameState): Promise<void> {
    try {
      // حساب إجمالي الرهانات والأرباح
      let totalBets = 0;
      let totalProfits = 0;
      
      game.players.forEach(player => {
        totalBets += player.betAmount;
        totalProfits += player.profit;
      });
      
      // حساب مدة اللعبة
      const duration = ((game.endTime || 0) - (game.startTime || 0)) / 1000;
      
      // تحديث الإحصائيات للاعبين
      for (const player of game.players) {
        await this.updateUserStats(player.userId, {
          gameId: game.gameId,
          betAmount: player.betAmount,
          cashoutMultiplier: player.cashoutMultiplier,
          profit: player.profit,
          result: player.status === 'cashed_out' ? 'win' : 'loss'
        });
      }
      
      console.log(`تم حفظ نتيجة اللعبة ${game.gameId} - المضاعف: ${game.crashPoint}x، المدة: ${duration}s`);
    } catch (error) {
      console.error('خطأ في حفظ نتيجة اللعبة:', error);
    }
  }
  
  /**
   * تحديث إحصائيات المستخدم
   */
  private async updateUserStats(userId: number, stats: { 
    gameId: string; 
    betAmount: number; 
    cashoutMultiplier: number | null; 
    profit: number; 
    result: 'win' | 'loss'; 
  }): Promise<void> {
    try {
      // التحقق من وجود إحصائيات للمستخدم
      const existingStats = db.select()
        .from(lionGameUserStats)
        .where(eq(lionGameUserStats.userId, userId))
        .get();
      
      if (existingStats) {
        // تحديث الإحصائيات الحالية
        await db.update(lionGameUserStats)
          .set({
            totalGames: existingStats.totalGames + 1,
            wins: stats.result === 'win' ? existingStats.wins + 1 : existingStats.wins,
            losses: stats.result === 'loss' ? existingStats.losses + 1 : existingStats.losses,
            bestMultiplier: stats.cashoutMultiplier && stats.cashoutMultiplier > existingStats.bestMultiplier 
              ? stats.cashoutMultiplier 
              : existingStats.bestMultiplier,
            biggestWin: stats.profit > existingStats.biggestWin ? stats.profit : existingStats.biggestWin,
            totalWagered: existingStats.totalWagered + stats.betAmount,
            totalProfit: existingStats.totalProfit + stats.profit,
            updatedAt: new Date()
          })
          .where(eq(lionGameUserStats.userId, userId))
          .execute();
      } else {
        // إنشاء إحصائيات جديدة
        await db.insert(lionGameUserStats)
          .values({
            userId: userId,
            totalGames: 1,
            wins: stats.result === 'win' ? 1 : 0,
            losses: stats.result === 'loss' ? 1 : 0,
            bestMultiplier: stats.cashoutMultiplier || 0,
            biggestWin: stats.profit > 0 ? stats.profit : 0,
            totalWagered: stats.betAmount,
            totalProfit: stats.profit,
            gameMode: 'crash',
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .execute();
      }
    } catch (error) {
      console.error('خطأ في تحديث إحصائيات المستخدم:', error);
    }
  }
  
  /**
   * تحديث رصيد اللاعب
   */
  private async updateUserChips(userId: number, amount: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserChips(userId, user.chips + amount);
      }
    } catch (error) {
      console.error('خطأ في تحديث رصيد اللاعب:', error);
    }
  }
  
  /**
   * وضع رهان في لعبة نشطة
   */
  async placeBet(gameId: string, userId: number, username: string, avatar: string | null, betAmount: number, autoCashoutAt?: number): Promise<{ success: boolean; message?: string }> {
    try {
      // التحقق من وجود اللعبة
      const game = this.activeGames.get(gameId);
      if (!game) {
        return { success: false, message: "اللعبة غير موجودة" };
      }
      
      // التحقق من حالة اللعبة
      if (game.status !== 'waiting') {
        return { success: false, message: "اللعبة قيد التشغيل بالفعل، لا يمكن وضع رهان" };
      }
      
      // التحقق من مبلغ الرهان
      if (betAmount <= 0) {
        return { success: false, message: "يجب أن يكون مبلغ الرهان أكبر من صفر" };
      }
      
      // التحقق مما إذا كان اللاعب قد وضع رهانًا بالفعل
      const existingPlayerIndex = game.players.findIndex(p => p.userId === userId);
      if (existingPlayerIndex !== -1) {
        return { success: false, message: "قمت بوضع رهان بالفعل في هذه اللعبة" };
      }
      
      // التحقق من رصيد اللاعب
      const user = await storage.getUser(userId);
      if (!user) {
        return { success: false, message: "المستخدم غير موجود" };
      }
      
      if (user.chips < betAmount) {
        return { success: false, message: "رصيد غير كافٍ" };
      }
      
      // خصم المبلغ من رصيد اللاعب
      await storage.updateUserChips(userId, user.chips - betAmount);
      
      // إنشاء لاعب جديد
      const newPlayer: GamePlayer = {
        userId,
        username,
        avatar,
        betAmount,
        cashoutMultiplier: null,
        profit: 0,
        status: 'betting'
      };
      
      // إضافة اللاعب إلى اللعبة
      game.players.push(newPlayer);
      
      // حفظ الرهان في قاعدة البيانات
      try {
        await db.insert(lionCrashBets)
          .values({
            gameId,
            userId,
            betAmount,
            autoCashoutAt: autoCashoutAt,
            status: 'betting',
            createdAt: new Date()
          })
          .execute();
      } catch (error) {
        console.error('خطأ في حفظ الرهان في قاعدة البيانات:', error);
      }
      
      console.log(`تم وضع رهان: المستخدم ${userId} وضع رهان بقيمة ${betAmount} في اللعبة ${gameId}`);
      
      return { success: true };
    } catch (error) {
      console.error('خطأ في وضع الرهان:', error);
      return { success: false, message: "حدث خطأ أثناء محاولة وضع الرهان" };
    }
  }
  
  /**
   * سحب الرهان من لعبة نشطة
   */
  async cashOut(gameId: string, userId: number): Promise<{ 
    success: boolean; 
    message?: string; 
    multiplier?: number; 
    profit?: number; 
  }> {
    try {
      // التحقق من وجود اللعبة
      const game = this.activeGames.get(gameId);
      if (!game) {
        return { success: false, message: "اللعبة غير موجودة" };
      }
      
      // التحقق من حالة اللعبة
      if (game.status !== 'running') {
        return { success: false, message: "اللعبة ليست قيد التشغيل" };
      }
      
      // التحقق من وجود اللاعب في اللعبة
      const playerIndex = game.players.findIndex(p => p.userId === userId);
      if (playerIndex === -1) {
        return { success: false, message: "اللاعب ليس جزءًا من هذه اللعبة" };
      }
      
      const player = game.players[playerIndex];
      
      // التحقق من حالة اللاعب
      if (player.status !== 'playing') {
        return { success: false, message: "لا يمكن السحب في هذه الحالة" };
      }
      
      // حساب الربح
      const multiplier = game.currentMultiplier;
      // الربح الإجمالي هو مبلغ الرهان × المضاعف (مثال: 1000 × 3 = 3000)
      const totalWinAmount = Math.floor(player.betAmount * multiplier);
      // الربح الصافي هو الربح الإجمالي - مبلغ الرهان الأصلي (3000 - 1000 = 2000)
      const profit = totalWinAmount - player.betAmount;
      
      // تحديث حالة اللاعب
      game.players[playerIndex].status = 'cashed_out';
      game.players[playerIndex].cashoutMultiplier = multiplier;
      game.players[playerIndex].profit = profit;
      
      // إضافة المبلغ الإجمالي (الرهان الأصلي + الربح) إلى رصيد اللاعب
      await this.updateUserChips(userId, totalWinAmount);
      
      // تحديث الرهان في قاعدة البيانات
      try {
        await db.update(lionCrashBets)
          .set({
            cashoutMultiplier: multiplier,
            profit: profit,
            status: 'cashed_out',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(lionCrashBets.gameId, gameId),
              eq(lionCrashBets.userId, userId)
            )
          )
          .execute();
      } catch (error) {
        console.error('خطأ في تحديث الرهان في قاعدة البيانات:', error);
      }
      
      console.log(`تم السحب: المستخدم ${userId} سحب عند ${multiplier}x مع رهان ${player.betAmount} وربح إجمالي ${totalWinAmount}`);
      
      return { 
        success: true,
        multiplier,
        profit
      };
    } catch (error) {
      console.error('خطأ في سحب الرهان:', error);
      return { success: false, message: "حدث خطأ أثناء محاولة سحب الرهان" };
    }
  }
  
  /**
   * الحصول على لعبة محددة
   */
  getGame(gameId: string): GameState | undefined {
    return this.activeGames.get(gameId);
  }
  
  /**
   * الحصول على جميع الألعاب النشطة
   */
  getAllGames(): GameState[] {
    return Array.from(this.activeGames.values());
  }
  
  /**
   * الحصول على اللعبة النشطة الحالية
   */
  getCurrentGame(): GameState | undefined {
    // عادةً ما تكون هناك لعبة واحدة نشطة فقط، لذا نأخذ آخر لعبة
    for (const game of this.activeGames.values()) {
      return game;
    }
    return undefined;
  }
  
  /**
   * الحصول على تاريخ الألعاب الأخيرة
   */
  async getRecentGames(limit = 10): Promise<any[]> {
    try {
      const recentGames = await db.select({
        gameId: lionCrashGames.gameId,
        crashPoint: lionCrashGames.crashPoint,
        startedAt: lionCrashGames.startedAt,
        endedAt: lionCrashGames.endedAt,
        status: lionCrashGames.status
      })
      .from(lionCrashGames)
      .where(eq(lionCrashGames.status, 'ended'))
      .orderBy(desc(lionCrashGames.createdAt))
      .limit(limit);
      
      // تحويل النتائج إلى التنسيق المطلوب
      const formattedGames = recentGames.map(game => {
        const startTime = game.startedAt ? new Date(game.startedAt).toISOString() : '';
        const endTime = game.endedAt ? new Date(game.endedAt).toISOString() : '';
        
        // حساب مدة اللعبة بالثواني
        let duration = 0;
        if (game.startedAt && game.endedAt) {
          duration = (new Date(game.endedAt).getTime() - new Date(game.startedAt).getTime()) / 1000;
        }
        
        return {
          gameId: game.gameId,
          crashPoint: game.crashPoint,
          startTime,
          endTime,
          duration: Number(duration.toFixed(2)),
          totalBets: 0, // هذه ستحتاج إلى استعلام إضافي لتجميع البيانات
          totalProfits: 0 // هذه ستحتاج إلى استعلام إضافي لتجميع البيانات
        };
      });
      
      return formattedGames;
    } catch (error) {
      console.error('خطأ في الحصول على تاريخ الألعاب الأخيرة:', error);
      return [];
    }
  }
  
  /**
   * الحصول على إحصائيات المستخدم للعبة
   */
  async getUserStats(userId: number): Promise<UserStats | null> {
    try {
      // التحقق من وجود إحصائيات للمستخدم
      const stats = await db.select()
        .from(lionGameUserStats)
        .where(
          and(
            eq(lionGameUserStats.userId, userId),
            eq(lionGameUserStats.gameMode, 'crash')
          )
        )
        .get();
      
      if (!stats) {
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
      
      // حساب المتوسط
      const avgMultiplier = await this.calculateAverageMultiplier(userId);
      
      return {
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        bestMultiplier: stats.bestMultiplier,
        biggestWin: stats.biggestWin,
        totalWagered: stats.totalWagered,
        totalProfit: stats.totalProfit,
        averageMultiplier: avgMultiplier
      };
    } catch (error) {
      console.error('خطأ في الحصول على إحصائيات المستخدم:', error);
      return null;
    }
  }
  
  /**
   * حساب متوسط المضاعف عند السحب
   */
  private async calculateAverageMultiplier(userId: number): Promise<number> {
    try {
      const result = await db.select({
        avgMultiplier: avg(lionCrashBets.cashoutMultiplier)
      })
      .from(lionCrashBets)
      .where(
        and(
          eq(lionCrashBets.userId, userId),
          eq(lionCrashBets.status, 'cashed_out')
        )
      )
      .get();
      
      return result?.avgMultiplier || 0;
    } catch (error) {
      console.error('خطأ في حساب متوسط المضاعف:', error);
      return 0;
    }
  }
  
  /**
   * الحصول على لوحة المتصدرين للعبة
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'all_time', limit = 10): Promise<any[]> {
    try {
      let dateFilter;
      const now = new Date();
      
      // تعيين فلتر التاريخ بناءً على الفترة
      if (period === 'daily') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        dateFilter = gte(lionCrashBets.createdAt, yesterday);
      } else if (period === 'weekly') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        dateFilter = gte(lionCrashBets.createdAt, lastWeek);
      } else if (period === 'monthly') {
        const lastMonth = new Date(now);
        lastMonth.setMonth(now.getMonth() - 1);
        dateFilter = gte(lionCrashBets.createdAt, lastMonth);
      } else {
        // all_time - لا حاجة لفلتر
        dateFilter = sql`1=1`; // دائمًا صحيح
      }
      
      // استعلام مجمع للحصول على لوحة المتصدرين
      const leaderboard = await db.select({
        userId: lionCrashBets.userId,
        totalWins: count(lionCrashBets.id).as('totalWins'),
        totalProfit: sum(lionCrashBets.profit).as('totalProfit'),
        highestMultiplier: max(lionCrashBets.cashoutMultiplier).as('highestMultiplier'),
        gamesPlayed: count(lionCrashBets.id).as('gamesPlayed')
      })
      .from(lionCrashBets)
      .where(dateFilter)
      .groupBy(lionCrashBets.userId)
      .orderBy(desc(sql`totalProfit`))
      .limit(limit);
      
      // الحصول على بيانات المستخدمين لإضافتها إلى النتائج
      const leaderboardWithUserInfo = await Promise.all(
        leaderboard.map(async (entry) => {
          const user = await storage.getUser(entry.userId);
          return {
            ...entry,
            period: period,
            username: user?.username || `لاعب_${entry.userId}`,
            avatar: user?.avatar || null
          };
        })
      );
      
      return leaderboardWithUserInfo;
    } catch (error) {
      console.error('خطأ في الحصول على لوحة المتصدرين:', error);
      return [];
    }
  }
  
  /**
   * الحصول على بيانات التحقق من نزاهة اللعبة
   */
  async getGameVerification(gameId: string): Promise<any> {
    try {
      const game = await db.select({
        gameId: lionCrashGames.gameId,
        crashPoint: lionCrashGames.crashPoint,
        serverSeed: lionCrashGames.serverSeed,
        clientSeed: lionCrashGames.clientSeed,
        gameHash: lionCrashGames.gameHash,
      })
      .from(lionCrashGames)
      .where(eq(lionCrashGames.gameId, gameId))
      .get();
      
      if (!game) {
        return {
          success: false,
          message: "اللعبة غير موجودة"
        };
      }
      
      // لا نكشف بذرة الخادم للألعاب الحالية، فقط للألعاب المنتهية
      const currentGame = this.getGame(gameId);
      if (currentGame && currentGame.status !== 'ended') {
        return {
          success: true,
          gameId: game.gameId,
          clientSeed: game.clientSeed,
          nextServerSeedHash: createHash('sha256').update(this.nextServerSeed).digest('hex'),
          message: "بذرة الخادم محجوبة حتى تنتهي اللعبة"
        };
      }
      
      return {
        success: true,
        gameId: game.gameId,
        crashPoint: game.crashPoint,
        serverSeed: game.serverSeed,
        clientSeed: game.clientSeed,
        nextServerSeedHash: createHash('sha256').update(this.serverSeed).digest('hex'),
        computedHash: createHash('sha256').update(`${game.serverSeed}:${game.clientSeed}`).digest('hex')
      };
    } catch (error) {
      console.error('خطأ في الحصول على بيانات التحقق من اللعبة:', error);
      return {
        success: false,
        message: "حدث خطأ أثناء محاولة الحصول على بيانات التحقق"
      };
    }
  }
}

// إنشاء نسخة وحيدة من الخدمة للمشاركة في جميع أنحاء التطبيق
export const lionCrashService = new LionCrashGameService();