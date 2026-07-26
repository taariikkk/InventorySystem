import React, { useState } from 'react';
import api from '../services/api';
import { AuthContext, type AuthContextType } from './AuthContext';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<AuthContextType['user']>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (credentials: LoginRequest) => {
    const response = await api.post<AuthResponse>('/Auth/login', credentials);
    const { token: jwtToken, username, email, role } = response.data;

    setToken(jwtToken);
    setUser({ username, email, role });

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify({ username, email, role }));
  };

  const register = async (userData: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/Auth/register', userData);
    const { token: jwtToken, username, email, role } = response.data;

    setToken(jwtToken);
    setUser({ username, email, role });

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify({ username, email, role }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};