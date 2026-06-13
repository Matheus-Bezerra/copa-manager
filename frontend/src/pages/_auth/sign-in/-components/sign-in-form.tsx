import { zodResolver } from '@hookform/resolvers/zod';
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/http/hooks/auth/use-login';
import { z as zod } from '@/lib/zod';
import { useAuthStore } from '@/stores/auth-store';
import { followAuthRedirect } from '@/utils/invitation-redirect';
import { errorHandler } from '@/utils/error-handler';

const signInRouteApi = getRouteApi('/_auth/sign-in/');

const signInSchema = zod.object({
  email: zod.email(),
  password: zod.string().min(8),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const navigate = useNavigate();
  const { redirect } = signInRouteApi.useSearch();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const { mutateAsync: signIn, isPending } = useLogin({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit(formData: SignInFormData) {
    const result = await signIn({ data: formData });
    login(result.user, result.accessToken, result.refreshToken);

    if (followAuthRedirect(redirect)) {
      return;
    }

    navigate({ to: '/' });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FormErrorMessage message={errors.email?.message} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link
            to="/forgot-password"
            className="text-link text-xs underline-offset-4 hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <FormErrorMessage message={errors.password?.message} />
      </div>

      <ButtonLoading type="submit" className="w-full" loading={isPending}>
        Entrar
      </ButtonLoading>
    </form>
  );
}
