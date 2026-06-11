import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { DatePicker } from '@/components/date-picker';
import { FormErrorMessage } from '@/components/form-error-message';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { fetchChampionshipsQueryKey } from '@/http/hooks/championships/use-fetch-championships';
import { getChampionshipQueryKey } from '@/http/hooks/championships/use-get-championship';
import { useDeleteChampionship } from '@/http/hooks/championships/use-delete-championship';
import { useUpdateChampionship } from '@/http/hooks/championships/use-update-championship';
import type { Championship } from '@/http/types/championships/championship';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

const updateChampionshipSchema = zod
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

type UpdateChampionshipFormData = z.infer<typeof updateChampionshipSchema>;

function toDateInputValue(value: string) {
  return value.split('T')[0] ?? value;
}

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<{ code?: string; error?: { code: string } }>;
  return axiosError.response?.data?.error?.code ?? axiosError.response?.data?.code;
}

type UpdateChampionshipFormProps = {
  championship: Championship;
  isOwner: boolean;
  onDeleteSuccess: () => void;
};

export function UpdateChampionshipForm({
  championship,
  isOwner,
  onDeleteSuccess,
}: UpdateChampionshipFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<UpdateChampionshipFormData>({
    resolver: zodResolver(updateChampionshipSchema),
    defaultValues: {
      name: championship.name,
      description: championship.description ?? '',
      startDate: toDateInputValue(championship.startDate),
      endDate: toDateInputValue(championship.endDate),
    },
  });

  const startDate = watch('startDate');

  const { mutateAsync: updateChampionship, isPending: isUpdating } = useUpdateChampionship({
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

  const { mutateAsync: deleteChampionship, isPending: isDeleting } = useDeleteChampionship({
    mutation: {
      onError: (error) => {
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function onSubmit(formData: UpdateChampionshipFormData) {
    await updateChampionship({
      championshipId: championship.id,
      data: {
        name: formData.name,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getChampionshipQueryKey(championship.id) }),
      queryClient.invalidateQueries({ queryKey: fetchChampionshipsQueryKey() }),
    ]);

    toast.success('Campeonato atualizado');
  }

  async function handleDelete() {
    await deleteChampionship({ championshipId: championship.id });
    await queryClient.invalidateQueries({ queryKey: fetchChampionshipsQueryKey() });
    toast.success('Campeonato excluído');
    onDeleteSuccess();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Nome</Label>
          <Input
            id="edit-name"
            type="text"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FormErrorMessage message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-description">Descrição</Label>
          <textarea
            id="edit-description"
            placeholder="Descreva o campeonato (opcional)"
            aria-invalid={!!errors.description}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...register('description')}
          />
          <FormErrorMessage message={errors.description?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-startDate">Data de início</Label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-startDate"
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!errors.startDate}
                />
              )}
            />
            <FormErrorMessage message={errors.startDate?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-endDate">Data de término</Label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="edit-endDate"
                  value={field.value}
                  onChange={field.onChange}
                  min={startDate}
                  aria-invalid={!!errors.endDate}
                />
              )}
            />
            <FormErrorMessage message={errors.endDate?.message} />
          </div>
        </div>

        <div className="flex justify-end">
          <ButtonLoading type="submit" loading={isUpdating}>
            Salvar alterações
          </ButtonLoading>
        </div>
      </form>

      {isOwner && (
        <>
          <Separator />
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <h3 className="text-sm font-semibold text-destructive">Zona de perigo</h3>
              <p className="text-muted-foreground text-sm">
                Excluir o campeonato remove permanentemente todos os dados associados.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  Excluir campeonato
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir campeonato?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O campeonato{' '}
                    <strong>{championship.name}</strong> e todos os seus dados serão removidos
                    permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                    onClick={(event) => {
                      event.preventDefault();
                      void handleDelete();
                    }}
                  >
                    {isDeleting ? 'Excluindo…' : 'Excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}
