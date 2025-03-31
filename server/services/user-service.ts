import { db } from '../db';
import { User, users, playerStats, insertUserSchema, userChipsTransactions } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { hashPassword } from '../auth';
import { log } from '../vite';

export class UserService {
  /**
   * الحصول على مستخدم حسب المعرف
   */
  async getUserById(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error fetching user by ID: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * الحصول على مستخدم حسب اسم المستخدم
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error fetching user by username: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * الحصول على مستخدم حسب الرمز الفريد
   */
  async getUserByCode(userCode: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.userCode, userCode)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error: any) {
      log(`Error fetching user by code: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(userData: any): Promise<User> {
    try {
      // التحقق من البيانات باستخدام مخطط Zod
      const parsedData = insertUserSchema.parse(userData);
      
      // تشفير كلمة المرور
      const hashedPassword = await hashPassword(parsedData.password);
      
      // إنشاء رمز فريد للمستخدم
      const userCode = await this.generateUniqueUserCode();
      
      // إنشاء المستخدم في قاعدة البيانات
      const result = await db
        .insert(users)
        .values({
          ...parsedData,
          password: hashedPassword,
          userCode,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          diamonds: parsedData.diamonds || 0,
          role: parsedData.role || 'player'
        })
        .returning();
      
      if (result.length === 0) {
        throw new Error('Failed to create user');
      }
      
      // إنشاء إحصائيات اللاعب
      await this.createInitialPlayerStats(result[0].id);
      
      return result[0];
    } catch (error: any) {
      log(`Error creating user: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * إنشاء إحصائيات أولية للاعب
   */
  private async createInitialPlayerStats(userId: number): Promise<void> {
    try {
      await db.insert(playerStats).values({
        userId,
        joinDate: new Date()
      });
    } catch (error: any) {
      log(`Error creating initial player stats: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * تحديث رصيد الرقائق للمستخدم
   */
  async updateUserChips(userId: number, newChips: number, type: string, description?: string): Promise<User | undefined> {
    try {
      // الحصول على المستخدم الحالي
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // حساب التغيير في الرقائق
      const chipsChange = newChips - user.chips;
      
      // تحديث رصيد المستخدم
      const updatedUsers = await db
        .update(users)
        .set({ 
          chips: newChips,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      if (updatedUsers.length === 0) {
        throw new Error('Failed to update user chips');
      }
      
      // إضافة سجل معاملة الرقائق
      await db.insert(userChipsTransactions).values({
        userId,
        amount: chipsChange,
        balanceAfter: newChips,
        type,
        description,
        createdAt: new Date()
      });
      
      return updatedUsers[0];
    } catch (error: any) {
      log(`Error updating user chips: ${error.message}`, 'database');
      throw error;
    }
  }

  /**
   * توليد رمز فريد للمستخدم (5 أرقام)
   */
  private async generateUniqueUserCode(): Promise<string> {
    try {
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        // توليد رقم عشوائي من 5 أرقام
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        
        // التحقق من عدم وجود هذا الرمز مسبقاً
        const existing = await this.getUserByCode(code);
        
        if (!existing) {
          return code;
        }
        
        attempts++;
      }
      
      // إذا وصلنا إلى هنا، فهذا يعني أننا لم نجد رمز فريد بعد عدة محاولات
      // نقوم بتوليد رقم أكثر تعقيداً
      const timestamp = Date.now() % 100000; // آخر 5 أرقام من الطابع الزمني
      return timestamp.toString().padStart(5, '0');
    } catch (error: any) {
      log(`Error generating unique user code: ${error.message}`, 'database');
      throw error;
    }
  }
}

export const userService = new UserService();