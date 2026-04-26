import type { Booking } from '@/types';
import { api } from './authService';

const pad2 = (n: number) => String(n).padStart(2, '0');

// Backend uses Java time types; depending on Jackson settings these can come as strings or arrays.
const normalizeDate = (d: any): string => {
  if (!d) return '';
  if (typeof d === 'string') return d;
  if (Array.isArray(d) && d.length >= 3) {
    const [y, m, day] = d;
    if (typeof y === 'number' && typeof m === 'number' && typeof day === 'number') {
      return `${y}-${pad2(m)}-${pad2(day)}`;
    }
  }
  // Some serializers produce objects like { year, monthValue, dayOfMonth }.
  if (typeof d === 'object' && d) {
    const year = (d as any).year;
    const monthValue = (d as any).monthValue ?? (d as any).month;
    const dayOfMonth = (d as any).dayOfMonth ?? (d as any).day;
    if (typeof year === 'number' && typeof monthValue === 'number' && typeof dayOfMonth === 'number') {
      return `${year}-${pad2(monthValue)}-${pad2(dayOfMonth)}`;
    }
  }
  return String(d);
};

const normalizeTime = (t: any): string => {
  if (!t) return '';
  if (typeof t !== 'string') return String(t);
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
};

const mapBooking = (b: any): Booking => ({
  id: b.id,
  resourceId: b.resourceId,
  resourceName: b.resourceName || '',
  requesterName: b.requesterName || '',
  requesterEmail: b.requesterEmail || '',
  userId: b.userId || '',
  purpose: b.purpose,
  bookingDate: normalizeDate(b.bookingDate),
  startTime: normalizeTime(b.startTime),
  endTime: normalizeTime(b.endTime),
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
  update: async (id: string, data: { resourceId: string; purpose: string; bookingDate: string; startTime: string; endTime: string; attendeeCount: number; notes?: string }): Promise<Booking> => {
    const { data: updated } = await api.patch(`/api/bookings/${id}`, data);
    return mapBooking(updated);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/bookings/${id}`);
  },
};
