import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
      }
    } catch (error) {
      console.error('Failed to load user from storage', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', userData.token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user to storage', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) {
        await AsyncStorage.setItem('token', userData.token);
      }
      setUser(userData);
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
