import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { DatePicker } from '@/components/date-picker';
import { FormErrorMessage } from '@/components/form-error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchChampionshipsQueryKey } from '@/http/hooks/championships/use-fetch-championships';
import { useCreateChampionship } from '@/http/hooks/championships/use-create-championship';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

const createChampionshipSchema = zod
  .object({
    name: zod.string().min(1).max(100),
    description: zod.string().max(500).optional().or(zod.literal('')),
    startDate: zod.string().min(1, 'Campo obrigatório'),
    endDate: zod.string().min(1, 'Campo obrigatório'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'A data de término deve ser posterior à data de início',
    path: ['endDate'],
  });

type CreateChampionshipFormData = z.infer<typeof createChampionshipSchema>;

const today = new Date().toISOString().split('T')[0];

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<{ code?: string; error?: { code: string } }>;
  return axiosError.response?.data?.error?.code ?? axiosError.response?.data?.code;
}

type CreateChampionshipFormProps = {
  onCancel?: () => void;
  onSuccess?: (championshipId: string) => void;
};

export function CreateChampionshipForm({ onCancel, onSuccess }: CreateChampionshipFormProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateChampionshipFormData>({
    resolver: zodResolver(createChampionshipSchema),
  });

  const startDate = watch('startDate');

  const { mutateAsync: createChampionship, isPending } = useCreateChampionship({
    mutation: {
      onError: (error) => {
        const code = getApiErrorCode(error);

        if (code === 'CHAMPIONSHIP/NAME_ALREADY_EXISTS') {
          setError('name', { message: 'Já existe um campeonato com esse nome' });
          return;
        }

        const { code: errorCode, description } = errorHandler(error);
        toast.error(errorCode, { description });
      },
    },
  });

  async function onSubmit(formData: CreateChampionshipFormData) {
    const { championship } = await createChampionship({
      data: {
        name: formData.name,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });

    await queryClient.invalidateQueries({ queryKey: fetchChampionshipsQueryKey() });

    if (onSuccess) {
      onSuccess(championship.id);
      return;
    }

    navigate({
      to: '/championships/$championshipId',
      params: { championshipId: championship.id },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="create-name">Nome</Label>
        <Input
          id="create-name"
          type="text"
          placeholder="Copa AD Tatuapé"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FormErrorMessage message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="create-description">Descrição</Label>
        <textarea
          id="create-description"
          placeholder="Descreva o campeonato (opcional)"
          aria-invalid={!!errors.description}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        <FormErrorMessage message={errors.description?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="create-startDate">Data de início</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="create-startDate"
                value={field.value}
                onChange={field.onChange}
                min={today}
                aria-invalid={!!errors.startDate}
              />
            )}
          />
          <FormErrorMessage message={errors.startDate?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="create-endDate">Data de término</Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                id="create-endDate"
                value={field.value}
                onChange={field.onChange}
                min={startDate || today}
                aria-invalid={!!errors.endDate}
              />
            )}
          />
          <FormErrorMessage message={errors.endDate?.message} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : (
          <Button type="button" variant="outline" asChild>
            <Link to="/">Cancelar</Link>
          </Button>
        )}
        <ButtonLoading type="submit" loading={isPending}>
          Criar campeonato
        </ButtonLoading>
      </div>
    </form>
  );
}
