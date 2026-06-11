import type { StageWithStructure } from './stage';

// GET /championships/:id/structure — { data: { stages: StageWithStructure[] } }
export type GetChampionshipStructureResponse = {
  stages: StageWithStructure[];
};
