import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { DateTimePicker } from '@/components/datetime-picker';
import { FormErrorMessage } from '@/components/form-error-message';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateMatch } from '@/http/hooks/matches/use-create-match';
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import { errorHandler } from '@/utils/error-handler';
import { localDatetimeToIso } from '@/utils/datetime';
import { z as zod } from '@/lib/zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/matches/create/',
)({
  component: CreateMatchPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Nova partida' }] }),
});

const matchSchema = zod
  .object({
    stageId: zod.string().min(1, 'Selecione uma fase'),
    roundId: zod.string().min(1, 'Selecione uma rodada'),
    groupId: zod.string().optional(),
    homeTeamId: zod.string().optional(),
    awayTeamId: zod.string().optional(),
    scheduledAt: zod.string().optional(),
  })
  .refine(
    (data) =>
      !data.homeTeamId || !data.awayTeamId || data.homeTeamId !== data.awayTeamId,
    {
      message: 'O time mandante e visitante devem ser diferentes.',
      path: ['awayTeamId'],
    },
  );

type MatchFormData = z.infer<typeof matchSchema>;

function getApiErrorCode(error: unknown): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = error as any;
  return e?.response?.data?.error?.code ?? e?.response?.data?.code;
}

function CreateMatchPage() {
  const { championshipId } = Route.useParams();
  const navigate = useNavigate();

  const { data: structureData } = useGetChampionshipStructure(championshipId);
  const { data: teamsData } = useFetchTeams(championshipId);

  const stages = structureData?.stages ?? [];
  const teams = teamsData?.teams ?? [];

  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');

  const selectedStage = useMemo(
    () => stages.find((s) => s.id === selectedStageId) ?? null,
    [stages, selectedStageId],
  );

  const rounds = selectedStage?.rounds ?? [];
  const groups = selectedStage?.type === 'GROUP_STAGE' ? (selectedStage.groups ?? []) : [];
  const isGroupStage = selectedStage?.type === 'GROUP_STAGE';

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const homeTeamId = watch('homeTeamId');
  const awayTeamId = watch('awayTeamId');

  const { mutateAsync: createMatch, isPending } = useCreateMatch({
    mutation: {
      onError: (mutationError) => {
        const code = getApiErrorCode(mutationError);

        const errorMessages: Record<string, string> = {
          'MATCH/SAME_TEAM': 'O time mandante e visitante devem ser diferentes.',
          'MATCH/GROUP_REQUIRED': 'Selecione um grupo para esta fase de grupos.',
        };

        if (code && code in errorMessages) {
          toast.error('Erro ao criar partida', { description: errorMessages[code] });
          return;
        }

        const { code: errorCode, description } = errorHandler(mutationError);
        toast.error(errorCode, { description });
      },
    },
  });

  async function onSubmit(formData: MatchFormData) {
    const result = await createMatch({
      championshipId,
      data: {
        roundId: formData.roundId,
        groupId: formData.groupId || null,
        homeTeamId: formData.homeTeamId || null,
        awayTeamId: formData.awayTeamId || null,
        scheduledAt: formData.scheduledAt ? localDatetimeToIso(formData.scheduledAt) : null,
      },
    });

    toast.success('Partida criada');

    await navigate({
      to: '/championships/$championshipId/matches/$matchId',
      params: { championshipId, matchId: result.match.id },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a
            onClick={(e) => {
              e.preventDefault();
              void navigate({
                to: '/championships/$championshipId/matches',
                params: { championshipId },
              });
            }}
            href="#"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Voltar</span>
          </a>
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Nova partida</h2>
          <p className="text-muted-foreground text-sm">
            Selecione a fase, rodada e as equipes
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
        {/* Fase */}
        <div className="space-y-1.5">
          <Label>Fase</Label>
          <Select
            value={selectedStageId}
            onValueChange={(value) => {
              setSelectedStageId(value);
              setSelectedRoundId('');
              setValue('stageId', value, { shouldValidate: true });
              setValue('roundId', '');
              setValue('groupId', undefined);
            }}
          >
            <SelectTrigger aria-invalid={!!errors.stageId}>
              <SelectValue placeholder="Selecione uma fase" />
            </SelectTrigger>
            <SelectContent>
              {stages.length === 0 ? (
                <SelectItem value="_none" disabled>
                  Nenhuma fase configurada
                </SelectItem>
              ) : (
                stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormErrorMessage message={errors.stageId?.message} />
          {stages.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Configure a estrutura do campeonato primeiro.
            </p>
          )}
        </div>

        {/* Rodada (em cascata) */}
        {selectedStageId && (
          <div className="space-y-1.5">
            <Label>Rodada</Label>
            <Select
              value={selectedRoundId}
              onValueChange={(value) => {
                setSelectedRoundId(value);
                setValue('roundId', value, { shouldValidate: true });
              }}
            >
              <SelectTrigger aria-invalid={!!errors.roundId}>
                <SelectValue placeholder="Selecione uma rodada" />
              </SelectTrigger>
              <SelectContent>
                {rounds.map((round) => (
                  <SelectItem key={round.id} value={round.id}>
                    {round.name ?? `Rodada ${round.number}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.roundId?.message} />
          </div>
        )}

        {/* Grupo (só GROUP_STAGE) */}
        {isGroupStage && selectedRoundId && groups.length > 0 && (
          <div className="space-y-1.5">
            <Label>Grupo</Label>
            <Select onValueChange={(v) => setValue('groupId', v, { shouldValidate: true })}>
              <SelectTrigger aria-invalid={!!errors.groupId}>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormErrorMessage message={errors.groupId?.message} />
          </div>
        )}

        {/* Times */}
        {selectedRoundId && (
          <>
            <div className="space-y-1.5">
              <Label>Time mandante</Label>
              <Select
                value={homeTeamId}
                onValueChange={(v) => setValue('homeTeamId', v, { shouldValidate: true })}
              >
                <SelectTrigger aria-invalid={!!errors.homeTeamId}>
                  <SelectValue placeholder="A definir" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((team) => team.id !== awayTeamId)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormErrorMessage message={errors.homeTeamId?.message} />
            </div>

            <div className="space-y-1.5">
              <Label>Time visitante</Label>
              <Select
                value={awayTeamId}
                onValueChange={(v) => setValue('awayTeamId', v, { shouldValidate: true })}
              >
                <SelectTrigger aria-invalid={!!errors.awayTeamId}>
                  <SelectValue placeholder="A definir" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((team) => team.id !== homeTeamId)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormErrorMessage message={errors.awayTeamId?.message} />
            </div>

            {/* Data e hora */}
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">Data e hora</Label>
              <Controller
                name="scheduledAt"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    id="scheduledAt"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void navigate({
                to: '/championships/$championshipId/matches',
                params: { championshipId },
              })
            }
          >
            Cancelar
          </Button>
          <ButtonLoading type="submit" loading={isPending} disabled={stages.length === 0}>
            Criar partida
          </ButtonLoading>
        </div>
      </form>
    </div>
  );
}
