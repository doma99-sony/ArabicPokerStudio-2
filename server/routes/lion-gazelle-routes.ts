import { Router } from 'express';
import lionGazelleService from '../services/lion-gazelle-service';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// مخطط التحقق من صحة الرهان
const betSchema = z.object({
  amount: z.number().int().positive()
});

// مخطط التحقق من معرّف اللعبة
const gameIdSchema = z.object({
  gameId: z.string()
});

// الحصول على اللعبة الحالية
router.get('/current-game', async (req, res) => {
  try {
    // التحقق من وجود مستخدم مسجل
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للمتابعة' });
    }
    
    // الحصول على اللعبة الحالية
    let game = lionGazelleService.getCurrentGame();
    
    // إذا لم تكن هناك لعبة حالية، قم بإنشاء واحدة جديدة
    if (!game) {
      const gameId = await lionGazelleService.createGame();
      game = lionGazelleService.getGame(gameId);
    }
    
    res.json({ success: true, game });
  } catch (error) {
    console.error('Error getting current game:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحصول على اللعبة الحالية' });
  }
});

// وضع رهان
router.post('/place-bet', async (req, res) => {
  try {
    // التحقق من وجود مستخدم مسجل
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للمتابعة' });
    }
    
    // التحقق من صحة البيانات المرسلة
    const validationResult = betSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: 'بيانات الرهان غير صالحة' });
    }
    
    const { amount } = validationResult.data;
    const userId = req.user.id;
    
    // التحقق من رصيد المستخدم
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    
    if (user.chips < amount) {
      return res.status(400).json({ success: false, message: 'رصيد غير كافٍ' });
    }
    
    // الحصول على اللعبة الحالية
    let game = lionGazelleService.getCurrentGame();
    if (!game) {
      return res.status(400).json({ success: false, message: 'لا توجد لعبة نشطة حالياً' });
    }
    
    // وضع الرهان
    const result = await lionGazelleService.placeBet(
      game.gameId,
      userId,
      user.username,
      user.avatar || null,
      amount
    );
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    // تحديث رصيد المستخدم (خصم قيمة الرهان)
    await storage.updateUserChips(userId, user.chips - amount);
    
    // إعادة اللعبة المحدثة
    game = lionGazelleService.getGame(game.gameId);
    
    res.json({ success: true, message: 'تم وضع الرهان بنجاح', game });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء وضع الرهان' });
  }
});

// سحب الرهان (الخروج من اللعبة)
router.post('/cash-out', async (req, res) => {
  try {
    // التحقق من وجود مستخدم مسجل
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للمتابعة' });
    }
    
    // التحقق من صحة البيانات المرسلة
    const validationResult = gameIdSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, message: 'معرّف اللعبة غير صالح' });
    }
    
    const { gameId } = validationResult.data;
    const userId = req.user.id;
    
    // محاولة سحب الرهان
    const result = await lionGazelleService.cashOut(gameId, userId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    // تحديث رصيد المستخدم (إضافة الأرباح)
    const user = await storage.getUser(userId);
    if (user && result.profit && result.profit > 0) {
      await storage.updateUserChips(userId, user.chips + result.profit + (user.chips / result.multiplier!));
    }
    
    // إعادة اللعبة المحدثة
    const game = lionGazelleService.getGame(gameId);
    
    res.json({
      success: true,
      message: 'تم السحب بنجاح',
      multiplier: result.multiplier,
      profit: result.profit,
      game
    });
  } catch (error) {
    console.error('Error cashing out:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء السحب' });
  }
});

// الحصول على إحصائيات اللاعب
router.get('/stats', async (req, res) => {
  try {
    // التحقق من وجود مستخدم مسجل
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ success: false, message: 'يرجى تسجيل الدخول للمتابعة' });
    }
    
    const userId = req.user.id;
    
    // الحصول على إحصائيات اللاعب
    const stats = await lionGazelleService.getUserStats(userId);
    
    if (!stats) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على إحصائيات' });
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحصول على الإحصائيات' });
  }
});

// الحصول على المتصدرين
router.get('/leaderboard', async (req, res) => {
  try {
    // التحقق من صحة المعلمات
    const period = req.query.period as 'daily' | 'weekly' | 'monthly' | 'all_time' || 'all_time';
    const limit = parseInt(req.query.limit as string) || 10;
    
    // الحصول على المتصدرين
    const leaderboard = await lionGazelleService.getLeaderboard(period, limit);
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحصول على المتصدرين' });
  }
});

// الحصول على سجل الألعاب الحديثة
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // الحصول على سجل الألعاب
    const history = await lionGazelleService.getRecentGames(limit);
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting game history:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء الحصول على سجل الألعاب' });
  }
});

export default router;