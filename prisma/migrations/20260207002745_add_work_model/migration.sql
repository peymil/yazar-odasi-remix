-- CreateTable
CREATE TABLE "work_genre" (
    "id" SERIAL NOT NULL,
    "genre_name" TEXT NOT NULL,

    CONSTRAINT "work_genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_workgenre" (
    "work_id" INTEGER NOT NULL,
    "work_genre_id" INTEGER NOT NULL,

    CONSTRAINT "work_workgenre_pkey" PRIMARY KEY ("work_id","work_genre_id")
);

-- CreateTable
CREATE TABLE "work_worktag" (
    "work_id" INTEGER NOT NULL,
    "work_tag_id" INTEGER NOT NULL,

    CONSTRAINT "work_worktag_pkey" PRIMARY KEY ("work_id","work_tag_id")
);

-- CreateTable
CREATE TABLE "work_tag" (
    "id" SERIAL NOT NULL,
    "tag_name" TEXT NOT NULL,

    CONSTRAINT "work_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_work" (
    "id" SERIAL NOT NULL,
    "plot_title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "logline" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "similar_works" TEXT NOT NULL,
    "setting" TEXT NOT NULL,
    "profile_id" INTEGER,

    CONSTRAINT "user_profile_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_work_character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "work_id" INTEGER NOT NULL,

    CONSTRAINT "user_profile_work_character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_genre_genre_name_key" ON "work_genre"("genre_name");

-- CreateIndex
CREATE UNIQUE INDEX "work_tag_tag_name_key" ON "work_tag"("tag_name");

-- AddForeignKey
ALTER TABLE "work_workgenre" ADD CONSTRAINT "work_workgenre_work_genre_id_fkey" FOREIGN KEY ("work_genre_id") REFERENCES "work_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_workgenre" ADD CONSTRAINT "work_workgenre_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "user_profile_work"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_worktag" ADD CONSTRAINT "work_worktag_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "user_profile_work"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work_worktag" ADD CONSTRAINT "work_worktag_work_tag_id_fkey" FOREIGN KEY ("work_tag_id") REFERENCES "work_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile_work" ADD CONSTRAINT "user_profile_work_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile_work_character" ADD CONSTRAINT "user_profile_work_character_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "user_profile_work"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
