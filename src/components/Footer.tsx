import MastatineLogo from "./MastatineLogo";

export default function Footer() {
  return (
    <footer className="bg-[#1a2332] text-slate-400">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-8 pb-8 border-b border-white/10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <MastatineLogo size={40} />
              <div>
                <span className="font-black text-white text-sm block">S.A. Mastatine</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  Studievereniging voor Gevorderde Masttechnologie
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">
              De première studenten-mastvereniging van Nederland.
              Documentatie, appreciatie en ranking van zendmasten en
              elektromagnetische constructies.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Navigatie
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "#home",    label: "Home" },
                { href: "#towers",  label: "Mastengalerij" },
                { href: "#submit",  label: "Mast indienen" },
                { href: "#about",   label: "Over ons" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="hover:text-[#f57f20] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
              Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://astatine.utwente.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f57f20] transition-colors"
                >
                  S.A. Astatine ↗
                </a>
              </li>
              <li>
                <a
                  href="https://utwente.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#f57f20] transition-colors"
                >
                  Universiteit Twente ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} S.A. Mastatine</span>
          <span>Niet gelieerd aan S.A. Astatine of de Universiteit Twente.</span>
        </div>
      </div>
    </footer>
  );
}
