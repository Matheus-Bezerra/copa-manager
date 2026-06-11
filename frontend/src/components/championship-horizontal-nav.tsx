import { Link } from '@tanstack/react-router';
import { useRef, type MutableRefObject } from 'react';
import { useDraggable } from 'react-use-draggable-scroll';

import { Separator } from '@/components/ui/separator';
import {
  getGroupedChampionshipNavItems,
  isChampionshipNavActive,
} from '@/constants/championship-nav';
import { cn } from '@/lib/utils';

type ChampionshipHorizontalNavProps = {
  championshipId: string;
  currentPath: string;
};

export function ChampionshipHorizontalNav({
  championshipId,
  currentPath,
}: ChampionshipHorizontalNavProps) {
  const navRef = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement>;
  const { events: navDragEvents } = useDraggable(navRef, {
    safeDisplacement: 10,
    applyRubberBandEffect: false,
  });

  const grouped = getGroupedChampionshipNavItems();

  return (
    <div className="max-w-full overflow-hidden rounded-lg border border-border bg-secondary/60">
      <nav
        ref={navRef}
        {...navDragEvents}
        className="scrollbar-styled flex cursor-grab items-center gap-0.5 overflow-x-scroll p-1 pb-2 [touch-action:pan-x]"
      >
        {grouped.map(({ group, items }, groupIndex) => (
          <div key={group} className="flex shrink-0 items-center gap-0.5">
            {groupIndex > 0 && (
              <Separator orientation="vertical" className="mx-1 h-5 shrink-0 opacity-40" />
            )}

            {items.map((item) => {
              const Icon = item.icon;
              const isActive = !item.disabled && isChampionshipNavActive(currentPath, championshipId, item.to);

              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="text-muted-foreground flex shrink-0 cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm font-medium opacity-50"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  params={{ championshipId }}
                  draggable={false}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
