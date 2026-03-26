import type { Resource } from '@/types';
import { api } from './authService';

const mapResource = (r: any): Resource => ({
  id: r.id,
  name: r.name,
  type: r.type,
  description: r.description,
  capacity: r.capacity,
  location: r.location,
  status: r.status === 'AVAILABLE' ? 'ACTIVE' : r.status === 'UNAVAILABLE' ? 'OUT_OF_SERVICE' : r.status,
  availableFrom: r.availableFrom || '',
  availableTo: r.availableTo || '',
  image: r.imageUrl,
  createdAt: r.createdAt || '',
  updatedAt: r.updatedAt || '',
});

export const resourceService = {
  getAll: async (filters?: { q?: string; status?: string; type?: string; location?: string; minCapacity?: number }): Promise<Resource[]> => {
    const params = new URLSearchParams();
    if (filters?.q) params.set('q', filters.q);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.location) params.set('location', filters.location);
    if (filters?.minCapacity !== undefined && filters?.minCapacity !== null && !Number.isNaN(filters.minCapacity)) {
      params.set('minCapacity', String(filters.minCapacity));
    }
    const query = params.toString();
    const { data } = await api.get(`/api/resources${query ? `?${query}` : ''}`);
    return data.map(mapResource);
  },
  getById: async (id: string): Promise<Resource | undefined> => {
    const { data } = await api.get(`/api/resources/${id}`);
    return mapResource(data);
  },
  create: async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> => {
    const payload = {
      name: data.name,
      type: data.type,
      description: data.description,
      capacity: Number(data.capacity),
      location: data.location,
      status: data.status,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      imageUrl: data.image,
    };
    const { data: created } = await api.post('/api/resources', payload);
    return mapResource(created);
  },
  update: async (id: string, data: Partial<Resource>): Promise<Resource> => {
    const { data: updated } = await api.put(`/api/resources/${id}`, {
      ...data,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      imageUrl: data.image,
    });
    return mapResource(updated);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/resources/${id}`);
  },
};
