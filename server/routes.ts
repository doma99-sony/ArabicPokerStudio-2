import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { setupPokerGame } from "./poker";
import { z } from "zod";
import fileUpload from "express-fileupload";

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

      await storage.updateUsername(req.user.id, username);
      res.json({ success: true });
    } catch (error) {
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
      res.json({ success: true, avatarUrl });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء تحديث الصورة" });
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
    const validGameTypes = ["poker", "naruto", "tekken", "domino"];
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
          const playerOnTable = currentState.players.some(p => p.id === req.user?.id);
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
  
  // Perform a game action (fold, check, call, raise, all-in)
  app.post("/api/game/:tableId/action", ensureAuthenticated, async (req, res) => {
    const tableId = parseInt(req.params.tableId);
    
    try {
      if (!req.user) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      // Validate the action
      const actionSchema = z.object({
        action: z.enum(["fold", "check", "call", "raise", "allIn"]),
        amount: z.number().optional(),
      });
      
      const validatedData = actionSchema.parse(req.body);
      const result = await storage.performGameAction(
        tableId,
        req.user.id,
        validatedData.action,
        validatedData.amount
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ success: true, gameState: result.gameState });
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

  return httpServer;
}
