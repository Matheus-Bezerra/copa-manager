import { createFileRoute, Link } from '@tanstack/react-router';

import { SignInForm } from './-components/sign-in-form';

export const Route = createFileRoute('/_auth/sign-in/')({
  component: SignInPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Entrar' }],
  }),
});

function SignInPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <img src="/static/logo.png" alt="Copa Manager" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-muted-foreground text-sm">
          Acesse sua conta para gerenciar campeonatos
        </p>
      </div>

      <SignInForm />

      <p className="text-muted-foreground text-center text-sm">
        Não tem uma conta?{' '}
        <Link to="/register" className="text-foreground font-medium underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
