import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
import { RegisterForm } from './-components/register-form';

export const Route = createFileRoute('/_auth/register/')({
  component: RegisterPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Criar conta' }],
  }),
});

function RegisterPage() {
  return (
    <AuthPageShell
      title="Criar conta"
      description="Preencha os dados abaixo para começar"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Já tem uma conta?{' '}
          <Link
            to="/sign-in"
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
