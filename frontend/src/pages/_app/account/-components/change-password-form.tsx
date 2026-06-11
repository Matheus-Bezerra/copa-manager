import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/http/hooks/auth/use-change-password';
import { z as zod } from '@/lib/zod';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';

const passwordSchema = zod
  .string()
  .min(6, 'A senha deve ter no mínimo 6 caracteres')
  .refine((value) => /[A-Z]/.test(value), {
    message: 'A senha deve conter ao menos uma letra maiúscula',
  })
  .refine((value) => /[a-z]/.test(value), {
    message: 'A senha deve conter ao menos uma letra minúscula',
  })
  .refine((value) => /[0-9]/.test(value), {
    message: 'A senha deve conter ao menos um número',
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: 'A senha deve conter ao menos um símbolo',
  });

const changePasswordSchema = zod
  .object({
    currentPassword: zod.string().min(1, 'Informe a senha atual'),
    newPassword: passwordSchema,
    confirmPassword: zod.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { mutateAsync: changePwd, isPending } = useChangePassword({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit({ currentPassword, newPassword }: ChangePasswordFormData) {
    await changePwd({ data: { currentPassword, newPassword } });
    reset();
    logout();
    toast.success('Senha alterada com sucesso!', {
      description: 'Faça login novamente com a nova senha.',
    });
    navigate({ to: '/sign-in' });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <PasswordInput
          id="currentPassword"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register('currentPassword')}
        />
        <FormErrorMessage message={errors.currentPassword?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">Nova senha</Label>
        <PasswordInput
          id="newPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register('newPassword')}
        />
        <FormErrorMessage message={errors.newPassword?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        <FormErrorMessage message={errors.confirmPassword?.message} />
      </div>

      <ButtonLoading type="submit" loading={isPending}>
        Salvar nova senha
      </ButtonLoading>
    </form>
  );
}
