import type { Booking } from '@/types';
import { api } from './authService';

const mapBooking = (b: any): Booking => ({
  id: b.id,
  resourceId: b.resourceId,
  resourceName: b.resourceName || '',
  requesterName: b.requesterName || '',
  requesterEmail: b.requesterEmail || '',
  userId: b.userId || '',
  purpose: b.purpose,
  bookingDate: b.bookingDate,
  startTime: b.startTime,
  endTime: b.endTime,
  attendeeCount: b.attendeeCount,
  notes: b.notes,
  status: b.status,
  rejectionReason: b.rejectionReason,
  createdAt: b.createdAt,
});

export const bookingService = {
  getAll: async (filters?: { status?: string; resourceId?: string; userId?: string; dateFrom?: string; dateTo?: string }): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.resourceId) params.set('resourceId', filters.resourceId);
    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    const query = params.toString();
    const { data } = await api.get(`/api/bookings${query ? `?${query}` : ''}`);
    return data.map(mapBooking);
  },
  getMyBookings: async (): Promise<Booking[]> => {
    const { data } = await api.get('/api/bookings/my');
    return data.map(mapBooking);
  },
  getById: async (id: string): Promise<Booking | undefined> => {
    const { data } = await api.get(`/api/bookings/${id}`);
    return mapBooking(data);
  },
  create: async (data: { resourceId: string; purpose: string; bookingDate: string; startTime: string; endTime: string; attendeeCount: number; notes?: string }): Promise<Booking> => {
    const { data: created } = await api.post('/api/bookings', data);
    return mapBooking(created);
  },
  approve: async (id: string): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/approve`, {});
    return mapBooking(data);
  },
  reject: async (id: string, reason: string): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/reject`, { rejectionReason: reason });
    return mapBooking(data);
  },
  cancel: async (id: string): Promise<Booking> => {
    const { data } = await api.patch(`/api/bookings/${id}/cancel`, {});
    return mapBooking(data);
  },
};
