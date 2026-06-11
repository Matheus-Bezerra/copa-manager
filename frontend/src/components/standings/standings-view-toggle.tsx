import { SwordsIcon, TableIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { StandingsViewMode } from '@/hooks/use-standings-view-mode';
import { cn } from '@/lib/utils';

type StandingsViewToggleProps = {
  value: StandingsViewMode;
  onChange: (mode: StandingsViewMode) => void;
  className?: string;
};

export function StandingsViewToggle({ value, onChange, className }: StandingsViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-border bg-secondary/40 p-1',
        className,
      )}
    >
      <Button
        type="button"
        size="sm"
        variant={value === 'groups' ? 'secondary' : 'ghost'}
        className="gap-2"
        onClick={() => onChange('groups')}
      >
        <TableIcon className="size-4" />
        Grupos
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === 'knockout' ? 'secondary' : 'ghost'}
        className="gap-2"
        onClick={() => onChange('knockout')}
      >
        <SwordsIcon className="size-4" />
        Mata-mata
      </Button>
    </div>
  );
}
