import type { Resource } from '@/types';
import { api } from './authService';

const mapResource = (r: any): Resource => ({
  id: r.id,
  name: r.name,
  type: r.type,
  description: r.description,
  capacity: r.capacity,
  location: r.location,
  status: r.status,
  availableFrom: r.availableFrom || '',
  availableTo: r.availableTo || '',
  image: r.imageUrl,
  createdAt: r.createdAt || '',
  updatedAt: r.updatedAt || '',
});

export const resourceService = {
  getAll: async (): Promise<Resource[]> => {
    const { data } = await api.get('/api/resources');
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
