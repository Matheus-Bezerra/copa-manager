import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import { hashRefreshToken } from '@/services/auth/token-service';

export interface LogoutUseCaseRequest {
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async execute(request: LogoutUseCaseRequest): Promise<void> {
    const tokenHash = hashRefreshToken(request.refreshToken);
    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);
  }
}
