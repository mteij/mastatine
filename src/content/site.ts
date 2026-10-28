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
    slug: "mastatine-minecraft-server",
    title: "The Mastatine Minecraft server is live!",
    date: "2026-10-28",
    summary: "Join at aaa.mastatine.nl and explore the world on our live map.",
    body: [
      "Dear members,",
      "S.A. Mastatine now has its own Minecraft server. Join us at aaa.mastatine.nl, build something tall, and check who is online right now at the top of the homepage.",
      "Lost? Our live map at map.mastatine.nl shows the whole world, so you can admire every mast from above.",
      "Op de hoge masten,",
      "The board",
    ],
  },
  {
    slug: "we-are-sooooo-back",
    title: "We are sooooo back!",
    date: "2026-08-28",
    summary: "After a well-deserved summer, the towers are climbing again.",
    body: [
      "After a well-deserved summer, S.A. Mastatine is back in full force. New masts, new votes, new Mast of the Month glory: the towers are climbing again and we could not be more hyped for the new academic year.",
      "Get your entries in and rally your housemates. Let's make this the best masting season yet.",
      "Op de hoge masten,",
      "The board",
    ],
  },
  {
    slug: "mastatine-celebrates-fourth-lustrum",
    title: "Mastatine celebrates its 4th lustrum",
    date: "2026-01-20",
    summary: "Twenty years of masts. The lustrum theme is, fittingly, Masten.",
    body: [
      "Dear members,",
      "In the academic year 2025–2026, S.A. Mastatine celebrates its 4th lustrum with the theme: Masten. Every 5 years we celebrate a lustrum, a milestone for our association. We hope to see you all at the fantastic activities the lustrum committee has organised.",
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

export interface Milestone {
  year: string;
  title: string;
  text: string;
}

/**
 * Parody timeline: it deliberately follows the dates of the association we parody (founded 23 December 2005,
 * lustra every five years), retold around masts. No real people or other organisations are named.
 */
export const HISTORY: Milestone[] = [
  { year: "23 December 2005", title: "The first mast", text: "S.V.A.M. Mastatine is founded by a first board of four who prefer to stay anonymous. Until then, mast enthusiasts had to admire towers alone, on their own time." },
  { year: "2006", title: "The M-team", text: "The first all-mast team lines up for the Batavierenrace. At the end of the year the first Mastatine BBQ is held, and it becomes tradition: the BBQ committee becomes the candidate board for the next year." },
  { year: "2006–07", title: "The first year of firsts", text: "The first MASTentie magazine is written, and the first symposium, a trip to Denmark (excellent masts) and a prom are organised. Mastatine celebrates its first birthday." },
  { year: "2007–08", title: "The BuCom", text: "A committee is founded to organise a yearly trip within Europe. The first destinations are chosen for their mast density." },
  { year: "December 2007", title: "The first drink", text: "The borrel committee is established. In January the first drink is held at the foot of a very tall mast." },
  { year: "2009–10", title: "Going English", text: "Advanced Mastology becomes an English bachelor, and Mastatine switches to English by the end of the year. Op de hoge masten stays Dutch." },
  { year: "2010–11", title: "First lustrum", text: "A week of celebrations in February under the theme Small going tall." },
  { year: "2011", title: "A penthouse of our own", text: "The borrel moves to a shared penthouse, as close to the sky as the building allows." },
  { year: "2015", title: "Second lustrum", text: "Celebrated under the theme Heights, with a whole month of activities. The 11th board is crowned Tallest Board by a jury that does not officially exist." },
  { year: "February 2016", title: "Nanomastology joins", text: "The Master's programme in Nanomastology becomes part of Mastatine. Very small masts, very big plans." },
  { year: "6 September 2018", title: "S.A. Mastatine", text: "The name officially changes to S.A. Mastatine. S.V.A.M. becomes S.A. (Study Association) to reflect internationalisation and the arrival of Nanomastology." },
  { year: "2020", title: "Third lustrum", text: "Celebrated at a responsible distance of one mast. We adopt our own unit of height, the KLOK (1 KLOK = 0.168 m), because metres lacked drama." },
  { year: "2025–26", title: "4th lustrum", text: "Twenty years of masts, celebrated under the theme Masten." },
  { year: "2026", title: "A new website and a Minecraft server", text: "Faster, clearer, with accounts, voting, a newsletter and a server at aaa.mastatine.nl. Still very much a joke." },
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
