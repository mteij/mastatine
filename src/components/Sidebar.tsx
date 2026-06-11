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
        children: [{ label: "Ereleden & Leden van Verdienste", href: "/ereleden" }],
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
  { label: "MastApps", href: "#" },
  { label: "Contact", href: "/contact" },
];

const ACTIVITIES = [
  { date: "12 juni 2026", events: [{ title: "VrijMidBOSS", location: "De Mast" }] },
  { date: "15 juni 2026", events: [{ title: "Studeermiddag" }] },
  { date: "16 juni 2026", events: [{ title: "Mastklimworkshop", location: "O&O Plein" }] },
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
    <li style={{ position: "relative", display: "block", float: "none", clear: "both" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <a
          href={has ? undefined : item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          onClick={
            has
              ? (e) => {
                  e.preventDefault();
                  setOpen((o) => !o);
                }
              : undefined
          }
          style={{
            display: "inline-block",
            lineHeight: 3,
            fontFamily: "Lato, Arial, sans-serif",
            fontSize: "110%",
            fontWeight: 700,
            color: "#000",
            cursor: "pointer",
            userSelect: "none",
            flex: 1,
            paddingLeft: `${0.3 + depth * 1.1}em`,
            textDecoration: "none",
            transition: "color .3s",
            maxWidth: has ? "calc(100% - 3em)" : "100%",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#f57f20")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#000")
          }
        >
          <span
            style={{
              display: "block",
              position: "relative",
              lineHeight: 1.5,
              padding: ".75em 0",
              wordBreak: "break-word",
              transition: "all .5s ease-in-out",
            }}
          >
            {item.label}
          </span>
        </a>
        {has && (
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "inline-block",
              float: "right",
              border: 0,
              padding: 0,
              cursor: "pointer",
              background: "transparent",
              opacity: 0.75,
              fontSize: "1em",
              color: "inherit",
              width: "3em",
              height: "3em",
              lineHeight: "3em",
              textAlign: "center",
              transition: ".6s all ease-in-out",
              transform: open ? "rotateX(-180deg)" : "rotateX(0)",
            }}
            aria-label={open ? "Sluit submenu" : "Open submenu"}
          >
            ▾
          </button>
        )}
      </div>
      {has && open && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 bg-white shadow rounded p-2 text-xl leading-none"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        id="nav-toggle"
        style={{ color: "#0a0a0a" }}
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        id="sidebar"
        className={[
          "lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto flex flex-col",
          mobileOpen ? "fixed inset-y-0 left-0 z-50 overflow-y-auto flex" : "hidden lg:flex",
        ].join(" ")}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute top-3 right-3 text-2xl leading-none"
          style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMobileOpen(false)}
          aria-label="Sluit menu"
          id="nav-cancel"
        >
          ×
        </button>

        {/* ── HEADER (branding + nav + widgets + footer) ── */}
        <header id="header">
          {/* ── BRANDING ── */}
          <div id="branding" role="banner">
            <div className="identity">
              <a id="logo" href="/" title="S.A. Mastatine" rel="home">
                <MastatineLogo size={80} />
              </a>
            </div>
            <h1 id="site-title" itemProp="headline">
              <span>
                <a href="/" title="De studievereniging voor open-minded ingenieurs" rel="home">
                  S.A. Mastatine
                </a>
              </span>
            </h1>
            <span id="site-description" itemProp="description">
              De studievereniging voor open-minded ingenieurs
            </span>
            <div className="branding-spacer" />

            {/* ── PRIMARY NAV ── */}
            <nav id="access" role="navigation" aria-label="Primair menu">
              <h3 className="widget-title menu-title">
                <span>Menu</span>
              </h3>
              <div>
                <ul id="prime_nav" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {NAV.map((item) => (
                    <NavNode key={item.label} item={item} />
                  ))}
                </ul>
              </div>
            </nav>

            {/* ── spacer ── */}
            <div style={{ flex: 1 }} />

            {/* ── PARTNER WIDGET ── */}
            <div className="widget-container" style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
              <h3 className="widget-title"><span>Partner</span></h3>
              <a href="/tennet">
                <div style={{ background: "#f5f5f5", padding: "0.75em", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <TennetLogo />
                </div>
              </a>
            </div>

            {/* ── ACTIVITIES WIDGET ── */}
            <div className="widget-container" style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
              <h3 className="widget-title"><span>Activiteiten deze week</span></h3>
              <dl>
                {ACTIVITIES.map(({ date, events }) => (
                  <div key={date} style={{ marginBottom: "0.5em" }}>
                    <dt style={{ borderBottom: "1px solid #001e7a" }}>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#001e7a",
                          color: "#fff",
                          padding: "0.1em 0.4em",
                          fontSize: "0.75em",
                        }}
                      >
                        {date}
                      </span>
                    </dt>
                    <dd>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {events.map((ev, i) => (
                          <li key={i} style={{ fontSize: "0.85em", color: "#0a0a0a", paddingTop: "0.2em" }}>
                            <strong>{ev.title}</strong>
                            {"location" in ev && ev.location && (
                              <em style={{ marginLeft: "0.4em", color: "#555", fontStyle: "normal" }}>
                                {ev.location}
                              </em>
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
            <div style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
              <form
                role="search"
                method="get"
                action="/#towers"
                className="searchform"
                style={{ display: "flex", border: "1px solid #eee" }}
              >
                <input
                  type="search"
                  name="s"
                  placeholder="Zoeken"
                  style={{
                    flex: 1,
                    padding: ".5em .7em",
                    fontSize: "0.9em",
                    color: "#0a0a0a",
                    outline: "none",
                    border: "none",
                    background: "transparent",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0 0.8em",
                    background: "#1c1399",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85em",
                  }}
                >
                  🔍
                </button>
              </form>
            </div>

            {/* ── FOOTER (inside sidebar, matching Verbosa #footer) ── */}
            <footer
              id="footer"
              style={{ borderTop: "1px solid #eee", paddingTop: "1em", paddingBottom: "1.5em", marginTop: "1.5em" }}
            >
              {/* Social links */}
              <nav
                id="sfooter"
                className="socials"
                style={{ display: "flex", gap: "0.5em", marginBottom: "0.75em" }}
              >
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
                    title={label}
                    style={{
                      width: "2.25em",
                      height: "2.25em",
                      borderRadius: "100%",
                      border: "2px solid #f57f20",
                      color: "#f57f20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75em",
                      fontWeight: "bold",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "#1c1399";
                      el.style.borderColor = "#1c1399";
                      el.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.background = "transparent";
                      el.style.borderColor = "#f57f20";
                      el.style.color = "#f57f20";
                    }}
                  >
                    {label[0]}
                  </a>
                ))}
              </nav>
              <p style={{ fontSize: "0.85em", color: "#0a0a0a" }}>
                <span id="site-copyright">
                  Powered by{" "}
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#f57f20" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#1c1399")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#f57f20")
                    }
                  >
                    Next.js
                  </a>{" "}
                  &amp;{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#f57f20" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#1c1399")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "#f57f20")
                    }
                  >
                    Supabase
                  </a>
                </span>
              </p>
            </footer>
          </div>
        </header>
      </aside>
    </>
  );
}

function TennetLogo() {
  return (
    <svg
      viewBox="0 0 200 48"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 160 }}
      aria-label="TenneT"
    >
      <text
        x="100"
        y="36"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="36"
        fill="#f57f20"
        letterSpacing="-1"
      >
        TenneT
      </text>
      <text
        x="100"
        y="47"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="400"
        fontSize="8"
        fill="#666"
        letterSpacing="2"
      >
        PARTNER VAN MASTATINE
      </text>
    </svg>
  );
}
