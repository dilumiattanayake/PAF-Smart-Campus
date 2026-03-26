import type { Ticket } from '@/types';
import { mockTickets } from '@/data/mockData';

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

export const ticketService = {
  getAll: async (): Promise<Ticket[]> => {
    await delay();
    return [...mockTickets];
  },
  getById: async (id: string): Promise<Ticket | undefined> => {
    await delay(300);
    return mockTickets.find(t => t.id === id);
  },
  getMyTickets: async (createdBy: string): Promise<Ticket[]> => {
    await delay();
    return mockTickets.filter(t => t.createdBy === createdBy);
  },
  create: async (data: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Ticket> => {
    await delay(600);
    const now = new Date().toISOString();
    return { ...data, id: `T${Date.now()}`, status: 'OPEN', createdAt: now, updatedAt: now };
  },
  updateStatus: async (id: string, status: Ticket['status'], notes?: string): Promise<Ticket> => {
    await delay(400);
    const t = mockTickets.find(t => t.id === id);
    if (!t) throw new Error('Ticket not found');
    return { ...t, status, resolutionNotes: notes || t.resolutionNotes, updatedAt: new Date().toISOString() };
  },
  assignTechnician: async (id: string, techName: string): Promise<Ticket> => {
    await delay(400);
    const t = mockTickets.find(t => t.id === id);
    if (!t) throw new Error('Ticket not found');
    return { ...t, assignedTechnician: techName, updatedAt: new Date().toISOString() };
  },
};
