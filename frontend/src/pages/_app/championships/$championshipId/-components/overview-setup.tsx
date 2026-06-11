import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  CircleDotIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  ShieldIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchChampionshipsQueryKey } from '@/http/hooks/championships/use-fetch-championships';
import { getChampionshipQueryKey } from '@/http/hooks/championships/use-get-championship';
import { useUpdateChampionship } from '@/http/hooks/championships/use-update-championship';
import { useFetchMembers } from '@/http/hooks/members/use-fetch-members';
import { useFetchMatches } from '@/http/hooks/matches/use-fetch-matches';
import { useFetchPlayers } from '@/http/hooks/players/use-fetch-players';
import { useGetChampionshipRules } from '@/http/hooks/rules/use-get-championship-rules';
import { useFetchTieBreakerRules } from '@/http/hooks/rules/use-fetch-tie-breaker-rules';
import { useGetChampionshipStructure } from '@/http/hooks/stages/use-get-championship-structure';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { Championship } from '@/http/types/championships/championship';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { errorHandler } from '@/utils/error-handler';

type OverviewSetupProps = {
  championship: Championship;
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export function OverviewSetup({ championship }: OverviewSetupProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [startDialogOpen, setStartDialogOpen] = useState(false);

  const { data: membersData } = useFetchMembers(championship.id);
  const { data: teamsData, isPending: teamsPending } = useFetchTeams(championship.id);
  const { data: playersData, isPending: playersPending } = useFetchPlayers(championship.id);
  const { data: structureData, isPending: structurePending } = useGetChampionshipStructure(
    championship.id,
  );
  const { data: matchesData, isPending: matchesPending } = useFetchMatches({
    championshipId: championship.id,
  });
  const { data: rulesData, isPending: rulesPending } = useGetChampionshipRules(championship.id);
  const { data: tieBreakerData, isPending: tieBreakerPending } = useFetchTieBreakerRules(
    championship.id,
  );

  const teamsCount = teamsData?.teams.length ?? 0;
  const playersCount = playersData?.players.length ?? 0;
  const stagesCount = structureData?.stages.length ?? 0;
  const matchesCount = matchesData?.length ?? 0;

  const rulesSaved = rulesData?.rules.updatedAt != null;
  const tieBreakersSaved = (tieBreakerData?.rules ?? []).some((rule) => rule.id != null);
  const rulesDone = rulesSaved || tieBreakersSaved;

  const isLoading =
    teamsPending ||
    playersPending ||
    structurePending ||
    matchesPending ||
    rulesPending ||
    tieBreakerPending;

  const members = membersData?.members ?? [];
  const isOwner = !!user && championship.ownerUserId === user.id;
  const currentMember = members.find((m) => m.userId === user?.id);
  const canStart = isOwner || currentMember?.role === 'ADMINISTRATOR';

  const { mutateAsync: updateChampionship, isPending: isStarting } = useUpdateChampionship();

  async function handleStartChampionship() {
    try {
      await updateChampionship({
        championshipId: championship.id,
        data: { status: 'IN_PROGRESS' },
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getChampionshipQueryKey(championship.id),
        }),
        queryClient.invalidateQueries({ queryKey: fetchChampionshipsQueryKey() }),
      ]);

      setStartDialogOpen(false);
      toast.success('Campeonato iniciado!', {
        description: 'A visão geral agora mostra partidas e classificação ao vivo.',
      });
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  const steps = [
    {
      id: 'basics',
      icon: TrophyIcon,
      label: 'Dados do campeonato',
      description: `${dateFormatter.format(new Date(championship.startDate))} — ${dateFormatter.format(new Date(championship.endDate))}`,
      done: true,
      count: null,
      to: null,
    },
    {
      id: 'teams',
      icon: UsersIcon,
      label: 'Times',
      description: 'Cadastre os times participantes',
      done: teamsCount >= 2,
      count: teamsCount > 0 ? `${teamsCount} ${teamsCount === 1 ? 'time' : 'times'}` : null,
      to: `/championships/$championshipId/teams` as const,
    },
    {
      id: 'players',
      icon: UsersIcon,
      label: 'Jogadores',
      description: 'Vincule jogadores aos times',
      done: playersCount > 0,
      count:
        playersCount > 0
          ? `${playersCount} ${playersCount === 1 ? 'jogador' : 'jogadores'}`
          : null,
      to: `/championships/$championshipId/players` as const,
      disabled: teamsCount < 2,
    },
    {
      id: 'structure',
      icon: GitBranchIcon,
      label: 'Estrutura da competição',
      description: 'Configure fases, grupos e rodadas',
      done: stagesCount > 0,
      count: stagesCount > 0 ? `${stagesCount} ${stagesCount === 1 ? 'fase' : 'fases'}` : null,
      to: `/championships/$championshipId/structure` as const,
      disabled: teamsCount < 2,
    },
    {
      id: 'rules',
      icon: ShieldIcon,
      label: 'Regras',
      description: 'Defina pontuação e critérios de desempate',
      done: rulesDone,
      count: rulesDone ? 'Configuradas' : null,
      to: `/championships/$championshipId/rules` as const,
    },
    {
      id: 'matches',
      icon: SwordsIcon,
      label: 'Partidas',
      description: 'Agende os confrontos',
      done: matchesCount > 0,
      count:
        matchesCount > 0
          ? `${matchesCount} ${matchesCount === 1 ? 'partida' : 'partidas'}`
          : null,
      to: `/championships/$championshipId/matches` as const,
      disabled: stagesCount === 0,
    },
  ] as const;

  const completedCount = steps.filter((s) => s.done).length;
  const firstPending = steps.find((s) => !s.done && !s.disabled);
  const allDone = steps.every((s) => s.done);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Monte sua copa</p>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <span className="text-muted-foreground text-xs">
              {completedCount}/{steps.length} concluídos
            </span>
          )}
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = !step.done && step === firstPending;
            const isPast = step.done;
            const isDisabled = !step.done && 'disabled' in step && step.disabled;

            const content = (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
                  isCurrent && 'bg-primary/10',
                  !isPast && !isCurrent && !isDisabled && 'hover:bg-accent/50',
                  isDisabled && 'opacity-40',
                )}
              >
                <div className="flex size-7 shrink-0 items-center justify-center">
                  {isLoading && !isPast ? (
                    <Skeleton className="size-5 rounded-full" />
                  ) : isPast ? (
                    <CheckCircle2Icon className="size-5 text-primary" />
                  ) : isCurrent ? (
                    <CircleDotIcon className="size-5 text-primary" />
                  ) : (
                    <CircleDashedIcon className="text-muted-foreground size-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isPast && 'text-muted-foreground line-through',
                        isCurrent && 'text-foreground',
                        !isPast && !isCurrent && 'text-foreground/70',
                      )}
                    >
                      {step.label}
                    </span>
                    {step.count && !isLoading && (
                      <span className="text-primary rounded px-1.5 py-0.5 text-xs font-medium tabular-nums">
                        {step.count}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {step.description}
                  </p>
                </div>

                <div className="shrink-0">
                  {step.to && !isPast && !isDisabled && (
                    <ArrowRightIcon
                      className={cn(
                        'size-4',
                        isCurrent ? 'text-primary' : 'text-muted-foreground',
                      )}
                    />
                  )}
                </div>
              </div>
            );

            if (step.to && !isPast && !isDisabled) {
              return (
                <Link
                  key={step.id}
                  to={step.to}
                  params={{ championshipId: championship.id }}
                  className="block"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={step.id} className={cn(isDisabled && 'cursor-not-allowed')}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {allDone && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Tudo pronto!</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {canStart
                  ? 'Sua copa está configurada. Inicie para mudar para o painel ao vivo.'
                  : 'Configuração concluída. Aguarde um administrador iniciar o campeonato.'}
              </p>
            </div>
            {canStart ? (
              <AlertDialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button>Iniciar campeonato</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Iniciar campeonato?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O status mudará para <strong>Em andamento</strong> e a visão geral passará a
                      mostrar partidas ao vivo, próximos jogos e classificação. Você ainda poderá
                      editar times, regras e demais configurações pelo menu.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isStarting}
                      onClick={(event) => {
                        event.preventDefault();
                        void handleStartChampionship();
                      }}
                    >
                      {isStarting ? 'Iniciando…' : 'Iniciar agora'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" asChild>
                <Link
                  to="/championships/$championshipId/matches"
                  params={{ championshipId: championship.id }}
                >
                  Ver partidas
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Descrição
          </p>
          <p className="mt-1 text-sm">
            {championship.description?.trim() ? championship.description : 'Sem descrição.'}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Página pública
          </p>
          <a
            href={`/c/${championship.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link mt-1 inline-flex items-center gap-1 text-sm underline-offset-4 hover:text-link/80 hover:underline"
          >
            /{championship.slug}
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
