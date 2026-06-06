import type { ChampionshipRole } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { ulid } from 'ulidx';
import { env } from '@/config/env';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import type { ChampionshipRepository } from '@/repositories/championship-repository';
import { MANAGE_CHAMPIONSHIP_ROLES } from '@/repositories/championship-repository';
import type { InvitationRepository } from '@/repositories/invitation-repository';
import type { UserRepository } from '@/repositories/user-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';
import type { EmailService } from '@/services/email/email-service';

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
    private readonly championshipRepository: ChampionshipRepository,
    private readonly championshipMemberRepository: ChampionshipMemberRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService
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

    const championship = await this.championshipRepository.findById(request.championshipId);

    if (!championship) {
      throw errorMessage.championshipNotFound;
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

    const inviteUrl = `${env.APP_URL}/invitations/accept?token=${invitation.token}`;

    await this.emailService.sendInvitationEmail({
      to: request.email,
      championshipName: championship.name,
      role: request.role,
      inviteUrl,
      expiresAt,
    });

    return {
      invitation: {
        ...invitation,
        inviteUrl,
      },
    };
  }
}
