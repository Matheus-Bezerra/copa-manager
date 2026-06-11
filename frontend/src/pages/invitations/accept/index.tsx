import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { acceptInvitation } from '@/http/hooks/members/use-accept-invitation';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';

type AcceptInvitationSearch = {
  token: string;
};

export const Route = createFileRoute('/invitations/accept/')({
  validateSearch: (search: Record<string, unknown>): AcceptInvitationSearch => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: AcceptInvitationPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Aceitar convite' }],
  }),
});

function AcceptInvitationPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!isAuthenticated) {
      void navigate({
        to: '/sign-in',
        search: {
          redirect: `/invitations/accept?token=${encodeURIComponent(token)}`,
        },
      });
      return;
    }

    if (hasAttempted.current) {
      return;
    }

    hasAttempted.current = true;

    async function accept() {
      try {
        await acceptInvitation({ token });
        toast.success('Convite aceito', {
          description: 'Você agora faz parte do campeonato.',
        });
        navigate({ to: '/' });
      } catch (error) {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
        navigate({ to: '/' });
      }
    }

    void accept();
  }, [token, isAuthenticated, navigate]);

  if (!token) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="max-w-sm space-y-2 text-center">
          <h1 className="text-lg font-semibold">Link inválido</h1>
          <p className="text-muted-foreground text-sm">
            O link de convite está incompleto ou expirou. Solicite um novo convite ao organizador
            do campeonato.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2Icon className="text-link size-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Processando convite…</p>
      </div>
    </div>
  );
}
