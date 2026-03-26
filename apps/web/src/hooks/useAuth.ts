import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { api, type User, type LoginInput, type CreateUserInput } from "../lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: CreateUserInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const response = await api.getCurrentUser();
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (input: LoginInput) => {
    try {
      const response = await api.login(input);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (input: CreateUserInput) => {
    try {
      const response = await api.register(input);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
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
