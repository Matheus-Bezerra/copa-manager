import {
  ExternalLinkIcon,
  SettingsIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetChampionship } from '@/http/hooks/championships/use-get-championship';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { errorHandler } from '@/utils/error-handler';

import { ChampionshipStatusBadge } from './championship-status-badge';
import { ChampionshipMembersView } from './championship-members-view';
import { UpdateChampionshipForm } from './update-championship-form';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

type ModalView = 'overview' | 'settings' | 'members';

export function ChampionshipDetailModal() {
  const [championshipId, setChampionshipId] = useQueryState('championshipId', parseAsString);

  function handleOpenChange(open: boolean) {
    if (!open) {
      void setChampionshipId(null);
    }
  }

  return (
    <Dialog open={!!championshipId} onOpenChange={handleOpenChange}>
      <DialogContent className="scrollbar-styled max-h-[90vh] max-w-2xl overflow-y-auto">
        {championshipId && (
          <ChampionshipDetailContent
            key={championshipId}
            championshipId={championshipId}
            onClose={() => void setChampionshipId(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

type ChampionshipDetailContentProps = {
  championshipId: string;
  onClose: () => void;
};

function ChampionshipDetailContent({ championshipId, onClose }: ChampionshipDetailContentProps) {
  const [view, setView] = useState<ModalView>('overview');
  const user = useAuthStore((state) => state.user);

  const { data, isPending, isError, error } = useGetChampionship(championshipId);

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const championship = data?.championship;
  const isOwner = !!user && !!championship && championship.ownerUserId === user.id;

  if (isPending) {
    return (
      <>
        <DialogHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground text-sm">Não foi possível carregar o campeonato.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
          Fechar
        </Button>
      </div>
    );
  }

  if (!championship) {
    return null;
  }

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2 pr-6">
          <DialogTitle className="text-left">{championship.name}</DialogTitle>
          <ChampionshipStatusBadge status={championship.status} />
        </div>
        <DialogDescription className="text-left">/{championship.slug}</DialogDescription>
      </DialogHeader>

      <div className="flex gap-1 rounded-lg border border-border bg-secondary/60 p-1">
        <button
          type="button"
          onClick={() => setView('overview')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'overview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
          )}
        >
          <TrophyIcon className="size-4" />
          Visão geral
        </button>
        <button
          type="button"
          onClick={() => setView('members')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'members'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
          )}
        >
          <UsersIcon className="size-4" />
          Membros
        </button>
        <button
          type="button"
          onClick={() => setView('settings')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'settings'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
          )}
        >
          <SettingsIcon className="size-4" />
          Configurações
        </button>
      </div>

      {view === 'overview' && (
        <ChampionshipOverview slug={championship.slug} championship={championship} />
      )}

      {view === 'settings' && (
        <UpdateChampionshipForm
          key={championship.updatedAt}
          championship={championship}
          isOwner={isOwner}
          onDeleteSuccess={onClose}
        />
      )}

      {view === 'members' && (
        <ChampionshipMembersView
          championshipId={championshipId}
          ownerUserId={championship.ownerUserId}
        />
      )}
    </>
  );
}

type ChampionshipOverviewProps = {
  slug: string;
  championship: {
    description: string | null;
    startDate: string;
    endDate: string;
  };
};

function ChampionshipOverview({ slug, championship }: ChampionshipOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Período
          </p>
          <p className="mt-1 text-sm">
            {dateFormatter.format(new Date(championship.startDate))}
            {' — '}
            {dateFormatter.format(new Date(championship.endDate))}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Página pública
          </p>
          <a
            href={`/c/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link mt-1 inline-flex items-center gap-1 text-sm underline-offset-4 hover:text-link/80 hover:underline"
          >
            Ver página pública
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Descrição
        </p>
        <p className="mt-1 text-sm">
          {championship.description?.trim() ? championship.description : 'Sem descrição.'}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Atalhos
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            <UsersIcon className="size-4" />
            Times
          </Button>
          <Button variant="outline" size="sm" disabled>
            Partidas
          </Button>
          <Button variant="outline" size="sm" disabled>
            Classificação
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">Disponíveis nas próximas etapas.</p>
      </div>
    </div>
  );
}
