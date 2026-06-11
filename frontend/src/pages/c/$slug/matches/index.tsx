import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RadioIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo } from 'react';

import { EmptyState } from '@/components/empty-state';
import { KnockoutMatchesView } from '@/components/matches/knockout-matches-view';
import { MatchesTable } from '@/components/matches/matches-table';
import { TeamAvatar } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchPublicMatches } from '@/http/hooks/public/use-fetch-public-matches';
import {
  buildPublicTeamNameMap,
  useFetchPublicTeams,
} from '@/http/hooks/public/use-fetch-public-teams';
import { useGetPublicStructure } from '@/http/hooks/public/use-get-public-structure';
import type { MatchStatus } from '@/http/types/matches/match';
import { resolveActiveStage, resolveCurrentRound } from '@/utils/competition-filters';
import { formatMatchScore, hasMatchScore } from '@/utils/match-score';
import { getRoundsForStage } from '@/utils/match-grouping';

export const Route = createFileRoute('/c/$slug/matches/')({
  component: PublicMatchesPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Partidas' }] }),
});

function PublicMatchesPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [stageId, setStageId] = useQueryState('stageId', parseAsString);
  const [roundId, setRoundId] = useQueryState('roundId', parseAsString);
  const [groupId, setGroupId] = useQueryState('groupId', parseAsString);
  const [status, setStatus] = useQueryState('status', parseAsString);

  const { data: structureData, isPending: structurePending } = useGetPublicStructure(slug);
  const { data: teamsData } = useFetchPublicTeams(slug);
  const { data: allMatchesData, isPending: allMatchesPending } = useFetchPublicMatches({ slug });

  const stages = structureData?.stages ?? [];
  const allMatches = allMatchesData?.matches ?? [];
  const selectedStage = useMemo(
    () => stages.find((s) => s.id === stageId) ?? null,
    [stages, stageId],
  );
  const rounds = selectedStage?.rounds ?? [];
  const groups = selectedStage?.type === 'GROUP_STAGE' ? (selectedStage.groups ?? []) : [];

  const teams = teamsData?.teams ?? [];
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const teamLabelById = useMemo(() => buildPublicTeamNameMap(teams), [teams]);

  const { data: matchesData, isPending: matchesPending } = useFetchPublicMatches({
    slug,
    roundId: roundId ?? undefined,
    groupId: groupId ?? undefined,
    status: (status as MatchStatus) || undefined,
  });

  const matches = matchesData?.matches ?? [];
  const liveMatches = allMatches.filter((match) => match.status === 'IN_PROGRESS');
  const isKnockoutView = selectedStage?.type === 'KNOCKOUT';
  const groupByRound = !roundId && rounds.length > 0;
  const displayRounds = getRoundsForStage(stages, stageId);

  useEffect(() => {
    if (
      structurePending ||
      allMatchesPending ||
      stageId ||
      roundId ||
      groupId ||
      status ||
      stages.length === 0
    ) {
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
  }, [
    allMatches,
    allMatchesPending,
    groupId,
    roundId,
    stageId,
    stages,
    status,
    structurePending,
    setRoundId,
    setStageId,
  ]);

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
    void navigate({ to: '/c/$slug/matches/$matchId', params: { slug, matchId } });
  }

  const teamLabel = (id: string | null) =>
    id ? (teamLabelById.get(id) ?? 'A definir') : 'A definir';

  if (structurePending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Partidas</h2>
        <p className="text-muted-foreground text-sm">
          A rodada atual é selecionada automaticamente conforme o andamento do campeonato.
        </p>
      </div>

      {liveMatches.length > 0 && (
        <section className="rounded-lg border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 border-b border-destructive/20 px-4 py-3">
            <RadioIcon className="size-4 text-destructive animate-pulse" />
            <span className="text-sm font-medium">Ao vivo agora</span>
            <Badge variant="destructive" className="ml-auto text-xs">
              {liveMatches.length}
            </Badge>
          </div>
          <div className="divide-y divide-destructive/10">
            {liveMatches.map((match) => {
              const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
              const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

              return (
                <button
                  key={match.id}
                  type="button"
                  onClick={() => handleMatchClick(match.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-destructive/10"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamAvatar team={homeTeam} size="xs" />
                    <span className="truncate text-sm font-medium">
                      {teamLabel(match.homeTeamId)}
                    </span>
                    <span
                      className={
                        hasMatchScore(match)
                          ? 'shrink-0 text-sm font-semibold tabular-nums'
                          : 'text-muted-foreground shrink-0 text-xs'
                      }
                    >
                      {formatMatchScore(match)}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {teamLabel(match.awayTeamId)}
                    </span>
                    <TeamAvatar team={awayTeam} size="xs" />
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    Acompanhar
                  </Badge>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-48">
          <Select value={stageId ?? 'all'} onValueChange={handleStageChange}>
            <SelectTrigger>
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
        </div>

        {rounds.length > 0 && (
          <div className="w-full sm:w-48">
            <Select value={roundId ?? 'all'} onValueChange={handleRoundChange}>
              <SelectTrigger>
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
          </div>
        )}

        {groups.length > 0 && (
          <div className="w-full sm:w-48">
            <Select
              value={groupId ?? 'all'}
              onValueChange={(v) => void setGroupId(v === 'all' ? null : v)}
            >
              <SelectTrigger>
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
          </div>
        )}

        <div className="w-full sm:w-48">
          <Select
            value={status ?? 'all'}
            onValueChange={(v) => void setStatus(v === 'all' ? null : v)}
          >
            <SelectTrigger>
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
      </div>

      {matchesPending ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          title="Nenhuma partida encontrada"
          description="Ajuste os filtros ou aguarde novas partidas."
        />
      ) : isKnockoutView ? (
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
      )}
    </div>
  );
}
