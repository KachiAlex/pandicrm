import nodemailer from "nodemailer";

export interface TestResult {
  success: boolean;
  message: string;
  authUrl?: string;
}

export async function testEmailIntegration(config: any, toEmail: string): Promise<TestResult> {
  const host = config.host;
  const port = parseInt(config.port || "587", 10);
  const user = config.user;
  const pass = config.pass;
  const secure = config.secure === true || port === 465;

  if (!host || !user || !pass) {
    return { success: false, message: "Missing host, user, or password" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"PandiCRM Test" <${user}>`,
      to: toEmail,
      subject: "Integration test",
      text: "Your email integration is working.",
    });

    return { success: true, message: "Test email sent successfully" };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to send test email" };
  }
}

export async function testSmsIntegration(config: any): Promise<TestResult> {
  const sid = config.accountSid;
  const token = config.authToken;
  const from = config.fromNumber;
  const to = config.testNumber;

  if (!sid || !token || !from || !to) {
    return { success: false, message: "Missing Twilio accountSid, authToken, fromNumber, or testNumber" };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({ From: from, To: to, Body: "PandiCRM SMS integration test" });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (res.ok) {
      return { success: true, message: "Test SMS sent successfully" };
    }
    const data = await res.json().catch(() => ({}));
    return { success: false, message: data.message || `Twilio error: ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to send test SMS" };
  }
}

export async function testCalendarIntegration(config: any): Promise<TestResult> {
  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    return { success: false, message: "Missing clientId, clientSecret, or redirectUri" };
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    config.clientId
  )}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events"
  )}&access_type=offline&prompt=consent`;

  return {
    success: true,
    message: "Calendar config is valid. Authorize with Google to complete the connection.",
    authUrl,
  };
}
