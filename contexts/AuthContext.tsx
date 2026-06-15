"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getDecodedToken, isLoggedIn, logout as logoutUser } from "@/lib/auth";
import type { DecodedToken } from "@/lib/auth";

interface AuthContextType {
  user: DecodedToken | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = () => {
    if (isLoggedIn()) {
      const decoded = getDecodedToken();
      setUser(decoded);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
    
    // Check token validity every minute
    const interval = setInterval(() => {
      if (!isLoggedIn()) {
        setUser(null);
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        logout,
        refreshUser,
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
