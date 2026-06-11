import { Link } from '@tanstack/react-router';
import { AwardIcon, ExternalLinkIcon, TableIcon, TrophyIcon } from 'lucide-react';

import { TeamAvatar, TeamLabel } from '@/components/team-avatar';
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
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useGetStandings } from '@/http/hooks/standings/use-get-standings';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { Championship } from '@/http/types/championships/championship';

type OverviewFinishedProps = {
  championship: Championship;
};

const MEDAL = ['🥇', '🥈', '🥉'];

export function OverviewFinished({ championship }: OverviewFinishedProps) {
  const { data: teamsData } = useFetchTeams(championship.id);
  const { data: structureData } = useGetChampionshipStructure(championship.id);

  const teams = teamsData?.teams ?? [];
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const firstGroupStage = structureData?.stages.find((s) => s.type === 'GROUP_STAGE');
  const firstGroup = firstGroupStage?.groups[0];

  const { data: standingsData, isPending: standingsPending } = useGetStandings(
    firstGroupStage && firstGroup
      ? {
          championshipId: championship.id,
          stageId: firstGroupStage.id,
          groupId: firstGroup.id,
        }
      : null,
  );

  const podium = (standingsData?.standings ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Encerrado banner */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <TrophyIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Campeonato encerrado</p>
            <p className="text-muted-foreground text-sm">
              {championship.name} chegou ao fim. Confira os resultados finais.
            </p>
          </div>
        </div>
      </div>

      {/* Podium */}
      {firstGroupStage && firstGroup && (
        <section className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <TableIcon className="text-muted-foreground size-4" />
            <span className="text-sm font-medium">Classificação final</span>
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
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : podium.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">
              Nenhum resultado registrado.
            </p>
          ) : (
            <>
              {/* Top 3 visual highlight */}
              <div className="grid grid-cols-3 gap-3 p-4">
                {podium.map((entry, index) => {
                  const team = teamById.get(entry.teamId);
                  return (
                    <div
                      key={entry.teamId}
                      className="flex flex-col items-center gap-1.5 rounded-md border bg-secondary/40 p-3 text-center"
                    >
                      <span className="text-xl">{MEDAL[index]}</span>
                      <TeamAvatar team={team} size="sm" />
                      <p className="line-clamp-2 text-xs font-semibold leading-tight">
                        {team?.name ?? '—'}
                      </p>
                      <p className="text-primary text-xs font-bold tabular-nums">
                        {entry.points} pts
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Full table */}
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 text-center">#</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="text-center">PJ</TableHead>
                      <TableHead className="text-center">V</TableHead>
                      <TableHead className="text-center">E</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center font-bold">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(standingsData?.standings ?? []).map((entry) => {
                      const played = entry.wins + entry.draws + entry.losses;
                      const team = teamById.get(entry.teamId);

                      return (
                        <TableRow key={entry.teamId}>
                          <TableCell className="text-center text-sm font-medium">
                            {entry.position}
                          </TableCell>
                          <TableCell>
                            <TeamLabel team={team} size="xs" fallback="—" />
                          </TableCell>
                          <TableCell className="text-center text-sm">{played}</TableCell>
                          <TableCell className="text-center text-sm">{entry.wins}</TableCell>
                          <TableCell className="text-center text-sm">{entry.draws}</TableCell>
                          <TableCell className="text-center text-sm">{entry.losses}</TableCell>
                          <TableCell className="text-center text-sm font-bold">
                            {entry.points}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link
            to="/championships/$championshipId/awards"
            params={{ championshipId: championship.id }}
          >
            <AwardIcon className="size-4" />
            Premiações
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={`/c/${championship.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <ExternalLinkIcon className="size-4" />
            Página pública
          </a>
        </Button>
      </div>
    </div>
  );
}
