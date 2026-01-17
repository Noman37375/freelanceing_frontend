// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { storageGet, storageSet, storageRemove } from "@/utils/storage";
import authService, { User as AuthUser } from "@/services/authService";

interface User {
  id: string;
  userName: string;
  email: string;
  role?: 'Admin' | 'Client' | 'Freelancer';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  phone?: string;
  languages?: any[];
  education?: string;
  certifications?: string[];
  portfolio?: string;
  profileImage?: string;
  rating?: number;
  reviewsCount?: number;
  projectsCompleted?: number;
  about?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userName: string, email: string, password: string, role?: 'Admin' | 'Client' | 'Freelancer') => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage or backend on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await storageGet("user");
        if (savedUser) setUser(JSON.parse(savedUser));

        const token = await storageGet("accessToken");
        if (token) {
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              await storageSet("user", JSON.stringify(currentUser));
            }
          } catch {
            try {
              await authService.refreshToken();
              const currentUser = await authService.getCurrentUser();
              if (currentUser) {
                setUser(currentUser);
                await storageSet("user", JSON.stringify(currentUser));
              }
            } catch {
              await storageRemove("accessToken");
              await storageRemove("refreshToken");
              await storageRemove("user");
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // SIGNUP
  const signup = async (userName: string, email: string, password: string, role?: 'Admin' | 'Client' | 'Freelancer') => {
    setIsLoading(true);
    try {
      const response = await authService.signup({ userName, email, password, role });
      if (response.user) {
        setUser(response.user);
        await storageSet("user", JSON.stringify(response.user));
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signin({ email, password });
      if (response.user) {
        setUser(response.user);
        await storageSet("user", JSON.stringify(response.user));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      await storageRemove("accessToken");
      await storageRemove("refreshToken");
      await storageRemove("user");
    } finally {
      setIsLoading(false);
    }
  };

  // REFRESH USER (FORCE NEW REFERENCE)
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(prev => ({ ...prev, ...currentUser }));
        await storageSet("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await authService.updateUser(userData);
      if (updatedUser) {
        setUser(prev => ({ ...prev, ...updatedUser }));
        await storageSet("user", JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
