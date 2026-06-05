import { ulid } from 'ulidx';
import type { RefreshTokenRepository } from '../../repositories/refresh-token-repository';
import type { PublicUser } from '../../repositories/user-repository';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from '../../services/auth/token-service';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export async function createSessionTokens(
  userId: string,
  refreshTokenRepository: RefreshTokenRepository
): Promise<SessionTokens> {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await refreshTokenRepository.create({
    id: ulid(),
    userId,
    tokenHash,
    expiresAt: getRefreshTokenExpiresAt(),
  });

  const accessToken = generateAccessToken(userId);

  return { accessToken, refreshToken };
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}
