import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { ChampionshipHorizontalNav } from '@/components/championship-horizontal-nav';
import { ContentLoading } from '@/components/content-loading';
import { SplashPage } from '@/components/splash-page';
import { Button } from '@/components/ui/button';
import {
  getChampionshipQueryOptions,
  useGetChampionship,
} from '@/http/hooks/championships/use-get-championship';
import { useFetchMatches } from '@/http/hooks/matches/use-fetch-matches';
import { useFetchPlayers } from '@/http/hooks/players/use-fetch-players';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';

import { ChampionshipStatusBadge } from '../../-components/championship-status-badge';

export const Route = createFileRoute('/_app/championships/$championshipId')({
  loader: async ({ context: { queryClient }, params: { championshipId } }) => {
    return queryClient.ensureQueryData(getChampionshipQueryOptions(championshipId));
  },
  pendingComponent: SplashPage,
  component: ChampionshipLayout,
});

function ChampionshipLayout() {
  const { championshipId } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const { data } = useGetChampionship(championshipId, { initialData: loaderData });
  const championship = data?.championship ?? loaderData.championship;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: teamsData, isPending: teamsPending } = useFetchTeams(championshipId);
  const { data: playersData, isPending: playersPending } = useFetchPlayers(championshipId);
  const { data: matchesData, isPending: matchesPending } = useFetchMatches({ championshipId });

  const teamsCount = teamsData?.teams.length ?? 0;
  const playersCount = playersData?.players.length ?? 0;
  const matchesCount = matchesData?.length ?? 0;
  const statsLoading = teamsPending || playersPending || matchesPending;

  return (
    <div className="min-w-0 space-y-5">
      <div className="space-y-3">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to="/">
            <ArrowLeftIcon className="size-4" />
            Meus campeonatos
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{championship.name}</h1>
          <ChampionshipStatusBadge status={championship.status} />
        </div>

        {/* Mini-stats */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {statsLoading ? (
            <ContentLoading variant="inline" label="Carregando resumo..." />
          ) : (
            <>
              <span className="text-muted-foreground text-xs">
                <span className="text-foreground font-medium tabular-nums">{teamsCount}</span>{' '}
                {teamsCount === 1 ? 'time' : 'times'}
              </span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground text-xs">
                <span className="text-foreground font-medium tabular-nums">{playersCount}</span>{' '}
                {playersCount === 1 ? 'jogador' : 'jogadores'}
              </span>
              <span className="text-border">·</span>
              <span className="text-muted-foreground text-xs">
                <span className="text-foreground font-medium tabular-nums">{matchesCount}</span>{' '}
                {matchesCount === 1 ? 'partida' : 'partidas'}
              </span>
            </>
          )}
        </div>
      </div>

      <ChampionshipHorizontalNav championshipId={championshipId} currentPath={currentPath} />

      <Outlet />
    </div>
  );
}
