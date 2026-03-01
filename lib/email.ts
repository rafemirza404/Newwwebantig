import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY is not set — emails will be skipped.");
}

const globalForResend = globalThis as unknown as { resend?: Resend };

export const resend =
  globalForResend.resend ??
  (process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null);

if (process.env.NODE_ENV !== "production" && resend) {
  globalForResend.resend = resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "AgentBlue <hello@agentblue.ai>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a transactional email via Resend.
 * Silently no-ops if RESEND_API_KEY is not set.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Non-fatal — log but don't throw so the main flow isn't blocked
    console.error("[email] Failed to send:", err);
  }
}
