export interface PasswordResetToken {
  id: string;
  userId: string;
  code: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetTokenWithUser extends PasswordResetToken {
  user: {
    id: string;
    name: string;
    email: string;
    status: 'ACTIVE' | 'BLOCKED';
  };
}

export interface CreatePasswordResetTokenInput {
  id: string;
  userId: string;
  code: string;
  expiresAt: Date;
}

export interface PasswordResetTokenRepository {
  create(data: CreatePasswordResetTokenInput): Promise<PasswordResetToken>;
  findValidByCode(code: string): Promise<PasswordResetTokenWithUser | null>;
  markAsUsed(id: string): Promise<void>;
  deleteUnusedByUserId(userId: string): Promise<void>;
}
