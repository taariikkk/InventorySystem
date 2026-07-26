import { createContext } from 'react';
import type { LoginRequest, RegisterRequest } from '../types';

export interface AuthContextType {
  user: { username: string; email: string; role: string } | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);