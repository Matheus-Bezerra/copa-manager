import type { User } from '../user/get-profile';

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
