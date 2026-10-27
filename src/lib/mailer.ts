import nodemailer, { type Transporter } from "nodemailer";
import { requireEnv } from "@/lib/env";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: requireEnv("SMTP_HOST"),
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS (required by nodemailer when secure is false)
      requireTLS: port !== 465,
      auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
    });
  }
  return transporter;
}

/**
 * Sends one email over SMTP. With MAIL_TRANSPORT=log (local development and staging only) the
 * message is printed instead; that includes sign-in links, so never enable it in production.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  if (process.env.MAIL_TRANSPORT === "log") {
    console.info(`[mail] to=${message.to} subject=${message.subject}\n${message.text}`);
    return;
  }
  await getTransporter().sendMail({
    from: requireEnv("MAIL_FROM"),
    replyTo: process.env.MAIL_REPLY_TO || undefined,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    headers: message.headers,
  });
}
