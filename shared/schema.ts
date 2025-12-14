import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  dietaryPreference: text("dietary_preference"),
  walletAddress: text("wallet_address"),
  currentChallengeId: text("current_challenge_id"),
  challengeStartDate: timestamp("challenge_start_date"),
  challengeDay: integer("challenge_day").default(0),
  totalTokens: integer("total_tokens").default(100),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  location: true,
  dietaryPreference: true,
}).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email no válido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;

export type SafeUser = Omit<User, 'passwordHash'>;
