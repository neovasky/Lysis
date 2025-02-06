/**
 * File: src/contexts/AuthContext.tsx
 * Description: Authentication context and provider
 */

import React, { createContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate context utilities to a different file
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from storage
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Validate token and get user data
          // This is a placeholder - implement actual API call
          const mockUser: User = {
            id: "1",
            email: "user@example.com",
            firstName: "John",
            lastName: "Doe",
            createdAt: new Date(),
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (userEmail: string, userPassword: string) => {
    try {
      setLoading(true);
      // Implement API call to login endpoint
      console.log("Logging in with:", userEmail, userPassword);
      // On success:
      // 1. Store token
      // localStorage.setItem('auth_token', response.token);
      // 2. Set user data
      // setUser(response.user);
    } catch (error) {
      throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const register = async (newUserData: RegisterData) => {
    try {
      setLoading(true);
      // Implement API call to register endpoint
      console.log("Registering with:", newUserData);
      // On success:
      // 1. Store token
      // localStorage.setItem('auth_token', response.token);
      // 2. Set user data
      // setUser(response.user);
    } catch (error) {
      throw new Error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("auth_token");
      setUser(null);
    } catch (error) {
      throw new Error("Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    try {
      setLoading(true);
      // Implement API call to update profile
      console.log("Updating profile with:", updatedData);
      // On success:
      // setUser(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (error) {
      throw new Error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
