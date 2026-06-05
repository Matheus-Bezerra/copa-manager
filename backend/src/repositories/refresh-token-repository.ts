export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  lastUsedAt: Date | null;
  createdAt: Date;
}

export interface RefreshTokenWithUser extends RefreshToken {
  user: {
    id: string;
    status: 'ACTIVE' | 'BLOCKED';
  };
}

export interface CreateRefreshTokenInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRepository {
  create(data: CreateRefreshTokenInput): Promise<RefreshToken>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenWithUser | null>;
  delete(id: string): Promise<void>;
}
