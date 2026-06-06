import type { FastifyInstance } from 'fastify';
import { inviteMemberController } from '@/http/controllers/championship-members/invite-member.controller';
import { listMembersController } from '@/http/controllers/championship-members/list-members.controller';
import { removeMemberController } from '@/http/controllers/championship-members/remove-member.controller';
import { updateMemberRoleController } from '@/http/controllers/championship-members/update-member-role.controller';
import { auth } from '@/http/middlewares/auth.middleware';
import { inviteMemberSchema } from '@/http/schemas/championship-members/invite-member.schema';
import { listMembersSchema } from '@/http/schemas/championship-members/list-members.schema';
import { removeMemberSchema } from '@/http/schemas/championship-members/remove-member.schema';
import { updateMemberRoleSchema } from '@/http/schemas/championship-members/update-member-role.schema';

export async function championshipMemberRoutes(app: FastifyInstance) {
  await app.register(auth);

  app.post(
    '/championships/:championshipId/members/invite',
    { schema: inviteMemberSchema },
    inviteMemberController
  );
  app.get(
    '/championships/:championshipId/members',
    { schema: listMembersSchema },
    listMembersController
  );
  app.patch(
    '/championships/:championshipId/members/:memberId',
    { schema: updateMemberRoleSchema },
    updateMemberRoleController
  );
  app.delete(
    '/championships/:championshipId/members/:memberId',
    { schema: removeMemberSchema },
    removeMemberController
  );
}
