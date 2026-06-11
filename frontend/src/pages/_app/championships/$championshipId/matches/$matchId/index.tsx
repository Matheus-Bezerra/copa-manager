import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  CalendarIcon,
  PencilIcon,
  StarIcon,
  TimerIcon,
  TrophyIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { DateTimePicker } from '@/components/datetime-picker';
import { FormErrorMessage } from '@/components/form-error-message';
import { TeamAvatar } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMatchEventsQueryKey, useFetchMatchEvents } from '@/http/hooks/match-events/use-fetch-match-events';
import { useRegisterGoal } from '@/http/hooks/match-events/use-register-goal';
import { useRegisterYellowCard } from '@/http/hooks/match-events/use-register-yellow-card';
import { useRegisterRedCard } from '@/http/hooks/match-events/use-register-red-card';
import { fetchAwardsQueryKey } from '@/http/hooks/awards/use-fetch-awards';
import { useDefineMatchMvp } from '@/http/hooks/match-events/use-define-match-mvp';
import { invalidateMatchesQueries } from '@/http/hooks/matches/use-fetch-matches';
import { getMatchQueryKey, useGetMatch } from '@/http/hooks/matches/use-get-match';
import { useUpdateMatch } from '@/http/hooks/matches/use-update-match';
import { useUpdateMatchStatus } from '@/http/hooks/matches/use-update-match-status';
import { useRegisterMatchResult } from '@/http/hooks/matches/use-register-match-result';
import { useGetChampionshipRules } from '@/http/hooks/rules/use-get-championship-rules';
import { fetchPlayersQueryKey } from '@/http/hooks/players/use-fetch-players';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import { useFetchPlayers } from '@/http/hooks/players/use-fetch-players';
import type { Match, MatchStatus } from '@/http/types/matches/match';
import type { MatchEvent } from '@/http/types/match-events/match-event';
import type { Player } from '@/http/types/players/player';
import type { Team } from '@/http/types/teams/team';
import { z as zod } from '@/lib/zod';
import { cn } from '@/lib/utils';
import { errorHandler } from '@/utils/error-handler';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/matches/$matchId/',
)({
  component: MatchDetailPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Partida' }] }),
});

const statusLabel: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

const statusVariant: Record<MatchStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  SCHEDULED: 'outline',
  IN_PROGRESS: 'default',
  FINISHED: 'secondary',
  CANCELLED: 'destructive',
};

function formatDate(iso: string | null) {
  if (!iso) return 'Não agendada';
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

const AUTO_MATCH_MINUTE_KEY = 'copaManager:autoMatchMinute';

function formatMatchTime(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function readAutoMatchMinutePreference(): boolean {
  const stored = localStorage.getItem(AUTO_MATCH_MINUTE_KEY);
  return stored === null ? true : stored === 'true';
}

function eventIcon(type: MatchEvent['eventType']) {
  switch (type) {
    case 'GOAL': return '⚽';
    case 'YELLOW_CARD': return '🟨';
    case 'RED_CARD': return '🟥';
    case 'MVP': return '⭐';
  }
}

function eventLabel(type: MatchEvent['eventType']) {
  switch (type) {
    case 'GOAL': return 'Gol';
    case 'YELLOW_CARD': return 'Cartão amarelo';
    case 'RED_CARD': return 'Cartão vermelho';
    case 'MVP': return 'MVP';
  }
}

function formatPlayerLabel(player: Player | undefined, fallback = 'Jogador') {
  if (!player) return fallback;

  if (player.shirtNumber !== null) {
    return `${player.name} (#${player.shirtNumber})`;
  }

  return player.name;
}

/* ——— Edit Match Dialog ——— */

const editMatchSchema = zod
  .object({
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

type EditMatchFormData = z.infer<typeof editMatchSchema>;

function EditMatchDialog({
  match,
  championshipId,
  teamNameById,
  open,
  onClose,
}: {
  match: Match;
  championshipId: string;
  teamNameById: Map<string, string>;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: teamsData } = useFetchTeams(championshipId);
  const teams = teamsData?.teams ?? [];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditMatchFormData>({
    resolver: zodResolver(editMatchSchema),
    defaultValues: {
      homeTeamId: match.homeTeamId ?? undefined,
      awayTeamId: match.awayTeamId ?? undefined,
      scheduledAt: toDatetimeLocal(match.scheduledAt),
    },
  });

  const homeTeamId = watch('homeTeamId');
  const awayTeamId = watch('awayTeamId');

  const { mutateAsync: updateMatch, isPending } = useUpdateMatch({
    mutation: {
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const code = (error as any)?.response?.data?.error?.code;
        if (code === 'MATCH/SAME_TEAM') {
          toast.error('Times iguais', { description: 'Mandante e visitante devem ser diferentes.' });
          return;
        }
        const { code: errorCode, description } = errorHandler(error);
        toast.error(errorCode, { description });
      },
    },
  });

  async function onSubmit(formData: EditMatchFormData) {
    await updateMatch({
      championshipId,
      matchId: match.id,
      data: {
        homeTeamId: formData.homeTeamId || null,
        awayTeamId: formData.awayTeamId || null,
        scheduledAt: formData.scheduledAt || null,
      },
    });

    await queryClient.invalidateQueries({ queryKey: getMatchQueryKey(championshipId, match.id) });
    toast.success('Partida atualizada');
    onClose();
  }

  const teamLabel = (id: string | null) =>
    id ? (teamNameById.get(id) ?? '—') : 'A definir';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar partida</DialogTitle>
          <DialogDescription>Atualize os times e o horário da partida.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Time mandante</Label>
            <Select
              value={homeTeamId ?? '_none'}
              onValueChange={(v) =>
                setValue('homeTeamId', v === '_none' ? undefined : v, { shouldValidate: true })
              }
            >
              <SelectTrigger aria-invalid={!!errors.homeTeamId}>
                <SelectValue placeholder={teamLabel(match.homeTeamId)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">A definir</SelectItem>
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
              value={awayTeamId ?? '_none'}
              onValueChange={(v) =>
                setValue('awayTeamId', v === '_none' ? undefined : v, { shouldValidate: true })
              }
            >
              <SelectTrigger aria-invalid={!!errors.awayTeamId}>
                <SelectValue placeholder={teamLabel(match.awayTeamId)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">A definir</SelectItem>
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

          <div className="space-y-1.5">
            <Label htmlFor="edit-scheduledAt">Data e hora</Label>
            <Controller
              name="scheduledAt"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  id="edit-scheduledAt"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isPending}>
              Salvar
            </ButtonLoading>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ——— Event Dialog (Gol / Amarelo / Vermelho) ——— */

type EventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD';

const eventFormSchema = zod.object({
  teamId: zod.string().optional(),
  playerId: zod.string().min(1, 'Selecione um jogador'),
  minute: zod.string().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

function EventDialog({
  match,
  championshipId,
  eventType,
  open,
  onClose,
  defaultTeamId,
  elapsedSeconds,
  teamById,
}: {
  match: Match;
  championshipId: string;
  eventType: EventType;
  open: boolean;
  onClose: () => void;
  defaultTeamId?: string;
  elapsedSeconds?: number;
  teamById: Map<string, Team>;
}) {
  const queryClient = useQueryClient();
  const { data: playersData } = useFetchPlayers(championshipId);
  const allPlayers = playersData?.players ?? [];
  const [autoMatchMinute, setAutoMatchMinute] = useState(readAutoMatchMinutePreference);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: { playerId: '', minute: '' },
  });

  const teamId = defaultTeamId ?? watch('teamId');
  const team = teamId ? teamById.get(teamId) : undefined;
  const filteredPlayers = teamId
    ? allPlayers.filter((p) => p.teamId === teamId)
    : [];
  const currentMinute = elapsedSeconds !== undefined ? Math.floor(elapsedSeconds / 60) : null;

  useEffect(() => {
    if (!open) return;
    reset({ playerId: '', minute: '' });
    if (defaultTeamId) setValue('teamId', defaultTeamId);
  }, [open, defaultTeamId, reset, setValue]);

  const availableTeams = [
    match.homeTeamId ? { id: match.homeTeamId, label: teamById.get(match.homeTeamId)?.name ?? 'Mandante' } : null,
    match.awayTeamId ? { id: match.awayTeamId, label: teamById.get(match.awayTeamId)?.name ?? 'Visitante' } : null,
  ].filter(Boolean) as { id: string; label: string }[];

  const { mutateAsync: registerGoal, isPending: pendingGoal } = useRegisterGoal();
  const { mutateAsync: registerYellow, isPending: pendingYellow } = useRegisterYellowCard();
  const { mutateAsync: registerRed, isPending: pendingRed } = useRegisterRedCard();

  const isPending = pendingGoal || pendingYellow || pendingRed;

  const titles: Record<EventType, string> = {
    GOAL: 'Registrar gol',
    YELLOW_CARD: 'Registrar cartão amarelo',
    RED_CARD: 'Registrar cartão vermelho',
  };

  function handleAutoMatchMinuteChange(checked: boolean) {
    setAutoMatchMinute(checked);
    localStorage.setItem(AUTO_MATCH_MINUTE_KEY, String(checked));
  }

  async function onSubmit(formData: EventFormData) {
    const resolvedTeamId = defaultTeamId ?? formData.teamId;
    if (!resolvedTeamId) {
      toast.error('Selecione um time');
      return;
    }

    const minute = autoMatchMinute && currentMinute !== null
      ? currentMinute
      : formData.minute
        ? Number(formData.minute)
        : null;

    const payload = {
      playerId: formData.playerId,
      minute,
    };

    try {
      if (eventType === 'GOAL') {
        await registerGoal({ championshipId, matchId: match.id, data: payload });
      } else if (eventType === 'YELLOW_CARD') {
        await registerYellow({ championshipId, matchId: match.id, data: payload });
      } else {
        await registerRed({ championshipId, matchId: match.id, data: payload });
      }

      await queryClient.invalidateQueries({
        queryKey: fetchMatchEventsQueryKey(championshipId, match.id),
      });
      await queryClient.invalidateQueries({
        queryKey: getMatchQueryKey(championshipId, match.id),
      });
      await queryClient.invalidateQueries({ queryKey: fetchPlayersQueryKey(championshipId) });
      await invalidateMatchesQueries(queryClient, championshipId);

      toast.success(eventIcon(eventType) + ' ' + eventLabel(eventType) + ' registrado');
      onClose();
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{eventIcon(eventType)}</span>
            {titles[eventType]}
          </DialogTitle>
          {team ? (
            <div className="flex items-center gap-2 pt-1">
              <TeamAvatar team={team} size="sm" />
              <DialogDescription className="m-0 font-medium text-foreground">
                {team.name}
              </DialogDescription>
            </div>
          ) : (
            <DialogDescription>Selecione o jogador para registrar o evento.</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {!defaultTeamId && (
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Select onValueChange={(v) => { setValue('teamId', v); setValue('playerId', ''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Jogador</Label>
            <Select onValueChange={(v) => setValue('playerId', v)} disabled={!teamId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogador" />
              </SelectTrigger>
              <SelectContent>
                {filteredPlayers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.shirtNumber !== null && ` (#${p.shirtNumber})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.playerId && (
              <p className="text-destructive text-xs">{errors.playerId.message}</p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={autoMatchMinute}
              onChange={(e) => handleAutoMatchMinuteChange(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <span className="text-sm">Usar tempo da partida automaticamente</span>
          </label>

          {autoMatchMinute && currentMinute !== null ? (
            <p className="text-muted-foreground text-sm">
              Minuto do evento: <span className="font-medium text-foreground">{currentMinute}&apos;</span>
              {' '}({formatMatchTime(elapsedSeconds!)})
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="event-minute">Minuto (opcional)</Label>
              <Input
                id="event-minute"
                type="number"
                min={0}
                max={200}
                placeholder="Ex: 45"
                {...register('minute')}
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isPending}>
              Registrar
            </ButtonLoading>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ——— Register Result Dialog ——— */

const resultFormSchema = zod.object({
  homeScore: zod.string().regex(/^\d+$/, 'Valor inválido'),
  awayScore: zod.string().regex(/^\d+$/, 'Valor inválido'),
  homePenaltyScore: zod.string().optional(),
  awayPenaltyScore: zod.string().optional(),
});

type ResultFormData = z.infer<typeof resultFormSchema>;

type GoalScorerSlot = {
  key: string;
  teamId: string;
  label: string;
};

function RegisterResultDialog({
  match,
  championshipId,
  homeGoals: existingHomeGoals,
  awayGoals: existingAwayGoals,
  teamById,
  players,
  open,
  onClose,
}: {
  match: Match;
  championshipId: string;
  homeGoals: number;
  awayGoals: number;
  teamById: Map<string, Team>;
  players: Player[];
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [scorers, setScorers] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResultFormData>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      homeScore: String(existingHomeGoals),
      awayScore: String(existingAwayGoals),
      homePenaltyScore: '',
      awayPenaltyScore: '',
    },
  });

  const watchedHomeScore = watch('homeScore');
  const watchedAwayScore = watch('awayScore');
  const finalHomeGoals = Number(watchedHomeScore) || 0;
  const finalAwayGoals = Number(watchedAwayScore) || 0;
  const extraHomeGoals = Math.max(0, finalHomeGoals - existingHomeGoals);
  const extraAwayGoals = Math.max(0, finalAwayGoals - existingAwayGoals);

  const goalSlots = useMemo(() => {
    const slots: GoalScorerSlot[] = [];
    const homeTeamName = match.homeTeamId
      ? (teamById.get(match.homeTeamId)?.name ?? 'Mandante')
      : 'Mandante';
    const awayTeamName = match.awayTeamId
      ? (teamById.get(match.awayTeamId)?.name ?? 'Visitante')
      : 'Visitante';

    for (let index = 0; index < extraHomeGoals; index += 1) {
      if (!match.homeTeamId) continue;
      slots.push({
        key: `home-${index}`,
        teamId: match.homeTeamId,
        label: `${homeTeamName} — gol ${existingHomeGoals + index + 1}`,
      });
    }

    for (let index = 0; index < extraAwayGoals; index += 1) {
      if (!match.awayTeamId) continue;
      slots.push({
        key: `away-${index}`,
        teamId: match.awayTeamId,
        label: `${awayTeamName} — gol ${existingAwayGoals + index + 1}`,
      });
    }

    return slots;
  }, [
    existingAwayGoals,
    existingHomeGoals,
    extraAwayGoals,
    extraHomeGoals,
    match.awayTeamId,
    match.homeTeamId,
    teamById,
  ]);

  useEffect(() => {
    if (!open) {
      setScorers({});
    }
  }, [open]);

  const { mutateAsync: registerGoal } = useRegisterGoal();
  const { mutateAsync: registerResult } = useRegisterMatchResult();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function playersForTeam(teamId: string) {
    return players.filter((player) => player.teamId === teamId);
  }

  async function onSubmit(formData: ResultFormData) {
    setIsSubmitting(true);

    try {
      for (const slot of goalSlots) {
        const selectedPlayerId = scorers[slot.key];
        const hasPlayer = selectedPlayerId && selectedPlayerId !== '_none';

        await registerGoal({
          championshipId,
          matchId: match.id,
          data: hasPlayer
            ? { playerId: selectedPlayerId, minute: null }
            : { teamId: slot.teamId, minute: null },
        });
      }

      await registerResult({
        championshipId,
        matchId: match.id,
        data: {
          homeScore: Number(formData.homeScore),
          awayScore: Number(formData.awayScore),
          homePenaltyScore: formData.homePenaltyScore ? Number(formData.homePenaltyScore) : null,
          awayPenaltyScore: formData.awayPenaltyScore ? Number(formData.awayPenaltyScore) : null,
        },
      });

      await queryClient.invalidateQueries({ queryKey: getMatchQueryKey(championshipId, match.id) });
      await queryClient.invalidateQueries({
        queryKey: fetchMatchEventsQueryKey(championshipId, match.id),
      });
      await queryClient.invalidateQueries({ queryKey: fetchPlayersQueryKey(championshipId) });
      await invalidateMatchesQueries(queryClient, championshipId);

      toast.success('Partida encerrada com sucesso');
      onClose();
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Encerrar partida</DialogTitle>
          <DialogDescription>
            Informe o placar final. Você pode indicar quem marcou cada gol — o jogador é opcional.
            Os pênaltis também são opcionais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="homeScore">Gols mandante</Label>
              <Input id="homeScore" type="number" min={0} {...register('homeScore')} />
              {errors.homeScore && (
                <p className="text-destructive text-xs">{errors.homeScore.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="awayScore">Gols visitante</Label>
              <Input id="awayScore" type="number" min={0} {...register('awayScore')} />
              {errors.awayScore && (
                <p className="text-destructive text-xs">{errors.awayScore.message}</p>
              )}
            </div>
          </div>

          {goalSlots.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Autores dos gols (opcional)</p>
                {existingHomeGoals + existingAwayGoals > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {existingHomeGoals + existingAwayGoals} gol(s) já registrado(s) durante a partida.
                  </p>
                )}
                {goalSlots.map((slot) => (
                  <div key={slot.key} className="space-y-1.5">
                    <Label>{slot.label}</Label>
                    <Select
                      value={scorers[slot.key] ?? '_none'}
                      onValueChange={(value) =>
                        setScorers((current) => ({ ...current, [slot.key]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Não informado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Não informado</SelectItem>
                        {playersForTeam(slot.teamId).map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                            {player.shirtNumber !== null && ` (#${player.shirtNumber})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator />

          <p className="text-muted-foreground text-sm">Pênaltis (opcional)</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="homePenaltyScore">Pênaltis mandante</Label>
              <Input id="homePenaltyScore" type="number" min={0} {...register('homePenaltyScore')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="awayPenaltyScore">Pênaltis visitante</Label>
              <Input id="awayPenaltyScore" type="number" min={0} {...register('awayPenaltyScore')} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isSubmitting}>
              Encerrar partida
            </ButtonLoading>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ——— Define MVP Dialog ——— */

const mvpFormSchema = zod.object({
  playerId: zod.string().min(1, 'Selecione um jogador'),
});

type MvpFormData = z.infer<typeof mvpFormSchema>;

function DefineMvpDialog({
  match,
  championshipId,
  open,
  onClose,
}: {
  match: Match;
  championshipId: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: playersData } = useFetchPlayers(championshipId);
  const allPlayers = playersData?.players ?? [];

  const { handleSubmit, setValue, formState: { errors } } = useForm<MvpFormData>({
    resolver: zodResolver(mvpFormSchema),
  });

  const { mutateAsync: defineMvp, isPending } = useDefineMatchMvp();

  async function onSubmit(formData: MvpFormData) {
    try {
      await defineMvp({ championshipId, matchId: match.id, data: { playerId: formData.playerId } });

      await queryClient.invalidateQueries({
        queryKey: fetchMatchEventsQueryKey(championshipId, match.id),
      });
      await queryClient.invalidateQueries({
        queryKey: fetchAwardsQueryKey(championshipId),
      });
      await queryClient.invalidateQueries({ queryKey: fetchPlayersQueryKey(championshipId) });

      toast.success('⭐ MVP definido com sucesso');
      onClose();
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Definir MVP</DialogTitle>
          <DialogDescription>Escolha o melhor jogador da partida.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Jogador</Label>
            <Select onValueChange={(v) => setValue('playerId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogador" />
              </SelectTrigger>
              <SelectContent>
                {allPlayers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.shirtNumber !== null && ` (#${p.shirtNumber})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.playerId && (
              <p className="text-destructive text-xs">{errors.playerId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isPending}>
              Confirmar
            </ButtonLoading>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ——— Main Page ——— */

function MatchDetailPage() {
  const { championshipId, matchId } = Route.useParams();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [eventDialog, setEventDialog] = useState<{ type: EventType; teamId?: string } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [mvpOpen, setMvpOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: matchData, isPending, isError } = useGetMatch(championshipId, matchId);
  const { data: teamsData } = useFetchTeams(championshipId);
  const { data: playersData } = useFetchPlayers(championshipId);
  const { data: eventsData } = useFetchMatchEvents(championshipId, matchId);
  const { data: rulesData } = useGetChampionshipRules(championshipId);

  const match = matchData?.match;
  const result = matchData?.result ?? null;
  const teams = teamsData?.teams ?? [];
  const players = playersData?.players ?? [];
  const events = eventsData?.events ?? [];
  const matchDuration = rulesData?.rules?.matchDuration ?? 90;

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const playerById = new Map(players.map((p) => [p.id, p]));
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));
  const teamLabel = (id: string | null) =>
    id ? (teamNameById.get(id) ?? 'A definir') : 'A definir';

  const homeTeam = match?.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
  const awayTeam = match?.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

  const homeGoalsFromEvents = events.filter(
    (e) => e.eventType === 'GOAL' && e.teamId === match?.homeTeamId,
  ).length;
  const awayGoalsFromEvents = events.filter(
    (e) => e.eventType === 'GOAL' && e.teamId === match?.awayTeamId,
  ).length;

  const homeGoals =
    match?.status === 'FINISHED' && result ? result.homeScore : homeGoalsFromEvents;
  const awayGoals =
    match?.status === 'FINISHED' && result ? result.awayScore : awayGoalsFromEvents;

  const mvpEvent = events.find((e) => e.eventType === 'MVP');
  const mvpPlayerId = mvpEvent?.playerId;
  const mvpPlayer = mvpPlayerId ? playerById.get(mvpPlayerId) : undefined;

  useEffect(() => {
    if (match?.status === 'IN_PROGRESS' && match.startedAt) {
      const startedMs = new Date(match.startedAt).getTime();
      const computeElapsed = () => Math.floor((Date.now() - startedMs) / 1000);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(computeElapsed());
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [match?.status, match?.startedAt]);

  const { mutateAsync: updateStatus, isPending: pendingStatus } = useUpdateMatchStatus({
    mutation: {
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiCode = (error as any)?.response?.data?.error?.code;
        if (apiCode === 'MATCH/TEAMS_REQUIRED') {
          toast.error('Times não definidos', {
            description: 'Defina o mandante e o visitante antes de iniciar a partida.',
          });
          return;
        }
        const { code, description } = errorHandler(error);
        toast.error(code, { description });
      },
    },
  });

  async function handleStart() {
    if (!match) return;
    await updateStatus({ championshipId, matchId: match.id, data: { status: 'IN_PROGRESS' } });
    await queryClient.invalidateQueries({ queryKey: getMatchQueryKey(championshipId, match.id) });
    toast.success('Partida iniciada');
    setStartOpen(false);
  }

  async function handleCancel() {
    if (!match) return;
    await updateStatus({ championshipId, matchId: match.id, data: { status: 'CANCELLED' } });
    await queryClient.invalidateQueries({ queryKey: getMatchQueryKey(championshipId, match.id) });
    toast.success('Partida cancelada');
    setCancelOpen(false);
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/championships/$championshipId/matches" params={{ championshipId }}>
            <ArrowLeftIcon className="size-4" />
            Voltar às partidas
          </Link>
        </Button>
        <p className="text-muted-foreground">Partida não encontrada.</p>
      </div>
    );
  }

  const canEdit = match.status === 'SCHEDULED';
  const isScheduled = match.status === 'SCHEDULED';
  const teamsDefined = Boolean(match.homeTeamId && match.awayTeamId);
  const isInProgress = match.status === 'IN_PROGRESS';
  const isFinished = match.status === 'FINISHED';

  const totalSeconds = matchDuration * 60;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const overtimeSeconds = Math.max(0, elapsedSeconds - totalSeconds);
  const isOvertime = elapsedSeconds > totalSeconds;
  const progressPercent = Math.min(100, (elapsedSeconds / totalSeconds) * 100);
  const currentMinute = Math.floor(elapsedSeconds / 60);

  const homeColor = homeTeam?.primaryColor ?? '#6b7280';
  const awayColor = awayTeam?.primaryColor ?? '#6b7280';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/championships/$championshipId/matches" params={{ championshipId }}>
            <ArrowLeftIcon className="size-4" />
            Partidas
          </Link>
        </Button>

        <div className="flex gap-2">
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-4" />
              Editar
            </Button>
          )}
          {isScheduled && (
            <>
              <Button size="sm" onClick={() => setStartOpen(true)} disabled={!teamsDefined}>
                Iniciar partida
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancelar
              </Button>
            </>
          )}
          {isInProgress && (
            <Button size="sm" variant="secondary" onClick={() => setResultOpen(true)}>
              <TrophyIcon className="size-4" />
              Encerrar partida
            </Button>
          )}
          {isFinished && !mvpPlayerId && (
            <Button size="sm" variant="outline" onClick={() => setMvpOpen(true)}>
              <StarIcon className="size-4" />
              Definir MVP
            </Button>
          )}
        </div>
      </div>

      {/* ScoreCard */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={statusVariant[match.status]}>{statusLabel[match.status]}</Badge>
            {isInProgress && (
              <div className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums',
                isOvertime ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
              )}>
                <TimerIcon className="size-3.5" />
                {isOvertime ? `+${formatMatchTime(overtimeSeconds)}` : `${formatMatchTime(remainingSeconds)} restantes`}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            {/* Home team */}
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <TeamAvatar team={homeTeam} size="lg" />
              <p className="text-sm font-semibold leading-tight">{teamLabel(match.homeTeamId)}</p>
              <p className="text-muted-foreground text-xs">Mandante</p>
            </div>

            {/* Score + Timer */}
            <div className="flex min-w-[140px] flex-col items-center gap-2">
              {(isInProgress || isFinished) ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-4xl font-bold tabular-nums">
                    {homeGoals}
                    <span className="text-muted-foreground mx-2 font-light">×</span>
                    {awayGoals}
                  </p>
                  {isFinished &&
                  result &&
                  (result.homePenaltyScore !== null || result.awayPenaltyScore !== null) && (
                    <p className="text-muted-foreground text-xs tabular-nums">
                      Pênaltis {result.homePenaltyScore ?? 0} × {result.awayPenaltyScore ?? 0}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground text-2xl font-light">vs</span>
              )}

              {isInProgress && (
                <div className="flex w-full flex-col items-center gap-1.5">
                  <p className={cn(
                    'text-3xl font-bold tabular-nums tracking-tight',
                    isOvertime ? 'text-destructive' : 'text-primary',
                  )}>
                    {isOvertime ? `+${formatMatchTime(overtimeSeconds)}` : formatMatchTime(remainingSeconds)}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {formatMatchTime(elapsedSeconds)} decorridos
                  </p>
                  <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        isOvertime ? 'bg-destructive' : 'bg-primary',
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {formatMatchTime(totalSeconds)} total
                  </p>
                </div>
              )}

              {!isInProgress && match.scheduledAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  <span>{formatDate(match.scheduledAt)}</span>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <TeamAvatar team={awayTeam} size="lg" />
              <p className="text-sm font-semibold leading-tight">{teamLabel(match.awayTeamId)}</p>
              <p className="text-muted-foreground text-xs">Visitante</p>
            </div>
          </div>

          {isScheduled && !teamsDefined && (
            <p className="text-muted-foreground border-t pt-3 text-center text-sm">
              Defina o mandante e o visitante para iniciar a partida.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Panel (IN_PROGRESS) */}
      {isInProgress && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Registrar evento</CardTitle>
            <p className="text-muted-foreground text-xs">
              Clique no evento do time — o minuto será preenchido automaticamente ({currentMinute}&apos;)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Home team actions */}
              {match.homeTeamId && (
                <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: `${homeColor}40` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <TeamAvatar team={homeTeam} size="sm" />
                    <p className="text-sm font-medium truncate">{teamLabel(match.homeTeamId)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'GOAL', teamId: match.homeTeamId! })}
                  >
                    <span>⚽</span> Gol
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'YELLOW_CARD', teamId: match.homeTeamId! })}
                  >
                    <span>🟨</span> Amarelo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'RED_CARD', teamId: match.homeTeamId! })}
                  >
                    <span>🟥</span> Vermelho
                  </Button>
                </div>
              )}

              {/* Away team actions */}
              {match.awayTeamId && (
                <div className="space-y-2 rounded-lg border p-3" style={{ borderColor: `${awayColor}40` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <TeamAvatar team={awayTeam} size="sm" />
                    <p className="text-sm font-medium truncate">{teamLabel(match.awayTeamId)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'GOAL', teamId: match.awayTeamId! })}
                  >
                    <span>⚽</span> Gol
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'YELLOW_CARD', teamId: match.awayTeamId! })}
                  >
                    <span>🟨</span> Amarelo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setEventDialog({ type: 'RED_CARD', teamId: match.awayTeamId! })}
                  >
                    <span>🟥</span> Vermelho
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Timeline */}
      {(isInProgress || isFinished) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {isFinished && result
                  ? `Placar final: ${homeGoals} × ${awayGoals}.`
                  : 'Nenhum evento registrado ainda.'}
              </p>
            ) : (
              <div className="space-y-1">
                {[...events]
                  .sort((a, b) => {
                    if (a.minute !== null && b.minute !== null) return b.minute - a.minute;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  })
                  .map((event) => {
                    const isHome = event.teamId === match.homeTeamId;
                    const isMvp = event.eventType === 'MVP';
                    const team = event.teamId ? teamById.get(event.teamId) : undefined;
                    const teamColor = team?.primaryColor ?? '#6b7280';
                    const player = event.playerId ? playerById.get(event.playerId) : undefined;
                    const playerName = formatPlayerLabel(player);

                    if (isMvp) {
                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-center gap-2 py-2 text-sm"
                        >
                          <span className="text-lg">⭐</span>
                          <span className="font-medium text-yellow-600 dark:text-yellow-400">
                            MVP — {playerName}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'flex items-center gap-2 py-1.5 text-sm',
                          isHome ? 'flex-row' : 'flex-row-reverse',
                        )}
                      >
                        <div
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div
                          className={cn(
                            'flex min-w-0 items-center gap-1.5',
                            isHome ? 'text-left' : 'text-right flex-row-reverse',
                          )}
                        >
                          <span className="shrink-0 text-base leading-none">
                            {eventIcon(event.eventType)}
                          </span>
                          <div className={cn('min-w-0', isHome ? 'text-left' : 'text-right')}>
                            <p className="font-medium">
                              {eventLabel(event.eventType)}
                              {event.minute !== null && (
                                <span className="text-muted-foreground font-normal">
                                  {' '}
                                  · {event.minute}&apos;
                                </span>
                              )}
                            </p>
                            {player && (
                              <p className="text-muted-foreground truncate text-xs">{playerName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 border-t border-dashed border-border/40" />
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {team?.name ?? (isHome ? teamLabel(match.homeTeamId) : teamLabel(match.awayTeamId))}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MVP badge (FINISHED) */}
      {isFinished && mvpPlayerId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MVP da partida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StarIcon className="text-yellow-500 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{formatPlayerLabel(mvpPlayer)}</p>
                {mvpPlayer && (
                  <p className="text-muted-foreground text-sm">
                    {teamNameById.get(mvpPlayer.teamId) ?? '—'}
                  </p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => setMvpOpen(true)}>
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AlertDialog open={startOpen} onOpenChange={setStartOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar partida?</AlertDialogTitle>
            <AlertDialogDescription>
              {teamsDefined
                ? 'A partida passará para o status "Em andamento". Esta ação não pode ser desfeita.'
                : 'Defina o mandante e o visitante antes de iniciar a partida.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStart} disabled={pendingStatus || !teamsDefined}>
              {pendingStatus ? 'Iniciando…' : 'Iniciar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar partida?</AlertDialogTitle>
            <AlertDialogDescription>
              A partida será marcada como cancelada. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={pendingStatus}>
              {pendingStatus ? 'Cancelando…' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editOpen && (
        <EditMatchDialog
          match={match}
          championshipId={championshipId}
          teamNameById={teamNameById}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}

      {eventDialog && (
        <EventDialog
          match={match}
          championshipId={championshipId}
          eventType={eventDialog.type}
          open={!!eventDialog}
          onClose={() => setEventDialog(null)}
          defaultTeamId={eventDialog.teamId}
          elapsedSeconds={isInProgress ? elapsedSeconds : undefined}
          teamById={teamById}
        />
      )}

      {resultOpen && (
        <RegisterResultDialog
          match={match}
          championshipId={championshipId}
          homeGoals={homeGoalsFromEvents}
          awayGoals={awayGoalsFromEvents}
          teamById={teamById}
          players={players}
          open={resultOpen}
          onClose={() => setResultOpen(false)}
        />
      )}

      {mvpOpen && (
        <DefineMvpDialog
          match={match}
          championshipId={championshipId}
          open={mvpOpen}
          onClose={() => setMvpOpen(false)}
        />
      )}
    </div>
  );
}
