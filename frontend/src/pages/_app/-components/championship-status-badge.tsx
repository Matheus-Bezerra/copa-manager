import { Badge } from '@/components/ui/badge';
import type { ChampionshipStatus } from '@/http/types/championships/championship';

const statusConfig: Record<
  ChampionshipStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  OPEN: { label: 'Aberto', variant: 'secondary' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'default' },
  FINISHED: { label: 'Encerrado', variant: 'outline' },
};

type ChampionshipStatusBadgeProps = {
  status: ChampionshipStatus;
};

export function ChampionshipStatusBadge({ status }: ChampionshipStatusBadgeProps) {
  const { label, variant } = statusConfig[status];

  return <Badge variant={variant}>{label}</Badge>;
}
