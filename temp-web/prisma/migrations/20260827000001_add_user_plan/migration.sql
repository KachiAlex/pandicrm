-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'standard', 'premium');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "plan" "UserPlan" NOT NULL DEFAULT 'free';
