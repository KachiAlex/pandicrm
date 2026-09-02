import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

interface SmtpConfig {
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
  secure?: boolean;
}

async function getTransporter(workspaceId?: string) {
  if (workspaceId) {
    const integration = await prisma.integration.findFirst({
      where: { workspaceId, type: "email", isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (integration) {
      const c = (integration.config as unknown as SmtpConfig | null) ?? {};
      const host = c.host || "smtp-relay.brevo.com";
      const port = parseInt(String(c.port || "587"), 10);
      const user = c.user;
      const pass = c.pass;
      if (user && pass) {
        return nodemailer.createTransport({
          host,
          port,
          secure: c.secure === true || port === 465,
          auth: { user, pass },
        });
      }
    }
  }

  const host = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

interface EmailParams {
  workspaceId?: string;
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  tags?: string[];
}

export async function sendTransactionalEmail(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = await getTransporter(params.workspaceId);
  if (!transporter) {
    return { success: false, error: "Email provider not configured. Add an email integration or set BREVO_SMTP_USER and BREVO_SMTP_PASS." };
  }

  try {
    const info = await transporter.sendMail({
      from: `${params.sender.name} <${params.sender.email}>`,
      to: params.to.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email)).join(", "),
      subject: params.subject,
      html: params.htmlContent,
      text: params.textContent,
      replyTo: params.replyTo?.email,
      headers: params.tags ? { "X-Tags": params.tags.join(",") } : undefined,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to send email" };
  }
}

export function replaceTemplateVariables(html: string, variables: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{{ ${key} }}`, value);
  }
  return result;
}

export function addTracking(html: string, campaignId: string, recipientId: string, unsubscribeUrl: string) {
  const openUrl = `https://pandacrm.com.ng/api/campaigns/track/open?recipient=${recipientId}`;
  const trackedHtml = html.replace(/href\s*=\s*("|')([^"']+)\1/gi, (match, quote, url: string) => {
    if (url === unsubscribeUrl) return match;
    if (!url.startsWith("http")) return match;
    const clickUrl = `https://pandacrm.com.ng/api/campaigns/track/click?recipient=${recipientId}&url=${encodeURIComponent(url)}`;
    return `href=${quote}${clickUrl}${quote}`;
  }) + `<img src="${openUrl}" alt="" width="1" height="1" style="display:block;" />`;
  return trackedHtml;
}
