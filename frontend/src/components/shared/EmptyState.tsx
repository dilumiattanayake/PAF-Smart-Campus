import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ title = 'No data found', description = 'There are no items to display.', action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
    <div className="rounded-full bg-muted p-4 mb-4">
      <FileQuestion className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
