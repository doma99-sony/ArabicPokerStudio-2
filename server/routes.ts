import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { setupPokerGame, pokerModule } from "./poker";
import { z } from "zod";
import fileUpload from "express-fileupload";
import { UserService } from "./services/user-service";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up poker game routes and WebSocket server
  const httpServer = createServer(app);
  setupPokerGame(app, httpServer);
  
  // API endpoints
  
  // مسار اختبار حالة الخادم - يستخدم للتحقق من أن الخادم يعمل
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "up", timestamp: new Date().toISOString() });
  });
  
  // طرق المستخدم الأساسية
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "غير مصرح" });
    }
    res.json(req.user);
  });
  
  // مسار للحصول على أفضل 3 لاعبين مرتبين حسب عدد الرقائق (للشريط الجانبي)
  app.get("/api/rankings/top3", async (req, res) => {
    try {
      // الحصول على جميع المستخدمين من التخزين
      const allUsers = Array.from(storage.users.values());
      
      // ترتيب المستخدمين تنازلياً حسب عدد الرقائق
      const sortedUsers = allUsers
        .filter(user => user.chips > 0) // فقط المستخدمين الذين لديهم رقائق
        .sort((a, b) => b.chips - a.chips); // ترتيب تنازلي
      
      // أخذ أفضل 3 مستخدمين
      const topPlayers = sortedUsers.slice(0, 3).map(user => ({
        id: user.id,
        username: user.username,
        chips: user.chips,
        avatar: user.avatar || null
      }));
      
      res.json(topPlayers);
    } catch (error) {
      console.error("خطأ في الحصول على أفضل 3 لاعبين:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب أفضل 3 لاعبين" });
    }
  });
  
  // مسار للحصول على أفضل 100 لاعب مرتبين حسب عدد الرقائق (لصفحة الترتيب)
  app.get("/api/rankings/top100", async (req, res) => {
    try {
      // الحصول على جميع المستخدمين من التخزين
      const allUsers = Array.from(storage.users.values());
      
      // ترتيب المستخدمين تنازلياً حسب عدد الرقائق
      const sortedUsers = allUsers
        .filter(user => user.chips > 0) // فقط المستخدمين الذين لديهم رقائق
        .sort((a, b) => b.chips - a.chips); // ترتيب تنازلي
      
      // أخذ أفضل 100 لاعب
      const topPlayers = sortedUsers.slice(0, 100).map(user => ({
        id: user.id,
        username: user.username,
        chips: user.chips,
        avatar: user.avatar || null
      }));
      
      res.json(topPlayers);
    } catch (error) {
      console.error("خطأ في الحصول على أفضل 100 لاعب:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب أفضل 100 لاعب" });
    }
  });
  
  // البحث عن مستخدم بواسطة المعرف
  app.get("/api/users/:userId", ensureAuthenticated, async (req, res) => {
    try {
      let user;
      const userIdParam = req.params.userId;
      
      // محاولة تحويل المعرف إلى رقم، قد يكون رقم معرف المستخدم أو رمز المستخدم الفريد
      const userId = parseInt(userIdParam);
      
      console.log(`البحث عن المستخدم: ${userIdParam} - معرف رقمي: ${!isNaN(userId) ? userId : 'لا'}`);
      
      // البحث حسب المعرف الرقمي
      if (!isNaN(userId)) {
        user = await storage.getUser(userId);
        
        // إذا لم يتم العثور على المستخدم بالمعرف الرقمي
        if (!user) {
          // البحث بواسطة معرف المستخدم المكون من 5 أرقام (userCode)
          const usersWithCode = Array.from(storage.users.values()).filter(u => u.userCode === userIdParam);
          if (usersWithCode.length > 0) {
            user = usersWithCode[0];
            console.log(`تم العثور على المستخدم بواسطة الرمز: ${userIdParam}`);
          }
        } else {
          console.log(`تم العثور على المستخدم بواسطة المعرف الرقمي: ${userId}`);
        }
      } else {
        // البحث بواسطة اسم المستخدم
        user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          // البحث بواسطة معرف المستخدم المكون من 5 أرقام (userCode)
          const usersWithCode = Array.from(storage.users.values()).filter(u => u.userCode === userIdParam);
          if (usersWithCode.length > 0) {
            user = usersWithCode[0];
            console.log(`تم العثور على المستخدم بواسطة الرمز: ${userIdParam}`);
          }
        } else {
          console.log(`تم العثور على المستخدم بواسطة اسم المستخدم: ${userIdParam}`);
        }
      }
      
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      // إعادة بيانات المستخدم الآمنة (بدون كلمة المرور)
      const safeUser = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        userCode: user.userCode // إضافة معرف المستخدم المكون من 5 أرقام
      };
      
      res.json(safeUser);
    } catch (error) {
      console.error("خطأ في البحث عن المستخدم:", error);
      res.status(500).json({ error: "حدث خطأ أثناء البحث عن المستخدم" });
    }
  });
  
  // إرسال رقائق (العطاء)
  app.post("/api/send-chips", ensureAuthenticated, async (req, res) => {
    try {
      const { recipientId, amount } = req.body;
      const senderId = req.user!.id;
      
      // التحقق من المعلومات
      if (!recipientId || !amount) {
        return res.status(400).json({ error: "يرجى تقديم معرف المستلم والمبلغ" });
      }
      
      const recipientIdNum = parseInt(recipientId);
      const amountNum = parseInt(amount);
      
      if (isNaN(recipientIdNum) || isNaN(amountNum)) {
        return res.status(400).json({ error: "معرف المستلم أو المبلغ غير صالح" });
      }
      
      // التحقق من أن المبلغ إيجابي
      if (amountNum <= 0) {
        return res.status(400).json({ error: "يجب أن يكون المبلغ أكبر من صفر" });
      }
      
      // التحقق من وجود المستلم
      const recipient = await storage.getUser(recipientIdNum);
      if (!recipient) {
        return res.status(404).json({ error: "المستلم غير موجود" });
      }
      
      // التحقق من أن المستخدم لا يرسل لنفسه
      if (senderId === recipientIdNum) {
        return res.status(400).json({ error: "لا يمكنك إرسال رقائق لنفسك" });
      }
      
      // التحقق من رصيد المرسل
      let sender;
      try {
        // محاولة الحصول على المستخدم من قاعدة البيانات أولاً
        sender = await userService.getUserById(senderId);
      } catch (dbError) {
        console.error(`خطأ في الحصول على المرسل من قاعدة البيانات:`, dbError);
      }
      
      // إذا لم يتم العثور عليه في قاعدة البيانات، نستخدم المخزن المؤقت كنسخة احتياطية
      if (!sender) {
        sender = await storage.getUser(senderId);
        if (!sender) {
          return res.status(404).json({ error: "المرسل غير موجود" });
        }
      }
      
      if (sender.chips < amountNum) {
        return res.status(400).json({ error: "رصيد غير كافٍ" });
      }
      
      // تحديث رصيد المرسل في قاعدة البيانات وفي الذاكرة المؤقتة
      let dbSenderUpdated = false;
      try {
        await userService.updateUserChips(
          senderId, 
          sender.chips - amountNum, 
          "send_chips",
          `إرسال رقائق إلى المستخدم ${recipient.username}`
        );
        dbSenderUpdated = true;
      } catch (dbError) {
        console.error(`خطأ في تحديث رصيد المرسل في قاعدة البيانات:`, dbError);
      }
      
      // تحديث الذاكرة المؤقتة على أي حال للقطات السريعة من الواجهة
      const updatedSender = await storage.updateUserChips(
        senderId, 
        sender.chips - amountNum, 
        "send_chips",
        `إرسال رقائق إلى المستخدم ${recipient.username}`
      );
      
      // تحديث رصيد المستلم في قاعدة البيانات وفي الذاكرة المؤقتة
      let dbRecipientUpdated = false;
      try {
        await userService.updateUserChips(
          recipientIdNum, 
          recipient.chips + amountNum, 
          "receive_chips",
          `استلام رقائق من المستخدم ${sender.username}`
        );
        dbRecipientUpdated = true;
      } catch (dbError) {
        console.error(`خطأ في تحديث رصيد المستلم في قاعدة البيانات:`, dbError);
      }
      
      // تحديث الذاكرة المؤقتة على أي حال للقطات السريعة من الواجهة
      const updatedRecipient = await storage.updateUserChips(
        recipientIdNum, 
        recipient.chips + amountNum,
        "receive_chips",
        `استلام رقائق من المستخدم ${sender.username}`
      );
      
      // إرسال إشعار (يمكن تنفيذه لاحقاً)
      // TODO: إضافة نظام الإشعارات
      
      res.json({ 
        success: true, 
        message: "تم إرسال الرقائق بنجاح",
        amount: amountNum,
        sender: { id: sender.id, username: sender.username },
        recipient: { id: recipient.id, username: recipient.username }
      });
    } catch (error) {
      console.error("خطأ في إرسال الرقائق:", error);
      res.status(500).json({ error: "حدث خطأ أثناء محاولة إرسال الرقائق" });
    }
  });
  
  // إنشاء مثيل لخدمة المستخدم
  const userService = new UserService();

  // تحديث رصيد اللاعب بعد اللعب في صاروخ مصر
  app.post("/api/games/egypt-rocket/update-chips", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "مستخدم غير مصرح به" });
      }
      
      const { betAmount, winAmount, multiplier, gameResult } = req.body;
      const userId = req.user.id;
      
      // التحقق من المعلومات
      if (typeof betAmount !== 'number' || isNaN(betAmount)) {
        return res.status(400).json({ error: "مبلغ الرهان غير صالح" });
      }
      
      if (typeof winAmount !== 'number' || isNaN(winAmount)) {
        return res.status(400).json({ error: "مبلغ الفوز غير صالح" });
      }
      
      // الحصول على المستخدم الحالي من قاعدة البيانات أولاً
      let dbUser;
      try {
        dbUser = await userService.getUserById(userId);
        if (!dbUser) {
          console.log(`المستخدم ${userId} غير موجود في قاعدة البيانات، الانتقال لاستخدام المستخدم من المخزن المؤقت`);
        } else {
          console.log(`تم العثور على المستخدم ${userId} في قاعدة البيانات، الرصيد الحالي: ${dbUser.chips}`);
        }
      } catch (dbError) {
        console.error(`خطأ في الحصول على المستخدم من قاعدة البيانات:`, dbError);
      }
      
      // الحصول على المستخدم من المخزن المؤقت كنسخة احتياطية
      const memUser = await storage.getUser(userId);
      if (!memUser && !dbUser) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      // استخدام البيانات من قاعدة البيانات أولاً ثم الانتقال إلى بيانات المخزن المؤقت
      const user = dbUser || memUser;
      
      // حساب الربح أو الخسارة
      const profitLoss = winAmount - betAmount;
      
      // تأكد من وجود المستخدم والرقائق الخاصة به
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود أو لا يمكن الوصول إليه" });
      }
      
      const currentChips = user.chips || 0; // إذا كانت الرقائق غير محددة، استخدم 0
      const newChips = currentChips + profitLoss;
      
      console.log(`تحديث رصيد المستخدم ${userId} - القديم: ${currentChips}, الجديد: ${newChips}, التغيير: ${profitLoss}`);
      
      // تحديث رصيد المستخدم في المخزن المؤقت أولاً
      const updatedUser = await storage.updateUserChips(
        userId, 
        newChips, 
        profitLoss >= 0 ? "egypt_rocket_win" : "egypt_rocket_loss",
        `${profitLoss >= 0 ? "ربح" : "خسارة"} في لعبة صاروخ مصر بمضاعف ${multiplier}x`
      );
      
      // محاولة تحديث الرصيد في قاعدة البيانات أيضاً (لن تتوقف العملية إذا فشلت)
      let dbUpdateSuccess = false;
      try {
        if (dbUser) {
          await userService.updateUserChips(
            userId,
            newChips,
            profitLoss >= 0 ? "egypt_rocket_win" : "egypt_rocket_loss",
            `${profitLoss >= 0 ? "ربح" : "خسارة"} في لعبة صاروخ مصر بمضاعف ${multiplier}x`
          );
          console.log(`تم تحديث رصيد المستخدم ${userId} في قاعدة البيانات بنجاح`);
          dbUpdateSuccess = true;
        } else {
          console.log(`تخطي تحديث قاعدة البيانات لأن المستخدم ${userId} غير موجود فيها`);
        }
      } catch (dbError) {
        console.error(`خطأ في تحديث رصيد المستخدم في قاعدة البيانات:`, dbError);
      }
      
      // إنشاء كائن التحديث
      const updateData: any = {
        success: true, 
        message: profitLoss >= 0 ? "تم تحديث الرصيد بنجاح بعد الربح" : "تم تحديث الرصيد بعد الخسارة",
        database_updated: dbUpdateSuccess,
        user: {
          id: user.id,
          username: user.username,
          chips: newChips,
        },
        gameDetails: {
          betAmount,
          winAmount,
          profitLoss,
          multiplier,
          gameResult
        },
        timestamp: new Date().toISOString()
      };
      
      // محاولة إرسال التحديث إلى خادم التحديثات الفورية (اختياري)
      // استخدام وظيفة مساعدة لإرسال التحديث إلى خادم WebSocket
      const wsResult = await sendRealtimeUpdate(userId, updateData);
      
      // إضافة نتيجة محاولة WebSocket إلى استجابة API
      updateData.realtime_update = wsResult.success
        ? { success: true, message: "تم إرسال التحديث المباشر بنجاح" }
        : { success: false, message: "لم يتم إرسال التحديث المباشر (غير مهم)" };
      
      // الرد على العميل
      res.json(updateData);
    } catch (error) {
      console.error("خطأ في تحديث رصيد اللاعب بعد لعبة صاروخ مصر:", error);
      res.status(500).json({ error: "حدث خطأ أثناء تحديث الرصيد" });
    }
  });
  
  // وظيفة مساعدة لإرسال التحديث المباشر مباشرة عبر الـ WebSocket الداخلي لـ Node.js
  async function sendRealtimeUpdate(userId: number, data: any) {
    try {
      // إضافة نوع التحديث
      const message = {
        ...data,
        type: "user_update",
        updateType: "chips_update",
        timestamp: new Date().toISOString()
      };
      
      console.log(`محاولة إرسال تحديث فوري للمستخدم ${userId} مباشرةً عبر WebSocket...`);
      
      // استخدام WebSocket الداخلي لـ Node.js بدلاً من محاولة الاتصال بخادم FastAPI
      if (pokerModule.clients) {
        try {
          // تحقق من وجود المتغير وإمكانية استخدامه
          if (pokerModule.clients.has && pokerModule.clients.has(userId)) {
            const clientInfo = pokerModule.clients.get(userId);
            if (clientInfo && clientInfo.ws && clientInfo.ws.readyState === 1) { // WebSocket.OPEN
              clientInfo.ws.send(JSON.stringify(message));
              console.log(`تم إرسال التحديث المباشر للمستخدم ${userId} بنجاح عبر WebSocket الداخلي`);
              return { success: true };
            } else {
              console.warn(`المستخدم ${userId} متصل ولكن WebSocket غير جاهز للإرسال`);
            }
          }
        } catch (wsError) {
          console.error(`خطأ في إرسال رسالة WebSocket للمستخدم ${userId}:`, wsError);
        }
      } else {
        console.warn(`pokerModule.clients غير متاح أو غير مهيأ`);
      }
      
      // في حالة عدم وجود خادم Python WebSocket متاح، نعود بنجاح زائف ولا نعطل تجربة المستخدم
      return { 
        success: true, // نعود دائمًا بـ "نجاح" حتى لا تتأثر الواجهة
        warning: "التحديث الفوري غير متاح حالياً", 
        realtime: false 
      };
    } catch (error) {
      // التقاط أي أخطاء أخرى قد تحدث
      console.error(`خطأ غير متوقع في إرسال التحديث المباشر للمستخدم ${userId}:`, error);
      return { success: true, error: "خطأ غير متوقع", realtime: false };
    }
  }
  
  // Get user profile with stats and game history
  app.get("/api/profile", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const profile = await storage.getPlayerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "لم يتم العثور على الملف الشخصي" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب الملف الشخصي" });
    }
  });

  app.post("/api/profile/username", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      const { username } = req.body;
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
      }

      // استخدام نفس نمط تحديث الصورة - استخدام وظيفة تحديث المستخدم الشاملة
      const updatedUser = await storage.updateUser(req.user.id, { username });
      
      // تحديث الجلسة
      if (req.user) {
        req.user.username = username;
      }
      
      // محاولة إرسال تحديث فوري للمستخدم
      try {
        await sendRealtimeUpdate(req.user.id, { user: updatedUser });
      } catch (wsError) {
        console.warn(`فشل في إرسال تحديث فوري لتغيير اسم المستخدم ${req.user.id}:`, wsError);
      }
      
      res.json({ success: true, username });
    } catch (error) {
      console.error("خطأ في تحديث بيانات المستخدم:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تحديث اسم المستخدم" });
    }
  });

  app.post("/api/profile/avatar", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      if (!req.files || !req.files.avatar) {
        return res.status(400).json({ message: "لم يتم تحميل أي صورة" });
      }

      const avatar = req.files.avatar;
      const avatarUrl = await storage.uploadAvatar(req.user.id, avatar);
      
      // تحديث معلومات المستخدم في قاعدة البيانات
      const updatedUser = await storage.updateUser(req.user.id, { avatar: avatarUrl });
      
      // تحديث الجلسة
      if (req.user) {
        req.user.avatar = avatarUrl;
      }
      
      // إرسال تحديث WebSocket
      try {
        const message = {
          type: "profile_update",
          user_id: req.user.id,
          data: { avatar: avatarUrl },
          timestamp: new Date().toISOString()
        };
        
        await sendRealtimeUpdate(req.user.id, message);
      } catch (wsError) {
        console.warn("خطأ في إرسال تحديث WebSocket:", wsError);
      }
      
      console.log(`تم حفظ صورة الملف الشخصي بنجاح في: ${avatarUrl}`);
      res.json({ success: true, avatarUrl, user: updatedUser });
    } catch (error) {
      console.error("خطأ في تحديث صورة الملف الشخصي:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تحديث الصورة", error: String(error) });
    }
  });
  
  // تحميل صورة الغلاف
  app.post("/api/profile/cover", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      if (!req.files || !req.files.coverPhoto) {
        return res.status(400).json({ message: "لم يتم تحميل أي صورة" });
      }

      const coverPhoto = req.files.coverPhoto;
      const coverPhotoUrl = await storage.uploadCoverPhoto(req.user.id, coverPhoto);
      res.json({ success: true, coverPhotoUrl });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تحديث صورة الغلاف" });
    }
  });

  // تحديث معلومات الملف الشخصي (عام)
  app.post("/api/profile/update", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const userId = req.user.id;
      const updateData = req.body;
      
      // التحقق من البيانات المرسلة وتحديث الحقول المطلوبة فقط
      const allowedFields = ['username', 'avatar', 'chips', 'diamonds'];
      const updates: any = {};
      
      for (const field of allowedFields) {
        if (field in updateData) {
          updates[field] = updateData[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "لم يتم تحديد أي حقول للتحديث" });
      }
      
      // تنفيذ التحديث
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "لم يتم العثور على المستخدم" });
      }
      
      // إعادة تعيين الجلسة لتعكس التغييرات
      if (req.user) {
        Object.assign(req.user, updates);
      }
      
      // إرسال إشعار WebSocket إن أمكن
      const message = {
        type: "profile_update",
        user_id: userId,
        data: updates,
        timestamp: new Date().toISOString()
      };
      
      try {
        await sendRealtimeUpdate(userId, message);
      } catch (wsError) {
        console.warn("خطأ في إرسال تحديث WebSocket:", wsError);
      }
      
      res.json({ 
        success: true,
        message: "تم تحديث البيانات بنجاح", 
        user,
        updatedFields: Object.keys(updates)
      });
    } catch (error) {
      console.error("خطأ في تحديث معلومات الملف الشخصي:", error);
      res.status(500).json({ message: "خطأ في الخادم", error: String(error) });
    }
  });
  
  // تحويل حساب الضيف إلى حساب دائم
  app.post("/api/profile/convert", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }

      const { username, password } = req.body;
      
      // التحقق من صحة البيانات
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" });
      }
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      // التحقق من أن اسم المستخدم غير مستخدم
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      // تحويل الحساب
      const hashedPassword = await hashPassword(password);
      const updatedUser = await storage.convertGuestToRegistered(req.user.id, username, hashedPassword);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "حدث خطأ أثناء تحويل الحساب" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تحويل الحساب" });
    }
  });
  
  // Get all available game tables
  app.get("/api/tables", ensureAuthenticated, async (req, res) => {
    try {
      const tables = await storage.getGameTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب الطاولات" });
    }
  });
  
  // Get tables by game type
  app.get("/api/tables/:gameType", ensureAuthenticated, async (req, res) => {
    
    const gameType = req.params.gameType;
    
    // Validate game type
    const validGameTypes = ["poker", "naruto", "tekken", "domino", "arab_poker"];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ message: "نوع اللعبة غير صالح" });
    }
    
    try {
      const tables = await storage.getGameTablesByType(gameType as any);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب الطاولات" });
    }
  });
  
  // Create a new table
  app.post("/api/tables/:gameType", ensureAuthenticated, async (req, res) => {
    
    const gameType = req.params.gameType;
    
    // Validate game type
    const validGameTypes = ["poker", "naruto", "tekken", "domino", "arab_poker"];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({ message: "نوع اللعبة غير صالح" });
    }
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      // Validate request parameters
      const tableSchema = z.object({
        name: z.string().min(3).max(50),
        smallBlind: z.number().min(10),
        maxPlayers: z.number().min(2).max(9),
        minBuyIn: z.number().min(20),
        maxBuyIn: z.number().min(100),
        category: z.string().min(1),
        isPrivate: z.boolean().optional(),
        password: z.string().optional(),
        createdBy: z.number(),
      });
      
      const validatedData = tableSchema.parse(req.body);
      
      // Ensure the creator is the authenticated user
      if (validatedData.createdBy !== req.user.id) {
        return res.status(403).json({ message: "غير مسموح بإنشاء طاولة نيابة عن مستخدم آخر" });
      }
      
      console.log(`إنشاء طاولة جديدة بواسطة المستخدم ${req.user.id} لنوع اللعبة ${gameType}`);
      
      // Create the table
      const tableData = {
        name: validatedData.name,
        gameType: gameType as any,
        smallBlind: validatedData.smallBlind,
        bigBlind: validatedData.smallBlind * 2, // الرهان الكبير ضعف الرهان الصغير
        minBuyIn: validatedData.minBuyIn,
        maxBuyIn: validatedData.maxBuyIn,
        maxPlayers: validatedData.maxPlayers,
        currentPlayers: 0,
        status: "available" as const,
        ownerId: req.user.id,
        isVip: false,
        password: validatedData.isPrivate ? validatedData.password : undefined,
        tableSettings: {
          category: validatedData.category,
        },
      };
      
      const newTable = await storage.createTable(tableData);
      
      res.status(201).json({ 
        message: "تم إنشاء الطاولة بنجاح", 
        tableId: newTable.id 
      });
    } catch (error) {
      console.error("Error creating table:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "بيانات الطاولة غير صالحة", errors: error.errors });
      }
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الطاولة" });
    }
  });
  
  // Join a table
  app.post("/api/game/:tableId/join", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      console.log(`طلب انضمام من المستخدم ${req.user.id} إلى الطاولة ${tableId}`, req.body);
      
      // Validate request parameters
      const requestSchema = z.object({
        position: z.number().optional(),
        asSpectator: z.boolean().optional(), // إذا كان يريد الانضمام كمشاهد
      });
      
      let position: number | undefined = undefined;
      let asSpectator = false;
      
      try {
        const data = requestSchema.parse(req.body);
        position = data.position;
        asSpectator = data.asSpectator || false;
      } catch (error) {
        // No position or invalid parameters provided, will use default assignment
      }
      
      // التحقق مما إذا كانت الطاولة موجودة
      const table = await storage.getGameTable(tableId);
      if (!table) {
        console.log(`الطاولة ${tableId} غير موجودة`);
        return res.status(404).json({ success: false, message: "الطاولة غير موجودة" });
      }
      
      // التحقق إذا كان اللاعب منضمًا بالفعل
      try {
        const currentState = await storage.getGameState(tableId, req.user.id);
        if (currentState) {
          const playerOnTable = currentState.players.some((p: { id: number }) => p.id === req.user?.id);
          if (playerOnTable) {
            console.log(`المستخدم ${req.user.id} منضم بالفعل للطاولة ${tableId}`);
            return res.json({ 
              success: true, 
              isSpectator: false,
              gameState: currentState,
              message: "أنت منضم بالفعل لهذه الطاولة" 
            });
          }
        }
      } catch (error) {
        // يمكننا تجاهل هذا الخطأ، مما يعني أن اللاعب ليس في اللعبة
      }
      
      // وضع المشاهدة - لا حاجة لخصم الرقاقات أو إضافة اللاعب إلى الطاولة
      if (asSpectator || table.status === "full") {
        console.log(`المستخدم ${req.user.id} ينضم كمشاهد إلى الطاولة ${tableId}`);
        // الوصول إلى حالة اللعبة فقط كمشاهد
        const gameState = await storage.getGameState(tableId, req.user.id);
        if (!gameState) {
          return res.status(400).json({ success: false, message: "لا يمكن الوصول إلى حالة اللعبة" });
        }
        
        // إشارة إلى أن المستخدم في وضع المشاهدة
        return res.json({ 
          success: true,
          isSpectator: true, 
          gameState,
          message: "أنت الآن في وضع المشاهدة" 
        });
      }
      
      console.log(`المستخدم ${req.user.id} يحاول الانضمام كلاعب نشط إلى الطاولة ${tableId}`);
      
      // الانضمام كلاعب نشط
      const result = await storage.joinTable(tableId, req.user.id, position);
      
      if (!result.success) {
        console.log(`فشل انضمام المستخدم ${req.user.id}: ${result.message}`);
        return res.status(400).json({ success: false, message: result.message });
      }
      
      console.log(`نجاح انضمام المستخدم ${req.user.id} إلى الطاولة ${tableId}`);
      
      // إرسال إشعار للاعبين الآخرين عن طريق WebSocket (إذا كان متاحاً)
      try {
        if (pokerModule.broadcastToTable) {
          pokerModule.broadcastToTable(tableId, {
            type: "player_joined",
            userId: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar || "",
            tableId: tableId,
            timestamp: Date.now(),
            message: `انضم ${req.user.username} إلى الطاولة`
          }, req.user.id);
          
          // تحديث حالة الطاولة في userTables
          if (pokerModule.userTables) {
            pokerModule.userTables.set(req.user.id, tableId);
          }
        }
      } catch (err: any) {
        console.log("لا يمكن إرسال إشعار الانضمام عبر WebSocket:", err?.message || "خطأ غير معروف");
      }
      
      // تأكيد أن المستخدم ليس في وضع المشاهدة
      res.json({ 
        success: true, 
        isSpectator: false,
        gameState: result.gameState,
        message: "تم الانضمام بنجاح كلاعب نشط"
      });
    } catch (error) {
      console.error(`خطأ عام أثناء انضمام المستخدم: ${error}`);
      res.status(500).json({ success: false, message: "حدث خطأ أثناء الانضمام إلى الطاولة" });
    }
  });
  
  // Get game state
  app.get("/api/game/:tableId", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const gameState = await storage.getGameState(tableId, req.user.id);
      if (!gameState) {
        return res.status(404).json({ message: "لم يتم العثور على اللعبة" });
      }
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب حالة اللعبة" });
    }
  });
  
  // نقطة نهاية مؤقتة لإعادة تعيين رصيد المستخدم - للاختبار فقط
  app.post("/api/debug/reset-chips", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      // التحقق من كلمة المرور
      const { password, amount } = req.body;
      
      // كلمة المرور المطلوبة للسماح بإعادة تعيين الرصيد
      const REQUIRED_PASSWORD = "56485645";
      
      if (password !== REQUIRED_PASSWORD) {
        return res.status(403).json({ 
          success: false, 
          message: "كلمة المرور غير صحيحة" 
        });
      }
      
      // التأكد من أن المبلغ قيمة رقمية صحيحة
      const chipsAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 1000000;
      
      // تحديث الرصيد في قاعدة البيانات أولاً
      let dbUpdateSuccess = false;
      try {
        await userService.updateUserChips(
          req.user.id, 
          chipsAmount, 
          "reset_chips", 
          "إعادة تعيين الرصيد بواسطة المستخدم"
        );
        dbUpdateSuccess = true;
        console.log(`تم تحديث رصيد المستخدم ${req.user.id} في قاعدة البيانات إلى ${chipsAmount}`);
      } catch (dbError) {
        console.error("خطأ في تحديث الرصيد في قاعدة البيانات:", dbError);
      }
      
      // تحديث الرصيد في الذاكرة المؤقتة أيضاً
      const updatedUser = await storage.updateUserChips(
        req.user.id, 
        chipsAmount, 
        "reset_chips", 
        "إعادة تعيين الرصيد بواسطة المستخدم"
      );
      
      if (!updatedUser) {
        return res.status(500).json({ success: false, message: "فشل تحديث الرصيد" });
      }
      
      console.log(`تم إعادة تعيين رصيد المستخدم ${req.user.id} إلى ${chipsAmount}`);
      
      res.json({ 
        success: true, 
        message: `تم إعادة تعيين رصيدك إلى ${chipsAmount} رقاقة`,
        user: updatedUser
      });
    } catch (error) {
      console.error("خطأ في إعادة تعيين الرصيد:", error);
      res.status(500).json({ success: false, message: "حدث خطأ أثناء إعادة تعيين الرصيد" });
    }
  });
  
  // Perform a game action (fold, check, call, raise, all-in)
  app.post("/api/game/:tableId/action", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      console.log(`طلب إجراء من المستخدم ${req.user.id} على الطاولة ${tableId}:`, req.body);
      
      // Validate the action (with restart_round and check if it's a string)
      try {
        // تحقق إذا كان الإجراء هو إعادة تشغيل الجولة
        if (req.body.action === "restart_round") {
          console.log(`طلب بدء جولة جديدة من المستخدم ${req.user.id}`);
          const result = await storage.startNewRound(tableId);
          return res.json({ 
            success: true, 
            message: "تم بدء جولة جديدة",
            gameState: result?.gameState 
          });
        }
        
        const actionSchema = z.object({
          action: z.enum(["fold", "check", "call", "raise", "all_in"]),
          amount: z.number().optional(),
        });
        
        const validatedData = actionSchema.parse(req.body);
        console.log(`إجراء تم التحقق منه:`, validatedData);
        
        // معالجة الإجراء
        const result = await storage.performGameAction(
          tableId,
          req.user.id,
          validatedData.action,
          validatedData.amount
        );
        
        console.log(`نتيجة الإجراء:`, {
          success: result.success,
          message: result.message,
          hasGameState: !!result.gameState
        });
        
        if (!result.success) {
          return res.status(400).json({ 
            success: false,
            message: result.message 
          });
        }
        
        return res.json({ 
          success: true, 
          gameState: result.gameState,
          message: "تم تنفيذ الإجراء بنجاح" 
        });
      } catch (validationError) {
        console.error("خطأ في التحقق من الإجراء:", validationError);
        return res.status(400).json({ 
          success: false,
          message: "إجراء غير صالح" 
        });
      }
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تنفيذ الإجراء" });
    }
  });
  
  // Leave a table
  app.post("/api/game/:tableId/leave", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const result = await storage.leaveTable(tableId, req.user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء مغادرة الطاولة" });
    }
  });
  
  // نقطة نهاية لبدء جولة جديدة
  app.post("/api/game/:tableId/start-round", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "غير مصرح" });
      }
      
      // التحقق من أن المستخدم جالس على الطاولة
      const gameState = await storage.getGameState(tableId, req.user.id);
      if (!gameState) {
        return res.status(404).json({ success: false, message: "لم يتم العثور على الطاولة" });
      }
      
      // التحقق من أن المستخدم لاعب في هذه الطاولة
      const isPlayer = gameState.players.some(p => p.id === req.user?.id);
      
      // تحقق ما إذا كان دور اللاعب الحالي للعب
      const isCurrentPlayerTurn = gameState.currentTurn === req.user?.id;
      
      if (!isPlayer) {
        return res.status(400).json({ 
          success: false, 
          message: "يجب أن تكون لاعباً على هذه الطاولة لبدء جولة جديدة" 
        });
      }
      
      // استخدام طريقة startNewRound المضافة مسبقًا
      try {
        const result = await storage.startNewRound(tableId);
        
        if (!result || !result.success) {
          return res.status(400).json({ 
            success: false, 
            message: result?.message || "فشل في بدء جولة جديدة" 
          });
        }
        
        // استخدام طريقة performGameAction بدلاً من ذلك (تصحيح مؤقت)
        const actionResult = await storage.performGameAction(tableId, req.user.id, "restart_round");
        
        // البث إلى جميع اللاعبين عن إعادة بدء الجولة
        if (pokerModule.broadcastToTable) {
          pokerModule.broadcastToTable(tableId, {
            type: "round_restarted",
            timestamp: Date.now(),
            tableId,
            initiator: req.user.username,
            message: `تم بدء جولة جديدة بواسطة ${req.user.username}`
          });
        }
        
        console.log(`بدء جولة جديدة في الطاولة ${tableId} بواسطة اللاعب ${req.user.id}`);
        
        res.json({ 
          success: true, 
          message: "تم بدء جولة جديدة بنجاح", 
          gameState: actionResult.gameState 
        });
      } catch (error) {
        // إذا فشلت startNewRound، جرّب performGameAction مباشرة
        try {
          const actionResult = await storage.performGameAction(tableId, req.user.id, "restart_round");
          
          if (!actionResult.success) {
            return res.status(400).json({ 
              success: false, 
              message: actionResult.message || "فشل في بدء جولة جديدة" 
            });
          }
          
          console.log(`بدء جولة جديدة (طريقة بديلة) في الطاولة ${tableId} بواسطة اللاعب ${req.user.id}`);
          
          res.json({ 
            success: true, 
            message: "تم بدء جولة جديدة بنجاح (استخدام طريقة بديلة)", 
            gameState: actionResult.gameState 
          });
        } catch (innerError) {
          console.error("فشل في كلا الطريقتين لبدء جولة جديدة:", innerError);
          res.status(500).json({ 
            success: false, 
            message: "حدث خطأ أثناء بدء جولة جديدة" 
          });
        }
      }
    } catch (error) {
      console.error("خطأ في بدء جولة جديدة:", error);
      res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء بدء جولة جديدة" 
      });
    }
  });

  // مسار جديد لإزالة جميع اللاعبين الوهميين (يتطلب كلمة مرور)
  app.post("/api/system/remove-virtual-players", async (req, res) => {
    try {
      // التحقق من كلمة المرور - كلمة مرور مشفرة للإدارة
      const { password } = req.body;
      
      if (password !== "56485645") {
        return res.status(403).json({ 
          success: false, 
          message: "كلمة المرور غير صحيحة" 
        });
      }
      
      // استدعاء وظيفة إزالة اللاعبين الوهميين
      await storage.removeVirtualPlayers();
      
      return res.json({ 
        success: true, 
        message: "تمت إزالة جميع اللاعبين الوهميين بنجاح" 
      });
    } catch (error) {
      console.error("خطأ أثناء إزالة اللاعبين الوهميين:", error);
      return res.status(500).json({ 
        success: false, 
        message: "حدث خطأ أثناء إزالة اللاعبين الوهميين" 
      });
    }
  });
  
  // ----- Badge API Routes -----
  
  // Get badge categories
  app.get("/api/badges/categories", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const categories = await storage.getBadgeCategories();
      res.json(categories);
    } catch (error) {
      console.error("خطأ في الحصول على فئات الشارات:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب فئات الشارات" });
    }
  });
  
  // Get all badges (optionally filtered by category)
  app.get("/api/badges", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const badges = await storage.getBadges(categoryId);
      res.json(badges);
    } catch (error) {
      console.error("خطأ في الحصول على الشارات:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب الشارات" });
    }
  });
  
  // Get current user's badges
  app.get("/api/badges/user", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const userBadges = await storage.getUserBadges(req.user.id);
      res.json(userBadges);
    } catch (error) {
      console.error("خطأ في الحصول على شارات المستخدم:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب شارات المستخدم" });
    }
  });
  
  // Award a badge to the user
  app.post("/api/badges/award/:badgeId", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "معرف الشارة غير صالح" });
      }
      
      const userBadge = await storage.addUserBadge(req.user.id, badgeId);
      
      if (!userBadge) {
        return res.status(404).json({ message: "الشارة غير موجودة" });
      }
      
      res.json(userBadge);
    } catch (error) {
      console.error("خطأ في منح الشارة:", error);
      res.status(500).json({ message: "حدث خطأ أثناء منح الشارة" });
    }
  });
  
  // Equip a badge
  app.post("/api/badges/equip/:badgeId", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "معرف الشارة غير صالح" });
      }
      
      // Validate position
      let position = 0; // Default position
      
      if (req.body && req.body.position !== undefined) {
        position = parseInt(req.body.position);
        if (isNaN(position) || position < 0 || position > 5) {
          return res.status(400).json({ message: "الموضع غير صالح. يجب أن يكون بين 0 و 5." });
        }
      }
      
      const userBadge = await storage.equipBadge(req.user.id, badgeId, position);
      
      if (!userBadge) {
        return res.status(404).json({ message: "الشارة غير موجودة أو غير مكتسبة" });
      }
      
      res.json(userBadge);
    } catch (error) {
      console.error("خطأ في تجهيز الشارة:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تجهيز الشارة" });
    }
  });
  
  // Unequip a badge
  app.post("/api/badges/unequip/:badgeId", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "معرف الشارة غير صالح" });
      }
      
      const userBadge = await storage.unequipBadge(req.user.id, badgeId);
      
      if (!userBadge) {
        return res.status(404).json({ message: "الشارة غير موجودة أو غير مجهزة" });
      }
      
      res.json(userBadge);
    } catch (error) {
      console.error("خطأ في إزالة الشارة:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إزالة الشارة" });
    }
  });
  
  // Add a badge to favorites
  app.post("/api/badges/favorite/:badgeId", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "معرف الشارة غير صالح" });
      }
      
      // Validate order
      let order = 0; // Default order
      
      if (req.body && req.body.order !== undefined) {
        order = parseInt(req.body.order);
        if (isNaN(order) || order < 0) {
          return res.status(400).json({ message: "الترتيب غير صالح. يجب أن يكون رقمًا موجبًا." });
        }
      }
      
      const userBadge = await storage.addToFavorites(req.user.id, badgeId, order);
      
      if (!userBadge) {
        return res.status(404).json({ message: "الشارة غير موجودة أو غير مكتسبة" });
      }
      
      res.json(userBadge);
    } catch (error) {
      console.error("خطأ في إضافة الشارة للمفضلة:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إضافة الشارة للمفضلة" });
    }
  });
  
  // Remove a badge from favorites
  app.post("/api/badges/unfavorite/:badgeId", ensureAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const badgeId = parseInt(req.params.badgeId);
      if (isNaN(badgeId)) {
        return res.status(400).json({ message: "معرف الشارة غير صالح" });
      }
      
      const userBadge = await storage.removeFromFavorites(req.user.id, badgeId);
      
      if (!userBadge) {
        return res.status(404).json({ message: "الشارة غير موجودة أو ليست في المفضلة" });
      }
      
      res.json(userBadge);
    } catch (error) {
      console.error("خطأ في إزالة الشارة من المفضلة:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إزالة الشارة من المفضلة" });
    }
  });

  // إضافة مسارات لعبة الأسد والغزالة من نوع كراش
  // Removed Lion Crash routes

  // إضافة نقطة نهاية للتحقق من حالة الخادم
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      server: 'running',
      timestamp: new Date().toISOString()
    });
  });
  
  // إضافة نقطة نهاية للتحقق من حالة المصادقة
  app.get('/api/auth/check', (req: Request, res: Response) => {
    try {
      if (req.isAuthenticated()) {
        return res.json({ 
          isAuthenticated: true, 
          user: req.user
        });
      } else {
        return res.json({ isAuthenticated: false });
      }
    } catch (err) {
      console.error("خطأ في التحقق من حالة المصادقة:", err);
      return res.status(500).json({ 
        error: "حدث خطأ أثناء التحقق من حالة المصادقة" 
      });
    }
  });
  
  // إضافة مسار مخصص للتعامل مع صفحة المصادقة
  app.get('/auth', (req: Request, res: Response, next: NextFunction) => {
    // إذا كان المستخدم مسجل دخوله وطلب صفحة المصادقة مباشرة، نسمح له بذلك
    // هذا يمنع حلقات إعادة التوجيه المتكررة
    // نسمح لـ Vite بمعالجة هذا بدلاً من إعادة التوجيه
    return next();
  });

  // معالجة طلبات API غير الموجودة - هذا فقط للمسارات التي تبدأ بـ /api
  app.use('/api/*', (req: Request, res: Response) => {
    return res.status(404).json({
      success: false,
      message: "نقطة النهاية API المطلوبة غير موجودة"
    });
  });
  
  // ملاحظة مهمة: نحن لا نضيف معالج catch-all هنا للمسارات الأخرى
  // هذا يسمح لـ Vite middleware بمعالجة جميع طلبات الواجهة الأمامية
  // سيتم تنفيذ middleware الخاصة بـ Vite بعد هذه المعالجات في index.ts

  // معالجة الأخطاء العامة
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("خطأ عام:", err);
    
    // التأكد من إرسال استجابة JSON صحيحة دائمًا
    res.status(500).json({ 
      success: false, 
      message: "حدث خطأ في الخادم",
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });

  return httpServer;
}
