import { createFileRoute, Link } from '@tanstack/react-router';

import { AuthPageShell } from '../-components/auth-page-shell';
import { ResetPasswordForm } from './-components/reset-password-form';

export const Route = createFileRoute('/_auth/reset-password/')({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Redefinir senha' }],
  }),
});

function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Redefinir senha"
      description="Digite o código de 6 dígitos enviado para o seu e-mail e escolha uma nova senha"
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Não recebeu o código?{' '}
          <Link
            to="/forgot-password"
            className="text-link font-medium underline-offset-4 hover:underline"
          >
            Reenviar
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
