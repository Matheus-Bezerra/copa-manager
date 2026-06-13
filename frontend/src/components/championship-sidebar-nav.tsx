import { Link } from '@tanstack/react-router';

import { ContentLoading } from '@/components/content-loading';
import {
  getGroupedChampionshipNavItems,
  isChampionshipNavActive,
} from '@/constants/championship-nav';
import { cn } from '@/lib/utils';

type ChampionshipSidebarNavProps = {
  championshipId: string;
  championshipName?: string;
  championshipNameLoading?: boolean;
  currentPath: string;
  onNavigate?: () => void;
};

export function ChampionshipSidebarNav({
  championshipId,
  championshipName,
  championshipNameLoading,
  currentPath,
  onNavigate,
}: ChampionshipSidebarNavProps) {
  const grouped = getGroupedChampionshipNavItems();

  return (
    <div className="space-y-3">
      <div className="px-3">
        {championshipNameLoading ? (
          <ContentLoading variant="inline" label="Carregando..." />
        ) : (
          <p className="truncate text-xs font-semibold text-sidebar-foreground" title={championshipName}>
            {championshipName}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {grouped.map(({ group, label, items }) => (
          <div key={group} className="space-y-0.5">
            {label && (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                {label}
              </p>
            )}

            {items.map((item) => {
              const Icon = item.icon;
              const isActive = !item.disabled && isChampionshipNavActive(currentPath, championshipId, item.to);

              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="text-muted-foreground flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium opacity-50"
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  params={{ championshipId }}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary/15 text-sidebar-primary'
                      : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
