"use client";

import { useState } from "react";
import MastatineLogo from "./MastatineLogo";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Nieuws",
    href: "#",
    children: [
      { label: "Agenda", href: "/agenda" },
      { label: "MAttentie", href: "/mattentie" },
    ],
  },
  {
    label: "Vereniging",
    href: "#",
    children: [
      {
        label: "Het Bestuur",
        href: "/bestuur",
        children: [{ label: "Vorige Besturen", href: "/vorige-besturen" }],
      },
      { label: "Commissies", href: "/commissies" },
      {
        label: "Grote Evenementen",
        href: "#",
        children: [
          { label: "EuroTrip", href: "/eurotrip" },
          { label: "Mastexcursie", href: "/mastexcursie" },
          { label: "Kick-In", href: "/kick-in" },
          { label: "Alumnidag", href: "/alumnidag" },
        ],
      },
      { label: "Mastatinelied", href: "/lied" },
      { label: "Geschiedenis", href: "/geschiedenis" },
      {
        label: "Lidmaatschap",
        href: "/lidmaatschap",
        children: [
          { label: "Ereleden & Leden van Verdienste", href: "/ereleden" },
        ],
      },
      {
        label: "Geestelijke Gezondheid",
        href: "#",
        children: [
          { label: "Studieadviseurs", href: "/studieadviseurs" },
          { label: "Vertrouwenspersoon (VCP)", href: "/vcp" },
          { label: "Trainingen en workshops", href: "/trainingen" },
          { label: "Welzijn", href: "/welzijn" },
        ],
      },
      { label: "Internationale Vereniging", href: "/internationaal" },
    ],
  },
  {
    label: "Onderwijs",
    href: "#",
    children: [
      { label: "Gevorderde Masttechnologie", href: "/gmt" },
      { label: "Nanotechnologie", href: "/nano" },
      { label: "Robotica", href: "/robotica" },
      { label: "Onderwijsprijs", href: "/onderwijsprijs" },
      { label: "Boeken", href: "https://wo4you.nl/", external: true },
    ],
  },
  {
    label: "Partners",
    href: "#",
    children: [
      {
        label: "Bedrijven",
        href: "#",
        children: [
          { label: "TenneT", href: "/tennet" },
          { label: "Alliander", href: "/alliander" },
        ],
      },
      {
        label: "Vacaturebank",
        href: "/vacaturebank",
        children: [
          { label: "Bacheloropdrachten", href: "/bacheloropdrachten" },
          { label: "Bijbanen & Stages", href: "/bijbanen" },
        ],
      },
    ],
  },
  { label: "MastApps", href: "#", external: true },
  { label: "Contact", href: "/contact" },
];

const ACTIVITIES = [
  { date: "12 juni 2026", events: [{ title: "VrijMidBOSS", location: "De Mast" }] },
  { date: "15 juni 2026", events: [{ title: "Studeermiddag" }] },
  {
    date: "16 juni 2026",
    events: [{ title: "Mastklimworkshop", location: "O&O Plein" }],
  },
  {
    date: "17 juni 2026",
    events: [
      { title: "StAf finale vs Hoogspanning 1" },
      { title: "Area 85 PotLuck" },
    ],
  },
];

function NavNode({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [open, setOpen] = useState(false);
  const has = !!item.children?.length;

  return (
    <li>
      <div className="flex items-center group">
        <a
          href={has ? undefined : item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          onClick={has ? (e) => { e.preventDefault(); setOpen((o) => !o); } : undefined}
          className="flex-1 py-1 text-[#000] hover:text-[#f57f20] transition-colors font-bold text-[1.05em] leading-[2.6] cursor-pointer select-none"
          style={{ paddingLeft: `${0.4 + depth * 1.1}rem` }}
        >
          {item.label}
        </a>
        {has && (
          <button
            onClick={() => setOpen((o) => !o)}
            className="px-2 text-[#aaa] hover:text-[#f57f20] text-lg leading-none"
            aria-label={open ? "Sluit submenu" : "Open submenu"}
          >
            <span
              className="inline-block transition-transform duration-150"
              style={{ transform: open ? "rotate(90deg)" : "none" }}
            >
              ›
            </span>
          </button>
        )}
      </div>
      {has && open && (
        <ul className="border-l-2 border-[#eee] ml-3">
          {item.children!.map((child) => (
            <NavNode key={child.label} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger — shown only below lg breakpoint */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 bg-white shadow rounded p-2 text-xl leading-none"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="sidebar"
        className={[
          "bg-white flex flex-col",
          /* desktop: sticky left column */
          "lg:w-[380px] lg:min-w-[380px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto",
          /* mobile: slide-in drawer */
          mobileOpen
            ? "fixed inset-y-0 left-0 w-80 z-50 overflow-y-auto"
            : "hidden lg:flex",
        ].join(" ")}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute top-3 right-3 text-2xl text-[#555] hover:text-[#f57f20]"
          onClick={() => setMobileOpen(false)}
        >
          ×
        </button>

        {/* ── BRANDING ── */}
        <div id="branding" className="px-5 pt-6 pb-3">
          <a href="/" className="flex items-start gap-3 no-underline">
            <MastatineLogo size={72} className="shrink-0" />
            <div className="pt-1">
              <h1 className="font-bold leading-tight text-[#f57f20]" style={{ fontSize: "1.6em" }}>
                S.A. Mastatine
              </h1>
              <p className="text-[#0a0a0a] font-extrabold leading-snug" style={{ fontSize: "0.78em" }}>
                De studievereniging voor<br />open-minded ingenieurs
              </p>
            </div>
          </a>
        </div>

        {/* ── NAV ── */}
        <nav id="access" aria-label="Primair menu" className="border-t border-[#eee]">
          <h3 className="sr-only">Menu</h3>
          <ul className="px-3 divide-y divide-[#f0f0f0]">
            {NAV.map((item) => (
              <NavNode key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        {/* ── spacer pushes widgets + footer to bottom ── */}
        <div className="flex-1" />

        {/* ── PARTNER WIDGET ── */}
        <div className="px-5 py-3 border-t border-[#eee]">
          <a href="/tennet">
            <div className="bg-[#f5f5f5] rounded p-3 flex items-center justify-center">
              <TennetLogo />
            </div>
          </a>
        </div>

        {/* ── ACTIVITIES WIDGET ── */}
        <div className="px-5 py-3 border-t border-[#eee]">
          <h3
            className="text-center uppercase text-[#0a0a0a] mb-3 pb-2 border-b border-[#eee]"
            style={{ fontSize: "1em", fontWeight: 400 }}
          >
            Activiteiten deze week
          </h3>
          <dl className="space-y-2">
            {ACTIVITIES.map(({ date, events }) => (
              <div key={date}>
                <dt className="border-b border-[#001e7a] mb-1">
                  <span className="inline-block bg-[#001e7a] text-white px-2 py-0.5 text-xs">
                    {date}
                  </span>
                </dt>
                <dd>
                  <ul className="space-y-0.5">
                    {events.map((ev, i) => (
                      <li key={i} className="text-sm text-[#0a0a0a]">
                        <strong>{ev.title}</strong>
                        {"location" in ev && ev.location && (
                          <em className="ml-1 text-[#555] not-italic"> {ev.location}</em>
                        )}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── SEARCH WIDGET ── */}
        <div className="px-5 py-3 border-t border-[#eee]">
          <form role="search" method="get" action="/#towers" className="flex border border-[#eee] bg-white">
            <input
              type="search"
              name="s"
              placeholder="Zoeken"
              className="flex-1 px-3 py-2 text-sm text-[#0a0a0a] outline-none"
            />
            <button
              type="submit"
              className="px-3 text-white text-sm"
              style={{ backgroundColor: "#1c1399" }}
            >
              🔍
            </button>
          </form>
        </div>

        {/* ── FOOTER (in sidebar) ── */}
        <footer id="footer" className="border-t border-[#eee] px-5 py-4">
          {/* Social icons */}
          <nav id="sfooter" className="flex gap-2 mb-3">
            {[
              { label: "Facebook", href: "https://www.facebook.com/" },
              { label: "LinkedIn", href: "https://www.linkedin.com/" },
              { label: "Instagram", href: "https://www.instagram.com/" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border-2 border-[#f57f20] text-[#f57f20] flex items-center justify-center text-xs font-bold hover:bg-[#1c1399] hover:border-[#1c1399] hover:text-white transition-colors"
                title={label}
              >
                {label[0]}
              </a>
            ))}
          </nav>
          <p className="text-[0.85em] text-[#0a0a0a]">
            Powered by{" "}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-[#f57f20] hover:text-[#1c1399]">
              Next.js
            </a>{" "}
            &amp;{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#f57f20] hover:text-[#1c1399]">
              Supabase
            </a>
          </p>
        </footer>
      </aside>
    </>
  );
}

function TennetLogo() {
  return (
    <svg
      viewBox="0 0 220 52"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[180px]"
      aria-label="TenneT"
    >
      <text
        x="110"
        y="40"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="40"
        fill="#f57f20"
        letterSpacing="-1"
      >
        TenneT
      </text>
      <text
        x="110"
        y="52"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="400"
        fontSize="9"
        fill="#666"
        letterSpacing="2"
      >
        PARTNER VAN MASTATINE
      </text>
    </svg>
  );
}
