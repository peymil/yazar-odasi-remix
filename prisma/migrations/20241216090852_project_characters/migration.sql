/*
  Warnings:

  - Added the required column `setting` to the `user_profile_project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profile_project" ADD COLUMN     "setting" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "user_profile_project_character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "user_profile_project_character_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_profile_project_character" ADD CONSTRAINT "user_profile_project_character_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "user_profile_project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
