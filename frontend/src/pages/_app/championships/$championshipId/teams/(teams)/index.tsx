import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { TeamLabel } from '@/components/team-avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchTeamsQueryKey,
  useFetchTeams,
} from '@/http/hooks/teams/use-fetch-teams';
import { useCreateTeam } from '@/http/hooks/teams/use-create-team';
import { useDeleteTeam } from '@/http/hooks/teams/use-delete-team';
import { useUpdateTeam } from '@/http/hooks/teams/use-update-team';
import type { Team } from '@/http/types/teams/team';
import { errorHandler } from '@/utils/error-handler';

import {
  TeamForm,
  toTeamPayload,
  type TeamFormData,
} from './-components/team-form';

export const Route = createFileRoute('/_app/championships/$championshipId/teams/(teams)/')({
  component: TeamsPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Times' }],
  }),
});

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError<{ code?: string; error?: { code: string } }>;
  return axiosError.response?.data?.error?.code ?? axiosError.response?.data?.code;
}

function teamToFormData(team: Team): TeamFormData {
  return {
    name: team.name,
    shortName: team.shortName ?? '',
    logoUrl: team.logoUrl ?? '',
    primaryColor: team.primaryColor ?? '',
    secondaryColor: team.secondaryColor ?? '',
  };
}

function TeamColors({ primaryColor, secondaryColor }: { primaryColor: string | null; secondaryColor: string | null }) {
  if (!primaryColor && !secondaryColor) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {primaryColor && (
        <span
          className="size-5 rounded-full border border-border"
          style={{ backgroundColor: primaryColor }}
          title={primaryColor}
        />
      )}
      {secondaryColor && (
        <span
          className="size-5 rounded-full border border-border"
          style={{ backgroundColor: secondaryColor }}
          title={secondaryColor}
        />
      )}
    </div>
  );
}

function TeamsPage() {
  const { championshipId } = Route.useParams();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const { data, isPending, isError, error } = useFetchTeams(championshipId);

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const teams = data?.teams ?? [];

  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam({
    mutation: {
      onError: (mutationError) => {
        const code = getApiErrorCode(mutationError);

        if (code === 'TEAM/NAME_ALREADY_TAKEN') {
          toast.error('Nome em uso', {
            description: 'Já existe um time com esse nome neste campeonato.',
          });
          return;
        }

        const { code: errorCode, description } = errorHandler(mutationError);
        toast.error(errorCode, { description });
      },
    },
  });

  const { mutateAsync: updateTeam, isPending: isUpdating } = useUpdateTeam({
    mutation: {
      onError: (mutationError) => {
        const code = getApiErrorCode(mutationError);

        if (code === 'TEAM/NAME_ALREADY_TAKEN') {
          toast.error('Nome em uso', {
            description: 'Já existe um time com esse nome neste campeonato.',
          });
          return;
        }

        const { code: errorCode, description } = errorHandler(mutationError);
        toast.error(errorCode, { description });
      },
    },
  });

  const { mutateAsync: deleteTeam, isPending: isDeleting } = useDeleteTeam({
    mutation: {
      onError: (mutationError) => {
        const { code, description } = errorHandler(mutationError);
        toast.error(code, { description });
      },
    },
  });

  function openCreateDialog() {
    setEditingTeam(null);
    setDialogOpen(true);
  }

  function openEditDialog(team: Team) {
    setEditingTeam(team);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingTeam(null);
  }

  async function handleSubmit(formData: TeamFormData) {
    const payload = toTeamPayload(formData);

    if (editingTeam) {
      await updateTeam({
        championshipId,
        teamId: editingTeam.id,
        data: payload,
      });
      toast.success('Time atualizado');
    } else {
      await createTeam({ championshipId, data: payload });
      toast.success('Time criado');
    }

    await queryClient.invalidateQueries({ queryKey: fetchTeamsQueryKey(championshipId) });
    closeDialog();
  }

  async function handleDelete(team: Team) {
    await deleteTeam({ championshipId, teamId: team.id });
    await queryClient.invalidateQueries({ queryKey: fetchTeamsQueryKey(championshipId) });
    toast.success('Time excluído');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Times</h2>
          <p className="text-muted-foreground text-sm">
            {teams.length} {teams.length === 1 ? 'time' : 'times'}
          </p>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <PlusIcon className="size-4" />
          Novo time
        </Button>
      </div>

      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isPending && !isError && teams.length === 0 && (
        <EmptyState
          title="Nenhum time cadastrado"
          description="Adicione o primeiro time para começar a montar o campeonato."
          action={
            <Button size="sm" onClick={openCreateDialog}>
              <PlusIcon className="size-4" />
              Novo time
            </Button>
          }
        />
      )}

      {!isPending && !isError && teams.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Sigla</TableHead>
              <TableHead>Cores</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <TeamLabel team={team} size="xs" />
                </TableCell>
                <TableCell>{team.shortName ?? '—'}</TableCell>
                <TableCell>
                  <TeamColors
                    primaryColor={team.primaryColor}
                    secondaryColor={team.secondaryColor}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEditDialog(team)}
                    >
                      <PencilIcon className="size-4" />
                      <span className="sr-only">Editar time</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" disabled={isDeleting}>
                          <Trash2Icon className="text-destructive size-4" />
                          <span className="sr-only">Excluir time</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir time?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O time <strong>{team.name}</strong> será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={(event) => {
                              event.preventDefault();
                              void handleDelete(team);
                            }}
                          >
                            {isDeleting ? 'Excluindo…' : 'Excluir'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Editar time' : 'Novo time'}</DialogTitle>
            <DialogDescription>
              {editingTeam
                ? 'Atualize os dados do time.'
                : 'Preencha os dados para adicionar um novo time.'}
            </DialogDescription>
          </DialogHeader>

          {dialogOpen && (
            <TeamForm
              key={editingTeam?.id ?? 'create'}
              defaultValues={editingTeam ? teamToFormData(editingTeam) : undefined}
              onSubmit={handleSubmit}
              isPending={isCreating || isUpdating}
              onCancel={closeDialog}
              submitLabel={editingTeam ? 'Salvar alterações' : 'Criar time'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
