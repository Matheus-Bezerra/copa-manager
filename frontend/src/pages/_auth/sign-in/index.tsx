import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
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
  return (
    <AuthPageShell
      title="Entrar"
      description="Acesse sua conta para gerenciar campeonatos"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthPageShell>
  );
}
