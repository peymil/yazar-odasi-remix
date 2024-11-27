/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "company_user" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "post_like" DROP CONSTRAINT "fk_user_id";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "fk_user_id";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- RenameForeignKey
ALTER TABLE "company_profile" RENAME CONSTRAINT "fk_company_id" TO "company_profile_company_id_fkey";

-- RenameForeignKey
ALTER TABLE "post" RENAME CONSTRAINT "fk_company_id" TO "post_company_id_fkey";

-- RenameForeignKey
ALTER TABLE "post_like" RENAME CONSTRAINT "fk_post_id" TO "post_like_post_id_fkey";

-- RenameForeignKey
ALTER TABLE "project_projectgenre" RENAME CONSTRAINT "fk_genre_id" TO "project_projectgenre_project_genre_id_fkey";

-- RenameForeignKey
ALTER TABLE "project_projectgenre" RENAME CONSTRAINT "fk_project_id" TO "project_projectgenre_project_id_fkey";

-- RenameForeignKey
ALTER TABLE "project_projecttag" RENAME CONSTRAINT "fk_project_id" TO "project_projecttag_project_id_fkey";

-- RenameForeignKey
ALTER TABLE "project_projecttag" RENAME CONSTRAINT "fk_tag_id" TO "project_projecttag_project_tag_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_profile_experience" RENAME CONSTRAINT "fk_profile_id" TO "user_profile_experience_profile_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_profile_project" RENAME CONSTRAINT "fk_profile_id" TO "user_profile_project_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "company_user" ADD CONSTRAINT "company_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_like" ADD CONSTRAINT "post_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ik_companies_email" RENAME TO "company_email_key";
