const BREVO_API_URL = "https://api.brevo.com/v3";

interface BrevoEmailParams {
  sender: { name: string; email: string };
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  tags?: string[];
  messageId?: string;
}

interface BrevoResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export async function sendTransactionalEmail(params: BrevoEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { success: false, error: "BREVO_API_KEY is not configured" };
  }

  try {
    const res = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(params),
    });

    const data: BrevoResponse = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || `Brevo API error: ${res.status}` };
    }

    return { success: true, messageId: data.messageId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to send email" };
  }
}

export async function sendBulkEmails(
  emails: BrevoEmailParams[]
): Promise<{ sent: number; failed: number; results: { email: string; success: boolean; messageId?: string; error?: string }[] }> {
  let sent = 0;
  let failed = 0;
  const results: { email: string; success: boolean; messageId?: string; error?: string }[] = [];

  const BATCH_SIZE = 50;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (email) => {
      const result = await sendTransactionalEmail(email);
      const recipientEmail = email.to[0]?.email || "";
      if (result.success) {
        sent++;
        results.push({ email: recipientEmail, success: true, messageId: result.messageId });
      } else {
        failed++;
        results.push({ email: recipientEmail, success: false, error: result.error });
      }
      return result;
    });
    await Promise.all(batchPromises);
  }

  return { sent, failed, results };
}

export function replaceTemplateVariables(html: string, variables: Record<string, string>): string {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{{ ${key} }}`, value);
  }
  return result;
}
