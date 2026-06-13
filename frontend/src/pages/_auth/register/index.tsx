import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
import { InvitationRedirectNotice } from '../-components/invitation-redirect-notice';
import { isInvitationAcceptRedirect } from '@/utils/invitation-redirect';
import { RegisterForm } from './-components/register-form';

type RegisterSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/_auth/register/')({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: RegisterPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Criar conta' }],
  }),
});

function RegisterPage() {
  const { redirect } = Route.useSearch();
  const isInvitationFlow = isInvitationAcceptRedirect(redirect);

  return (
    <AuthPageShell
      title="Criar conta"
      description={
        isInvitationFlow
          ? 'Cadastre-se com o e-mail que recebeu o convite'
          : 'Preencha os dados abaixo para começar'
      }
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Já tem uma conta?{' '}
          <Link
            to="/sign-in"
            search={redirect ? { redirect } : undefined}
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <InvitationRedirectNotice redirect={redirect} />
        <RegisterForm />
      </div>
    </AuthPageShell>
  );
}
