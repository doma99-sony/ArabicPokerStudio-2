import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { lionGazelleService } from '../services/lion-gazelle-service';

// ميدلوير للتحقق من المصادقة
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    // Refresh session
    req.session.touch();
    return next();
  }
  // Clear any invalid session
  req.session.destroy((err) => {
    if (err) console.error("Session destruction error:", err);
    res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذا المورد" });
  });
}

const router = Router();

/**
 * الحصول على جميع مستويات اللعبة
 */
router.get('/levels', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;
    const levels = await lionGazelleService.getLevels(userId);
    res.json({ success: true, data: levels });
  } catch (error: any) {
    console.error('Error fetching lion-gazelle levels:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على تفاصيل مستوى معين
 */
router.get('/levels/:id', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const levelId = parseInt(req.params.id);
    if (isNaN(levelId)) {
      return res.status(400).json({ success: false, error: 'معرف المستوى غير صالح' });
    }
    
    const level = await lionGazelleService.getLevelDetails(levelId);
    res.json({ success: true, data: level });
  } catch (error: any) {
    console.error('Error fetching lion-gazelle level details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على شخصيات المستخدم
 */
router.get('/characters', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;
    const characters = await lionGazelleService.getUserCharacters(userId);
    res.json({ success: true, data: characters });
  } catch (error: any) {
    console.error('Error fetching user characters:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على تحسينات قوة المستخدم
 */
router.get('/power-ups', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;
    const powerUps = await lionGazelleService.getUserPowerUps(userId);
    res.json({ success: true, data: powerUps });
  } catch (error: any) {
    console.error('Error fetching user power-ups:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * شراء شخصية جديدة
 */
router.post('/purchase-character', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      characterId: z.number()
    });
    
    const { characterId } = schema.parse(req.body);
    const userId = req.user?.id || 0;
    
    const result = await lionGazelleService.purchaseCharacter(userId, characterId);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error: any) {
    console.error('Error purchasing character:', error);
    res.status(500).json({ success: false, error: error.message || 'حدث خطأ أثناء شراء الشخصية' });
  }
});

/**
 * شراء تحسين قوة
 */
router.post('/purchase-power-up', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      powerUpId: z.number(),
      quantity: z.number().optional().default(1)
    });
    
    const { powerUpId, quantity } = schema.parse(req.body);
    const userId = req.user?.id || 0;
    
    const result = await lionGazelleService.purchasePowerUp(userId, powerUpId, quantity);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error: any) {
    console.error('Error purchasing power-up:', error);
    res.status(500).json({ success: false, error: error.message || 'حدث خطأ أثناء شراء تحسين القوة' });
  }
});

/**
 * تجهيز شخصية
 */
router.post('/equip-character', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      characterId: z.number()
    });
    
    const { characterId } = schema.parse(req.body);
    const userId = req.user?.id || 0;
    
    const result = await lionGazelleService.equipCharacter(userId, characterId);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  } catch (error: any) {
    console.error('Error equipping character:', error);
    res.status(500).json({ success: false, error: error.message || 'حدث خطأ أثناء تجهيز الشخصية' });
  }
});

/**
 * تسجيل نتيجة لعبة
 */
router.post('/record-result', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      levelId: z.number(),
      result: z.enum(['win', 'loss']),
      gameData: z.object({
        duration: z.number(),
        distance: z.number(),
        coinsCollected: z.number(),
        powerUpsUsed: z.number(),
        obstaclesAvoided: z.number(),
        score: z.number(),
        multiplier: z.number(),
        characterUsed: z.number().optional()
      })
    });
    
    const { levelId, result, gameData } = schema.parse(req.body);
    const userId = req.user?.id || 0;
    
    const gameResult = await lionGazelleService.recordGameResult(userId, levelId, result, gameData);
    
    res.json({ 
      success: true, 
      message: gameResult.message,
      reward: gameResult.reward
    });
  } catch (error: any) {
    console.error('Error recording game result:', error);
    res.status(500).json({ success: false, error: error.message || 'حدث خطأ أثناء تسجيل نتيجة اللعبة' });
  }
});

/**
 * الحصول على سجل ألعاب المستخدم
 */
router.get('/history', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const history = await lionGazelleService.getUserGameHistory(userId, limit);
    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على إحصائيات المستخدم
 */
router.get('/stats', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || 0;
    const stats = await lionGazelleService.getUserStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على لوحة المتصدرين
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as 'score' | 'coins' | 'distance' | 'wins') || 'score';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const leaderboard = await lionGazelleService.getLeaderboard(category, limit);
    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * الحصول على نصائح قيمة الخروج الآمن
 */
router.get('/cashout-tips', async (req: Request, res: Response) => {
  try {
    const tips = await lionGazelleService.getCashoutTips();
    res.json({ success: true, data: tips });
  } catch (error: any) {
    console.error('Error fetching cashout tips:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;