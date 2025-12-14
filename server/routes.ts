import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, toSafeUser } from "./storage";
import { hashPassword, verifyPassword, generateToken, verifyToken, extractTokenFromHeader } from "./auth";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
  
  req.userId = decoded.userId;
  next();
}

function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.userId;
    }
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Este email ya está registrado" });
      }
      
      const passwordHash = await hashPassword(validatedData.password);
      
      const user = await storage.createUser({
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
        location: validatedData.location || null,
        dietaryPreference: validatedData.dietaryPreference || null,
        walletAddress: null,
        currentChallengeId: null,
        challengeStartDate: null,
        challengeDay: 0,
        totalTokens: 100,
      });
      
      const token = generateToken(user);
      
      res.status(201).json({
        user: toSafeUser(user),
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: error.errors 
        });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
      }
      
      const isValid = await verifyPassword(validatedData.password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
      }
      
      const token = generateToken(user);
      
      res.json({
        user: toSafeUser(user),
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ user: toSafeUser(user) });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  });

  app.patch("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const updates: Record<string, any> = {};
      
      if (req.body.name) updates.name = req.body.name;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.dietaryPreference !== undefined) updates.dietaryPreference = req.body.dietaryPreference;
      if (req.body.currentChallengeId !== undefined) updates.currentChallengeId = req.body.currentChallengeId;
      if (req.body.challengeStartDate !== undefined) updates.challengeStartDate = new Date(req.body.challengeStartDate);
      if (req.body.challengeDay !== undefined) updates.challengeDay = req.body.challengeDay;
      if (req.body.totalTokens !== undefined) updates.totalTokens = req.body.totalTokens;
      
      const user = await storage.updateUser(req.userId!, updates);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ user: toSafeUser(user) });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
    }
  });

  app.post("/api/auth/link-wallet", authMiddleware, async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address requerida" });
      }
      
      const user = await storage.linkWallet(req.userId!, walletAddress);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ user: toSafeUser(user) });
    } catch (error) {
      console.error("Link wallet error:", error);
      res.status(500).json({ error: "Error al vincular wallet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
