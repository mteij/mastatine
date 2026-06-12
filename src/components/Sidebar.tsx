"use client";

import { useState, useEffect, useRef } from "react";
import MastatineLogo from "./MastatineLogo";
import type { CalDay } from "@/lib/calendar";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "News",
    href: "#",
    children: [
      { label: "Calendar", href: "/agenda" },
      { label: "MAttention", href: "/mattentie" },
    ],
  },
  {
    label: "Association",
    href: "#",
    children: [
      {
        label: "The Board",
        href: "/bestuur",
        children: [{ label: "Previous Boards", href: "/vorige-besturen" }],
      },
      { label: "Committees", href: "/commissies" },
      {
        label: "Major Events",
        href: "#",
        children: [
          { label: "EuroTrip", href: "/eurotrip" },
          { label: "Mast Excursion", href: "/mastexcursie" },
          { label: "Kick-In", href: "/kick-in" },
          { label: "Alumni Day", href: "/alumnidag" },
        ],
      },
      { label: "Mastatine Song", href: "/lied" },
      { label: "History", href: "/geschiedenis" },
      {
        label: "Membership",
        href: "/lidmaatschap",
        children: [{ label: "Honorary & Merit Members", href: "/ereleden" }],
      },
      {
        label: "Mental Health",
        href: "#",
        children: [
          { label: "Study Advisors", href: "/studieadviseurs" },
          { label: "Confidential Counsellor (VCP)", href: "/vcp" },
          { label: "Trainings & Workshops", href: "/trainingen" },
          { label: "Well-being", href: "/welzijn" },
        ],
      },
      { label: "International Association", href: "/internationaal" },
    ],
  },
  {
    label: "Education",
    href: "#",
    children: [
      { label: "Advanced Mast Technology", href: "/gmt" },
      { label: "Nanotechnology", href: "/nano" },
      { label: "Robotics", href: "/robotica" },
      { label: "Education Prize", href: "/onderwijsprijs" },
      { label: "Books", href: "https://wo4you.nl/", external: true },
    ],
  },
  {
    label: "Partners",
    href: "#",
    children: [
      {
        label: "Companies",
        href: "#",
        children: [
          { label: "TenneT", href: "/tennet" },
          { label: "Alliander", href: "/alliander" },
        ],
      },
      {
        label: "Job Board",
        href: "/vacaturebank",
        children: [
          { label: "Bachelor Projects", href: "/bacheloropdrachten" },
          { label: "Part-time Jobs & Internships", href: "/bijbanen" },
        ],
      },
    ],
  },
  { label: "MastApps", href: "#" },
  { label: "Contact", href: "/contact" },
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
            aria-label={open ? "Close submenu" : "Open submenu"}
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

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
    </svg>
  ),
  LinkedIn: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  ),
  Instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-icon">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
};

interface SidebarProps {
  activities: CalDay[];
}

export default function Sidebar({ activities }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const slider = document.querySelector<HTMLElement>(".lp-slider-overlay");
    const aside = sidebarRef.current;
    if (!slider || !aside) return;

    function setTop() {
      // Absolute distance from the page top to the slider's bottom edge.
      // Using this as a negative sticky top means the sidebar scrolls freely
      // until the slider bottom exits the viewport, then locks in place.
      const sliderAbsoluteBottom =
        slider!.getBoundingClientRect().bottom + window.scrollY;
      aside!.style.top = `-${Math.max(0, sliderAbsoluteBottom)}px`;
    }

    setTop();
    window.addEventListener("resize", setTop);
    return () => window.removeEventListener("resize", setTop);
  }, []);

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
        ref={sidebarRef}
        id="sidebar"
        className={[
          "flex flex-col",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 overflow-y-auto"
            : "hidden lg:flex",
        ].join(" ")}
      >
        {/* Mobile close */}
        <button
          className="lg:hidden absolute top-3 right-3 text-2xl leading-none"
          style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
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
                <a href="/" title="The study association for mastende engineers" rel="home">
                  S.A. Mastatine
                </a>
              </span>
            </h1>
            <span id="site-description" itemProp="description">
              The study association for mastende engineers
            </span>
            <div className="branding-spacer" />

            {/* ── PRIMARY NAV ── */}
            <nav id="access" role="navigation" aria-label="Primary menu">
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

            {/* ── ACTIVITIES WIDGET ── */}
            <div className="widget-container" style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
              <h3 className="widget-title"><span>Activities this week</span></h3>
              {activities.length === 0 ? (
                <p style={{ fontSize: "0.85em", color: "#888", textAlign: "center" }}>
                  No activities scheduled this week.
                </p>
              ) : (
                <dl>
                  {activities.map(({ date, events }) => (
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
                              {ev.location && (
                                <em style={{ display: "block", marginTop: "0.2em", whiteSpace: "pre-wrap", color: "#666", fontStyle: "normal" }}>
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
              )}
            </div>

            {/* ── SEARCH WIDGET ── */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
              <form
                role="search"
                method="get"
                action="/#towers"
                className="searchform"
                style={{ 
                  display: "flex", 
                  border: "1px solid #ddd", 
                  borderRadius: "25px", 
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <input
                  type="search"
                  name="s"
                  placeholder="Search"
                  style={{
                    flex: 1,
                    padding: "0.6em 1.2em",
                    fontSize: "0.95em",
                    color: "#333",
                    outline: "none",
                    border: "none",
                    background: "transparent",
                  }}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  style={{
                    padding: "0 1.2em",
                    background: "transparent",
                    color: "var(--navy)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--orange)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--navy)"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>

            {/* ── FOOTER (inside sidebar — matches Verbosa #footer structure exactly) ── */}
            <footer id="footer" role="contentinfo">
              <div id="footer-inside">
                <nav id="sfooter" className="socials">
                  {[
                    { label: "Facebook",  href: "https://www.facebook.com/" },
                    { label: "LinkedIn",  href: "https://www.linkedin.com/" },
                    { label: "Instagram", href: "https://www.instagram.com/" },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      className="menu-item"
                    >
                      {SOCIAL_ICONS[label]}
                      <span>{label}</span>
                    </a>
                  ))}
                </nav>

                {/* empty by default; CSS hides it when empty */}
                <div id="site-copyright" />

                <div style={{ display: "block", float: "none", clear: "both", fontSize: ".9em", textAlign: "center" }}>
                  Powered by{" "}
                  <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a>
                  {" "}&amp;{" "}
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>.
                </div>
              </div>
            </footer>
          </div>
        </header>
      </aside>
    </>
  );
}

