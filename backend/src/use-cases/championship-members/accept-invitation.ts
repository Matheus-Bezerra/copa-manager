import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import type { InvitationRepository } from '@/repositories/invitation-repository';
import { toPublicUser, type UserRepository } from '@/repositories/user-repository';

export interface AcceptInvitationUseCaseRequest {
  userId: string;
  token: string;
}

export class AcceptInvitationUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly championshipMemberRepository: ChampionshipMemberRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: AcceptInvitationUseCaseRequest) {
    const invitation = await this.invitationRepository.findByToken(request.token);

    if (!invitation) {
      throw errorMessage.championshipInvitationNotFound;
    }

    if (invitation.status !== 'PENDING') {
      throw errorMessage.championshipInvitationInvalid;
    }

    if (invitation.expiresAt <= new Date()) {
      await this.invitationRepository.markAsExpired(invitation.id);
      throw errorMessage.championshipInvitationExpired;
    }

    const user = await this.userRepository.findById(request.userId);

    if (!user) {
      throw errorMessage.userNotFound;
    }

    if (user.email !== invitation.email) {
      throw errorMessage.championshipInvitationEmailMismatch;
    }

    const existingMember = await this.championshipMemberRepository.findByChampionshipAndUser(
      invitation.championshipId,
      request.userId
    );

    if (existingMember) {
      throw errorMessage.championshipMemberAlreadyExists;
    }

    const member = await this.championshipMemberRepository.create({
      id: ulid(),
      championshipId: invitation.championshipId,
      userId: request.userId,
      role: invitation.role,
    });

    await this.invitationRepository.acceptInvitation(invitation.id);

    return {
      member: {
        ...member,
        user: toPublicUser(user),
      },
    };
  }
}
