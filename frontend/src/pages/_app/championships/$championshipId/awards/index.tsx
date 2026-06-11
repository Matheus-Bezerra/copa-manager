import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchAwardsQueryKey, useFetchAwards } from '@/http/hooks/awards/use-fetch-awards';
import { useGrantAward } from '@/http/hooks/awards/use-grant-award';
import { useFetchMembers } from '@/http/hooks/members/use-fetch-members';
import { useFetchPlayers } from '@/http/hooks/players/use-fetch-players';
import { useFetchTeams } from '@/http/hooks/teams/use-fetch-teams';
import type { AwardType } from '@/http/types/awards/award';
import { useAuthStore } from '@/stores/auth-store';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/awards/',
)({
  component: AwardsPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Premiações' }] }),
});

const championshipLayoutRouteApi = getRouteApi('/_app/championships/$championshipId');

const awardTypeLabel: Record<AwardType, string> = {
  TOP_SCORER: 'Artilheiro',
  MATCH_MVP: 'MVP da Partida',
  TOURNAMENT_MVP: 'MVP do Torneio',
  FAIR_PLAY: 'Fair Play',
};

const ALL_AWARD_TYPES: AwardType[] = [
  'TOP_SCORER',
  'MATCH_MVP',
  'TOURNAMENT_MVP',
  'FAIR_PLAY',
];

const grantAwardSchema = zod.object({
  type: zod.enum(['TOP_SCORER', 'MATCH_MVP', 'TOURNAMENT_MVP', 'FAIR_PLAY']),
  playerId: zod.string().min(1, 'Selecione um jogador'),
});

type GrantAwardFormData = z.infer<typeof grantAwardSchema>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function GrantAwardDialog({
  championshipId,
  open,
  onClose,
}: {
  championshipId: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: playersData } = useFetchPlayers(championshipId);
  const { data: teamsData } = useFetchTeams(championshipId);

  const players = playersData?.players ?? [];
  const teams = teamsData?.teams ?? [];
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

  const { handleSubmit, setValue, formState: { errors } } = useForm<GrantAwardFormData>({
    resolver: zodResolver(grantAwardSchema),
  });

  const { mutateAsync: grantAward, isPending } = useGrantAward();

  async function onSubmit(formData: GrantAwardFormData) {
    try {
      await grantAward({
        championshipId,
        data: { playerId: formData.playerId, type: formData.type },
      });
      await queryClient.invalidateQueries({
        queryKey: fetchAwardsQueryKey(championshipId),
      });
      toast.success('Premiação concedida com sucesso');
      onClose();
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conceder prêmio</DialogTitle>
          <DialogDescription>
            Selecione o tipo de premiação e o jogador que a receberá.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label>Tipo de premiação</Label>
            <Select onValueChange={(v) => setValue('type', v as AwardType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ALL_AWARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {awardTypeLabel[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-destructive text-xs">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Jogador</Label>
            <Select onValueChange={(v) => setValue('playerId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogador" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => {
                  const teamName = teamNameById.get(player.teamId) ?? '—';
                  return (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                      {player.shirtNumber !== null && ` (#${player.shirtNumber})`}
                      {' · '}
                      {teamName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.playerId && (
              <p className="text-destructive text-xs">{errors.playerId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <ButtonLoading type="submit" loading={isPending}>
              Conceder
            </ButtonLoading>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AwardsPage() {
  const { championshipId } = Route.useParams();
  const { championship } = championshipLayoutRouteApi.useLoaderData();
  const user = useAuthStore((state) => state.user);
  const [grantOpen, setGrantOpen] = useState(false);

  const { data: awardsData, isPending } = useFetchAwards(championshipId);
  const { data: playersData } = useFetchPlayers(championshipId);
  const { data: teamsData } = useFetchTeams(championshipId);
  const { data: membersData } = useFetchMembers(championshipId);

  const awards = awardsData?.awards ?? [];
  const players = playersData?.players ?? [];
  const teams = teamsData?.teams ?? [];
  const members = membersData?.members ?? [];

  const playerById = new Map(players.map((p) => [p.id, p]));
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

  const isOwner = !!user && championship.ownerUserId === user.id;
  const currentMember = members.find((m) => m.userId === user?.id);
  const canGrant = isOwner || currentMember?.role === 'ADMINISTRATOR';

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Premiações</h1>
          <p className="text-muted-foreground text-sm">
            Premiações concedidas neste campeonato.
          </p>
        </div>
        {canGrant && (
          <Button size="sm" onClick={() => setGrantOpen(true)}>
            <PlusIcon className="size-4" />
            Conceder prêmio
          </Button>
        )}
      </div>

      {awards.length === 0 ? (
        <EmptyState
          title="Nenhuma premiação concedida"
          description="Conceda prêmios aos jogadores do campeonato."
          action={
            canGrant ? (
              <Button size="sm" onClick={() => setGrantOpen(true)}>
                <PlusIcon className="size-4" />
                Conceder prêmio
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {awards.map((award) => {
              const player = playerById.get(award.playerId);
              const teamName = player ? (teamNameById.get(player.teamId) ?? '—') : '—';
              return (
                <TableRow key={award.id}>
                  <TableCell>
                    <Badge variant="secondary">
                      {awardTypeLabel[award.awardType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {player?.name ?? award.playerId.slice(0, 8)}
                    {player?.shirtNumber !== null && player?.shirtNumber !== undefined
                      ? ` (#${player.shirtNumber})`
                      : ''}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{teamName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(award.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {grantOpen && (
        <GrantAwardDialog
          championshipId={championshipId}
          open={grantOpen}
          onClose={() => setGrantOpen(false)}
        />
      )}
    </div>
  );
}
