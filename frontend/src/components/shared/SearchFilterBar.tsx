import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  className?: string;
}

export const SearchFilterBar = ({ searchValue, onSearchChange, searchPlaceholder = 'Search...', filters, className }: SearchFilterBarProps) => (
  <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="pl-9"
      />
    </div>
    {filters?.map(f => (
      <Select key={f.key} value={f.value} onValueChange={f.onChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={f.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {f.label}</SelectItem>
          {f.options.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ))}
  </div>
);
