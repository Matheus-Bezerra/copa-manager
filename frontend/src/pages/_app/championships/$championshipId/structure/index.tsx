import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { GitBranchIcon, LayersIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchStagesQueryKey,
} from '@/http/hooks/stages/use-fetch-stages';
import {
  getChampionshipStructureQueryKey,
  useGetChampionshipStructure,
} from '@/http/hooks/stages/use-get-championship-structure';
import { useSetupStages } from '@/http/hooks/stages/use-setup-stages';
import type { StageWithStructure } from '@/http/types/stages/stage';
import { errorHandler } from '@/utils/error-handler';

import type { SetupFormData } from './-components/setup-stages-form';
import { SetupStagesForm, toSetupPayload } from './-components/setup-stages-form';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/structure/',
)({
  component: StructurePage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Estrutura' }],
  }),
});

const stageTypeLabel: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  KNOCKOUT: 'Mata-Mata',
};

const stageFormatLabel: Record<string, string> = {
  ROUND_ROBIN: 'Turno único',
  DOUBLE_ROUND_ROBIN: 'Turno e returno',
};

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<{ code?: string; error?: { code: string } }>;
  return axiosError.response?.data?.error?.code ?? axiosError.response?.data?.code;
}

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
            {stage.teamsToAdvance ? ` · ${stage.teamsToAdvance} avança(m) por grupo` : ''}
          </p>
        )}
        {!isGroupStage && stage.qualifiedTeams != null && (
          <p className="text-muted-foreground text-xs">
            {stage.qualifiedTeams} times classificados
            {stage.thirdPlaceMatch ? ' · Com disputa de 3º lugar' : ''}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {isGroupStage && stage.groups.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wide">
              Grupos
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stage.groups.map((group) => (
                <Badge key={group.id} variant="secondary" className="text-xs">
                  {group.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {stage.rounds.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wide">
              Rodadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stage.rounds.map((round) => (
                <Badge key={round.id} variant="outline" className="text-xs">
                  {round.name ?? `Rodada ${round.number}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isGroupStage && stage.groups.length === 0 && stage.rounds.length === 0 && (
          <p className="text-muted-foreground text-sm">Sem grupos ou rodadas geradas.</p>
        )}
        {!isGroupStage && stage.rounds.length === 0 && (
          <p className="text-muted-foreground text-sm">Sem rodadas geradas.</p>
        )}
      </CardContent>
    </Card>
  );
}

function StructurePage() {
  const { championshipId } = Route.useParams();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<SetupFormData | null>(null);

  const { data, isPending, isError } = useGetChampionshipStructure(championshipId);

  const stages = data?.stages ?? [];
  const hasStructure = stages.length > 0;

  const { mutateAsync: setupStages, isPending: isSettingUp } = useSetupStages();

  function openDialog() {
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setPendingFormData(null);
    setConfirmOpen(false);
  }

  async function handleFormSubmit(formData: SetupFormData) {
    if (hasStructure) {
      setPendingFormData(formData);
      setConfirmOpen(true);
      return;
    }
    await executeSetup(formData);
  }

  async function executeSetup(formData: SetupFormData) {
    const payload = toSetupPayload(formData);

    try {
      await setupStages({ championshipId, data: payload });
      await queryClient.invalidateQueries({
        queryKey: fetchStagesQueryKey(championshipId),
      });
      await queryClient.invalidateQueries({
        queryKey: getChampionshipStructureQueryKey(championshipId),
      });
      toast.success('Estrutura configurada com sucesso');
      closeDialog();
    } catch (error) {
      const code = getApiErrorCode(error);

      const stageErrorMessages: Record<string, string> = {
        'STAGE/INVALID_FORMAT': 'Formato inválido para o tipo de fase selecionado.',
        'STAGE/INVALID_QUALIFIED_TEAMS': 'Times qualificados deve ser potência de 2 (ex.: 2, 4, 8, 16).',
        'STAGE/GROUP_REQUIRED': 'Fases de grupo precisam de ao menos 1 grupo.',
        'STAGE/DUPLICATE_ORDER': 'A ordem das fases deve ser única.',
      };

      if (code && code in stageErrorMessages) {
        toast.error('Erro na configuração', { description: stageErrorMessages[code] });
        return;
      }

      const { code: errorCode, description } = errorHandler(error);
      toast.error(errorCode, { description });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Estrutura</h2>
          {hasStructure && (
            <p className="text-muted-foreground text-sm">
              {stages.length} {stages.length === 1 ? 'fase' : 'fases'}
            </p>
          )}
        </div>

        <Button size="sm" onClick={openDialog} variant={hasStructure ? 'outline' : 'default'}>
          {hasStructure ? (
            <>
              <RefreshCwIcon className="size-4" />
              Reconfigurar
            </>
          ) : (
            <>
              <PlusIcon className="size-4" />
              Configurar
            </>
          )}
        </Button>
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isPending && !isError && !hasStructure && (
        <EmptyState
          title="Competição sem estrutura"
          description="Defina as fases e grupos para organizar o campeonato."
          action={
            <Button size="sm" onClick={openDialog}>
              <LayersIcon className="size-4" />
              Configurar estrutura
            </Button>
          }
        />
      )}

      {!isPending && !isError && hasStructure && (
        <div className="grid gap-4 md:grid-cols-2">
          {stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      )}

      {!isPending && isError && (
        <EmptyState
          title="Erro ao carregar estrutura"
          description="Não foi possível carregar a estrutura do campeonato."
          action={
            <Button size="sm" variant="outline" onClick={openDialog}>
              <GitBranchIcon className="size-4" />
              Configurar estrutura
            </Button>
          }
        />
      )}

      {/* Setup Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {hasStructure ? 'Reconfigurar estrutura' : 'Configurar estrutura'}
            </DialogTitle>
            <DialogDescription>
              {hasStructure
                ? 'Atenção: isso substituirá toda a estrutura atual.'
                : 'Defina as fases, grupos e rodadas do campeonato.'}
            </DialogDescription>
          </DialogHeader>

          {dialogOpen && (
            <SetupStagesForm
              onSubmit={handleFormSubmit}
              isPending={isSettingUp}
              onCancel={closeDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation AlertDialog (only when reconfiguring) */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmOpen(false);
            setPendingFormData(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reconfigurar estrutura?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso apagará toda a estrutura atual (fases, grupos, rodadas) e as partidas não
              encerradas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSettingUp}
              onClick={(event) => {
                event.preventDefault();
                if (pendingFormData) {
                  void executeSetup(pendingFormData);
                }
              }}
            >
              {isSettingUp ? 'Configurando…' : 'Confirmar e reconfigurar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
