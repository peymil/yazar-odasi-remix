/*
  Warnings:

  - You are about to drop the column `name` on the `genre_translation` table. All the data in the column will be lost.
  - You are about to drop the column `genre_name` on the `project_genre` table. All the data in the column will be lost.
  - You are about to drop the column `tag_name` on the `project_tag` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tag_translation` table. All the data in the column will be lost.
  - Added the required column `genre_name` to the `genre_translation` table without a default value. This is not possible if the table is not empty.
  - Made the column `slug` on table `project_genre` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `project_tag` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tag_name` to the `tag_translation` table without a default value. This is not possible if the table is not empty.

*/

-- DropIndex
DROP INDEX "project_genre_genre_name_key";

-- DropIndex
DROP INDEX "project_tag_tag_name_key";

-- AlterTable
ALTER TABLE "genre_translation" DROP COLUMN "name",
ADD COLUMN     "genre_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_genre" DROP COLUMN "genre_name",
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "project_tag" DROP COLUMN "tag_name",
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "tag_translation" DROP COLUMN "name",
ADD COLUMN     "tag_name" TEXT NOT NULL;

