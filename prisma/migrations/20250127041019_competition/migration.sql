/*
  Warnings:

  - You are about to drop the `competition_application` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `company_id` to the `competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prize` to the `competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `competition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "competition" ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD COLUMN     "prize" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "competition_application";

-- CreateTable
CREATE TABLE "competition_delivery" (
    "id" SERIAL NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "links" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_delivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "competition" ADD CONSTRAINT "competition_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competition_delivery" ADD CONSTRAINT "competition_delivery_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competition_delivery" ADD CONSTRAINT "competition_delivery_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
