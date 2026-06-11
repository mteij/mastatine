import MastatineLogo from "./MastatineLogo";

export default function Colophon() {
  return (
    <aside id="colophon" className="footer-three cryout" itemScope itemType="http://schema.org/WPSideBar">
      <div id="colophon-inside">

        {/* Column 1: Navigation links */}
        <section className="widget-container">
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <h2 className="widget-title"><span>Information</span></h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Code of Conduct", href: "/code-of-conduct" },
                { label: "Contact", href: "/contact" },
                { label: "About", href: "#about" },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: "0.2em" }}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Column 2: Logo + tagline (mirrors Astatine's centre image) */}
        <section className="widget-container" style={{ alignItems: "center" }}>
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <a href="/" title="S.A. Mastatine" style={{ display: "inline-block" }}>
              <MastatineLogo size={80} />
            </a>
            <p style={{ marginTop: "0.5em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.85em", color: "var(--text)" }}>
              S.A. Mastatine
            </p>
            <p style={{ fontSize: "0.75em", color: "var(--text-light)", marginTop: "0.25em" }}>
              Not affiliated with S.A. Astatine or the University of Twente.
            </p>
          </div>
        </section>

        {/* Column 3: Social Media (matches Astatine widget exactly) */}
        <section className="widget-container">
          <div className="footer-widget-inside" style={{ textAlign: "center" }}>
            <h2 className="widget-title"><span>Social Media</span></h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "Facebook",  href: "https://www.facebook.com/" },
                { label: "LinkedIn",  href: "https://www.linkedin.com/" },
                { label: "Instagram", href: "https://www.instagram.com/" },
              ].map(({ label, href }) => (
                <li key={label} style={{ marginBottom: "0.25em" }}>
                  <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
    </aside>
  );
}
