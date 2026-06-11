import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { TeamAvatar, TeamSelectOption } from '@/components/team-avatar';
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
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import { z as zod } from '@/lib/zod';

const playerSchema = zod.object({
  teamId: zod.string().min(1, 'Selecione um time'),
  name: zod.string().min(1).max(100),
  shirtNumber: zod
    .string()
    .regex(/^\d*$/, 'Informe apenas números')
    .refine((value) => value === '' || (Number(value) >= 0 && Number(value) <= 999), {
      message: 'Número entre 0 e 999',
    })
    .optional()
    .or(zod.literal('')),
});

export type PlayerFormData = z.infer<typeof playerSchema>;

type PlayerFormProps = {
  championshipId: string;
  defaultValues?: Partial<PlayerFormData>;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
  submitLabel: string;
};

const emptyDefaults: PlayerFormData = {
  teamId: '',
  name: '',
  shirtNumber: '',
};

export function PlayerForm({
  championshipId,
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
  submitLabel,
}: PlayerFormProps) {
  const { data: teamsData, isPending: isTeamsPending } = useFetchTeams(championshipId);
  const teams = teamsData?.teams ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: { ...emptyDefaults, ...defaultValues },
  });

  const selectedTeamId = watch('teamId');
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  useEffect(() => {
    reset({ ...emptyDefaults, ...defaultValues });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="player-teamId">Time</Label>
        <Select
          value={selectedTeamId || undefined}
          onValueChange={(value) => setValue('teamId', value, { shouldValidate: true })}
          disabled={isTeamsPending || teams.length === 0}
        >
          <SelectTrigger id="player-teamId" aria-invalid={!!errors.teamId}>
            {selectedTeam ? (
              <span className="flex items-center gap-2">
                <TeamAvatar team={selectedTeam} size="xs" />
                <span className="truncate">{selectedTeam.name}</span>
              </span>
            ) : (
              <SelectValue placeholder={isTeamsPending ? 'Carregando…' : 'Selecione um time'} />
            )}
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                <TeamSelectOption team={team} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormErrorMessage message={errors.teamId?.message} />
        {!isTeamsPending && teams.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Cadastre pelo menos um time antes de adicionar jogadores.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="player-name">Nome</Label>
        <Input
          id="player-name"
          type="text"
          placeholder="Matheus Silva"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FormErrorMessage message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="player-shirtNumber">Número da camisa</Label>
        <Input
          id="player-shirtNumber"
          type="number"
          min={0}
          max={999}
          placeholder="10"
          aria-invalid={!!errors.shirtNumber}
          {...register('shirtNumber')}
        />
        <FormErrorMessage message={errors.shirtNumber?.message} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <ButtonLoading type="submit" loading={isPending} disabled={teams.length === 0}>
          {submitLabel}
        </ButtonLoading>
      </div>
    </form>
  );
}

export function toPlayerPayload(data: PlayerFormData) {
  return {
    teamId: data.teamId,
    name: data.name,
    shirtNumber:
      !data.shirtNumber || data.shirtNumber === '' ? null : Number(data.shirtNumber),
  };
}
