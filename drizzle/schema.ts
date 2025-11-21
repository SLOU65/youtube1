import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * YouTube API keys table
 * Stores encrypted API keys for each user
 */
export const youtubeApiKeys = mysqlTable("youtube_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Encrypted API key using AES-256 */
  encryptedApiKey: text("encryptedApiKey").notNull(),
  /** Initialization vector for AES encryption */
  iv: varchar("iv", { length: 32 }).notNull(),
  /** Whether the API key is currently active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Last time the API key was validated */
  lastValidated: timestamp("lastValidated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type YoutubeApiKey = typeof youtubeApiKeys.$inferSelect;
export type InsertYoutubeApiKey = typeof youtubeApiKeys.$inferInsert;

/**
 * User preferences table
 * Stores user settings like language preference
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Language preference: 'ru' or 'en' */
  language: mysqlEnum("language", ["ru", "en"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
