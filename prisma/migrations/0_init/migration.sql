-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "id_token" TEXT,
    "scope" TEXT,
    "session_state" TEXT,
    "token_type" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profile" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "website" TEXT NOT NULL,

    CONSTRAINT "company_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_user" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "company_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_application" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "avatar" TEXT,

    CONSTRAINT "competition_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "likes" INTEGER DEFAULT 0,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_like" (
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "post_like_pkey" PRIMARY KEY ("user_id","post_id")
);

-- CreateTable
CREATE TABLE "project_genre" (
    "id" SERIAL NOT NULL,
    "genre_name" TEXT NOT NULL,

    CONSTRAINT "project_genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_projectgenre" (
    "project_id" INTEGER NOT NULL,
    "project_genre_id" INTEGER NOT NULL,

    CONSTRAINT "project_projectgenre_pkey" PRIMARY KEY ("project_id","project_genre_id")
);

-- CreateTable
CREATE TABLE "project_projecttag" (
    "project_id" INTEGER NOT NULL,
    "project_tag_id" INTEGER NOT NULL,

    CONSTRAINT "project_projecttag_pkey" PRIMARY KEY ("project_id","project_tag_id")
);

-- CreateTable
CREATE TABLE "project_tag" (
    "id" SERIAL NOT NULL,
    "tag_name" TEXT NOT NULL,

    CONSTRAINT "project_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "sessionToken" VARCHAR(255) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" SERIAL NOT NULL,
    "contact_email" TEXT,
    "about" TEXT,
    "current_title" TEXT,
    "user_id" INTEGER NOT NULL,
    "background_image" TEXT,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_experience" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "profile_id" INTEGER,

    CONSTRAINT "user_profile_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_project" (
    "id" SERIAL NOT NULL,
    "plot_title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "logline" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "similar_works" TEXT NOT NULL,
    "profile_id" INTEGER,

    CONSTRAINT "user_profile_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255),
    "emailVerified" TIMESTAMPTZ(6),
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "verification_token_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "ik_companies_email" ON "company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_genre_genre_name_key" ON "project_genre"("genre_name");

-- CreateIndex
CREATE UNIQUE INDEX "project_tag_tag_name_key" ON "project_tag"("tag_name");

-- AddForeignKey
ALTER TABLE "company_profile" ADD CONSTRAINT "fk_company_id" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "company_user" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "fk_company_id" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_like" ADD CONSTRAINT "fk_post_id" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_like" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_projectgenre" ADD CONSTRAINT "fk_genre_id" FOREIGN KEY ("project_genre_id") REFERENCES "project_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_projectgenre" ADD CONSTRAINT "fk_project_id" FOREIGN KEY ("project_id") REFERENCES "user_profile_project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_projecttag" ADD CONSTRAINT "fk_project_id" FOREIGN KEY ("project_id") REFERENCES "user_profile_project"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_projecttag" ADD CONSTRAINT "fk_tag_id" FOREIGN KEY ("project_tag_id") REFERENCES "project_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile_experience" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profile_project" ADD CONSTRAINT "fk_profile_id" FOREIGN KEY ("profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

