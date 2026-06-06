export const SEED_PASSWORD = '12345678';

export const SEED_USERS = {
  owner: {
    id: '01SEED00000000000000000001',
    name: 'Matheus Owner',
    email: 'owner@copamanager.test',
  },
  admin: {
    id: '01SEED00000000000000000002',
    name: 'Ana Admin',
    email: 'admin@copamanager.test',
  },
  organizer: {
    id: '01SEED00000000000000000003',
    name: 'Bruno Organizer',
    email: 'organizer@copamanager.test',
  },
} as const;

export const SEED_CHAMPIONSHIP = {
  id: '01SEED00000000000000000010',
  name: 'Copa AD Tatuapé',
  slug: 'copa-ad-tatuape',
  description: 'Campeonato amador de futebol society',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-09-16'),
  status: 'IN_PROGRESS' as const,
};

export const SEED_TEAMS = [
  {
    id: '01SEED00000000000000000020',
    name: 'Flamengo FC',
    shortName: 'FLA',
    primaryColor: '#E03A3E',
  },
  {
    id: '01SEED00000000000000000021',
    name: 'Palmeiras FC',
    shortName: 'PAL',
    primaryColor: '#006437',
  },
  {
    id: '01SEED00000000000000000022',
    name: 'Corinthians FC',
    shortName: 'COR',
    primaryColor: '#000000',
  },
  {
    id: '01SEED00000000000000000023',
    name: 'São Paulo FC',
    shortName: 'SAO',
    primaryColor: '#EC1C24',
  },
] as const;

export const SEED_PLAYERS = [
  {
    id: '01SEED00000000000000000030',
    teamId: '01SEED00000000000000000020',
    name: 'Matheus Silva',
    shirtNumber: 10,
    statistics: { matchesPlayed: 2, goals: 4, assists: 1, yellowCards: 0, redCards: 0, matchMvps: 1 },
  },
  {
    id: '01SEED00000000000000000031',
    teamId: '01SEED00000000000000000020',
    name: 'João Pedro',
    shirtNumber: 9,
    statistics: { matchesPlayed: 2, goals: 2, assists: 0, yellowCards: 1, redCards: 0, matchMvps: 0 },
  },
  {
    id: '01SEED00000000000000000032',
    teamId: '01SEED00000000000000000021',
    name: 'Lucas Oliveira',
    shirtNumber: 7,
    statistics: { matchesPlayed: 2, goals: 3, assists: 2, yellowCards: 0, redCards: 0, matchMvps: 1 },
  },
  {
    id: '01SEED00000000000000000033',
    teamId: '01SEED00000000000000000021',
    name: 'Rafael Costa',
    shirtNumber: 1,
    statistics: { matchesPlayed: 2, goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchMvps: 0 },
  },
  {
    id: '01SEED00000000000000000034',
    teamId: '01SEED00000000000000000022',
    name: 'Felipe Santos',
    shirtNumber: 11,
    statistics: { matchesPlayed: 1, goals: 1, assists: 1, yellowCards: 0, redCards: 0, matchMvps: 0 },
  },
  {
    id: '01SEED00000000000000000035',
    teamId: '01SEED00000000000000000023',
    name: 'Gabriel Lima',
    shirtNumber: 8,
    statistics: { matchesPlayed: 1, goals: 2, assists: 0, yellowCards: 1, redCards: 0, matchMvps: 0 },
  },
] as const;

export const SEED_INVITATION = {
  id: '01SEED00000000000000000040',
  email: 'convidado@copamanager.test',
  role: 'ORGANIZER' as const,
  token: 'seed-invitation-token-pending',
};
