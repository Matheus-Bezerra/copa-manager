import { createFileRoute } from '@tanstack/react-router';
import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { useAuthStore } from '@/stores/auth-store';

import { UpdateChampionshipForm } from '../../../-components/update-championship-form';

const championshipLayoutRouteApi = getRouteApi('/_app/championships/$championshipId');

export const Route = createFileRoute('/_app/championships/$championshipId/settings/')({
  component: ChampionshipSettingsPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Configurações do campeonato' }],
  }),
});

function ChampionshipSettingsPage() {
  const navigate = useNavigate();
  const { championship } = championshipLayoutRouteApi.useLoaderData();
  const user = useAuthStore((state) => state.user);
  const isOwner = !!user && championship.ownerUserId === user.id;

  return (
    <div className="mx-auto max-w-lg">
      <UpdateChampionshipForm
        key={championship.updatedAt}
        championship={championship}
        isOwner={isOwner}
        onDeleteSuccess={() => navigate({ to: '/' })}
      />
    </div>
  );
}
