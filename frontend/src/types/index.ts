// Types for the Smart Campus Operations Hub

export type UserRole = 'USER' | 'ADMIN' | 'TECHNICIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  joinedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  location: string;
  status: 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'AVAILABLE' | 'UNAVAILABLE';
  availableFrom: string;
  availableTo: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  userId?: string;
  requesterName: string;
  requesterEmail: string;
  purpose: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  attendeeCount: number;
  notes?: string;
  status: BookingStatus;
  rejectionReason?: string;
  createdAt: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Ticket {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: TicketPriority;
  resourceOrLocation: string;
  preferredContact: string;
  attachments: string[];
  createdBy: string;
  assignedTechnician?: string;
  status: TicketStatus;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'BOOKING_STATUS' | 'TICKET_ASSIGNED' | 'TICKET_STATUS' | 'COMMENT' | 'SYSTEM' | 'RESOURCE' | 'BOOKING' | 'TICKET';
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}
