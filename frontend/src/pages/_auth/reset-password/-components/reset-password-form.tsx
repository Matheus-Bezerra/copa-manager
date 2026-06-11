import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '@/http/hooks/auth/use-reset-password';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

const resetPasswordSchema = zod
  .object({
    code: zod
      .string()
      .length(6, 'O código deve ter 6 dígitos')
      .regex(/^\d+$/, 'O código deve conter apenas números'),
    newPassword: zod.string().min(8),
    confirmPassword: zod.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { mutateAsync: resetPwd, isPending } = useResetPassword({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit({ code, newPassword }: ResetPasswordFormData) {
    await resetPwd({ data: { code, newPassword } });
    toast.success('Senha redefinida com sucesso!');
    navigate({ to: '/sign-in' });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="code">Código de verificação</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          autoComplete="one-time-code"
          aria-invalid={!!errors.code}
          className="text-center tracking-[0.5em] text-lg font-semibold"
          {...register('code')}
        />
        <FormErrorMessage message={errors.code?.message} />
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

      <ButtonLoading type="submit" className="w-full" loading={isPending}>
        Redefinir senha
      </ButtonLoading>
    </form>
  );
}
