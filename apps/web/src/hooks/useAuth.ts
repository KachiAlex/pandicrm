"use client";

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

function requireData<T>(response: { data?: T; error?: string }, fallbackMessage: string): T {
  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

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
      const data = requireData(response, "Failed to load user session");
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(input: LoginInput) {
    const response = await api.login(input);
    const data = requireData(response, "Failed to sign in");
    setUser(data.user);
  }

  async function register(input: CreateUserInput) {
    const response = await api.register(input);
    requireData(response, "Failed to create account");

    const loginResponse = await api.login({
      email: input.email.value,
      password: input.password,
    });
    const loginData = requireData(loginResponse, "Account created, but sign in failed");
    setUser(loginData.user);
  }

  async function logout() {
    try {
      const response = await api.logout();
      if (response.error) {
        throw new Error(response.error);
      }
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
