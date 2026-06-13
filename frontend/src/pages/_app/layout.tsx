import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { MenuIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppUserMenu } from '@/components/app-user-menu';
import { ChampionshipSidebarNav } from '@/components/championship-sidebar-nav';
import { SupportContactLink } from '@/components/support-contact-link';
import { SplashPage } from '@/components/splash-page';
import { getChampionshipIdFromPath } from '@/constants/championship-nav';
import { appNav } from '@/constants/nav';
import { useGetChampionship } from '@/http/hooks/championships/use-get-championship';
import { getProfileQueryOptions } from '@/http/hooks/user/use-get-profile';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/sign-in' });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(getProfileQueryOptions());
  },
  pendingComponent: SplashPage,
  component: AppLayout,
});

function scrollAppToTop() {
  const main = document.getElementById('app-main');
  const isDesktopShell = window.matchMedia('(min-width: 1024px)').matches;

  if (isDesktopShell && main) {
    main.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function AppLayout() {
  const profile = Route.useLoaderData();
  const navigate = useNavigate();
  const { user: storeUser, setUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const championshipId = getChampionshipIdFromPath(currentPath);
  const { data: championshipData, isPending: championshipPending } = useGetChampionship(championshipId);

  const user = profile ?? storeUser;

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  async function handleBrandClick() {
    setMobileOpen(false);

    if (currentPath === '/') {
      scrollAppToTop();
      return;
    }

    await navigate({ to: '/' });
    scrollAppToTop();
  }

  return (
    <div className="min-h-svh lg:app-shell lg:fixed lg:inset-0 lg:flex lg:overflow-hidden">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-sidebar border-r border-border transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <button
            type="button"
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 rounded-md text-left transition-opacity hover:opacity-80"
          >
            <img src="/static/logo.png" alt="" className="size-7" aria-hidden />
            <span className="font-semibold text-sm tracking-tight">Copa Manager</span>
          </button>
        </div>

        {/* Navegação */}
        <nav className="scrollbar-styled flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {appNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to as '/'}
                onClick={() => setMobileOpen(false)}
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

          {championshipId && (
            <>
              <div className="my-2 border-t border-border" />
              <ChampionshipSidebarNav
                championshipId={championshipId}
                championshipName={championshipData?.championship.name}
                championshipNameLoading={championshipPending}
                currentPath={currentPath}
                onNavigate={() => setMobileOpen(false)}
              />
            </>
          )}
        </nav>

        {/* Rodapé desktop: usuário + logout */}
        {user && (
          <div className="hidden shrink-0 border-t border-border p-3 lg:block">
            <AppUserMenu
              user={user}
              variant="sidebar"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        )}
      </aside>

      {/* Conteúdo principal */}
      <div className="lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:pl-0">
        {/* Header mobile */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 lg:hidden">
          <div className="flex min-w-0 items-center">
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
            <button
              type="button"
              onClick={handleBrandClick}
              className="ml-2 flex min-w-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80"
            >
              <img src="/static/logo.png" alt="" className="size-6 shrink-0" aria-hidden />
              <span className="truncate text-sm font-semibold">Copa Manager</span>
            </button>
          </div>

          {user && (
            <div className="flex items-center gap-1">
              <SupportContactLink variant="icon" />
              <AppUserMenu
                user={user}
                variant="header"
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          )}
        </header>

        <main
          id="app-main"
          className="scrollbar-styled p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 lg:app-shell-scroll lg:min-h-0 lg:flex-1 lg:basis-0 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-y-contain lg:pb-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
