/**
 * Editorial content for the static pages. Everything here is parody copy written as a starting
 * point: edit freely. Facts marked PLACEHOLDER (dates, roles) are invented for comedic effect and
 * should be replaced with the truth. No real people are named on purpose.
 */

export const ASTATINE_URL = "https://astatine.utwente.nl";

export interface NewsPost {
  slug: string;
  title: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  summary: string;
  /** Plain paragraphs; no HTML. */
  body: string[];
}

export const NEWS: NewsPost[] = [
  {
    slug: "we-are-sooooo-back",
    title: "We are sooooo back!",
    date: "2026-08-28",
    summary: "After a well-deserved summer, the towers are climbing again.",
    body: [
      "We are sooooo BACK.",
      "After a well-deserved summer, S.A. Mastatine is back in full force. New masts, new votes, new Mast of the Month glory: the towers are climbing again and we could not be more hyped for the new academic year.",
      "Get your entries in and rally your housemates. Let's make this the best masting season yet.",
      "Op de hoge masten,",
      "The board",
    ],
  },
  {
    slug: "mastatine-celebrates-first-lustrum",
    title: "Mastatine celebrates its first lustrum",
    date: "2026-01-20",
    summary: "Five years of masts. The lustrum theme is, fittingly, Masten.",
    body: [
      "Dear members,",
      "In the academic year 2025–2026, S.A. Mastatine celebrates its first lustrum with the theme: Masten. We hope to see you all at the fantastic activities the lustrum committee has organised.",
      "Op de hoge masten,",
      "The lustrum committee",
    ],
  },
];

export function findNews(slug: string): NewsPost | undefined {
  return NEWS.find((post) => post.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface Role {
  title: string;
  motto: string;
  duties: string;
}

export const BOARD: Role[] = [
  { title: "Chair", motto: "Keeps the meeting vertical.", duties: "Chairs meetings, represents the association, and decides which anecdote about guy-wires is told this time." },
  { title: "Secretary", motto: "Takes the minutes. Occasionally the blame.", duties: "Keeps the records, answers the mail and knows where the stamp is. We do not have a stamp." },
  { title: "Treasurer", motto: "Counts every euro and every metre of cable.", duties: "Looks after the money, the budget and the receipts for the fun stuff." },
  { title: "Commissioner of Internal Affairs", motto: "Member wellbeing, snacks, vibes.", duties: "Organises borrels and makes sure nobody stands alone at the drinks table." },
  { title: "Commissioner of External Affairs", motto: "Talks to people with budgets.", duties: "Partners, sponsors and the occasional very patient network operator." },
  { title: "Commissioner of Education", motto: "Evaluates the curriculum. There is none.", duties: "Collects opinions about education, then politely forwards them to the people who actually run it." },
];

export interface Committee {
  name: string;
  tagline: string;
  description: string;
}

export const COMMITTEES: Committee[] = [
  { name: "MastCom", tagline: "Events", description: "Plans the excursions, drinks and pub quizzes. Has strong opinions about the correct number of finger foods." },
  { name: "The Beacon", tagline: "Communications", description: "Runs this website, the newsletter and the social media. Blinks at regular intervals." },
  { name: "Guy-Wire", tagline: "Sponsorship and partners", description: "Keeps the association upright by staying in touch with companies who like tall things." },
  { name: "Lustrum Committee", tagline: "Celebrations", description: "Organised the first lustrum. Currently recovering." },
  { name: "Foundation", tagline: "Finance audit", description: "Checks that the numbers add up, then checks again from a different angle." },
];

export interface Milestone {
  year: string;
  title: string;
  text: string;
}

/** PLACEHOLDER timeline: only the first lustrum in 2025-2026 is certain. Replace with the real story. */
export const HISTORY: Milestone[] = [
  { year: "2020–21", title: "The first mast", text: "The association is founded around a simple observation: tall structures deserve a fan club." },
  { year: "2021–22", title: "The vote", text: "Members start voting masts up and down, and the gallery is born." },
  { year: "2023–24", title: "The KLOK", text: "We adopt our own unit of height, the KLOK (1 KLOK = 0.168 m), because metres lacked drama." },
  { year: "2025–26", title: "First lustrum", text: "Five years of masts, celebrated under the theme Masten." },
  { year: "2026", title: "A new website", text: "Faster, clearer, with accounts and a newsletter, and still very much a joke." },
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
