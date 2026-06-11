export type TieBreakerRule = {
  id?: string;
  position: number;
  criterion: string;
};

export type FetchTieBreakerRulesResponse = {
  rules: TieBreakerRule[];
};

export type UpdateTieBreakerRulesBody = {
  rules: Array<{ position: number; criterion: string }>;
};

export type UpdateTieBreakerRulesResponse = {
  rules: TieBreakerRule[];
};
