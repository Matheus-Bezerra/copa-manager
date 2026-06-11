import { createFileRoute, getRouteApi } from '@tanstack/react-router';

import { useGetChampionship } from '@/http/hooks/championships/use-get-championship';

import { OverviewFinished } from './-components/overview-finished';
import { OverviewLive } from './-components/overview-live';
import { OverviewSetup } from './-components/overview-setup';

const championshipLayoutRouteApi = getRouteApi('/_app/championships/$championshipId');

export const Route = createFileRoute('/_app/championships/$championshipId/')({
  component: ChampionshipOverviewPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Campeonato' }],
  }),
});

function ChampionshipOverviewPage() {
  const { championshipId } = Route.useParams();
  const loaderData = championshipLayoutRouteApi.useLoaderData();
  const { data } = useGetChampionship(championshipId, { initialData: loaderData });

  const championship = data?.championship ?? loaderData.championship;

  if (championship.status === 'IN_PROGRESS') {
    return <OverviewLive championship={championship} />;
  }

  if (championship.status === 'FINISHED') {
    return <OverviewFinished championship={championship} />;
  }

  return <OverviewSetup championship={championship} />;
}
