import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  chips: integer("chips").default(5000).notNull(),
  avatar: text("avatar"),
  userCode: text("user_code"), // معرف المستخدم المكون من 5 أرقام
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  chips: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const gameHistory = pgTable("game_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tableId: integer("table_id").notNull(),
  date: text("date").notNull(),
  result: text("result").notNull(),
  chipsChange: integer("chips_change").notNull(),
});

export const gameTables = pgTable("game_tables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  smallBlind: integer("small_blind").notNull(),
  bigBlind: integer("big_blind").notNull(),
  minBuyIn: integer("min_buy_in").notNull(),
  maxPlayers: integer("max_players").notNull().default(9),
  currentPlayers: integer("current_players").notNull().default(0),
  status: text("status").notNull().default("available"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: text("achievement_id").notNull(),
  unlocked: boolean("unlocked").notNull().default(false),
  unlockedDate: text("unlocked_date"),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  highestWin: integer("highest_win").notNull().default(0),
  winRate: integer("win_rate").notNull().default(0),
  joinDate: text("join_date").notNull(),
});
