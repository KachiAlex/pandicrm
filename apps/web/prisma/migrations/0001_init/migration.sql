-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "name" TEXT,
    "company" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_key" ON "workspace_members"("workspace_id", "user_id");

-- New tables for file_attachments
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "file_attachments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "file_attachments_workspace_id_idx" ON "file_attachments"("workspace_id");
CREATE INDEX "file_attachments_entity_type_entity_id_idx" ON "file_attachments"("entity_type", "entity_id");

-- New table for custom_field_definitions
CREATE TABLE "custom_field_definitions" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "custom_field_definitions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "custom_field_definitions_workspace_id_entity_type_field_name_key" ON "custom_field_definitions"("workspace_id", "entity_type", "field_name");
CREATE INDEX "custom_field_definitions_workspace_id_idx" ON "custom_field_definitions"("workspace_id");

-- New table for audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "audit_logs_workspace_id_idx" ON "audit_logs"("workspace_id");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- Add new columns to tasks table
ALTER TABLE "tasks" ADD COLUMN "recurrence" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "tasks" ADD COLUMN "recurrence_end_date" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "parent_task_id" TEXT;

CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- Add lead_score to contacts
ALTER TABLE "contacts" ADD COLUMN "lead_score" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "contacts_status_idx" ON "contacts"("status");
