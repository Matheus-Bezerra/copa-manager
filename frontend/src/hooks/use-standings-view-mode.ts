import { useEffect, useMemo, useState } from 'react';

import type { MatchListItem } from '@/http/types/matches/match';
import type { StageWithStructure } from '@/http/types/stages/stage';
import { resolveActiveStage } from '@/utils/competition-filters';

export type StandingsViewMode = 'groups' | 'knockout';

export function useStandingsViewMode(
  stages: StageWithStructure[],
  matches: MatchListItem[],
) {
  const groupStages = useMemo(
    () =>
      [...stages]
        .filter((stage) => stage.type === 'GROUP_STAGE')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [stages],
  );

  const knockoutStages = useMemo(
    () =>
      [...stages]
        .filter((stage) => stage.type === 'KNOCKOUT')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [stages],
  );

  const hasGroupStages = groupStages.length > 0;
  const hasKnockoutStages = knockoutStages.length > 0;
  const hasBothViews = hasGroupStages && hasKnockoutStages;

  const activeStage = useMemo(
    () => resolveActiveStage(stages, matches),
    [stages, matches],
  );

  const defaultViewMode = useMemo((): StandingsViewMode => {
    if (!hasGroupStages) {
      return 'knockout';
    }

    if (!hasKnockoutStages) {
      return 'groups';
    }

    return activeStage?.type === 'KNOCKOUT' ? 'knockout' : 'groups';
  }, [activeStage?.type, hasGroupStages, hasKnockoutStages]);

  const [viewMode, setViewMode] = useState<StandingsViewMode | null>(null);

  useEffect(() => {
    if (viewMode !== null) {
      return;
    }

    if (!hasGroupStages && !hasKnockoutStages) {
      return;
    }

    setViewMode(defaultViewMode);
  }, [defaultViewMode, hasGroupStages, hasKnockoutStages, viewMode]);

  return {
    viewMode: viewMode ?? defaultViewMode,
    setViewMode,
    hasBothViews,
    hasGroupStages,
    hasKnockoutStages,
    groupStages,
    knockoutStages,
    activeStage,
  };
}
