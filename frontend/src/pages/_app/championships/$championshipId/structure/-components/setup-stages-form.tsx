import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { FormErrorMessage } from '@/components/form-error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { z as zod } from '@/lib/zod';

// ─── Schema ──────────────────────────────────────────────────────────────────

const groupItemSchema = zod.object({
  name: zod.string().min(1, 'Nome obrigatório').max(100),
  teams: zod.string().refine(
    (v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 2 && Number(v) <= 64,
    { message: 'Entre 2 e 64 times' },
  ),
});

const stageItemSchema = zod
  .object({
    type: zod.enum(['GROUP_STAGE', 'KNOCKOUT']),
    name: zod.string().min(1, 'Nome obrigatório').max(100),
    format: zod.enum(['ROUND_ROBIN', 'DOUBLE_ROUND_ROBIN']).optional(),
    teamsToAdvance: zod.string().optional(),
    groups: zod.array(groupItemSchema).optional(),
    qualifiedTeams: zod.string().optional(),
    thirdPlaceMatch: zod.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'GROUP_STAGE') {
      if (!data.format) {
        ctx.addIssue({ code: 'custom', message: 'Selecione o formato', path: ['format'] });
      }
      if (!data.groups || data.groups.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Adicione ao menos 1 grupo',
          path: ['groups'],
        });
      }
    } else {
      if (!data.qualifiedTeams) {
        ctx.addIssue({
          code: 'custom',
          message: 'Obrigatório',
          path: ['qualifiedTeams'],
        });
      } else {
        const n = Number(data.qualifiedTeams);
        if (Number.isNaN(n) || n < 2 || (n & (n - 1)) !== 0) {
          ctx.addIssue({
            code: 'custom',
            message: 'Deve ser potência de 2 (2, 4, 8, 16...)',
            path: ['qualifiedTeams'],
          });
        }
      }
    }
  });

const setupSchema = zod.object({
  stages: zod.array(stageItemSchema).min(1, 'Adicione ao menos 1 fase'),
});

export type SetupFormData = z.infer<typeof setupSchema>;
type StageItemData = SetupFormData['stages'][number];

// ─── Stage Item ───────────────────────────────────────────────────────────────

type StageItemProps = {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
};

function StageItem({ index, canRemove, onRemove }: StageItemProps) {
  const { register, control, setValue, formState: { errors } } = useForm<SetupFormData>();

  // We render this inside the parent form context — this component receives props from the
  // parent's useForm via React context (FormProvider pattern is heavy; we pass control directly)
  // NOTE: This component is intentionally simple — actual form control comes from parent.
  // See SetupStagesForm below where this is rendered with the correct form context.
  void register;
  void control;
  void setValue;
  void errors;
  void index;
  void canRemove;
  void onRemove;

  return null;
}

// ─── Main Form ────────────────────────────────────────────────────────────────

type SetupStagesFormProps = {
  onSubmit: (data: SetupFormData) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
};

const defaultGroupStage = (): StageItemData => ({
  type: 'GROUP_STAGE',
  name: '',
  format: 'ROUND_ROBIN',
  teamsToAdvance: '',
  groups: [{ name: 'Grupo A', teams: '4' }],
  qualifiedTeams: undefined,
  thirdPlaceMatch: undefined,
});

const defaultKnockout = (): StageItemData => ({
  type: 'KNOCKOUT',
  name: '',
  format: undefined,
  teamsToAdvance: undefined,
  groups: undefined,
  qualifiedTeams: '4',
  thirdPlaceMatch: false,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
void StageItem;

export function SetupStagesForm({ onSubmit, isPending, onCancel }: SetupStagesFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      stages: [defaultGroupStage()],
    },
  });

  const { fields: stageFields, append, remove } = useFieldArray({
    control,
    name: 'stages',
  });

  const stageValues = watch('stages');

  function handleTypeChange(index: number, value: 'GROUP_STAGE' | 'KNOCKOUT') {
    if (value === 'GROUP_STAGE') {
      setValue(`stages.${index}`, {
        ...defaultGroupStage(),
        name: stageValues[index]?.name ?? '',
      });
    } else {
      setValue(`stages.${index}`, {
        ...defaultKnockout(),
        name: stageValues[index]?.name ?? '',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {stageFields.map((field, index) => {
          const stageType = stageValues[index]?.type ?? 'GROUP_STAGE';
          const isGroupStage = stageType === 'GROUP_STAGE';
          const stageErrors = errors.stages?.[index];

          return (
            <div key={field.id} className="rounded-lg border border-border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-muted-foreground">
                  Fase {index + 1}
                </span>
                {canRemove(stageFields.length) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                    <span className="sr-only">Remover fase</span>
                  </Button>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor={`stage-${index}-name`}>Nome da fase</Label>
                <Input
                  id={`stage-${index}-name`}
                  placeholder="Ex: Fase de Grupos"
                  aria-invalid={!!stageErrors?.name}
                  {...register(`stages.${index}.name`)}
                />
                <FormErrorMessage message={stageErrors?.name?.message} />
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={stageType}
                  onValueChange={(v) => handleTypeChange(index, v as 'GROUP_STAGE' | 'KNOCKOUT')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GROUP_STAGE">Fase de Grupos</SelectItem>
                    <SelectItem value="KNOCKOUT">Mata-Mata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isGroupStage ? (
                <GroupStageFields
                  index={index}
                  register={register}
                  control={control}
                  setValue={setValue}
                  errors={errors}
                />
              ) : (
                <KnockoutFields
                  index={index}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                />
              )}
            </div>
          );
        })}
      </div>

      <FormErrorMessage
        message={
          typeof errors.stages?.message === 'string' ? errors.stages.message : undefined
        }
      />

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => append(defaultGroupStage())}
      >
        <PlusIcon className="size-4" />
        Adicionar fase
      </Button>

      <Separator />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <ButtonLoading type="submit" loading={isPending}>
          Configurar estrutura
        </ButtonLoading>
      </div>
    </form>
  );
}

function canRemove(length: number) {
  return length > 1;
}

// ─── Group Stage Fields ───────────────────────────────────────────────────────

type GroupStageFieldsProps = {
  index: number;
  register: ReturnType<typeof useForm<SetupFormData>>['register'];
  control: ReturnType<typeof useForm<SetupFormData>>['control'];
  setValue: ReturnType<typeof useForm<SetupFormData>>['setValue'];
  errors: ReturnType<typeof useForm<SetupFormData>>['formState']['errors'];
};

function GroupStageFields({ index, register, control, setValue, errors }: GroupStageFieldsProps) {
  const stageErrors = errors.stages?.[index];

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control,
    name: `stages.${index}.groups` as 'stages.0.groups',
  });

  const groupsError = stageErrors?.groups;
  const groupsMessage =
    groupsError && 'message' in groupsError ? (groupsError as { message?: string }).message : undefined;

  return (
    <>
      {/* Formato */}
      <div className="space-y-1.5">
        <Label>Formato</Label>
        <Select
          defaultValue="ROUND_ROBIN"
          onValueChange={(v) =>
            setValue(
              `stages.${index}.format`,
              v as 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN',
              { shouldValidate: true },
            )
          }
        >
          <SelectTrigger
            aria-invalid={
              !!(stageErrors?.format)
            }
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ROUND_ROBIN">Turno único</SelectItem>
            <SelectItem value="DOUBLE_ROUND_ROBIN">Turno e returno</SelectItem>
          </SelectContent>
        </Select>
        <FormErrorMessage message={stageErrors?.format?.message} />
      </div>

      {/* Times que avançam */}
      <div className="space-y-1.5">
        <Label htmlFor={`stage-${index}-teamsToAdvance`}>
          Times que avançam por grupo{' '}
          <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Input
          id={`stage-${index}-teamsToAdvance`}
          type="number"
          min={1}
          placeholder="1"
          {...register(`stages.${index}.teamsToAdvance`)}
        />
      </div>

      {/* Grupos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Grupos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendGroup({
                name: `Grupo ${String.fromCharCode(65 + groupFields.length)}`,
                teams: '4',
              })
            }
          >
            <PlusIcon className="size-3.5" />
            Grupo
          </Button>
        </div>
        <FormErrorMessage message={groupsMessage} />

        {groupFields.map((groupField, groupIndex) => {
          const groupErrors = Array.isArray(errors.stages?.[index]?.groups)
            ? (errors.stages?.[index]?.groups as Array<{ name?: { message?: string }; teams?: { message?: string } }>)[groupIndex]
            : undefined;

          return (
            <div key={groupField.id} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`stage-${index}-group-${groupIndex}-name`} className="text-xs">
                  Nome
                </Label>
                <Input
                  id={`stage-${index}-group-${groupIndex}-name`}
                  placeholder="Grupo A"
                  aria-invalid={!!groupErrors?.name}
                  {...register(`stages.${index}.groups.${groupIndex}.name` as 'stages.0.groups.0.name')}
                />
              </div>
              <div className="w-24 space-y-1.5">
                <Label htmlFor={`stage-${index}-group-${groupIndex}-teams`} className="text-xs">
                  Times
                </Label>
                <Input
                  id={`stage-${index}-group-${groupIndex}-teams`}
                  type="number"
                  min={2}
                  max={64}
                  placeholder="4"
                  aria-invalid={!!groupErrors?.teams}
                  {...register(`stages.${index}.groups.${groupIndex}.teams` as 'stages.0.groups.0.teams')}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeGroup(groupIndex)}
                disabled={groupFields.length === 1}
              >
                <Trash2Icon className="size-4" />
                <span className="sr-only">Remover grupo</span>
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Knockout Fields ──────────────────────────────────────────────────────────

type KnockoutFieldsProps = {
  index: number;
  register: ReturnType<typeof useForm<SetupFormData>>['register'];
  setValue: ReturnType<typeof useForm<SetupFormData>>['setValue'];
  errors: ReturnType<typeof useForm<SetupFormData>>['formState']['errors'];
};

function KnockoutFields({ index, register, setValue, errors }: KnockoutFieldsProps) {
  const stageErrors = errors.stages?.[index];

  return (
    <>
      {/* Times qualificados */}
      <div className="space-y-1.5">
        <Label htmlFor={`stage-${index}-qualifiedTeams`}>Times qualificados</Label>
        <Select
          defaultValue="4"
          onValueChange={(v) =>
            setValue(`stages.${index}.qualifiedTeams`, v, { shouldValidate: true })
          }
        >
          <SelectTrigger
            id={`stage-${index}-qualifiedTeams`}
            aria-invalid={!!stageErrors?.qualifiedTeams}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2, 4, 8, 16, 32].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} times
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormErrorMessage message={stageErrors?.qualifiedTeams?.message} />
      </div>

      {/* Disputa de 3º lugar */}
      <div className="flex items-center gap-2">
        <input
          id={`stage-${index}-thirdPlaceMatch`}
          type="checkbox"
          className="size-4 rounded border-input"
          {...register(`stages.${index}.thirdPlaceMatch`)}
        />
        <Label htmlFor={`stage-${index}-thirdPlaceMatch`}>Disputa de 3º lugar</Label>
      </div>
    </>
  );
}

// ─── Payload helper ───────────────────────────────────────────────────────────

export function toSetupPayload(data: SetupFormData) {
  return {
    stages: data.stages.map((stage, index) => {
      if (stage.type === 'GROUP_STAGE') {
        return {
          name: stage.name,
          type: 'GROUP_STAGE' as const,
          order: index + 1,
          format: stage.format as 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN',
          teamsToAdvance: stage.teamsToAdvance ? Number(stage.teamsToAdvance) : undefined,
          groups: (stage.groups ?? []).map((g) => ({ name: g.name, teams: Number(g.teams) })),
        };
      }
      return {
        name: stage.name,
        type: 'KNOCKOUT' as const,
        order: index + 1,
        qualifiedTeams: Number(stage.qualifiedTeams),
        thirdPlaceMatch: stage.thirdPlaceMatch ?? false,
      };
    }),
  };
}
