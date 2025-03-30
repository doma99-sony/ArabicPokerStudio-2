import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupPokerGame } from "./poker";
import { z } from "zod";

// ميدلوير للتحقق من المصادقة
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى هذا المورد" });
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
      
      // Validate position if provided
      const positionSchema = z.object({
        position: z.number().optional(),
      });
      
      let position: number | undefined = undefined;
      
      try {
        const data = positionSchema.parse(req.body);
        position = data.position;
      } catch (error) {
        // No position or invalid position provided, will use default assignment
      }
      
      const result = await storage.joinTable(tableId, req.user.id, position);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ success: true, gameState: result.gameState });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء الانضمام إلى الطاولة" });
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
