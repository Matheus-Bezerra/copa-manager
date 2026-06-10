import { createFileRoute, Link } from '@tanstack/react-router';

import { ResetPasswordForm } from './-components/reset-password-form';

export const Route = createFileRoute('/_auth/reset-password/')({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Redefinir senha' }],
  }),
});

function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <img src="/static/logo.png" alt="Copa Manager" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-semibold tracking-tight">Redefinir senha</h1>
        <p className="text-muted-foreground text-sm">
          Digite o código de 6 dígitos enviado para o seu e-mail e escolha uma nova senha
        </p>
      </div>

      <ResetPasswordForm />

      <p className="text-muted-foreground text-center text-sm">
        Não recebeu o código?{' '}
        <Link
          to="/forgot-password"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          Reenviar
        </Link>
      </p>
    </div>
  );
}
