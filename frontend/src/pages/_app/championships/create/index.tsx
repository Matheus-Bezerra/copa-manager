import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CreateChampionshipForm } from '../../-components/create-championship-form';

export const Route = createFileRoute('/_app/championships/create/')({
  component: CreateChampionshipPage,
  head: () => ({
    meta: [{ title: 'Copa Manager - Novo campeonato' }],
  }),
});

function CreateChampionshipPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link to="/">
            <ArrowLeftIcon className="size-4" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Novo campeonato</h1>
          <p className="text-muted-foreground text-sm">
            Preencha os dados para criar um novo campeonato.
          </p>
        </div>
      </div>
      <CreateChampionshipForm />
    </div>
  );
}
