import type { MatchStatus } from '@/http/types/matches/match';
import type { Round, StageWithStructure } from '@/http/types/stages/stage';

type MatchLike = {
  roundId: string;
  groupId: string | null;
  status: MatchStatus;
};

export function buildRoundStageMap(stages: StageWithStructure[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const stage of stages) {
    for (const round of stage.rounds) {
      map.set(round.id, stage.id);
    }
  }

  return map;
}

export function resolveActiveGroupStage(
  stages: StageWithStructure[],
  matches: MatchLike[],
): StageWithStructure | null {
  const groupStages = stages
    .filter((stage) => stage.type === 'GROUP_STAGE')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (groupStages.length === 0) {
    return null;
  }

  const roundStageMap = buildRoundStageMap(stages);

  for (const stage of groupStages) {
    const stageMatches = matches.filter((match) => {
      const matchStageId = roundStageMap.get(match.roundId);
      return matchStageId === stage.id && match.status !== 'CANCELLED';
    });

    if (stageMatches.some((match) => match.status !== 'FINISHED')) {
      return stage;
    }
  }

  return groupStages[groupStages.length - 1] ?? null;
}

export function resolveActiveGroup<T extends { id: string }>(
  groups: T[],
  matches: MatchLike[],
): T | null {
  if (groups.length === 0) {
    return null;
  }

  if (groups.length === 1) {
    return groups[0];
  }

  const liveGroupId = matches.find((match) => match.status === 'IN_PROGRESS')?.groupId;
  if (liveGroupId) {
    const liveGroup = groups.find((group) => group.id === liveGroupId);
    if (liveGroup) {
      return liveGroup;
    }
  }

  for (const group of groups) {
    const hasPendingMatch = matches.some(
      (match) =>
        match.groupId === group.id &&
        match.status !== 'FINISHED' &&
        match.status !== 'CANCELLED',
    );

    if (hasPendingMatch) {
      return group;
    }
  }

  return groups[0];
}

export function resolveActiveStage(
  stages: StageWithStructure[],
  matches: MatchLike[],
): StageWithStructure | null {
  if (stages.length === 0) {
    return null;
  }

  const sortedStages = [...stages].sort((a, b) => a.displayOrder - b.displayOrder);
  const roundStageMap = buildRoundStageMap(stages);

  for (const stage of sortedStages) {
    const stageMatches = matches.filter((match) => {
      const matchStageId = roundStageMap.get(match.roundId);
      return matchStageId === stage.id && match.status !== 'CANCELLED';
    });

    if (stageMatches.some((match) => match.status !== 'FINISHED')) {
      return stage;
    }
  }

  return sortedStages[sortedStages.length - 1] ?? null;
}

export function resolveCurrentRound(
  rounds: Round[],
  matches: MatchLike[],
): Round | null {
  if (rounds.length === 0) {
    return null;
  }

  const sortedRounds = [...rounds].sort((a, b) => a.number - b.number);

  for (const round of sortedRounds) {
    const roundMatches = matches.filter(
      (match) => match.roundId === round.id && match.status !== 'CANCELLED',
    );

    if (roundMatches.length === 0) {
      return round;
    }

    const allFinished = roundMatches.every((match) => match.status === 'FINISHED');

    if (!allFinished) {
      return round;
    }
  }

  return sortedRounds[sortedRounds.length - 1] ?? null;
}
