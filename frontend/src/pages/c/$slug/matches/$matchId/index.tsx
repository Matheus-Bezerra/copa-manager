import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  RadioIcon,
  TimerIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { TeamAvatar } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  buildPublicTeamNameMap,
  useFetchPublicTeams,
} from '@/http/hooks/public/use-fetch-public-teams';
import { useFetchPublicMatchEvents } from '@/http/hooks/public/use-fetch-public-match-events';
import { useGetPublicMatch } from '@/http/hooks/public/use-get-public-match';
import { useFetchPublicPlayers } from '@/http/hooks/public/use-fetch-public-players';
import type { MatchEvent } from '@/http/types/match-events/match-event';
import type { MatchStatus } from '@/http/types/matches/match';
import { cn } from '@/lib/utils';
import {
  capMatchElapsedSeconds,
  computeMatchElapsedSeconds,
  isMatchTimerPaused,
} from '@/utils/match-timer';

export const Route = createFileRoute('/c/$slug/matches/$matchId/')({
  component: PublicMatchDetailPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Partida' }] }),
});

const statusLabel: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

const statusVariant: Record<MatchStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  SCHEDULED: 'outline',
  IN_PROGRESS: 'default',
  FINISHED: 'secondary',
  CANCELLED: 'destructive',
};

function formatMatchTime(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const minutes = Math.floor(abs / 60);
  const seconds = abs % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function eventIcon(type: MatchEvent['eventType']) {
  switch (type) {
    case 'GOAL':
      return '⚽';
    case 'YELLOW_CARD':
      return '🟨';
    case 'RED_CARD':
      return '🟥';
    case 'MVP':
      return '⭐';
  }
}

function eventLabel(type: MatchEvent['eventType']) {
  switch (type) {
    case 'GOAL':
      return 'Gol';
    case 'YELLOW_CARD':
      return 'Cartão amarelo';
    case 'RED_CARD':
      return 'Cartão vermelho';
    case 'MVP':
      return 'MVP';
  }
}

function PublicMatchDetailPage() {
  const { slug, matchId } = Route.useParams();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: matchData, isPending, isError } = useGetPublicMatch(slug, matchId, {
    refetchInterval: (query) =>
      query.state.data?.match.status === 'IN_PROGRESS' ? 30_000 : false,
  });
  const { data: eventsData } = useFetchPublicMatchEvents(
    { slug, matchId },
    {
      refetchInterval: matchData?.match.status === 'IN_PROGRESS' ? 30_000 : false,
    },
  );
  const { data: teamsData } = useFetchPublicTeams(slug);
  const { data: playersData } = useFetchPublicPlayers(slug);

  const match = matchData?.match;
  const result = matchData?.result;
  const matchDurationMinutes = matchData?.matchDuration ?? 90;
  const events = eventsData?.events ?? [];
  const teamNameById = buildPublicTeamNameMap(teamsData?.teams ?? []);
  const playerNameById = new Map(
    (playersData?.players ?? []).map((player) => [player.id, player.name]),
  );

  const homeGoalsFromEvents = events.filter(
    (event) => event.eventType === 'GOAL' && event.teamId === match?.homeTeamId,
  ).length;
  const awayGoalsFromEvents = events.filter(
    (event) => event.eventType === 'GOAL' && event.teamId === match?.awayTeamId,
  ).length;

  const homeGoals = match?.status === 'FINISHED' && result ? result.homeScore : homeGoalsFromEvents;
  const awayGoals = match?.status === 'FINISHED' && result ? result.awayScore : awayGoalsFromEvents;

  const homeTeam = teamsData?.teams.find((team) => team.id === match?.homeTeamId);
  const awayTeam = teamsData?.teams.find((team) => team.id === match?.awayTeamId);

  useEffect(() => {
    if (match?.status !== 'IN_PROGRESS' || !match.startedAt) {
      return;
    }

    const timerState = {
      startedAt: match.startedAt,
      pausedAt: match.pausedAt,
      accumulatedPausedMs: match.accumulatedPausedMs,
    };
    const totalSeconds = matchDurationMinutes * 60;

    const tick = () => {
      setElapsedSeconds(
        capMatchElapsedSeconds(computeMatchElapsedSeconds(timerState), totalSeconds),
      );
    };

    tick();

    if (isMatchTimerPaused(timerState)) {
      return;
    }

    if (computeMatchElapsedSeconds(timerState) >= totalSeconds) {
      return;
    }

    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    match?.status,
    match?.startedAt,
    match?.pausedAt,
    match?.accumulatedPausedMs,
    matchDurationMinutes,
  ]);

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/c/$slug/matches" params={{ slug }}>
            <ArrowLeftIcon className="size-4" />
            Voltar às partidas
          </Link>
        </Button>
        <p className="text-muted-foreground">Partida não encontrada.</p>
      </div>
    );
  }

  const isInProgress = match.status === 'IN_PROGRESS';
  const isFinished = match.status === 'FINISHED';
  const totalSeconds = matchDurationMinutes * 60;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const isTimerPaused = isMatchTimerPaused(match);
  const isTimerFinished = elapsedSeconds >= totalSeconds;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/c/$slug/matches" params={{ slug }}>
          <ArrowLeftIcon className="size-4" />
          Partidas
        </Link>
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={statusVariant[match.status]}>{statusLabel[match.status]}</Badge>
            {isInProgress && (
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tabular-nums',
                  isTimerPaused
                    ? 'bg-muted text-muted-foreground'
                    : isTimerFinished
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-primary/10 text-primary',
                )}
              >
                {isTimerPaused ? (
                  <>
                    <TimerIcon className="size-3.5" />
                    Pausado
                  </>
                ) : isTimerFinished ? (
                  <>
                    <TimerIcon className="size-3.5" />
                    Tempo esgotado
                  </>
                ) : (
                  <>
                    <RadioIcon className="size-3.5 animate-pulse" />
                    {formatMatchTime(remainingSeconds)}
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-4">
            <div className="space-y-2 text-center">
              <TeamAvatar team={homeTeam} size="md" className="mx-auto" />
              <p className="font-semibold">
                {match.homeTeamId
                  ? (teamNameById.get(match.homeTeamId) ?? 'A definir')
                  : 'A definir'}
              </p>
            </div>

            <div className="text-center">
              {isInProgress || isFinished ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-4xl font-bold tabular-nums">
                    {homeGoals} × {awayGoals}
                  </p>
                  {isFinished &&
                    result &&
                    (result.homePenaltyScore !== null || result.awayPenaltyScore !== null) && (
                      <p className="text-muted-foreground text-xs tabular-nums">
                        Pênaltis {result.homePenaltyScore ?? 0} × {result.awayPenaltyScore ?? 0}
                      </p>
                    )}
                </div>
              ) : (
                <span className="text-muted-foreground text-2xl font-light">vs</span>
              )}
              {isInProgress && (
                <p className="text-destructive mt-1 flex items-center justify-center gap-1 text-xs font-medium">
                  <RadioIcon className={cn('size-3', !isTimerPaused && !isTimerFinished && 'animate-pulse')} />
                  {isTimerPaused ? 'Pausado' : isTimerFinished ? 'Tempo esgotado' : 'Ao vivo'}
                </p>
              )}
            </div>

            <div className="space-y-2 text-center">
              <TeamAvatar team={awayTeam} size="md" className="mx-auto" />
              <p className="font-semibold">
                {match.awayTeamId
                  ? (teamNameById.get(match.awayTeamId) ?? 'A definir')
                  : 'A definir'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isFinished && result
                ? `Placar final: ${homeGoals} × ${awayGoals}.`
                : 'Nenhum evento registrado ainda.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {[...events]
                .sort((a, b) => {
                  if (a.minute !== null && b.minute !== null) return b.minute - a.minute;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map((event) => (
                  <li key={event.id} className="flex items-start gap-3 text-sm">
                    <span className="text-lg leading-none">{eventIcon(event.eventType)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {eventLabel(event.eventType)}
                        {event.minute !== null && (
                          <span className="text-muted-foreground font-normal">
                            {' '}
                            · {event.minute}&apos;
                          </span>
                        )}
                      </p>
                      {(event.playerId || event.teamId) && (
                        <p className="text-muted-foreground truncate">
                          {event.playerId
                            ? (playerNameById.get(event.playerId) ?? 'Jogador')
                            : null}
                          {event.playerId && event.teamId && ' · '}
                          {event.teamId && (teamNameById.get(event.teamId) ?? 'Time')}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
