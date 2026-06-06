import bcrypt from 'bcryptjs';
import { errorMessage } from '@/constants/error-message';
import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import type { UserRepository } from '@/repositories/user-repository';

export interface ChangePasswordUseCaseRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(request: ChangePasswordUseCaseRequest): Promise<void> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw errorMessage.userNotFound;
    }

    if (!user.passwordHash) {
      throw errorMessage.noLocalPassword;
    }

    const passwordMatches = await bcrypt.compare(request.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw errorMessage.invalidCurrentPassword;
    }

    const isSamePassword = await bcrypt.compare(request.newPassword, user.passwordHash);

    if (isSamePassword) {
      throw errorMessage.samePassword;
    }

    const passwordHash = await bcrypt.hash(request.newPassword, 10);

    await this.userRepository.updatePasswordHash(user.id, passwordHash);
    await this.refreshTokenRepository.deleteAllByUserId(user.id);
  }
}
