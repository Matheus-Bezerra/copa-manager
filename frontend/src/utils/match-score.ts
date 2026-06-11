import type { MatchStatus } from '@/http/types/matches/match';

type MatchScoreFields = {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export function hasMatchScore(match: MatchScoreFields): boolean {
  return (
    (match.status === 'FINISHED' || match.status === 'IN_PROGRESS') &&
    match.homeScore !== null &&
    match.awayScore !== null
  );
}

export function formatMatchScore(match: MatchScoreFields): string {
  if (!hasMatchScore(match)) {
    return '×';
  }

  return `${match.homeScore} × ${match.awayScore}`;
}
