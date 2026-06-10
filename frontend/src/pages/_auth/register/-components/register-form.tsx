import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/http/hooks/auth/use-register';
import { z as zod } from '@/lib/zod';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';

const registerSchema = zod
  .object({
    name: zod.string().min(2),
    email: zod.email(),
    password: zod.string().min(8),
    confirmPassword: zod.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const { mutateAsync: createAccount, isPending } = useRegister({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit({ name, email, password }: RegisterFormData) {
    const result = await createAccount({ data: { name, email, password } });
    login(result.user, result.accessToken, result.refreshToken);
    navigate({ to: '/app' });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome completo"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FormErrorMessage message={errors.name?.message} />
      </div>

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
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <FormErrorMessage message={errors.password?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        <FormErrorMessage message={errors.confirmPassword?.message} />
      </div>

      <ButtonLoading type="submit" className="w-full" loading={isPending}>
        Criar conta
      </ButtonLoading>
    </form>
  );
}
