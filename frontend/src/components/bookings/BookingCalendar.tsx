import { useMemo, useState } from 'react';
import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const pad2 = (n: number) => String(n).padStart(2, '0');

// Avoid Date#toISOString() here: it converts to UTC and can shift the day for non-UTC timezones.
const toLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const formatTime = (t?: string) => {
  if (!t) return '';
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
};

const formatTimeRange = (start?: string, end?: string) => {
  const s = formatTime(start);
  const e = formatTime(end);
  if (!s && !e) return '';
  if (!e) return s;
  return `${s}–${e}`;
};

export const BookingCalendar = ({ bookings, title = 'Calendar', filterToUserId }: Props) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday as first column
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = 42; // 6 weeks grid

  const visible = useMemo(
    () => bookings.filter(b => !filterToUserId || b.userId === filterToUserId),
    [bookings, filterToUserId],
  );

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    for (const b of visible) {
      const key = b.bookingDate;
      if (!key) continue;
      (map[key] ||= []).push(b);
    }
    Object.values(map).forEach(list => list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')));
    return map;
  }, [visible]);

  const [openDate, setOpenDate] = useState<string | null>(null);
  const openBookings = openDate ? (bookingsByDate[openDate] || []) : [];

  const monthLabel = useMemo(
    () => new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' }),
    [viewYear, viewMonth],
  );

  const moveMonth = (delta: number) => {
    setOpenDate(null);
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const getDateForCell = (index: number) => {
    const dayNumber = index - startOffset + 1;
    return new Date(viewYear, viewMonth, dayNumber);
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === viewMonth && date.getFullYear() === viewYear;

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = toLocalDateString(new Date());

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums min-w-[104px] text-center">
            {monthLabel} {viewYear}
          </span>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {dayLabels.map(d => (
          <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
        ))}
        {Array.from({ length: totalCells }, (_, i) => {
          const date = getDateForCell(i);
          const day = date.getDate();
          const dateStr = toLocalDateString(date);
          const dayBookings = isCurrentMonth(date) ? (bookingsByDate[dateStr] || []) : [];
          const isToday = isCurrentMonth(date) && dateStr === todayStr;

          return (
            <div
              key={i}
              className={cn(
                'p-2 rounded-md min-h-[72px] text-left border transition-colors',
                !isCurrentMonth(date) && 'text-muted-foreground/40 bg-muted/30',
                isToday && 'border-primary shadow-sm',
                dayBookings.length && 'cursor-pointer hover:bg-muted/50'
              )}
              onClick={() => dayBookings.length && setOpenDate(dateStr)}
            >
              <span className="text-xs tabular-nums">{isCurrentMonth(date) ? day : ''}</span>
              {dayBookings.slice(0, 3).map(b => (
                <div
                  key={b.id}
                  className={cn(
                    'mt-1 text-[10px] rounded px-1 py-0.5 font-medium overflow-hidden flex items-center gap-1',
                    STATUS_COLOR[b.status] || 'bg-primary/10 text-primary'
                  )}
                >
                  <span className="truncate">{b.resourceName || b.resourceId}</span>
                  <Badge variant="outline" className="ml-auto shrink-0 h-4 px-1 text-[10px] tabular-nums">
                    {formatTimeRange(b.startTime, b.endTime)}
                  </Badge>
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
                <div className="text-muted-foreground text-xs tabular-nums">{formatTimeRange(b.startTime, b.endTime)}</div>
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
