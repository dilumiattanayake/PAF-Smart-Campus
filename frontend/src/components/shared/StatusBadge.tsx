import { cn } from '@/lib/utils';
import type { BookingStatus, TicketStatus, TicketPriority } from '@/types';

type BadgeType = BookingStatus | TicketStatus | TicketPriority | Resource['status'];
type Resource = { status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE' };

const colorMap: Record<string, string> = {
  AVAILABLE: 'bg-success/15 text-success border-success/30',
  OCCUPIED: 'bg-warning/15 text-warning border-warning/30',
  MAINTENANCE: 'bg-info/15 text-info border-info/30',
  UNAVAILABLE: 'bg-muted text-muted-foreground border-border',
  PENDING: 'bg-warning/15 text-warning border-warning/30',
  APPROVED: 'bg-success/15 text-success border-success/30',
  REJECTED: 'bg-destructive/15 text-destructive border-destructive/30',
  CANCELLED: 'bg-muted text-muted-foreground border-border',
  OPEN: 'bg-info/15 text-info border-info/30',
  IN_PROGRESS: 'bg-warning/15 text-warning border-warning/30',
  RESOLVED: 'bg-success/15 text-success border-success/30',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  LOW: 'bg-muted text-muted-foreground border-border',
  MEDIUM: 'bg-info/15 text-info border-info/30',
  HIGH: 'bg-warning/15 text-warning border-warning/30',
  CRITICAL: 'bg-destructive/15 text-destructive border-destructive/30',
};

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => (
  <span className={cn(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
    colorMap[status] || 'bg-muted text-muted-foreground border-border',
    className
  )}>
    {status.replace(/_/g, ' ')}
  </span>
);
