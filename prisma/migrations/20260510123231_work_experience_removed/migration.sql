/*
  Warnings:

  - You are about to drop the `user_profile_experience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile_work` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile_work_character` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_projectgenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_projecttag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_profile_experience" DROP CONSTRAINT "user_profile_experience_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "user_profile_work" DROP CONSTRAINT "user_profile_work_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "user_profile_work_character" DROP CONSTRAINT "user_profile_work_character_work_id_fkey";

-- DropForeignKey
ALTER TABLE "work_projectgenre" DROP CONSTRAINT "work_projectgenre_project_genre_id_fkey";

-- DropForeignKey
ALTER TABLE "work_projectgenre" DROP CONSTRAINT "work_projectgenre_work_id_fkey";

-- DropForeignKey
ALTER TABLE "work_projecttag" DROP CONSTRAINT "work_projecttag_project_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "work_projecttag" DROP CONSTRAINT "work_projecttag_work_id_fkey";

-- DropTable
DROP TABLE "user_profile_experience";

-- DropTable
DROP TABLE "user_profile_work";

-- DropTable
DROP TABLE "user_profile_work_character";

-- DropTable
DROP TABLE "work_projectgenre";

-- DropTable
DROP TABLE "work_projecttag";
