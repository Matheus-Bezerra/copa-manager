import { cn } from '@/lib/utils';

type FormErrorMessageProps = {
  message?: string;
  className?: string;
};

export function FormErrorMessage({ message, className }: FormErrorMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn('text-destructive text-sm font-medium', className)} role="alert">
      {message}
    </p>
  );
}
