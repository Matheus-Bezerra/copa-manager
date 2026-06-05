import bcrypt from 'bcryptjs';
import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import type { RefreshTokenRepository } from '@/repositories/refresh-token-repository';
import { toPublicUser, type UserRepository } from '@/repositories/user-repository';
import { type AuthResponse, createSessionTokens } from './create-session-tokens';

export interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(request: RegisterUseCaseRequest): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(request.email);

    if (existingUser) {
      throw errorMessage.emailAlreadyInUse;
    }

    const passwordHash = await bcrypt.hash(request.password, 10);

    const user = await this.userRepository.create({
      id: ulid(),
      name: request.name,
      email: request.email,
      passwordHash,
    });

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
