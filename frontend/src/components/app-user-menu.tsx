import { Link, useNavigate } from '@tanstack/react-router';
import { KeyRoundIcon, LogOutIcon, UserIcon } from 'lucide-react';

import { SupportContactLink } from '@/components/support-contact-link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout as logoutRequest } from '@/http/hooks/auth/use-logout';
import type { User } from '@/http/types/user/get-profile';
import { queryClient } from '@/lib/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

type AppUserMenuProps = {
  user: User;
  variant?: 'header' | 'sidebar';
  onNavigate?: () => void;
};

export function AppUserMenu({ user, variant = 'header', onNavigate }: AppUserMenuProps) {
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuthStore();

  function completeLogout() {
    logout();
    queryClient.clear();
    void navigate({ to: '/sign-in', replace: true });
  }

  function handleLogout() {
    onNavigate?.();

    const token = refreshToken;
    completeLogout();

    if (token) {
      void logoutRequest({ refreshToken: token }).catch(() => undefined);
    }
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        <div className="px-3 py-1">
          <p className="truncate text-xs font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <SupportContactLink variant="sidebar" />
        <Button variant="ghost" size="sm" asChild className="w-full justify-start gap-3">
          <Link to="/account" onClick={onNavigate}>
            <KeyRoundIcon className="size-4" />
            Minha conta
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <LogOutIcon className="size-4" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="max-w-40 gap-2 px-2 text-foreground"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-sm font-medium">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SupportContactLink variant="menu-item" />
        <DropdownMenuItem asChild>
          <Link to="/account" className={cn('cursor-pointer')} onClick={onNavigate}>
            <UserIcon className="size-4" />
            Minha conta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account" className={cn('cursor-pointer')} onClick={onNavigate}>
            <KeyRoundIcon className="size-4" />
            Alterar senha
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOutIcon className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
