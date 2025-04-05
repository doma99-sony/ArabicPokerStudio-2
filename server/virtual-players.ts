/**
 * نظام اللاعبين الوهميين
 * يقوم هذا النظام بإضافة لاعبين وهميين يضعون رهانات تلقائية في اللعبة
 */

import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { eq } from "drizzle-orm";

// أسماء المستخدمين الوهميين
const BOT_NAMES = [
  "أبو فهد",
  "الصقر",
  "فارس القمر",
  "عاشق المغامرة",
  "رحالة",
  "أمير الليل",
  "القناص",
  "شاهين",
  "النمر الأسود",
  "محارب الصحراء",
  "سهم الفجر",
  "عاشق الحظ",
  "أبو العز",
  "فتى الجبل",
  "أبو الخير",
];

// صور رمزية للاعبين الوهميين
const AVATARS = [
  "/assets/avatars/avatar1.png",
  "/assets/avatars/avatar2.png",
  "/assets/avatars/avatar3.png",
  "/assets/avatars/avatar4.png",
  "/assets/avatars/avatar5.png",
];

/**
 * فئة تمثل لاعب وهمي في النظام
 */
class VirtualPlayer {
  id: number;
  username: string;
  avatar: string;
  chips: number;
  betStrategy: "aggressive" | "conservative" | "balanced";
  cashoutPreference: "early" | "late" | "random";
  active: boolean;

  constructor(id: number, username: string, avatar: string, chips: number, betStrategy: "aggressive" | "conservative" | "balanced", cashoutPreference: "early" | "late" | "random") {
    this.id = id;
    this.username = username;
    this.avatar = avatar;
    this.chips = chips;
    this.betStrategy = betStrategy;
    this.cashoutPreference = cashoutPreference;
    this.active = true;
  }

  /**
   * توليد قيمة رهان بناءً على استراتيجية اللاعب
   */
  generateBetAmount(): number {
    const minBet = 10;
    const maxBet = Math.min(this.chips, 1000);
    
    switch (this.betStrategy) {
      case "aggressive":
        // الرهانات الكبيرة، من 100 إلى الحد الأقصى
        return Math.floor(Math.random() * (maxBet - 100 + 1)) + 100;
      case "conservative":
        // الرهانات الصغيرة، من الحد الأدنى إلى 100
        return Math.floor(Math.random() * (100 - minBet + 1)) + minBet;
      case "balanced":
      default:
        // رهانات متوسطة
        return Math.floor(Math.random() * (maxBet - minBet + 1)) + minBet;
    }
  }

  /**
   * توليد قيمة مضاعف السحب التلقائي بناءً على تفضيلات اللاعب
   */
  generateAutoCashoutValue(): number {
    switch (this.cashoutPreference) {
      case "early":
        // يفضل السحب المبكر، من 1.2 إلى 2.0
        return parseFloat((Math.random() * 0.8 + 1.2).toFixed(2));
      case "late":
        // يفضل الانتظار، من 2.0 إلى 5.0
        return parseFloat((Math.random() * 3.0 + 2.0).toFixed(2));
      case "random":
      default:
        // عشوائي تمامًا، من 1.2 إلى 10.0
        return parseFloat((Math.random() * 8.8 + 1.2).toFixed(2));
    }
  }

  /**
   * تحديد ما إذا كان اللاعب سيشارك في هذه الجولة
   */
  willPlayThisRound(): boolean {
    // فرصة 70% للمشاركة
    return Math.random() < 0.7;
  }
}

/**
 * فئة إدارة اللاعبين الوهميين
 */
class VirtualPlayerManager {
  private players: VirtualPlayer[] = [];
  private isInitialized: boolean = false;
  
  constructor() {
    this.initializePlayers();
  }

  /**
   * تهيئة اللاعبين الوهميين
   */
  private async initializePlayers() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    try {
      // التحقق من وجود اللاعبين الوهميين في قاعدة البيانات
      const existingBots = await this.getVirtualPlayersFromDB();
      
      if (existingBots.length === 0) {
        // إنشاء لاعبين وهميين جدد
        await this.createVirtualPlayers();
      } else {
        // استخدام اللاعبين الموجودين
        for (const bot of existingBots) {
          const betStrategy = ["aggressive", "conservative", "balanced"][Math.floor(Math.random() * 3)] as "aggressive" | "conservative" | "balanced";
          const cashoutPreference = ["early", "late", "random"][Math.floor(Math.random() * 3)] as "early" | "late" | "random";
          
          this.players.push(new VirtualPlayer(
            bot.id,
            bot.username,
            bot.avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
            bot.chips,
            betStrategy,
            cashoutPreference
          ));
        }
      }
      
      console.log(`تم تهيئة ${this.players.length} لاعب وهمي`);
    } catch (error) {
      console.error('خطأ في تهيئة اللاعبين الوهميين:', error);
    }
  }

  /**
   * الحصول على اللاعبين الوهميين من قاعدة البيانات
   */
  private async getVirtualPlayersFromDB() {
    try {
      const botUsers = await storage.getUsersByFilter(user => user.username?.startsWith('bot_'));
      return botUsers;
    } catch (error) {
      console.error('خطأ في الحصول على اللاعبين الوهميين من قاعدة البيانات:', error);
      return [];
    }
  }

  /**
   * إنشاء لاعبين وهميين جدد
   */
  private async createVirtualPlayers() {
    try {
      // إنشاء 5 لاعبين وهميين
      for (let i = 0; i < 5; i++) {
        const botUsername = `bot_${uuidv4().substring(0, 8)}`;
        const displayName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
        const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const chips = Math.floor(Math.random() * 9000) + 1000; // 1000-10000 رقاقة
        
        const user = await storage.createUser({
          username: botUsername,
          displayName,
          password: uuidv4(), // كلمة مرور عشوائية
          chips,
          avatar,
          isBot: true,
        });
        
        if (user) {
          const betStrategy = ["aggressive", "conservative", "balanced"][Math.floor(Math.random() * 3)] as "aggressive" | "conservative" | "balanced";
          const cashoutPreference = ["early", "late", "random"][Math.floor(Math.random() * 3)] as "early" | "late" | "random";
          
          this.players.push(new VirtualPlayer(
            user.id,
            displayName,
            avatar,
            chips,
            betStrategy,
            cashoutPreference
          ));
        }
      }
    } catch (error) {
      console.error('خطأ في إنشاء اللاعبين الوهميين:', error);
    }
  }

  /**
   * الحصول على جميع اللاعبين الوهميين
   */
  getAllPlayers(): VirtualPlayer[] {
    return this.players;
  }

  /**
   * الحصول على اللاعبين الوهميين النشطين
   */
  getActivePlayers(): VirtualPlayer[] {
    return this.players.filter(player => player.active);
  }

  /**
   * اختيار لاعبين وهميين عشوائيين للمشاركة في الجولة الحالية
   */
  getRandomPlayersForRound(minPlayers: number = 1, maxPlayers: number = 5): VirtualPlayer[] {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 0) return [];
    
    // تحديد عدد اللاعبين الذين سيشاركون
    const numPlayers = Math.floor(Math.random() * (maxPlayers - minPlayers + 1)) + minPlayers;
    
    // اختيار لاعبين عشوائيين
    const shuffled = [...activePlayers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numPlayers, activePlayers.length))
      .filter(player => player.willPlayThisRound());
  }

  /**
   * وضع رهانات للاعبين الوهميين في جولة بوكر معينة
   */
  async placeBetsForPokerGame(gameId: string, pokerGameService: any): Promise<void> {
    try {
      // اختيار لاعبين عشوائيين للمشاركة
      const playersForRound = this.getRandomPlayersForRound(1, 3);
      
      // انضمام اللاعبين إلى طاولة البوكر
      for (const player of playersForRound) {
        const betAmount = player.generateBetAmount();
        
        // انضمام إلى طاولة البوكر
        await pokerGameService.joinTable(
          gameId,
          player.id,
          player.username,
          player.avatar,
          betAmount
        );
        
        console.log(`اللاعب الوهمي ${player.username} انضم إلى طاولة البوكر برقائق: ${betAmount}`);
      }
      
      console.log(`تم انضمام ${playersForRound.length} لاعب وهمي إلى طاولة البوكر ${gameId}`);
    } catch (error) {
      console.error('خطأ في انضمام اللاعبين الوهميين إلى طاولة البوكر:', error);
    }
  }
}

// إنشاء كائن واحد من مدير اللاعبين الوهميين
export const virtualPlayerManager = new VirtualPlayerManager();