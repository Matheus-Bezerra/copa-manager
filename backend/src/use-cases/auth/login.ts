import bcrypt from 'bcryptjs';
import { errorMessage } from '@/constants/error-message';
import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import { toPublicUser, type UserRepository } from '@/repositories/user-repository';
import { type AuthResponse, createSessionTokens } from './create-session-tokens';

export interface LoginUseCaseRequest {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(request: LoginUseCaseRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user || !user.passwordHash) {
      throw errorMessage.invalidCredentials;
    }

    const passwordMatches = await bcrypt.compare(request.password, user.passwordHash);

    if (!passwordMatches) {
      throw errorMessage.invalidCredentials;
    }

    if (user.status === 'BLOCKED') {
      throw errorMessage.userBlocked;
    }

    const { accessToken, refreshToken } = await createSessionTokens(
      user.id,
      this.refreshTokenRepository
    );

    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    };
  }
}
