import { Loader2Icon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ContentLoadingProps = {
  variant?: 'inline' | 'page' | 'list';
  label?: string;
  rows?: number;
  className?: string;
};

export function ContentLoading({
  variant = 'page',
  label = 'Carregando...',
  rows = 3,
  className,
}: ContentLoadingProps) {
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'text-muted-foreground inline-flex items-center gap-1.5 text-xs',
          className,
        )}
      >
        <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
        {label}
      </span>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          <span>{label}</span>
        </div>
        <div className="space-y-2" aria-hidden>
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-10',
        className,
      )}
    >
      <Loader2Icon className="text-muted-foreground size-6 animate-spin" aria-hidden />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}
