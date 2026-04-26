import type { User } from '@/types';
import { api } from './authService';

type UserApiResponse = {
  id: string;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TECHNICIAN';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const mapUser = (u: UserApiResponse): User => ({
  id: u.id,
  name: u.fullName,
  email: u.email,
  role: u.role,
  joinedAt: u.createdAt || new Date().toISOString(),
});

export const userService = {
  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<UserApiResponse>(`/api/users/${id}`);
    return mapUser(data);
  },
  getTechnicians: async (): Promise<User[]> => {
    const { data } = await api.get<UserApiResponse[]>('/api/users/technicians');
    return data.map(mapUser);
  },
};
