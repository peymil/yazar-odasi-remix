/*
  Warnings:

  - You are about to drop the column `links` on the `competition_delivery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "competition_delivery" RENAME COLUMN "links" TO "docs";
