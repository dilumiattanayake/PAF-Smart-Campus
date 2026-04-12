import axios from 'axios';
import type { User } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9199';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('campus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'TECHNICIAN';
    createdAt?: string;
    updatedAt?: string;
  };
}

interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TECHNICIAN';
  createdAt?: string;
  updatedAt?: string;
}

const mapUser = (u: AuthResponse['user']): User => ({
  id: u.id,
  name: u.fullName,
  email: u.email,
  role: u.role,
  joinedAt: u.createdAt || new Date().toISOString(),
});

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    localStorage.setItem('campus_token', data.token);
    localStorage.setItem('campus_user', JSON.stringify(mapUser(data.user)));
    return mapUser(data.user);
  },
  register: async (payload: { fullName: string; email: string; password: string; role?: 'USER' | 'ADMIN' | 'TECHNICIAN' }): Promise<User> => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'USER',
    });
    localStorage.setItem('campus_token', data.token);
    localStorage.setItem('campus_user', JSON.stringify(mapUser(data.user)));
    return mapUser(data.user);
  },
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<UserProfileResponse>('/api/auth/me');
    return mapUser(data);
  },
  getOAuthAuthorizeUrl: (): string => {
    return `${baseURL}/oauth2/authorization/google`;
  },
  logout: async (): Promise<void> => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
  },
};

export default api;
