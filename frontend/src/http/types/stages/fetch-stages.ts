import type { Stage } from './stage';

// GET /championships/:id/stages — { data: Stage[] }
// client.data returns Stage[] directly
export type FetchStagesResponse = Stage[];
