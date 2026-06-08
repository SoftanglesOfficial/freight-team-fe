"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import type { User, AuthDto } from "@/hooks/Api";
import http, { setTokenGetter } from "@/hooks/Http";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if token is expired
  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }, []);

  // Logout function (defined early so it can be used by other functions)
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    notifications.show({
      title: "Logged out",
      message: "You have been signed out.",
      color: "blue",
    });

    router.push("/auth/login");
  }, [router]);

  // Refresh token (placeholder - implement based on your backend)
  const refreshToken = useCallback(async () => {
    try {
      // This would need to be implemented based on your backend's refresh token endpoint
      // For now, we'll assume the token is still valid or logout
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken && !isTokenExpired(storedToken)) {
        // Token is still valid, just update the state
        setToken(storedToken);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } else {
        throw new Error("Token expired");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  }, [isTokenExpired, logout]);

  // Login function
  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    notifications.show({
      title: "Welcome back",
      message: `Welcome back, ${newUser.first_name}!`,
      color: "green",
    });
  }, []);

  // Update user data
  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  }, [user]);

  // Set token getter for HTTP client
  useEffect(() => {
    setTokenGetter(() => token);
  }, [token]);

  // Listen for auth events from HTTP interceptor
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log("Token expired, attempting refresh...");
      refreshToken().catch(() => {
        console.log("Token refresh failed, logging out...");
        logout();
      });
    };

    const handleLogout = () => {
      console.log("Forced logout due to authentication error");
      logout();
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [refreshToken, logout]);

  // Load auth data from localStorage on mount
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            // Try to refresh token
            refreshToken().catch(() => {
              logout();
            });
          } else {
            setToken(storedToken);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, [isTokenExpired, refreshToken, logout]);

  // Role checking functions
  const hasRole = useCallback((role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(r => r.toLowerCase() === role.toLowerCase());
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some(role =>
      role.toLowerCase().includes("admin") ||
      role.toLowerCase() === "admin" ||
      role.toLowerCase() === "super admin"
    );
  }, [user]);

  const isCustomer = !isAdmin; // Assuming all non-admin users are customers

  // Computed values
  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    isAdmin,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Hook for protected routes
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { user, isAuthenticated, isLoading };
}

// Hook for admin-only routes
export function useRequireAdmin() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  return { user, isAuthenticated, isAdmin, isLoading };
}