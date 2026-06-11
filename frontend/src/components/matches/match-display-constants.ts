import type { MatchStatus } from '@/http/types/matches/match';

export const matchStatusLabel: Record<MatchStatus, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em andamento',
  FINISHED: 'Encerrada',
  CANCELLED: 'Cancelada',
};

export const matchStatusVariant: Record<
  MatchStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  SCHEDULED: 'outline',
  IN_PROGRESS: 'default',
  FINISHED: 'secondary',
  CANCELLED: 'destructive',
};

export function formatMatchDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
