/*
  Warnings:

  - The primary key for the `genre_translation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `genre_translation` table. All the data in the column will be lost.
  - The primary key for the `tag_translation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tag_translation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "genre_translation_genre_id_language_key";

-- DropIndex
DROP INDEX "tag_translation_tag_id_language_key";

-- AlterTable
ALTER TABLE "genre_translation" DROP CONSTRAINT "genre_translation_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "genre_translation_pkey" PRIMARY KEY ("genre_id", "language");

-- AlterTable
ALTER TABLE "tag_translation" DROP CONSTRAINT "tag_translation_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tag_translation_pkey" PRIMARY KEY ("tag_id", "language");
