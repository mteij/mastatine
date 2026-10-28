import MastatineLogo from "./MastatineLogo";
import Link from "next/link";
import { getShopUrl } from "@/lib/shop";

export default function Colophon() {
  const shopUrl = getShopUrl();
  return (
    <aside id="colophon" className="footer-three cryout" itemScope itemType="http://schema.org/WPSideBar">
      <div id="colophon-inside">

        {/* Column 1: Navigation links */}
        <section className="widget-container">
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <h2 className="widget-title"><span>Information</span></h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Site rules", href: "/terms" },
                { label: "Contact", href: "/contact" },
                { label: "About & Disclaimer", href: "/about#disclaimer" },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: "0.2em" }}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Column 2: Logo + tagline */}
        <section className="widget-container" style={{ alignItems: "center" }}>
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <Link href="/" title="S.A. Mastatine" style={{ display: "inline-block" }}>
              <MastatineLogo size={80} />
            </Link>
            <p style={{ marginTop: "0.5em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85em", color: "var(--text)" }}>
              S.A. Mastatine
            </p>
            <p style={{ fontSize: "0.95em", color: "var(--text-mid)", marginTop: "0.4em" }}>
              Not affiliated with S.A. Astatine or the University of Twente.
            </p>
          </div>
        </section>

        {/* Column 3: Stay in touch */}
        <section className="widget-container">
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <h2 className="widget-title"><span>Stay in touch</span></h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Newsletter", href: "/newsletter", external: false },
                { label: "Sign in", href: "/login", external: false },
                ...(shopUrl ? [{ label: "Merch shop", href: shopUrl, external: true }] : []),
              ].map(({ label, href, external }) => (
                <li key={label} style={{ marginBottom: "0.25em" }}>
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </aside>
  );
}
