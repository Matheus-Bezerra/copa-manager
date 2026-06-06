ALTER TYPE "InvitationStatus" RENAME TO "InvitationStatus_old";

CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

ALTER TABLE "invitations"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "InvitationStatus" USING ("status"::text::"InvitationStatus");

ALTER TABLE "invitations"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "InvitationStatus_old";
