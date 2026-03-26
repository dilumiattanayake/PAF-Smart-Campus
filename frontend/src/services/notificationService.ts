import type { Notification } from '@/types';
import { mockNotifications } from '@/data/mockData';

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    await delay();
    return [...mockNotifications];
  },
  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const n = mockNotifications.find(n => n.id === id);
    if (n) n.isRead = true;
  },
  markAllAsRead: async (): Promise<void> => {
    await delay(300);
    mockNotifications.forEach(n => { n.isRead = true; });
  },
};
