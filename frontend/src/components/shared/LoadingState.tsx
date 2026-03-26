import { cn } from '@/lib/utils';

export const LoadingState = ({ className, rows = 3 }: { className?: string; rows?: number }) => (
  <div className={cn("space-y-4 animate-pulse-soft", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border bg-card p-5 animate-pulse-soft", className)}>
    <div className="flex items-center justify-between">
      <div className="h-3 w-20 rounded bg-muted" />
      <div className="h-8 w-8 rounded bg-muted" />
    </div>
    <div className="mt-4 h-6 w-16 rounded bg-muted" />
    <div className="mt-2 h-3 w-24 rounded bg-muted" />
  </div>
);
