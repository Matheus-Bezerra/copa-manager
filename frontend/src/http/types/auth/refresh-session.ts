export type RefreshSessionBody = {
  refreshToken: string;
};

export type RefreshSessionResponse = {
  accessToken: string;
  refreshToken: string;
};
