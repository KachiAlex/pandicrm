-- Add sender domain + sender identity models (per-workspace sending-domain isolation)
-- CreateEnum
CREATE TYPE "SenderDomainStatus" AS ENUM ('pending', 'verified', 'failed');

-- CreateTable
CREATE TABLE "sender_domains" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "SenderDomainStatus" NOT NULL DEFAULT 'pending',
    "spf_ok" BOOLEAN NOT NULL DEFAULT false,
    "dkim_ok" BOOLEAN NOT NULL DEFAULT false,
    "dmarc_ok" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "last_checked_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sender_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sender_identities" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "domain_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reply_to" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sender_identities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sender_domains_workspace_id_idx" ON "sender_domains"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "sender_domains_workspace_id_domain_key" ON "sender_domains"("workspace_id", "domain");

-- CreateIndex
CREATE INDEX "sender_identities_workspace_id_idx" ON "sender_identities"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "sender_identities_workspace_id_email_key" ON "sender_identities"("workspace_id", "email");

-- AddForeignKey
ALTER TABLE "sender_domains" ADD CONSTRAINT "sender_domains_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sender_identities" ADD CONSTRAINT "sender_identities_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sender_identities" ADD CONSTRAINT "sender_identities_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "sender_domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
