import { CalendarIcon, RadioIcon } from 'lucide-react';

import { TeamLabel, type TeamVisual } from '@/components/team-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MatchListItem } from '@/http/types/matches/match';
import { cn } from '@/lib/utils';
import { formatMatchScore, hasMatchScore } from '@/utils/match-score';
import {
  getRoundLabel,
  groupMatchesByRound,
  sortMatchesChronologically,
  type RoundMatchGroup,
} from '@/utils/match-grouping';
import type { Round } from '@/http/types/stages/stage';

import {
  formatMatchDate,
  matchStatusLabel,
  matchStatusVariant,
} from './match-display-constants';

type MatchesTableProps = {
  matches: MatchListItem[];
  rounds: Round[];
  groupByRound: boolean;
  teamById: Map<string, TeamVisual>;
  onMatchClick: (matchId: string) => void;
};

function MatchTableRow({
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

  return (
    <TableRow className="cursor-pointer" onClick={() => onMatchClick(match.id)}>
      <TableCell>
        <TeamLabel team={homeTeam} size="xs" />
      </TableCell>
      <TableCell
        className={cn(
          'text-center text-sm tabular-nums',
          showScore ? 'font-semibold' : 'text-muted-foreground',
        )}
      >
        {formatMatchScore(match)}
      </TableCell>
      <TableCell>
        <TeamLabel team={awayTeam} size="xs" />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5" />
          {formatMatchDate(match.scheduledAt)}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={matchStatusVariant[match.status]}>
          {match.status === 'IN_PROGRESS' && (
            <RadioIcon className="mr-1 size-3 animate-pulse" />
          )}
          {matchStatusLabel[match.status]}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

function RoundSectionHeader({ label }: { label: string }) {
  return (
    <TableRow className="bg-muted/40 hover:bg-muted/40">
      <TableCell colSpan={5} className="py-2">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </TableCell>
    </TableRow>
  );
}

function renderGroupedRows(
  groups: RoundMatchGroup[],
  teamById: Map<string, TeamVisual>,
  onMatchClick: (matchId: string) => void,
) {
  return groups.flatMap((group) => [
    <RoundSectionHeader key={`round-${group.round.id}`} label={getRoundLabel(group.round)} />,
    ...group.matches.map((match) => (
      <MatchTableRow
        key={match.id}
        match={match}
        teamById={teamById}
        onMatchClick={onMatchClick}
      />
    )),
  ]);
}

export function MatchesTable({
  matches,
  rounds,
  groupByRound,
  teamById,
  onMatchClick,
}: MatchesTableProps) {
  const groups = groupByRound ? groupMatchesByRound(matches, rounds) : null;
  const flatMatches = groupByRound ? null : sortMatchesChronologically(matches);

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mandante</TableHead>
            <TableHead className="text-center">Placar</TableHead>
            <TableHead>Visitante</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups
            ? renderGroupedRows(groups, teamById, onMatchClick)
            : flatMatches?.map((match) => (
                <MatchTableRow
                  key={match.id}
                  match={match}
                  teamById={teamById}
                  onMatchClick={onMatchClick}
                />
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
