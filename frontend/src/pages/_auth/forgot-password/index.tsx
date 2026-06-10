import { createFileRoute, Link } from '@tanstack/react-router';

import { ForgotPasswordForm } from './-components/forgot-password-form';

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Recuperar senha' }],
  }),
});

function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <img src="/static/logo.png" alt="Copa Manager" className="mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
        <p className="text-muted-foreground text-sm">
          Informe seu e-mail e enviaremos as instruções de recuperação
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-muted-foreground text-center text-sm">
        Lembrou a senha?{' '}
        <Link to="/sign-in" className="text-foreground font-medium underline-offset-4 hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </div>
  );
}
