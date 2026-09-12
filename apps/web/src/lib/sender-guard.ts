import { prisma } from "@/lib/prisma";

export interface SystemDefaultSender {
  name: string;
  email: string;
  replyTo?: string;
  domain: string;
}

export function getSystemDefaultSender(): SystemDefaultSender | null {
  const email = process.env.DEFAULT_SENDER_EMAIL?.trim().toLowerCase();
  const name = process.env.DEFAULT_SENDER_NAME?.trim();
  const domain = process.env.DEFAULT_SENDER_DOMAIN?.trim().toLowerCase();
  const replyTo = process.env.DEFAULT_SENDER_REPLYTO?.trim() || undefined;

  if (!email || !name || !domain) return null;

  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;

  return { name, email, replyTo, domain };
}

export async function assertWorkspaceSenderAllowed(
  workspaceId: string,
  senderEmail: string
): Promise<{ ok: true } | { ok: false; error: string; hint?: string }> {
  const email = senderEmail.trim().toLowerCase();
  const domainPart = email.split("@")[1]?.toLowerCase();
  if (!domainPart) return { ok: false, error: "Invalid sender email address" };

  // 1) Exact system default (cross-workspace platform sender)
  const system = getSystemDefaultSender();
  if (system && email === system.email) {
    return { ok: true };
  }

  // 2) Exact sender identity match (preferred)
  const identity = await prisma.senderIdentity.findUnique({
    where: { workspaceId_email: { workspaceId, email } },
    include: { domain: true },
  });
  if (identity) {
    if (identity.domain && identity.domain.status === "verified") return { ok: true };
    if (!identity.domain) {
      // legacy identity without linked domain — fall through to domain check
    } else {
      return {
        ok: false,
        error: `Sender "${email}" belongs to domain "${identity.domain.domain}" which is not DNS-verified yet (status: ${identity.domain.status}). Verify it under Settings → Sending Domains before sending.`,
      };
    }
  }

  // 3) Domain-level match
  const domain = await prisma.senderDomain.findUnique({
    where: { workspaceId_domain: { workspaceId, domain: domainPart } },
  });
  if (!domain) {
    return {
      ok: false,
      error: `Sender domain "${domainPart}" is not registered in this workspace.`,
      hint: "Register it under Settings → Sending Domains, add the SPF/DKIM/DMARC DNS records, verify it, then create a sender identity. Or ask your admin to set DEFAULT_SENDER_EMAIL / DEFAULT_SENDER_DOMAIN in the server environment.",
    };
  }
  if (domain.status !== "verified") {
    return {
      ok: false,
      error: `Sender domain "${domainPart}" is not DNS-verified yet (status: ${domain.status}). Complete DNS verification before sending.`,
    };
  }
  return { ok: true };
}

export async function getWorkspaceDefaultSender(workspaceId: string): Promise<{ name: string; email: string; replyTo?: string } | null> {
  const identity = await prisma.senderIdentity.findFirst({
    where: { workspaceId, isDefault: true, isVerified: true },
    include: { domain: true },
    orderBy: { createdAt: "asc" },
  });
  if (identity && identity.domain?.status === "verified") {
    return { name: identity.name, email: identity.email, replyTo: identity.replyTo || undefined };
  }
  const anyVerified = await prisma.senderIdentity.findFirst({
    where: { workspaceId, isVerified: true },
    include: { domain: true },
    orderBy: { createdAt: "asc" },
  });
  if (anyVerified && anyVerified.domain?.status === "verified") {
    return { name: anyVerified.name, email: anyVerified.email, replyTo: anyVerified.replyTo || undefined };
  }

  const system = getSystemDefaultSender();
  if (system) {
    return { name: system.name, email: system.email, replyTo: system.replyTo };
  }

  return null;
}
