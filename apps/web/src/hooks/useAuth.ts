import { useState, useEffect, createContext, useContext, ReactNode, ReactElement, createElement } from "react";
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

export function AuthProvider(props: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    refreshUser();
  }, []);

  async function refreshUser() {
    try {
      setIsLoading(true);
      const response = await api.getCurrentUser();
      setUser(response.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(input: LoginInput) {
    const response = await api.login(input);
    if (response.user) setUser(response.user);
  }

  async function register(input: CreateUserInput) {
    const response = await api.register(input);
    if (response.user) setUser(response.user);
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return createElement(AuthContext.Provider, { value }, props.children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
