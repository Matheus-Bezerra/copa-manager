import { CalendarIcon, RadioIcon, SwordsIcon } from 'lucide-react';

import { TeamAvatar, type TeamVisual } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { MatchListItem } from '@/http/types/matches/match';
import type { Round } from '@/http/types/stages/stage';
import { cn } from '@/lib/utils';
import { hasMatchScore } from '@/utils/match-score';
import {
  getRoundLabel,
  groupMatchesByRound,
  sortMatchesChronologically,
  type RoundSortOrder,
} from '@/utils/match-grouping';

import {
  formatMatchDate,
  matchStatusLabel,
  matchStatusVariant,
} from './match-display-constants';

type KnockoutMatchesViewProps = {
  matches: MatchListItem[];
  rounds: Round[];
  teamById: Map<string, TeamVisual>;
  onMatchClick: (matchId: string) => void;
  groupByRound?: boolean;
  roundOrder?: RoundSortOrder;
};

function KnockoutMatchCard({
  match,
  teamById,
  onMatchClick,
}: {
  match: MatchListItem;
  teamById: Map<string, TeamVisual>;
  onMatchClick: (matchId: string) => void;
}) {
  const homeTeam = match.homeTeamId ? teamById.get(match.homeTeamId) : undefined;
  const awayTeam = match.awayTeamId ? teamById.get(match.awayTeamId) : undefined;
  const showScore = hasMatchScore(match);
  const isLive = match.status === 'IN_PROGRESS';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/30',
        isLive && 'border-destructive/40 bg-destructive/5',
      )}
      onClick={() => onMatchClick(match.id)}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamAvatar team={homeTeam} size="sm" />
            <span className="truncate text-sm font-medium">
              {homeTeam?.name ?? 'A definir'}
            </span>
          </div>
          <span
            className={cn(
              'shrink-0 text-lg font-bold tabular-nums',
              !showScore && 'text-muted-foreground text-sm font-normal',
            )}
          >
            {showScore ? match.homeScore : '—'}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <SwordsIcon className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground text-xs uppercase tracking-wide">vs</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TeamAvatar team={awayTeam} size="sm" />
            <span className="truncate text-sm font-medium">
              {awayTeam?.name ?? 'A definir'}
            </span>
          </div>
          <span
            className={cn(
              'shrink-0 text-lg font-bold tabular-nums',
              !showScore && 'text-muted-foreground text-sm font-normal',
            )}
          >
            {showScore ? match.awayScore : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarIcon className="size-3" />
            {formatMatchDate(match.scheduledAt)}
          </span>
          <Badge variant={matchStatusVariant[match.status]} className="text-xs">
            {isLive && <RadioIcon className="mr-1 size-3 animate-pulse" />}
            {matchStatusLabel[match.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function KnockoutMatchesView({
  matches,
  rounds,
  teamById,
  onMatchClick,
  groupByRound = true,
  roundOrder = 'asc',
}: KnockoutMatchesViewProps) {
  if (matches.length === 0) {
    return null;
  }

  if (!groupByRound || rounds.length <= 1) {
    const sortedMatches = sortMatchesChronologically(matches);

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {sortedMatches.map((match) => (
          <KnockoutMatchCard
            key={match.id}
            match={match}
            teamById={teamById}
            onMatchClick={onMatchClick}
          />
        ))}
      </div>
    );
  }

  const groups = groupMatchesByRound(matches, rounds, roundOrder);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.round.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{getRoundLabel(group.round)}</h3>
            <div className="bg-border h-px flex-1" />
            <Badge variant="outline" className="text-xs">
              {group.matches.length} {group.matches.length === 1 ? 'jogo' : 'jogos'}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.matches.map((match) => (
              <KnockoutMatchCard
                key={match.id}
                match={match}
                teamById={teamById}
                onMatchClick={onMatchClick}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
