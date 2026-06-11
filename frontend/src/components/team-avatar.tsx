import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export type TeamVisual = {
  name?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

type TeamAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeClasses: Record<TeamAvatarSize, string> = {
  xs: 'size-5 text-[9px]',
  sm: 'size-7 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
};

function getInitials(team: TeamVisual) {
  const source = team.shortName?.trim() || team.name?.trim() || '';
  return source.slice(0, 2).toUpperCase() || '?';
}

function getColorStyle(team: TeamVisual): CSSProperties | undefined {
  if (!team.primaryColor) return undefined;

  if (team.secondaryColor) {
    return {
      background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})`,
    };
  }

  return { backgroundColor: team.primaryColor };
}

type TeamAvatarProps = {
  team?: TeamVisual | null;
  size?: TeamAvatarSize;
  className?: string;
};

export function TeamAvatar({ team, size = 'sm', className }: TeamAvatarProps) {
  const sizeClass = sizeClasses[size];

  if (!team) {
    return <div className={cn(sizeClass, 'bg-muted shrink-0 rounded-full', className)} />;
  }

  if (team.logoUrl) {
    return (
      <img
        src={team.logoUrl}
        alt={team.name ?? 'Time'}
        className={cn(
          sizeClass,
          'border-border shrink-0 rounded-full border object-cover',
          className,
        )}
      />
    );
  }

  const colorStyle = getColorStyle(team);

  if (colorStyle) {
    return (
      <div
        className={cn(sizeClass, 'border-border/50 shrink-0 rounded-full border', className)}
        style={colorStyle}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full border border-border/50 font-semibold',
        className,
      )}
      aria-hidden
    >
      {getInitials(team)}
    </div>
  );
}

type TeamLabelProps = {
  team?: TeamVisual | null;
  fallback?: string;
  size?: TeamAvatarSize;
  className?: string;
  nameClassName?: string;
  reverse?: boolean;
};

export function TeamLabel({
  team,
  fallback = 'A definir',
  size = 'sm',
  className,
  nameClassName,
  reverse = false,
}: TeamLabelProps) {
  const label = team?.name ?? fallback;

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2',
        reverse && 'flex-row-reverse',
        className,
      )}
    >
      <TeamAvatar team={team} size={size} />
      <span className={cn('truncate text-sm font-medium', nameClassName)}>{label}</span>
    </div>
  );
}

export function TeamSelectOption({ team }: { team: TeamVisual }) {
  return (
    <span className="flex items-center gap-2">
      <TeamAvatar team={team} size="xs" />
      <span>{team.name}</span>
    </span>
  );
}
