-- CreateEnum
CREATE TYPE "competition_delivery_status" AS ENUM ('PENDING', 'SUBMITTED', 'REJECTED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "competition" ADD COLUMN     "content_type" TEXT;

-- AlterTable
ALTER TABLE "competition_delivery" ADD COLUMN     "status" "competition_delivery_status" NOT NULL DEFAULT 'SUBMITTED';
