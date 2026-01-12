/*
  Warnings:

  - You are about to drop the column `name` on the `user_profile_project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "email_verification" DROP CONSTRAINT "email_verification_userId_fkey";

-- DropIndex
DROP INDEX "email_verification_token_idx";

-- DropIndex
DROP INDEX "email_verification_userId_idx";

-- AlterTable
ALTER TABLE "email_verification" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user_profile_project" DROP COLUMN "name";

-- AddForeignKey
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
