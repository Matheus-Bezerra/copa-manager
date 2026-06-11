export type StageType = 'GROUP_STAGE' | 'KNOCKOUT';
export type StageFormat = 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN';

export type Group = {
  id: string;
  stageId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
};

export type Round = {
  id: string;
  stageId: string;
  number: number;
  name: string | null;
  createdAt: string;
};

export type Stage = {
  id: string;
  championshipId: string;
  name: string;
  type: StageType;
  format: StageFormat | null;
  teamsToAdvance: number;
  qualifiedTeams: number | null;
  thirdPlaceMatch: boolean;
  displayOrder: number;
  createdAt: string;
};

export type StageWithStructure = Stage & {
  groups: Group[];
  rounds: Round[];
};
