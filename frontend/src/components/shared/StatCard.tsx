import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, description, trend, className }: StatCardProps) => (
  <div className={cn("rounded-lg border bg-card p-5 transition-shadow hover:shadow-md", className)}>
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {trend && (
        <p className={cn("mt-1 text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
        </p>
      )}
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  </div>
);
