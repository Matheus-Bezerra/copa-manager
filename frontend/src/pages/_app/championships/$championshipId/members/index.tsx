import { createFileRoute, getRouteApi } from '@tanstack/react-router';

import { ChampionshipMembersView } from '../../../-components/championship-members-view';

const championshipLayoutRouteApi = getRouteApi('/_app/championships/$championshipId');

export const Route = createFileRoute('/_app/championships/$championshipId/members/')({
  component: ChampionshipMembersPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Membros do campeonato' }],
  }),
});

function ChampionshipMembersPage() {
  const { championshipId } = Route.useParams();
  const { championship } = championshipLayoutRouteApi.useLoaderData();

  return (
    <ChampionshipMembersView
      championshipId={championshipId}
      ownerUserId={championship.ownerUserId}
    />
  );
}
