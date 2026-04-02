import type { Ticket } from '@/types';
import { api } from './authService';

type TicketApiResponse = {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: Ticket['priority'];
  resourceOrLocation: string;
  preferredContact?: string;
  attachmentUrls?: string[];
  createdByUserId?: string;
  createdByUserName?: string;
  assignedTechnicianId?: string;
  status: Ticket['status'];
  resolutionNotes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TicketCreatePayload = {
  title: string;
  category: string;
  description: string;
  priority: Ticket['priority'];
  resourceOrLocation: string;
  preferredContact?: string;
  attachmentUrls?: string[];
};

const mapTicket = (t: TicketApiResponse): Ticket => ({
  id: t.id,
  title: t.title,
  category: t.category,
  description: t.description,
  priority: t.priority,
  resourceOrLocation: t.resourceOrLocation,
  preferredContact: t.preferredContact || '',
  attachments: t.attachmentUrls || [],
  createdBy: t.createdByUserName || t.createdByUserId || '',
  assignedTechnician: t.assignedTechnicianId,
  status: t.status,
  resolutionNotes: t.resolutionNotes,
  createdAt: t.createdAt || new Date().toISOString(),
  updatedAt: t.updatedAt || new Date().toISOString(),
});

export const ticketService = {
  getAll: async (): Promise<Ticket[]> => {
    const { data } = await api.get<TicketApiResponse[]>('/api/tickets');
    return data.map(mapTicket);
  },
  getById: async (id: string): Promise<Ticket | undefined> => {
    const { data } = await api.get<TicketApiResponse>(`/api/tickets/${id}`);
    return mapTicket(data);
  },
  getMyTickets: async (_createdBy?: string): Promise<Ticket[]> => {
    const { data } = await api.get<TicketApiResponse[]>('/api/tickets/my');
    return data.map(mapTicket);
  },
  create: async (data: TicketCreatePayload): Promise<Ticket> => {
    const { data: created } = await api.post<TicketApiResponse>('/api/tickets', data);
    return mapTicket(created);
  },
  updateStatus: async (id: string, status: Ticket['status']): Promise<Ticket> => {
    const { data } = await api.patch<TicketApiResponse>(`/api/tickets/${id}/status`, { status });
    return mapTicket(data);
  },
  assignTechnician: async (id: string, technicianId: string): Promise<Ticket> => {
    const { data } = await api.patch<TicketApiResponse>(`/api/tickets/${id}/assign/${technicianId}`);
    return mapTicket(data);
  },
};
