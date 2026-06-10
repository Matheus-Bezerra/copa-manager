import { createChampionships } from './create-championships';
import { createCompetitionStructure } from './create-competition-structure';
import { createInvitations } from './create-invitations';
import { createPlayers } from './create-players';
import { createTeams } from './create-teams';
import { createUsers } from './create-users';
import { SEED_CHAMPIONSHIP, SEED_PASSWORD } from './constants/seed-data';
import { prisma } from './prisma';

async function seed() {
  const users = await createUsers();
  const { championship } = await createChampionships(users);

  await createTeams(championship);
  await createPlayers();
  await createInvitations(championship);
  await createCompetitionStructure(championship);

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Default credentials (password for all):', SEED_PASSWORD);
  console.log('  Owner:      owner@copamanager.test');
  console.log('  Admin:      admin@copamanager.test');
  console.log('  Organizer:  organizer@copamanager.test');
  console.log('');
  console.log('Championship slug (public):', SEED_CHAMPIONSHIP.slug);
  console.log('  GET /api/v1/public/championships/' + SEED_CHAMPIONSHIP.slug);
  console.log('  GET /api/v1/public/championships/' + SEED_CHAMPIONSHIP.slug + '/structure');
  console.log('  GET /api/v1/public/championships/' + SEED_CHAMPIONSHIP.slug + '/matches');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
