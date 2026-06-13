import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
import { InvitationRedirectNotice } from '../-components/invitation-redirect-notice';
import { isInvitationAcceptRedirect } from '@/utils/invitation-redirect';
import { SignInForm } from './-components/sign-in-form';

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/_auth/sign-in/')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: SignInPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Entrar' }],
  }),
});

function SignInPage() {
  const { redirect } = Route.useSearch();
  const isInvitationFlow = isInvitationAcceptRedirect(redirect);

  return (
    <AuthPageShell
      title="Entrar"
      description={
        isInvitationFlow
          ? 'Entre com o e-mail que recebeu o convite'
          : 'Acesse sua conta para gerenciar campeonatos'
      }
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            search={redirect ? { redirect } : undefined}
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <InvitationRedirectNotice redirect={redirect} />
        <SignInForm />
      </div>
    </AuthPageShell>
  );
}
