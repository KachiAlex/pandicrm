-- CreateTable
CREATE TABLE "contact_categories" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_categories_workspace_id_name_key" ON "contact_categories"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "contact_categories_workspace_id_idx" ON "contact_categories"("workspace_id");

-- AddForeignKey
ALTER TABLE "contact_categories" ADD CONSTRAINT "contact_categories_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "category_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
