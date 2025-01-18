/*
  Warnings:

  - Added the required column `company_id` to the `company_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company_user" ADD COLUMN     "company_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "company_user" ADD CONSTRAINT "company_user_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
