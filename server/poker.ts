import { Express } from "express";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

// Set up WebSocket server for real-time game updates
export function setupPokerGame(app: Express, httpServer: Server) {
  // Create WebSocket server with proper configuration
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws", // Specify explicit path for WebSocket connections
    perMessageDeflate: false // Disable compression to avoid some connection issues
  });

  // Broadcast message to all connected clients
  const broadcast = (message: any, excludeUserId?: number) => {
    clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };
  
  // Map to track active connections by user ID
  const clients = new Map<number, WebSocket>();
  
  // Map to track which tables users are connected to
  const userTables = new Map<number, number>();
  
  wss.on("connection", (ws: WebSocket, req: any) => {
    let userId: number | undefined;
    
    // Parse session cookie to get user ID (simplified version)
    const cookieString = req.headers.cookie;
    if (cookieString) {
      // In a real implementation, we would use the session middleware to validate the user
      // For now, we'll expect the client to send their user ID in a message
    }
    
    ws.on("message", async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "auth") {
          // Authenticate user
          const user = await storage.getUser(data.userId);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          userId = user.id;
          clients.set(userId, ws);
          
        } else if (data.type === "chat_message" && userId) {
          // Handle chat messages
          const messageId = Date.now().toString();
          const user = await storage.getUser(userId);
          
          if (user) {
            const chatMessage = {
              type: "chat_message",
              id: messageId,
              username: user.username,
              message: data.message,
              timestamp: Date.now()
            };
            
            // Broadcast to all connected clients
            broadcast(chatMessage);
          }et(userId, ws);
          
          ws.send(JSON.stringify({ type: "auth", success: true }));
        } else if (data.type === "join_table") {
          // User joining a table
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = data.tableId;
          userTables.set(userId, tableId);
          
          // Notify other players at the table
          broadcastToTable(tableId, {
            type: "player_joined",
            userId: userId,
            tableId: tableId
          }, userId);
          
          // Send initial game state
          const gameState = await storage.getGameState(tableId, userId);
          ws.send(JSON.stringify({ 
            type: "game_state", 
            gameState 
          }));
        } else if (data.type === "leave_table") {
          // User leaving a table
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (tableId) {
            userTables.delete(userId);
            
            // Notify other players at the table
            broadcastToTable(tableId, {
              type: "player_left",
              userId: userId,
              tableId: tableId
            }, userId);
          }
        } else if (data.type === "game_action") {
          // User making a game action
          if (!userId) {
            ws.send(JSON.stringify({ type: "error", message: "مستخدم غير مصرح به" }));
            return;
          }
          
          const tableId = userTables.get(userId);
          if (!tableId) {
            ws.send(JSON.stringify({ type: "error", message: "أنت لست في طاولة" }));
            return;
          }
          
          // Perform the action
          const result = await storage.performGameAction(
            tableId,
            userId,
            data.action,
            data.amount
          );
          
          if (!result.success) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: result.message 
            }));
            return;
          }
          
          // Send updated game state to all players at the table
          const players = getPlayersAtTable(tableId);
          for (const playerId of players) {
            const playerWs = clients.get(playerId);
            if (playerWs && playerWs.readyState === 1) { // WebSocket.OPEN = 1
              const gameState = await storage.getGameState(tableId, playerId);
              playerWs.send(JSON.stringify({ 
                type: "game_state", 
                gameState 
              }));
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "حدث خطأ أثناء معالجة الرسالة" 
        }));
      }
    });
    
    ws.on("close", () => {
      if (userId) {
        clients.delete(userId);
        
        const tableId = userTables.get(userId);
        if (tableId) {
          userTables.delete(userId);
          
          // Notify other players at the table
          broadcastToTable(tableId, {
            type: "player_disconnected",
            userId: userId,
            tableId: tableId
          }, userId);
        }
      }
    });
  });
  
  // Broadcast message to all users at a table except the sender
  function broadcastToTable(tableId: number, message: any, excludeUserId?: number) {
    const players = getPlayersAtTable(tableId);
    
    for (const playerId of players) {
      if (excludeUserId && playerId === excludeUserId) continue;
      
      const ws = clients.get(playerId);
      if (ws && ws.readyState === 1) { // WebSocket.OPEN = 1
        ws.send(JSON.stringify(message));
      }
    }
  }
  
  // Get all players at a table
  function getPlayersAtTable(tableId: number): number[] {
    const players: number[] = [];
    
    // Use forEach to iterate the map instead of entries()
    userTables.forEach((userTableId, userId) => {
      if (userTableId === tableId) {
        players.push(userId);
      }
    });
    
    return players;
  }
}
