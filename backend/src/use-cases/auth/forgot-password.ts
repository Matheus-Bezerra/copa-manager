import { ulid } from 'ulidx';
import type { PasswordResetTokenRepository } from '@/repositories/password-reset-token-repository';
import type { UserRepository } from '@/repositories/user-repository';
import type { EmailService } from '@/services/email/email-service';
import {
  generatePasswordResetCode,
  getPasswordResetExpiresAt,
} from '@/services/auth/token-service';

export interface ForgotPasswordUseCaseRequest {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(request: ForgotPasswordUseCaseRequest): Promise<void> {
    const user = await this.userRepository.findByEmail(request.email);

    if (!user || !user.passwordHash) {
      return;
    }

    await this.passwordResetTokenRepository.deleteUnusedByUserId(user.id);

    const code = generatePasswordResetCode();

    await this.passwordResetTokenRepository.create({
      id: ulid(),
      userId: user.id,
      code,
      expiresAt: getPasswordResetExpiresAt(),
    });

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      code,
    });
  }
}
