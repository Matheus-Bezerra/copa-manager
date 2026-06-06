import bcrypt from 'bcryptjs';
import { errorMessage } from '@/constants/error-message';
import type { PasswordResetTokenRepository } from '@/repositories/password-reset-token-repository';
import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import type { UserRepository } from '@/repositories/user-repository';

export interface ResetPasswordUseCaseRequest {
  code: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(request: ResetPasswordUseCaseRequest): Promise<void> {
    const resetToken = await this.passwordResetTokenRepository.findValidByCode(request.code);

    if (!resetToken) {
      throw errorMessage.invalidResetCode;
    }

    if (resetToken.user.status === 'BLOCKED') {
      throw errorMessage.userBlocked;
    }

    const user = await this.userRepository.findById(resetToken.userId);

    if (!user) {
      throw errorMessage.userNotFound;
    }

    if (user.passwordHash) {
      const isSamePassword = await bcrypt.compare(request.newPassword, user.passwordHash);

      if (isSamePassword) {
        throw errorMessage.samePassword;
      }
    }

    const passwordHash = await bcrypt.hash(request.newPassword, 10);

    await this.userRepository.updatePasswordHash(resetToken.userId, passwordHash);
    await this.passwordResetTokenRepository.markAsUsed(resetToken.id);
    await this.refreshTokenRepository.deleteAllByUserId(resetToken.userId);
  }
}
