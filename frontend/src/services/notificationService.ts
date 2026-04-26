import type { Notification } from '@/types';
import { api } from './authService';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/api/notifications');
    return data.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.read,
      referenceId: n.referenceId,
      createdAt: n.createdAt,
    }));
  },
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/api/notifications/unread-count');
    return data.count;
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/read-all');
  },
  create: async (payload: { title: string; message: string; type: string; userId: string; referenceId?: string }): Promise<Notification> => {
    const { data } = await api.post('/api/notifications', payload);
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: data.read,
      referenceId: data.referenceId,
      createdAt: data.createdAt,
    };
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },
  deleteAll: async (): Promise<void> => {
    await api.delete('/api/notifications');
  },
};
