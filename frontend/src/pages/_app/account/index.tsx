import { createFileRoute } from '@tanstack/react-router';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getProfileQueryOptions } from '@/http/hooks/user/use-get-profile';

import { ChangePasswordForm } from './-components/change-password-form';

export const Route = createFileRoute('/_app/account/')({
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getProfileQueryOptions());
  },
  component: AccountPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Minha conta' }],
  }),
});

function AccountPage() {
  const profile = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Minha conta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie seus dados de acesso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados pessoais</CardTitle>
          <CardDescription>Informações da sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Nome
            </p>
            <p className="mt-1 font-medium">{profile.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              E-mail
            </p>
            <p className="mt-1 font-medium">{profile.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alterar senha</CardTitle>
          <CardDescription>
            Após salvar, você precisará entrar novamente com a nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
