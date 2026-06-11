import type { ReactNode } from 'react';

type AuthPageShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({ title, description, children, footer }: AuthPageShellProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      {children}

      {footer}
    </div>
  );
}
