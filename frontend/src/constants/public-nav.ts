import {
  GitBranchIcon,
  SwordsIcon,
  TableIcon,
  TrophyIcon,
  type LucideIcon,
} from 'lucide-react';

type PublicRoute =
  | '/c/$slug/standings'
  | '/c/$slug/matches'
  | '/c/$slug/players'
  | '/c/$slug/structure';

export type PublicNavItem = {
  label: string;
  to: PublicRoute;
  icon: LucideIcon;
};

export const publicNavItems: PublicNavItem[] = [
  { label: 'Classificação', to: '/c/$slug/standings', icon: TableIcon },
  { label: 'Partidas', to: '/c/$slug/matches', icon: SwordsIcon },
  { label: 'Jogadores', to: '/c/$slug/players', icon: TrophyIcon },
  { label: 'Estrutura', to: '/c/$slug/structure', icon: GitBranchIcon },
];

/** Builds consistent labels for teamIds when no public teams endpoint exists. */
export function buildTeamLabelMap(teamIds: string[]): Map<string, string> {
  const unique = [...new Set(teamIds.filter(Boolean))].sort();
  return new Map(unique.map((id, index) => [id, `Time ${index + 1}`]));
}
