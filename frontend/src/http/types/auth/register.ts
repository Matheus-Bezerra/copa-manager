import type { User } from '../user/get-profile';

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
