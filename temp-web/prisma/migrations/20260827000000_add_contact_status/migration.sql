-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('new', 'qualified', 'opportunity', 'customer', 'lost');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "status" "ContactStatus" NOT NULL DEFAULT 'new';

-- CreateIndex
CREATE INDEX "contacts_status_idx" ON "contacts"("status");
