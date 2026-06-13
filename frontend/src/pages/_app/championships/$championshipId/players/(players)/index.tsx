import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { TeamAvatar, TeamSelectOption } from '@/components/team-avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLoading } from '@/components/content-loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchPlayersQueryKey, useFetchPlayers } from '@/http/hooks/players/use-fetch-players';
import { useCreatePlayer } from '@/http/hooks/players/use-create-player';
import { useDeletePlayer } from '@/http/hooks/players/use-delete-player';
import { useUpdatePlayer } from '@/http/hooks/players/use-update-player';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { Player } from '@/http/types/players/player';
import { errorHandler } from '@/utils/error-handler';

import {
  PlayerForm,
  toPlayerPayload,
  type PlayerFormData,
} from './-components/player-form';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/players/(players)/',
)({
  component: PlayersPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Jogadores' }],
  }),
});

function playerToFormData(player: Player): PlayerFormData {
  return {
    teamId: player.teamId,
    name: player.name,
    shirtNumber: player.shirtNumber != null ? String(player.shirtNumber) : '',
  };
}

function PlayersPage() {
  const { championshipId } = Route.useParams();
  const queryClient = useQueryClient();
  const [teamId, setTeamId] = useQueryState('teamId', parseAsString);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const { data: teamsData } = useFetchTeams(championshipId);
  const teams = teamsData?.teams ?? [];

  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const teamNameById = useMemo(
    () => new Map(teams.map((team) => [team.id, team.name])),
    [teams],
  );
  const selectedTeam = teamId ? teamById.get(teamId) : undefined;

  const { data, isPending, isError, error } = useFetchPlayers(championshipId);

  useEffect(() => {
    if (isError && error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }, [isError, error]);

  const players = useMemo(() => {
    const allPlayers = data?.players ?? [];
    if (!teamId) {
      return allPlayers;
    }
    return allPlayers.filter((player) => player.teamId === teamId);
  }, [data?.players, teamId]);

  const { mutateAsync: createPlayer, isPending: isCreating } = useCreatePlayer({
    mutation: {
      onError: (mutationError) => {
        const { code, description } = errorHandler(mutationError);
        toast.error(code, { description });
      },
    },
  });

  const { mutateAsync: updatePlayer, isPending: isUpdating } = useUpdatePlayer({
    mutation: {
      onError: (mutationError) => {
        const { code, description } = errorHandler(mutationError);
        toast.error(code, { description });
      },
    },
  });

  const { mutateAsync: deletePlayer, isPending: isDeleting } = useDeletePlayer({
    mutation: {
      onError: (mutationError) => {
        const { code, description } = errorHandler(mutationError);
        toast.error(code, { description });
      },
    },
  });

  function openCreateDialog() {
    setEditingPlayer(null);
    setDialogOpen(true);
  }

  function openEditDialog(player: Player) {
    setEditingPlayer(player);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingPlayer(null);
  }

  async function invalidatePlayers() {
    await queryClient.invalidateQueries({
      queryKey: fetchPlayersQueryKey(championshipId),
    });
  }

  async function handleSubmit(formData: PlayerFormData) {
    const payload = toPlayerPayload(formData);

    if (editingPlayer) {
      await updatePlayer({
        championshipId,
        playerId: editingPlayer.id,
        data: payload,
      });
      toast.success('Jogador atualizado');
    } else {
      await createPlayer({ championshipId, data: payload });
      toast.success('Jogador criado');
    }

    await invalidatePlayers();
    closeDialog();
  }

  async function handleDelete(player: Player) {
    await deletePlayer({ championshipId, playerId: player.id });
    await invalidatePlayers();
    toast.success('Jogador excluído');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Jogadores</h2>
          <p className="text-muted-foreground text-sm">
            {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={teamId ?? 'all'}
            onValueChange={(value) => void setTeamId(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              {selectedTeam ? (
                <span className="flex items-center gap-2">
                  <TeamAvatar team={selectedTeam} size="xs" />
                  <span className="truncate">{selectedTeam.name}</span>
                </span>
              ) : (
                <SelectValue placeholder="Filtrar por time" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os times</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  <TeamSelectOption team={team} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={openCreateDialog} disabled={teams.length === 0}>
            <PlusIcon className="size-4" />
            Novo jogador
          </Button>
        </div>
      </div>

      {teams.length === 0 && !isPending && (
        <EmptyState
          title="Nenhum time cadastrado"
          description="Cadastre times antes de adicionar jogadores ao campeonato."
        />
      )}

      {teams.length > 0 && isPending && <ContentLoading variant="list" />}

      {teams.length > 0 && !isPending && !isError && players.length === 0 && (
        <EmptyState
          title="Nenhum jogador cadastrado"
          description={
            teamId
              ? 'Nenhum jogador encontrado para o time selecionado.'
              : 'Adicione o primeiro jogador ao campeonato.'
          }
          action={
            <Button size="sm" onClick={openCreateDialog}>
              <PlusIcon className="size-4" />
              Novo jogador
            </Button>
          }
        />
      )}

      {teams.length > 0 && !isPending && !isError && players.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-20">Número</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="w-16 text-center">Gols</TableHead>
              <TableHead className="w-28 text-center">Cartões</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.shirtNumber ?? '—'}</TableCell>
                <TableCell>{teamNameById.get(player.teamId) ?? '—'}</TableCell>
                <TableCell className="text-center">
                  {player.statistics?.goals ?? 0}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-yellow-500">{player.statistics?.yellowCards ?? 0}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-red-500">{player.statistics?.redCards ?? 0}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEditDialog(player)}
                    >
                      <PencilIcon className="size-4" />
                      <span className="sr-only">Editar jogador</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" disabled={isDeleting}>
                          <Trash2Icon className="text-destructive size-4" />
                          <span className="sr-only">Excluir jogador</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir jogador?</AlertDialogTitle>
                          <AlertDialogDescription>
                            O jogador <strong>{player.name}</strong> será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                            onClick={(event) => {
                              event.preventDefault();
                              void handleDelete(player);
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
            <DialogTitle>{editingPlayer ? 'Editar jogador' : 'Novo jogador'}</DialogTitle>
            <DialogDescription>
              {editingPlayer
                ? 'Atualize os dados do jogador.'
                : 'Preencha os dados para adicionar um novo jogador.'}
            </DialogDescription>
          </DialogHeader>

          {dialogOpen && (
            <PlayerForm
              key={editingPlayer?.id ?? 'create'}
              championshipId={championshipId}
              defaultValues={editingPlayer ? playerToFormData(editingPlayer) : undefined}
              onSubmit={handleSubmit}
              isPending={isCreating || isUpdating}
              onCancel={closeDialog}
              submitLabel={editingPlayer ? 'Salvar alterações' : 'Criar jogador'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
