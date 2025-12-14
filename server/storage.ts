import { type User, type SafeUser, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<User>;
  createOAuthUser(data: { email: string; name: string; googleId?: string; facebookId?: string; authProvider: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  linkWallet(userId: string, walletAddress: string): Promise<User | undefined>;
  linkOAuthProvider(userId: string, provider: 'google' | 'facebook', providerId: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      email: userData.email.toLowerCase(),
    }).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async linkWallet(userId: string, walletAddress: string): Promise<User | undefined> {
    return this.updateUser(userId, { walletAddress });
  }

  async createOAuthUser(data: { email: string; name: string; googleId?: string; facebookId?: string; authProvider: string }): Promise<User> {
    const [user] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: null,
      googleId: data.googleId || null,
      facebookId: data.facebookId || null,
      authProvider: data.authProvider,
      location: null,
      dietaryPreference: null,
      walletAddress: null,
      currentChallengeId: null,
      challengeStartDate: null,
      challengeDay: 0,
      totalTokens: 100,
    }).returning();
    return user;
  }

  async linkOAuthProvider(userId: string, provider: 'google' | 'facebook', providerId: string): Promise<User | undefined> {
    if (provider === 'google') {
      return this.updateUser(userId, { googleId: providerId });
    } else {
      return this.updateUser(userId, { facebookId: providerId });
    }
  }
}

export const storage = new DatabaseStorage();

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
