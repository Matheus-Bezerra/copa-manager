import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

import { ButtonLoading } from '@/components/button-loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchMembers } from '@/http/hooks/members/use-fetch-members';
import { getChampionshipRulesQueryKey, useGetChampionshipRules } from '@/http/hooks/rules/use-get-championship-rules';
import { useUpdateChampionshipRules } from '@/http/hooks/rules/use-update-championship-rules';
import { fetchTieBreakerRulesQueryKey, useFetchTieBreakerRules } from '@/http/hooks/rules/use-fetch-tie-breaker-rules';
import { useUpdateTieBreakerRules } from '@/http/hooks/rules/use-update-tie-breaker-rules';
import type { TieBreakerRule } from '@/http/types/rules/tie-breaker-rules';
import { useAuthStore } from '@/stores/auth-store';
import { z as zod } from '@/lib/zod';
import { errorHandler } from '@/utils/error-handler';

export const Route = createFileRoute(
  '/_app/championships/$championshipId/rules/',
)({
  component: RulesPage,
  head: () => ({ meta: [{ title: 'Copa Manager - Regras' }] }),
});

const championshipLayoutRouteApi = getRouteApi('/_app/championships/$championshipId');

const ALL_CRITERIA = [
  'POINTS',
  'WINS',
  'GOAL_DIFFERENCE',
  'GOALS_SCORED',
  'HEAD_TO_HEAD',
] as const;

type Criterion = (typeof ALL_CRITERIA)[number];

const criterionLabel: Record<Criterion, string> = {
  POINTS: 'Pontos',
  WINS: 'Vitórias',
  GOAL_DIFFERENCE: 'Saldo de gols',
  GOALS_SCORED: 'Gols marcados',
  HEAD_TO_HEAD: 'Confronto direto',
};

const rulesFormSchema = zod.object({
  winPoints: zod.string().regex(/^\d+$/, 'Valor inválido'),
  drawPoints: zod.string().regex(/^\d+$/, 'Valor inválido'),
  penaltyBonusPoints: zod.string().regex(/^\d+$/, 'Valor inválido'),
  yellowCardsForSuspension: zod
    .string()
    .regex(/^\d+$/, 'Valor inválido')
    .refine((v) => Number(v) >= 1, 'Mínimo de 1'),
  redCardSuspensionGames: zod.string().regex(/^\d+$/, 'Valor inválido'),
  matchDuration: zod
    .string()
    .regex(/^\d+$/, 'Valor inválido')
    .refine((v) => Number(v) >= 1, 'Mínimo de 1 minuto'),
});

type RulesFormData = z.infer<typeof rulesFormSchema>;

function normalizeCriterion(c: string): string {
  const map: Record<string, Criterion> = {
    POINTS: 'POINTS',
    WINS: 'WINS',
    Wins: 'WINS',
    GOAL_DIFFERENCE: 'GOAL_DIFFERENCE',
    GoalDifference: 'GOAL_DIFFERENCE',
    GOALS_SCORED: 'GOALS_SCORED',
    GoalsScored: 'GOALS_SCORED',
    HEAD_TO_HEAD: 'HEAD_TO_HEAD',
    HeadToHead: 'HEAD_TO_HEAD',
  };
  return map[c] ?? c;
}

function RulesPage() {
  const { championshipId } = Route.useParams();
  const { championship } = championshipLayoutRouteApi.useLoaderData();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: membersData } = useFetchMembers(championshipId);
  const { data: rulesData, isPending: rulesPending } = useGetChampionshipRules(championshipId);
  const { data: tieBreakerData, isPending: tieBreakerPending } =
    useFetchTieBreakerRules(championshipId);

  const members = membersData?.members ?? [];
  const isOwner = !!user && championship.ownerUserId === user.id;
  const currentMember = members.find((m) => m.userId === user?.id);
  const canEdit = isOwner || currentMember?.role === 'ADMINISTRATOR';

  const rules = rulesData?.rules;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RulesFormData>({
    resolver: zodResolver(rulesFormSchema),
    defaultValues: {
      winPoints: '3',
      drawPoints: '1',
      penaltyBonusPoints: '0',
      yellowCardsForSuspension: '3',
      redCardSuspensionGames: '1',
      matchDuration: '90',
    },
  });

  useEffect(() => {
    if (rules) {
      reset({
        winPoints: String(rules.winPoints),
        drawPoints: String(rules.drawPoints),
        penaltyBonusPoints: String(rules.penaltyBonusPoints),
        yellowCardsForSuspension: String(rules.yellowCardsForSuspension),
        redCardSuspensionGames: String(rules.redCardSuspensionGames),
        matchDuration: String(rules.matchDuration),
      });
    }
  }, [rules, reset]);

  const [tieBreakers, setTieBreakers] = useState<TieBreakerRule[]>([]);
  const [tieBreakerDirty, setTieBreakerDirty] = useState(false);

  useEffect(() => {
    if (tieBreakerData?.rules) {
      setTieBreakers(
        tieBreakerData.rules.map((r) => ({
          ...r,
          criterion: normalizeCriterion(r.criterion),
        })),
      );
      setTieBreakerDirty(false);
    }
  }, [tieBreakerData]);

  const { mutateAsync: updateRules, isPending: updatingRules } = useUpdateChampionshipRules();
  const { mutateAsync: updateTieBreakers, isPending: updatingTieBreakers } =
    useUpdateTieBreakerRules();

  async function onSubmitRules(formData: RulesFormData) {
    try {
      await updateRules({
        championshipId,
        data: {
          winPoints: Number(formData.winPoints),
          drawPoints: Number(formData.drawPoints),
          penaltyBonusPoints: Number(formData.penaltyBonusPoints),
          yellowCardsForSuspension: Number(formData.yellowCardsForSuspension),
          redCardSuspensionGames: Number(formData.redCardSuspensionGames),
          matchDuration: Number(formData.matchDuration),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: getChampionshipRulesQueryKey(championshipId),
      });
      toast.success('Regras atualizadas com sucesso');
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  async function saveTieBreakers() {
    if (tieBreakers.length === 0) {
      toast.error('Adicione ao menos um critério de desempate');
      return;
    }
    try {
      await updateTieBreakers({
        championshipId,
        data: {
          rules: tieBreakers.map((r, i) => ({
            position: i + 1,
            criterion: r.criterion,
          })),
        },
      });
      await queryClient.invalidateQueries({
        queryKey: fetchTieBreakerRulesQueryKey(championshipId),
      });
      setTieBreakerDirty(false);
      toast.success('Critérios de desempate salvos');
    } catch (error) {
      const { code, description } = errorHandler(error);
      toast.error(code, { description });
    }
  }

  function moveCriterion(index: number, direction: 'up' | 'down') {
    const next = [...tieBreakers];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setTieBreakers(next);
    setTieBreakerDirty(true);
  }

  function removeCriterion(index: number) {
    setTieBreakers((prev) => prev.filter((_, i) => i !== index));
    setTieBreakerDirty(true);
  }

  function addCriterion(criterion: string) {
    setTieBreakers((prev) => [
      ...prev,
      { criterion, position: prev.length + 1 },
    ]);
    setTieBreakerDirty(true);
  }

  const usedCriteria = new Set(tieBreakers.map((r) => r.criterion));
  const availableCriteria = ALL_CRITERIA.filter((c) => !usedCriteria.has(c));

  if (rulesPending || tieBreakerPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Regras</h1>
        <p className="text-muted-foreground text-sm">
          Configure pontuação, suspensões e critérios de desempate.
          {!canEdit && (
            <span className="ml-1 text-yellow-500">Somente leitura para seu papel.</span>
          )}
        </p>
      </div>

      {/* Pontuação e Suspensões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pontuação e Suspensões</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitRules)} className="space-y-6" noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="winPoints">Pontos por vitória</Label>
                <Input
                  id="winPoints"
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  {...register('winPoints')}
                />
                {errors.winPoints && (
                  <p className="text-destructive text-xs">{errors.winPoints.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="drawPoints">Pontos por empate</Label>
                <Input
                  id="drawPoints"
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  {...register('drawPoints')}
                />
                {errors.drawPoints && (
                  <p className="text-destructive text-xs">{errors.drawPoints.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="penaltyBonusPoints">Bônus por pênaltis</Label>
                <Input
                  id="penaltyBonusPoints"
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  {...register('penaltyBonusPoints')}
                />
                {errors.penaltyBonusPoints && (
                  <p className="text-destructive text-xs">{errors.penaltyBonusPoints.message}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="matchDuration">Duração da partida (min)</Label>
                <Input
                  id="matchDuration"
                  type="number"
                  min={1}
                  disabled={!canEdit}
                  {...register('matchDuration')}
                />
                {errors.matchDuration && (
                  <p className="text-destructive text-xs">{errors.matchDuration.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yellowCardsForSuspension">
                  Amarelos para suspensão
                </Label>
                <Input
                  id="yellowCardsForSuspension"
                  type="number"
                  min={1}
                  disabled={!canEdit}
                  {...register('yellowCardsForSuspension')}
                />
                {errors.yellowCardsForSuspension && (
                  <p className="text-destructive text-xs">
                    {errors.yellowCardsForSuspension.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="redCardSuspensionGames">
                  Jogos de suspensão por vermelho
                </Label>
                <Input
                  id="redCardSuspensionGames"
                  type="number"
                  min={0}
                  disabled={!canEdit}
                  {...register('redCardSuspensionGames')}
                />
                {errors.redCardSuspensionGames && (
                  <p className="text-destructive text-xs">
                    {errors.redCardSuspensionGames.message}
                  </p>
                )}
              </div>
            </div>


            {canEdit && (
              <div className="flex justify-end">
                <ButtonLoading type="submit" loading={updatingRules}>
                  Salvar regras
                </ButtonLoading>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Critérios de desempate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Critérios de desempate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tieBreakers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum critério configurado.</p>
          ) : (
            <ul className="space-y-2">
              {tieBreakers.map((rule, index) => {
                const label =
                  criterionLabel[rule.criterion as Criterion] ?? rule.criterion;
                return (
                  <li
                    key={`${rule.criterion}-${index}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <span className="text-muted-foreground w-6 text-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">{label}</span>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === 0}
                          onClick={() => moveCriterion(index, 'up')}
                        >
                          <ArrowUpIcon className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          disabled={index === tieBreakers.length - 1}
                          onClick={() => moveCriterion(index, 'down')}
                        >
                          <ArrowDownIcon className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => removeCriterion(index)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {canEdit && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {availableCriteria.length > 0 && (
                <Select onValueChange={addCriterion}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Adicionar critério…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCriteria.map((c) => (
                      <SelectItem key={c} value={c}>
                        <PlusIcon className="mr-1 inline size-3.5" />
                        {criterionLabel[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <ButtonLoading
                loading={updatingTieBreakers}
                disabled={!tieBreakerDirty}
                onClick={() => void saveTieBreakers()}
                type="button"
              >
                Salvar critérios
              </ButtonLoading>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
