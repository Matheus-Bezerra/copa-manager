export type ChampionshipRules = {
  winPoints: number;
  drawPoints: number;
  penaltyBonusPoints: number;
  yellowCardsForSuspension: number;
  redCardSuspensionGames: number;
  matchDuration: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type GetChampionshipRulesResponse = {
  rules: ChampionshipRules;
};

export type UpdateChampionshipRulesBody = {
  winPoints?: number;
  drawPoints?: number;
  penaltyBonusPoints?: number;
  yellowCardsForSuspension?: number;
  redCardSuspensionGames?: number;
  matchDuration?: number;
};

export type UpdateChampionshipRulesResponse = {
  rules: ChampionshipRules;
};
