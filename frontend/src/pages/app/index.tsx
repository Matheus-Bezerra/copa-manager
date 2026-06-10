import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Dashboard' }],
  }),
});

function DashboardPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Painel em construção.</p>
    </div>
  );
}
