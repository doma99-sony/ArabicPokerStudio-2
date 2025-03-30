import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupPokerGame } from "./poker";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up poker game routes and WebSocket server
  const httpServer = createServer(app);
  setupPokerGame(app, httpServer);
  
  // API endpoints
  
  // Get user profile with stats and game history
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
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
  app.get("/api/tables", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tables = await storage.getGameTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء جلب الطاولات" });
    }
  });
  
  // Join a table
  app.post("/api/game/:tableId/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tableId = parseInt(req.params.tableId);
    
    try {
      const result = await storage.joinTable(tableId, req.user.id);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ success: true, gameState: result.gameState });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ أثناء الانضمام إلى الطاولة" });
    }
  });
  
  // Get game state
  app.get("/api/game/:tableId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tableId = parseInt(req.params.tableId);
    
    try {
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
  app.post("/api/game/:tableId/action", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tableId = parseInt(req.params.tableId);
    
    // Validate the action
    const actionSchema = z.object({
      action: z.enum(["fold", "check", "call", "raise", "allIn"]),
      amount: z.number().optional(),
    });
    
    try {
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
  app.post("/api/game/:tableId/leave", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tableId = parseInt(req.params.tableId);
    
    try {
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
