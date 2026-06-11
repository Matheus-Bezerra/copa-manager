import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
  KnockoutStandingsFallback,
  KnockoutStandingsSection,
} from '@/components/matches/knockout-standings-fallback';
import { StandingsViewToggle } from '@/components/standings/standings-view-toggle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useStandingsViewMode } from '@/hooks/use-standings-view-mode';
import { useFetchMatches } from '@/http/hooks/matches/use-fetch-matches';
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useGetStandings } from '@/http/hooks/standings/use-get-standings';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import {
  resolveActiveGroup,
  resolveActiveGroupStage,
} from '@/utils/competition-filters';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/standings/',
)({
  component: StandingsPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Classificação' }] }),
});

function StandingsPage() {
  const { championshipId } = Route.useParams();
  const navigate = useNavigate();
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const { data: structureData, isPending: structurePending } =
    useGetChampionshipStructure(championshipId);
  const { data: teamsData } = useFetchTeams(championshipId);
  const { data: matchesData } = useFetchMatches({ championshipId });

  const stages = structureData?.stages ?? [];
  const matches = matchesData ?? [];

  const {
    viewMode,
    setViewMode,
    hasBothViews,
    hasGroupStages,
    hasKnockoutStages,
    groupStages,
  } = useStandingsViewMode(stages, matches);

  const { data: standingsData, isPending: standingsPending } = useGetStandings(
    viewMode === 'groups' && selectedStageId && selectedGroupId
      ? { championshipId, stageId: selectedStageId, groupId: selectedGroupId }
      : null,
  );

  const teams = teamsData?.teams ?? [];
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

  const selectedStage = groupStages.find((s) => s.id === selectedStageId);
  const groups = selectedStage?.groups ?? [];
  const standings = standingsData?.standings ?? [];

  const activeGroupStage = useMemo(
    () => resolveActiveGroupStage(stages, matches),
    [stages, matches],
  );

  useEffect(() => {
    if (!activeGroupStage || selectedStageId) {
      return;
    }

    setSelectedStageId(activeGroupStage.id);
    const activeGroup = resolveActiveGroup(activeGroupStage.groups, matches);
    if (activeGroup) {
      setSelectedGroupId(activeGroup.id);
    }
  }, [activeGroupStage, matches, selectedStageId]);

  function handleStageChange(stageId: string) {
    setSelectedStageId(stageId);
    const stage = groupStages.find((item) => item.id === stageId);
    const activeGroup = stage ? resolveActiveGroup(stage.groups, matches) : null;
    setSelectedGroupId(activeGroup?.id ?? '');
  }

  function handleMatchClick(matchId: string) {
    void navigate({
      to: '/championships/$championshipId/matches/$matchId',
      params: { championshipId, matchId },
    });
  }

  if (structurePending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  if (!hasGroupStages && hasKnockoutStages) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Classificação</h1>
          <p className="text-muted-foreground text-sm">
            Acompanhe o andamento do campeonato.
          </p>
        </div>
        <KnockoutStandingsFallback
          stages={stages}
          matches={matches}
          teamById={teamById}
          onMatchClick={handleMatchClick}
        />
      </div>
    );
  }

  if (!hasGroupStages && !hasKnockoutStages) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Classificação</h1>
          <p className="text-muted-foreground text-sm">
            Configure a estrutura da competição para visualizar classificação ou mata-mata.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Classificação</h1>
          <p className="text-muted-foreground text-sm">
            {hasBothViews
              ? 'A visualização inicial segue a fase atual do campeonato. Alterne entre grupos e mata-mata quando quiser.'
              : 'A fase e o grupo ativos são selecionados automaticamente conforme o andamento do campeonato.'}
          </p>
        </div>
        {hasBothViews && (
          <StandingsViewToggle value={viewMode} onChange={setViewMode} />
        )}
      </div>

      {viewMode === 'groups' ? (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="w-64">
              <Select value={selectedStageId} onValueChange={handleStageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fase" />
                </SelectTrigger>
                <SelectContent>
                  {groupStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStageId && (
              <div className="w-64">
                <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger>
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
              </div>
            )}
          </div>

          {selectedStageId && selectedGroupId ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedStage?.name}
                  {selectedGroupId && (
                    <Badge variant="outline" className="ml-2">
                      {groups.find((g) => g.id === selectedGroupId)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {standingsPending ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : standings.length === 0 ? (
                  <p className="text-muted-foreground p-4 text-sm">
                    Nenhuma classificação disponível. Registre resultados de partidas para atualizar a tabela.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-center">Pos</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="text-center">PJ</TableHead>
                        <TableHead className="text-center">V</TableHead>
                        <TableHead className="text-center">E</TableHead>
                        <TableHead className="text-center">D</TableHead>
                        <TableHead className="text-center">GP</TableHead>
                        <TableHead className="text-center">GC</TableHead>
                        <TableHead className="text-center">SG</TableHead>
                        <TableHead className="text-center font-bold">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((entry) => {
                        const played = entry.wins + entry.draws + entry.losses;
                        return (
                          <TableRow key={entry.teamId}>
                            <TableCell className="text-center font-medium">
                              {entry.position}
                            </TableCell>
                            <TableCell className="font-medium">
                              {teamNameById.get(entry.teamId) ?? entry.teamId.slice(0, 8)}
                            </TableCell>
                            <TableCell className="text-center">{played}</TableCell>
                            <TableCell className="text-center">{entry.wins}</TableCell>
                            <TableCell className="text-center">{entry.draws}</TableCell>
                            <TableCell className="text-center">{entry.losses}</TableCell>
                            <TableCell className="text-center">{entry.goalsScored}</TableCell>
                            <TableCell className="text-center">{entry.goalsConceded}</TableCell>
                            <TableCell className="text-center">
                              {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                            </TableCell>
                            <TableCell className="text-center font-bold">{entry.points}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            !standingsPending && selectedStageId && (
              <p className="text-muted-foreground text-sm">Selecione um grupo para ver a classificação.</p>
            )
          )}
        </>
      ) : (
        <KnockoutStandingsSection
          stages={stages}
          matches={matches}
          teamById={teamById}
          onMatchClick={handleMatchClick}
        />
      )}
    </div>
  );
}
