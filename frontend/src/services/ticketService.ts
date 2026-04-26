import type { Ticket } from '@/types';
import { api } from './authService';

type TicketCommentApiResponse = {
  id: string;
  ticketId: string;
  authorId?: string;
  authorName?: string;
  authorRole: 'USER' | 'ADMIN' | 'TECHNICIAN';
  content: string;
  createdAt?: string;
};

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
  comments?: TicketCommentApiResponse[];
};

export type TicketCreatePayload = {
  title: string;
  category: string;
  description: string;
  priority: Ticket['priority'];
  resourceOrLocation: string;
  preferredContact?: string;
  attachmentUrls?: string[];
  attachments?: File[];
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
  comments: (t.comments || []).map(c => ({
    id: c.id,
    ticketId: c.ticketId,
    authorId: c.authorId,
    author: c.authorName || c.authorId || 'Unknown',
    authorRole: c.authorRole,
    content: c.content,
    createdAt: c.createdAt || new Date().toISOString(),
  })),
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
  getAssignedTickets: async (): Promise<Ticket[]> => {
    const { data } = await api.get<TicketApiResponse[]>('/api/tickets/assigned');
    return data.map(mapTicket);
  },
  create: async (data: TicketCreatePayload): Promise<Ticket> => {
    const attachments = data.attachments || [];
    const requestBody = {
      title: data.title,
      category: data.category,
      description: data.description,
      priority: data.priority,
      resourceOrLocation: data.resourceOrLocation,
      preferredContact: data.preferredContact,
      attachmentUrls: data.attachmentUrls || [],
    };

    const created = attachments.length > 0
      ? (await api.post<TicketApiResponse>('/api/tickets', (() => {
          const formData = new FormData();
          formData.append('ticket', new Blob([JSON.stringify(requestBody)], { type: 'application/json' }), 'ticket.json');
          attachments.forEach(file => formData.append('attachments', file));
          return formData;
        })())).data
      : (await api.post<TicketApiResponse>('/api/tickets', requestBody)).data;
    return mapTicket(created);
  },
  updateStatus: async (id: string, status: Ticket['status'], resolutionNotes?: string): Promise<Ticket> => {
    const { data } = await api.patch<TicketApiResponse>(`/api/tickets/${id}/status`, { status, resolutionNotes });
    return mapTicket(data);
  },
  updateResolution: async (id: string, resolutionNotes: string): Promise<Ticket> => {
    const { data } = await api.patch<TicketApiResponse>(`/api/tickets/${id}/resolution`, { resolutionNotes });
    return mapTicket(data);
  },
  assignTechnician: async (id: string, technicianId: string): Promise<Ticket> => {
    const { data } = await api.patch<TicketApiResponse>(`/api/tickets/${id}/assign/${technicianId}`);
    return mapTicket(data);
  },
  addComment: async (ticketId: string, content: string): Promise<void> => {
    await api.post(`/api/tickets/${ticketId}/comments`, { content });
  },
  updateComment: async (ticketId: string, commentId: string, content: string): Promise<void> => {
    await api.patch(`/api/tickets/${ticketId}/comments/${commentId}`, { content });
  },
  deleteComment: async (ticketId: string, commentId: string): Promise<void> => {
    await api.delete(`/api/tickets/${ticketId}/comments/${commentId}`);
  },
};
