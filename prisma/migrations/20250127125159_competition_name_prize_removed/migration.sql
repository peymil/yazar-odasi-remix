/*
  Warnings:

  - You are about to drop the column `name` on the `competition` table. All the data in the column will be lost.
  - You are about to drop the column `prize` on the `competition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "competition" DROP COLUMN "name",
DROP COLUMN "prize";
