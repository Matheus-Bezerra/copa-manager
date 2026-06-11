import { LayoutDashboardIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const appNav: NavItem[] = [
  { label: 'Meus Campeonatos', to: '/', icon: LayoutDashboardIcon },
  // Novos itens serão adicionados à medida que as rotas forem criadas
];
