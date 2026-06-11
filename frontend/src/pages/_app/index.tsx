import { createFileRoute, Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  fetchChampionshipsQueryOptions,
  useFetchChampionships,
} from '@/http/hooks/championships/use-fetch-championships';
import type { Championship } from '@/http/types/championships/championship';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';

import { ChampionshipCardSkeleton } from './-components/championship-card-skeleton';
import { ChampionshipStatusBadge } from './-components/championship-status-badge';

export const Route = createFileRoute('/_app/')({
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(fetchChampionshipsQueryOptions());
  },
  component: DashboardPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Dashboard' }],
  }),
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatDateRange(startDate: string, endDate: string) {
  return `${dateFormatter.format(new Date(startDate))} — ${dateFormatter.format(new Date(endDate))}`;
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isPending, isError, error } = useFetchChampionships();

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const championships = data?.championships ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {user?.name ? `Olá, ${user.name}` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm">Seus campeonatos</p>
        </div>
        <Button asChild>
          <Link to="/championships/create">
            <PlusIcon />
            Novo campeonato
          </Link>
        </Button>
      </div>

      {isPending && <ChampionshipCardSkeleton />}

      {!isPending && !isError && championships.length === 0 && (
        <EmptyState
          title="Você ainda não tem campeonatos"
          description="Crie seu primeiro campeonato para começar a organizar times, partidas e classificação."
          action={
            <Button asChild>
              <Link to="/championships/create">
                <PlusIcon />
                Criar campeonato
              </Link>
            </Button>
          }
        />
      )}

      {!isPending && !isError && championships.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {championships.map((championship) => (
            <ChampionshipCard key={championship.id} championship={championship} />
          ))}
        </div>
      )}
    </div>
  );
}

const statusBorderClass: Record<Championship['status'], string> = {
  OPEN: 'border-border hover:border-border/80',
  IN_PROGRESS: 'border-primary/40 hover:border-primary/60',
  FINISHED: 'border-border hover:border-border/80',
};

function ChampionshipCard({ championship }: { championship: Championship }) {
  return (
    <Link
      to="/championships/$championshipId"
      params={{ championshipId: championship.id }}
      className="block text-left"
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-colors hover:bg-card/80',
          statusBorderClass[championship.status],
        )}
      >
        {championship.status === 'IN_PROGRESS' && (
          <div className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base">{championship.name}</CardTitle>
            <ChampionshipStatusBadge status={championship.status} />
          </div>
          <CardDescription>{formatDateRange(championship.startDate, championship.endDate)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {championship.description?.trim() && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {championship.description}
            </p>
          )}
          <p className="text-muted-foreground text-xs">/{championship.slug}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
