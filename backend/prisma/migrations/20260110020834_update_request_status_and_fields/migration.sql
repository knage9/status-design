/*
  Warnings:

  - Converting old RequestStatus values to new ones:
    NEW -> NOVA
    IN_PROGRESS -> OTKLONENO (or NOVA if needed)
    CLOSED -> OTKLONENO
    COMPLETED -> ZAVERSHENA
  - Renaming column `arrivalAt` to `arrivalDate`
  - Adding column `managerComment`

*/

-- Step 1: Create new enum type first
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('NOVA', 'SDELKA', 'OTKLONENO', 'ZAVERSHENA');

-- Step 2: Add temporary column with new enum type
ALTER TABLE "Request" ADD COLUMN "status_new" "RequestStatus_new";

-- Step 3: Convert old enum values to new ones
UPDATE "Request" SET "status_new" = 
  CASE "status"::text
    WHEN 'NEW' THEN 'NOVA'::"RequestStatus_new"
    WHEN 'IN_PROGRESS' THEN 'OTKLONENO'::"RequestStatus_new"
    WHEN 'CLOSED' THEN 'OTKLONENO'::"RequestStatus_new"
    WHEN 'COMPLETED' THEN 'ZAVERSHENA'::"RequestStatus_new"
    WHEN 'SDELKA' THEN 'SDELKA'::"RequestStatus_new"
    ELSE 'NOVA'::"RequestStatus_new"
  END;

-- Step 4: Drop old column, rename new column, and set default
ALTER TABLE "Request" DROP COLUMN "status";
ALTER TABLE "Request" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'NOVA';

-- Step 5: Replace old enum with new one
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";

COMMIT;

-- Step 6: Rename column arrivalAt to arrivalDate (preserving data)
-- Check if column exists first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Request' AND column_name = 'arrivalAt'
    ) THEN
        ALTER TABLE "Request" RENAME COLUMN "arrivalAt" TO "arrivalDate";
    END IF;
END $$;

-- Step 7: Add new column managerComment (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Request' AND column_name = 'managerComment'
    ) THEN
        ALTER TABLE "Request" ADD COLUMN "managerComment" TEXT;
    END IF;
END $$;
