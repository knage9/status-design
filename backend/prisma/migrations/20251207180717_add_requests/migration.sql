-- CreateEnum
CREATE TYPE "RequestSource" AS ENUM ('POPUP', 'CONTACTS_PAGE', 'DISCOUNT_POPUP');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "mainService" TEXT,
    "additionalServices" TEXT[],
    "discount" INTEGER NOT NULL DEFAULT 0,
    "source" "RequestSource" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);
