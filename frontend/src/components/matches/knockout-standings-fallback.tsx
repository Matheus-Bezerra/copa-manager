import { useEffect, useMemo, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MatchListItem } from '@/http/types/matches/match';
import type { StageWithStructure } from '@/http/types/stages/stage';
import type { TeamVisual } from '@/components/team-avatar';
import { resolveActiveStage } from '@/utils/competition-filters';
import { filterMatchesByStage, sortRounds } from '@/utils/match-grouping';

import { KnockoutMatchesView } from './knockout-matches-view';

type KnockoutStandingsSectionProps = {
  stages: StageWithStructure[];
  matches: MatchListItem[];
  teamById: Map<string, TeamVisual>;
  onMatchClick: (matchId: string) => void;
  showIntro?: boolean;
};

export function KnockoutStandingsSection({
  stages,
  matches,
  teamById,
  onMatchClick,
  showIntro = false,
}: KnockoutStandingsSectionProps) {
  const knockoutStages = useMemo(
    () =>
      [...stages]
        .filter((stage) => stage.type === 'KNOCKOUT')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [stages],
  );

  const [selectedStageId, setSelectedStageId] = useState('');

  const activeKnockoutStage = useMemo(
    () => resolveActiveStage(knockoutStages, matches),
    [knockoutStages, matches],
  );

  useEffect(() => {
    if (!activeKnockoutStage || selectedStageId) {
      return;
    }

    setSelectedStageId(activeKnockoutStage.id);
  }, [activeKnockoutStage, selectedStageId]);

  const selectedStage =
    knockoutStages.find((stage) => stage.id === selectedStageId) ?? activeKnockoutStage;

  const stageMatches = selectedStage ? filterMatchesByStage(matches, selectedStage) : [];
  const rounds = selectedStage ? sortRounds(selectedStage.rounds) : [];

  if (knockoutStages.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Este campeonato não possui fases de grupo nem mata-mata configurado.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {showIntro && (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4">
          <p className="text-sm">
            Este campeonato não possui classificação por grupos. Acompanhe o mata-mata abaixo.
          </p>
        </div>
      )}

      {knockoutStages.length > 1 && (
        <div className="w-full sm:w-64">
          <Select value={selectedStageId} onValueChange={setSelectedStageId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma fase" />
            </SelectTrigger>
            <SelectContent>
              {knockoutStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {stageMatches.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma partida do mata-mata cadastrada ainda.
        </p>
      ) : (
        <KnockoutMatchesView
          matches={stageMatches}
          rounds={rounds}
          teamById={teamById}
          onMatchClick={onMatchClick}
          roundOrder="desc"
        />
      )}
    </div>
  );
}

export function KnockoutStandingsFallback({
  stages,
  matches,
  teamById,
  onMatchClick,
}: Omit<KnockoutStandingsSectionProps, 'showIntro'>) {
  return (
    <KnockoutStandingsSection
      stages={stages}
      matches={matches}
      teamById={teamById}
      onMatchClick={onMatchClick}
      showIntro
    />
  );
}
