import { useMemo, useState } from 'react';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
  bookings: Booking[];
  title?: string;
  filterToUserId?: string; // when set, show only bookings for that user
};

const STATUS_COLOR: Record<string, string> = {
  APPROVED: 'bg-emerald-500/20 text-emerald-700 border border-emerald-200',
  PENDING: 'bg-amber-500/20 text-amber-700 border border-amber-200',
  REJECTED: 'bg-red-500/20 text-red-700 border border-red-200',
  CANCELLED: 'bg-slate-200 text-slate-700 border border-slate-200',
};

export const BookingCalendar = ({ bookings, title = 'Calendar', filterToUserId }: Props) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday as first column
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = 42; // 6 weeks grid

  const visible = useMemo(
    () => bookings.filter(b => !filterToUserId || b.userId === filterToUserId),
    [bookings, filterToUserId],
  );

  const [openDate, setOpenDate] = useState<string | null>(null);
  const openBookings = openDate ? visible.filter(b => b.bookingDate === openDate) : [];

  const getDateForCell = (index: number) => {
    const dayNumber = index - startOffset + 1;
    return new Date(year, month, dayNumber);
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === month;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {today.toLocaleString('default', { month: 'long' })} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {dayLabels.map(d => (
          <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const date = getDateForCell(i);
          const day = date.getDate();
          const dateStr = date.toISOString().split('T')[0];
          const dayBookings = isCurrentMonth(date) ? visible.filter(b => b.bookingDate === dateStr) : [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={i}
              className={cn(
                'p-2 rounded-md min-h-[72px] text-left border',
                !isCurrentMonth(date) && 'text-muted-foreground/40 bg-muted/30',
                isToday && 'border-primary shadow-sm cursor-pointer'
              )}
              onClick={() => dayBookings.length && setOpenDate(dateStr)}
            >
              <span className="text-xs tabular-nums">{isCurrentMonth(date) ? day : ''}</span>
              {dayBookings.slice(0, 3).map(b => (
                <div
                  key={b.id}
                  className={cn(
                    'mt-1 text-[10px] rounded px-1 py-0.5 truncate font-medium',
                    STATUS_COLOR[b.status] || 'bg-primary/10 text-primary'
                  )}
                >
                  {(b.resourceName || b.resourceId).slice(0, 18)}
                  <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">{b.startTime}</Badge>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Dialog open={!!openDate} onOpenChange={open => setOpenDate(open ? openDate : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bookings on {openDate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {openBookings.map(b => (
              <div key={b.id} className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{b.resourceName || b.resourceId}</span>
                  <Badge variant="outline" className={cn('text-xs', STATUS_COLOR[b.status])}>{b.status}</Badge>
                </div>
                <div className="text-muted-foreground text-xs">{b.startTime}–{b.endTime}</div>
                <div className="text-xs">{b.purpose}</div>
                <div className="text-xs text-muted-foreground">By: {b.requesterName || b.requesterEmail || b.userId}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
