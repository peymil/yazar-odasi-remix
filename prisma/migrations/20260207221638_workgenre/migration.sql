/*
  Warnings:

  - You are about to drop the `work_genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_workgenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_worktag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "work_workgenre" DROP CONSTRAINT "work_workgenre_work_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "work_workgenre" DROP CONSTRAINT "work_workgenre_work_id_fkey";

-- DropForeignKey
ALTER TABLE "work_worktag" DROP CONSTRAINT "work_worktag_work_id_fkey";

-- DropForeignKey
ALTER TABLE "work_worktag" DROP CONSTRAINT "work_worktag_work_tag_id_fkey";

-- DropTable
DROP TABLE "work_genre";

-- DropTable
DROP TABLE "work_tag";

-- DropTable
DROP TABLE "work_workgenre";

-- DropTable
DROP TABLE "work_worktag";

-- CreateTable
CREATE TABLE "work_projectgenre" (
    "work_id" INTEGER NOT NULL,
    "project_genre_id" INTEGER NOT NULL,

    CONSTRAINT "work_projectgenre_pkey" PRIMARY KEY ("work_id","project_genre_id")
);

-- CreateTable
CREATE TABLE "work_projecttag" (
    "work_id" INTEGER NOT NULL,
    "project_tag_id" INTEGER NOT NULL,

    CONSTRAINT "work_projecttag_pkey" PRIMARY KEY ("work_id","project_tag_id")
);

-- AddForeignKey
ALTER TABLE "work_projectgenre" ADD CONSTRAINT "work_projectgenre_project_genre_id_fkey" FOREIGN KEY ("project_genre_id") REFERENCES "project_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_projectgenre" ADD CONSTRAINT "work_projectgenre_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "user_profile_work"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_projecttag" ADD CONSTRAINT "work_projecttag_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "user_profile_work"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_projecttag" ADD CONSTRAINT "work_projecttag_project_tag_id_fkey" FOREIGN KEY ("project_tag_id") REFERENCES "project_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
