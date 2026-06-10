import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { toast } from 'sonner';

import { ButtonLoading } from '@/components/button-loading';
import { getProfileQueryOptions } from '@/http/hooks/user/use-get-profile';
import { useLogout } from '@/http/hooks/auth/use-logout';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/app')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth?.isAuthenticated) {
      throw redirect({ to: '/sign-in' });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getProfileQueryOptions());
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, logout, refreshToken } = useAuthStore();

  const { mutateAsync: logoutMutation, isPending } = useLogout({
    mutation: {
      onSuccess: () => {
        logout();
      },
      onError: () => {
        logout();
      },
    },
  });

  async function handleLogout() {
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      await logoutMutation({ data: { refreshToken } });
    } catch {
      toast.error('Erro ao sair', { description: 'Sessão encerrada localmente.' });
    }
  }

  return (
    <div className="min-h-svh">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3">
            <img src="/static/logo.png" alt="Copa Manager" className="size-8" />
            <span className="font-semibold">Copa Manager</span>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-muted-foreground text-sm">{user.name}</span>
            )}
            <ButtonLoading
              variant="ghost"
              size="sm"
              loading={isPending}
              onClick={handleLogout}
              aria-label="Sair"
            >
              <LogOutIcon className="size-4" />
              Sair
            </ButtonLoading>
          </div>
        </div>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
