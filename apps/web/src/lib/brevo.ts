import nodemailer from "nodemailer";

function getTransporter() {
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
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  tags?: string[];
}

export async function sendTransactionalEmail(params: EmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: "Brevo SMTP credentials not configured (BREVO_SMTP_USER and BREVO_SMTP_PASS required)" };
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
