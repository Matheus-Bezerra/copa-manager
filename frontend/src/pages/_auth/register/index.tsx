import { createFileRoute, Link } from '@tanstack/react-router';

import { RegisterForm } from './-components/register-form';

export const Route = createFileRoute('/_auth/register/')({
  component: RegisterPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Criar conta' }],
  }),
});

function RegisterPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <img src="/static/logo.png" alt="Copa Manager" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground text-sm">
          Preencha os dados abaixo para começar
        </p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        Já tem uma conta?{' '}
        <Link to="/sign-in" className="text-foreground font-medium underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
