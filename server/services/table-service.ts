import { db } from '../db';
import { gameTables, tablePlayers, tableStatusEnum, gameTypeEnum } from '../../shared/schema';
import type { Card, GameTable } from '../../shared/types';
import { eq, and, not, desc, asc } from 'drizzle-orm';
import { log } from '../vite';

export class TableService {
  /**
   * الحصول على جميع طاولات اللعب
   */
  async getAllTables(): Promise<GameTable[]> {
    try {
      return await db.select().from(gameTables).orderBy(asc(gameTables.smallBlind));
    } catch (error: any) {
      log(`Error fetching all tables: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * الحصول على طاولات اللعب حسب نوع اللعبة
   */
  async getTablesByType(gameType: string): Promise<GameTable[]> {
    try {
      return await db
        .select()
        .from(gameTables)
        .where(eq(gameTables.gameType, gameType as any))
        .orderBy(asc(gameTables.smallBlind));
    } catch (error: any) {
      log(`Error fetching tables by type: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * الحصول على طاولة لعب محددة
   */
  async getTableById(tableId: number): Promise<GameTable | undefined> {
    try {
      const result = await db
        .select()
        .from(gameTables)
        .where(eq(gameTables.id, tableId))
        .limit(1);
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error fetching table by ID: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * تحديث حالة الطاولة
   */
  async updateTableStatus(tableId: number, status: 'available' | 'full' | 'in_progress' | 'maintenance'): Promise<GameTable | undefined> {
    try {
      const result = await db
        .update(gameTables)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(gameTables.id, tableId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error updating table status: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * تحديث عدد اللاعبين الحاليين في الطاولة
   */
  async updateCurrentPlayers(tableId: number, count: number): Promise<GameTable | undefined> {
    try {
      const result = await db
        .update(gameTables)
        .set({ 
          currentPlayers: count,
          updatedAt: new Date()
        })
        .where(eq(gameTables.id, tableId))
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error updating current players: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * إنشاء طاولة لعب جديدة
   */
  async createTable(tableData: Partial<GameTable>): Promise<GameTable> {
    try {
      const result = await db
        .insert(gameTables)
        .values({
          name: tableData.name || 'طاولة جديدة',
          gameType: tableData.gameType || 'poker',
          smallBlind: tableData.smallBlind || 10,
          bigBlind: tableData.bigBlind || 20,
          minBuyIn: tableData.minBuyIn || 200,
          maxBuyIn: tableData.maxBuyIn || 2000,
          maxPlayers: tableData.maxPlayers || 9,
          currentPlayers: 0,
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date(),
          tableImage: tableData.tableImage,
          isVip: tableData.isVip || false,
          requiredVipLevel: tableData.requiredVipLevel || 0,
          password: tableData.password,
          ownerId: tableData.ownerId,
          tableSettings: tableData.tableSettings || {}
        } as any)
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create table');
      }
      
      return result[0];
    } catch (error: any) {
      log(`Error creating table: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * الحصول على اللاعبين في طاولة معينة
   */
  async getPlayersAtTable(tableId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: tablePlayers.id,
          userId: tablePlayers.userId,
          position: tablePlayers.position,
          currentChips: tablePlayers.currentChips,
          isActive: tablePlayers.isActive,
          joinedAt: tablePlayers.joinedAt,
          lastAction: tablePlayers.lastAction,
          lastActionTime: tablePlayers.lastActionTime
        })
        .from(tablePlayers)
        .where(eq(tablePlayers.tableId, tableId))
        .orderBy(asc(tablePlayers.position));
      
      return result;
    } catch (error: any) {
      log(`Error fetching players at table: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * إضافة لاعب إلى طاولة
   */
  async addPlayerToTable(tableId: number, userId: number, position: number, chips: number): Promise<any> {
    try {
      // التحقق من وجود اللاعب في الطاولة بالفعل
      const existingPlayer = await db
        .select()
        .from(tablePlayers)
        .where(
          and(
            eq(tablePlayers.tableId, tableId),
            eq(tablePlayers.userId, userId)
          )
        )
        .limit(1);
      
      if (existingPlayer.length > 0) {
        throw new Error('Player already at this table');
      }
      
      // التحقق من أن الموضع غير مشغول
      const occupiedPosition = await db
        .select()
        .from(tablePlayers)
        .where(
          and(
            eq(tablePlayers.tableId, tableId),
            eq(tablePlayers.position, position)
          )
        )
        .limit(1);
      
      if (occupiedPosition.length > 0) {
        throw new Error('Position already occupied');
      }
      
      // إضافة اللاعب إلى الطاولة
      const result = await db
        .insert(tablePlayers)
        .values({
          tableId,
          userId,
          position,
          currentChips: chips,
          isActive: true,
          joinedAt: new Date()
        })
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to add player to table');
      }
      
      // تحديث عدد اللاعبين الحاليين في الطاولة
      const playersCount = await db
        .select({ count: tablePlayers.id })
        .from(tablePlayers)
        .where(eq(tablePlayers.tableId, tableId))
        .limit(1);
      
      const count = playersCount.length > 0 ? playersCount[0].count : 0;
      await this.updateCurrentPlayers(tableId, count as number);
      
      return result[0];
    } catch (error: any) {
      log(`Error adding player to table: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * إزالة لاعب من طاولة
   */
  async removePlayerFromTable(tableId: number, userId: number): Promise<any> {
    try {
      // إزالة اللاعب من الطاولة
      const result = await db
        .delete(tablePlayers)
        .where(
          and(
            eq(tablePlayers.tableId, tableId),
            eq(tablePlayers.userId, userId)
          )
        )
        .returning();
      
      if (result.length === 0) {
        throw new Error('Player not found at this table');
      }
      
      // تحديث عدد اللاعبين الحاليين في الطاولة
      const playersCount = await db
        .select({ count: tablePlayers.id })
        .from(tablePlayers)
        .where(eq(tablePlayers.tableId, tableId))
        .limit(1);
      
      const count = playersCount.length > 0 ? playersCount[0].count : 0;
      await this.updateCurrentPlayers(tableId, count as number);
      
      return result[0];
    } catch (error: any) {
      log(`Error removing player from table: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * تحديث آخر إجراء للاعب في الطاولة
   */
  async updatePlayerAction(tableId: number, userId: number, action: string): Promise<any> {
    try {
      const result = await db
        .update(tablePlayers)
        .set({
          lastAction: action,
          lastActionTime: new Date()
        })
        .where(
          and(
            eq(tablePlayers.tableId, tableId),
            eq(tablePlayers.userId, userId)
          )
        )
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error updating player action: ${error.message}`, 'database');
      throw error;
    }
  }
  
  /**
   * تحديث الرقائق الحالية للاعب في الطاولة
   */
  async updatePlayerChips(tableId: number, userId: number, chips: number): Promise<any> {
    try {
      const result = await db
        .update(tablePlayers)
        .set({
          currentChips: chips
        })
        .where(
          and(
            eq(tablePlayers.tableId, tableId),
            eq(tablePlayers.userId, userId)
          )
        )
        .returning();
      
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error updating player chips: ${error.message}`, 'database');
      throw error;
    }
  }
}

export const tableService = new TableService();