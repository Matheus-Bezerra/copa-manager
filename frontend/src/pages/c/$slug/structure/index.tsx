import { createFileRoute } from '@tanstack/react-router';
import { LayersIcon } from 'lucide-react';

import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetPublicStructure } from '@/http/hooks/public/use-get-public-structure';
import type { StageWithStructure } from '@/http/types/stages/stage';

export const Route = createFileRoute('/c/$slug/structure/')({
  component: PublicStructurePage,
  head: () => ({ meta: [{ title: 'Copa Manager - Estrutura' }] }),
});

const stageTypeLabel: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  KNOCKOUT: 'Mata-Mata',
};

const stageFormatLabel: Record<string, string> = {
  ROUND_ROBIN: 'Turno único',
  DOUBLE_ROUND_ROBIN: 'Turno e returno',
};

function StageCard({ stage }: { stage: StageWithStructure }) {
  const isGroupStage = stage.type === 'GROUP_STAGE';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{stage.name}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs">
            {stageTypeLabel[stage.type] ?? stage.type}
          </Badge>
        </div>
        {isGroupStage && stage.format && (
          <p className="text-muted-foreground text-xs">
            {stageFormatLabel[stage.format] ?? stage.format}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isGroupStage && stage.groups.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
              <LayersIcon className="size-3.5" />
              Grupos
            </p>
            <div className="flex flex-wrap gap-2">
              {stage.groups.map((group) => (
                <Badge key={group.id} variant="secondary">
                  {group.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {stage.rounds.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              Rodadas
            </p>
            <div className="flex flex-wrap gap-2">
              {stage.rounds.map((round) => (
                <Badge key={round.id} variant="outline">
                  {round.name ?? `Rodada ${round.number}`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PublicStructurePage() {
  const { slug } = Route.useParams();
  const { data, isPending } = useGetPublicStructure(slug);

  const stages = data?.stages ?? [];

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <EmptyState
        title="Estrutura não configurada"
        description="A estrutura da competição ainda não foi definida."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Estrutura</h2>
        <p className="text-muted-foreground text-sm">
          Fases, grupos e rodadas da competição.
        </p>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <StageCard key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}
