-- CreateTable
CREATE TABLE "competition_bookmark" (
    "user_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_bookmark_pkey" PRIMARY KEY ("user_id","competition_id")
);

-- AddForeignKey
ALTER TABLE "competition_bookmark" ADD CONSTRAINT "competition_bookmark_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competition"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competition_bookmark" ADD CONSTRAINT "competition_bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
