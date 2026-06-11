import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
import { ForgotPasswordForm } from './-components/forgot-password-form';

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Recuperar senha' }],
  }),
});

function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Recuperar senha"
      description="Informe seu e-mail e enviaremos as instruções de recuperação"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Lembrou a senha?{' '}
          <Link
            to="/sign-in"
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Voltar para entrar
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
