import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context: { auth } }) => {
    if (auth?.isAuthenticated) {
      throw redirect({ to: '/app' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Outlet />
    </div>
  );
}
