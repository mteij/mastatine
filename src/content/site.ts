/**
 * Editorial content for the static pages. Everything here is parody copy written as a starting
 * point: edit freely. Facts marked PLACEHOLDER (dates, roles) are invented for comedic effect and
 * should be replaced with the truth. No real people are named on purpose.
 */

export const ASTATINE_URL = "https://astatine.utwente.nl";

export interface Role {
  title: string;
  /** Secondary portfolio, shown in small print under the title. */
  portfolio?: string;
}

export const BOARD: Role[] = [
  { title: "Chairman" },
  { title: "Secretary", portfolio: "Internal Affairs" },
  { title: "Treasurer" },
  { title: "Educational Affairs", portfolio: "External Affairs" },
];

export interface Milestone {
  year: string;
  title: string;
  text: string;
}

/** What we have actually done so far. */
export const HISTORY: Milestone[] = [
  { year: "Before 2025", title: "Lost to history", text: "Everything before this was lost. Nobody wrote it down, because we were far too busy looking at masts. Any resemblance to earlier events is purely coincidental." },
  { year: "2025–26", title: "Released during the 4th lustrum", text: "Mastatine is released into the world during the 4th lustrum, twenty years of masts, celebrated under the theme Masten." },
  { year: "2026", title: "A new website and a Minecraft server", text: "Faster, clearer, with accounts, voting, a newsletter and a server at aaa.mastatine.nl. Still very much a joke." },
  { year: "12 November 2026", title: "The first activity", text: "Our first activity takes place on the 12th of November." },
];

export const MEMBERSHIP_PERKS: { title: string; text: string }[] = [
  { title: "Vote and submit", text: "No account needed. Rate any mast up or down, or add your own with a photo." },
  { title: "A free account", text: "Sign in with your email, no password. Manage your details and your newsletter preference in one place." },
  { title: "The quarterly newsletter", text: "About four emails a year: the best masts, the news, and the occasional bad pun." },
  { title: "Merch", text: "Wear the tallest opinions in the room. The shop is run by our print partner." },
];

export const FAQ: { q: string; a: string }[] = [
  { q: "Is this the real study association?", a: "No. S.A. Mastatine is a parody. The real association is S.A. Astatine of the University of Twente. We are not connected to them or to the university." },
  { q: "Do I get study credits?", a: "No credits, no discounts and no academic standing of any kind. Only the admiration of fellow mast enthusiasts." },
  { q: "Does membership cost anything?", a: "No. Everything on this site is free." },
  { q: "Can I delete my account?", a: "Yes, from your account page, at any time. You can also unsubscribe from the newsletter with one click." },
];
