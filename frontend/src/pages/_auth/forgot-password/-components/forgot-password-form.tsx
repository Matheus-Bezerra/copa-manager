import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/http/hooks/auth/use-forgot-password';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

const forgotPasswordSchema = zod.object({
  email: zod.email(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutateAsync: sendRecovery, isPending } = useForgotPassword({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit(formData: ForgotPasswordFormData) {
    await sendRecovery({ data: formData });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm font-medium">E-mail enviado!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Verifique sua caixa de entrada. Enviamos um código de 6 dígitos para redefinir
            sua senha. Ele expira em 15 minutos.
          </p>
        </div>
        <Link
          to="/reset-password"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Inserir código
        </Link>
      </div>
    );
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

      <ButtonLoading type="submit" className="w-full" loading={isPending}>
        Enviar instruções
      </ButtonLoading>
    </form>
  );
}
