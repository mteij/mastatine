import { SITE_NAME, siteUrl } from "@/lib/env";

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const BRAND_ORANGE = "#f57f20";
const BRAND_NAVY = "#12263f";

export const PARODY_NOTICE =
  "S.A. Mastatine is a parody. It is not affiliated with, endorsed by or connected to S.A. Astatine or the University of Twente.";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const URL_RE = /https?:\/\/[^\s<>"']+/g;

/** Plain text to HTML: escapes everything, keeps paragraphs and line breaks, links bare http(s) URLs. */
export function textToHtml(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = escapeHtml(paragraph.trim()).replace(URL_RE, (url) => {
        const trailing = url.match(/[.,;:!?)&;]+$/)?.[0] ?? "";
        const clean = url.slice(0, url.length - trailing.length);
        return `<a href="${clean}" style="color:${BRAND_ORANGE}">${clean}</a>${trailing}`;
      });
      return `<p style="margin:0 0 16px;line-height:1.6">${html.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function layout(innerHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html lang="en"><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:${BRAND_NAVY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
    <tr><td style="background:${BRAND_NAVY};padding:20px 28px;color:#ffffff;font-size:18px;font-weight:bold">${SITE_NAME} <span style="color:${BRAND_ORANGE}">&#9650;</span></td></tr>
    <tr><td style="padding:28px">${innerHtml}</td></tr>
    <tr><td style="padding:20px 28px;background:#f9fafb;font-size:12px;line-height:1.5;color:#5b6676">${footerHtml}</td></tr>
  </table>
</td></tr></table></body></html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px">${escapeHtml(label)}</a></p>`;
}

const transactionalFooter = `${escapeHtml(PARODY_NOTICE)}`;

export function magicLinkEmail(url: string, minutes: number): EmailContent {
  const subject = `Your ${SITE_NAME} sign-in link`;
  const text = [
    `Use this link to sign in to ${SITE_NAME}. It works once and expires in ${minutes} minutes.`,
    "",
    url,
    "",
    "If you did not ask for this, you can ignore this email. Nobody can sign in without the link.",
    "",
    PARODY_NOTICE,
  ].join("\n");
  const html = layout(
    `<h1 style="margin:0 0 12px;font-size:20px">Sign in to ${SITE_NAME}</h1>
     <p style="margin:0 0 8px;line-height:1.6">Use the button below to sign in. The link works once and expires in ${minutes} minutes.</p>
     ${button(url, "Sign in")}
     <p style="margin:0;line-height:1.6;font-size:13px;color:#5b6676">If you did not ask for this, you can ignore this email. Nobody can sign in without the link.</p>`,
    transactionalFooter,
  );
  return { subject, text, html };
}

export function confirmSubscriptionEmail(confirmUrl: string): EmailContent {
  const subject = `Confirm your ${SITE_NAME} newsletter subscription`;
  const text = [
    `Someone (hopefully you) asked to receive the ${SITE_NAME} quarterly newsletter at this address.`,
    "",
    `Confirm your subscription: ${confirmUrl}`,
    "",
    "If you did not ask for this, ignore this email and you will not be subscribed.",
    "",
    PARODY_NOTICE,
  ].join("\n");
  const html = layout(
    `<h1 style="margin:0 0 12px;font-size:20px">One more step</h1>
     <p style="margin:0 0 8px;line-height:1.6">Someone (hopefully you) asked to receive the ${SITE_NAME} quarterly newsletter at this address. Confirm to start receiving it.</p>
     ${button(confirmUrl, "Confirm subscription")}
     <p style="margin:0;line-height:1.6;font-size:13px;color:#5b6676">If you did not ask for this, ignore this email and you will not be subscribed.</p>`,
    transactionalFooter,
  );
  return { subject, text, html };
}

export function newsletterEmail(subject: string, body: string, unsubscribeUrl: string): EmailContent {
  const contact = process.env.CONTACT_EMAIL ?? "";
  const textFooter = [
    "--",
    `You receive this because you subscribed to the ${SITE_NAME} newsletter (about four times a year).`,
    `Unsubscribe: ${unsubscribeUrl}`,
    contact ? `Contact: ${contact}` : "",
    PARODY_NOTICE,
  ]
    .filter(Boolean)
    .join("\n");
  const html = layout(
    `<h1 style="margin:0 0 16px;font-size:22px">${escapeHtml(subject)}</h1>${textToHtml(body)}`,
    `You receive this because you subscribed to the ${SITE_NAME} newsletter (about four times a year).
     <a href="${escapeHtml(unsubscribeUrl)}" style="color:${BRAND_ORANGE}">Unsubscribe</a>.${contact ? ` Contact: ${escapeHtml(contact)}.` : ""}<br>${escapeHtml(PARODY_NOTICE)}`,
  );
  return { subject, text: `${body}\n\n${textFooter}`, html };
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}
