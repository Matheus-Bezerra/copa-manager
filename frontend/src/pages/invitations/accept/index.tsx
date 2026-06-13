import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { acceptInvitation } from '@/http/hooks/members/use-accept-invitation';
import { useAuthStore } from '@/stores/auth-store';
import { buildInvitationAcceptRedirect } from '@/utils/invitation-redirect';
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
    if (!token || !isAuthenticated) {
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

  if (!isAuthenticated) {
    const redirect = buildInvitationAcceptRedirect(token);

    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 rounded-xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="space-y-2 text-center">
            <img
              src="/static/logo.png"
              alt="Copa Manager"
              className="mx-auto h-12 w-12"
            />
            <h1 className="text-xl font-semibold tracking-tight">Convite para campeonato</h1>
            <p className="text-muted-foreground text-sm">
              Entre com sua conta ou crie uma nova usando o mesmo e-mail que recebeu o convite.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/sign-in" search={{ redirect }}>
                Entrar
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/register" search={{ redirect }}>
                Criar conta
              </Link>
            </Button>
          </div>
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
