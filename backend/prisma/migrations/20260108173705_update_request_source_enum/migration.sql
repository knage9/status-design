/*
  Warnings:

  - The values [POPUP,CONTACTS_PAGE,DISCOUNT_POPUP] on the enum `RequestSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestSource_new" AS ENUM ('WEBSITE', 'PHONE', 'SOCIAL', 'OTHER');
ALTER TABLE "Request" ALTER COLUMN "source" TYPE "RequestSource_new" USING ("source"::text::"RequestSource_new");
ALTER TYPE "RequestSource" RENAME TO "RequestSource_old";
ALTER TYPE "RequestSource_new" RENAME TO "RequestSource";
DROP TYPE "RequestSource_old";
COMMIT;
