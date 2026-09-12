import { prisma } from "@/lib/prisma";

interface AuditLogParams {
  workspaceId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
      },
    });
  } catch (err) {
    console.error("[AUDIT] Failed to log audit event:", err);
  }
}

export const AuditAction = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  CONVERT: "convert",
  SEND: "send",
  RESEND: "resend",
  SCHEDULE: "schedule",
  OPEN: "open",
  CLICK: "click",
  UNSUBSCRIBE: "unsubscribe",
  IMPORT: "import",
  EXPORT: "export",
  LOGIN: "login",
  LOGOUT: "logout",
  INVITE: "invite",
  REMOVE: "remove",
} as const;
