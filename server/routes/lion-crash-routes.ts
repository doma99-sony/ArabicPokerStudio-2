import express, { Request, Response } from "express";
import { lionCrashService } from "../services/lion-crash-service";
import { z } from "zod";

// إنشاء router جديد
const lionCrashRouter = express.Router();

/**
 * الحصول على اللعبة الحالية
 */
lionCrashRouter.get("/current", async (req: Request, res: Response) => {
  try {
    const currentGame = lionCrashService.getCurrentGame();
    
    res.json({
      success: true,
      game: currentGame
    });
  } catch (error) {
    console.error('خطأ في الحصول على اللعبة الحالية:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على اللعبة الحالية"
    });
  }
});

/**
 * الحصول على لعبة محددة بواسطة معرفها
 */
lionCrashRouter.get("/:gameId", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    
    const game = lionCrashService.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "اللعبة غير موجودة"
      });
    }
    
    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('خطأ في الحصول على اللعبة:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على اللعبة"
    });
  }
});

/**
 * الحصول على تاريخ الألعاب الأخيرة
 */
lionCrashRouter.get("/history/recent", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const history = await lionCrashService.getRecentGames(limit);
    
    res.json({
      success: true,
      games: history
    });
  } catch (error) {
    console.error('خطأ في الحصول على تاريخ الألعاب:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على تاريخ الألعاب"
    });
  }
});

/**
 * الحصول على إحصائيات المستخدم
 */
lionCrashRouter.get("/stats/user", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول للوصول إلى الإحصائيات"
      });
    }
    
    const userId = req.user.id;
    const stats = await lionCrashService.getUserStats(userId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على إحصائيات المستخدم"
    });
  }
});

/**
 * الحصول على لوحة المتصدرين
 */
lionCrashRouter.get("/leaderboard/:period", async (req: Request, res: Response) => {
  try {
    const { period } = req.params;
    
    // التحقق من صحة الفترة
    if (!['daily', 'weekly', 'monthly', 'all_time'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "فترة غير صالحة. الفترات المدعومة هي: daily, weekly, monthly, all_time"
      });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const leaderboard = await lionCrashService.getLeaderboard(period as any, limit);
    
    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('خطأ في الحصول على لوحة المتصدرين:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على لوحة المتصدرين"
    });
  }
});

/**
 * وضع رهان في لعبة
 */
lionCrashRouter.post("/bet", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول لوضع رهان"
      });
    }
    
    // التحقق من البيانات المدخلة
    const schema = z.object({
      gameId: z.string().min(1),
      betAmount: z.number().positive(),
      autoCashoutAt: z.number().optional()
    });
    
    let validatedData;
    try {
      validatedData = schema.parse(req.body);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صالحة",
        errors: validationError
      });
    }
    
    const { gameId, betAmount, autoCashoutAt } = validatedData;
    
    // وضع الرهان
    const result = await lionCrashService.placeBet(
      gameId,
      req.user.id,
      req.user.username,
      req.user.avatar,
      betAmount,
      autoCashoutAt
    );
    
    res.json(result);
  } catch (error) {
    console.error('خطأ في وضع الرهان:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة وضع الرهان"
    });
  }
});

/**
 * سحب الرهان من لعبة
 */
lionCrashRouter.post("/cashout", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "يجب تسجيل الدخول لسحب الرهان"
      });
    }
    
    // التحقق من البيانات المدخلة
    const schema = z.object({
      gameId: z.string().min(1)
    });
    
    let validatedData;
    try {
      validatedData = schema.parse(req.body);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صالحة",
        errors: validationError
      });
    }
    
    const { gameId } = validatedData;
    
    // سحب الرهان
    const result = await lionCrashService.cashOut(gameId, req.user.id);
    
    res.json(result);
  } catch (error) {
    console.error('خطأ في سحب الرهان:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة سحب الرهان"
    });
  }
});

/**
 * التحقق من نزاهة لعبة محددة
 */
lionCrashRouter.get("/verify/:gameId", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    
    const verification = await lionCrashService.getGameVerification(gameId);
    
    res.json(verification);
  } catch (error) {
    console.error('خطأ في الحصول على بيانات التحقق من نزاهة اللعبة:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء محاولة الحصول على بيانات التحقق من نزاهة اللعبة"
    });
  }
});

export default lionCrashRouter;