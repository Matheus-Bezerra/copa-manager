import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { EmptyState } from '@/components/empty-state';
import { TeamAvatar } from '@/components/team-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFetchPublicPlayers } from '@/http/hooks/public/use-fetch-public-players';
import { useFetchPublicTeams } from '@/http/hooks/public/use-fetch-public-teams';
import type { PublicPlayer } from '@/http/types/public/public-players';

export const Route = createFileRoute('/c/$slug/players/')({
  component: PublicPlayersPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Jogadores' }] }),
});

function PublicPlayersPage() {
  const { slug } = Route.useParams();
  const { data, isPending } = useFetchPublicPlayers(slug);
  const { data: teamsData } = useFetchPublicTeams(slug);

  const players = data?.players ?? [];
  const teamById = useMemo(
    () => new Map((teamsData?.teams ?? []).map((team) => [team.id, team])),
    [teamsData?.teams],
  );

  const playersByTeam = useMemo(() => {
    const map = new Map<string, PublicPlayer[]>();
    for (const player of players) {
      const list = map.get(player.teamId) ?? [];
      list.push(player);
      map.set(player.teamId, list);
    }
    return map;
  }, [players]);

  const sortedTeamIds = useMemo(
    () =>
      [...playersByTeam.keys()].sort((teamA, teamB) => {
        const nameA = teamById.get(teamA)?.name ?? teamA;
        const nameB = teamById.get(teamB)?.name ?? teamB;
        return nameA.localeCompare(nameB, 'pt-BR');
      }),
    [playersByTeam, teamById],
  );

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <EmptyState
        title="Nenhum jogador cadastrado"
        description="Os elencos aparecerão aqui quando forem adicionados."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Jogadores</h2>
        <p className="text-muted-foreground text-sm">Elencos e estatísticas por time.</p>
      </div>

      <div className="space-y-4">
        {sortedTeamIds.map((teamId) => {
          const teamPlayers = playersByTeam.get(teamId) ?? [];
          const team = teamById.get(teamId);

          return (
            <Card key={teamId}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TeamAvatar team={team} size="sm" />
                  <span>{team?.name ?? 'Time'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Jogador</TableHead>
                      <TableHead className="text-center">J</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      <TableHead className="text-center">A</TableHead>
                      <TableHead className="text-center">🟨</TableHead>
                      <TableHead className="text-center">🟥</TableHead>
                      <TableHead className="text-center">MVP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamPlayers
                      .sort((a, b) => (a.shirtNumber ?? 999) - (b.shirtNumber ?? 999))
                      .map((player) => {
                        const stats = player.statistics;
                        return (
                          <TableRow key={player.id}>
                            <TableCell className="text-muted-foreground w-10">
                              {player.shirtNumber ?? '—'}
                            </TableCell>
                            <TableCell className="font-medium">{player.name}</TableCell>
                            <TableCell className="text-center">
                              {stats?.matchesPlayed ?? 0}
                            </TableCell>
                            <TableCell className="text-center">{stats?.goals ?? 0}</TableCell>
                            <TableCell className="text-center">{stats?.assists ?? 0}</TableCell>
                            <TableCell className="text-center">
                              {stats?.yellowCards ?? 0}
                            </TableCell>
                            <TableCell className="text-center">{stats?.redCards ?? 0}</TableCell>
                            <TableCell className="text-center">{stats?.matchMvps ?? 0}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
