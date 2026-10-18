-- AlterTable
ALTER TABLE "User" ADD COLUMN "birthday" TIMESTAMP(3),
ADD COLUMN "showBirthday" BOOLEAN NOT NULL DEFAULT false;
