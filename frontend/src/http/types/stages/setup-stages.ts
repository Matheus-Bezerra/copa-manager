import type { StageFormat, StageType, StageWithStructure } from './stage';

export type SetupStageGroup = {
  name: string;
  teams: number;
};

export type SetupStageItem = {
  name: string;
  type: StageType;
  order: number;
  format?: StageFormat;
  teamsToAdvance?: number;
  qualifiedTeams?: number;
  thirdPlaceMatch?: boolean;
  groups?: SetupStageGroup[];
};

export type SetupStagesBody = {
  stages: SetupStageItem[];
};

export type SetupStagesResponse = {
  stages: StageWithStructure[];
};
