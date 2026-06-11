export type AwardType = 'TOP_SCORER' | 'MATCH_MVP' | 'TOURNAMENT_MVP' | 'FAIR_PLAY';

export type Award = {
  id: string;
  championshipId: string;
  playerId: string;
  matchId: string | null;
  awardType: AwardType;
  createdAt: string;
};
