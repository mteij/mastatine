"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MastatineLogo from "./MastatineLogo";
import SidebarAccount from "./SidebarAccount";
import NewsletterForm from "@/components/NewsletterForm";

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
}

function buildNav(shopUrl: string | null): NavItem[] {
  return [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  {
    label: "Association",
    href: "#",
    children: [
      { label: "About & Disclaimer", href: "/about" },
      { label: "The Board", href: "/board" },
      { label: "Committees", href: "/committees" },
      { label: "History", href: "/history" },
      { label: "Membership", href: "/membership" },
    ],
  },
  { label: "MastApps", href: "/mastapps" },
  ...(shopUrl ? [{ label: "Merch shop", href: shopUrl, external: true }] : []),
  { label: "Contact", href: "/contact" },
  ];
}

function NavNode({ item, depth = 0, onNavigate }: { item: NavItem; depth?: number; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const has = !!item.children?.length;
  const pathname = usePathname();
  const active = !has && !item.external && (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`));
  // Internal pages navigate client-side; groups and the external shop stay plain anchors.
  const Tag: React.ElementType = !has && !item.external ? Link : "a";

  return (
    <li style={{ position: "relative", display: "block", float: "none", clear: "both" }}>
      <div data-navrow style={{ display: "flex", alignItems: "center" }}>
        <Tag
          href={has ? undefined : item.href}
          className="nav-link"
          data-active={active}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          onClick={
            has
              ? (e: React.MouseEvent) => {
                  e.preventDefault();
                  setOpen((o) => !o);
                }
              : onNavigate
          }
          style={{
            display: "inline-block",
            lineHeight: 3,
            fontFamily: "Lato, Arial, sans-serif",
            fontSize: "110%",
            fontWeight: 700,
            cursor: "pointer",
            userSelect: "none",
            flex: 1,
            paddingLeft: `${0.9 + depth * 1.1}em`,
            textDecoration: "none",
            transition: "color .3s",
            maxWidth: has ? "calc(100% - 3em)" : "100%",
          }}
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
        </Tag>
        {has && (
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={`${open ? "Close" : "Open"} ${item.label} submenu`}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden style={{ transform: open ? "rotate(180deg)" : "none" }}>
              <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {has && open && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {item.children!.map((child) => (
            <NavNode key={child.label} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Menu list with one highlight pill that glides to the hovered/focused row and rests on the current page. */
function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  const listRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  const moveTo = useCallback((row: HTMLElement | null) => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    if (!row) {
      pill.style.opacity = "0";
      return;
    }
    const listBox = list.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    pill.style.opacity = "1";
    pill.style.height = `${rowBox.height}px`;
    pill.style.transform = `translateY(${rowBox.top - listBox.top}px)`;
  }, []);

  const rest = useCallback(() => {
    const active = listRef.current?.querySelector<HTMLElement>('.nav-link[data-active="true"]');
    moveTo(active?.closest<HTMLElement>("[data-navrow]") ?? null);
  }, [moveTo]);

  const rowOf = (target: EventTarget) =>
    target instanceof Element ? target.closest<HTMLElement>("[data-navrow]") : null;

  // Settle on the current page after navigation, and whenever a submenu opens or the list resizes.
  useLayoutEffect(() => {
    rest();
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(rest);
    observer.observe(list);
    return () => observer.disconnect();
  }, [pathname, rest]);

  return (
    <ul
      id="prime_nav"
      ref={listRef}
      className="nav-list"
      style={{ listStyle: "none", padding: 0, margin: 0 }}
      onMouseOver={(e) => moveTo(rowOf(e.target))}
      onMouseLeave={rest}
      onFocus={(e) => moveTo(rowOf(e.target))}
      onBlur={rest}
    >
      <span ref={pillRef} className="nav-pill" aria-hidden />
      {items.map((item) => (
        <NavNode key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

export default function Sidebar({ shopUrl }: { shopUrl: string | null }) {
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
              <Link id="logo" href="/" title="S.A. Mastatine" rel="home">
                <MastatineLogo size={80} />
              </Link>
            </div>
            <h1 id="site-title" itemProp="headline">
              <span>
                <Link href="/" title="The study association for mastende engineers" rel="home">
                  S.A. Mastatine
                </Link>
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
                <NavList items={buildNav(shopUrl)} onNavigate={() => setMobileOpen(false)} />
              </div>
            </nav>

            {/* ── spacer ── */}
            <div style={{ flex: 1 }} />

            {/* ── NEWSLETTER CARD + ACCOUNT ── */}
            <section className="loop-card" aria-labelledby="loop-title">
              <span className="loop-card__icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
                </svg>
              </span>
              <h3 id="loop-title" className="loop-card__title">Stay in the loop</h3>
              <p className="loop-card__text">The best masts and news, four times a year.</p>
              <NewsletterForm layout="stacked" compact />
            </section>
            <div className="loop-account">
              <SidebarAccount />
            </div>

            {/* ── SEARCH WIDGET (mobile only — desktop search lives in the sort row) ── */}
            <div className="lg:hidden" style={{ borderTop: "1px solid #eee", paddingTop: "1em", marginTop: "1em" }}>
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

            {/* ── FOOTER ── */}
            <footer id="footer" role="contentinfo">
              <div id="footer-inside">
                <nav id="sfooter" aria-label="Legal" style={{ display: "flex", justifyContent: "center", gap: "1em", flexWrap: "wrap", fontSize: ".9em", margin: "0 0 .8em" }}>
                  <a href="/privacy">Privacy</a>
                  <a href="/terms">Site rules</a>
                  <a href="/contact">Contact</a>
                  <a href="/about#disclaimer">Disclaimer</a>
                </nav>

                {/* empty by default; CSS hides it when empty */}
                <div id="site-copyright" />

                
              </div>
            </footer>
          </div>
        </header>
      </aside>
    </>
  );
}

