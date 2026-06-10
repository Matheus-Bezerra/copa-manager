export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type GetProfileResponse = User;
