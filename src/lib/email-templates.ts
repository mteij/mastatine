import { SITE_NAME, siteUrl } from "@/lib/env";
import { AUDIENCE_REASON, type Audience } from "@/lib/newsletter-audience";

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

const BRAND_ORANGE = "#f57f20";
const BRAND_NAVY = "#12263f";
const INK = "#1a2433";
const MUTED = "#5b6676";
const LINE = "#e6e9ef";

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
const P_STYLE = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${INK}`;

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
      return `<p style="${P_STYLE}">${html.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

export interface MailDetail {
  label: string;
  value: string;
}

interface MessageParts {
  /** The grey preview line some mail apps show next to the subject. */
  preheader: string;
  heading: string;
  /** Plain-text introduction (escaped for HTML). */
  intro?: string;
  /** Free-form content, for the newsletter. Provide both forms. */
  body?: { text: string; html: string };
  /** Label and value pairs, shown as a small table. */
  details?: MailDetail[];
  /** The one thing we want the reader to do. */
  action?: { url: string; label: string };
  /** Quieter extra links. */
  links?: { url: string; label: string }[];
  /** Small print under the action. */
  notes?: string[];
  /** Replaces the default footer (the newsletter needs its unsubscribe link). */
  footer?: { text: string; html: string };
}

function detailsTable(details: MailDetail[]): string {
  const rows = details
    .map(
      (d, i) => `<tr>
        <td style="padding:10px 0;${i < details.length - 1 ? `border-bottom:1px solid ${LINE};` : ""}width:110px;vertical-align:top;font-size:13px;color:${MUTED}">${escapeHtml(d.label)}</td>
        <td style="padding:10px 0;${i < details.length - 1 ? `border-bottom:1px solid ${LINE};` : ""}vertical-align:top;font-size:15px;font-weight:bold;color:${INK}">${escapeHtml(d.value).replace(/\n/g, "<br>")}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f7f8fa;border-radius:10px"><tr><td style="padding:6px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:8px 0 24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;padding:13px 26px;border-radius:8px">${escapeHtml(label)}</a></p>`;
}

/**
 * Every email is built here, so they all share one structure: heading, text, optional details table, one button,
 * quiet links and small print, then the footer. The plain-text version mirrors the same order.
 */
function compose(subject: string, parts: MessageParts): EmailContent {
  const footer = parts.footer ?? { text: PARODY_NOTICE, html: escapeHtml(PARODY_NOTICE) };

  const textSections = [
    parts.heading.toUpperCase(),
    ...(parts.intro ? [parts.intro] : []),
    ...(parts.body ? [parts.body.text] : []),
    ...(parts.details?.length ? [parts.details.map((d) => `${d.label}: ${d.value}`).join("\n")] : []),
    ...(parts.action ? [`${parts.action.label}: ${parts.action.url}`] : []),
    ...(parts.links?.length ? [parts.links.map((l) => `${l.label}: ${l.url}`).join("\n")] : []),
    ...(parts.notes ?? []),
    `--\n${footer.text}`,
  ];

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f1f3f6;font-family:Arial,Helvetica,sans-serif;color:${INK}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(parts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden">
    <tr><td style="background:${BRAND_NAVY};padding:20px 32px;color:#ffffff;font-size:18px;font-weight:bold">${SITE_NAME} <span style="color:${BRAND_ORANGE}">&#9650;</span></td></tr>
    <tr><td style="padding:32px 32px 12px">
      <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:${INK}">${escapeHtml(parts.heading)}</h1>
      ${parts.intro ? `<p style="${P_STYLE}">${escapeHtml(parts.intro)}</p>` : ""}
      ${parts.body ? parts.body.html : ""}
      ${parts.details?.length ? detailsTable(parts.details) : ""}
      ${parts.action ? button(parts.action.url, parts.action.label) : ""}
      ${(parts.links ?? []).map((l) => `<p style="margin:0 0 10px;font-size:14px"><a href="${escapeHtml(l.url)}" style="color:${BRAND_ORANGE};font-weight:bold">${escapeHtml(l.label)}</a></p>`).join("")}
      ${(parts.notes ?? []).map((n) => `<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:${MUTED}">${escapeHtml(n)}</p>`).join("")}
    </td></tr>
    <tr><td style="padding:20px 32px;background:#f7f8fa;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED}">${footer.html}</td></tr>
  </table>
</td></tr></table></body></html>`;

  return { subject, text: textSections.join("\n\n"), html };
}

export function magicLinkEmail(url: string, minutes: number): EmailContent {
  return compose(`Your ${SITE_NAME} sign-in link`, {
    preheader: `Your sign-in link works once and expires in ${minutes} minutes.`,
    heading: `Sign in to ${SITE_NAME}`,
    intro: `Use the button below to sign in. The link works once and expires in ${minutes} minutes.`,
    action: { url, label: "Sign in" },
    notes: ["If you did not ask for this, you can ignore this email. Nobody can sign in without the link."],
  });
}

/** Sent to the new address: opening the link proves it is theirs and switches the account over. */
export function changeEmailVerificationEmail(url: string, minutes: number): EmailContent {
  return compose(`Confirm your new ${SITE_NAME} email address`, {
    preheader: "Confirm this address to use it for your account.",
    heading: "Confirm your new email address",
    intro: `Use the button below to make this the email address of your ${SITE_NAME} account. The link works for ${minutes} minutes.`,
    action: { url, label: "Confirm email address" },
    notes: ["If you did not ask for this, you can ignore this email. Your account keeps its current address."],
  });
}

/** Sent to the old address when a change is asked for, so a stolen session cannot move an account silently. */
export function emailChangeNoticeEmail(newEmail: string): EmailContent {
  return compose(`Email change requested on your ${SITE_NAME} account`, {
    preheader: "Someone asked to move your account to another address.",
    heading: "Email change requested",
    intro: "A request was made to change the email address of your account. Nothing changes until the new address is confirmed.",
    details: [{ label: "New address", value: newEmail }],
    notes: ["If this was you, there is nothing to do. If it was not, sign out everywhere and contact us."],
  });
}

export function confirmSubscriptionEmail(confirmUrl: string): EmailContent {
  return compose(`Confirm your ${SITE_NAME} newsletter subscription`, {
    preheader: "One more click and you will receive the newsletter.",
    heading: "One more step",
    intro: `Someone (hopefully you) asked to receive the ${SITE_NAME} quarterly newsletter at this address. Confirm to start receiving it.`,
    action: { url: confirmUrl, label: "Confirm subscription" },
    notes: ["If you did not ask for this, ignore this email and you will not be subscribed."],
  });
}

export function newsletterEmail(subject: string, body: string, unsubscribeUrl: string, audience: Audience = "subscribers"): EmailContent {
  const contact = process.env.CONTACT_EMAIL ?? "";
  const reason = AUDIENCE_REASON[audience];
  return compose(subject, {
    preheader: body.replace(/\s+/g, " ").trim().slice(0, 110),
    heading: subject,
    body: { text: body, html: textToHtml(body) },
    footer: {
      text: [reason, `Unsubscribe: ${unsubscribeUrl}`, contact ? `Contact: ${contact}` : "", PARODY_NOTICE].filter(Boolean).join("\n"),
      html: `${escapeHtml(reason)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:${BRAND_ORANGE}">Unsubscribe</a>.${contact ? ` Contact: ${escapeHtml(contact)}.` : ""}<br>${escapeHtml(PARODY_NOTICE)}`,
    },
  });
}

export interface ActivityMailDetails {
  activityName: string;
  committeeName: string;
  startsAt: string;
  location: string;
  /** What the member picked when subscribing, e.g. "Vegetarian, Extra drink"; empty when there were no options. */
  choices: string;
  /** What they agreed to pay, already formatted; null when there is no price to show. */
  price: string | null;
  canUnsubscribe: boolean;
  url: string;
  calendarUrl: string;
}

function activityMail(kind: "confirmation" | "reminder", d: ActivityMailDetails): EmailContent {
  const confirmation = kind === "confirmation";
  return compose(confirmation ? `You are going to ${d.activityName}` : `Tomorrow: ${d.activityName}`, {
    preheader: `${d.activityName}, ${d.startsAt}`,
    heading: confirmation ? "You are going!" : "See you tomorrow",
    intro: confirmation
      ? `You are subscribed to ${d.activityName}. Here is what you signed up for.`
      : `${d.activityName} is coming up. You are subscribed, so here is a reminder.`,
    details: [
      { label: "Activity", value: d.activityName },
      { label: "When", value: d.startsAt },
      ...(d.location ? [{ label: "Where", value: d.location }] : []),
      { label: "Organised by", value: d.committeeName },
      ...(d.choices ? [{ label: "Your choices", value: d.choices }] : []),
      ...(d.price ? [{ label: "Your price", value: d.price }] : []),
    ],
    action: { url: d.url, label: "View the activity" },
    links: [{ url: d.calendarUrl, label: "Add it to your calendar" }],
    notes: [
      d.canUnsubscribe
        ? "Cannot make it any more? Please unsubscribe on the activity page, so someone else can take your place."
        : "You can no longer unsubscribe. If you cannot make it, please contact the organising committee.",
    ],
  });
}

/** Sent right after someone subscribes to an activity. */
export const activityConfirmationEmail = (d: ActivityMailDetails): EmailContent => activityMail("confirmation", d);

/** Sent about a day before the activity to everyone who is subscribed. */
export const activityReminderEmail = (d: ActivityMailDetails): EmailContent => activityMail("reminder", d);

export interface ActivityInviteDetails {
  committeeName: string;
  activityName: string;
  organiser: string;
  startsAt: string;
  location: string;
  note: string;
  url: string;
}

/** Sent to the members of a service committee (bar, photo) when an activity invites it. */
export function activityInviteEmail(d: ActivityInviteDetails): EmailContent {
  return compose(`${d.committeeName} invited to ${d.activityName}`, {
    preheader: `${d.organiser} would like the ${d.committeeName} at ${d.activityName}.`,
    heading: `${d.committeeName} invited`,
    intro: `${d.organiser} has invited the ${d.committeeName} to an activity.`,
    details: [
      { label: "Activity", value: d.activityName },
      { label: "Organised by", value: d.organiser },
      { label: "When", value: d.startsAt },
      ...(d.location ? [{ label: "Where", value: d.location }] : []),
      ...(d.note ? [{ label: "Note", value: d.note }] : []),
    ],
    action: { url: d.url, label: "View the activity" },
  });
}

/** Sent when an admin approves someone's membership request. */
export function membershipApprovedEmail(name: string | null): EmailContent {
  return compose(`You are now a member of ${SITE_NAME}`, {
    preheader: "Your membership request was approved.",
    heading: "Welcome, member!",
    intro: `${name ? `Hi ${name}, an` : "An"} admin approved your membership request. You now have access to everything that is just for members.`,
    details: [
      { label: "Quotes", value: "Read, add and grade quotes" },
      { label: "Activities", value: "See and join members-only activities" },
    ],
    action: { url: absoluteUrl("/mastapps"), label: "Open MastApps" },
  });
}

/** Sent when an admin declines a request or ends a membership. The reason is optional and written by the admin. */
export function membershipEndedEmail(name: string | null, kind: "declined" | "revoked", reason: string | null, retryDays: number): EmailContent {
  const declined = kind === "declined";
  return compose(declined ? `Your ${SITE_NAME} membership request` : `Your ${SITE_NAME} membership has ended`, {
    preheader: declined ? "An admin declined your membership request." : "An admin ended your membership.",
    heading: declined ? "Membership request declined" : "Membership ended",
    intro: `${name ? `Hi ${name}, an` : "An"} admin ${declined ? "declined your membership request" : "ended your membership"}. You can ask again after ${retryDays} days.`,
    details: reason ? [{ label: "Reason", value: reason }] : undefined,
    action: { url: absoluteUrl("/membership"), label: "Membership" },
  });
}

/** Sent to the admins when someone asks for membership, so requests do not wait unseen. */
export function membershipRequestedEmail(person: { name: string | null; email: string }): EmailContent {
  return compose("New membership request", {
    preheader: `${person.name || person.email} asked to become a member.`,
    heading: "New membership request",
    intro: "Someone asked to become a member. Approve or decline the request in the admin area.",
    details: [
      { label: "Name", value: person.name || "No name yet" },
      { label: "Email", value: person.email },
    ],
    action: { url: absoluteUrl("/admin/users?filter=requests"), label: "Review requests" },
  });
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path}`;
}
