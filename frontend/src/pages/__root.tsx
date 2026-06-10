import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router';

import type { AuthState } from '@/stores/auth-store';

export type AuthContext = AuthState;

export type RouteContext = {
  auth: AuthContext;
  queryClient: QueryClient;
  breadcrumb?: string;
};

export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
