import { errorMessage } from '@/constants/error-message';
import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import { hashRefreshToken } from '@/services/auth/token-service';
import { createSessionTokens } from './create-session-tokens';

export interface RefreshSessionUseCaseRequest {
  refreshToken: string;
}

export interface RefreshSessionUseCaseResponse {
  accessToken: string;
  refreshToken: string;
}

export class RefreshSessionUseCase {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(
    request: RefreshSessionUseCaseRequest
  ): Promise<RefreshSessionUseCaseResponse> {
    const tokenHash = hashRefreshToken(request.refreshToken);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw errorMessage.invalidRefreshToken;
    }

    if (storedToken.expiresAt <= new Date()) {
      await this.refreshTokenRepository.delete(storedToken.id);
      throw errorMessage.invalidRefreshToken;
    }

    if (storedToken.user.status === 'BLOCKED') {
      throw errorMessage.userBlocked;
    }

    await this.refreshTokenRepository.delete(storedToken.id);

    const newRefreshToken = await createSessionTokens(
      storedToken.userId,
      this.refreshTokenRepository
    );

    return {
      accessToken: newRefreshToken.accessToken,
      refreshToken: newRefreshToken.refreshToken,
    };
  }
}
