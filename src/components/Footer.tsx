export default function Footer() {
  return (
    <footer className="bg-[#1a2332] text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📡</span>
              <span className="font-bold text-white">S.A. Mastatine</span>
            </div>
            <p className="text-sm max-w-xs">
              The premier study association for the appreciation of transmission
              towers, masts, and all things electromagnetic.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/" className="hover:text-yellow-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/towers"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Mast Gallery
                </a>
              </li>
              <li>
                <a
                  href="/submit"
                  className="hover:text-yellow-400 transition-colors"
                >
                  Submit a Mast
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 text-sm uppercase tracking-wider">
              The Real One
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="https://astatine.utwente.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow-400 transition-colors"
                >
                  S.A. Astatine ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 pt-4 text-xs text-center">
          © {new Date().getFullYear()} S.A. Mastatine — Not affiliated with S.A.
          Astatine. Made with ⚡ and 📡
        </div>
      </div>
    </footer>
  );
}
