import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { 
  getCurrentUser, 
  loginUser, 
  registerUser, 
  logoutUser as authLogout,
  updateUser,
  linkWallet as authLinkWallet,
  getStoredToken
} from "@/lib/auth";
import type { SafeUser } from "@shared/schema";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; location?: string; dietaryPreference?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<SafeUser>) => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const authError = urlParams.get('auth_error');
    
    if (tokenFromUrl) {
      import("@/lib/auth").then(({ setStoredToken }) => {
        setStoredToken(tokenFromUrl);
        window.history.replaceState({}, '', window.location.pathname);
        refreshUser().finally(() => setIsLoading(false));
      });
      return;
    }
    
    if (authError) {
      window.history.replaceState({}, '', window.location.pathname);
      console.error("OAuth error:", authError);
    }
    
    const token = getStoredToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser({ email, password });
    setUser(result.user);
  }, []);

  const register = useCallback(async (data: { 
    email: string; 
    password: string; 
    name: string; 
    location?: string; 
    dietaryPreference?: string 
  }) => {
    const result = await registerUser(data);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<SafeUser>) => {
    const updatedUser = await updateUser(updates);
    setUser(updatedUser);
  }, []);

  const walletLink = useCallback(async (walletAddress: string) => {
    const updatedUser = await authLinkWallet(walletAddress);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        linkWallet: walletLink,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
