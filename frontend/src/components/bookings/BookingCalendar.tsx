import type { Booking } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  bookings: Booking[];
  title?: string;
};

// Simple month view calendar that highlights approved bookings for the current month.
export const BookingCalendar = ({ bookings, title = 'Calendar' }: Props) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday as first column
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = 42; // 6 weeks grid

  const approved = bookings.filter(b => b.status === 'APPROVED');

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
          const dayBookings = isCurrentMonth(date) ? approved.filter(b => b.bookingDate === dateStr) : [];
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={i}
              className={cn(
                'p-2 rounded-md min-h-[72px] text-left border',
                !isCurrentMonth(date) && 'text-muted-foreground/40 bg-muted/30',
                isToday && 'border-primary shadow-sm'
              )}
            >
              <span className="text-xs tabular-nums">{isCurrentMonth(date) ? day : ''}</span>
              {dayBookings.slice(0, 3).map(b => (
                <div key={b.id} className="mt-1 text-[10px] rounded bg-primary/10 px-1 py-0.5 truncate text-primary font-medium">
                  {(b.resourceName || b.resourceId).slice(0, 18)}
                  <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">{b.startTime}</Badge>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
