/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `project_genre` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `project_tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "project_genre" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "project_tag" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "genre_translation" (
    "id" SERIAL NOT NULL,
    "genre_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genre_translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_translation" (
    "id" SERIAL NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tag_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genre_translation_genre_id_language_key" ON "genre_translation"("genre_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "tag_translation_tag_id_language_key" ON "tag_translation"("tag_id", "language");

-- CreateIndex
CREATE UNIQUE INDEX "project_genre_slug_key" ON "project_genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_tag_slug_key" ON "project_tag"("slug");

-- AddForeignKey
ALTER TABLE "genre_translation" ADD CONSTRAINT "genre_translation_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "project_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag_translation" ADD CONSTRAINT "tag_translation_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "project_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
