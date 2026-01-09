-- AlterEnum
ALTER TYPE "RequestSource" ADD VALUE 'WEBSITE';

-- AlterEnum
ALTER TYPE "ServiceType" ADD VALUE 'SOUNDPROOFING';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkType" ADD VALUE 'SERVICE_SOUNDPROOFING';
ALTER TYPE "WorkType" ADD VALUE 'SERVICE_BONUS';
ALTER TYPE "WorkType" ADD VALUE 'SERVICE_WHEEL_PAINTING_MOUNTING';
ALTER TYPE "WorkType" ADD VALUE 'SERVICE_WHEEL_PAINTING_CAPS';
