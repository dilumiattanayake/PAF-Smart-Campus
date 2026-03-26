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
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/read-all');
  },
};
