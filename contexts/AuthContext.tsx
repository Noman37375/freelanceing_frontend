// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { storageGet, storageSet, storageRemove } from "@/utils/storage";
import authService, { User as AuthUser, RoleSelectionRequired, Requires2FA } from "@/services/authService";

interface Language {
  name: string;
  proficiency: string;
}

interface Education {
  degree: string;
  school: string;
  years: string;
  description?: string;
}


interface Certification {
  name: string;
  issuer: string;
  date: string;
  credential?: string;
}

interface Portfolio {
  title: string;
  description: string;
  images?: string[];
  link?: string;
}

interface User {
  id: string;
  userName: string;
  email: string;
  role?: 'Admin' | 'Client' | 'Freelancer';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Profile fields
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  currency?: string;
  phone?: string;
  languages?: Language[];
  education?: Education[];
  certifications?: Certification[];
  portfolio?: Portfolio[];
  profileImage?: string;
  linkedinUrl?: string;
  rating?: number;
  reviewsCount?: number;
  projectsCompleted?: number;
  about?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | RoleSelectionRequired | Requires2FA | undefined>;
  loginWithRole: (email: string, password: string, role: 'Client' | 'Freelancer', preAuthToken?: string) => Promise<User | undefined>;
  signup: (userName: string, email: string, password: string, role?: 'Admin' | 'Client' | 'Freelancer') => Promise<{ user: User; accessToken: string; refreshToken: string }>;
  logout: () => Promise<void>;
  verifyEmail: (otp: string) => Promise<User | null>;
  resendOTP: (email: string, userId: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (token: string, newPassword: string, confirmPassword?: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 LOAD USER FROM STORAGE ON APP START
  useEffect(() => {
    const loadUser = async () => {
      try {
        // 1️⃣ Load stored user
        const savedUser = await storageGet("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // 2️⃣ Check token and fetch current user from backend
        const token = await storageGet("accessToken");
        if (token) {
          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              await storageSet("user", JSON.stringify(currentUser));
            }
          } catch (error) {
            // Token might be expired, try refresh
            try {
              await authService.refreshToken();
              const currentUser = await authService.getCurrentUser();
              if (currentUser) {
                setUser(currentUser);
                await storageSet("user", JSON.stringify(currentUser));
              }
            } catch (refreshError) {
              // Refresh failed, clear storage
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

  // 🔥 SIGNUP
  const signup = async (userName: string, email: string, password: string, role?: 'Admin' | 'Client' | 'Freelancer') => {
    setIsLoading(true);
    try {
      const response = await authService.signup({ userName, email, password, role });

      if (response.user) {
        setUser(response.user);
        await storageSet("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 LOGIN
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signin({ email, password });

      // 2FA required — OTP sent, frontend must verify before role selection
      if ('requires2FA' in response && response.requires2FA) {
        return response as Requires2FA;
      }

      // Dual-role flow: backend is asking user to pick a role
      if ('requiresRoleSelection' in response && response.requiresRoleSelection) {
        return response as RoleSelectionRequired;
      }

      if ((response as any).user) {
        setUser((response as any).user as any);
        await storageSet("user", JSON.stringify((response as any).user));
      }
      return (response as any).user as any;
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 LOGIN WITH ROLE (Client/Freelancer)
  const loginWithRole = async (email: string, password: string, role: 'Client' | 'Freelancer', preAuthToken?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signinWithRole({ email, password, role, preAuthToken });
      if (response.user) {
        setUser(response.user as any);
        await storageSet("user", JSON.stringify(response.user));
      }
      return response.user as any;
    } catch (error: any) {
      throw new Error(error.message || "Login with role failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 VERIFY EMAIL
  const verifyEmail = async (otp: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      await authService.verifyEmail({ otp });

      // Refresh user data after verification
      await refreshUser();
      const updatedUser = await authService.getCurrentUser();
      return updatedUser || null;
    } catch (error: any) {
      throw new Error(error.message || "Email verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 RESEND OTP
  const resendOTP = async (email: string, userId: string) => {
    try {
      await authService.resendOTP({ email, _id: userId });
    } catch (error: any) {
      throw new Error(error.message || "Failed to resend OTP");
    }
  };

  // 🔥 FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword({ email });
    } catch (error: any) {
      throw new Error(error.message || "Failed to send password reset link");
    }
  };

  // 🔥 CHANGE PASSWORD
  const changePassword = async (token: string, newPassword: string, confirmPassword?: string) => {
    try {
      await authService.changePassword(token, { newPassword, confirmPassword });
    } catch (error: any) {
      throw new Error(error.message || "Failed to change password");
    }
  };

  // 🔥 LOGOUT
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error: any) {
      // Even if API call fails, clear local storage
      await storageRemove("accessToken");
      await storageRemove("refreshToken");
      await storageRemove("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 REFRESH USER DATA
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await storageSet("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  // 🔥 UPDATE PROFILE
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      // Call API with all profile data and get updated user back
      const { user: updatedUser } = await authService.updateUser(userData);

      // Update local auth state immediately
      setUser(updatedUser as any);
      await storageSet("user", JSON.stringify(updatedUser));
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
        loginWithRole,
        signup,
        logout,
        verifyEmail,
        resendOTP,
        forgotPassword,
        changePassword,
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
