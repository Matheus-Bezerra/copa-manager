import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z as zod } from '@/lib/zod';
import { cn } from '@/lib/utils';

const hexColorSchema = zod
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato: #RRGGBB')
  .optional()
  .or(zod.literal(''));

const teamSchema = zod.object({
  name: zod.string().min(1).max(100),
  shortName: zod.string().min(1).max(3).optional().or(zod.literal('')),
  logoUrl: zod.url().optional().or(zod.literal('')),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
});

export type TeamFormData = z.infer<typeof teamSchema>;

type TeamFormProps = {
  defaultValues?: Partial<TeamFormData>;
  onSubmit: (data: TeamFormData) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
};

const emptyDefaults: TeamFormData = {
  name: '',
  shortName: '',
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
};

function ColorField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const pickerValue = value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#000000';

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'size-9 shrink-0 rounded-md border border-border',
            !value && 'bg-muted',
          )}
          style={value ? { backgroundColor: value } : undefined}
        />
        <Input
          id={id}
          type="color"
          className="h-9 w-12 shrink-0 cursor-pointer p-1"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          type="text"
          placeholder="#FF0000"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
        />
      </div>
      <FormErrorMessage message={error} />
    </div>
  );
}

export function TeamForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: TeamFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  useEffect(() => {
    reset({ ...emptyDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="team-name">Nome</Label>
        <Input
          id="team-name"
          type="text"
          placeholder="Time FC"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FormErrorMessage message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="team-shortName">Sigla</Label>
        <Input
          id="team-shortName"
          type="text"
          placeholder="TM"
          maxLength={3}
          aria-invalid={!!errors.shortName}
          {...register('shortName')}
        />
        <FormErrorMessage message={errors.shortName?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="team-logoUrl">URL do logo</Label>
        <Input
          id="team-logoUrl"
          type="url"
          placeholder="https://exemplo.com/logo.png"
          aria-invalid={!!errors.logoUrl}
          {...register('logoUrl')}
        />
        <FormErrorMessage message={errors.logoUrl?.message} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="primaryColor"
          control={control}
          render={({ field }) => (
            <ColorField
              id="team-primaryColor"
              label="Cor primária"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.primaryColor?.message}
            />
          )}
        />

        <Controller
          name="secondaryColor"
          control={control}
          render={({ field }) => (
            <ColorField
              id="team-secondaryColor"
              label="Cor secundária"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.secondaryColor?.message}
            />
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <ButtonLoading type="submit" loading={isPending}>
          {submitLabel}
        </ButtonLoading>
      </div>
    </form>
  );
}

export function toTeamPayload(data: TeamFormData) {
  return {
    name: data.name,
    shortName: data.shortName || null,
    logoUrl: data.logoUrl || null,
    primaryColor: data.primaryColor || null,
    secondaryColor: data.secondaryColor || null,
  };
}
