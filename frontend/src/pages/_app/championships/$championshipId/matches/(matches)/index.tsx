import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { KnockoutMatchesView } from '@/components/matches/knockout-matches-view';
import { MatchesTable } from '@/components/matches/matches-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLoading } from '@/components/content-loading';
import { useFetchMatches } from '@/http/hooks/matches/use-fetch-matches';
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { MatchStatus } from '@/http/types/matches/match';
import { errorHandler } from '@/utils/error-handler';
import { resolveActiveStage, resolveCurrentRound } from '@/utils/competition-filters';
import { getRoundsForStage } from '@/utils/match-grouping';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/matches/(matches)/',
)({
  component: MatchesPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Partidas' }] }),
});

function MatchesPage() {
  const { championshipId } = Route.useParams();
  const navigate = useNavigate();
  const [stageId, setStageId] = useQueryState('stageId', parseAsString);
  const [roundId, setRoundId] = useQueryState('roundId', parseAsString);
  const [groupId, setGroupId] = useQueryState('groupId', parseAsString);
  const [status, setStatus] = useQueryState('status', parseAsString);

  const { data: structureData } = useGetChampionshipStructure(championshipId);
  const { data: teamsData } = useFetchTeams(championshipId);
  const { data: allMatchesData } = useFetchMatches({ championshipId });

  const stages = structureData?.stages ?? [];
  const teams = teamsData?.teams ?? [];
  const allMatches = allMatchesData ?? [];

  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const selectedStage = useMemo(
    () => stages.find((s) => s.id === stageId) ?? null,
    [stages, stageId],
  );

  const rounds = selectedStage?.rounds ?? [];
  const groups = selectedStage?.type === 'GROUP_STAGE' ? (selectedStage.groups ?? []) : [];

  const { data, isPending, isError, error } = useFetchMatches({
    championshipId,
    roundId: roundId ?? undefined,
    groupId: groupId ?? undefined,
    status: (status as MatchStatus) ?? undefined,
  });

  useEffect(() => {
    if (stageId || roundId || groupId || status || stages.length === 0) {
      return;
    }

    const activeStage = resolveActiveStage(stages, allMatches);
    if (!activeStage) {
      return;
    }

    void setStageId(activeStage.id);

    const currentRound = resolveCurrentRound(activeStage.rounds, allMatches);
    if (currentRound) {
      void setRoundId(currentRound.id);
    }
  }, [allMatches, groupId, roundId, stageId, stages, status, setRoundId, setStageId]);

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const matches = data ?? [];
  const isKnockoutView = selectedStage?.type === 'KNOCKOUT';
  const groupByRound = !roundId && rounds.length > 0;
  const displayRounds = getRoundsForStage(stages, stageId);

  function handleStageChange(value: string) {
    void setStageId(value === 'all' ? null : value);
    void setRoundId(null);
    void setGroupId(null);

    if (value !== 'all') {
      const stage = stages.find((item) => item.id === value);
      if (stage) {
        const currentRound = resolveCurrentRound(stage.rounds, allMatches);
        if (currentRound) {
          void setRoundId(currentRound.id);
        }
      }
    }
  }

  function handleRoundChange(value: string) {
    void setRoundId(value === 'all' ? null : value);
    void setGroupId(null);
  }

  function handleMatchClick(matchId: string) {
    void navigate({
      to: '/championships/$championshipId/matches/$matchId',
      params: { championshipId, matchId },
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Partidas</h2>
          <p className="text-muted-foreground text-sm">
            {matches.length} {matches.length === 1 ? 'partida' : 'partidas'}
          </p>
        </div>

        <Button size="sm" asChild>
          <Link to="/championships/$championshipId/matches/create" params={{ championshipId }}>
            <PlusIcon className="size-4" />
            Nova partida
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={stageId ?? 'all'} onValueChange={handleStageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as fases</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {rounds.length > 0 && (
          <Select value={roundId ?? 'all'} onValueChange={handleRoundChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rodada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as rodadas</SelectItem>
              {rounds.map((round) => (
                <SelectItem key={round.id} value={round.id}>
                  {round.name ?? `Rodada ${round.number}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {groups.length > 0 && (
          <Select
            value={groupId ?? 'all'}
            onValueChange={(v) => void setGroupId(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={status ?? 'all'}
          onValueChange={(v) => void setStatus(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="SCHEDULED">Agendada</SelectItem>
            <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
            <SelectItem value="FINISHED">Encerrada</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && <ContentLoading variant="list" rows={4} />}

      {!isPending && !isError && matches.length === 0 && (
        <EmptyState
          title="Nenhuma partida encontrada"
          description={
            roundId || groupId || status
              ? 'Nenhuma partida com os filtros selecionados.'
              : 'Crie a primeira partida para começar o campeonato.'
          }
          action={
            <Button size="sm" asChild>
              <Link
                to="/championships/$championshipId/matches/create"
                params={{ championshipId }}
              >
                <PlusIcon className="size-4" />
                Nova partida
              </Link>
            </Button>
          }
        />
      )}

      {!isPending && !isError && matches.length > 0 && (
        isKnockoutView ? (
          <KnockoutMatchesView
            matches={matches}
            rounds={displayRounds}
            teamById={teamById}
            onMatchClick={handleMatchClick}
            groupByRound={groupByRound}
          />
        ) : (
          <MatchesTable
            matches={matches}
            rounds={displayRounds}
            groupByRound={groupByRound}
            teamById={teamById}
            onMatchClick={handleMatchClick}
          />
        )
      )}
    </div>
  );
}
