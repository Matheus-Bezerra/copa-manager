import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { RadioIcon } from 'lucide-react';
import { SplashPage } from '@/components/splash-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicNavItems } from '@/constants/public-nav';
import { useDragScroll } from '@/hooks/use-drag-scroll';
import { useFetchPublicMatches } from '@/http/hooks/public/use-fetch-public-matches';
import {
  buildPublicTeamNameMap,
  useFetchPublicTeams,
} from '@/http/hooks/public/use-fetch-public-teams';
import { getPublicChampionshipQueryOptions } from '@/http/hooks/public/use-get-public-championship';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

import { ChampionshipStatusBadge } from '../../_app/-components/championship-status-badge';

export const Route = createFileRoute('/c/$slug')({
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    return queryClient.ensureQueryData(getPublicChampionshipQueryOptions(slug));
  },
  pendingComponent: SplashPage,
  component: PublicChampionshipLayout,
});

function PublicChampionshipLayout() {
  const { slug } = Route.useParams();
  const { championship } = Route.useLoaderData();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navRef = useDragScroll<HTMLElement>();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: liveMatchesData } = useFetchPublicMatches(
    { slug, status: 'IN_PROGRESS' },
    { refetchInterval: 30_000 },
  );
  const { data: teamsData } = useFetchPublicTeams(slug);
  const liveMatches = liveMatchesData?.matches ?? [];
  const teamNameById = buildPublicTeamNameMap(teamsData?.teams ?? []);

  function isNavActive(to: string) {
    const path = to.replace('$slug', slug);
    return currentPath === path || currentPath === `${path}/`;
  }

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const periodLabel = `${dateFormatter.format(new Date(championship.startDate))} — ${dateFormatter.format(new Date(championship.endDate))}`;

  return (
    <div className="min-h-svh">
      <header className="border-b border-border/50 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Copa Manager
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold">{championship.name}</h1>
              <ChampionshipStatusBadge status={championship.status} />
            </div>
            <p className="text-muted-foreground text-sm">{periodLabel}</p>
            {championship.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {championship.description}
              </p>
            )}
          </div>
          {isAuthenticated && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Gerenciar</Link>
            </Button>
          )}
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden px-4 pb-3">
          <nav
            ref={navRef}
            className="scrollbar-styled flex cursor-grab gap-1 overflow-x-auto rounded-lg border border-border bg-secondary/60 p-1 pb-2 [touch-action:pan-x]"
          >
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(item.to);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  params={{ slug }}
                  draggable={false}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {liveMatches.length > 0 && (
        <div className="border-b border-destructive/20 bg-destructive/5">
          <div className="mx-auto max-w-5xl space-y-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <RadioIcon className="size-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium">Partidas ao vivo</span>
              <Badge variant="destructive" className="text-xs">
                {liveMatches.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {liveMatches.map((match) => (
                <Link
                  key={match.id}
                  to="/c/$slug/matches/$matchId"
                  params={{ slug, matchId: match.id }}
                  className="rounded-md border border-destructive/20 bg-background px-3 py-2 text-sm transition-colors hover:bg-destructive/10"
                >
                  {match.homeTeamId ? (teamNameById.get(match.homeTeamId) ?? '—') : '—'} ×{' '}
                  {match.awayTeamId ? (teamNameById.get(match.awayTeamId) ?? '—') : '—'}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
