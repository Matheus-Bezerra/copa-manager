import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { SupportContactLink } from '@/components/support-contact-link';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div
      className="scrollbar-styled flex h-dvh flex-col items-center overflow-y-auto px-4 py-8 sm:h-auto sm:min-h-svh sm:justify-center sm:py-6"
      style={{
        backgroundImage:
          'linear-gradient(160deg, oklch(0.13 0.04 155) 0%, oklch(0.10 0.02 140) 100%)',
      }}
    >
      <div className="w-full max-w-sm shrink-0 rounded-xl border border-border/50 bg-card/80 p-5 shadow-lg backdrop-blur-sm sm:p-8">
        <div className="mb-5 text-center sm:mb-6">
          <img
            src="/static/logo.png"
            alt="Copa Manager"
            className="mx-auto h-12 w-12 sm:h-14 sm:w-14"
          />
          <p className="text-muted-foreground mt-2 text-xs font-medium uppercase tracking-widest sm:mt-3">
            Copa Manager
          </p>
        </div>

        <Outlet />
      </div>

      <SupportContactLink variant="auth" />
    </div>
  );
}
