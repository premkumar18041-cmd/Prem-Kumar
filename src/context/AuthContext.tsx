import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../lib/api.js';
import type { User, RoleName } from '../types.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  quickLogin: (type: 'super_admin' | 'product_manager' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(res => {
          if (res.success && res.user) setUser(res.user);
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    const res = await api.register(data);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const quickLogin = async (type: 'super_admin' | 'product_manager' | 'customer') => {
    let email = 'customer@accessories.lt';
    let password = 'Customer@123';

    if (type === 'super_admin') {
      email = 'admin@accessories.lt';
      password = 'Admin@123';
    } else if (type === 'product_manager') {
      email = 'catalog@accessories.lt';
      password = 'Product@123';
    }

    await login(email, password);
  };

  const isAdmin = !!(user && user.role !== 'CUSTOMER');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
