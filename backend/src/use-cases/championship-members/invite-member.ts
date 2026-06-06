import type { ChampionshipRole } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import { MANAGE_CHAMPIONSHIP_ROLES } from '@/repositories/championship-repository';
import type { InvitationRepository } from '@/repositories/invitation-repository';
import type { UserRepository } from '@/repositories/user-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

const INVITATION_EXPIRATION_DAYS = 7;

export interface InviteMemberUseCaseRequest {
  userId: string;
  championshipId: string;
  email: string;
  role: ChampionshipRole;
}

export class InviteMemberUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipMemberRepository: ChampionshipMemberRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: InviteMemberUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_CHAMPIONSHIP_ROLES
    );

    if (request.role === 'OWNER') {
      throw errorMessage.championshipForbidden;
    }

    const existingUser = await this.userRepository.findByEmail(request.email);

    if (existingUser) {
      const existingMember = await this.championshipMemberRepository.findByChampionshipAndUser(
        request.championshipId,
        existingUser.id
      );

      if (existingMember) {
        throw errorMessage.championshipMemberAlreadyExists;
      }
    }

    const pendingInvitation = await this.invitationRepository.findPendingByChampionshipAndEmail(
      request.championshipId,
      request.email
    );

    if (pendingInvitation) {
      throw errorMessage.championshipInvitationAlreadyPending;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

    const invitation = await this.invitationRepository.create({
      id: ulid(),
      championshipId: request.championshipId,
      email: request.email,
      role: request.role,
      token: randomBytes(32).toString('hex'),
      expiresAt,
    });

    return { invitation };
  }
}
