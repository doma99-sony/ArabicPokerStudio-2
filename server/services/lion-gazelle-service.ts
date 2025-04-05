import { eq, and, desc, gt, lt, gte, sql } from "drizzle-orm";
import { db } from "../db";
import {
  users,
  lionGazelleLevels,
  lionGameCharacters,
  lionGamePowerUps,
  lionGameHistory,
  lionGameUserStats,
  userLionGameItems,
  lionGameCollectibles,
  userChipsTransactions,
  LionGameLevel,
  LionGameCharacter,
  LionGamePowerUp,
  LionGameHistory
} from "../../shared/schema";

/**
 * خدمة لعبة الأسد والغزالة
 * تعالج كافة الوظائف المتعلقة باللعبة مثل البيانات، الإحصائيات، المستويات، وتسجيل نتائج اللعب
 */
export class LionGazelleService {
  /**
   * الحصول على جميع مستويات اللعبة
   */
  async getLevels(userId: number): Promise<{levels: LionGameLevel[], unlockedLevels: number[]}> {
    try {
      // الحصول على مستويات اللعبة
      const levels = await db!.select().from(lionGazelleLevels).orderBy(lionGazelleLevels.level);
      
      // الحصول على المستويات المفتوحة للمستخدم
      const userStats = await db!.select({
        unlockedLevels: lionGameUserStats.unlockedLevels
      })
      .from(lionGameUserStats)
      .where(eq(lionGameUserStats.userId, userId))
      .limit(1);
      
      const unlockedLevels = userStats.length > 0 && userStats[0].unlockedLevels 
        ? userStats[0].unlockedLevels 
        : [1]; // المستوى الأول مفتوح افتراضيًا
      
      return {
        levels,
        unlockedLevels
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in getLevels:", error);
      throw new Error("فشل في جلب مستويات اللعبة");
    }
  }
  
  /**
   * الحصول على تفاصيل مستوى معين
   */
  async getLevelDetails(levelId: number): Promise<LionGameLevel> {
    try {
      const level = await db!.select()
        .from(lionGazelleLevels)
        .where(eq(lionGazelleLevels.id, levelId))
        .limit(1);
      
      if (level.length === 0) {
        throw new Error("المستوى غير موجود");
      }
      
      return level[0];
    } catch (error) {
      console.error("[LionGazelleService] Error in getLevelDetails:", error);
      throw new Error("فشل في جلب تفاصيل المستوى");
    }
  }
  
  /**
   * الحصول على الشخصيات المتاحة للمستخدم
   */
  async getUserCharacters(userId: number): Promise<{owned: LionGameCharacter[], available: LionGameCharacter[]}> {
    try {
      // الحصول على معرفات الشخصيات التي يملكها المستخدم
      const userItems = await db!.select({
        itemId: userLionGameItems.itemId
      })
      .from(userLionGameItems)
      .where(
        and(
          eq(userLionGameItems.userId, userId),
          eq(userLionGameItems.itemType, 'character')
        )
      );
      
      const ownedItemIds = userItems.map(item => item.itemId);
      
      // الحصول على الشخصيات التي يملكها المستخدم
      const ownedCharacters = ownedItemIds.length > 0 
        ? await db!.select()
            .from(lionGameCharacters)
            .where(sql`${lionGameCharacters.id} IN (${ownedItemIds.join(',')})`)
        : [];
      
      // إضافة الشخصيات الافتراضية غير المقفلة
      const defaultCharacters = await db!.select()
        .from(lionGameCharacters)
        .where(
          and(
            eq(lionGameCharacters.isDefault, true),
            eq(lionGameCharacters.isLocked, false)
          )
        );
      
      // الحصول على جميع الشخصيات المتاحة للشراء
      const availableCharacters = await db!.select()
        .from(lionGameCharacters)
        .where(
          and(
            eq(lionGameCharacters.isDefault, false),
            eq(lionGameCharacters.isLocked, false),
            sql`${lionGameCharacters.id} NOT IN (${ownedItemIds.length > 0 ? ownedItemIds.join(',') : '0'})`
          )
        );
      
      // دمج الشخصيات الافتراضية مع الشخصيات المملوكة
      const allOwnedCharacters = [...ownedCharacters, ...defaultCharacters];
      
      // إزالة التكرارات باستخدام المعرف الفريد
      const uniqueOwnedCharacters = Array.from(
        new Map(allOwnedCharacters.map(char => [char.id, char])).values()
      );
      
      return {
        owned: uniqueOwnedCharacters,
        available: availableCharacters
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in getUserCharacters:", error);
      throw new Error("فشل في جلب شخصيات المستخدم");
    }
  }
  
  /**
   * الحصول على تحسينات القوة المتاحة للمستخدم
   */
  async getUserPowerUps(userId: number): Promise<{owned: LionGamePowerUp[], available: LionGamePowerUp[]}> {
    try {
      // الحصول على معرفات تحسينات القوة التي يملكها المستخدم
      const userItems = await db!.select({
        itemId: userLionGameItems.itemId,
        quantity: userLionGameItems.quantity
      })
      .from(userLionGameItems)
      .where(
        and(
          eq(userLionGameItems.userId, userId),
          eq(userLionGameItems.itemType, 'power_up')
        )
      );
      
      const ownedItemIds = userItems.map(item => item.itemId);
      
      // الحصول على تحسينات القوة التي يملكها المستخدم
      const ownedPowerUps = ownedItemIds.length > 0 
        ? await db!.select()
            .from(lionGamePowerUps)
            .where(sql`${lionGamePowerUps.id} IN (${ownedItemIds.join(',')})`)
        : [];
      
      // إضافة معلومات الكمية لكل تحسين
      const ownedPowerUpsWithQuantity = ownedPowerUps.map(powerUp => {
        const userItem = userItems.find(item => item.itemId === powerUp.id);
        return {
          ...powerUp,
          quantity: userItem ? userItem.quantity : 0
        };
      });
      
      // الحصول على جميع تحسينات القوة المتاحة للشراء
      const availablePowerUps = await db!.select()
        .from(lionGamePowerUps)
        .where(
          and(
            eq(lionGamePowerUps.availableInShop, true)
          )
        );
      
      return {
        owned: ownedPowerUpsWithQuantity as any[], // Type assertion here because we're adding a quantity field
        available: availablePowerUps
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in getUserPowerUps:", error);
      throw new Error("فشل في جلب تحسينات القوة");
    }
  }
  
  /**
   * شراء شخصية جديدة
   */
  async purchaseCharacter(userId: number, characterId: number): Promise<{success: boolean, message: string}> {
    try {
      // التحقق من وجود الشخصية
      const character = await db!.select()
        .from(lionGameCharacters)
        .where(
          and(
            eq(lionGameCharacters.id, characterId),
            eq(lionGameCharacters.isLocked, false)
          )
        )
        .limit(1);
      
      if (character.length === 0) {
        return { success: false, message: "الشخصية غير متوفرة للشراء" };
      }
      
      // التحقق مما إذا كان المستخدم يملك هذه الشخصية بالفعل
      const existingItem = await db!.select()
        .from(userLionGameItems)
        .where(
          and(
            eq(userLionGameItems.userId, userId),
            eq(userLionGameItems.itemType, 'character'),
            eq(userLionGameItems.itemId, characterId)
          )
        )
        .limit(1);
      
      if (existingItem.length > 0) {
        return { success: false, message: "أنت تملك هذه الشخصية بالفعل" };
      }
      
      // التحقق من رصيد المستخدم
      const user = await db!.select({
        chips: users.chips
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
      if (user.length === 0) {
        return { success: false, message: "المستخدم غير موجود" };
      }
      
      const price = character[0].price || 0;
      
      if (user[0].chips < price) {
        return { success: false, message: "رصيد غير كافي لشراء هذه الشخصية" };
      }
      
      // بدء المعاملة لضمان تنفيذ جميع العمليات أو إلغائها جميعًا
      await db!.transaction(async (tx) => {
        // خصم الرصيد من المستخدم
        await tx.update(users)
          .set({ chips: user[0].chips - price })
          .where(eq(users.id, userId));
        
        // إضافة الشخصية إلى مقتنيات المستخدم
        await tx.insert(userLionGameItems)
          .values({
            userId,
            itemType: 'character',
            itemId: characterId,
            quantity: 1,
            isEquipped: false
          });
        
        // تسجيل المعاملة
        await tx.insert(userChipsTransactions)
          .values({
            userId,
            amount: -price,
            type: 'purchase',
            description: `شراء شخصية: ${character[0].name}`,
            createdAt: new Date()
          });
      });
      
      return { success: true, message: "تم شراء الشخصية بنجاح" };
    } catch (error) {
      console.error("[LionGazelleService] Error in purchaseCharacter:", error);
      throw new Error("فشل في عملية شراء الشخصية");
    }
  }
  
  /**
   * شراء تحسين قوة
   */
  async purchasePowerUp(userId: number, powerUpId: number, quantity: number = 1): Promise<{success: boolean, message: string}> {
    try {
      if (quantity <= 0) {
        return { success: false, message: "الكمية يجب أن تكون أكبر من الصفر" };
      }
      
      // التحقق من وجود تحسين القوة
      const powerUp = await db!.select()
        .from(lionGamePowerUps)
        .where(
          and(
            eq(lionGamePowerUps.id, powerUpId),
            eq(lionGamePowerUps.availableInShop, true)
          )
        )
        .limit(1);
      
      if (powerUp.length === 0) {
        return { success: false, message: "تحسين القوة غير متوفر للشراء" };
      }
      
      // التحقق من رصيد المستخدم
      const user = await db!.select({
        chips: users.chips
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
      if (user.length === 0) {
        return { success: false, message: "المستخدم غير موجود" };
      }
      
      const price = powerUp[0].price || 0;
      const totalPrice = price * quantity;
      
      if (user[0].chips < totalPrice) {
        return { success: false, message: "رصيد غير كافي لشراء هذه الكمية" };
      }
      
      // بدء المعاملة لضمان تنفيذ جميع العمليات أو إلغائها جميعًا
      await db!.transaction(async (tx) => {
        // خصم الرصيد من المستخدم
        await tx.update(users)
          .set({ chips: user[0].chips - totalPrice })
          .where(eq(users.id, userId));
        
        // التحقق مما إذا كان المستخدم يملك هذا التحسين بالفعل
        const existingItem = await tx.select()
          .from(userLionGameItems)
          .where(
            and(
              eq(userLionGameItems.userId, userId),
              eq(userLionGameItems.itemType, 'power_up'),
              eq(userLionGameItems.itemId, powerUpId)
            )
          )
          .limit(1);
        
        if (existingItem.length > 0) {
          // زيادة الكمية
          await tx.update(userLionGameItems)
            .set({ 
              quantity: existingItem[0].quantity + quantity 
            })
            .where(
              and(
                eq(userLionGameItems.userId, userId),
                eq(userLionGameItems.itemType, 'power_up'),
                eq(userLionGameItems.itemId, powerUpId)
              )
            );
        } else {
          // إضافة التحسين إلى مقتنيات المستخدم
          await tx.insert(userLionGameItems)
            .values({
              userId,
              itemType: 'power_up',
              itemId: powerUpId,
              quantity,
              isEquipped: false
            });
        }
        
        // تسجيل المعاملة
        await tx.insert(userChipsTransactions)
          .values({
            userId,
            amount: -totalPrice,
            type: 'purchase',
            description: `شراء تحسين قوة: ${powerUp[0].name} (${quantity})`,
            createdAt: new Date()
          });
      });
      
      return { success: true, message: "تم شراء تحسين القوة بنجاح" };
    } catch (error) {
      console.error("[LionGazelleService] Error in purchasePowerUp:", error);
      throw new Error("فشل في عملية شراء تحسين القوة");
    }
  }
  
  /**
   * تجهيز شخصية للاستخدام
   */
  async equipCharacter(userId: number, characterId: number): Promise<{success: boolean, message: string}> {
    try {
      // التحقق من امتلاك المستخدم للشخصية
      const userCharacter = await db!.select()
        .from(userLionGameItems)
        .where(
          and(
            eq(userLionGameItems.userId, userId),
            eq(userLionGameItems.itemType, 'character'),
            eq(userLionGameItems.itemId, characterId)
          )
        )
        .limit(1);
      
      // التحقق مما إذا كانت الشخصية افتراضية وغير مقفلة
      if (userCharacter.length === 0) {
        const defaultCharacter = await db!.select()
          .from(lionGameCharacters)
          .where(
            and(
              eq(lionGameCharacters.id, characterId),
              eq(lionGameCharacters.isDefault, true),
              eq(lionGameCharacters.isLocked, false)
            )
          )
          .limit(1);
        
        if (defaultCharacter.length === 0) {
          return { success: false, message: "أنت لا تملك هذه الشخصية" };
        }
      }
      
      // إلغاء تجهيز جميع الشخصيات
      await db!.update(userLionGameItems)
        .set({ isEquipped: false })
        .where(
          and(
            eq(userLionGameItems.userId, userId),
            eq(userLionGameItems.itemType, 'character')
          )
        );
      
      // تجهيز الشخصية المطلوبة
      if (userCharacter.length > 0) {
        await db!.update(userLionGameItems)
          .set({ isEquipped: true })
          .where(
            and(
              eq(userLionGameItems.userId, userId),
              eq(userLionGameItems.itemType, 'character'),
              eq(userLionGameItems.itemId, characterId)
            )
          );
      }
      
      // تحديث إحصائيات المستخدم
      await this.updateUserStats(userId, {
        favoriteCharacter: characterId
      });
      
      return { success: true, message: "تم تجهيز الشخصية بنجاح" };
    } catch (error) {
      console.error("[LionGazelleService] Error in equipCharacter:", error);
      throw new Error("فشل في تجهيز الشخصية");
    }
  }
  
  /**
   * تسجيل نتيجة لعبة
   */
  async recordGameResult(
    userId: number, 
    levelId: number, 
    result: "win" | "loss", 
    gameData: {
      duration: number,
      distance: number,
      coinsCollected: number,
      powerUpsUsed: number,
      obstaclesAvoided: number,
      score: number,
      multiplier: number,
      characterUsed?: number
    }
  ): Promise<{success: boolean, message: string, reward: number}> {
    try {
      // التحقق من وجود المستوى
      const level = await db!.select()
        .from(lionGazelleLevels)
        .where(eq(lionGazelleLevels.id, levelId))
        .limit(1);
      
      if (level.length === 0) {
        return { success: false, message: "المستوى غير موجود", reward: 0 };
      }
      
      // حساب المكافأة بناءً على النتيجة والمضاعف
      const { minReward, maxReward, coinMultiplier } = level[0];
      let reward = 0;
      
      if (result === "win") {
        // حساب المكافأة مع مراعاة مضاعف المستوى ومضاعف اللعبة ومجموع العملات المجمعة
        const baseReward = minReward + (maxReward - minReward) * Math.min(1, gameData.multiplier / 10);
        const levelMultiplierBonus = baseReward * (coinMultiplier - 1);
        const coinsBonus = gameData.coinsCollected * coinMultiplier;
        
        reward = Math.floor(baseReward + levelMultiplierBonus + coinsBonus);
      }
      
      // تسجيل نتيجة اللعبة في التاريخ
      const now = new Date();
      const gameHistory = await db!.insert(lionGameHistory)
        .values({
          userId,
          levelId,
          startTime: new Date(now.getTime() - (gameData.duration * 1000)),
          endTime: now,
          duration: gameData.duration,
          distance: gameData.distance,
          coinsCollected: gameData.coinsCollected,
          powerUpsUsed: gameData.powerUpsUsed,
          obstaclesAvoided: gameData.obstaclesAvoided,
          score: gameData.score,
          multiplier: gameData.multiplier,
          result,
          rewardChips: reward,
          characterUsed: gameData.characterUsed,
          gameData: gameData as any
        })
        .returning();
      
      // تحديث رصيد المستخدم إذا كان هناك مكافأة
      if (reward > 0) {
        await db!.update(users)
          .set({ 
            chips: sql`${users.chips} + ${reward}` 
          })
          .where(eq(users.id, userId));
        
        // تسجيل معاملة الرقائق
        await db!.insert(userChipsTransactions)
          .values({
            userId,
            amount: reward,
            type: 'game_reward',
            description: `مكافأة لعبة الأسد والغزالة - المستوى ${level[0].level}`,
            createdAt: now
          });
      }
      
      // فتح المستوى التالي إذا كان هذا فوز في مستوى أعلى مستوى مفتوح
      if (result === "win") {
        const nextLevelNumber = level[0].level + 1;
        
        // التحقق من وجود المستوى التالي
        const nextLevel = await db!.select()
          .from(lionGazelleLevels)
          .where(eq(lionGazelleLevels.level, nextLevelNumber))
          .limit(1);
        
        if (nextLevel.length > 0) {
          // فتح المستوى التالي
          await db!.update(lionGazelleLevels)
            .set({ isLocked: false })
            .where(eq(lionGazelleLevels.id, nextLevel[0].id));
          
          // تحديث قائمة المستويات المفتوحة للمستخدم
          const userStats = await db!.select({
            id: lionGameUserStats.id,
            unlockedLevels: lionGameUserStats.unlockedLevels
          })
          .from(lionGameUserStats)
          .where(eq(lionGameUserStats.userId, userId))
          .limit(1);
          
          if (userStats.length > 0) {
            const currentUnlockedLevels = userStats[0].unlockedLevels || [];
            if (!currentUnlockedLevels.includes(nextLevel[0].id)) {
              await db!.update(lionGameUserStats)
                .set({ 
                  unlockedLevels: [...currentUnlockedLevels, nextLevel[0].id] 
                })
                .where(eq(lionGameUserStats.id, userStats[0].id));
            }
          }
        }
      }
      
      // تحديث إحصائيات المستخدم
      await this.updateUserStats(userId, {
        totalGamesPlayed: sql`${lionGameUserStats.totalGamesPlayed} + 1`,
        totalCoinsCollected: sql`${lionGameUserStats.totalCoinsCollected} + ${gameData.coinsCollected}`,
        totalDistance: sql`${lionGameUserStats.totalDistance} + ${gameData.distance}`,
        totalPowerUpsUsed: sql`${lionGameUserStats.totalPowerUpsUsed} + ${gameData.powerUpsUsed}`,
        lastPlayed: now,
        ...(result === "win" ? { gamesWon: sql`${lionGameUserStats.gamesWon} + 1` } : { gamesLost: sql`${lionGameUserStats.gamesLost} + 1` }),
        ...(gameData.score > 0 ? { highestScore: sql`GREATEST(${lionGameUserStats.highestScore}, ${gameData.score})` } : {}),
        ...(gameData.obstaclesAvoided === 0 && result === "win" ? { perfectRuns: sql`${lionGameUserStats.perfectRuns} + 1` } : {})
      });
      
      return { 
        success: true, 
        message: result === "win" ? "تهانينا! لقد فزت!" : "حظ أوفر في المرة القادمة!",
        reward 
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in recordGameResult:", error);
      throw new Error("فشل في تسجيل نتيجة اللعبة");
    }
  }
  
  /**
   * الحصول على سجل ألعاب المستخدم
   */
  async getUserGameHistory(userId: number, limit: number = 10): Promise<LionGameHistory[]> {
    try {
      const history = await db!.select()
        .from(lionGameHistory)
        .where(eq(lionGameHistory.userId, userId))
        .orderBy(desc(lionGameHistory.startTime))
        .limit(limit);
      
      return history;
    } catch (error) {
      console.error("[LionGazelleService] Error in getUserGameHistory:", error);
      throw new Error("فشل في جلب سجل الألعاب");
    }
  }
  
  /**
   * الحصول على إحصائيات المستخدم في اللعبة
   */
  async getUserStats(userId: number): Promise<any> {
    try {
      // التحقق من وجود إحصائيات للمستخدم وإنشائها إذا لم تكن موجودة
      const userStats = await db!.select()
        .from(lionGameUserStats)
        .where(eq(lionGameUserStats.userId, userId))
        .limit(1);
      
      if (userStats.length === 0) {
        // إنشاء إحصائيات جديدة للمستخدم
        const newStats = await db!.insert(lionGameUserStats)
          .values({
            userId,
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalCoinsCollected: 0,
            totalDistance: 0,
            highestScore: 0,
            totalPowerUpsUsed: 0,
            perfectRuns: 0,
            unlockedLevels: [1] // المستوى الأول مفتوح افتراضياً
          })
          .returning();
        
        return newStats[0];
      }
      
      // الحصول على معلومات إضافية
      // 1. الشخصية المفضلة
      let favoriteCharacterInfo = null;
      if (userStats[0].favoriteCharacter) {
        const character = await db!.select()
          .from(lionGameCharacters)
          .where(eq(lionGameCharacters.id, userStats[0].favoriteCharacter))
          .limit(1);
        
        if (character.length > 0) {
          favoriteCharacterInfo = character[0];
        }
      }
      
      // 2. تحسين القوة الأكثر استخداماً
      let mostUsedPowerUpInfo = null;
      if (userStats[0].mostUsedPowerUp) {
        const powerUp = await db!.select()
          .from(lionGamePowerUps)
          .where(eq(lionGamePowerUps.id, userStats[0].mostUsedPowerUp))
          .limit(1);
        
        if (powerUp.length > 0) {
          mostUsedPowerUpInfo = powerUp[0];
        }
      }
      
      // 3. مجموع المكافآت المكتسبة
      const rewards = await db!.select({
        totalRewards: sql`SUM(${lionGameHistory.rewardChips})`
      })
      .from(lionGameHistory)
      .where(eq(lionGameHistory.userId, userId));
      
      // 4. أفضل مضاعف تم تحقيقه
      const bestMultiplier = await db!.select({
        maxMultiplier: sql`MAX(${lionGameHistory.multiplier})`
      })
      .from(lionGameHistory)
      .where(eq(lionGameHistory.userId, userId));
      
      return {
        ...userStats[0],
        favoriteCharacterInfo,
        mostUsedPowerUpInfo,
        totalRewards: rewards[0]?.totalRewards || 0,
        bestMultiplier: bestMultiplier[0]?.maxMultiplier || 0
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in getUserStats:", error);
      throw new Error("فشل في جلب إحصائيات المستخدم");
    }
  }
  
  /**
   * الحصول على أفضل اللاعبين (لوحة المتصدرين)
   */
  async getLeaderboard(category: 'score' | 'coins' | 'distance' | 'wins' = 'score', limit: number = 10): Promise<any[]> {
    try {
      let result;
      
      // اختيار طريقة الترتيب بناءً على الفئة
      switch (category) {
        case 'score':
          // ترتيب حسب أعلى نتيجة
          result = await db!.select({
            userId: lionGameUserStats.userId,
            username: users.username,
            avatar: users.avatar,
            value: lionGameUserStats.highestScore,
            totalGames: lionGameUserStats.totalGamesPlayed
          })
          .from(lionGameUserStats)
          .innerJoin(users, eq(lionGameUserStats.userId, users.id))
          .where(gt(lionGameUserStats.highestScore, 0))
          .orderBy(desc(lionGameUserStats.highestScore))
          .limit(limit);
          break;
          
        case 'coins':
          // ترتيب حسب أكثر عملات تم جمعها
          result = await db!.select({
            userId: lionGameUserStats.userId,
            username: users.username,
            avatar: users.avatar,
            value: lionGameUserStats.totalCoinsCollected,
            totalGames: lionGameUserStats.totalGamesPlayed
          })
          .from(lionGameUserStats)
          .innerJoin(users, eq(lionGameUserStats.userId, users.id))
          .where(gt(lionGameUserStats.totalCoinsCollected, 0))
          .orderBy(desc(lionGameUserStats.totalCoinsCollected))
          .limit(limit);
          break;
          
        case 'distance':
          // ترتيب حسب أكبر مسافة مقطوعة
          result = await db!.select({
            userId: lionGameUserStats.userId,
            username: users.username,
            avatar: users.avatar,
            value: lionGameUserStats.totalDistance,
            totalGames: lionGameUserStats.totalGamesPlayed
          })
          .from(lionGameUserStats)
          .innerJoin(users, eq(lionGameUserStats.userId, users.id))
          .where(gt(lionGameUserStats.totalDistance, 0))
          .orderBy(desc(lionGameUserStats.totalDistance))
          .limit(limit);
          break;
          
        case 'wins':
          // ترتيب حسب أكثر انتصارات
          result = await db!.select({
            userId: lionGameUserStats.userId,
            username: users.username,
            avatar: users.avatar,
            value: lionGameUserStats.gamesWon,
            totalGames: lionGameUserStats.totalGamesPlayed
          })
          .from(lionGameUserStats)
          .innerJoin(users, eq(lionGameUserStats.userId, users.id))
          .where(gt(lionGameUserStats.gamesWon, 0))
          .orderBy(desc(lionGameUserStats.gamesWon))
          .limit(limit);
          break;
      }
      
      return result || [];
    } catch (error) {
      console.error("[LionGazelleService] Error in getLeaderboard:", error);
      throw new Error("فشل في جلب لوحة المتصدرين");
    }
  }
  
  /**
   * إنشاء أو تحديث إحصائيات المستخدم
   * @private
   */
  private async updateUserStats(userId: number, updates: Record<string, any>): Promise<void> {
    try {
      // التحقق من وجود إحصائيات للمستخدم
      const userStats = await db!.select({
        id: lionGameUserStats.id
      })
      .from(lionGameUserStats)
      .where(eq(lionGameUserStats.userId, userId))
      .limit(1);
      
      if (userStats.length === 0) {
        // إنشاء إحصائيات جديدة للمستخدم
        await db!.insert(lionGameUserStats)
          .values({
            userId,
            totalGamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalCoinsCollected: 0,
            totalDistance: 0,
            highestScore: 0,
            totalPowerUpsUsed: 0,
            perfectRuns: 0,
            unlockedLevels: [1], // المستوى الأول مفتوح افتراضياً
            ...updates
          });
      } else {
        // تحديث إحصائيات المستخدم الحالية
        await db!.update(lionGameUserStats)
          .set(updates)
          .where(eq(lionGameUserStats.id, userStats[0].id));
      }
    } catch (error) {
      console.error("[LionGazelleService] Error in updateUserStats:", error);
      throw new Error("فشل في تحديث إحصائيات المستخدم");
    }
  }
  
  /**
   * الحصول على معلومات قيمة الخروج الآمن
   * تحسب المضاعف الأمثل للخروج الآمن بناءً على بيانات اللعبة السابقة
   */
  async getCashoutTips(): Promise<{ safeMultiplier: number, riskyMultiplier: number, avgCrashPoint: number }> {
    try {
      // الحصول على متوسط نقاط الاصطدام من بيانات اللعبة السابقة
      const crashData = await db!.select({
        avgMultiplier: sql`AVG(${lionGameHistory.multiplier})`,
        minMultiplier: sql`MIN(${lionGameHistory.multiplier})`,
        maxMultiplier: sql`MAX(${lionGameHistory.multiplier})`
      })
      .from(lionGameHistory)
      .where(
        and(
          eq(lionGameHistory.result, 'loss'),
          gt(lionGameHistory.multiplier, 1)
        )
      );
      
      const avgCrashPoint = parseFloat(crashData[0]?.avgMultiplier) || 3.0;
      const minCrashPoint = parseFloat(crashData[0]?.minMultiplier) || 1.2;
      
      // حساب المضاعف الآمن (75% من المتوسط)
      const safeMultiplier = Math.max(1.5, Math.floor((avgCrashPoint * 0.75) * 100) / 100);
      
      // حساب المضاعف المحفوف بالمخاطر (90% من المتوسط)
      const riskyMultiplier = Math.max(1.8, Math.floor((avgCrashPoint * 0.9) * 100) / 100);
      
      return {
        safeMultiplier,
        riskyMultiplier,
        avgCrashPoint
      };
    } catch (error) {
      console.error("[LionGazelleService] Error in getCashoutTips:", error);
      // قيم افتراضية في حالة حدوث خطأ
      return {
        safeMultiplier: 1.8,
        riskyMultiplier: 2.5,
        avgCrashPoint: 3.2
      };
    }
  }
}

// تصدير نسخة واحدة من الخدمة للاستخدام في جميع أنحاء التطبيق
export const lionGazelleService = new LionGazelleService();