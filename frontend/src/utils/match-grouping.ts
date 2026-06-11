import type { MatchListItem } from '@/http/types/matches/match';
import type { Round, StageWithStructure } from '@/http/types/stages/stage';

export function getRoundLabel(round: Round): string {
  return round.name ?? `Rodada ${round.number}`;
}

export type RoundSortOrder = 'asc' | 'desc';

export function sortRounds(rounds: Round[], order: RoundSortOrder = 'asc'): Round[] {
  return [...rounds].sort((a, b) =>
    order === 'asc' ? a.number - b.number : b.number - a.number,
  );
}

export function sortMatchesChronologically<T extends { scheduledAt: string | null }>(
  matches: T[],
): T[] {
  return [...matches].sort((a, b) => {
    if (!a.scheduledAt && !b.scheduledAt) return 0;
    if (!a.scheduledAt) return 1;
    if (!b.scheduledAt) return -1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
}

export type RoundMatchGroup<T extends { roundId: string } = MatchListItem> = {
  round: Round;
  matches: T[];
};

export function groupMatchesByRound<T extends { roundId: string; scheduledAt: string | null }>(
  matches: T[],
  rounds: Round[],
  roundOrder: RoundSortOrder = 'asc',
): RoundMatchGroup<T>[] {
  const sortedRounds = sortRounds(rounds, roundOrder);
  const matchesByRound = new Map<string, T[]>();

  for (const match of matches) {
    const list = matchesByRound.get(match.roundId) ?? [];
    list.push(match);
    matchesByRound.set(match.roundId, list);
  }

  const groups: RoundMatchGroup<T>[] = [];

  for (const round of sortedRounds) {
    const roundMatches = matchesByRound.get(round.id);
    if (roundMatches?.length) {
      groups.push({ round, matches: sortMatchesChronologically(roundMatches) });
    }
  }

  const knownRoundIds = new Set(sortedRounds.map((round) => round.id));
  const orphanMatches = matches.filter((match) => !knownRoundIds.has(match.roundId));

  if (orphanMatches.length > 0) {
    const orphansByRound = new Map<string, T[]>();
    for (const match of orphanMatches) {
      const list = orphansByRound.get(match.roundId) ?? [];
      list.push(match);
      orphansByRound.set(match.roundId, list);
    }

    for (const [roundId, roundMatches] of orphansByRound) {
      groups.push({
        round: {
          id: roundId,
          stageId: '',
          number: groups.length + 1,
          name: null,
          createdAt: '',
        },
        matches: sortMatchesChronologically(roundMatches),
      });
    }
  }

  return groups;
}

export function buildRoundByIdMap(stages: StageWithStructure[]): Map<string, Round> {
  const map = new Map<string, Round>();

  for (const stage of stages) {
    for (const round of stage.rounds) {
      map.set(round.id, round);
    }
  }

  return map;
}

export function getRoundsForStage(
  stages: StageWithStructure[],
  stageId: string | null | undefined,
): Round[] {
  if (!stageId) {
    return sortRounds(stages.flatMap((stage) => stage.rounds));
  }

  const stage = stages.find((item) => item.id === stageId);
  return stage ? sortRounds(stage.rounds) : [];
}

export function filterMatchesByStage<T extends { roundId: string }>(
  matches: T[],
  stage: StageWithStructure,
): T[] {
  const roundIds = new Set(stage.rounds.map((round) => round.id));
  return matches.filter((match) => roundIds.has(match.roundId));
}
