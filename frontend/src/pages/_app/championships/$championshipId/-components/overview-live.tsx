import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CalendarIcon,
  ExternalLinkIcon,
  RadioIcon,
  TableIcon,
} from 'lucide-react';

import { TeamAvatar, TeamLabel } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFetchMatches } from '@/http/hooks/matches/use-fetch-matches';
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useGetStandings } from '@/http/hooks/standings/use-get-standings';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { Championship } from '@/http/types/championships/championship';
import {
  resolveActiveGroup,
  resolveActiveGroupStage,
} from '@/utils/competition-filters';
import { formatMatchScore, hasMatchScore } from '@/utils/match-score';

type OverviewLiveProps = {
  championship: Championship;
};

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function OverviewLive({ championship }: OverviewLiveProps) {
  const { data: teamsData } = useFetchTeams(championship.id);
  const { data: liveData, isPending: livePending } = useFetchMatches({
    championshipId: championship.id,
    status: 'IN_PROGRESS',
  });
  const { data: scheduledData, isPending: scheduledPending } = useFetchMatches({
    championshipId: championship.id,
    status: 'SCHEDULED',
  });
  const { data: structureData } = useGetChampionshipStructure(championship.id);
  const { data: allMatchesData } = useFetchMatches({ championshipId: championship.id });

  const teams = teamsData?.teams ?? [];
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const liveMatches = liveData ?? [];
  const upcomingMatches = (scheduledData ?? []).slice(0, 3);
  const allMatches = allMatchesData ?? [];

  const activeGroupStage = resolveActiveGroupStage(structureData?.stages ?? [], allMatches);
  const activeGroup = activeGroupStage
    ? resolveActiveGroup(activeGroupStage.groups, allMatches)
    : null;

  const { data: standingsData, isPending: standingsPending } = useGetStandings(
    activeGroupStage && activeGroup
      ? {
        championshipId: championship.id,
        stageId: activeGroupStage.id,
        groupId: activeGroup.id,
      }
      : null,
  );

  const standings = (standingsData?.standings ?? []).slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Live matches */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <RadioIcon className="size-4 text-destructive animate-pulse" />
          <span className="text-sm font-medium">Ao vivo</span>
          {liveMatches.length > 0 && (
            <Badge variant="destructive" className="ml-auto text-xs">
              {liveMatches.length}
            </Badge>
          )}
        </div>

        {livePending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : liveMatches.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">Nenhuma partida ao vivo agora.</p>
        ) : (
          <div className="divide-y">
            {liveMatches.map((match) => {
              const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
              const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

              return (
                <Link
                  key={match.id}
                  to="/championships/$championshipId/matches/$matchId"
                  params={{ championshipId: championship.id, matchId: match.id }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <TeamLabel team={homeTeam} size="xs" className="min-w-0 flex-1" />
                  <span
                    className={
                      hasMatchScore(match)
                        ? 'shrink-0 text-sm font-semibold tabular-nums'
                        : 'text-muted-foreground shrink-0 text-xs font-medium'
                    }
                  >
                    {formatMatchScore(match)}
                  </span>
                  <TeamLabel
                    team={awayTeam}
                    size="xs"
                    reverse
                    className="min-w-0 flex-1"
                    nameClassName="text-right"
                  />
                  <ArrowRightIcon className="text-muted-foreground ml-2 size-4 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming matches */}
      <section className="rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <CalendarIcon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Próximas partidas</span>
          <Link
            to="/championships/$championshipId/matches"
            params={{ championshipId: championship.id }}
            className="text-link ml-auto text-xs hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {scheduledPending ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">
            Nenhuma partida agendada.
          </p>
        ) : (
          <div className="divide-y">
            {upcomingMatches.map((match) => {
              const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
              const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;

              return (
                <Link
                  key={match.id}
                  to="/championships/$championshipId/matches/$matchId"
                  params={{ championshipId: championship.id, matchId: match.id }}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-center gap-2">
                      <TeamAvatar team={homeTeam} size="xs" />
                      <span className="truncate text-sm font-medium">
                        {homeTeam?.name ?? 'A definir'}
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">×</span>
                      <span className="truncate text-sm font-medium">
                        {awayTeam?.name ?? 'A definir'}
                      </span>
                      <TeamAvatar team={awayTeam} size="xs" />
                    </div>
                    {match.scheduledAt && (
                      <p className="text-muted-foreground text-center text-xs">
                        {timeFormatter.format(new Date(match.scheduledAt))}
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon className="text-muted-foreground size-4 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Mini standings */}
      {activeGroupStage && activeGroup && (
        <section className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <TableIcon className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">
              {activeGroupStage.name} — {activeGroup.name}
            </span>
            <Link
              to="/championships/$championshipId/standings"
              params={{ championshipId: championship.id }}
              className="text-link ml-auto text-xs hover:underline"
            >
              Ver completa
            </Link>
          </div>

          {standingsPending ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : standings.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">
              Nenhum resultado registrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 text-center">#</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">PJ</TableHead>
                  <TableHead className="text-center">SG</TableHead>
                  <TableHead className="text-center font-bold">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((entry) => {
                  const played = entry.wins + entry.draws + entry.losses;
                  const team = teamById.get(entry.teamId);

                  return (
                    <TableRow key={entry.teamId}>
                      <TableCell className="text-center font-medium text-sm">
                        {entry.position}
                      </TableCell>
                      <TableCell>
                        <TeamLabel team={team} size="xs" fallback="—" />
                      </TableCell>
                      <TableCell className="text-center text-sm">{played}</TableCell>
                      <TableCell className="text-center text-sm">
                        {entry.goalDifference > 0
                          ? `+${entry.goalDifference}`
                          : entry.goalDifference}
                      </TableCell>
                      <TableCell className="text-center text-sm font-bold">
                        {entry.points}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link
            to="/championships/$championshipId/matches"
            params={{ championshipId: championship.id }}
          >
            Ver partidas
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link
            to="/championships/$championshipId/standings"
            params={{ championshipId: championship.id }}
          >
            Classificação
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={`/c/${championship.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            Página pública
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}
