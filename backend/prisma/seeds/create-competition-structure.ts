import type { Championship } from '@prisma/client';
import { ulid } from 'ulidx';
import { prisma } from './prisma';

const IDS = {
  stage_group: '01SEED00000000000000000050',
  stage_knockout: '01SEED00000000000000000051',

  group_a: '01SEED00000000000000000060',
  group_b: '01SEED00000000000000000061',

  round_group_1: '01SEED00000000000000000070',
  round_group_2: '01SEED00000000000000000071',
  round_group_3: '01SEED00000000000000000072',

  round_sf: '01SEED00000000000000000080',
  round_final: '01SEED00000000000000000081',

  match_g1: '01SEED00000000000000000090',
  match_g2: '01SEED00000000000000000091',
  match_g3: '01SEED00000000000000000092',
  match_g4: '01SEED00000000000000000093',

  match_sf1: '01SEED000000000000000000A0',
  match_sf2: '01SEED000000000000000000A1',
  match_final: '01SEED000000000000000000A2',
};

const TEAM_IDS = {
  fla: '01SEED00000000000000000020',
  pal: '01SEED00000000000000000021',
  cor: '01SEED00000000000000000022',
  sao: '01SEED00000000000000000023',
};

export async function createCompetitionStructure(championship: Championship) {
  // Delete previous structure (idempotent)
  await prisma.stage.deleteMany({ where: { championshipId: championship.id } });

  // ── GROUP STAGE ───────────────────────────────────────────────────────────────
  await prisma.stage.create({
    data: {
      id: IDS.stage_group,
      championshipId: championship.id,
      name: 'Fase de Grupos',
      type: 'GROUP_STAGE',
      format: 'ROUND_ROBIN',
      displayOrder: 1,
      teamsToAdvance: 1,
    },
  });

  await prisma.group.createMany({
    data: [
      { id: IDS.group_a, stageId: IDS.stage_group, name: 'Grupo A', displayOrder: 1 },
      { id: IDS.group_b, stageId: IDS.stage_group, name: 'Grupo B', displayOrder: 2 },
    ],
  });

  // Round uses `number` (int), name is optional label
  await prisma.round.createMany({
    data: [
      { id: IDS.round_group_1, stageId: IDS.stage_group, number: 1, name: 'Rodada 1' },
      { id: IDS.round_group_2, stageId: IDS.stage_group, number: 2, name: 'Rodada 2' },
      { id: IDS.round_group_3, stageId: IDS.stage_group, number: 3, name: 'Rodada 3' },
    ],
  });

  // Group A matches (FLA vs PAL, FLA vs COR, PAL vs COR)
  await prisma.match.createMany({
    data: [
      {
        id: IDS.match_g1,
        championshipId: championship.id,
        roundId: IDS.round_group_1,
        groupId: IDS.group_a,
        homeTeamId: TEAM_IDS.fla,
        awayTeamId: TEAM_IDS.pal,
        status: 'FINISHED',
        scheduledAt: new Date('2026-06-07T14:00:00Z'),
      },
      {
        id: IDS.match_g2,
        championshipId: championship.id,
        roundId: IDS.round_group_2,
        groupId: IDS.group_a,
        homeTeamId: TEAM_IDS.fla,
        awayTeamId: TEAM_IDS.cor,
        status: 'FINISHED',
        scheduledAt: new Date('2026-06-08T14:00:00Z'),
      },
      {
        id: IDS.match_g3,
        championshipId: championship.id,
        roundId: IDS.round_group_3,
        groupId: IDS.group_a,
        homeTeamId: TEAM_IDS.pal,
        awayTeamId: TEAM_IDS.cor,
        status: 'FINISHED',
        scheduledAt: new Date('2026-06-09T14:00:00Z'),
      },
      // Group B – demonstrates pending match structure
      {
        id: IDS.match_g4,
        championshipId: championship.id,
        roundId: IDS.round_group_1,
        groupId: IDS.group_b,
        homeTeamId: TEAM_IDS.sao,
        awayTeamId: TEAM_IDS.cor,
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-06-14T14:00:00Z'),
      },
    ],
  });

  // Results (homePenaltyScore/awayPenaltyScore are null for regular-time finishes)
  await prisma.matchResult.createMany({
    data: [
      { id: ulid(), matchId: IDS.match_g1, homeScore: 3, awayScore: 1 },
      { id: ulid(), matchId: IDS.match_g2, homeScore: 2, awayScore: 0 },
      { id: ulid(), matchId: IDS.match_g3, homeScore: 1, awayScore: 2 },
    ],
  });

  // Standings for Group A
  // FLA: W2 D0 L0  Pts=6  GF=5 GC=1  GD=+4
  // PAL: W1 D0 L1  Pts=3  GF=3 GC=4  GD=-1  (won Rodada 3 vs COR 2-1, lost to FLA 1-3)
  // COR: W0 D0 L2  Pts=0  GF=1 GC=5  GD=-4  (lost both)
  await prisma.standing.createMany({
    data: [
      {
        id: ulid(),
        championshipId: championship.id,
        stageId: IDS.stage_group,
        groupId: IDS.group_a,
        teamId: TEAM_IDS.fla,
        position: 1,
        points: 6,
        wins: 2,
        draws: 0,
        losses: 0,
        goalsScored: 5,
        goalsConceded: 1,
        goalDifference: 4,
      },
      {
        id: ulid(),
        championshipId: championship.id,
        stageId: IDS.stage_group,
        groupId: IDS.group_a,
        teamId: TEAM_IDS.pal,
        position: 2,
        points: 3,
        wins: 1,
        draws: 0,
        losses: 1,
        goalsScored: 3,
        goalsConceded: 4,
        goalDifference: -1,
      },
      {
        id: ulid(),
        championshipId: championship.id,
        stageId: IDS.stage_group,
        groupId: IDS.group_a,
        teamId: TEAM_IDS.cor,
        position: 3,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 2,
        goalsScored: 1,
        goalsConceded: 5,
        goalDifference: -4,
      },
    ],
  });

  // ── KNOCKOUT STAGE ────────────────────────────────────────────────────────────
  await prisma.stage.create({
    data: {
      id: IDS.stage_knockout,
      championshipId: championship.id,
      name: 'Mata-Mata',
      type: 'KNOCKOUT',
      displayOrder: 2,
    },
  });

  await prisma.round.createMany({
    data: [
      { id: IDS.round_sf, stageId: IDS.stage_knockout, number: 1, name: 'Semifinais' },
      { id: IDS.round_final, stageId: IDS.stage_knockout, number: 2, name: 'Final' },
    ],
  });

  // Knockout bracket – FLA already advanced from Group A
  await prisma.match.createMany({
    data: [
      {
        id: IDS.match_sf1,
        championshipId: championship.id,
        roundId: IDS.round_sf,
        homeTeamId: TEAM_IDS.fla,
        awayTeamId: null,
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-07-05T14:00:00Z'),
      },
      {
        id: IDS.match_sf2,
        championshipId: championship.id,
        roundId: IDS.round_sf,
        homeTeamId: null,
        awayTeamId: null,
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-07-05T17:00:00Z'),
      },
      {
        id: IDS.match_final,
        championshipId: championship.id,
        roundId: IDS.round_final,
        homeTeamId: null,
        awayTeamId: null,
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-08-09T16:00:00Z'),
      },
    ],
  });

  // MatchBracketLinks: SF winners advance to Final slots
  await prisma.matchBracketLink.createMany({
    data: [
      {
        id: ulid(),
        fromMatchId: IDS.match_sf1,
        toMatchId: IDS.match_final,
        outcome: 'WINNER',
        toSlot: 'HOME',
      },
      {
        id: ulid(),
        fromMatchId: IDS.match_sf2,
        toMatchId: IDS.match_final,
        outcome: 'WINNER',
        toSlot: 'AWAY',
      },
    ],
  });

  console.log('  Competition structure seeded (group stage + knockout bracket)');
}
