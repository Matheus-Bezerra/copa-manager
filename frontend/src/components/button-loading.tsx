import type { ComponentProps } from 'react';
import { Loader2Icon } from 'lucide-react';

import { Button, type buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

type ButtonLoadingProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    asChild?: boolean;
  };

export function ButtonLoading({
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button className={cn(className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
