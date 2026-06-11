import {
  AwardIcon,
  GitBranchIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldIcon,
  SwordsIcon,
  TableIcon,
  TrophyIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

type ChampionshipRoute =
  | '/championships/$championshipId'
  | '/championships/$championshipId/teams'
  | '/championships/$championshipId/players'
  | '/championships/$championshipId/structure'
  | '/championships/$championshipId/matches'
  | '/championships/$championshipId/standings'
  | '/championships/$championshipId/rules'
  | '/championships/$championshipId/awards'
  | '/championships/$championshipId/members'
  | '/championships/$championshipId/settings';

export type NavGroup = 'overview' | 'setup' | 'competition' | 'admin';

export type ChampionshipNavItem = {
  label: string;
  to: ChampionshipRoute;
  icon: LucideIcon;
  group: NavGroup;
  disabled?: boolean;
};

export const championshipNavItems: ChampionshipNavItem[] = [
  { label: 'Visão geral', to: '/championships/$championshipId', icon: LayoutDashboardIcon, group: 'overview' },
  { label: 'Times', to: '/championships/$championshipId/teams', icon: UsersIcon, group: 'setup' },
  { label: 'Jogadores', to: '/championships/$championshipId/players', icon: TrophyIcon, group: 'setup' },
  { label: 'Estrutura', to: '/championships/$championshipId/structure', icon: GitBranchIcon, group: 'setup' },
  { label: 'Regras', to: '/championships/$championshipId/rules', icon: ShieldIcon, group: 'setup' },
  { label: 'Partidas', to: '/championships/$championshipId/matches', icon: SwordsIcon, group: 'competition' },
  { label: 'Classificação', to: '/championships/$championshipId/standings', icon: TableIcon, group: 'competition' },
  { label: 'Premiações', to: '/championships/$championshipId/awards', icon: AwardIcon, group: 'competition' },
  { label: 'Membros', to: '/championships/$championshipId/members', icon: UsersIcon, group: 'admin' },
  { label: 'Configurações', to: '/championships/$championshipId/settings', icon: SettingsIcon, group: 'admin' },
];

export const NAV_GROUP_ORDER: NavGroup[] = ['overview', 'setup', 'competition', 'admin'];

export const NAV_GROUP_LABELS: Record<NavGroup, string | null> = {
  overview: null,
  setup: 'Configuração',
  competition: 'Competição',
  admin: 'Administração',
};

export function getChampionshipIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/championships\/([^/]+)/);
  const id = match?.[1];
  if (!id || id === 'create') return null;
  return id;
}

export function isChampionshipNavActive(
  currentPath: string,
  championshipId: string,
  to: string,
): boolean {
  if (to === '/championships/$championshipId') {
    return (
      currentPath === `/championships/${championshipId}` ||
      currentPath === `/championships/${championshipId}/`
    );
  }

  const path = to.replace('$championshipId', championshipId);
  return (
    currentPath === path ||
    currentPath === `${path}/` ||
    currentPath.startsWith(`${path}/`)
  );
}

export function getGroupedChampionshipNavItems() {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: championshipNavItems.filter((item) => item.group === group),
  })).filter((g) => g.items.length > 0);
}
