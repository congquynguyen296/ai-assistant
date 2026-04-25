import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types/models";

// Định nghĩa shape của AuthContext value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUserData: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng với một AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check auth status func
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr) as User;
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error(`Kiểm tra authentication thất bại: ${error}`);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const updateUser = async (updatedUserData: Partial<User>) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    // Add authentication-related functions
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
