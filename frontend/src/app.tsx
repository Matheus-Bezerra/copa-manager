import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/react-query';
import { routeTree } from '@/route-tree.gen';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthContext } from '@/pages/__root';

const router = createRouter({
  routeTree,
  context: {
    auth: undefined as unknown as AuthContext,
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const auth = useAuthStore();

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} context={{ auth, queryClient }} />
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
