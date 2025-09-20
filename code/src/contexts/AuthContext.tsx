import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getUserById, getUserByEmail, createUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const foundUser = getUserById(parsedUser.id);
        if (foundUser) {
          setUser(foundUser);
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = getUserByEmail(email);
    
    if (foundUser && foundUser.password === password) {
      const token = btoa(foundUser.id); // Simple token encoding
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(foundUser));
      setUser(foundUser);
      return true;
    }
    
    return false;
  };

  const register = async (name: string, email: string, password: string, role: User['role']): Promise<boolean> => {
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return false;
    }

    try {
      const newUser = createUser({ name, email, password, role });
      const token = btoa(newUser.id);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};