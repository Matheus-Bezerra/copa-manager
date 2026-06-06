import { errorMessage } from '@/constants/error-message';
import { toPublicUser, type PublicUser, type UserRepository } from '@/repositories/user-repository';

export interface GetCurrentUserUseCaseRequest {
  userId: string;
}

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetCurrentUserUseCaseRequest): Promise<PublicUser> {
    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw errorMessage.userNotFound;
    }

    if (user.status === 'BLOCKED') {
      throw errorMessage.userBlocked;
    }

    return toPublicUser(user);
  }
}
