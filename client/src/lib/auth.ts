import { apiRequest } from "./queryClient";
import type { SafeUser } from "@shared/schema";

const TOKEN_KEY = "veg21_auth_token";

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  location?: string;
  dietaryPreference?: string;
}): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", data);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Error al registrar");
  }
  setStoredToken(result.token);
  return result;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", data);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Error al iniciar sesión");
  }
  setStoredToken(result.token);
  return result;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = getStoredToken();
  if (!token) return null;
  
  try {
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      if (response.status === 401) {
        removeStoredToken();
        return null;
      }
      throw new Error("Error al obtener usuario");
    }
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function updateUser(updates: Partial<SafeUser>): Promise<SafeUser> {
  const token = getStoredToken();
  const response = await fetch("/api/auth/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Error al actualizar");
  }
  return result.user;
}

export async function linkWallet(walletAddress: string): Promise<SafeUser> {
  const token = getStoredToken();
  const response = await fetch("/api/auth/link-wallet", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ walletAddress })
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Error al vincular wallet");
  }
  return result.user;
}

export function logoutUser(): void {
  removeStoredToken();
}
