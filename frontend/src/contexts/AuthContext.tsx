import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const logged = await authService.login(email, password);
      localStorage.setItem('campus_user', JSON.stringify(logged));
      setUser(logged);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsRole = useCallback((role: UserRole) => {
    (async () => {
      setIsLoading(true);
      const email = `${role.toLowerCase()}+demo@smartcampus.dev`;
      const password = `Demo@${role}123`;
      try {
        // try register; if email exists backend will error, then fallback to login
        const registered = await authService.register({ fullName: `${role} Demo`, email, password, role });
        localStorage.setItem('campus_user', JSON.stringify(registered));
        setUser(registered);
      } catch (_err) {
        // fallback login
        try {
          const logged = await authService.login(email, password);
          localStorage.setItem('campus_user', JSON.stringify(logged));
          setUser(logged);
        } catch (loginErr) {
          console.error('Demo login failed', loginErr);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('campus_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginAsRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
